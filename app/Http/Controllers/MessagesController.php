<?php

namespace App\Http\Controllers;

use App\Events\MessageCreated;
use App\Models\Conversation;
use App\Models\Recipient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Throwable;

class MessagesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($id)
    {
        $user = Auth::user();
        $conversation = $user->conversations()->with([
            'participants' => function ($query) use ($user){
                $query->where('id' , '<>' , $user->id);
            }
        ])->findOrFail($id);

        $messages = $conversation->messages()
                ->with('user')
                ->where(function ($query) use ($user){
                    $query->where('user_id' , $user->id)
                            ->orWhereRaw('id IN (
                                SELECT message_id FROM recipients
                                WHERE recipients.message_id = messages.id
                                AND recipients.user_id = ?
                                AND recipients.deleted_at IS NULL
                                )', [$user->id]);
                })
                ->latest()
                ->paginate();

        return [
            'conversation' => $conversation,
            'messages' => $messages,
        ];
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            // 'message' => [
            //     Rule::requiredIf(function () use ($request){
            //     return !$request->hasFile('attachment');
            // }), 'string'],
            // 'attachment' => ['file'],
            'conversation_id' => [
                Rule::requiredIf(function () use ($request){
                    return !$request->input('user_id');
                }),
                'int' ,
                'exists:conversations,id'
            ],
            'user_id' => [
                Rule::requiredIf(function () use ($request){
                    return !$request->input('conversation_id');
                }),
                'int' ,
                'exists:users,id'
            ],
        ]);

        $user = Auth::user();
        $conversation_id = $request->post('conversation_id');
        $user_id = $request->post('user_id');

        DB::beginTransaction();
        try {

            if($conversation_id){
                $conversation = $user->conversations()->findOrFail($conversation_id);
            } else {
                $conversation = Conversation::where('type' , '=' , 'peer')
                    ->whereHas('participants' , function ($builder) use ($user_id , $user){
                    $builder->join('participants as participants2' , 'participants2.conversation_id' , '=' , 'participants.conversation_id')
                            ->where('participants.user_id' , '=' , $user_id)
                            ->where('participants2.user_id' , '=' , $user->id);
                })->first();

                if(!$conversation){
                    $conversation = Conversation::create([
                        'user_id' => $user->id,
                        'type' => 'peer',
                    ]);

                    $conversation->participants()->attach([
                        $user->id => ['joined_at' => now()],
                        $user_id  => ['joined_at' => now()],
                    ]);
                }
            }

            $type = 'text';
            $message = $request->post('message');
            if($request->hasFile('attachment')){
                $file = $request->file('attachment');
                $message = [
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mimetype' => $file->getMimeType(),
                    'file_path' => $file->store('attachment', [
                        'disk' => 'public',
                    ]),
                ];
                $type = 'attachment';
            }

            $message = $conversation->messages()->create([
                'user_id' => $user->id,
                'type' => $type,
                'body' => $message,
            ]);
    
            DB::statement('
                INSERT INTO recipients (user_id , message_id)
                SELECT user_id, ? FROM participants
                WHERE conversation_id = ?
                AND user_id <> ?
            ' , [$message->id , $conversation->id , $user->id]);

            $conversation->update([
                'last_message_id' => $message->id,
            ]);

            DB::commit();

            $message->load('user');
            broadcast(new MessageCreated($message));
            
        } catch(Throwable $e) {
            DB::rollBack();
            throw $e ;
        }
        return $message;
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Recipient::where([
            'user_id' => Auth::id(),
            'message_id' => $id,
        ])->delete();

        return [
            'message' => 'message deleted',
        ];
    }
}

import { createApp } from 'vue';
import Messenger from './components/messages/Messenger.vue';
import ChatList from './components/messages/ChatList.vue';
import ChatFriends from './components/messages/ChatFriends.vue';

import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;


const chatApp = createApp({
    data() {
        return {
            conversations: [],
            conversation: null,
            messages: [],
            userId: userId,
            csrfToken: csrf_token,
            laravelEcho: null,
            users: [],
            chatChannel: null,
            alertAudio: new Audio('/assets/mixkit-correct-answer-notification-947.wav')
        }
    },
    mounted(){
        this.alertAudio.addEventListener('ended' , () => {
            this.alertAudio.currentTime = 0;
        })
        this.laravelEcho = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
            wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
            wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
            wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
            forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });
        this.laravelEcho
            .join(`Messenger.${this.userId}`)
            .listen('.new-message',  (data) => {
            
                    let exists = false;
                    for(let i in this.conversations){
                        let conversation = this.conversations[i];
                        if(conversation.id == data.message.conversation_id){
                            if(!conversation.hasOwnProperty('new_messages')){
                                conversation.new_messages = 0 ;
                            }
                            conversation.new_messages++;
                            conversation.last_message = data.message;
                            exists = true ;
                            if(this.conversation && this.conversation.id == conversation.id) {
                                this.messages.push(data.message);
                                let container = document.querySelector('#chat-body');
                                container.scrollTop = container.scrollHeight;
                            }
                            break ;
                        }
                    }
                    if(!exists){
                        fetch(`/api/conversation/${data.message.conversation_id}`)
                        .then(response => response.json())
                        .then(json => {
                            this.conversations.push(json)
                        })
                    }
                
                this.alertAudio.play();
            });
        this.chatChannel = this.laravelEcho.join('Chat')
            .joining((user) => {
                for(let i in this.conversations){
                    let conversation = this.conversations[i];
                    if(conversation.participants[0].id == user.id){
                        this.conversations[i].participants[0].isOnline = true;
                        return;
                    }
                }
            })
            .leaving((user) => {
                for(let i in this.conversations){
                    let conversation = this.conversations[i];
                    if(conversation.participants[0].id == user.id){
                        this.conversations[i].participants[0].isOnline = false;
                        return;
                    }
                }
            })
            .listenForWhisper('typing', (e) => {
                let user = this.findUser(e.id, e.conversation_id);
                if(user){
                    user.isTyping = true;
                }
            })
            .listenForWhisper('stopped-typing', (e) => {
                let user = this.findUser(e.id, e.conversation_id);
                if(user){
                    user.isTyping = false;
                }
            });
    },
    methods: {
        moment(time){
            return moment(time);
        },
        isOnline(user){
            for(let i in this.users){
                if(this.users[i].id == user.id){
                    return this.users[i].isOnline;
                }
            }
            return false;
        },
        findUser(id, conversation_id){
            for(let i in this.conversations){
                let conversation = this.conversations[i];
                if(conversation.id === conversation_id && conversation.participants[0].id == id){
                    return this.conversations[i].participants[0];
                }
            }
        },
        markAsRead: function(conversation = null){
            
            if(conversation == null){
                conversation = this.conversation;
            }

            fetch(`/api/conversations/${conversation.id}/read` , {
            method: 'PUT',
            mode: "cors",
            headers: {
                "content-type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                _token: this.csrfToken,
            })
        }).then(response => response.json())
            .then(json => {
                conversation.new_messages = 0;
            })
        },
        deleteMessage(message){
            fetch(`/api/messages/${message.id}` , {
                method: 'DELETE',
                mode: "cors",
                headers: {
                    "content-type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    _token: this.csrfToken,
                })
            }).then(response => response.json())
                .then(json => {
                    // let idx = this.messages.indexOf(message);
                    // this.messages.splice(idx, 1);
                    message.body = 'Message Deleted..';
                })
        }

    }
})
  .component('Messenger' , Messenger)
  .component('ChatList' , ChatList)
  .component('ChatFriends' , ChatFriends)
  .mount('#chat-app');

<template>
    <div class="container py-8">
        <!-- Title -->
        <div class="mb-8">
            <h2 class="fw-bold m-0">Chats</h2>
        </div>

        <!-- Search -->
        <div class="mb-6">
            <form action="#">
                <div class="input-group">
                    <div class="input-group-text">
                        <div class="icon icon-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="feather feather-search"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line
                                    x1="21"
                                    y1="21"
                                    x2="16.65"
                                    y2="16.65"
                                ></line>
                            </svg>
                        </div>
                    </div>

                    <input
                        type="text"
                        class="form-control form-control-lg ps-0"
                        placeholder="Search messages or users"
                        aria-label="Search for messages or users..."
                    />
                </div>
            </form>
        </div>

        <!-- Chats -->
        <div class="card-list" id="chat-list">
            <!-- Card -->
            <a
                v-for="conversation in $root.conversations"
                v-bind:key="conversation.id"
                v-bind:href="'#' + conversation.id"
                @click.prevent="setConversation(conversation)"
                class="card border-0 text-reset"
            >
                <div class="card-body">
                    <div class="row gx-5">
                        <div class="col-auto">
                            <div
                                class="avatar"
                                :class="{
                                    'avatar-online':
                                        conversation.participants[0].isOnline,
                                }"
                            >
                                <img
                                    v-bind:src="
                                        conversation.participants[0].avatar_url
                                    "
                                    alt="#"
                                    class="avatar-img"
                                />
                            </div>
                        </div>

                        <div class="col">
                            <div class="d-flex align-items-center mb-3">
                                <h5 class="me-auto mb-0">
                                    {{ conversation.participants[0].name }}
                                </h5>
                                <span class="text-muted extra-small ms-2">{{
                                    $root
                                        .moment(
                                            conversation.last_message.created_at
                                        )
                                        .fromNow()
                                }}</span>
                            </div>

                            <div class="d-flex align-items-center">
                                <div class="line-clamp me-auto"></div>
                                {{
                                    conversation.last_message.type ==
                                    "attachment"
                                        ? conversation.last_message.body
                                              .file_name
                                        : conversation.last_message.body
                                }}
                                <div
                                    v-if="conversation.new_messages"
                                    class="badge badge-circle bg-primary ms-5"
                                >
                                    <span>{{ conversation.new_messages }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- .card-body -->
            </a>
        <a href="chat-direct.html" v-for="n in 3" v-if="$root.conversations.length === 0" class="card border-0 text-reset">
        <div class="card-body">
            <div class="row gx-5">
                <div class="col-auto">
                    <div class="avatar">
                        <svg class="avatar-img placeholder-img" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="#868e96"></rect>
                        </svg>
                    </div>
                </div>

                <div class="col">
                    <div class="d-flex align-items-center mb-3">
                        <h5 class="placeholder-glow w-100 mb-0">
                            <span class="placeholder col-5"></span>
                        </h5>
                    </div>

                    <div class="placeholder-glow">
                        <span class="placeholder col-12"></span>
                        <span class="placeholder col-8"></span>
                    </div>
                </div>
            </div>
        </div><!-- .card-body -->
    </a>

            <!-- Card -->
        </div>
        <!-- Chats -->
    </div>
</template>
<script>
export default {
    methods: {
        truncateText(text, max_length) {
            if (text && text.length > max_length) {
                return text.slice(0, max_length) + "...";
            } else {
                return text;
            }
        },
        setConversation(conversation) {
            this.$root.conversation = conversation;
            this.$root.markAsRead(conversation);
        },
    },
    mounted() {
        fetch("/api/conversations")
            .then((response) => response.json())
            .then((json) => {
                for (let i in json.data) {
                    json.data[i].participants[0].isOnline = false;
                    console.log(json.data);
                    if (json.data[i].last_message.type === 'attachment') {
                        json.data[i].last_message.body.file_name = this.truncateText(
                            json.data[i].last_message.body.file_name,
                            20
                        );
                    } else {
                            json.data[i].last_message.body = this.truncateText(
                            json.data[i].last_message.body,
                            30
                        );
                    }
                }
                this.$root.conversations = json.data;
            });
    },
};
</script>

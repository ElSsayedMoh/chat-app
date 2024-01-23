import { createApp } from 'vue';
import Messenger from './components/messages/Messenger.vue';
import ChatList from './components/messages/ChatList.vue';

const chatApp = createApp({
    data() {
        return {
            conversation: null,
            userId: userId,
            csrfToken: csrf_token,
        }
    },
    methods: {
        moment(time){
            return moment(time);
        },
    }
})
  .component('Messenger' , Messenger)
  .component('ChatList' , ChatList)
  .mount('#chat-app');

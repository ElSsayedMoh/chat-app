<template>
    <div class="card-list">
        <div v-for="(friend, index) in friends" v-bind:key="friend.id">
            <div class="my-5" v-if="shouldDisplayFirstLetter(index)">
                <small class="text-uppercase text-muted">{{ firstLetters[friend.id] }}</small>
            </div>
            <!-- Card -->
            <div class="card border-0">
                <div class="card-body">

                    <div class="row align-items-center gx-5" >
                        <div class="col-auto"> 
                            <a href="#" class="avatar ">
                                
                                <img class="avatar-img" :src="friend.avatar_url" alt="">
                                
                                
                            </a>
                        </div>

                        <div class="col">
                            <h5><a href="#">{{friend.name}}</a></h5>
                            <!-- <p>{{friend.avatar_url}}</p> -->
                        </div>

                        <div class="col-auto">
                            <!-- Dropdown -->
                            <div class="dropdown">
                                <a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </a>

                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">New message</a></li>
                                    <li><a class="dropdown-item" href="#">Edit contact</a>
                                    </li>
                                    <li>
                                        <hr class="dropdown-divider">
                                    </li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="#">Block user</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>

<!-- Card -->

</div>
</template>

<script>
export default {
    data() {
        return {
            friends: [],
            firstLetters: {},
            previousFirstLetter: null
        }
    },
    mounted() {
        fetch('api/get-friends')
        .then(res => res.json())
        .then(json => {
            this.friends = json.friends.data;
            this.extractFirstLetters();
        });
    },
    methods: {
        extractFirstLetters() {
            const letters = {};

            this.friends.forEach(friend => {
                const firstLetter = friend.name.charAt(0).toUpperCase();
                letters[friend.id] = firstLetter;
            });

            this.firstLetters = letters;
        },
        shouldDisplayFirstLetter(index) {
            const friend = this.friends[index];
            if (!friend) return false; 

            const currentFirstLetter = this.firstLetters[friend.id];
            const previousFriend = this.friends[index - 1];
            const previousFirstLetter = previousFriend ? this.firstLetters[previousFriend.id] : null;
            
            return currentFirstLetter !== previousFirstLetter;
        }

    }
}
</script>
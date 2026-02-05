<template>
    <div class="a-messageDemo">
        <v-button @click="sendMessage">
            send message
        </v-button>
        <v-button @click="sendRteMessage">
            send RTE message
        </v-button>
        <v-button @click="sendMessageWithCustomDuration">
            send message with custom duration
        </v-button>
    </div>
</template>

<script>
    export default {
        name: 'AMessageDemo',
        methods: {
            sendMessage() {
                this.$message({
                    type: 'success',
                    message: 'This is a message.'
                });
            },
            sendRteMessage() {
                this.$message({
                    type: 'success',
                    message: '<span class="font-bold">This is a rich text message.</span>',
                    dangerouslyUseHTMLString: true
                });
            },
            sendMessageWithCustomDuration() {
                this.$message({
                    type: 'success',
                    message: 'This is a message with custom duration.',
                    duration: 10000
                });
            }
        }
    };
</script>

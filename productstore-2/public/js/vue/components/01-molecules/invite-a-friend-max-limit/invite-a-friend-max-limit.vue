<template>
    <div class="m-inviteAFriendMaxLimit">
        <span class="m-inviteAFriendMaxLimit__content" v-html="limitReachedMessage" />
        <v-button
            class="m-inviteAFriendMaxLimit__button"
            @click="closeShelf"
        >
            {{ cancelButton.ButtonText }}
        </v-button>
    </div>
</template>
<script>
    export default {
        name: 'MInviteAFriendMaxLimit',
        props: {
            apiLocalization: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                limitReachedMessage: '',
                cancelButton: {
                    ButtonText: ''
                }
            };
        },
        mounted() {
            this.processData();
        },
        methods: {
            closeShelf() {
                this.$emit('close-shelf');
            },
            processData() {
                const labels = this.apiLocalization.Labels;
                this.limitReachedMessage = labels.LimitReachedMessage.replace('{0}', this.apiLocalization.LimitSent);
                this.cancelButton = labels.FormFields.Buttons.find(btn => btn.Type === 'Cancel');
            }
        }
    };
</script>

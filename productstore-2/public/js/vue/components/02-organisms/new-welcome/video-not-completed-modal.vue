<template>
    <div class="o-videoNotCompletedModal">
        <div class="o-videoNotCompletedModal__wrapper">

            <h2 class="o-videoNotCompletedModal__title">{{ titleText }}</h2>
            <p class="o-videoNotCompletedModal__desc" v-html="descriptionText"></p>

            <h3 class="o-videoNotCompletedModal__question">{{ questionText }}</h3>

            <div class="o-videoNotCompletedModal__footer">

                <v-button
                    class="o-videoNotCompletedModal__cta -white"
                    @click="hideModal()">
                    <span>{{ primaryButtonText }}</span>
                </v-button>

                <v-button
                    class="o-videoNotCompletedModal__cta"
                    @click="modalExitConfirm()">
                    <span>{{ secondaryButtonText }}</span>
                </v-button>

            </div>

        </div>
    </div>
</template>

<script>
    export default {
        name: 'OVideoNotCompletedModal',

        props: {
            localization: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            descriptionText() {
                return this.localization?.VideoNotCompletedModal.Description;
            },

            primaryButtonText() {
                return this.localization?.VideoNotCompletedModal.YesButton;
            },

            questionText() {
                return this.localization?.VideoNotCompletedModal.SubTitle;
            },

            secondaryButtonText() {
                return this.localization?.VideoNotCompletedModal.NoButton;
            },

            titleText() {
                return this.localization?.VideoNotCompletedModal.Title;
            }
        },

        watch: {
            isVisible(val) {
                if(val) {
                    this.showModal();
                } else {
                    this.hideModal();
                }
            }
        },

        methods: {
            hideModal() {
                // Hide/close modal
                this.$emit('closeModal');
                this.$modal.hide();
            },

            modalExitConfirm() {
                this.$emit('hideExitConfirm');
            }
        }
    };
</script>

<template>
    <div class="o-congratulationsModal" :class="modClass">
        <div class="o-congratulationsModal__wrapper">
            <div class="o-congratulationsModal__content">
                <!-- Title -->
                <h2 class="o-congratulationsModal__heading">{{ titleText }}</h2>

                <!-- Description -->
                <p class="o-congratulationsModal__desc">
                    {{ descriptionText }}
                </p>

                <!-- CTA Button -->
                <button
                    v-modal-hide
                    class="o-congratulationsModal__footer a-button -green"
                >
                    {{ buttonText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'OCongratulationsModal',

        props: {
            isVisible: {
                type: Boolean,
                default: false
            },
            modClass: {
                type: String,
                default: ''
            },
            localization: {
                type: Object,
                default: () => {}
            }
        },

        computed: {
            buttonText() {
                return this.localization?.CompletionMessage?.ButtonText;
            },

            descriptionText() {
                return this.localization?.CompletionMessage?.Description;
            },

            titleText() {
                return this.localization?.CompletionMessage?.Title;
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
            clickHandler() {
                this.$emit('continue');
                this.hideModal();
            },

            showModal() {
                this.$modal.show({ id: 'o-congratulationsModal' });
            },

            hideModal() {
                this.$modal.hide();
            }
        }
    };
</script>

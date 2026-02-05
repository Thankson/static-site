<template>
    <modal
        heading-class="text-gray-120 text-sm mb-30"
        width="370px">

        <template #heading>
            {{ titleLabel }}
        </template>

        <template #footer>
            <v-button
                v-modal-hide
                class="-outline px-16 mr-15">

                {{ cancelLabel }}
            </v-button>

            <v-button
                class="px-18"
                @click="onContinue">

                {{ continueLabel }}
            </v-button>
        </template>
    </modal>
</template>

<script>
    export default {
        name: 'OFreeProductExceededBalance',
        props: {
            cancelLabel: {
                type: String,
                default: 'Cancel'
            },
            continueLabel: {
                type: String,
                default: 'Continue'
            },
            titleLabel: {
                type: String,
                default: 'Nice! You claimed your {0} of free products! This extra product(s) will be added to you cart so you can purchase them.'
            }
        },
        data() {
            return {
                isContinue: false
            };
        },
        mounted() {
            // reset whenever this modal is shown
            this.$modal.$on.show(() => {
                this.isContinue = false;
            });
        },
        methods: {
            onContinue() {
                this.isContinue = true;
                this.$modal.hide();
            },
            show() {
                this.$modal.show();

                return new Promise((resolve) => {
                    this.$modal.$once.hidden(() => resolve(this.isContinue));
                });
            }
        }
    };
</script>

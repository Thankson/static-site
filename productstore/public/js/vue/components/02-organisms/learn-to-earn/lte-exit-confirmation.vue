<template>
    <div class="o-lteExitConfirm" :class="modClass">
        <div class="o-lteExitConfirm__wrapper">

            <h2 class="o-lteExitConfirm__title">{{ title }}</h2>
            <p class="o-lteExitConfirm__desc" v-html="desc"></p>

            <h3 class="o-lteExitConfirm__question">{{ question }}</h3>

            <div class="o-lteExitConfirm__footer">

                <v-button
                    class="o-lteExitConfirm__cta -white"
                    @click="hideModal()">
                    <span>{{ ctaSecondary }}</span>
                </v-button>

                <v-button
                    class="o-lteExitConfirm__cta"
                    @click="modalExitConfirm()">
                    <span>{{ ctaPrimary }}</span>
                </v-button>

            </div>

        </div>
    </div>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'OLteExitConfirm',

        props: {
            ctaPrimary: {
                type: String,
                default: ''
            },
            ctaSecondary: {
                type: String,
                default: ''
            },
            desc: {
                type: String,
                default: ''
            },
            isNewCustomerLanding: {
                type: Boolean,
                default: false
            },
            modClass: {
                type: String,
                default: ''
            },
            question: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            }
        },

        mounted() {
            if(!this.isNewCustomerLanding) this.$emit('closeModal');
            eventBus.$emit('canCloseModal', true);
        },

        methods: {
            modalExitConfirm() {
                this.$emit('hideExitConfirm');
                eventBus.$emit('canCloseModal', false);
            },

            hideModal() {
                // Hide/close modal
                this.$emit('closeModal');
                eventBus.$emit('canCloseModal', true);
                this.$modal.hide();

                // Hide/close inline video
                eventBus.$emit('closeVideo');
            }
        }
    };
</script>

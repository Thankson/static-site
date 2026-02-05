<template>
    <modal :width="isCheckoutEditAccountInfo ? '370px' : '500px'">
        <template v-slot:content>
            <div class="md:px-0" :class="isCheckoutEditAccountInfo ? 'px-10' : 'px-30'">
                <div v-html="getContent"></div>
                <template v-if="!isCheckoutEditAccountInfo">
                    <a
                        v-if="!data.CartLink.IsFirstTimeUser"
                        :href="updateMethodUrl"
                        class="a-button -white w-full block md:inline-block text-base text-center font-medium mt-10 pt-12 pb-7 md:py-12 px-25 md:w-auto">
                        {{ data.CartLink.UpdateMethodButtonText }}
                    </a>
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button text-base text-center block w-full font-medium mt-18 py-12 px-30 mb-30 md:mb-0 md:w-auto"
                        @click="!data.CartLink.IsFirstTimeUser ? expandPaymentMethod() : null">
                        {{ data.CartLink.ChooseMethodButtonText }}
                    </button>
                </template>
                <button
                    v-else
                    v-modal-hide
                    type="button"
                    class="a-button justify-center text-base font-medium px-24 py-12 mt-30"
                    @click="expandPaymentMethod">
                    {{ labels.ButtonText }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MNoPayMethod',
        errorCodes: ['NoSelectedMethodOfPayment'],
        mixins: [ attentionItemModalMixin ],
        computed: {
            updateMethodUrl: function() {
                const backTo = `${window.location.origin}${window.location.pathname}`;
                return `${this.data.CartLink.UpdateMethodUrl}?backTo=${backTo}`;
            },
            getContent() {
                return this.data?.CartLink?.IsFirstTimeUser ? this.data.CartLink.FirstTimeUserText || 'You have no method of payment selected.' : this.rteContent;
            }
        },
        methods: {
            ...mapActions('checkoutAccordions', ['expandPaymentMethod'])
        }
    };
</script>

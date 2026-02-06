<template>
    <modal width="630px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>
                <div class="md:flex md:pr-32 pt-8 md:pt-1">
                    <a
                        :href="data.ContinueShopping.Url"
                        class="a-button text-base text-center font-medium py-12 px-15 md:px-25 mb-20 md:mb-0 flex justify-center w-full md:w-1_2 mr-10">
                        {{ data.ContinueShopping.Text }}
                    </a>
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button -white text-base font-medium py-12 px-36 mb-25 md:mb-0 block w-full md:w-1_2"
                        @click="checkout">
                        {{ labels.PlaceOrder }}
                    </button>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MPueNotice',
        errorCodes: ['OrderConfirmPpCommitmentNotMet', 'OrderConfirmVipCommitmentNotMet', 'OrderConfirmVipPointsNotMet'],
        mixins: [ attentionItemModalMixin ],
        props: {
            checkout: {
                type: Function,
                required: true
            }
        }
    };
</script>

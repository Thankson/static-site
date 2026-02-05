<template>
    <modal width="468px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <div class="md:flex">
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button -white text-base font-medium mt-10 py-12 px-36 mb-15 md:mb-0 md:mr-10 block w-full md:w-auto"
                        @click="checkout">
                        {{ labels.PlaceOrder }}
                    </button>

                    <button v-modal-hide type="button" class="a-button text-base font-medium mt-10 py-12 px-36 mb-15 md:mb-0 block w-full md:w-auto">
                        {{ labels.Cancel }}
                    </button>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MDuplicateOrders',
        errorCodes: ['DuplicateOrder'],
        mixins: [ attentionItemModalMixin ],
        props: {
            checkout: {
                type: Function,
                required: true
            }
        }
    };
</script>

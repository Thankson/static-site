<template>
    <modal width="425px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <button
                    v-modal-hide
                    type="button"
                    class="a-button text-base w-full block md:w-auto font-medium mt-10 py-12 md:px-32 mb-25 md:mb-0"
                    @click="expandShippingMethod">
                    {{ labels.EditShippingMethod }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MHomeConversionPackModal',
        errorCodes: ['InvalidShipMethodAch'],
        mixins: [ attentionItemModalMixin ],
        methods: {
            ...mapActions('checkoutAccordions', ['expandShippingMethod'])
        }
    };
</script>

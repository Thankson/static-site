<template>
    <modal width="500px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <v-button v-if="data && data.ChooseAddressText" v-modal-hide class="py-12 px-36 text-base font-medium -white mb-20" @click="expandShippingAddress">{{ data.ChooseAddressText }}</v-button>

                <a v-if="verifyAddressLinkText" :href="verifyAddressUrl">
                    <v-button class="py-12 px-36 text-base font-medium">{{ verifyAddressLinkText }}</v-button>
                </a>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MOrderShipMethodChanged',
        errorCodes: ['OrderShipMethodChanged'],
        mixins: [ attentionItemModalMixin ],
        computed: {
            ...mapState('checkout', ['selectedShippingAddressId']),

            verifyAddressLinkText() {
                return this.data?.VerifyAddressLink?.Text;
            },
            verifyAddressUrl() {
                return `${this.data?.VerifyAddressLink?.Url}?addressid=${this.selectedShippingAddressId}`;
            }
        },
        methods: {
            ...mapActions('checkoutAccordions', ['expandShippingAddress'])
        }
    };
</script>

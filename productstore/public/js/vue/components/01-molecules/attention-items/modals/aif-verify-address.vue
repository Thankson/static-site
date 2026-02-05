<template>
    <modal heading-class="font-bold leading-base text-4xl-2 text-dark" width="530px" :will-hide="handleAddressVerificationModalClose">
        <template v-slot:content>
            <div v-html="rteContent"></div>

            <div class="flex flex-col w-full md:flex-row md:pb-0 mt-50">
                <v-button class="aif-verify-address text-base font-medium justify-center text-center px-25 py-12 mb-20 md:mb-0 md:mr-20" @click="handleAddressEdit">
                    {{ data.EditLink.Text }}
                </v-button>
                <v-button class="-white justify-center text-base text-center font-medium py-10 px-24" @click="hideAddressVerificationModal">
                    {{ labels.VerifyAddress }}
                </v-button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import markAsVerifiedApi from '@api/routes/customeraccount/markasverified';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MVerifyAddress',
        errorCodes: ['UnverifiedAddress'],
        mixins: [ attentionItemModalMixin ],
        computed: {
            ...mapState('shippingAddress', ['addresses']),
            ...mapState('checkout', ['selectedShippingAddressId'])
        },
        mounted() {
            this.$modal.$on.shown(() => {
                this.pushDataLayerEvent({
                    'event': 'user_event',
                    'eC': 'Modals',
                    'eA': 'View',
                    'eL': (this.rteContent || '').slice(0, 100)
                });
            });
        },
        methods: {
            ...mapActions('checkout', ['getCheckout', 'putCheckout']),
            ...mapActions('shippingAddress', ['fetchAllAddresses']),
            ...mapActions('shippingAddress', ['setOpenAddEditAddressForm']),
            async handleAddressEdit() {
                this.pushDataLayerEvent({
                    'event': 'user_event',
                    'eC': 'Modals',
                    'eA': 'CTA',
                    'eL': this.data?.EditLink?.Text
                });
                await this.updateAddressLastVerifiedDateTime();
                this.hideAddressVerificationModal();
                this.setOpenAddEditAddressForm(this.selectedShippingAddressId);
            },
            async handleAddressVerificationModalClose() {
                await this.updateAddressLastVerifiedDateTime();
                await this.getCheckout();
            },
            hideAddressVerificationModal() {
                this.pushDataLayerEvent({
                    'event': 'user_event',
                    'eC': 'Modals',
                    'eA': 'CTA',
                    'eL': this.labels?.VerifyAddress
                });
                this.$modal.hide();
            },
            pushDataLayerEvent(eventData) {
                if(window.dataLayer) {
                    window.dataLayer.push(eventData);
                }
            },
            async updateAddressLastVerifiedDateTime() {
                await markAsVerifiedApi.put({ addressId: this.selectedShippingAddressId });
                await this.putCheckout({ ShippingAddressId: this.selectedShippingAddressId });
                await this.fetchAllAddresses();
            }
        }
    };
</script>

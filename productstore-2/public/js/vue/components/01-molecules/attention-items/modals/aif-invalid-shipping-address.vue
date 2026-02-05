<template>
    <modal :width="isCheckoutEditAccountInfo ? '370px' : '500px'">
        <template v-slot:content>
            <div class="block md:px-0 md:pb-0" :class="isCheckoutEditAccountInfo ? 'px-0 pb-0': 'px-30 pb-30'">
                <!-- RTE content -->
                <div class="mb-30" v-html="rteContent"></div>

                <!-- Buttons -->
                <div v-if="!isCheckoutEditAccountInfo">
                    <!-- Change Address Button -->
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button -white justify-center text-base font-medium px-24 py-12 mb-20"
                        :aria-label="data.ChooseAddressText || false"
                        @click="expandShippingAddress">
                        {{ data.ChooseAddressText }}
                    </button>
                    <!-- Verify Address Button -->
                    <a
                        :href="verifySelectedAddressLink"
                        class="a-button justify-center text-base font-medium px-24 py-12"
                        :aria-label="data.VerifyAddressLink.Text">
                        {{ data.VerifyAddressLink.Text || 'Verify Selected Address' }}
                    </a>
                </div>
                <button
                    v-else
                    v-modal-hide
                    type="button"
                    class="a-button justify-center text-base font-medium px-24 py-12"
                    @click="expandShippingAddress">
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
        name: 'MShippingAddressIncomplete',
        errorCodes: ['ShippingAddressIncomplete'],
        mixins: [ attentionItemModalMixin ],
        computed: {
            verifySelectedAddressLink() {
                const backTo = `${window.location.origin}${window.location.pathname}`;
                return `${this.data.VerifyAddressLink.Url}?backTo=${backTo}`;
            }
        },
        methods: {
            ...mapActions('checkoutAccordions', ['expandShippingAddress'])
        }
    };
</script>

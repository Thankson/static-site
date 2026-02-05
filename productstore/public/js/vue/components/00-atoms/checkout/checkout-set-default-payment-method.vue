<template>
    <button
        type="button"
        @click="onSetDefault">

        <slot v-if="$slots['default']" />
        <template v-else>
            {{ setAsDefaultLabel }}
        </template>
    </button>
</template>

<script>
    import { mapActions } from 'vuex';
    import { defaultPaymentTypes, isProductsDefault, isServicesDefault } from '../../../utils/payment-methods';

    export default {
        name: 'ACheckoutSetDefaultPaymentMethod',
        props: {
            buttonLabel: {
                type: String,
                default: 'Edit'
            },
            hasProdServDefaults: {
                type: Boolean,
                required: true
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            owingBalanceCustomerId: {
                type: Number,
                default: null
            },
            payMethodDefaults: {
                type: Array,
                required: true
            },
            payMethodId: {
                type: [ Number, String ],
                required: true
            },
            setAsDefaultLabel: {
                type: String,
                default: 'Default'
            }
        },
        methods: {
            ...mapActions('payAddress', ['setDefaultCard', 'setDefaultCardSimple']),
            ...mapActions('paymentMethod', ['getCheckoutPayMethod']),

            async onSetDefault() {
                if(this.isRiverbend) {
                    await this.setDefaultCardSimple({
                        paymentId: this.payMethodId,
                        existingDefaults: this.payMethodDefaults,
                        defaultToAdd: defaultPaymentTypes.riverbend
                    });
                } else {
                    await this.setDefaultCard({
                        paymentId: this.payMethodId,
                        hasProdServ: this.hasProdServDefaults,
                        otherDefaults: this.payMethodDefaults.filter(item => !isProductsDefault(item) && !isServicesDefault(item)),
                        source: 'checkout',
                        customerId: this.owingBalanceCustomerId
                    });
                }
                if(this.owingBalanceCustomerId) {
                    await this.getCheckoutPayMethod({ customerId: this.owingBalanceCustomerId });
                } else {
                    await this.getCheckoutPayMethod();
                }
            }
        }
    };
</script>

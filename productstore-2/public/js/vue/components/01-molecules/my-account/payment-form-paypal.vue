<template>
    <div class="m-payFormPayPal">
        <!-- Show PayPal Button if no PayPal payment method is stored -->
        <div v-if="showPayPalButton">
            <PayPal
                :is-checkout="isCheckout"
                :paypal-billing-agreement-label="paypalBillingAgreementLabel"
                :paypal-client-token="paypalClientToken"
                @paypal-data="emitPayPalData"
            />
            <div v-if="showPayPalError" class="e-formError__item">
                {{ paypalErrorLabel }}
            </div>
        </div>
        <div v-else-if="showPayLabel" class="m-payFormPayPal__acct">
            <a-pay-label
                :image="paypalImage"
                :name-on-account="paypalNameOnAccount"
                :type="paypalPaymentType"
                :display-name="paypalNameDisplay"
            />
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import PayPal from '../../01-molecules/my-account/paypal.vue';
    import paymentFormMixin from '../../../mixins/payment-form';

    export default {
        name: 'PaymentFormPaypal',
        components: {
            PayPal
        },
        mixins: [ paymentFormMixin ],
        props: {
            isCheckout: {
                type: Boolean,
                default: false
            },
            paypalBillingAgreementLabel: {
                type: String,
                default: ''
            },
            paypalClientToken: {
                type: String,
                default: ''
            },
            paypalErrorLabel: {
                type: String,
                default: ''
            },
            paypalImage: {
                type: String,
                default: ''
            },
            paypalNameDisplay: {
                type: String,
                default: ''
            },
            scriptId: {
                type: String,
                default: ''
            },
            showPayPalError: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                paypalNameOnAccount: '',
                paypalPaymentType: 'PayPal'
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedPayMethods']),

            // Show PayPal button if user has no PayPal payment method stored and no email (used for Name on Account) has been received
            showPayPalButton() {
                return !this.hasPayPalPaymentMethod && !this.paypalNameOnAccount;
            },
            // Show paypal label if user has user email (used for Name on Account) has been received
            showPayLabel() {
                return this.paypalNameOnAccount;
            }
        },
        methods: {
            // Receive nonce and email from Braintree / PayPal and pass to parent component (checkout-payment-form.vue)
            emitPayPalData(data) {
                const { email } = data;
                this.paypalNameOnAccount = email;
                this.$emit('paypal-data', data);
            }
        }
    };
</script>

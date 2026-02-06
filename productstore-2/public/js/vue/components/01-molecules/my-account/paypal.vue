<template>
    <div class="m-payPal">
        <div id="paypal-button" class="m-payPal__button"></div>
    </div>
</template>

<script>

    export default {
        name: 'PayPal',
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
            }
        },
        computed: {
            AUTH_KEY() {
                return this.paypalClientToken;
            },
            localeCode() {
                let locale = window.dataLayer ? window.dataLayer.find(element => element.uiCulture)?.uiCulture : 'en-US';

                // Check if the culture starts with "es-" because PayPal only accepts "es-ES" as a valid culture code for Spanish
                if(locale.startsWith('es-')) {
                    locale = 'es_ES';
                } else {
                    // Make last two letters uppercase and convert hyphen to underscore
                    const [language, region] = locale.split('-');
                    locale = `${language.toLowerCase()}_${region.toUpperCase()}`;
                }
                return locale;
            }
        },
        mounted() {
            window.braintree.client.create(
                {
                    authorization: this.AUTH_KEY
                },
                (clientErr, clientInstance) => {
                    if(clientErr) {
                        console.error('Error creating client: ', clientErr);
                        return;
                    }
                    // Use client token to get nonce and email from Braintree / PayPal
                    this.createVaultPayment(clientInstance);
                }
            );
        },
        methods: {
            createVaultPayment(clientInstance) {
                window.braintree.paypalCheckout.create(
                    {
                        client: clientInstance
                    },
                    (paypalCheckoutErr, paypalCheckoutInstance) => {
                        if(paypalCheckoutErr) {
                            console.error('Error creating PayPal Checkout: ', paypalCheckoutErr);
                            return;
                        }

                        paypalCheckoutInstance?.loadPayPalSDK(
                            {
                                vault: true,
                                locale: this.localeCode
                            },
                            (loadSdkErr) => {
                                if(loadSdkErr) {
                                    console.error('Error loading PayPal SDK: ', loadSdkErr);
                                    return;
                                }

                                window?.paypal?.Buttons({
                                    fundingSource: window?.paypal?.FUNDING?.PAYPAL,

                                    createBillingAgreement: function () {
                                        return paypalCheckoutInstance?.createPayment({
                                            flow: 'vault',
                                            // The following are optional params
                                            // TO DO: ADD LOCALIZATION FOR BILLING DESCRIPTION - this.paypalBillingAgreementLabel
                                            billingAgreementDescription: 'Your agreement description',
                                            enableShippingAddress: false,
                                            shippingAddressEditable: false
                                        });
                                    },

                                    onApprove: (data, actions) => {
                                        return paypalCheckoutInstance?.tokenizePayment(data, (err, payload) => {
                                            const nonce = payload?.nonce;
                                            const email = payload?.details?.email;

                                            // Emit nonce and email to parent component (payment-form-paypal.vue) to submit with payload and for error checking
                                            this.$emit('paypal-data', { nonce, email });

                                            if(err) {
                                                console.error('Error tokenizing payment:', err);
                                            }
                                        });
                                    },

                                    onCancel: function (data) {
                                        console.log('PayPal payment canceled', JSON.stringify(data, 0, 2));
                                    },

                                    onError: function (err) {
                                        console.error('PayPal error', err);
                                    },
                                    // Conditional style based on isCheckout prop
                                    ...(this.isCheckout ? {
                                        style: {
                                            label: 'checkout'
                                        }
                                    } : {})
                                }).render('#paypal-button')
                                    .then(function () {
                                        console.log('PayPal button rendered successfully');
                                    }).catch(renderErr => {
                                        console.error('Error rendering PayPal button:', renderErr);
                                    });
                            }
                        );
                    }
                );
            }
        }
    };
</script>

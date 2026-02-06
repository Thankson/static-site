import { mapState } from 'vuex';

const handlePayPalCheckoutDataMixin = {
    ...mapState('paymentMethod', ['storedCountryInfo']),

    computed: {
        isPayPalAllowed() {
            let allowed = false;

            if(this.storedCountryInfo?.PayMethods) {
                allowed = this.storedCountryInfo.PayMethods.some(pay => pay.Paymethod === 'PayPal');
            }

            return allowed;
        }
    },
    methods: {
        handlePayPalCheckoutData(data) {
            // Handle the received nonce and email
            const { nonce, email } = data;

            if(nonce && email) {
                this.paypalNonceReceived = true;
                this.paypalEmail = email;
                this.paypalNonce = nonce;
            } else {
                console.error('Error: No nonce or email received from PayPal');
                this.paypalNonceReceived = false;
            }
        }
    }
};

export default handlePayPalCheckoutDataMixin;

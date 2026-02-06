<template>
    <div class="m-payForm">
        <div class="m-payForm__row -debit" v-html="phraseDownload"></div>
    </div>
</template>

<script>
    import paymentFormMixin from '../../../mixins/payment-form';

    export default {
        name: 'PaymentFormDirectDebit',

        mixins: [ paymentFormMixin ],

        props: {
            isEnrollment: {
                type: Boolean,
                default: false
            },
            isGuestCheckout: {
                type: Boolean,
                default: false
            }
        },

        computed: {
            phraseDownload() {
                return this.localization?.Data?.DirectDebit?.FormAccess;
            },
            fileDownload() {
                return this.localization?.Data?.DirectDebit?.FormAccessLink?.Url;
            },
            isGuestOrEnrollment() {
                return this.isGuestCheckout || this.isEnrollment;
            }
        }
    };
</script>

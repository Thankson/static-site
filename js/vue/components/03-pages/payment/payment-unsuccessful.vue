<template>
    <div class="p-paymentUnsuccessful">
        <div
            class="text-2xl-2 md:text-3xl-2 py-20 md:py-60 px-12 md:px-0 leading-tight"
            v-html="getLocalizationProp('Data.FailureOrderMessage', 'There was problem! You have not been charged for your order.')">
        </div>

        <PaymentUnsuccessful :script-id="scriptId">
        </PaymentUnsuccessful>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import PaymentUnsuccessful from '../../02-organisms/payment/payment-unsuccessful.vue';

    export default {
        name: 'PPaymentUnsuccessful',
        components: {
            PaymentUnsuccessful
        },
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        }
    };
</script>

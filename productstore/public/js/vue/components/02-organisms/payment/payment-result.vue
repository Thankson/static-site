<template>
    <div class="o-paymentResult" v-html="getLocalizationProp('Data.DisplayContent')">
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/externalpayment/tspg3dsprocessresponse';

    export default {
        name: 'OPaymentResult',
        mixins: [ localizationMixin],
        mounted () {
            this.handleTspg3dsProcessResponse();
        },
        methods: {
            async handleTspg3dsProcessResponse() {
                const response = await api.post({
                    ThirdPartyResponse: window.location.search.replace(/^\?/, '')
                });
                let redirectUrl = this.getLocalizationProp('Data.PaymentFailurePage.Url');
                if(response.success && response.data?.Success && response.data?.Data?.success) {
                    const orderNumber = response.data?.Data?.orderNumber;
                    redirectUrl = this.getLocalizationProp('Data.ReceiptUrl') + orderNumber;
                }
                window.location.href = redirectUrl;
            }
        }
    };
</script>

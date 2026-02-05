<template>
    <div class="o-payment-qr-code-cn text-center">
        <a-loading-spinner :visible="loading" size="sm" />
        <div v-if="!loading">
            <img :src="imageUrl" class="o-payment-qr-code-cn__qrcode mx-auto" />
            <div class="o-payment-qr-code-cn__title" v-html="getLocalizationProp('Labels.TitleLabel')"></div>
        </div>
        <form id="mel-payment-form" hidden="hidden"></form>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import externalpaymentApi from '@api/routes/externalpayment';

    export default {
        name: 'OPaymentQrCodeCn',
        mixins: [ localizationMixin ],
        data() {
            return {
                imageUrl: '',
                loading: false
            };
        },
        mounted() {
            if(this.getLocalizationProp('Data.QRCode') === null) {
                this.loading = true;
                this.formSubmit();
            } else {
                this.imageUrl = this.getLocalizationProp('Data.QRCode');
                this.checkPaymentStatus();
            }
        },
        methods: {
            formSubmit() {
                const form = document.getElementById('mel-payment-form');

                form.setAttribute('action', this.getLocalizationProp('Data.FormAction'));
                form.setAttribute('method', this.getLocalizationProp('Data.FormMethod'));

                const formDataArray = this.getLocalizationProp('Data.FormData');
                formDataArray.forEach(element => {
                    form.innerHTML += '<input name="' + element.Key + '" value="' + element.Value + '">';
                });
                form.submit();
            },
            async checkPaymentStatus() {
                let orderNumber = this.getQueryVariable('orderNumber');
                const response = await externalpaymentApi.get('?orderNumber=' + orderNumber);

                if(response.success && response.data?.IsSuccess) {
                    window.location.href = response.data.SuccessRedirectUrl;
                } else {
                    window.setTimeout(this.checkPaymentStatus(), 1000);
                }
            },
            getQueryVariable(variable) {
                let query = window.location.search.substring(1);
                let vars = query.split('&');
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');
                    if(pair[0] === variable) { return pair[1]; }
                }
                return false;
            }
        }
    };
</script>

<template>
    <div class="o-dragonPay">
        <form v-if="isVisible && payInfo" ref="dragonForm" :method="payInfo.method" :action="payInfo.action">
            <input id="merchantId" name="merchantId" type="hidden" :value="payInfo.merchantid || ''">
            <input id="txnid" name="txnid" type="hidden" :value="payInfo.txnid || ''">
            <input id="amount" name="amount" type="hidden" :value="payInfo.amount || ''">
            <input id="ccy" name="ccy" type="hidden" :value="payInfo.ccy || ''">
            <input id="description" name="description" type="hidden" :value="payInfo.description || ''">
            <input id="email" name="email" type="hidden" :value="payInfo.email || ''">
            <input id="digest" name="digest" type="hidden" :value="payInfo.digest || ''">
            <input id="param1" name="param1" type="hidden" :value="payInfo.param1 || ''">
            <input id="param2" name="param2" type="hidden" :value="payInfo.param2 || ''">
        </form>
    </div>
</template>
<script>
    export default {
        name: 'OdragonPay',
        props: {
            isVisible: {
                type: Boolean,
                default: false
            },
            payInfo: {
                type: Object,
                default: () =>
                    ({
                        action: '',
                        method: '',
                        merchantId: '',
                        txnif: '',
                        amount: '',
                        ccy: '34234234@melatest.com',
                        description: '',
                        email: 555.0,
                        digest: 'TEST',
                        param1: '',
                        param2: ''
                    })
            }
        },
        methods: {
            async submit() {
                if(this.payInfo && this.payInfo.action) {
                    await this.$refs.dragonForm.submit();
                }
            }
        }
    };
</script>

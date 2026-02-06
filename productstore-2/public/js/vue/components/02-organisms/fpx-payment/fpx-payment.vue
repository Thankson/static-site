<template>
    <div class="o-fpx">
        <form v-if="isVisible && payInfo" ref="fpxForm" :method="payInfo.method" :action="payInfo.action">
            <input id="fpx_msgType" name="fpx_msgType" type="hidden" :value="payInfo.fpx_msgType || ''">
            <input id="fpx_msgToken" name="fpx_msgToken" type="hidden" :value="payInfo.fpx_msgToken || ''">
            <input id="fpx_sellerExId" name="fpx_sellerExId" type="hidden" :value="payInfo.fpx_sellerExId || ''">
            <input id="fpx_sellerExOrderNo" name="fpx_sellerExOrderNo" type="hidden" :value="payInfo.fpx_sellerExOrderNo || ''">
            <input id="fpx_sellerTxnTime" name="fpx_sellerTxnTime" type="hidden" :value="payInfo.fpx_sellerTxnTime || ''">
            <input id="fpx_sellerOrderNo" name="fpx_sellerOrderNo" type="hidden" :value="payInfo.fpx_sellerOrderNo || ''">
            <input id="fpx_sellerId" name="fpx_sellerId" type="hidden" :value="payInfo.fpx_sellerId || ''">
            <input id="fpx_sellerBankCode" name="fpx_sellerBankCode" type="hidden" :value="payInfo.fpx_sellerBankCode || ''">
            <input id="fpx_txnCurrency" name="fpx_txnCurrency" type="hidden" :value="payInfo.fpx_txnCurrency || ''">
            <input id="fpx_txnAmount" name="fpx_txnAmount" type="hidden" :value="payInfo.fpx_txnAmount || ''">
            <input id="fpx_buyerEmail" name="fpx_buyerEmail" type="hidden" :value="payInfo.fpx_buyerEmail || ''">
            <input id="fpx_checkSum" name="fpx_checkSum" type="hidden" :value="payInfo.fpx_checkSum || ''">
            <input id="fpx_buyerName" name="fpx_buyerName" type="hidden" :value="payInfo.fpx_buyerName || ''">
            <input id="fpx_buyerBankId" name="fpx_buyerBankId" type="hidden" :value="payInfo.fpx_buyerBankId || ''">
            <input id="fpx_buyerBankBranch" name="fpx_buyerBankBranch" type="hidden" :value="payInfo.fpx_buyerBankBranch || ''">
            <input id="fpx_buyerAccNo" name="fpx_buyerAccNo" type="hidden" :value="payInfo.fpx_buyerAccNo || ''">
            <input id="fpx_buyerId" name="fpx_buyerId" type="hidden" :value="payInfo.fpx_buyerId">
            <input id="fpx_makerName" name="fpx_makerName" type="hidden" :value="payInfo.fpx_makerName || ''">
            <input id="fpx_buyerIban" name="fpx_buyerIban" type="hidden" :value="payInfo.fpx_buyerIban || ''">
            <input id="fpx_productDesc" name="fpx_productDesc" type="hidden" :value="payInfo.fpx_productDesc || ''">
            <input id="fpx_version" name="fpx_version" type="hidden" :value="payInfo.fpx_version || ''">
        </form>
    </div>
</template>
<script>
    export default {
        name: 'OFpxPayment',
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
                        fpx_buyerAccNo: '',
                        fpx_buyerBankBranch: '',
                        fpx_buyerBankId: '',
                        fpx_buyerEmail: '34234234@melatest.com',
                        fpx_buyerIban: '',
                        fpx_buyerId: 555.0,
                        fpx_buyerName: 'TEST',
                        fpx_checkSum: '',
                        fpx_makerName: '',
                        fpx_msgToken: '01',
                        fpx_msgType: 'AR',
                        fpx_productDesc: 'Melaleuca Product',
                        fpx_sellerBankCode: '01',
                        fpx_sellerExId: '55555',
                        fpx_sellerExOrderNo: 55555,
                        fpx_sellerId: '44444',
                        fpx_sellerOrderNo: 55555,
                        fpx_sellerTxnTime: 55555,
                        fpx_txnAmount: 24.00,
                        fpx_txnCurrency: 'MYR',
                        fpx_version: 7.0
                    })
            }
        },
        methods: {
            async submit() {
                if(this.payInfo && this.payInfo.action) {
                    await this.$refs.fpxForm.submit();
                }
            }
        }
    };
</script>

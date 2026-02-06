<template>
    <div class="o-ePortal">
        <form v-if="isVisible && payInfo" id="easypayForm" ref="get" method="GET" :action="payInfo.action">
            <template v-if="!isMobile">
                <input id="EP_mall_id" type="hidden" name="EP_mall_id" :value="payInfo.mallId" />
                <input id="EP_mall_nm" type="hidden" name="EP_mall_nm" value="%eb%a9%9c%eb%9d%bc%eb%a3%a8%ec%b9%b4%20%ec%9d%b8%ed%84%b0%eb%82%b4%ec%85%94%eb%82%a0%20%ec%bd%94%eb%a6%ac%ec%95%84" />
                <input id="EP_agent_ver" type="hidden" name="EP_agent_ver" value="NET" />
                <input id="EP_lang_flag" type="hidden" name="EP_lang_flag" value="KOR" />
                <input id="EP_pay_type" type="hidden" name="EP_pay_type" value="11" />
                <input id="EP_currency" type="hidden" name="EP_currency" value="00" />
                <input id="EP_currency" type="hidden" name="EP_install_period" :value="installId" />
                <input id="EP_tax_flg" type="hidden" name="EP_tax_flg" value="" />
                <input id="EP_order_no" type="hidden" name="EP_order_no" :value="payInfo.orderNumber" />
                <input id="EP_product_nm" type="hidden" name="EP_product_nm" value="%eb%a9%9c%eb%9d%bc%eb%a3%a8%ec%b9%b4%ec%a0%9c%ed%92%88" />
                <input id="EP_product_amt" type="hidden" name="EP_product_amt" :value="payInfo.cartTotal" />
                <input id="EP_user_id" type="hidden" name="EP_user_id" :value="payInfo.userId" />
                <input id="EP_user_nm" type="hidden" name="EP_user_nm" :value="payInfo.customerName" />
                <input id="EP_return_url" type="hidden" name="EP_return_url" :value="buildReturnUrl" />
                <input id="EP_card_cd" type="hidden" name="EP_card_cd" :value="cardId" />
                <input id="EP_vacct_bank" type="hidden" name="EP_vacct_bank" value="" />
                <input id="EP_os_cert_flag" type="hidden" name="EP_os_cert_flag" value="2" />
                <input id="EP_quota" type="hidden" name="EP_quota" value="0" />
                <input id="EP_charset" type="hidden" name="EP_charset" value="UTF-8" />
                <input id="EP_tr_cd" type="hidden" name="EP_tr_cd" value="00101000">
                <input id="EP_res_cd" type="hidden" name="EP_res_cd" value="">
                <input id="EP_res_msg" type="hidden" name="EP_res_msg" value="">
                <input id="EP_trace_no" type="hidden" name="EP_trace_no" value="">
                <input id="EP_sessionkey" type="hidden" name="EP_sessionkey" value="">
                <input id="EP_encrypt_data" type="hidden" name="EP_encrypt_data" value="">
                <input id="EP_card_req_type" type="hidden" name="EP_card_req_type" value="">
                <input id="EP_card_code" type="hidden" name="EP_card_code" value="">
                <input id="EP_ret_pay_type" type="hidden" name="EP_ret_pay_type" value="">
                <input id="EP_ret_complex_yn" type="hidden" name="EP_ret_complex_yn" value="">
                <input id="EP_eci_code" type="hidden" name="EP_eci_code" value="">
                <input id="EP_save_useyn" type="hidden" name="EP_save_useyn" value="">
                <input id="EP_spay_cp" type="hidden" name="EP_spay_cp" value="">
                <input id="EP_prepaid_cp" type="hidden" name="EP_prepaid_cp" value="">
                <input id="EP_kmotion_useyn" type="hidden" name="EP_kmotion_useyn" value="Y">
                <input id="EP_wooripay_useyn" type="hidden" name="EP_wooripay_useyn" value="Y" />
                <input id="EP_user_define1" type="hidden" name="EP_user_define1" value="1">
                <input id="EP_user_define2" type="hidden" name="EP_user_define2" value="">
                <input id="EP_user_define3" type="hidden" name="EP_user_define3" value="">
                <input id="EP_user_define4" type="hidden" name="EP_user_define4" value="">
                <input id="EP_user_define5" type="hidden" name="EP_user_define5" value="">
                <input id="EP_user_define6" type="hidden" name="EP_user_define6" value="">
            </template>
            <template v-else>
                <!-- Mobile -->
                <input id="sp_mall_id" type="hidden" name="sp_mall_id" :value="payInfo.mallId">
                <input id="sp_mall_nm" type="hidden" name="sp_mall_nm" value="%eb%a9%9c%eb%9d%bc%eb%a3%a8%ec%b9%b4%20%ec%9d%b8%ed%84%b0%eb%82%b4%ec%85%94%eb%82%a0%20%ec%bd%94%eb%a6%ac%ec%95%84">
                <input id="sp_order_no" type="hidden" name="sp_order_no" :value="payInfo.orderNumber">
                <input id="sp_currency" type="hidden" name="sp_currency" value="00">
                <input id="sp_product_nm" type="hidden" name="sp_product_nm" value="%eb%a9%9c%eb%9d%bc%eb%a3%a8%ec%b9%b4%ec%a0%9c%ed%92%88">
                <input id="sp_product_amt" type="hidden" name="sp_product_amt" :value="payInfo.cartTotal">
                <input id="sp_return_url" type="hidden" name="sp_return_url" :value="buildReturnUrl">
                <input id="sp_charset" type="hidden" name="sp_charset" value="UTF-8">
                <input id="sp_user_phone" type="hidden" name="sp_user_phone" value="00000000000">
                <input id="sp_app_scheme" type="hidden" name="sp_app_scheme" value="">
                <input id="sp_window_type" type="hidden" name="sp_window_type" value="layer popup">
                <input id="sp_vp_pgid" type="hidden" name="sp_vp_pgid" value="">
                <input id="sp_vp_issuer_cd" type="hidden" name="sp_vp_issuer_cd" value="">
                <input id="sp_install_period" type="hidden" name="sp_install_period" :value="installId">
                <input id="sp_card_cd" type="hidden" name="sp_card_cd" :value="cardId">
                <input id="sp_card_no" type="hidden" name="sp_card_no" value="">
                <input id="sp_expire_dat" type="hidden" name="sp_expire_dat" value="">
                <input id="sp_noint_yn" type="hidden" name="sp_noint_yn" value="">
                <input id="sp_point_useyn" type="hidden" name="sp_point_useyn" value="">
                <input id="sp_save_useyn" type="hidden" name="sp_save_useyn" value="">
                <input id="sp_kmotion_useyn" type="hidden" name="sp_kmotion_useyn" value="">
                <input id="sp_buss_no" type="hidden" name="sp_buss_no" value="">
                <input id="sp_card_join_no" type="hidden" name="sp_card_join_no" value="">
            </template>
        </form>
    </div>
</template>
<script>
    import getDevice from '@productstore/source/js/vue/utils/get-device.js';

    export default {
        name: 'OEasypayPortal',
        props: {
            cardId: {
                type: String,
                default: ''
            },
            isVisible: {
                type: Boolean,
                default: false
            },
            installId: {
                type: String,
                default: ''
            },
            payInfo: {
                type: Object,
                default: () =>
                    ({
                        cartTotal: 18400,
                        customerId: 564588651,
                        customerName: 'Lola Folana',
                        orderNumber: '24486530',
                        orderId: 41121542,
                        paymentId: 165500631,
                        mallId: 'T044744',
                        responseUrl: 'https://uakrweb.melaleuca.com/ProductStore/Checkout/ProcessKoreaEasyPayResponse?',
                        userId: 'User_2022-08-13%20%ec%98%a4%ec%a0%84%207:34:45',
                        datasourceItemId: 'itemid'
                    })
            },
            url: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                device: getDevice()
            };
        },
        computed: {
            buildReturnUrl() {
                return `${this.payInfo.responseUrl}?sc_item_id=${window.globalUrlQueryParams.sc_itemid}&collectionType=${this.collectionsProcessorType}&paymentId=${this.payInfo.paymentId}&orderId=${this.payInfo.orderId}&customerId=${this.payInfo.customerId}&datasourceItemId=${this.payInfo.datasourceItemId}`;
            },
            collectionsProcessorType() {
                return this.isMobile ? 'MobileEasyPay' : 'EasyPay';
            },
            isMobile() {
                return this.device === 'mobile';
            }
        },
        methods: {
            showPopup() {
                var frmVirtualPaymethod = document.getElementById('easypayForm');

                if(this.cardId) {
                    // eslint-disable-next-line no-undef
                    easypay_card_webpay(frmVirtualPaymethod, this.url, 'kicc_webpay', '816', '546', 'iframe', '1', this.cardId, '');
                    window.open('', 'kicc_webpay');
                }
            }
        }
    };
</script>

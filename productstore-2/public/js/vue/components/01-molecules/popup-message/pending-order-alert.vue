<template>
    <popup-message
        class="m-pendingOrderAlert"
        :is-visible="isVisible"
        size="md:w-550"
        mods=""
        :header-visible="true"
        :header-title="getLocalizationProp('Data.Header')"
        :is-cn="isCn"
        :footer-visible="true"
        :footer-title="getLocalizationProp('Data.CTAText')"
        :footer-link="footerLink"
        footer-target-window=""
    >
        <div v-html="getLocalizationProp('Data.Content')">
        </div>
    </popup-message>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/order/pendingorder';
    export default {
        name: 'PendingOrderAlert',
        mixins: [localizationMixin],
        data() {
            return {
                pendingOrderNumber: 'pendingOrderNumber',
                pendingOrderId: '',
                isVisible: false
            };
        },
        computed: {
            footerLink() {
                return `${this.getLocalizationProp('Data.CTALink')}?orderId=${this.pendingOrderId}`;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        mounted() {
            this.getInfo();
        },
        methods: {
            async getInfo() {
                const response = await api.query();
                if(response.success && response.data?.Success && response.data?.Data?.HasPendingOrder) {
                    this.pendingOrderId = response.data?.Data?.OrderNumber;
                    const isNewPendingOrder = this.pendingOrderId && this.pendingOrderId !== sessionStorage.getItem(this.pendingOrderNumber);
                    if(isNewPendingOrder) {
                        sessionStorage.setItem(this.pendingOrderNumber, this.pendingOrderId);
                        this.isVisible = true;
                    }
                }
            }
        }
    };
</script>

<template>
    <div id="cbo">
        <o-cust-backup-order-cart
            :cancel-label="getLocalizationProp('Labels.BackupOrderSelection.Cancel')"
            :details-label="getLocalizationProp('Labels.BackupOrderSelection.Description')"
            :description-label="getLocalizationProp('Labels.CustomizeBackupOrder.Description')"
            :items-label="getLocalizationProp('Labels.BackupOrderSelection.Items')"
            :is-cn="isCn"
            :is-kr="isKr"
            :cart-buttons="{ 'Cancel': getLocalizationProp('Data.CancelLink'), 'Save': getLocalizationProp('Data.SaveLink')}"
            :labels="localization.Labels"
            :minimum-label="getLocalizationProp('Labels.BackupOrderSelection.Minimum')"
            :vip-status-points="getLocalizationProp('Data.VipStatusPoints', 0)"
            :show-not-reach-vip-points-notice="getLocalizationProp('Data.ShowNotReachVIPPointsNotice', false)"
            :points-label="getLocalizationProp('Labels.BackupOrderSelection.Points')"
            :products="currentOrder"
            :no-product-message-label="getLocalizationProp('Labels.BackupOrderSelection.NoProductMessage')"
            :save-label="getLocalizationProp('Labels.BackupOrderSelection.Save')"
            :title-label="getLocalizationProp('Labels.CustomizeBackupOrder.Title')"
            @save-cart="onSaveCart"
        >
        </o-cust-backup-order-cart>

        <o-cust-backup-order-selections
            :script-id="scriptId"
            :labels="localization.Labels"
            :filter="{categoryOptions, sortOptions}"
            :is-cn="isCn"
            :category-default="getLocalizationProp('Data.CategoryDefault')">
        </o-cust-backup-order-selections>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'PCustomBackupOrder',
        components: {},
        mixins: [localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                categoryOptions: {},
                sortOptions: {},
                redirectLink: ''
            };
        },
        computed: {
            ...mapState('customBackupOrder', ['hasError', 'products', 'currentOrder', 'monthlyPointCommitment', 'calculatedPoints', 'cartItemCount', 'cartTotal', 'selectedCategory', 'selectedOptions', 'successfulSave']),
            isCn() {
                return this.$env?.IsCn || false;
            },
            isKr() {
                return this.$env?.Country === 'Korea';
            }
        },
        watch: {
            localization() {
                const categories = this.getLocalizationProp('Data.CategoryOptions');
                const sort = this.getLocalizationProp('Data.SortOptions');

                this.sortOptions = sort;
                this.categoryOptions = categories;
                this.getCBOProducts({
                    catId: this.categoryOptions[0].ItemId,
                    sortId: this.sortOptions[0].ItemId,
                    searchTerm: '',
                    pageNum: 1
                });
            },
            successfulSave() {
                window.location.assign(this.redirectLink);
            }
        },
        created() {
            this.getBackupOrderCart();
        },
        mounted() {
        },
        methods: {
            ...mapActions('customBackupOrder', ['getBackupOrderCart', 'getCBOProducts', 'saveBackupOrder']),
            onSaveCart(link) {
                if(this.hasError) return;
                this.redirectLink = link;
                this.saveBackupOrder({ orderType: {key: 'custom'}, url: this.redirectLink });
            }
        }
    };
</script>

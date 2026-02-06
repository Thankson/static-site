<template>
    <section class="o-cBOrder" :class="{'-isCn' : isCn}">
        <header class="o-backupOrder__header">
            <h1 class="o-backupOrder__title">
                {{ titleLabel }}
            </h1>

            <div class="o-backupOrder__subTitle">
                {{ descriptionLabel }}
            </div>
        </header>

        <div class="o-cBOrder__container">
            <div class="o-cBOrder__header" aria-live="polite">
                <h2 class="o-cBOrder__title">
                    {{ labels.BackupOrderSelection.YourBackupOrder }}
                    <span class="pr-20" :class="[{'not-italic' : isKr}, isCn ? 'not-italic text-base' : 'italic text-xl']">({{ isCn ? itemCountCn : itemCount }})</span>
                </h2>

                <div v-if="!isCn" class="o-cBOrder__commitment">
                    <span v-if="!hidePoints">
                        <span class="font-bold text-3xl pr-5">{{ calculatedPoints }}</span>
                        <span class="font-bold pr-5">{{ pointsLabel }}</span>
                        <span :class="[{'text-red': !reachedMinimum }, isKr ? 'non-italic' : 'italic']">({{ pointsMinimum }})</span>
                        <span class="p-5">|</span>
                    </span>
                    <span class="font-bold">{{ cartTotal }}</span>
                    <span v-if="hidePoints" class="o-cBOrder__minimum" :class="{'text-red': !reachedMinimum }">({{ priceMinimum }})</span>
                </div>
                <div v-else class="o-cBOrder__commitment">
                    <span v-if="!hidePoints">
                        <span class="font-bold lg:text-xl">{{ calculatedPoints }}</span>
                        <span class="text-gray-120">{{ pointsLabel }}</span>
                        <span class="text-gray-120 p-5">|</span>
                    </span>
                    <span class="font-bold lg:text-xl">{{ cartTotal }}</span>
                    <span class="text-gray-120">{{ labels.BackupOrderSelection.Total }}</span>
                    <span class="text-gray-120 hidden lg:inline pr-5">|</span>
                    <span class="block lg:inline">
                        <span class="font-bold text-2xl lg:text-2xl-2 relative top-1">{{ cartCommitmentTotal }}</span>
                        <span class="text-gray-120 pr-5">{{ labels.BackupOrderSelection.Commitment }}</span>
                        <span :class="{'text-red': !reachedMinimum }">({{ priceMinimum }})</span>
                    </span>
                </div>

                <div class="o-cBOrder__details">
                    <p>{{ detailsLabel }}</p>
                </div>
            </div>

            <div class="o-cBOrder__row -orders">
                <div v-if="loading" class="o-cBOrder__background">
                    <div class="o-cBOrder__loading">
                        <a-loading-spinner :visible="loading" />
                    </div>
                </div>
                <div
                    v-show="!hasOrders && !loading"
                    class="o-cBOrder__noItems">

                    <p
                        class="o-cBOrder__details text-center"
                        v-html="noProductMessage" />
                </div>

                <ul
                    v-if="hasOrders && !loading"
                    class="o-cBOrder__itemList">

                    <li
                        v-for="(product, index) in order"
                        :key="product.index"
                        class="o-cBOrder__items">

                        <cust-backup-order-card
                            :edit-label="labels.BackupOrderSelection.Edit"
                            :points-label="labels.BackupOrderSelection.Points"
                            :pts-label="labels.BackupOrderSelection.Pts"
                            :qty-label="labels.BackupOrderSelection.Qty"
                            :read-more-label="labels.BackupOrderSelection.ReadMore"
                            :read-more-aria-label="labels.BackupOrderSelection.ReadMoreAriaLabel"
                            :read-less-aria-label="labels.BackupOrderSelection.ReadLessAriaLabel"
                            :read-less-label="labels.BackupOrderSelection.ReadLess"
                            :remove-product-aria-label="labels.BackupOrderSelection.RemoveProductAria"
                            :product="product"
                            :index="index"
                            :is-cn="isCn"
                            v-on:delete-item="onDeleteProduct(index)"
                            @update-quantity="onUpdateQuantity" />
                    </li>
                </ul>
            </div>

            <div class="o-cBOrder__row -actions">
                <v-button
                    :is-anchor="true"
                    class="-white w-1_2 md:w-1_4 justify-center mr-5 md:mr-20"
                    :href="cartButtons.Cancel.Url"
                    :target="cartButtons.Cancel.Target"
                    @click="gtmTrackAction({
                        id: 210,
                        text: cartButtons.Cancel.Text
                    }, $event)">

                    {{ cartButtons.Cancel.Text }}
                </v-button>

                <v-button
                    :class="['w-1_2 md:w-1_4 justify-center',{'-disabled': !hasOrders}]"
                    :disabled="!hasOrders || cartIsUpdating"
                    @click="[
                        saveCustomizedOrder(),
                        gtmTrackAction({
                            id:210,
                            text: cartButtons.Save.Text
                        }, $event)
                    ]">

                    {{ cartButtons.Save.Text }}
                </v-button>
            </div>
            <div
                v-if="showSurcharge"
                class="o-backupOrder__row -footnote">

                <span class="o-backupOrder__footnote">
                    <span aria-hidden="true" class="a-icon o-backupOrder__icon">*</span> {{ surchargeMessage }}
                </span>
            </div>

            <div class="o-backupOrder__wrapper" aria-live="polite">
                <div
                    v-if="hasError"
                    class="o-backupOrder__row -error">

                    <span class="o-backupOrder__error" role="alert">
                        <span aria-hidden="true" class="a-icon o-backupOrder__icon material-icons -error -inherit">error_outline</span> {{ errorMessage }}
                    </span>
                </div>
                <div
                    v-if="showVIPPointsNotice"
                    class="o-backupOrder__row -error">

                    <span class="o-backupOrder__error" role="alert">
                        <span aria-hidden="true" class="a-icon o-backupOrder__icon material-icons self-start leading-normal -error -inherit">error_outline</span> {{ notReachVIPPointsNoticeErrorMessage }}
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
    import {replaceTokenArray} from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OCustBackupOrderCart',
        components: {},
        props: {
            cartButtons: {
                type: Object,
                default: () => ({
                    Cancel: {
                        Url: 'https://melaleuca.com',
                        Text: 'Back To Account',
                        Target: '_blank'
                    },
                    Save: {
                        Url: 'https://melaleuca.com',
                        Text: 'Save',
                        Target: '_blank'
                    }
                })
            },
            descriptionLabel: {
                type: String,
                default:
                    'Search products or add from the product list below that fit your lifestyle'
            },
            detailsLabel: {
                type: String,
                default:
                    'If you forget to shop, select the items for our Backup Order that will give you everything you need to get throught the month.'
            },
            itemsLabel: {
                type: String,
                default: 'items'
            },
            titleLabel: {
                type: String,
                default: 'Customize Your Backup Order'
            },
            labels: {
                type: Object,
                default: () => ({
                    CustomizeBackupOrder: {
                        Title: 'Customize Your Backup Order',
                        Description:
                            'Search products or add from the product list below that fit your lifestyle'
                    },
                    BackupOrderSelection: {
                        YourBackupOrder: 'Your Backup Order',
                        Items: 'items',
                        Points: 'points',
                        Minimum: 'minimum',
                        Total: 'Total',
                        Commitment: 'Commitment',
                        Description:
                            ' If you forget to shop, select the items for our Backup Order that will give you everything you need to get throught the month.',
                        NoProductMessage:
                            'You have no items in your Backup Order. Add or edit your selections by searching by Keywords, Item Number, or Product Name. A Customized backup Order must meet your minimum product point commitment of <strong>{0} Points</strong>',
                        Qty: 'Qty',
                        Pts: 'Pts',
                        Cancel: 'Cancel',
                        Save: 'Save',
                        MonthlyCommitmentNotMet: 'Monthly commitment not met',
                        ReadMore: 'Read More',
                        ReadLess: 'Read Less',
                        Edit: 'Edit'
                    },
                    BackupOrderProducts: {
                        Title: 'Customize Your Backup Order',
                        Category: 'Category',
                        Search: 'Search',
                        SortBy: 'Sort by',
                        LoadMore: 'Load More',
                        ViewAll: 'View All',
                        BackToTop: 'Back To Top'
                    }
                })
            },
            minimumLabel: {
                type: String,
                default: 'minimum'
            },
            showNotReachVipPointsNotice: {
                type: Boolean,
                default: false
            },
            vipStatusPoints: {
                type: Number,
                default: 0
            },
            noProductMessageLabel: {
                type: String,
                default:
                    'You have no items in your Backup Order. Add or edit your selections by searching by Keywords, Item Number, or Product Name. A Customized backup Order must meet your minimum product point commitment of 35 Points'
            },
            pointsLabel: {
                type: String,
                default: 'points'
            },
            products: {
                type: Array,
                default: () => []
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isKr: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                showSurcharge: false,
                surchargeMessage: '',
                order: {},
                itemCount: 0,
                loading: true
            };
        },
        computed: {
            ...mapState('customBackupOrder', [
                'currentOrder',
                'monthlyPointCommitment',
                'formattedMonthlyPointCommitment',
                'calculatedPoints',
                'calculatedPrice',
                'calculatedPriceCommitment',
                'cartItemCount',
                'cartTotal',
                'cartCommitmentTotal',
                'errorMessage',
                'hasError',
                'successfulSave',
                'buoCartLoaded'
            ]),
            ...mapState('addToCart', ['cartData', 'cartIsUpdating', 'showConfirmation']),
            ...mapActions('userFlags', ['getUserFlags']),
            ...mapGetters('addToCart', [ 'isBackupOrder' ]),
            hasOrders() {
                return this.currentOrder.length > 0;
            },
            hidePoints() {
                return (this.$env?.HidePoints && !this.userFlags?.ViewPoints) || false;
            },
            showVIPPointsNotice() {
                return (this.showNotReachVipPointsNotice && this.hasOrders && (this.calculatedPoints < this.vipStatusPoints)) || false;
            },
            notReachVIPPointsNoticeErrorMessage() {
                return (this.labels.CustomizeBackupOrder?.NotReachVIPPointsNotice || '').replace(
                    '{0}',
                    this.vipStatusPoints
                );
            },
            reachedMinimum() {
                return (
                    this.isCn ? this.calculatedPriceCommitment >= this.monthlyPointCommitment : this.calculatedPoints >= this.monthlyPointCommitment
                );
            },
            noProductMessage() {
                const commitment = this.hidePoints ? this.formattedMonthlyPointCommitment : this.monthlyPointCommitment;
                return this.noProductMessageLabel.replace(
                    '{0}',
                    commitment
                );
            },
            pointsMinimum() {
                let label = this.minimumLabel;
                let points = this.monthlyPointCommitment;

                if(label.indexOf('{0}') > -1) {
                    label = this.replaceTokenArray(label, [points]);
                    return label;
                } else {
                    return `${points} ${label}`;
                }
            },
            priceMinimum() {
                if(this.isCn) {
                    return this.minimumLabel + this.formattedMonthlyPointCommitment;
                } else {
                    return (
                        this.hidePoints ? this.formattedMonthlyPointCommitment + ' ' + this.minimumLabel : this.minimumLabel + ' ' + this.monthlyPointCommitment
                    );
                }
            },
            saveOrderLink() {
                return this.cartButtons.Save.Url + '?type=custom';
            },
            itemCountCn() {
                return this.cartItemCount + ' ' + this.itemsLabel;
            }
        },
        watch: {
            buoCartLoaded(oldVal, newVal) {
                this.loading = newVal;
            },
            cartItemCount() {
                this.itemCount = this.cartItemCount + ' ' + this.itemsLabel;
            },
            products() {
                this.showSurcharge = this.products.filter(product => product.HasSurcharge === true).length >= 1;
                this.surchargeMessage = this.showSurcharge ? this.labels.BackupOrderSelection.SurchargeMessage : '';
            },
            currentOrder() {
                this.order = this.currentOrder;
            },
            cartData(updatedProduct) {
                // use this property from addToCart to update backup order
                const _currentOrder = this.order;
                const index = _currentOrder.findIndex(prod => prod.LineItemId === updatedProduct.Item.Details.LineItemId);
                const points = this.cartData.Item.Details.Points;
                const quantity = this.cartData.Item.Details.Quantity;
                const price = this.cartData.Item.Details.FormattedPrice;
                const isNewProduct = index < 0;

                if(isNewProduct) return;
                this.$store.commit('customBackupOrder/UPDATE_SUMMARY', updatedProduct);
                this.$store.commit('customBackupOrder/UPDATE_ITEM', {price: price, points: points, quantity: quantity, index: index });
            }
        },
        methods: {
            replaceTokenArray,
            ...mapActions('customBackupOrder', [
                'updateOrder',
                'deleteProduct',
                'getBackupOrderCart',
                'showErrorMessages'
            ]),
            ...mapActions('addToCart', ['addToCart', 'removeItem']),
            ...mapMutations('addToCart', ['SET_IS_EDIT', 'SET_CART_DATA']),
            ...mapMutations('customBackupOrder', ['CLEAR_ERROR_MESSAGES']),
            onDeleteProduct(index) {
                const lineItemId = this.currentOrder[index].LineItemId;
                this.deleteProduct({ lineItemId, index });
            },
            saveCustomizedOrder() {
                const isCalulatedPointsMore = this.calculatedPoints >= this.monthlyPointCommitment;
                const isCalulatedPriceMore = this.calculatedPrice >= this.monthlyPointCommitment;
                const isCalulatedPriceCommitmentMore = this.calculatedPriceCommitment >= this.monthlyPointCommitment;
                // Markets like PH which has hidepoints flag and CN uses calculatedPriceCommitment
                if((!this.isCn && !this.hidePoints && isCalulatedPointsMore) || (!this.isCn && this.hidePoints && isCalulatedPriceMore) || (this.isCn && isCalulatedPriceCommitmentMore)) {
                    this.$emit('save-cart', this.saveOrderLink);
                } else {
                    this.showErrorMessages({ msg: this.labels.BackupOrderSelection.MonthlyCommitmentNotMet, status: false });
                }
            },
            async onUpdateQuantity(payload) {
                this.CLEAR_ERROR_MESSAGES();
                const product = this.currentOrder[payload.index];

                if(product) {
                    this.SET_IS_EDIT(true);
                    this.SET_CART_DATA({
                        CartType: 'backuporder',
                        Quantity: payload.qty,
                        Sku: product.Sku,
                        LineItemId: product.LineItemId,
                        PromotionId: product.PromotionId,
                        LineType: product.LineType
                    });

                    await this.addToCart({
                        product: {
                            Sku: product.Sku,
                            FamilyId: product.FamilyId,
                            Quantity: payload.qty,
                            Configurations: product.Configurations,
                            Category: product.Category,
                            LineItemId: product.LineItemId
                        }
                    });
                }
            }
        }
    };
</script>

<template>
    <div>
        <section v-if="!isLoaded || !componentLoaded" class="o-po">
            <div class="o-po__loading" :class="{ '-isCn' : isCn }">
                <h2 class="text-2xl text-gray-100">
                    <loadingIcon :visible="true" />
                </h2>
            </div>
        </section>
        <section v-else class="o-po">
            <!-- Filters -->
            <div v-if="!isLimitOrderHistory && initCall.length" class="o-po__filters" :class="isCn ? '-isCn' : ''">

                <div v-if="showGui" class="o-po__gui">
                    <GuiConsolidation
                        :cancel-label="getLocalizationProp('Labels.GUI.CancelLabel', 'Cancel')"
                        :confirm-label="getLocalizationProp('Labels.GUI.ConfirmLabel', 'Confirm')"
                        :desc-label="getLocalizationProp('Labels.GUI.ConsolidationText')"
                        :error-label="getLocalizationProp('Labels.GUI.FailureMessage')"
                        :modal-desc-label="getLocalizationProp('Labels.GUI.ModalDescription')"
                        :modal-heading-label="getLocalizationProp('Labels.GUI.ModalTitle', 'Please Confirm')"
                        :submission-url="getLocalizationProp('Data.GUIConsolidationURL', '')"
                        :toggle-label="getLocalizationProp('Labels.GUI.ConsolidationButtonLabel', 'Gui Carrier Consolidation')"
                    />
                </div>

                <div class="o-po__showing relative w-full md:w-auto hidden">
                    <span ref="filterShowing" class="absolute flex items-center top-1 pl-10 text-md text-gray-100 h-40 z-1 pointer-events-none">
                        {{ localization.Labels.Showing }}
                    </span>
                    <v-select
                        id="filter-show"
                        :options="selectShowing.toString()"
                        :aria-label="localization.Labels.Showing"
                        select-element-mod="h-40 px-10"
                        select-mod="-mdLg -white -rounded -padding-sm w-full md:w-auto"
                        arrow-tailwind-color="black"
                        :style-inline-mod="'padding-left:' + paddingFilterShowing + 'px'"
                        arrow-other-mods="-sm -down -filled w-0 h-0 absolute right-15 top-10 pointer-events-none md:top-12"
                    />
                </div>

                <div class="o-po__search flex relative w-full h-40 my-10 text-md md:my-0 md:mx-10 lg:mx-40 hidden">
                    <vInput
                        input-type="text"
                        :placeholder="localization.Labels.SearchBy"
                        tailwind-mods=""
                    />
                    <button class="absolute w-40 h-40 right-0 top-0">
                        <img
                            src="//cdnsc1.melaleuca.com/na/images/atoms/search@2x.png" width="20" height="21"
                            alt="Click to search" class="absolute right-10 top-10">
                    </button>
                </div>

                <div class="o-po__sort-by relative w-full md:w-auto" :class="{'flex items-center': isCn}">
                    <span ref="filterSortBy" class="absolute flex items-center top-1 pl-10 text-md text-gray-100 h-40 z-1 pointer-events-none">
                        {{ localization.Labels.SortBy }}
                    </span>
                    <v-select
                        id="sort-by"
                        ref="sortbySelect"
                        :options="years"
                        :aria-label="localization.Labels.SortBy"
                        :select-element-mod="'h-40 px-10 ' + (isCn ? '-isCn' : '')"
                        select-mod="-mdLg -white -rounded -padding-sm w-full md:w-auto"
                        arrow-tailwind-color="black"
                        :style-inline-mod="'padding-left:' + paddingSelectSortBy + 'px'"
                        :arrow-other-mods="'-sm -down -filled ' + (isCn ? '-isCn' : '') + ' w-0 h-0 absolute right-15 top-10 pointer-events-none md:top-12'"
                        :gtm-id="gtmSortId"
                    />
                </div>
            </div>

            <!-- No past orders -->
            <div v-if="!initCall.length && !showError" class="o-po__loading" :class="{ '-isCn' : isCn }">
                <h2 class="text-2xl text-gray-100">
                    {{ localization.Labels.SeeDetails }}
                </h2>
            </div>

            <!-- Start Order -->
            <div v-if="pastOrdersArr.length && isLoadedOrders" ref="pastOrderList" class="o-po__orders -list" :class="isCn ? '-isCn' : ''">
                <past-order
                    v-for="(pastOrder, index) in orderFilteredSliced"
                    :key="pastOrder.OrderNumber"
                    :can-add-to-backup-order="canAddToBackupOrder"
                    :past-order="pastOrder"
                    :localization="localization"
                    :show-gui="showGui"
                    :show-tracking-number-for-no-url="showTrackingNumberForNoUrl"
                    :third-title-aria-label="getFullOrderAriaLabel(pastOrder.OrderNumber)"
                    :third-title="localization.Labels.SeeFullOrderReceipt"
                    :title="orderStatus(pastOrder.OrderStatus)"
                    :toggle-id="index.toString()"
                    :use-alt-tracking-number="useAltTrackingNumber"
                    :year-order="getYearResult(pastOrder.OrderDate)"
                    :is-cn="isCn"
                    :is-limit-order-history="isLimitOrderHistory"
                    :past-order-index="(pastOrder, index)"
                />
            </div>
            <!-- End Order -->

            <!-- API error: -->
            <div v-if="showError" class="o-po__error">
                <span class="pr-25" v-html="getLocalizationProp('Labels.GenericFailureMessage')"></span>
                <span>
                    <button class="text-green-100 underline" type="button" @click="reloadPage">{{ localization.Labels.RefreshPage }}</button>
                </span>
            </div>

            <!-- No results on filter -->
            <div
                v-if="!pastOrdersArr.length && !showError && isLoadedOrders && initCall.length && !isCn"
                :class="'flex justify-center items-center bg-white border-1 ' + (isCn ? 'to-md:px-40 to-md:py-60' : 'border-gray-100') + ' mb-60'"
                style="height: 400px;"
            >
                <h3 class="text-2xl text-gray-100">
                    {{ localization.Labels.NoResultsForAppliedFilters }}
                </h3>
            </div>

            <!-- Load more -->
            <div v-if="!isLoadedPage" class="o-po__loadMore flex justify-center mb-44">
                <loadingIcon :visible="true" />
            </div>
            <div v-if="pageCount > 1 && pageNumber !== pageCount && isLoadedPage" class="o-po__loadMore flex justify-center mb-44">
                <v-button
                    type="button"
                    :aria-label="localization.Labels.LoadMoreAriaLabel"
                    :cta="localization.Labels.LoadMore"
                    class="-load -white -medium justify-center"
                    v-on:click="[$emit('click', nextPage()), gtmTrackAction({id: gtmId}, $event)]"
                />
            </div>

            <!-- Scroll top -->
            <div :class="{'-isCn' : isCn, 'o-po__bottom': showOlderOrderMessage}">
                <div v-show="showOlderOrderMessage" class="o-po__contactCustomerService">
                    {{ localization.Labels.ContactCustomerService }}
                </div>
                <a-back-to-top
                    v-if="pastOrdersArr.length"
                    :button-text="localization.Labels.BacktoTop"
                >
                </a-back-to-top>
            </div>

        </section>
    </div>
</template>

<script>
    import pastOrder from '../../01-molecules/my-account/past-order.vue';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import loadingIcon from '@common/source/js/vue/components/00-atoms/loading-spinner/loading-spinner.vue';
    import vButton from '../../00-atoms/buttons/button.vue';
    import { mapActions, mapMutations, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import GuiConsolidation from '../../01-molecules/gui-consolidation/gui-consolidation.vue';

    export default {
        name: 'PastOrdersSection',
        components: {
            GuiConsolidation,
            loadingIcon,
            pastOrder,
            vButton,
            vInput
        },
        mixins: [ localizationMixin ],
        props: {
            apiBaseUrl: {
                type: String,
                default: ''
            },
            apiLocalization: {
                type: String,
                default: ''
            },
            apiOrderHistory: {
                type: String,
                default: ''
            },
            numberOfOrdersPerPage: {
                type: Number,
                default: 12
            }
        },

        data() {
            return {
                currPage: 1,
                gtmId: 180,
                gtmSortId: 215,
                newResult: [],
                paddingFilterShowing: 70,
                paddingSelectSortBy: 70,
                query: '',
                yearChosen: null,
                yearArr: []
            };
        },

        computed: {
            ...mapState('pastOrders', ['canAddToBackupOrder', 'initCall', 'isLoaded', 'orderFiltered', 'orderFilteredSliced', 'ordersSize', 'pageCount', 'pageNumber', 'pastOrdersArr', 'selectSortBy', 'sortBy', 'selectShowing', 'showing', 'showError', 'isLoadedPage', 'isLoadedOrders', 'yearsForSort', 'useAlternateTrackingUrl' ]),

            // Use alternate tracking number in order history api, if available
            // Note that Order History popup  uses order status api
            alternateTrackingUrl() {
                return this.localization.Data?.UseAlternateTrackingUrl || false;
            },
            componentLoaded() {
                // Load the component only after get all the orders and all the labels
                if(this.isLoaded && this.localization?.Labels) {
                    return true;
                }

                return false;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            // stop-internet-access page-TW market
            isLimitOrderHistory() {
                return this.localization.Data?.IsLimitedOrderHistory || false;
            },
            monthsToFetch() {
                return this.localization?.Data?.MonthsToFetch;
            },
            pastOrdersLength() {
                return this.orderFiltered.length;
            },
            showOlderOrderMessage() {
                return this.localization.Labels.ContactCustomerService && this.pageNumber === this.pageCount && this.isLoadedPage;
            },
            showGui() {
                return this.localization.Data?.ShowGui || false;
            },
            showTrackingNumberForNoUrl() {
                return this.localization.Data?.ShowTrackingNumberForNoUrl || false;
            },
            useAltTrackingNumber() {
                return this.useAlternateTrackingUrl || this.localization.Data?.UseTrackingNumber || false;
            },
            years() {
                const dataYears = [...this.yearsForSort];

                const labelMostRecent = this.localization?.Labels?.MostRecent;
                dataYears.unshift(labelMostRecent);
                return dataYears.toString();
            }
        },

        watch: {
            componentLoaded() {
                if(this.componentLoaded) {
                    this.$store.commit('pastOrders/INIT_LABELS', {
                        All: this.localization?.Labels?.All,
                        MostRecent: this.localization?.Labels?.MostRecent
                    });
                    this.labelSelectWidth();
                }
            },
            localization() {
                // Get data from API once having localizations - first page
                this.getData(1, null, this.monthsToFetch, true);
                this.UPDATE_ORDERS_SIZE(this.numberOfOrdersPerPage);
            },
            pastOrdersLength(newVal, oldVal) {
                return newVal;
            },

            showing(newVal, oldVal) {
                this.orderBy({filterSel: newVal, sortSel: this.sortBy});
            },

            sortBy(newVal, oldVal) {
                this.orderBy({filterSel: this.showing, sortSel: newVal});
            }

        },

        mounted() {
            const _this = this;

            this.$el.onchange = function(event) {
                _this.change(event.target.id, event.target.value);
            };
        },

        methods: {
            ...mapActions('pastOrders', ['getPastOrderData', 'orderBy', 'updateOrdersSize']),
            ...mapMutations('pastOrders', ['UPDATE_ORDERS_SIZE', 'UPDATE_SHOWING']),
            replaceToken,

            change(id, value) {
                const _numberOfOrdersPerPage = this.numberOfOrdersPerPage;
                if(id === 'sort-by') {
                    this.currPage = 1;
                    this.yearChosen = value;

                    if(this.yearChosen === this.localization?.Labels?.MostRecent) this.yearChosen = '';
                    this.getData(1, this.yearChosen, this.monthsToFetch);
                    this.updateOrdersSize(12);
                }
                if(id === 'filter-show') {
                    this.UPDATE_SHOWING({value, _numberOfOrdersPerPage});
                }
            },

            getData(page, year, monthsToFetch, init) {
                this.getPastOrderData({
                    baseApiAddress: this.apiBaseUrl,
                    orderHistory: this.apiOrderHistory,
                    page: page || 1,
                    year: year || null,
                    monthsToFetch: monthsToFetch || null,
                    init: init || null // check initial value
                });
            },

            getFullOrderAriaLabel(orderNum) {
                return replaceToken(this.localization.Labels.SeeFullOrderReceiptAriaLabel, orderNum);
            },

            getYearResult(val) {
                const date = new Date(val);
                if(date) {
                    return date.getFullYear();
                }

                return 0;
            },

            labelSelectWidth() {
                if(this.pastOrdersArr.length) {
                    this.$nextTick(() => {
                        const paddingSelect = 5;
                        const paddingSelectCn = 32;
                        this.paddingSelectSortBy = parseInt(this.$refs.filterSortBy?.clientWidth + (this.isCn ? paddingSelectCn : paddingSelect));
                        this.paddingFilterShowing = parseInt(this.$refs.filterShowing?.clientWidth + (this.isCn ? paddingSelectCn : paddingSelect));
                    });
                }
            },

            nextPage() {
                this.currPage++;
                this.getData(this.currPage, this.yearChosen, this.monthsToFetch);
                this.updateOrdersSize(this.ordersSize * this.currPage);
            },

            orderStatus(status) {
                switch (status) {
                    case 'Cancelled':
                        return this.localization.Labels.OrderStatusCancelled;
                    case 'Delivered':
                        return this.localization.Labels.OrderStatusDelivered;
                    case 'FourDayHoldDirectDebit':
                        return this.localization.Labels.OrderStatusPendingPayment;
                    case 'Processed':
                        return this.localization.Labels.OrderStatusProcessed;
                    case 'Processing':
                        return this.localization.Labels.OrderStatusProcessing;
                    case 'Shipped':
                        return this.localization.Labels.OrderStatusShipped;
                    case 'Pending':
                        return this.localization.Labels.OrderStatusPending;
                    case 'Returned':
                        return this.localization.Labels.OrderStatusReturned;
                    default:
                        return status;
                }
            },

            reloadPage() {
                window.location.reload();
            },

            scrollTop() {
                window.scroll({top: 0, left: 0, behavior: 'smooth'});
            }
        }
    };
</script>

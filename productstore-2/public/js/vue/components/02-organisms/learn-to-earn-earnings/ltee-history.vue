<template>
    <div class="o-lteeHistory">
        <!-- Title -->
        <h3 class="o-lteeHistory__title">
            {{ getLocalizationProp('Labels.TransactionsHistory.EarningHistoryTitle', null) }}
        </h3>

        <!-- Description -->
        <p class="o-lteeHistory__description">
            {{ getLocalizationProp('Labels.TransactionsHistory.EarningHistoryText', null) }}
        </p>

        <!-- Loading -->
        <div v-if="isLoading" class="o-lteeHistory__loading">
            <a-loading-spinner :visible="true" aria-hidden="true" />
        </div>

        <!-- Grid -->
        <div v-if="!isLoading && lteEarningsData && filterLteEarningsData && filterLteEarningsData.length > 0" class="o-lteeHistory__grid">
            <!-- Grid Header (hidden on mobile) -->
            <div class="o-lteeHistory__header">
                <!-- Date -->
                <div class="o-lteeHistory__col -date" :class="{'-isCn': isCn}">
                    {{ getLocalizationProp('Labels.TransactionsHistory.Date', null) }}
                </div>

                <!-- Transaction description -->
                <div class="o-lteeHistory__col -transaction">
                    <span class="pl-32">{{ getLocalizationProp('Labels.TransactionsHistory.Transaction', null) }}</span>
                </div>

                <!-- Earned -->
                <div class="o-lteeHistory__col -earned">
                    {{ getLocalizationProp('Labels.TransactionsHistory.Earned', null) }}
                </div>

                <!-- Redeemed -->
                <div class="o-lteeHistory__col -redeemed" :class="{'-isCn': isCn}">
                    {{ getLocalizationProp('Labels.TransactionsHistory.Redeemed', null) }}
                </div>
            </div>

            <!-- Grid Items - Do NOT remove the index, because it's used on JS -->
            <div v-for="(item, index) in filterLteEarningsData" :key="index" class="o-lteeHistory__item">
                <!-- Date -->
                <div :ref="`date-${index}`" class="o-lteeHistory__col -date" :class="{'-isCn': isCn}">
                    <span class="o-lteeHistory__info " :class="[checkAccordion(item), !isCn ? 'italic' : '']">{{ item.TransactionDate }}</span>
                </div>

                <!-- Transaction description -->
                <div class="o-lteeHistory__col -transaction">
                    <!-- Dot -->
                    <span
                        v-if="item.IsEarned"
                        class="o-lteeHistory__dot"
                        aria-hidden="true"
                        :style="{ color: getColor(item) }">
                        fiber_manual_record
                    </span>

                    <!-- Description -->
                    <component
                        :is="hasReceipt(item) ? 'a' : 'span'"
                        :ref="`transaction-${index}`"
                        :href="hasReceipt(item) ? getReceiptLink(item) : null"
                        class="o-lteeHistory__info"
                        :class="getStyle(item)"
                        v-html="item.TransactionDescriptionContent">
                    </component>

                    <m-tooltip
                        v-if="item.HasTooltip"
                        tooltip-icon="info"
                        class="mx-8 mb-2"
                        tooltip-popup-mod="max-w-290 min-w-270"
                    >
                        <div v-html="getLocalizationProp('Labels.LSDRewards.Tooltip')"></div>
                    </m-tooltip>

                    <!-- Accordion with SubTransactions -->
                    <accordion
                        v-if="item.SubTransactions && item.SubTransactions.length > 0"
                        :title="getAccordionTitle(index)"
                        title-el="h4"
                        :content-id="`o-lteeHistory-content-${index}`"
                        :toggle-id="`o-lteeHistory-toggle-${index}`"
                        wrapper-mods="-lteeHistory o-lteeHistory__accordion"
                        @show="() => setAccordion(index, true)"
                        @hide="() => setAccordion(index, false)">
                        <!-- Arrow Icon -->
                        <template v-slot:icon="$accordion">
                            <span class="text-xl leading-none">
                                <a-icon size="inherit" :class="['text-green', $accordion.isOpened ? '-flip': '', $accordion.isReady ? '-transition' : '']">
                                    keyboard_arrow_down
                                </a-icon>
                            </span>
                        </template>

                        <!-- Accordion Content -->
                        <div class="o-lteeHistory__content">
                            <!-- List of SubTransactions -->
                            <ul class="pt-5 pb-20 md:px-50">
                                <li
                                    v-for="(subTransaction, i) in item.SubTransactions"
                                    :key="i"
                                    class="flex text-base md:text-sm lg:text-base to-md:justify-between">
                                    <!-- Description -->
                                    <span class="o-lteeHistory__subtransaction">{{ subTransaction.Description }}</span>

                                    <!-- Amount -->
                                    <span>{{ subTransaction.FormattedAmount }}</span>
                                </li>
                            </ul>
                        </div>
                    </accordion>
                </div>

                <!-- Earned -->
                <div :ref="`earned-${index}`" class="o-lteeHistory__col -earned" :class="[checkAmount(item), isCn ? '-isCn': '']">
                    <!-- Label (mobile only) -->
                    <span
                        v-if="isMobile && item.IsEarned"
                        class="o-lteeHistory__info text-gray pr-5">
                        {{ getLocalizationProp('Labels.TransactionsHistory.Earned', null) }}:
                    </span>

                    <!-- Value -->
                    <span
                        v-if="item.IsEarned"
                        class="o-lteeHistory__info font-bold"
                        :class="checkAccordion(item)">
                        {{ item.FormattedTransactionAmount }}
                    </span>
                </div>

                <!-- Redeemed -->
                <div :ref="`redeemed-${index}`" class="o-lteeHistory__col -redeemed" :class="checkAmount(item)">
                    <!-- Label (mobile only) -->
                    <span
                        v-if="isMobile && item.IsRedeemed"
                        class="o-lteeHistory__info text-gray pr-5">
                        {{ getLocalizationProp('Labels.TransactionsHistory.Redeemed', null) }}:
                    </span>

                    <!-- Value -->
                    <span
                        v-if="item.IsRedeemed"
                        class="o-lteeHistory__info"
                        :class="checkAccordion(item)">
                        {{ item.FormattedTransactionAmount }}
                    </span>
                </div>
            </div>

            <!-- Grid Totals -->
            <div class="o-lteeHistory__footer" :class="{'-isCn': isCn}">
                <!-- Totals -->
                <div class="o-lteeHistory__col -totals">
                    <span class="font-bold uppercase text-2xl">
                        {{ getLocalizationProp('Labels.TransactionsHistory.Totals', null) }}
                    </span>
                </div>

                <!-- Earned -->
                <div v-if="totalsData" class="o-lteeHistory__col -earned -footer">
                    <!-- Label (mobile only) -->
                    <span
                        v-if="isMobile"
                        class="pr-5">
                        {{ getLocalizationProp('Labels.TransactionsHistory.Earned', null) }}:
                    </span>

                    <!-- Value -->
                    <span class="font-bold">{{ totalsData.FormattedDebitTotal }}</span>
                </div>

                <!-- Redeemed -->
                <div v-if="totalsData" class="o-lteeHistory__col -redeemed">
                    <!-- Label (mobile only) -->
                    <span
                        v-if="isMobile"
                        class="pr-5">
                        {{ getLocalizationProp('Labels.TransactionsHistory.Redeemed', null) }}:
                    </span>

                    <!-- Value -->
                    <span>{{ totalsData.FormattedCreditTotal }}</span>
                </div>
            </div>
        </div>

        <div v-else></div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OLteeHistory',
        mixins: [localizationMixin],
        data() {
            return {
                openAccordions: [],
                viewportWidth: 0
            };
        },
        computed: {
            ...mapState('lteEarnings', ['storeLoaded', 'isLoading', 'lteEarningsData']),

            colors() {
                return {
                    melaleucaShopping: this.getLocalizationProp('Data.AccountTypeColors.MelaleucaShopping', '#30862D'),
                    retailPartners: this.getLocalizationProp('Data.AccountTypeColors.MarketPlaceRewards', '#0A4A73'),
                    otherActivity: this.getLocalizationProp('Data.AccountTypeColors.OtherActivity', '#C14E00'),
                    commissions: this.getLocalizationProp('Data.AccountTypeColors.Commissions', '#C78230')
                };
            },
            //  hideMarketplace is used for countries where Marketplace is not available, such as AU/NZ
            hideMarketplaceByCountry() {
                return this.getLocalizationProp('Data.HideMarketPlaceRewards', false);
            },
            isMobile() {
                return this.viewportWidth < 768;
            },

            isCn() {
                return this.$env?.IsCn || false;
            },

            // Filter out items for Marketplace if hideMarketplaceByCountry is true.
            // Theoretically there should not be any such items in the data, but just in case.
            filterLteEarningsData() {
                if(this.hideMarketplaceByCountry) {
                    return this.lteEarningsData.LsdHistory.filter(item => item.AccountType !== 'MarketPlaceRewards');
                } else {
                    return this.lteEarningsData.LsdHistory;
                }
            },
            summaryData() {
                return this.lteEarningsData?.Totals?.Summary;
            },
            totalsData() {
                return this.lteEarningsData?.Totals?.Table;
            }
        },
        watch: {
            lteEarningsData() {
                if(this.filterLteEarningsData?.length) {
                    this.$nextTick(() => {
                        this.calcAmountPosition();
                    });
                }
            }
        },
        created() {
            this.setViewport();

            window.addEventListener('resize', this.resize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },
        mounted() {
            if(!this.storeLoaded) this.getData();
        },
        methods: {
            ...mapActions('lteEarnings', ['getData']),

            getStyle(item) {
                let style = {
                    'font-bold': item.IsEarned,
                    'pl-30': true,
                    'pl-0': false,
                    'md:pl-32': true,
                    'to-md:text-sm': true,
                    '-hasAccordion': item?.SubTransactions?.length > 0
                };

                if(item.IsRedeemed && this.isMobile) {
                    style['pl-30'] = false;
                    style['pl-0'] = true;
                }

                return style;
            },
            getColor(item) {
                if(item.AccountType) {
                    // Color for Melaleuca Shopping
                    if(item.AccountType.toLowerCase() === 'melaleucashopping') {
                        return this.colors.melaleucaShopping;
                    }

                    // Color for MarketPlace Rewards
                    if(item.AccountType.toLowerCase() === 'marketplacerewards') {
                        return this.colors.retailPartners;
                    }

                    // Color for OtherActivity
                    if(item.AccountType.toLowerCase() === 'otheractivity') {
                        return this.colors.otherActivity;
                    }

                    // Color for Commissions
                    if(item.AccountType.toLowerCase() === 'commissions') {
                        return this.colors.commissions;
                    }
                }

                return '#ffffff';
            },
            getAccordionTitle(index) {
                let title = this.getLocalizationProp('Labels.TransactionsHistory.More', null);

                if(this.openAccordions.includes(index)) {
                    title = this.getLocalizationProp('Labels.TransactionsHistory.Less', null);
                }

                return title;
            },
            hasReceipt(transaction) {
                return transaction.OrderNumber && (transaction.IsEarned || transaction.IsRedeemed);
            },
            getReceiptLink(transaction) {
                let url = this.getLocalizationProp('Data.ReceiptPageLink.Url', null);

                if(url && transaction) {
                    url = `${url}?orderId=${transaction.OrderNumber}`;
                }

                return url;
            },
            calcAmountPosition() {
                if(this.filterLteEarningsData.length) {
                    for (let index = 0; index < this.filterLteEarningsData.length; index++) {
                        if(this.filterLteEarningsData[index].SubTransactions?.length) {
                            if(this.$refs[`transaction-${index}`] && this.$refs[`transaction-${index}`][0]) {
                                const transaction = this.$refs[`transaction-${index}`][0];
                                const date = this.$refs[`date-${index}`][0];
                                const earned = this.$refs[`earned-${index}`][0];
                                const redeemed = this.$refs[`redeemed-${index}`][0];
                                const top = date.offsetHeight + transaction.offsetHeight;

                                if(earned && redeemed) {
                                    if(this.isMobile) {
                                        earned.style.top = `${top}px`;
                                        redeemed.style.top = `${top}px`;
                                    } else {
                                        earned.style.top = 'initial';
                                        redeemed.style.top = 'initial';
                                    }
                                }
                            }
                        }
                    }
                }
            },
            setAccordion(index, show) {
                if(show) {
                    this.openAccordions.push(index);
                } else {
                    this.openAccordions = this.openAccordions.filter(acc => acc !== index);
                }
            },
            checkAccordion(item) {
                let mod = '';

                // If it has subtransactions and is NOT mobile
                if(item.SubTransactions?.length && !this.isMobile) {
                    mod = '-alignTop';
                }

                return mod;
            },
            checkAmount(item) {
                let mod = '';

                // If it has subtransactions and is mobile
                if(item.SubTransactions?.length && this.isMobile) {
                    mod = '-alignAmount';
                }

                return mod;
            },
            resize() {
                this.setViewport();

                this.calcAmountPosition();
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            }
        }
    };
</script>

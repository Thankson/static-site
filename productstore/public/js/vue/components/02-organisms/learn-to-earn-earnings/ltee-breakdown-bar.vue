<template>
    <div class="o-lteeBreakdownBar">
        <h3 class="o-lteeBreakdownBar__title">
            {{ getLocalizationProp('Labels.RewardsBreakdownForPast12Months', 'Rewards Breakdown For Past 12 Months') }}
        </h3>
        <div v-if="isLoading" class="o-lteeBreakdownBar__loading">
            <a-loading-spinner :visible="true" aria-hidden="true" />
        </div>
        <div
            v-if="!isLoading && summaryData && Object.keys(summaryData).length"
            class="o-lteeBreakdownBar__wrapper" :class="{'-isCn': isCn}"
        >
            <div class="o-lteeBreakdownBar__bar">

                <!-- MLC Shoppping - Bar -->
                <span
                    v-if="showMLCShopping"
                    ref="melaleucaShoppingWrapper"
                    class="o-lteeBreakdownBar__item -mlc"
                    :style="{ width: `${melaleucaShoppingPerc}%`,
                              backgroundColor: colors.melaleucaShopping,
                              borderWidth: (!summaryData.MelaleucaShopping) ? 0 : null
                    }"
                    aria-labelledby="melaleuca-shopping"
                >
                    <span ref="melaleucaShopping" class="o-lteeBreakdownBar__number" :class="{'-hide': hideMelaleucaShopping}" aria-hidden="true">
                        {{ summaryData.FormattedMelaleucaShopping }}
                    </span>
                </span>

                <!-- MKTPlace - Bar -->
                <span
                    v-if="showMarketPlace && !hideMarketplaceByCountry"
                    ref="marketPlaceRewardsWrapper"
                    class="o-lteeBreakdownBar__item -mkt"
                    :style="{ width: `${marketPlaceRewardsPerc}%`,
                              backgroundColor: colors.retailPartners,
                              borderWidth: (!summaryData.MarketPlaceRewards) ? 0 : null
                    }"
                    aria-labelledby="marketplace-retail-partner"
                >
                    <span ref="marketPlaceRewards" class="o-lteeBreakdownBar__number" :class="{'-hide': hideMarketPlaceRewards}" aria-hidden="true">
                        {{ summaryData.FormattedMarketPlaceRewards }}
                    </span>
                </span>

                <!-- Other - Bar -->
                <span
                    v-if="showOtherActivity"
                    ref="otherActivityWrapper"
                    class="o-lteeBreakdownBar__item -other"
                    :style="{ width: `${otherActivityPerc}%`,
                              backgroundColor: colors.otherActivity,
                              borderWidth: (!summaryData.OtherActivity) ? 0 : null
                    }"
                    aria-labelledby="other-activity"
                >
                    <span ref="otherActivity" class="o-lteeBreakdownBar__number" :class="{'-hide': hideOtherActivity}" aria-hidden="true">
                        {{ summaryData.FormattedOtherActivity }}
                    </span>
                </span>

                <!-- Commissions - Bar -->
                <span
                    v-if="showCommission"
                    ref="commissionsWrapper"
                    class="o-lteeBreakdownBar__item -com"
                    :style="{ width: `${commissionsPerc}%`,
                              backgroundColor: colors.commissions,
                              borderWidth: (!summaryData.Commissions) ? 0 : null
                    }"
                    aria-labelledby="commissions"
                >
                    <span ref="commissions" class="o-lteeBreakdownBar__number" :class="{'-hide': hideCommissions}" aria-hidden="true">
                        {{ summaryData.FormattedCommissions }}
                    </span>
                </span>

            </div>

            <div class="o-lteeBreakdownBar__legend">

                <!-- MLC Shoppping -->
                <div
                    v-if="showMLCShopping"
                    id="melaleuca-shopping" class="o-lteeBreakdownBar__inner">
                    <span class="o-lteeBreakdownBar__type -mlc">
                        <span
                            class="o-lteeBreakdownBar__dot"
                            :style="{color: colors.melaleucaShopping}">fiber_manual_record</span>
                        {{ getLocalizationProp('Labels.MelaleucaShopping', 'Melaleuca Shopping') }}
                    </span>
                    <span class="o-lteeBreakdownBar__value">
                        {{ summaryData.FormattedMelaleucaShopping }}
                    </span>
                </div>

                <!-- MKTPlace -->
                <div
                    v-if="showMarketPlace && !hideMarketplaceByCountry"
                    id="marketplace-retail-partner" class="o-lteeBreakdownBar__inner -retail">
                    <div class="o-lteeBreakdownBar__type -mkt">
                        <span
                            class="o-lteeBreakdownBar__dot"
                            :style="{color: colors.retailPartners}">fiber_manual_record</span>
                        {{ getLocalizationProp('Labels.MarketPlaceRetailPartners', 'MarketPlace Retail Partners') }}
                    </div>
                    <span class="o-lteeBreakdownBar__value">
                        {{ summaryData.FormattedMarketPlaceRewards }}
                    </span>
                </div>

                <!-- Other -->
                <div
                    v-if="showOtherActivity"
                    id="other-activity" class="o-lteeBreakdownBar__inner">
                    <span class="o-lteeBreakdownBar__type -other">
                        <span
                            class="o-lteeBreakdownBar__dot"
                            :style="{color: colors.otherActivity}">fiber_manual_record</span>
                        {{ getLocalizationProp('Labels.OtherActivity', 'Other Activity') }}
                    </span>
                    <span class="o-lteeBreakdownBar__value">
                        {{ summaryData.FormattedOtherActivity }}
                    </span>
                </div>

                <!-- Loyalty Shopping Dollar Rewards -->
                <div
                    v-if="showCommission"
                    id="commissions" class="o-lteeBreakdownBar__inner -rewards">
                    <span class="o-lteeBreakdownBar__type -com">
                        <span
                            class="o-lteeBreakdownBar__dot"
                            :style="{color: colors.commissions}">fiber_manual_record</span>
                        {{ getLocalizationProp('Labels.LSDRewards.Text', 'Loyalty Shopping Dollar Rewards') }}
                        <m-tooltip
                            tooltip-icon="info"
                            class="mx-5"
                            tooltip-popup-mod="max-w-290 min-w-270"
                        >
                            <div v-html="getLocalizationProp('Labels.LSDRewards.Tooltip', 'Loyalty Shopping Dollars received from your organization, with or without personal enrollees')"></div>
                        </m-tooltip>
                    </span>
                    <span class="o-lteeBreakdownBar__value">
                        {{ summaryData.FormattedCommissions }}
                    </span>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OLteeBreakdownBar',
        mixins: [localizationMixin],
        data() {
            return {
                hideCommissions: false,
                hideOtherActivity: false,
                hideMarketPlaceRewards: false,
                hideMelaleucaShopping: false
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
            // This hideMarketplace is used for countries where Marketplace is not available, such as AU/NZ
            hideMarketplaceByCountry() {
                return this.getLocalizationProp('Data.HideMarketPlaceRewards', false);
            },
            melaleucaShoppingPerc() {
                return this.calcPercentage(this.summaryData?.MelaleucaShopping);
            },
            marketPlaceRewardsPerc() {
                return this.calcPercentage(this.summaryData?.MarketPlaceRewards);
            },
            otherActivityPerc() {
                return this.calcPercentage(this.summaryData?.OtherActivity);
            },
            commissionsPerc() {
                return this.calcPercentage(this.summaryData?.Commissions);
            },
            calcTotal() {
                const mlcShoppVal = this.showMLCShopping ? this.summaryData.MelaleucaShopping : 0;
                const mktPlaceVal = this.showMarketPlace ? this.summaryData.MarketPlaceRewards : 0;
                const commVal = this.showCommission ? this.summaryData.Commissions : 0;
                const othersVal = this.showOtherActivity ? this.summaryData.OtherActivity : 0;

                return mlcShoppVal + mktPlaceVal + commVal + othersVal;
            },
            summaryData() {
                return this.lteEarningsData?.Totals?.Summary;
            },
            showMLCShopping() {
                if(this.summaryData.ShowMelaleucaShoppingOnZero || this.summaryData.MelaleucaShopping) return true;
                return false;
            },
            showMarketPlace() {
                return this.summaryData.ShowMarketPlaceRewardsOnZero || this.summaryData.MarketPlaceRewards;
            },
            showCommission() {
                if(this.summaryData.ShowCommissionsOnZero || this.summaryData.Commissions) return true;
                return false;
            },
            showOtherActivity() {
                if(this.summaryData.ShowOtherActivityOnZero || this.summaryData.OtherActivity) return true;
                return false;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            isLoading(val) {
                if(!val) {
                    this.$nextTick(() => {
                        this.checkSizes();
                    });
                }
            }
        },
        beforeDestroy() {
            // Unregister
            window.removeEventListener('resize', this.onResize);
        },
        mounted() {
            window.addEventListener('resize', this.onResize);
            if(!this.storeLoaded) this.getData();
        },
        methods: {
            ...mapActions('lteEarnings', ['getData']),

            calcPercentage(val) {
                const calc = ((val * 100) / this.calcTotal).toFixed(4);
                return calc;
            },
            checkSizes() {
                // MLC Shoppping
                (this.$refs.melaleucaShoppingWrapper?.clientWidth < this.$refs.melaleucaShopping?.clientWidth)
                    ? this.hideMelaleucaShopping = true : this.hideMelaleucaShopping = false;

                // MKTPlace
                (this.$refs.marketPlaceRewardsWrapper?.clientWidth < this.$refs.marketPlaceRewards?.clientWidth)
                    ? this.hideMarketPlaceRewards = true : this.hideMarketPlaceRewards = false;

                // Other Activity
                (this.$refs.otherActivityWrapper?.clientWidth < this.$refs.otherActivity?.clientWidth)
                    ? this.hideOtherActivity = true : this.hideOtherActivity = false;

                // Commissions
                (this.$refs.commissionsWrapper?.clientWidth < this.$refs.commissions?.clientWidth)
                    ? this.hideCommissions = true : this.hideCommissions = false;
            },
            onResize() {
                this.checkSizes();
            }
        }
    };
</script>

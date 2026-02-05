<template>
    <ul class="o-lteeDollarBalance" :class="{'-isCn': isCn}">
        <li v-if="labels.AvailableToSpend" class="o-lteeDollarBalance__item">
            <h3 class="o-lteeDollarBalance__title">
                {{ getLocalizationProp('Labels.AvailableToSpend.Text', 'Available to Spend') }}
            </h3>
            <div v-if="isLoading" class="o-lteeDollarBalance__loading">
                <a-loading-spinner size="sm" :visible="true" />
            </div>
            <div v-else class="o-lteeDollarBalance__content">
                <span v-if="lteEarningsData.Balances" class="o-lteeDollarBalance__amount" :class="{'-bold': !isCn}">
                    {{ lteEarningsData.Balances.FormattedAvailableToSpend }}
                </span>
                <div class="o-lteeDollarBalance__tooltip">
                    <m-tooltip
                        v-if="labels.AvailableToSpend.Tooltip"
                        tooltip-icon="info"
                    >
                        <div v-html="labels.AvailableToSpend.Tooltip"></div>
                    </m-tooltip>
                </div>
            </div>
        </li>
        <li v-if="!isCn && showDollarsToActivate" class="o-lteeDollarBalance__item">
            <h3 class="o-lteeDollarBalance__title">
                {{ getLocalizationProp('Labels.DollarsToActivate.Text', 'Dollars to Activate') }}
            </h3>
            <div v-if="isLoading" class="o-lteeDollarBalance__loading">
                <a-loading-spinner size="sm" :visible="true" />
            </div>
            <div v-else class="o-lteeDollarBalance__content">
                <span v-if="lteEarningsData.Balances" class="o-lteeDollarBalance__amount">
                    {{ lteEarningsData.Balances.FormattedDollarsToActivate }}
                </span>
                <div class="o-lteeDollarBalance__tooltip">
                    <m-tooltip
                        v-if="labels.DollarsToActivate.Tooltip"
                        tooltip-icon="info"
                    >
                        <div v-html="labels.DollarsToActivate.Tooltip"></div>
                    </m-tooltip>
                </div>
            </div>
        </li>
        <li v-if="labels.EarnedLastMonth" class="o-lteeDollarBalance__item">
            <h3 class="o-lteeDollarBalance__title">
                {{ getLocalizationProp('Labels.EarnedLastMonth.Text', 'Earned Last Month') }}
            </h3>
            <div v-if="isLoading" class="o-lteeDollarBalance__loading">
                <a-loading-spinner size="sm" :visible="true" />
            </div>
            <div v-else class="o-lteeDollarBalance__content">
                <span v-if="lteEarningsData.Balances" class="o-lteeDollarBalance__amount">
                    {{ lteEarningsData.Balances.FormattedEarnedLastMonth }}
                </span>
                <div class="o-lteeDollarBalance__tooltip">
                    <m-tooltip
                        v-if="labels.EarnedLastMonth.Tooltip"
                        tooltip-icon="info"
                    >
                        <div v-html="labels.EarnedLastMonth.Tooltip"></div>
                    </m-tooltip>
                </div>
            </div>
        </li>
        <li v-if="labels.LifeTimeEarnings" class="o-lteeDollarBalance__item">
            <h3 class="o-lteeDollarBalance__title">
                {{ getLocalizationProp('Labels.LifeTimeEarnings.Text', 'Lifetime Earned') }}
            </h3>
            <div v-if="isLoading" class="o-lteeDollarBalance__loading">
                <a-loading-spinner size="sm" :visible="true" />
            </div>
            <div v-else class="o-lteeDollarBalance__content">
                <span v-if="lteEarningsData.Balances" class="o-lteeDollarBalance__amount">
                    {{ lteEarningsData.Balances.FormattedLifeTimeEarnings }}
                </span>
                <div class="o-lteeDollarBalance__tooltip">
                    <m-tooltip
                        v-if="labels.LifeTimeEarnings.Tooltip"
                        tooltip-icon="info"
                    >
                        <div v-html="labels.LifeTimeEarnings.Tooltip"></div>
                    </m-tooltip>
                </div>
            </div>
        </li>
        <template v-if="!isCn">
            <li v-for="(item, index) in lteEarningsData.LsdExpiration" :key="index" class="o-lteeDollarBalance__item">
                <h3 class="o-lteeDollarBalance__title">
                    {{ getLocalizationProp('Labels.Expires.Text', 'Expires') }} {{ item.FormattedDate }}
                </h3>
                <div v-if="isLoading" class="o-lteeDollarBalance__loading">
                    <a-loading-spinner size="sm" :visible="true" />
                </div>
                <div v-else class="o-lteeDollarBalance__content">
                    <div>
                        <span class="o-lteeDollarBalance__amount">
                            {{ item.FormattedAmount }}
                        </span>
                        <div class="o-lteeDollarBalance__tooltip">
                            <m-tooltip
                                v-if="labels.LifeTimeEarnings.Tooltip"
                                tooltip-icon="info"
                            >
                                <div v-html="labels.LifeTimeEarnings.Tooltip"></div>
                            </m-tooltip>
                        </div>
                    </div>
                </div>
            </li>
        </template>

    </ul>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';
    export default {
        name: 'OLteeDollarBalance',
        mixins: [ localizationMixin ],
        data() {
            return {
                labels: []
            };
        },
        computed: {
            ...mapState('lteEarnings', ['storeLoaded', 'isLoading', 'lteEarningsData']),
            ...mapState('lsd', ['lsdDetails']),

            showDollarsToActivate() {
                const isGrandfatherd = this.getLocalizationProp('Data.IsGrandfatherd');
                if(this.lteEarningsData?.Balances?.DollarsToActivate > 0 && !this.lsdDetails?.HideDollarsToActivate) {
                    return !isGrandfatherd && this.labels.DollarsToActivate && this.lteEarningsData?.Balances && this.lteEarningsData?.Balances?.CanActivateLsd;
                } else {
                    return false;
                }
            },

            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        mounted() {
            this.labels = this.getLocalizationProp('Labels');
            if(!this.storeLoaded) this.getData();
        },

        methods: {
            ...mapActions('lteEarnings', ['getData'])
        }
    };
</script>

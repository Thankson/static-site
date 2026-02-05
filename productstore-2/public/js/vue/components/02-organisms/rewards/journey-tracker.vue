<template>
    <div class="o-journeyTracker">
        <div class="o-journeyTracker__wrapper -status">
            <div class="o-journeyTracker__icon"><img :src="getLocalizationProp('Data.Icon.Url')" :alt="getLocalizationProp('Data.Icon.Alt', '')" /></div>
            <div v-if="apiData && apiData.CurrentStatus" class="o-journeyTracker__member">{{ apiData.CurrentStatus }}</div>
            <div class="text-sm pt-6 leading-base">{{ getLocalizationProp('Labels.LsdBalance', 'Loyalty Shopping Dollar Balance') }} </div>
            <div v-if="lsdDetails && lsdDetails.LsdBalance" class="text-2xl-2 font-bold">{{ lsdDetails.LsdBalance }}</div>
        </div>
        <div v-if="!hideJourneyComponent" class="o-journeyTracker__wrapper -progress">
            <div v-if="apiData && apiData.NextLVIPStatus" class="o-journeyTracker__achieve">
                {{ replaceTokenArray(getLocalizationProp('Labels.AchieveStatus', 'To Achieve {0} status'), [apiData.NextLVIPStatus]) }}
            </div>
            <div v-else class="o-journeyTracker__achieve">
                {{ getLocalizationProp('Labels.ShopAtMessage', 'Shop At') }}
            </div>
            <div class="o-journeyTracker__requirements">
                {{ requirementText }}
            </div>
            <div class="o-journeyTracker__circles">
                <a-reward-circle
                    v-for="index in rewardSlots"
                    :key="index"
                    :is-filled="index <= rewardSlots - parseInt(apiData.MonthToReachNextLVIPStatus)"
                />
            </div>
        </div>
        <div v-if="apiData" class="o-journeyTracker__wrapper -pills">
            <div v-if="showDollarsToActivate" class="o-journeyTracker__pill">{{ getLocalizationProp('Labels.DollarsToActivate', 'Dollars to Activate:') }} {{ lsdDetails.LsdAvailableToUnlock }}</div>
            <div class="o-journeyTracker__pill">{{ getLocalizationProp('Labels.ExpiringThisMonth', 'Expiring This Month:') }} {{ lsdDetails.LsdExpiringInCurrentMonth }}</div>
            <div class="o-journeyTracker__pill">{{ getLocalizationProp('Labels.LifetimeEarnings', 'Lifetime Earnings:') }} {{ lsdDetails.LifetimeLoyaltyDollarsEarned }}</div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import aRewardCircle from '../../00-atoms/reward/reward-circle.vue';
    import api from '@api/routes/rewards/journeytracker';
    import { mapActions, mapState } from 'vuex';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OJourneyTracker',
        components: {
            aRewardCircle
        },
        mixins: [localizationMixin],
        data() {
            return {
                apiData: {}
            };
        },
        computed: {
            ...mapState('lsd', ['lsdDetails']),
            hideJourneyComponent() {
                return this.localization.Data?.HideNLP2 || false;
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            requirementText() {
                let commitmentPoints = this.hidePoints
                    ? `${this.localization.Data?.CurrencySymbol}${this.apiData?.NextStatusCommitment}`
                    : this.apiData?.NextStatusCommitment;
                if(this.apiData?.MonthToReachNextLVIPStatus <= 1) {
                    return replaceTokenArray(this.localization?.Labels?.MonthAchieveStatus, [commitmentPoints]);
                }
                return replaceTokenArray(this.localization?.Labels?.ShopAtWithMonthsMessage, [commitmentPoints, this.apiData?.MonthToReachNextLVIPStatus ]);
            },
            rewardSlots() {
                return 3;
            },
            showDollarsToActivate() {
                if(this.lsdDetails?.LsdAvailableToUnlockRaw === 0 && this.localization.Data?.HideDollarstoActivateIfZero) {
                    return false;
                }
                return !this.lsdDetails?.HideDollarsToActivate;
            }
        },
        mounted() {
            this.getJourneyTrackerData();
            this.getLsdApiData();
        },
        methods: {
            ...mapActions('lsd', ['getLsdApiData']),
            replaceTokenArray,
            async getJourneyTrackerData() {
                const response = await api.get();
                if(response.success && response.data?.Success) {
                    this.apiData = response.data?.Data;
                }
            }

        }
    };
</script>

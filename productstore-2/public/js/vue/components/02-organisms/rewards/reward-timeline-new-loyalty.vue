<template>
    <div class="o-rwTlineNewLoyalty">
        <div v-show="souLoading">
            <a-loading-spinner :visible="true" />
        </div>
        <div v-show="!souLoading && Object.keys(souData).length !== 0">
            <div class="o-rwTlineNewLoyalty__tracker">
                <div class="o-rwTlineNewLoyalty__wrapper">
                    <div class="o-rwTlineNewLoyalty__shell">
                        <div
                            ref="progress-bar" class="o-rwTlineNewLoyalty__bar"
                            :style="{ width: progress + '%' }">
                        </div>
                    </div>
                    <div class="o-rwTlineNewLoyalty__markers">
                        <div class="o-rwTlineNewLoyalty__timeline">
                            <div v-for="marker in mileStones" :key="marker.Milestone">
                                <span
                                    v-show="!marker.HideCheckbox"
                                    :class="[nodeShape, isProgressCurrentMilestoneOrUnder(marker) ?
                                        'border-none' : 'border-solid']"
                                    :style="nodeStyle(marker)"
                                    class="o-rwTlineNewLoyalty__mark">
                                    <span v-if="currencySymbol && !shouldSuffixCurrencySymbol">
                                        {{ currencySymbol }}
                                    </span>
                                    {{ marker.Milestone }}
                                    <span v-if="currencySymbol && shouldSuffixCurrencySymbol">
                                        {{ currencySymbol }}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p class="leading-tight text-sm text-gray-150 pb-10">{{ shippingOnUsTitle }}</p>
            <!-- List of messages on New Loyalty Program -->
            <ul>
                <li v-for="message in messages" :key="message.Type" class="mb-10">
                    <div class="leading-tight text-sm text-gray-150" v-html="message.Details"></div>
                    <m-read-more
                        v-if="message.Details && message.MoreDetails"
                        :less-label="lessLabel"
                        :more-label="moreLabel"
                        more-class-mods="underline uppercase font-bold text-green text-sm"
                        less-class-mods="underline uppercase font-bold text-green text-sm block mt-18 mb-5"
                    >
                        <template v-slot:description>
                            <div class="mt-5 leading-tight text-sm text-gray-150" v-html="message.MoreDetails">
                            </div>
                            <a
                                v-if="souData.ShippingOnUsLink && souData.ShippingOnUsLink.Url && message.Type === 'SHIPPING'"
                                class="m-shippingOnUs__link"
                                :href="souData.ShippingOnUsLink.Url">
                                {{ souData.ShippingOnUsLink.Text }}
                            </a>
                        </template>
                    </m-read-more>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    const SHIPPING = 'SHIPPING';

    export default {
        name: 'ORewardTimeline',
        props: {
            lessLabel: {
                type: String,
                default: 'Less'
            },
            moreLabel: {
                type: String,
                default: 'More'
            },
            setMessagePriority: {
                type: Boolean,
                default: true
            },
            shippingOnUsTitle: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                progress: 0
            };
        },
        computed: {
            ...mapState('shippingOnUsV2', ['activeMilestone', 'souData', 'souLoading']),
            currentMilestone() {
                return parseInt(this.souData?.CurrentMilestone) || 0;
            },
            currencySymbol() {
                return this.souData?.CurrencySymbol || '';
            },
            barGradienceEndColor() {
                return this.souData?.BarGradienceEndColor;
            },
            barGradienceStartColor() {
                return this.souData?.BarGradienceStartColor || this.souData?.BarGradienceEndColor;
            },
            messages() {
                return this.createOrderOfMessaging();
            },
            mileStones() {
                return this.souData?.Milestones;
            },
            nodeShape() {
                return this.souData?.NodeShape || '-square';
            },
            nodeTextColor() {
                return this.souData?.NodeTextColor || '#ffffff';
            },
            shouldSuffixCurrencySymbol() {
                return this.souData?.ShouldSuffixCurrencySymbol;
            },
            showMileStone() {
                return !this.souData?.HideCheckbox;
            }
        },
        watch: {
            currentMilestone() {
                this.calculateBarProgress();
            }
        },
        mounted() {
            this.calculateBarProgress();
        },
        methods: {
            calculateBarProgress() {
                if(this.mileStones.length > 1) {
                    const milestoneValues = this.mileStones.map(milestone => parseInt(milestone.Milestone));

                    // Find the two closest milestones to the current progress(this.currentMilestone)
                    let lowerIndex = 0;
                    let upperIndex = 1;

                    milestoneValues.forEach((value, i) => {
                        if(value <= this.currentMilestone) {
                            lowerIndex = i;
                            upperIndex = (this.mileStones.length - 1 === i) ? i : i + 1;
                        }
                    });

                    const lowerMilestone = milestoneValues[lowerIndex];
                    const upperMilestone = milestoneValues[upperIndex];

                    // Calculate the percentage completed on the bar based on the current progress
                    let percentageCompleted = 0;
                    // If the current progress is the last milestone, set the percentage to 100
                    if(upperIndex === this.mileStones.length - 1 && this.currentMilestone >= upperMilestone) {
                        percentageCompleted = 100;
                    } else {
                        percentageCompleted = lowerMilestone === this.currentMilestone
                            ? lowerIndex / (milestoneValues.length - 1) * 100
                            : (lowerIndex + (this.currentMilestone - lowerMilestone) / (upperMilestone - lowerMilestone)) / (milestoneValues.length - 1) * 100;
                    }
                    this.progress = percentageCompleted;

                    // Set the bar gradience colors
                    this.$refs['progress-bar'].style.setProperty('--barGradienceStartColor', this.barGradienceStartColor);
                    this.$refs['progress-bar'].style.setProperty('--barGradienceEndColor', this.barGradienceEndColor);
                }
            },
            // Set order of message - Reward message vs Shipping message
            // Default order is 'Reward' first, 'Shipping' second
            createOrderOfMessaging() {
                const isShippingMessageFirst = this.souData?.OrderOfLoyaltyMessage[0]?.toUpperCase() === SHIPPING;

                const rewardMessage = {
                    Type: 'REWARD',
                    Details: this.activeMilestone?.VIPDetails,
                    MoreDetails: this.activeMilestone?.VIPMoreDetails
                };

                const shippingMessage = {
                    Type: 'SHIPPING',
                    Details: this.souData?.SUODetails,
                    MoreDetails: this.souData?.SUOMoreDetails
                };
                // On cart: no need to set priorirty, show reward message only
                if(this.setMessagePriority) {
                    let messages = isShippingMessageFirst
                        ? [shippingMessage, rewardMessage]
                        : [rewardMessage, shippingMessage];
                    return messages;
                } return [rewardMessage];
            },
            isProgressCurrentMilestoneOrUnder(marker) {
                return marker.Milestone <= this.currentMilestone;
            },
            nodeStyle(marker) {
                return {
                    backgroundColor: this.isProgressCurrentMilestoneOrUnder(marker)
                        ? this.barGradienceEndColor : '#ffffff',
                    color: this.isProgressCurrentMilestoneOrUnder(marker)
                        ? this.nodeTextColor : '#757575'
                };
            }
        }
    };
</script>

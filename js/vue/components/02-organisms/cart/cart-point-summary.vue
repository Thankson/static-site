<template>
    <div class="o-cartPointSum" :class="{'-isCn' : isCn}">
        <p class="o-cartPointSum__title" :class="{'text-gray': hidePoints && !isCn}">
            {{ isCn ? mtdProductTotalCn : labels.MTDProductPointsTotal }} <button v-if="showMoreToggle" class="o-cartPointSum__link" :aria-expanded="String(isOpen)" @click="toggleCollapse">{{ toggleText }}</button>
        </p>
        <div v-if="!isCn" v-show="isOpen" class="o-cartPointSum">
            <h2 class="o-cartPointSum__header">{{ labels.MTDPointSummary }}</h2>
            <ul class="o-cartPointSum__list">
                <li role="text" class="o-cartPointSum__listItem">
                    <span class="o-cartPointSum__title">{{ labels.MTDCurrentOrder }}</span>
                    <span class="o-cartPointSum__desc">{{ earnedPoints }} {{ labels.Points }}</span>
                </li>
                <li v-if="previousOrderPoints > 0" role="text" class="o-cartPointSum__listItem">
                    <span class="o-cartPointSum__title">{{ labels.MTDPreviousOrder }}</span>
                    <span class="o-cartPointSum__desc">{{ previousOrderPoints }} {{ labels.Points }} </span>
                </li>
                <li v-if="memberServicesPoints > 0" role="text" class="o-cartPointSum__listItem">
                    <span class="o-cartPointSum__title">{{ labels.MemberServices }} {{ hasMaxServicePoints ? labels.MemberServicesMaxPoints : '' }} </span>
                    <span class="o-cartPointSum__desc">{{ memberServicesPoints }} {{ labels.Points }} </span>
                </li>

            </ul>
        </div>
        <div v-if="!isCn" :aria-label="progressAriaLabel" class="o-cartPointSum__progress">
            <div class="o-cartPointSum__wrapper">
                <div class="o-cartPointSum__barWrapper">
                    <div class="o-cartPointSum__barGrey"></div>
                    <div class="o-cartPointSum__barGreenWrapper">
                        <div class="o-cartPointSum__barGreen" :style="{width: complete + '%'}"></div>
                    </div>
                    <span class="o-cartPointSum__circle" :class="{'-isUsePrice' : showCurrencyFormattedPoints}" :style="{transform: circleComplete > 20 ? 'translateX(-50%)' : '', left: circleComplete + '%'}">{{ getPoints }}</span>

                </div>

            </div>
            <div class="o-cartPointSum__offers">
                <p class="o-cartPointSum__text" v-html="labels.MTDSpecialOffers"></p>
            </div>
        </div>
        <div v-if="isCn" :aria-label="progressAriaLabel" class="o-cartPointSum__progress -isCn">
            <div class="o-cartPointSum__wrapper">
                <div class="o-cartPointSum__barWrapper">
                    <div class="o-cartPointSum__barGrey"></div>
                    <div class="o-cartPointSum__barGreenWrapper">
                        <div class="o-cartPointSum__barGreen" :style="{width: completePriceOrPoint + '%'}"></div>
                    </div>
                    <span class="o-cartPointSum__circle -isCn" :style="{transform: circleCompletePriceOrPoint > 20 ? 'translateX(-50%)' : '', left: circleCompletePriceOrPoint + '%'}">{{ enablePointsProgressBar ? totalPoint : totalPrice }}</span>
                </div>
            </div>
            <div class="o-cartPointSum__offers -isCn">
                <img :src="priceLabels.LvipGoldIcon" class="o-cartPointSum__lvip-gold-icon" />
            </div>
        </div>
        <div v-if="isCn" :aria-label="progressAriaLabel" class="o-cartPointSum__progress -isCn">
            <div class="o-cartPointSum__wrapper">
                <div class="o-cartPointSum__barWrapper">
                    <span v-if="!enablePointsProgressBar && isShowCustomerCommitment" class="o-cartPointSum__circle -value -isCn" :style="{transform: circleBase > 20 ? 'translateX(-50%)' : '', left: 'calc(' + circleBase + '% - 32px)'}">
                        {{ customerCommitment }}
                        <m-tooltip tooltip-icon="help" tooltip-icon-size="xs">
                            <div v-html="priceLabels.CommitmentTips"></div>
                        </m-tooltip>
                    </span>
                    <span class="o-cartPointSum__circle -value -isCn cursor-pointer whitespace-no-wrap" style="left: calc(100% - 28px)" @click="() => $emit('lvipPopupModal')">
                        {{ enablePointsProgressBar ? maxPointLabel : maxPrice }}
                        <m-tooltip tooltip-icon="help" tooltip-icon-size="xs" :disable-tooltip="isCn">
                            <div v-html="enablePointsProgressBar ? lvipPopup : priceLabels.LvipTips"></div>
                        </m-tooltip>
                    </span>
                </div>
            </div>
        </div>
        <div v-if="isCn" class="o-cartPointSum__tips">
            <p class="o-cartPointSum__tipsContent">{{ showCommitmentTips }}</p>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        name: 'OCartPointSummary',
        props: {
            ariaLabelProgress: {
                type: String,
                default: 'You have earned {0} out of {1} Points'
            },
            currencyFormattedPoints: {
                type: String,
                default: ''
            },
            earnedPoints: {
                type: Number,
                default: 23
            },
            enablePointsProgressBar: {
                type: Boolean,
                default: false
            },
            hasMaxServicePoints: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            maxPoints: {
                type: Number,
                default: 35
            },
            memberServicesPoints: {
                type: Number,
                default: 5
            },
            memberProductsPoints: {
                type: Number,
                default: 0
            },
            labels: {
                type: Object,
                default: () => {}
            },
            lvipPopup: {
                type: String,
                default: ''
            },
            previousOrderPoints: {
                type: Number,
                default: 16
            },
            priceLabels: {
                type: Object,
                default: () => {}
            },
            showCurrencyFormattedPoints: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isOpen: false,
                circleMax: 91,
                Position: 0
            };
        },
        computed: {
            ...mapState('cart', ['summary']),
            ...mapState('commitmentProfile', ['commitmentProfile']),

            totalPoints() {
                return Math.round(this.earnedPoints + this.previousOrderPoints + this.memberServicesPoints);
            },
            complete() {
                let newPosition = Math.round((this.totalPoints / this.maxPoints) * 100);
                if(this.totalPoints >= this.maxPoints) {
                    // Max out the positioning at 100%
                    return Math.min(newPosition, 100);
                } else if(newPosition < 0) {
                    return Math.max(newPosition, 0);
                } else {
                    return newPosition;
                }
            },
            circleBase() {
                let newPosition = Math.round((this.customerCommitment / this.maxPrice) * 100);
                newPosition = this.remap(newPosition, 0, 100, 0, 100);
                if(this.totalPrice >= this.maxPrice) {
                    // Max out the positioning at 100%
                    return Math.min(newPosition, 100);
                } else if(newPosition < 0) {
                    return Math.max(newPosition, 0);
                } else {
                    return newPosition;
                }
            },
            circleComplete() {
                let newPosition = Math.round((this.totalPoints / this.maxPoints) * 100);
                newPosition = this.remap(newPosition, 0, 100, 0, 100);
                if(this.totalPoints >= this.maxPoints) {
                    // Max out the positioning at 100%
                    return Math.min(newPosition, 100);
                } else if(newPosition < 0) {
                    return Math.max(newPosition, 0);
                } else {
                    return newPosition;
                }
            },
            circle() {
                if(this.Position === 100) {
                    // Max out the circle at circle max
                    return this.circleMax;
                } else if(this.Position < 100 && this.Position >= 86) {
                    return this.circleMax - 5;
                } else {
                    // Return normal positioning
                    return this.Position;
                }
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            mtdProductTotalCn() {
                return this.enablePointsProgressBar ? this.labels.MTDPointSummary : this.priceLabels.MTDProductPricesTotal;
            },
            progressAriaLabel() {
                return this.ariaLabelProgress.replace('{0}', this.totalPoints).replace('{1}', this.maxPoints);
            },
            showCommitmentTips() {
                const text = this.labels.commitmentRequiredTips;
                return this.maxPoints - this.earnedPoints - this.memberServicesPoints - this.memberProductsPoints > 0 && text ? text.replace('{0}', this.maxPoints - this.earnedPoints - this.memberServicesPoints - this.memberProductsPoints) : null;
            },
            showMoreToggle() {
                return !this.hidePoints && !this.isCn;
            },
            toggleText() {
                return this.isOpen ? this.labels.Less : this.labels.More;
            },
            totalPrice() {
                return this.commitmentProfile?.MonthToDateCommitment + this.summary?.TotalCommitmentAmount;
            },
            totalPoint() {
                return this.commitmentProfile?.PaidMonthToDatePoints + this.summary?.Points;
            },
            customerCommitment() {
                return this.commitmentProfile?.Restrictions?.ReActivationIncomplete ? 370 : (this.commitmentProfile ? this.commitmentProfile?.CustomerCommitment : 370);
            },
            maxPrice() {
                return this.commitmentProfile?.Restrictions?.ReActivationIncomplete ? 550 : (this.commitmentProfile ? this.commitmentProfile?.LvipCommitment : 550);
            },
            completePriceOrPoint() {
                const totalPriceOrPoint = this.enablePointsProgressBar ? this.totalPoint : this.totalPrice;
                const maxPriceOrPoint = this.enablePointsProgressBar ? this.commitmentProfile.VipStatusPoints : this.maxPrice;
                let newPosition = Math.round((totalPriceOrPoint / maxPriceOrPoint) * 100);
                if(totalPriceOrPoint >= maxPriceOrPoint) {
                    // Max out the positioning at 100%
                    return Math.min(newPosition, 100);
                } else if(newPosition < 0) {
                    return Math.max(newPosition, 0);
                } else {
                    return newPosition;
                }
            },
            circleCompletePriceOrPoint() {
                const totalPriceOrPoint = this.enablePointsProgressBar ? this.totalPoint : this.totalPrice;
                const maxPriceOrPoint = this.enablePointsProgressBar ? this.commitmentProfile.VipStatusPoints : this.maxPrice;
                let newPosition = Math.round((totalPriceOrPoint / maxPriceOrPoint) * 100);
                newPosition = this.remap(newPosition, 0, 100, 0, 100);
                if(totalPriceOrPoint >= maxPriceOrPoint) {
                    // Max out the positioning at 100%
                    return Math.min(newPosition, 100);
                } else if(newPosition < 0) {
                    return Math.max(newPosition, 0);
                } else {
                    return newPosition;
                }
            },
            isLvip() {
                return this.commitmentProfile?.CustomerLVIPStatus !== null;
            },
            isShowCustomerCommitment() {
                return this.commitmentProfile?.Restrictions?.ReActivationIncomplete ? true : (this.commitmentProfile?.CustomerCommitment !== this.commitmentProfile?.LvipCommitment);
            },
            maxPointLabel() {
                return `${this.commitmentProfile.VipStatusPoints}${this.labels.Points}`;
            },
            getPoints() {
                return this.showCurrencyFormattedPoints ? this.currencyFormattedPoints : this.totalPoints;
            }
        },
        methods: {
            remap(x, inMin, inMax, outMin, outMax) {
                return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
            },
            toggleCollapse() {
                this.isOpen = !this.isOpen;
            }
        }
    };
</script>

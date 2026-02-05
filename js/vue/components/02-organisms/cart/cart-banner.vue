<template>
    <div>
        <div v-for="(item, index) in rteArray" :key="index" v-html="item"></div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        name: 'OCartBanner',
        props: {
            banner: {
                type: Object,
                default: () => {}
            },
            summary: {
                type: Object,
                default: () => {}
            },
            isCheckout: {
                type: Boolean,
                default: false
            },
            shippingFee: {
                type: Object,
                default: () => {}
            },
            isPreferred: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                rteArray: []
            };
        },
        computed: {
            ...mapState('commitmentProfile', ['commitmentProfile']),

            totalCommitmentMTD() {
                return this.commitmentProfile?.MonthToDateCommitment + this.summary?.TotalCommitmentAmount;
            },
            totalPointsMTD() {
                return this.commitmentProfile?.PaidMonthToDatePoints + this.summary?.Points;
            },
            customerCommitment() {
                return this.commitmentProfile?.Restrictions?.ReActivationIncomplete ? 370 : (this.commitmentProfile ? this.commitmentProfile?.CustomerCommitment : 370);
            },
            isLvip() {
                return this.commitmentProfile?.CustomerLVIPStatus !== null;
            },
            isSpecialDirectUser() {
                return this.commitmentProfile?.Restrictions?.OnNewPreferredEnrollmentHold || this.commitmentProfile?.Restrictions?.ReActivationIncomplete;
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            }
        },
        watch: {
            commitmentProfile: {
                handler() {
                    this.rteArray = [];
                    this.checkConditions();
                },
                immediate: true
            }
        },
        methods: {
            checkConditions() {
                if(!this.hidePoints) {
                    // Not reached commitment
                    if(this.totalCommitmentMTD >= 0 && this.totalCommitmentMTD < this.customerCommitment && (this.isPreferred || this.isSpecialDirectUser)) {
                        let commitmentAway = this.customerCommitment - this.totalCommitmentMTD;
                        let NotReachedCommitmentRte = this.banner?.NotReachedCommitment.RTEContent.replace('{0}', commitmentAway);
                        this.rteArray.push(NotReachedCommitmentRte);
                        return;
                    }

                    // Not reach to VIP status points
                    if(this.totalPointsMTD < this.commitmentProfile.VipStatusPoints && this.isPreferred) {
                        if(!this.isLvip) {
                            // Not qualified LVIP Gold
                            let vipStatusPointsAway = this.commitmentProfile.VipStatusPoints - this.totalPointsMTD;
                            let notQualifiedLvipRte = this.banner?.NotQualifiedLvip.RTEContent.replace('{0}', vipStatusPointsAway);
                            this.rteArray.push(notQualifiedLvipRte);
                        } else {
                            // Not able to maintain LVIP status
                            let vipStatusPointsAway = this.commitmentProfile.VipStatusPoints - this.totalPointsMTD;
                            let notMaintainLvipRte = this.banner?.NotMaintainLvip.RTEContent.replace('{0}', vipStatusPointsAway);
                            this.rteArray.push(notMaintainLvipRte);
                        }
                    }
                } else {
                    // Compared with the shipping fee in checkout
                    const checkoutItemTotalPrice = Number(this.summary?.CartGrossTotal || 0) - Number(this.summary?.LoyaltyShoppingDollars?.Used || 0) + Number(this.summary?.LsdRedemptionFee?.Price || 0);

                    // Not reached commitment
                    if(this.customerCommitment !== 550 && this.totalCommitmentMTD >= 0 && this.totalCommitmentMTD < this.customerCommitment && (this.isPreferred || this.isSpecialDirectUser)) {
                        this.rteArray.push(this.banner?.NotReachedCommitment.RTEContent);
                    }
                    // Not reached commitment and not able to qualifed for LVIP
                    if(!this.isLvip && this.customerCommitment === this.commitmentProfile.LvipCommitment && this.totalCommitmentMTD < this.commitmentProfile.LvipCommitment && (this.isPreferred || this.isSpecialDirectUser)) {
                        this.rteArray.push(this.banner?.NRCAndNQL.RTEContent);
                    }
                    // Not reached commitment and not able to maintain LVIP
                    if(this.isLvip && this.customerCommitment === this.commitmentProfile.LvipCommitment && this.totalCommitmentMTD < this.commitmentProfile.LvipCommitment && this.isPreferred) {
                        this.rteArray.push(this.banner?.NRCAndNML.RTEContent);
                    }
                    // Not qualified LVIP Gold
                    if(!this.isLvip && this.totalCommitmentMTD >= this.customerCommitment && this.totalCommitmentMTD < this.commitmentProfile.LvipCommitment && this.isPreferred) {
                        this.rteArray.push(this.banner?.NotQualifiedLvip.RTEContent);
                    }
                    // Not able to maintain LVIP status
                    if(this.isLvip && this.totalCommitmentMTD >= this.customerCommitment && this.totalCommitmentMTD < this.commitmentProfile.CustomerLVIPCommitment && this.isPreferred) {
                        this.rteArray.push(this.banner?.NotMaintainLvip.RTEContent);
                    }
                    // Not qualified shipping fee
                    if(this.isCheckout) {
                        if(checkoutItemTotalPrice >= 0 && checkoutItemTotalPrice < this.shippingFee?.Value && (this.isPreferred || this.isSpecialDirectUser)) {
                            this.rteArray.push(this.banner?.NotQualifiedShippingFee.RTEContent);
                        }
                    } else {
                        if(this.summary?.CartNetTotal >= 0 && this.summary?.CartNetTotal < this.shippingFee?.Value && (this.isPreferred || this.isSpecialDirectUser)) {
                            this.rteArray.push(this.banner?.NotQualifiedShippingFee.RTEContent);
                        }
                    }
                    // Shipping fee refund
                    if(checkoutItemTotalPrice >= this.shippingFee?.Value && this.isCheckout && (this.isPreferred || this.isSpecialDirectUser)) {
                        this.rteArray.push(this.banner?.ShippingFeeRefund.RTEContent);
                    }
                }
            }
        }
    };
</script>

<template>
    <div class="o-couponCards">
        <ul class="o-couponCards__list">
            <li
                v-for="(item, index) in combinedCouponsAndAds"
                :key="uniqid(index)"
                class="o-couponCards__listItem"
            >
                <m-coupon-card
                    v-if="item.type !== 'ad'"
                    :coupon="item"
                    :coupon-price="couponPrice"
                    :days="days"
                    :footnote="footnote"
                    :is-coupons-email-reminder-enabled="isCouponsEmailReminderEnabled"
                    :limit-reached="limitReached"
                    :member-price="memberPrice"
                    :modal-description="modalDescription"
                    :modal-title="modalTitle"
                    :points="points"
                    :redeem="redeem"
                    :save-text="saveText"
                    :select-date="selectDate"
                    :set-date-aria="setDateAria"
                    :set-date-text="setDateText"
                />
                <m-coupon-ad v-else :coupon-ad="item" />
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import uniqid from 'uniqid';

    export default {
        name: 'OCouponCards',
        props: {
            couponAds: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            couponPrice: {
                type: String,
                default: ''
            },
            days: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            footnote: {
                type: String,
                default: ''
            },
            isCouponsEmailReminderEnabled: {
                type: Boolean,
                default: false
            },
            limitReached: {
                type: String,
                default: ''
            },
            memberPrice: {
                type: String,
                default: ''
            },
            modalDescription: {
                type: String,
                default: ''
            },
            modalTitle: {
                type: String,
                default: ''
            },
            points: {
                type: String,
                default: ''
            },
            redeem: {
                type: String,
                default: ''
            },
            saveText: {
                type: String,
                default: ''
            },
            selectDate: {
                type: String,
                default: ''
            },
            setDateAria: {
                type: String,
                default: ''
            },
            setDateText: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                combinedCouponsAndAds: []
            };
        },
        computed: {
            ...mapState('coupon', ['coupons']),

            hasCouponAds() {
                return this.couponAds && this.couponAds.length > 0;
            }
        },
        watch: {
            coupons() {
                this.combinedCouponsAndAds = this.createCombinedAdsAndCoupons();
            }
        },
        methods: {
            // Combine the coupons and ads into a single array
            createCombinedAdsAndCoupons() {
                const combined = [...this.coupons]; // Create a copy of the coupons array
                const ads = this.couponAds || []; // Use an empty array if couponAds is undefined

                ads.forEach(ad => {
                    const position = ad.Position - 1; // Adjust position to 0-based index
                    if(position >= 0 && position <= combined.length) {
                        combined.splice(position, 0, { type: 'ad', ...ad });
                    } else if(position > combined.length) {
                        combined.push({ type: 'ad', ...ad });
                    }
                });
                return combined;
            },
            uniqid(id) {
                return `${id}-${uniqid()}`;
            }
        }
    };
</script>

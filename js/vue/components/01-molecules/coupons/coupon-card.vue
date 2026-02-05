<template>
    <article class="m-couponCard">
        <header class="m-couponCard__row -description">
            <div class="m-couponCard__col -description">
                <em class="m-couponCard__title">{{ coupon.PromotionDisplayHeader }}</em>
                <p class="m-couponCard__text -description">{{ coupon.PromotionDisplayBody }}</p>
            </div>
            <div class="m-couponCard__col -product">
                <img v-if="coupon.ProductImage" class="m-couponCard__img" :src="coupon.ProductImage.Url" :alt="coupon.ProductImage.Alt">
            </div>
        </header>
        <div class="m-couponCard__row -price">
            <em class="m-couponCard__text -save">{{ replaceToken(saveText, coupon.FormattedSavings) }}</em>
            <div class="m-couponCard__container">
                <p class="m-couponCard__col -coupon">
                    <em class="m-couponCard__text -price">{{ coupon.FormattedCouponPrice }} |</em> {{ replaceToken(points, coupon.CouponPoints) }}
                    <span class="m-couponCard__text -subtext -coupon">{{ couponPrice }}</span>
                </p>
                <p class="m-couponCard__col -regular">
                    <span class="m-couponCard__text -oldPrice">{{ coupon.FormattedPreferredPrice }}</span>
                    <span class="m-couponCard__text -subtext -member">{{ memberPrice }}</span>
                </p>
            </div>
            <p class="m-couponCard__footnote"> {{ replaceToken(footnote, coupon.MaxQuantity) }}</p>
            <o-shelf-configurator
                v-if="(!isCouponsEmailReminderEnabled && coupon.CanRedeem) || (isCouponsEmailReminderEnabled && hasReminderDate && coupon.CanRedeem)"
                ref="coupon-shelf"
                class="a-button justify-center w-full text-base font-medium py-12"
                :aria-disabled="!coupon.CanRedeem"
                :button-label="buttonAriaLabel"
                :class="{ '-disabled': !coupon.CanRedeem} "
                :sku="`${coupon.Sku}`"
                :promotion-id="coupon.PromotionId"
                line-type="Promotion">
                {{ coupon.CanRedeem ? redeem : limitReached }}
            </o-shelf-configurator>
            <button
                v-else
                type="button"
                class="a-button justify-center w-full text-base font-medium py-12"
                :class="{ '-disabled': !coupon.CanRedeem} "
                :aria-label="buttonAriaLabel"
                :aria-disabled="!coupon.CanRedeem"
                @click="redeemCoupon"
            >
                {{ coupon.CanRedeem ? redeem : limitReached }}
            </button>
        </div>
        <o-coupon-modal
            :labels="labels"
            :open-modal="openModal"
            :reminder-days="days"
            @setReminderDate="setReminderDate"
            @closeModal="closeModal"
        ></o-coupon-modal>
    </article>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MCouponCard',
        props: {
            coupon: {
                type: Object,
                default: function() {
                    return {};
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
            buttonAriaLabel: {
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
            },
            isCouponsEmailReminderEnabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                openModal: false,
                labels: {
                    ModalTitle: this.modalTitle,
                    ModalText: this.modalDescription,
                    CtaText: this.setDateText,
                    SelectDate: this.selectDate
                }
            };
        },
        computed: {
            ...mapState('coupon', ['hasReminderDate'])
        },
        methods: {
            ...mapActions('coupon', ['setDate', 'getData']),

            clearReminderDate() {
                this.setDate(-1);
            },
            closeModal() {
                this.openModal = false;
            },
            redeemCoupon() {
                if(this.coupon.CanRedeem) {
                    this.openModal = true;
                }
            },
            setReminderDate: function(responseDay) {
                if(responseDay) {
                    this.showResponse = true;
                    this.$nextTick(() => {
                        this.$refs['coupon-shelf'].$el.click();
                    });
                }
            },
            replaceToken
        }
    };
</script>

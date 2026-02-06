<template>
    <div class="o-cartCoupons">
        <div class="o-cartCoupons__wrapper">
            <o-cart-accordion
                ref="accordion"
                :title="labels.DropdownText"
                :mask-class="accordionMaskClass"
                @show="showCoupons"
                @hide="showRedeem = false">

                <m-error-card
                    v-if="error"
                    mods="mb-25"
                    :reload-text="labels.RefreshPage"
                    :text="labels.GenericFailureMessage"
                />

                <div v-if="coupons && coupons.length > 0">

                    <o-cart-coupon-reminder
                        v-if="showReminderEmail"
                        ref="coupon-reminder"
                        :labels="labels.Reminder"
                        :reminder-days="reminderDays" />

                    <ul class="o-recentlyPurchased">
                        <li
                            v-for="product in redeemableCoupons"
                            :key="product.Sku"
                            class="o-recentlyPurchased__item">

                            <article class="m-recentProduct -cartCoupons">
                                <div
                                    v-if="product.ProductImage"
                                    class="m-recentProduct__wrapper">

                                    <img
                                        :src="product.ProductImage.Url"
                                        :alt="product.ProductImage.Alt"
                                        class="m-recentProduct__img" />
                                </div>

                                <div class="m-recentProduct__details">
                                    <h3 class="m-recentProduct__title">
                                        {{ getTitle(product.FormattedSavings) }}
                                    </h3>

                                    <p class="m-recentProduct__description">
                                        {{ product.PromotionDisplayHeader }}
                                    </p>

                                    <p class="m-recentProduct__description -limit">
                                        {{ getLimit(product.MaxQuantity) }}
                                    </p>
                                </div>

                                <div class="m-recentProduct__add">
                                    <p class="m-recentProduct__price -old">
                                        {{ product.FormattedPreferredPrice }}
                                    </p>

                                    <p class="m-recentProduct__price">
                                        <strong>{{ product.FormattedCouponPrice }}</strong>
                                    </p>

                                    <p v-if="userFlags.ViewPoints" class="m-recentProduct__points">{{ product.CouponPoints }} {{ labels.Points }}</p>

                                    <v-button
                                        v-if="showReminderEmail && !hasReminderDate"
                                        class="a-actionIcon -outline"
                                        @click="openReminderEmail">

                                        <a-icon size="inherit">add</a-icon>
                                        <a-icon size="inherit">shopping_cart</a-icon>
                                    </v-button>

                                    <o-shelf-configurator
                                        v-else
                                        :ref="product.Sku"
                                        class="m-shelfAccessory__btn -cartCoupon"
                                        :button-label="labels.AddToCartAriaLabel"
                                        :sku="product.Sku"
                                        line-type="Promotion"
                                        :promotion-id="product.PromotionId"
                                        :family-id="product.FamilyId">

                                        <a-icon size="inherit">add</a-icon>
                                        <a-icon size="inherit">shopping_cart</a-icon>
                                    </o-shelf-configurator>
                                </div>
                            </article>
                        </li>
                    </ul>
                </div>
            </o-cart-accordion>

            <div
                v-if="showRedeem && !error"
                class="o-cartCoupons__redeem">

                <form class="o-cartCoupons__form">
                    <label
                        class="o-cartCoupons__label"
                        for="fname"
                        v-html="labels.InputLabel" />

                    <div class="o-cartCoupons__col">
                        <input-basic
                            id="couponcode"
                            ref="CouponCode"
                            name="couponcode"
                            :value="couponCode"
                            :tailwind-mods="`${errorSubmit ? '-isInvalid': ''}`"
                            @keyup="errorSubmit = false"
                            @input="setValue($event)" />

                        <button
                            class="a-authorBtn text-center bg-green rounded -default px-32 ml-16 md:mr-32"
                            @click.stop.prevent="submit()">

                            {{ labels.ButtonText }}
                        </button>

                        <o-shelf-configurator
                            ref="hidden-coupon"
                            class="hidden"
                            line-type="Promotion"
                            :sku="hiddenCouponSku"
                            :promotion-id="hiddenCouponPromotionId"
                            :family-id="hiddenCouponFamilyId">
                        </o-shelf-configurator>
                    </div>

                    <em
                        v-if="errorSubmit"
                        class="o-cartCoupons__error">

                        {{ errorSubmit }}
                    </em>

                    <a-loading-spinner :visible="loading" size="sm" />
                </form>

                <a
                    :href="couponsLink.Url"
                    :target="couponsLink.Target"
                    class="o-cartCoupons__link">

                    {{ couponsLink.Text }}
                    <span class="material-icons" aria-hidden="true">chevron_right</span>
                </a>
            </div>
        </div>

        <modal
            id="cart-coupon"
            :heading-visible="false"
            width="370px">

            <template v-slot:body>
                <p>{{ modalText }}</p>
            </template>

            <template v-slot:footer>
                <button
                    class="a-button -medium"
                    @click="closeModal">

                    {{ labels.ButtonClose }}
                </button>
            </template>
        </modal>
    </div>
</template>

<script>
    import api from '@api/routes/coupons/redeem';
    import { mapActions, mapMutations, mapGetters, mapState } from 'vuex';

    export default {
        name: 'OCartCoupons',
        props: {
            couponsLink: {
                type: Object,
                default: () => ({})
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            accordionMaskClass: {
                type: String,
                default: null
            },
            reminderDays: {
                type: Array,
                default: () => ([])
            },
            showReminderEmail: {
                type: Boolean,
                default: false
            },
            userFlags: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                couponCode: '',
                errorSubmit: false,
                loading: false,
                modalText: '',
                showRedeem: false,
                hiddenCouponSku: null,
                hiddenCouponFamilyId: null,
                hiddenCouponPromotionId: null
            };
        },
        computed: {
            ...mapGetters('coupon', ['coupons', 'error']),
            ...mapState('coupon', ['hasReminderDate']),
            redeemableCoupons() {
                return this.coupons?.filter((coupon) => coupon.CanRedeem);
            }
        },
        async mounted() {
            this.$shelf.$on.hidden(() => {
                this.getData();
            });
            this.updateData();
        },
        methods: {
            ...mapActions('cart', ['getCoupons']),
            ...mapActions('coupon', ['getData']),
            ...mapGetters('cart', ['onCartRefresh']),
            ...mapMutations('coupon', ['REMOVE_COUPON']),

            closeModal() {
                this.$modal.hide();
            },
            getTitle: function (savings) {
                return this.labels.Save.replace('{0}', savings);
            },
            getLimit: function (limit) {
                return this.labels.Limit.replace('{0}', limit);
            },
            openReminderEmail: function() {
                this.$nextTick(() => this.$refs['coupon-reminder'].openReminder());
            },
            setValue: function(value) {
                this.couponCode = value;
            },
            showCoupons: function() {
                this.showRedeem = true;
                this.getData();

                // GTM
                this.gtmTrackAction({id: 229, text: this.labels.DropdownText}, {});
            },
            submit: async function() {
                if(this.loading) {
                    return;
                }
                if(!this.couponCode) {
                    this.errorSubmit = this.labels.EmptyField;
                    return;
                }
                this.loading = true;
                const response = await api.post({CouponCode: this.couponCode});
                if(response.data?.Success) {
                    // if the coupon is hidden open the shelf
                    if(response.data?.Data?.IsHidden) {
                        this.hiddenCouponSku = response.data?.Data.Sku;
                        this.hiddenCouponPromotionId = response.data?.Data.PromotionId;
                        this.hiddenCouponFamilyId = response.data?.Data.FamilyId;
                        this.$nextTick(() => {
                            this.$refs['hidden-coupon'].$el.click();
                        });
                    } else {
                        // if no coupon reminder date was set, show the popup
                        if(!this.hasReminderDate) {
                            this.openReminderEmail();
                        } else {
                            // click the add to cart button on the coupon card
                            this.$nextTick(() => this.$refs[response.data?.Data.Sku][0].$el.click());
                            this.$nextTick(() => this.REMOVE_COUPON(response.data?.Data.Sku));
                        }
                    }
                    this.couponCode = '';
                    this.loading = false;
                    return;
                }
                const error = response.data?.ErrorMessages ? response.data?.ErrorMessages[0] : {};
                if(error.ErrorData?.ShowModal) {
                    this.loading = false;
                    this.modalText = error.Translation;
                    this.$modal.show({id: 'cart-coupon'});
                    return;
                }
                this.errorSubmit = error.Translation;
                this.loading = false;
            },
            updateData() {
                this.onCartRefresh(this.getCoupons);
            }
        }
    };
</script>

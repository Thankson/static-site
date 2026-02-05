<template>
    <div class="m-shelfConfirm -cart" :class="{'-isCn' : isCn}">
        <h2 id="global-shelf-heading" class="m-shelfConfirm__heading -hasIcon">
            <span aria-hidden="true" class="a-icon o-shelfCart__icon material-icons -md">check</span>
            <span role="text">{{ headerText }}</span>
        </h2>

        <div class="m-shelfConfirm__summary">
            <div v-if="details.Image" class="m-shelfConfirm__imgWrapper">
                <img class="m-shelfConfirm__img" :alt="details.Image.Alt" :src="details.Image.Url" />
            </div>

            <div class="m-shelfConfirm__details">
                <component
                    :is="details.PdpUrl ? 'a' : 'p'"
                    id="cartProductName"
                    :href="details.PdpUrl || false"
                    class="m-shelfConfirm__product"
                    :class="details.PdpUrl ? '-link' : ''"
                    v-html="details.Title" />

                <ul class="m-shelfConfirm__list" aria-labelledby="cartProductName">
                    <li class="m-shelfConfirm__title">{{ getLocalizationProp('Labels.CartAdded.ItemPrice', 'Item Price:') }}</li>
                    <li class="m-shelfConfirm__desc">
                        <template v-if="isCn && isBogo">
                            {{ product.CouponPrice > 0 ? product.FormattedCouponPrice : itemPrice }}
                        </template>
                        <template v-else>
                            <template v-if="!isItemFromWelcomeProgram">{{ itemPrice }}</template>
                            <template v-else-if="!loading">{{ freeProductPrice }}</template>
                        </template>
                    </li>
                    <li v-if="!isFreeProduct && originalPricePerUnit && originalPricePerUnitMeasurementType">
                        <PricePerUnit
                            :price="originalPricePerUnit"
                            :unit="originalPricePerUnitMeasurementType"
                            :tailwind-mods="'text-xs text-gray'"
                        />
                    </li>
                    <li v-if="!isFreeProduct && concentratedPricePerUnit && concentratedPricePerUnitMeasurementType">
                        <PricePerUnit
                            :label="concentratedLabel"
                            :price="concentratedPricePerUnit"
                            :unit="concentratedPricePerUnitMeasurementType"
                            :tailwind-mods="'text-xs text-gray'"
                        />
                    </li>
                    <li v-if="!isFreeProduct && dilutedPricePerUnit && dilutedPricePerUnitMeasurementType">
                        <PricePerUnit
                            :label="dilutedLabel"
                            :price="dilutedPricePerUnit"
                            :unit="dilutedPricePerUnitMeasurementType"
                            :tailwind-mods="'text-xs text-gray'"
                        />
                    </li>
                    <template v-if="userFlags.ViewPoints">
                        <li class="m-shelfConfirm__title" v-html="getLocalizationProp('Labels.CartAdded.Points', 'Points:')"></li>
                        <li class="m-shelfConfirm__desc">
                            <template v-if="!isItemFromWelcomeProgram">{{ priceRange.MinPoints }}</template>
                            <template v-else>0</template>
                        </li>
                    </template>
                    <template v-if="weight">
                        <li class="m-shelfConfirm__title">{{ getLocalizationProp('Labels.CartAdded.Weight', 'Weight:') }}</li>
                        <li class="m-shelfConfirm__desc">
                            {{ weight }}
                        </li>
                    </template>
                    <li class="m-shelfConfirm__title">{{ getLocalizationProp('Labels.CartAdded.Qty', 'Qty:') }}</li>
                    <li class="m-shelfConfirm__desc">
                        {{ quantity }}
                    </li>
                </ul>
                <div v-if="showEditAndConfigurations" class="m-shelfConfirm__list -config">
                    <m-configurations
                        :item="details"
                        :labels="getLocalizationProp('Labels.CartAdded', {})" />
                </div>
                <!-- "Edit" button: -->
                <o-shelf-configurator
                    v-if="showEditAndConfigurations"
                    :cart-position="cartPosition"
                    :cart-type="cartType"
                    :category="details.Category"
                    :close-previous-shelf="true"
                    :family-id="familyId"
                    :gtm-id="415"
                    :is-bogo="isBogo"
                    :is-free-product="isFreeProduct"
                    :is-edit="true"
                    :line-id="details.LineId"
                    :line-type="!isFreeProduct ? details.LineType : 'WelcomeProgram'"
                    :list-id="listId"
                    :pre-selected-configurations="configurations"
                    :product-name="details.Title"
                    :promotion-id="promotionId"
                    :quantity="details.Quantity"
                    :sku="details.Sku"
                    :product="product"
                    class="a-button justify-center -white mt-10 md:mt-5 text-xs px-15 py-8">
                    {{ editText }}
                </o-shelf-configurator>
            </div>
        </div>

        <ul class="m-shelfConfirm__subtotal">
            <li class="m-shelfConfirm__title -subtotal">{{ getLocalizationProp('Labels.CartSummary.CartSubtotal', 'Cart Subtotal') }}</li>
            <li class="m-shelfConfirm__total -price">
                {{ cartSummary.FormattedCartNetTotal }}
            </li>
            <template v-if="userFlags.ViewPoints">
                <li class="m-shelfConfirm__title -subtotal">{{ getLocalizationProp('Labels.CartSummary.CartPoints', 'Cart Points') }}</li>
                <li class="m-shelfConfirm__total -points">
                    {{ cartSummary.Points }} <span v-html="getLocalizationProp('Labels.CartSummary.Points')"></span>
                </li>
            </template>
        </ul>
        <div class="m-shelfConfirm__actions -mx-5">
            <template v-if="isBogo">
                <button v-shelf-hide class="a-button -white text-base font-bold -center flex-1 py-12 mx-5">
                    {{ getLocalizationProp('Labels.Promo.Continue', 'Continue') }}
                </button>
            </template>
            <template v-else>
                <template v-if="!isFreeProduct">
                    <a v-if="getLocalizationProp('Labels.CartSummary.ViewCartLink') != pagePathname" class="a-button -white -center flex-1 mx-5" :href="getLocalizationProp('Labels.CartSummary.ViewCartLink')">
                        {{ getLocalizationProp('Labels.CartSummary.ViewCart', 'View Cart') }}
                    </a>
                    <button v-else v-shelf-hide class="a-button -white -center flex-1 mx-5">
                        {{ getLocalizationProp('Labels.CartSummary.ViewCart', 'View Cart') }}
                    </button>
                </template>
                <template v-if="cartType !== 'upsell'">
                    <button v-if="!getLocalizationProp('Labels.CartSummary.KeepShoppingLink', null)" v-shelf-hide class="a-button -center flex-1 mx-5">
                        {{ getLocalizationProp('Labels.CartSummary.KeepShopping') }}
                    </button>
                    <a v-else class="a-button -center flex-1 mx-5" :href="getLocalizationProp('Labels.CartSummary.KeepShoppingLink')">
                        {{ getLocalizationProp('Labels.CartSummary.KeepShopping') }}
                    </a>
                </template>
            </template>
        </div>
        <template v-if="isFreeProduct && !isItemFromWelcomeProgram && !hasWelcomeLsdBalance && welcomeProductsOverageLabel">
            <p class="text-sm text-blue pb-20 md:pr-18">{{ welcomeProductsOverageLabel }}</p>
        </template>
        <template v-else-if="!isFreeProduct">
            <div v-if="inlineMessages" v-html="inlineMessages" />

            <div v-if="additionalContent">
                <hr class="m-shelfConfirm__divider">
                <div class="py-20" v-html="additionalContent" />
            </div>

            <!-- Promo Messages -->
            <a-loading-spinner :visible="loadingPromoMessages" size="sm" />

            <div
                v-if="!loadingPromoMessages && promoMessages && promoMessages.length"
                class="m-shelfConfirm__promoMessages">
                <div
                    v-for="(item, index) in promoMessages"
                    :key="index"
                    class="m-shelfConfirm__promoMessage">
                    <span v-if="item.Title" class="m-shelfConfirm__title -promoMessage">{{ item.Title }}</span>
                    <span v-if="item.Body" class="m-shelfConfirm__desc -promoMessage" v-html="item.Body"></span>
                </div>
            </div>
        </template>

        <hr class="m-shelfConfirm__divider">

        <template v-if="!isFreeProduct">
            <div
                v-if="!userFlags.ViewMemberPricing && !cartData.Item.Details.IsMarketPlaceProduct"
                class="m-shelfConfirm__guestShopping">

                <m-guest-shopping-cta
                    :become-member-link="memberLink"
                    :become-member-rte="memberRte"
                    :is-enrollment="userFlags.IsGuest && userFlags.IsGuestShoppingEnabled"
                    :online-enrollment-url="localization.Data && localization.Data.OnlineEnrollmentUrl" />
            </div>
        </template>

        <m-shelf-accessories
            v-if="cartData.Item.Details.Accessories && cartData.Item.Details.Accessories.length > 0"
            :accessories="cartData.Item.Details.Accessories"
            :is-free-product="isFreeProduct"
            :line-type="isItemFromWelcomeProgram && hasWelcomeLsdBalance ? 'WelcomeProgram' : 'Normal'"
            :labels="getLocalizationProp('Labels.OrderConfirm', {})" />

        <template v-if="!isFreeProduct">
            <!-- New Loyalty Program -->
            <div v-if="newLoyaltyProgram && shippingOnUsEnabled && rewardsConfigId">
                <ORewardTimelineNewLoyalty
                    :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                    :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                    :reward-config-id="rewardsConfigId"
                />
            </div>

            <div v-if="!newLoyaltyProgram && shippingOnUsEnabled && rewardsConfigId && userFlags.ViewMemberPricing">
                <m-shipping-on-us
                    :wrapper-mods="shippingOnUsEnabled && shippingConfigId && rewardsConfigId && userFlags.ViewMemberPricing && 'pb-0'"
                    :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                    :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                    :reward-config-id="rewardsConfigId"
                >
                    <o-reward-timeline />
                </m-shipping-on-us>
            </div>

            <div v-if="!newLoyaltyProgram && shippingConfigId && shippingOnUsEnabled">
                <m-shipping-on-us
                    :wrapper-mods="shippingOnUsEnabled && shippingConfigId && rewardsConfigId && userFlags.ViewMemberPricing && 'pt-0' || ''"
                    :less-label="getLocalizationProp('Labels.ShippingOnUs.Less')"
                    :more-label="getLocalizationProp('Labels.ShippingOnUs.More')"
                    :shipping-config-id="shippingConfigId"
                >
                </m-shipping-on-us>
            </div>
            <div v-else-if="showFreeShippingShelfBanner">
                <m-shipping-on-us-shelf
                    :available-offers="shippingRates && shippingRates.AvailableOffers ? shippingRates.AvailableOffers : {}"
                    :current-offer="shippingRates && shippingRates.CurrentOffer ? shippingRates.CurrentOffer : {}"
                    :labels="getLocalizationProp('Labels.ShippingOnUs', {})"
                    :link="getLocalizationProp('Data.ShippingOnUsDetailsLink', {})"
                    :sou-feature-on="freeShippingEnabled"
                />
            </div>
            <div v-else-if="showShippingOnUsShelfBanner">
                <m-shipping-on-us-shelf
                    :available-offers="shippingRates && shippingRates.AvailableOffers ? shippingRates.AvailableOffers : {}"
                    :current-offer="shippingRates && shippingRates.CurrentOffer ? shippingRates.CurrentOffer : {}"
                    :labels="getLocalizationProp('Labels.ShippingOnUs', {})"
                    :link="getLocalizationProp('Data.ShippingOnUsDetailsLink', {})"
                    :sou-feature-on="shippingOnUsEnabled"
                />
            </div>
        </template>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { get as getProperty } from 'lodash';
    import shippingOnUsMixin from '../../../mixins/shipping-on-us';
    import MShippingOnUsShelf from '../shipping-on-us/shipping-on-us-shelf.vue';
    import ORewardTimeline from '../../02-organisms/rewards/reward-timeline.vue';
    import ORewardTimelineNewLoyalty from '../../02-organisms/rewards/reward-timeline-new-loyalty.vue';

    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MShelfConfirmCart',
        components: {
            MShippingOnUsShelf,
            ORewardTimeline,
            ORewardTimelineNewLoyalty,
            PricePerUnit
        },
        mixins: [ localizationMixin, shippingOnUsMixin ],
        props: {
            cartPosition: {
                type: Number,
                default: null
            },
            familyId: {
                type: String,
                default: null
            },
            isBogo: {
                type: Boolean,
                default: false
            },
            isFreeProduct: {
                type: Boolean,
                default: false
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            listId: {
                type: [Number, String],
                default: null
            },
            scriptId: {
                type: String,
                default: 'data-shelf-configurator-localization'
            }
        },
        data() {
            return {
                isConfirmed: false,
                pagePathname: window.location.pathname
            };
        },
        computed: {
            ...mapState('addToCart', ['canEditMoreThanQuantity', 'cartData', 'cartType', 'configurations', 'isEdit', 'inlineMessages', 'loadingPromoMessages', 'promoMessages', 'promotionId', 'bogoAddToCartProduct', 'pageType']),
            ...mapState('cart', ['loading', 'summary']),
            ...mapState('shippingOnUsV2', ['souData', 'souLoading']),
            ...mapGetters('addToCart', ['isPreferred']),
            ...mapGetters('cart', ['hasWelcomeLsdBalance']),

            additionalContent() {
                return this.localization.Data?.FreeShippingMessageRte;
            },
            cartSummary() {
                return this.cartData.Summary || {};
            },
            details() {
                return getProperty(this.cartData, 'Item.Details', {});
            },
            editText() {
                return this.canEditMoreThanQuantity ? this.getLocalizationProp('Labels.CartAdded.Edit') : this.getLocalizationProp('Labels.CartAdded.EditQuantity');
            },
            freeProductPrice() {
                return !this.lsdAvailable.YouPay ? this.getLocalizationProp('Labels.Configurator.Free') : this.lsdAvailable.FormattedYouPay;
            },
            headerText() {
                return this.isEdit && this.getLocalizationProp('Labels.CartAdded.CartUpdated') ? this.getLocalizationProp('Labels.CartAdded.CartUpdated', 'Cart Updated') : this.getLocalizationProp('Labels.CartAdded.AddedToCart', 'Added to Cart');
            },
            itemPrice() {
                return this.userFlags.ViewMemberPricing ? this.priceRange.MinPreferredPrice : this.priceRange.MinRegularPrice;
            },
            itemPriceGtm() {
                let price = this.userFlags.ViewMemberPricing ? this.priceRange.MinPreferredPrice : this.priceRange.MinRegularPrice;

                if(price) {
                    price = price.replace(/[^0-9.,-]+/g,''); // eslint-disable-line
                }

                return price;
            },
            isItemFromWelcomeProgram() {
                return this.cartData?.Item?.Details?.LineType === 'WelcomeProgram';
            },
            memberLink() {
                return this.localization.Data?.GuestShoppingCta ? this.localization.Data.GuestShoppingCta.BecomeMemberData : null;
            },
            memberRte() {
                return this.localization.Data?.GuestShoppingCta ? this.localization.Data.GuestShoppingCta.BecomeMemberRte : '';
            },
            newLoyaltyProgram() {
                return this.souData?.IsNewLoyaltyRewardTracker &&
                    this.souData?.IsNewLoyaltyRewardTrackerEligible;
            },
            dilutedLabel() {
                return this.getLocalizationProp('Labels.Configurator.Diluted');
            },
            dilutedPricePerUnit() {
                return this.userFlags.ViewMemberPricing
                    ? this.priceRange?.DilutedPreferredPricePerUnit
                    : this.priceRange?.DilutedRegularPricePerUnit;
            },
            dilutedPricePerUnitMeasurementType() {
                return this.priceRange?.DilutedPPUMeasurementType || null;
            },
            concentratedLabel() {
                return this.getLocalizationProp('Labels.Configurator.Concentrated');
            },
            concentratedPricePerUnit() {
                return this.userFlags.ViewMemberPricing
                    ? this.priceRange?.ConcentratedPreferredPricePerUnit
                    : this.priceRange?.ConcentratedRegularPricePerUnit;
            },
            concentratedPricePerUnitMeasurementType() {
                return this.priceRange?.ConcentratedPPUMeasurementType || null;
            },
            originalPricePerUnit() {
                return this.userFlags.ViewMemberPricing
                    ? this.priceRange?.OriginalPreferredPricePerUnit
                    : this.priceRange?.OriginalRegularPricePerUnit;
            },
            originalPricePerUnitMeasurementType() {
                return this.priceRange?.OriginalPPUMeasurementType || null;
            },
            priceRange() {
                return this.details.PriceRange || {};
            },
            quantity() {
                return this.cartType === 'upsell' ? this.cartData.ComputedQuantity : this.details.Quantity;
            },
            requestId() {
                return this.cartData.RequestId || '';
            },
            rewardsConfigId() {
                return this.getLocalizationProp('Data.RewardTrackerId', null);
            },
            shippingConfigId() {
                return this.getLocalizationProp('Data.ShippingOnUsTrackerId', null);
            },
            shippingRates() {
                return this.freeShippingEnabled
                    ? this.summary?.FreeShipping
                    : this.summary?.ShippingOnUsRates;
            },
            showEditAndConfigurations() {
                let shouldShow = true;
                if(this.cartType === 'upsell' && this.cartData.ComputedQuantity >= 2) {
                    shouldShow = false;
                }
                return shouldShow;
            },
            showFreeShippingShelfBanner() {
                return !this.newLoyaltyProgram && this.freeShippingEnabled && !this.loading && this.getLocalizationProp('Data') && !this.souLoading;
            },
            showShippingOnUsShelfBanner() {
                return !this.newLoyaltyProgram && this.shippingOnUsEnabled && !this.loading && this.getLocalizationProp('Data') && !this.souLoading;
            },
            userFlags() {
                return this.cartData.UserFlags || {};
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            product() {
                return this.bogoAddToCartProduct;
            },
            weight() {
                return this.details?.Weight;
            },
            lsdAvailable() {
                return this.summary?.WelcomeProgramLsdAvailable || {};
            },
            shippingOnUsEnabled() {
                return this.summary?.ShippingOnUsEnabled;
            },
            welcomeProductsOverageLabel() {
                return this.getLocalizationProp('Labels.CartAdded.WelcomeProductsOverage');
            }
        },
        mounted() {
            const details = this.details;

            this.dataLayerPush({
                currency: this.$env?.CurrencyCode || '',
                sku: details.Sku,
                productName: details.Title,
                price: this.itemPriceGtm,
                brand: details.Brand || '',
                category: details.Category || '',
                variant: details.Variant || '',
                quantity: details.Quantity,
                coupon: '',
                metric1: this.priceRange?.MinPoints
            });

            this.updatePromoMessage(this.requestId);

            this.$shelf.$once.hidden(() => this.cleanup());

            if(this.shippingOnUsEnabled && this.pageType !== 'CART' && (this.shippingConfigId || this.rewardsConfigId)) {
                this.getSOU({ rewardId: this.localization?.Data?.RewardTrackerId, shippingId: this.localization?.Data?.ShippingOnUsTrackerId });
            }
        },
        beforeDestroy() {
            this.cleanup();
        },
        methods: {
            ...mapMutations('addToCart', ['RESET_CONFIRMATION', 'RESET_PROMO_MESSAGES']),
            ...mapActions('addToCart', ['updatePromoMessage']),
            ...mapActions('shippingOnUsV2', ['getSOU']),

            cleanup() {
                this.RESET_CONFIRMATION();
                this.RESET_PROMO_MESSAGES();
            },
            dataLayerPush({currency, sku, productName, price, metric1, brand, category, variant, quantity, coupon}) {
                console.log('ATC DL Push >>> ', currency, sku, productName, price, metric1, brand, category, variant, quantity, coupon);

                window.dataLayer && window.dataLayer.push({
                    'event': 'addToCart',
                    'ecommerce': {
                        'currencyCode': currency || '', // Local currency
                        'add': {
                            'actionField': {'list': this.impressionsTitle || document.querySelector('meta[name="pageType"]')?.content},
                            'products': [{
                                'id': sku, // Product ID or SKU (string) - REQUIRED
                                'name': productName, // Product name (string) - REQUIRED
                                'price': price,
                                'brand': brand || '',
                                'category': category || '',
                                'variant': variant || '',
                                'quantity': quantity,
                                'coupon': coupon || '',
                                'metric1': metric1
                            }]
                        }
                    }
                });
            }
        }
    };
</script>

<template>
    <div class="o-bogo">
        <div
            v-if="!isLoaded"
            class="o-bogo__row -loading">

            <a-loading-spinner :visible="true" />
        </div>

        <div v-else>

            <!-- shipping on us banner -->
            <m-bogo-shipping-on-us-banner :labels="getLocalizationProp('Labels.ShippingOnUs')"></m-bogo-shipping-on-us-banner>

            <div class="o-bogo__row mb-10 md:mb-40 lg:mb-60">
                <!-- BOGO Cards -->
                <div class="o-bogo__cards">
                    <m-bogo-product-card
                        v-for="(item, i) in productList" :key="i"
                        card-version="-bogo"
                        :product="item"
                        :eligible-for-saving-packs="item.EligibleForSavingPacks || false"
                        :is-saving-pack="item.IsSavingPack || false"
                        :min-prod-points="getPointsForProduct(item)"
                        :save-label="getLocalizationProp('Labels.Save', 'Save')"
                        :after-reach-label="getLocalizationProp('Labels.AfterYouReach')"
                        :past-eligible-date-message="item.PastEligibleDateMessage || ''"
                        :product-label="getLocalizationProp('Labels.Product', 'product')"
                        :points-label="getLocalizationProp('Labels.Points', 'points')"
                        :point-label="getLocalizationProp('Labels.Point', 'point')"
                        :limit-label="getLocalizationProp('Labels.Limit', 'limit')"
                        :member-label="getLocalizationProp('Labels.Member', 'Member')"
                        :non-member-label="getLocalizationProp('Labels.NonMember', 'Non-Member')"
                        :position="i + 1"
                        :sku-label="getLocalizationProp('Labels.SkuLabel', 'sku')"
                        :continue-label="getLocalizationProp('Labels.ContinueLabel', 'Continue')"
                        :select-label="getLocalizationProp('Labels.Select', 'Select')" />
                </div>

                <!-- CTAs -->
                <div v-if="isCn" class="o-bogo__action" :class="{'-isCn': isCn}">
                    <!-- No Thanks -->
                    <button
                        class="a-button o-bogo__cta -white px-40 mt-20 md:mr-20 md:mt-0"
                        :class="{'-disabled': loading}"
                        :disabled="loading"
                        :aria-disabled="loading"
                        @click="openModal('noThanks')"
                    >
                        {{ getLocalizationProp('Labels.NoThanks', 'No Thanks') }}
                    </button>
                    <!-- Continue to checkout -->
                    <a
                        class="o-bogo__cta"
                        :href="hasBogoInCart ? getLocalizationProp('Data.CheckoutPageUrl'):'javascript:;'"
                        :class="hasBogoInCart ? '-green' : 'bg-gray-50 pointer-events-none'"
                        @click="gtmTrackAction({id: 408, text: 'Continue to checkout'}, $event)">

                        {{ getLocalizationProp('Labels.ContinueToCheckout', 'Continue to checkout') }}
                    </a>
                </div>
                <div v-else class="o-bogo__action" :class="{'hidden lg:flex': showImprovedCTACheckout}">
                    <!-- Continue to checkout -->
                    <a
                        class="o-bogo__cta"
                        :href="getLocalizationProp('Data.CheckoutPageUrl')"
                        @click="gtmTrackAction({id: 408, text: 'Continue to checkout'}, $event)">

                        {{ getLocalizationProp('Labels.ContinueToCheckout', 'Continue to checkout') }}
                    </a>
                </div>

            </div>
        </div>

        <MStickyToast
            v-if="showImprovedCTACheckout && isLoaded"
            class="lg:hidden px-10"
            :single-side-cutting-width="10"
        >
            <template v-slot>
                <div class="flex px-10 pb-8 items-center justify-center">
                    <div>
                        <p class="font-bold text-base text-center">
                            {{ getLocalizationProp('Labels.Subtotal') }} <span v-html="summary.FormattedCartNetTotal" />
                        </p>
                        <p v-if="userFlags.ViewPoints" class="text-sm text-center">
                            <span v-html="summary.Points" /> {{ getLocalizationProp('Labels.Points') }}
                        </p>
                    </div>
                </div>
            </template>
            <template v-slot:cta>
                <!-- Continue to checkout -->
                <a
                    class="a-button justify-center w-full"
                    :href="getLocalizationProp('Data.CheckoutPageUrl')"
                    @click="gtmTrackAction({id: 408, text: 'Continue to checkout'}, $event)">
                    {{ getLocalizationProp('Labels.ContinueToCheckout') }} ({{ itemCount }})
                </a>
            </template>
        </MStickyToast>

        <modal v-if="isCn" id="noThanks">
            <template v-slot:heading>
                <span class="text-gray-120 text-2xl block mx-30 -mt-10 leading-tight md:text-3xl md:mx-0 md:mt-0" role="text">
                    {{ getLocalizationProp('Labels.ConfirmNoThanks', 'Are you sure to proceed to checkout without any special offers?') }}
                </span>
            </template>

            <template v-slot:footer>
                <div class="mx-30 mb-30 md:mx-0 md:mb-0">
                    <button
                        class="a-button -white mr-20 inline-block py-12 px-25 md:px-40 mt-40"
                        @click="closeModal('noThanks')">
                        {{ getLocalizationProp('Labels.Cancel', 'Cancel') }}
                    </button>
                    <button
                        class="a-button mt-20 -green inline-block px-25 md:px-40 py-12"
                        @click="removeBogo()">
                        {{ getLocalizationProp('Labels.Yes', 'Yes') }}
                    </button>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/removebogo';
    import MBogoShippingOnUsBanner from '../../01-molecules/shipping-on-us/bogo-shipping-on-us-banner.vue';
    import MStickyToast from '../../01-molecules/sticky-toast/sticky-toast.vue';

    export default {
        name: 'OBogo',
        components: {
            MBogoShippingOnUsBanner,
            MStickyToast
        },
        mixins: [ localizationMixin ],
        data() {
            return {
                loading: false
            };
        },
        computed: {
            ...mapState('bogo', ['isLoaded', 'hasBogoInCart', 'productList']),
            ...mapState('cart', ['items', 'userFlags']),
            ...mapState('cartSummary', ['itemCount']),
            ...mapGetters('cart', ['summary']),
            ...mapGetters('bogo', ['getRequiredPoints']),
            isCn() {
                return this.$env?.IsCn || false;
            },
            productsData() {
                const productsDataLayer = [];

                this.items.forEach((item, i) => {
                    productsDataLayer.push({
                        item_id: item?.Sku,
                        item_name: item?.Title || item?.FamilyTitle || '',
                        affiliation: 'Online_Store',
                        currency: this.$env?.CurrencyCode || 'USD',
                        index: i,
                        item_brand: item?.Brand || '',
                        item_category: item?.Category || '',
                        variant: item?.Variant || '',
                        price: this.viewPrice ? item?.PriceRange?.RawMinPreferredPrice || '' : item?.PriceRange?.RawMinRegularPrice || '',
                        quantity: item?.Quantity
                    });
                });

                return productsDataLayer;
            },
            showImprovedCTACheckout() {
                return this.getLocalizationProp('Data.ShowImprovedCTACheckout', false);
            },
            viewPrice() {
                return this.userFlags.ViewMemberPricing;
            }
        },
        async mounted() {
            const response = await this.getData();
            // Once shelf is closed, refresh bogo data
            this.$shelf.$on.hidden(() => this.getData());

            this.checkoutOptionPush();

            if(response.success) {
                // Send GTM Card data
                this.mountImpressions();
            }

            await this.getCartData();
            // pass cart summary data to shipping-on-us
            await this.getCartSummaryData(this.summary);

            // GA
            this.dataLayerPush();
        },
        methods: {
            ...mapActions('bogo', ['getData']),
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapActions('cart', { 'getCartData': 'getData' }),
            ...mapActions('shippingOnUs', ['getCartSummaryData']),

            checkoutOptionPush() {
                window.dataLayer && window.dataLayer.push({
                    'event': 'checkoutOption',
                    'ecommerce': {
                        'checkout': {
                            'actionField': {
                                'step': 2, // Number of the step REQUIRED
                                'option': '' // Payment method
                            }
                        }
                    }
                });
            },
            closeModal: function(id) {
                this.$modal.hide({id: id});
            },
            getPointsForProduct(item) {
                const productData = item?.InnerData?.Data;
                return this.getRequiredPoints(productData) || this.getLocalizationProp('Data.ProductPointsLimit');
            },
            mountImpressions() {
                const gtmProducts = this.productList;

                if(gtmProducts !== null) {
                    for (let [i, card] of gtmProducts.entries()) {
                        const impressionItemData = {
                            sku: card.InnerData.Data.Sku,
                            title: card.InnerData.Data.Title,
                            list: this.$gtmList,
                            position: i + 1
                        };

                        this.addCardImpressions(impressionItemData);
                    }

                    this.pushImpressions({ doNotCount: true }); // GTM push product impressions
                }
            },
            openModal: async function(id) {
                if(this.loading) {
                    return;
                }
                if(this.isCn) {
                    if(this.hasBogoInCart) {
                        this.loading = true;
                        this.$modal.show({ id: id });
                        this.loading = false;
                    } else {
                        window.location.href = this.localization.Data.CheckoutPageUrl;
                    }
                } else {
                    this.loading = true;
                    this.$modal.show({ id: id });
                    this.loading = false;
                }
            },

            removeBogo: async function() {
                if(this.loading) {
                    return;
                }
                this.loading = true;
                const headers = { 'Content-Type': 'application/json' };
                const response = await api.post({}, { headers: headers });
                if(response.success) {
                    window.location.href = this.localization.Data.CheckoutPageUrl;
                }
                this.loading = false;
            },
            dataLayerPush() {
                window.dataLayer && window.dataLayer.push({
                    'event': 'begin_checkout',
                    'ecommerce': {
                        items: [...this.productsData]
                    }
                });
            }
        }
    };
</script>

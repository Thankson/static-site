<template>
    <article class="m-seasonalProdCard" :class="cardVersion" :data-productid="product.Sku">
        <component
            :is="hasPdpLink ? 'a' : 'div'"
            ref="seasonalInfo"
            :href="hasPdpLink ? product.PdpLink : false"
            class="m-seasonalProdCard__row -content"
            :aria-label="ariaLabelForCard"
            v-on="hasPdpLink ? { click: () => { gtmClickPush() } } : null">

            <div class="m-seasonalProdCard__header" aria-hidden="true">
                <div v-if="product.Stamp" class="m-seasonalProdCard__tag">
                    <!-- todo: figure out how this is being customized -->
                    <div>
                        <em class="a-stamp" :class="product.Stamp.Style">{{ product.Stamp.StampTitle }}</em>
                    </div>
                </div>

                <div v-if="product.Image && product.Image.Url" class="m-seasonalProdCard__media">
                    <img
                        class="m-seasonalProdCard__hero"
                        :src="product.Image.Url"
                        :alt="product.Image.Alt ? product.Image.Alt : product.Title">
                </div>

                <div class="m-seasonalProdCard__heading">
                    <em class="m-seasonalProdCard__title">{{ product.Title }}</em>
                </div>
            </div>

            <div class="m-seasonalProdCard__body" aria-hidden="true">
                <div class="m-seasonalProdCard__content -top">
                    <div v-if="showSavings" class="m-seasonalProdCard__save">
                        <template v-if="product.ShowPreferredSavings">
                            <span class="m-seasonalProdCard__text -saveAmount">
                                {{ saveText }} {{ product.PriceRange.PreferredMemberSavings }}
                            </span>
                            <span class="m-seasonalProdCard__text -saveInfo">{{ savingsLabelPreferred }}</span>
                            <span v-if="$slots['learn-more-link']" class="m-seasonalProdCard__text -saveLearn">
                                <slot name="learn-more-link" />
                            </span>
                        </template>

                        <template v-else-if="product.PriceRange.HasPackSavings">
                            <icon-tag />
                            <span class="m-seasonalProdCard__text -saveAmount">{{ saveText }} {{ product.PriceRange.PackSavings }}</span>
                            <span class="m-seasonalProdCard__text -saveInfo">{{ savingsLabelPack }}</span>
                        </template>
                    </div>
                </div>

                <div class="m-seasonalProdCard__content -bottom">
                    <!-- todo: hbs file has a "BlockStyles" property on this. how does that get implemented -->
                    <div class="m-seasonalProdCard__pricing">
                        <span v-if="!(isCn && !userFlags.IsAuthenticated)" class="m-seasonalProdCard__row -price -standard">
                            <span v-if="userFlags.ViewMemberPricing" class="m-seasonalProdCard__text -price -mdBold">
                                <template v-if="showMemberPrice">
                                    <template v-if="product.PriceRange.ShowRangeForPreferredPrice">
                                        {{ product.PriceRange.MinPreferredPrice }} <span v-html="rangeSrMarkup"></span> {{ product.PriceRange.MaxPreferredPrice }}
                                    </template>
                                    <template v-else>
                                        {{ product.PriceRange.MinPreferredPrice }}
                                    </template>
                                    <!-- Preferred Price/Unit-EU specific -->
                                    <PricePerUnit
                                        v-if="product.PriceRange.ConcentratedPreferredPricePerUnit"
                                        :label="concentratedLabel"
                                        :price="product.PriceRange.ConcentratedPreferredPricePerUnit"
                                        :unit="product.PriceRange.ConcentratedPPUMeasurementType"
                                        :tailwind-mods="`text-xs text-gray flex flex-col font-normal mt-5`"
                                    />
                                    <PricePerUnit
                                        v-if="product.PriceRange.DilutedPreferredPricePerUnit"
                                        :label="dilutedLabel"
                                        :price="product.PriceRange.DilutedPreferredPricePerUnit"
                                        :unit="product.PriceRange.DilutedPPUMeasurementType"
                                        :tailwind-mods="`text-xs text-gray flex flex-col font-normal mb-3`"
                                    />
                                    <PricePerUnit
                                        v-if="product.PriceRange.OriginalPreferredPricePerUnit"
                                        :price="product.PriceRange.OriginalPreferredPricePerUnit"
                                        :unit="product.PriceRange.OriginalPPUMeasurementType"
                                        :tailwind-mods="`text-xs text-gray flex flex-col font-normal mt-5`"
                                    />
                                </template>
                            </span>
                            <span v-else class="m-seasonalProdCard__text -price -mdBold">
                                <template v-if="showNonMemberPrice">
                                    <template v-if="product.PriceRange.ShowRangeForRegularPrice">
                                        {{ product.PriceRange.MinRegularPrice }} <span v-html="rangeSrMarkup"></span> {{ product.PriceRange.MaxRegularPrice }}
                                    </template>
                                    <template v-else>
                                        {{ product.PriceRange.MinRegularPrice }}
                                    </template>
                                    <!-- Regular Price/Unit-EU specific -->
                                    <PricePerUnit
                                        v-if="product.PriceRange.ConcentratedRegularPricePerUnit"
                                        :label="concentratedLabel"
                                        :price="product.PriceRange.ConcentratedRegularPricePerUnit"
                                        :unit="product.PriceRange.ConcentratedPPUMeasurementType"
                                        :tailwind-mods="`text-xs text-gray flex flex-col font-normal mt-5`"
                                    />
                                    <PricePerUnit
                                        v-if="product.PriceRange.DilutedRegularPricePerUnit"
                                        :label="dilutedLabel"
                                        :price="product.PriceRange.DilutedRegularPricePerUnit"
                                        :unit="product.PriceRange.DilutedPPUMeasurementType"
                                        :tailwind-mods="`text-xs text-gray flex flex-col font-normal mb-3`"
                                    />
                                    <PricePerUnit
                                        v-if="product.PriceRange.OriginalRegularPricePerUnit"
                                        :price="product.PriceRange.OriginalRegularPricePerUnit"
                                        :unit="product.PriceRange.OriginalPPUMeasurementType"
                                        :tailwind-mods="`text-xs text-gray flex flex-col font-normal mt-5 mb-3`"
                                    />
                                </template>
                            </span>
                        </span>
                    </div>

                    <!-- todo: hbs file has a "BlockStyles" property on this. how does that get implemented -->
                    <div v-if="!hidePoints && userFlags.ViewPoints" class="m-seasonalProdCard__points">
                        <!-- todo: logic for showing range + accessibility -->
                        <span class="m-seasonalProdCard__text -points" :class="{ '-highlight': userFlags.ViewPointsHighlight }" v-html="points"></span>
                    </div>

                    <div v-if="isRestrictedPack" class="text-sm text-gray-150 font-normal pr-10">
                        {{ memberOnlyLabel }}
                    </div>
                    <!-- if it's carousel and flag ShowPreferredSavings -->
                    <div
                        v-if="isCarousel && product.ShowPreferredSavings && (!isSignedIn || (isSignedIn && !isPreferred))"
                        class="m-seasonalProdCard__save">
                        <span class="m-seasonalProdCard__text -saveInfo">{{ youCouldSaveLabel }}</span>
                        <span class="m-seasonalProdCard__text -saveAmount"> {{ saveText }} </span>
                    </div>
                    <!-- if seasonal promotion  leftTicketsTip  -->
                    <div v-if="leftQtyTip" class="text-sm text-gray-150 font-normal pr-10" v-html="leftQtyTip"></div>
                </div>
            </div>
        </component>
        <div
            v-if="isCarousel && (product.ShowPreferredSavings && (!isSignedIn || (isSignedIn && !isPreferred)) || isRestrictedPack)"
            class="m-seasonalProdCard__tooltip">
            <m-tooltip :tooltip-icon="tooltipIcon">
                <div v-html="tooltipText"></div>
            </m-tooltip>
        </div>

        <div v-if="(userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled) && canPurchaseRestrictedPack" class="m-seasonalProdCard__row -actions">
            <div class="m-seasonalProdCard__button -shelfToggle">
                <!-- todo: find aria-label datasource & bind -->
                <o-shelf-configurator
                    :sku="product.Sku"
                    :family-id="product.FamilyID"
                    :button-label="replaceToken(shelfConfigLabel, product.Title)"
                    :gtm-id="415"
                    :impressions-title="impressionsTitle"
                    :product-name="product.Title"
                    :is-seasonal-promotion="isSeasonalPromotion"
                    :qty-available="isSeasonalPromotion ? qtyAvailable : 0"
                    :maximum-qty-tip="isSeasonalPromotion ? maximumQtyTip : null"
                    :promotion-id="isSeasonalPromotion ? promotionId : null"
                    :line-type="isSeasonalPromotion ? 'Promotion' : 'Normal'"
                    :class="['a-button justify-center flex-1', { '-white': isBackupOrder, '-disableButton': isSoldOut || isOffSale }, {'-gray pointer-events-none': qtyAvailable===0 && isSeasonalPromotion}]">

                    <template v-if="isSoldOut || isOffSale">
                        <span v-if="isSoldOut">{{ isSoldOutLabel }}</span>
                        <span v-else-if="isOffSale">{{ product.OffSaleTitle || product.OffSaleTitle }}</span>
                    </template>

                    <template v-else-if="!isBackupOrder && !isSoldOut">
                        <span class="flex justify-center items-center text-white md:hidden" aria-hidden="true">
                            <span class="font-global-sans inline-block text-3xl leading-none mr-4">+</span>
                            <span class="material-icons inline-block">shopping_cart</span>
                        </span>
                        <span class="sr-only md:not-sr-only md:block">{{ cardCta }} </span>
                    </template>

                    <template v-else>
                        <span class="flex justify-center items-center">{{ cardCta }}</span>
                    </template>
                </o-shelf-configurator>

                <!-- Add to list - only for logged users -->
                <m-shoplists-add-item
                    v-if="isSignedIn && !isCn && !isSeasonalPromotion && !isSoldOut"
                    class="ml-10 h-36"
                    :is-shelf="true"
                    :aria-label-cta="replaceToken(addListLabel, product.Title)"
                    :is-carousel="isCarousel"
                    :is-category-list="!isCarousel"
                    :is-preferred="isPreferred"
                    :carousel-size="carouselSize"
                    :product="product"
                    :pre-selected-configurations="product.ConfigurationSkus || null"
                    :script-id-configurator="scriptIdConfigurator">
                    <template v-slot:icon>
                        <span class="material-icons" aria-hidden="true">playlist_add</span>
                    </template>
                </m-shoplists-add-item>
            </div>
        </div>
    </article>
</template>

<script>
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MSeasonalProductCard',
        components: {
            PricePerUnit
        },
        props: {
            addListLabel: {
                type: String,
                default: null
            },
            cardCta: {
                type: String,
                default: 'Add'
            },
            cardPosition: {
                type: Number,
                default: null
            },
            cardVersion: {
                type: String,
                default: '-grid'
            },
            carouselSize: {
                type: String,
                default: '-lg'
            },
            concentratedLabel: {
                type: String,
                default: ''
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            isPreferred: {
                type: Boolean,
                default: false
            },
            isSignedIn: {
                type: Boolean,
                default: true
            },
            isCarousel: {
                type: Boolean,
                default: false
            },
            isBackupOrder: {
                type: Boolean,
                default: false
            },
            isSoldOut: {
                type: Boolean,
                default: false
            },
            isSoldOutLabel: {
                type: String,
                default: 'Sold Out'
            },
            isOffSale: {
                type: Boolean,
                default: false
            },
            leftQtyTip: {
                type: String,
                default: null
            },
            shelfConfigLabel: {
                type: String,
                default: null
            },
            memberOnlyLabel: {
                type: String,
                default: null
            },
            maximumQtyTip: {
                type: String,
                default: null
            },
            pointsLabel: {
                type: String,
                default: ''
            },
            pointsLabelSingular: {
                type: String,
                default: ''
            },
            promotionId: {
                type: [Number, String],
                default: null
            },
            product: {
                type: Object,
                default: () => ({
                    CardVersion: String,
                    Title: String,
                    ItemId: String,
                    Image: {
                        Url: String,
                        Alt: String
                    },
                    PriceRange: {
                        MinRegularPrice: String,
                        RawMinRegularPrice: Number,
                        MaxRegularPrice: String,
                        RawMaxRegularPrice: Number,
                        ShowRangeForRegularPrice: Boolean,
                        MinPreferredPrice: String,
                        RawMinPreferredPrice: Number,
                        MaxPreferredPrice: String,
                        RawMaxPreferredPrice: Number,
                        PrimaryMinRegularPrice: String,
                        PrimaryRawMinRegularPrice: Number,
                        PrimaryMaxRegularPrice: String,
                        PrimaryRawMaxRegularPrice: Number,
                        PrimaryMinPreferredPrice: String,
                        PrimaryRawMinPreferredPrice: Number,
                        PrimaryMaxPreferredPrice: String,
                        PrimaryRawMaxPreferredPrice: Number,
                        SecondaryMinRegularPrice: String,
                        SecondaryRawMinRegularPrice: Number,
                        SecondaryMaxRegularPrice: String,
                        SecondaryRawMaxRegularPrice: Number,
                        SecondaryMinPreferredPrice: String,
                        SecondaryRawMinPreferredPrice: Number,
                        SecondaryMaxPreferredPrice: String,
                        SecondaryRawMaxPreferredPrice: Number,
                        ShowRangeForPreferredPrice: Boolean,
                        MinPoints: String,
                        RawMinPoints: Number,
                        MaxPoints: String,
                        RawMaxPoints: Number,
                        ShowRangeForPoints: Boolean,
                        PreferredMemberSavings: String,
                        RawPreferredMemberSavings: Number,
                        PrimaryPreferredMemberSavings: String,
                        PrimaryRawPreferredMemberSavings: Number,
                        SecondaryPreferredMemberSavings: String,
                        SecondaryRawPreferredMemberSavings: Number,
                        PackSavings: String,
                        HasPackSavings: Boolean,
                        HasMultiplePacks: Boolean
                    },
                    Sku: String,
                    FamilyID: String,
                    PdpLink: String,
                    ShowPreferredSavings: Boolean,
                    IsOffSale: Boolean,
                    IsErpDateValid: Boolean,
                    OffSaleMessage: Boolean,
                    HasSoldOut: Boolean,
                    Stamp: {
                        SortOrder: String,
                        Style: String,
                        StampTitle: String
                    },
                    ConfigurationSkus: Object,
                    IsInventoryControlled: Boolean,
                    Category: String
                })
            },
            qtyAvailable: {
                type: Number,
                default: 0
            },
            rangeSrText: {
                type: String,
                default: 'to'
            },
            saveLabel: {
                type: String,
                default: 'Save'
            },
            saveUpToLabel: {
                type: String,
                default: 'Save up to'
            },
            youCouldSaveLabel: {
                type: String,
                default: 'You could'
            },
            savingsLabelPack: {
                type: String,
                default: 'vs buying individual products'
            },
            savingsLabelPreferred: {
                type: String,
                default: 'by becoming a Preferred Member'
            },
            showPoints: {
                type: Boolean,
                default: true
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            tooltipIcon: {
                type: String,
                default: 'info'
            },
            tooltipText: {
                type: String,
                default: 'Tooltip'
            },
            userFlags: {
                type: Object,
                default: () => ({})
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isSeasonalPromotion: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                orderType: 'order',
                cardData: this.product,
                ariaLabelForCard: ''
            };
        },
        computed: {
            hasPdpLink() {
                return this.product?.PdpLink;
            },
            canPurchaseRestrictedPack() {
                return this.isRestrictedPack ? this.userFlags.CanPurchaseRestrictedPacks : true;
            },
            isRestrictedPack() {
                return this.product.IsRestrictedPack;
            },
            showSavings() {
                return !this.isCarousel && this.showPoints && !this.isPreferred && (this.product.ShowPreferredSavings || this.product.PriceRange.HasPackSavings);
            },
            points() {
                let points = '';
                const isValid = this.product?.PriceRange?.MinPoints ?? false;

                if(isValid) {
                    const isRange = this.product.PriceRange.ShowRangeForPoints;
                    let pointsLabel = this.pointsLabel;
                    let pointsLabelSingular = this.pointsLabelSingular;

                    if(pointsLabel.indexOf('{0}') < 0) {
                        pointsLabel = '{0} ' + pointsLabel;
                    }

                    if(pointsLabelSingular.indexOf('{0}') < 0) {
                        pointsLabelSingular = '{0} ' + pointsLabelSingular;
                    }

                    if(isRange) {
                        // will always be plural as a range
                        points = pointsLabel.replace('{0}', this.product.PriceRange.MinPoints + this.rangeSrMarkup + this.product.PriceRange.MaxPoints);
                    } else if(this.product.PriceRange.RawMinPoints === 1) {
                        // use singular label if there is only 1 point
                        points = pointsLabelSingular.replace('{0}', this.product.PriceRange.MinPoints);
                    } else {
                        // plural for all fallbacks
                        points = pointsLabel.replace('{0}', this.product.PriceRange.MinPoints);
                    }
                }

                return points;
            },
            priceRaw() {
                const price = this.userFlags.ViewMemberPricing ? this.product.PriceRange.RawMinPreferredPrice || '' : this.product.PriceRange.RawMinRegularPrice || '';
                return price;
            },
            rangeSrMarkup() {
                return ` <span class="sr-only">${this.rangeSrText}</span><span aria-hidden="true">-</span> `;
            },
            saveText() {
                const isValid = this.product?.PriceRange?.HasMultiplePacks ?? false;
                return isValid && this.product?.PriceRange?.HasMultiplePacks ? this.saveUpToLabel : this.saveLabel;
            },
            showMemberPrice() {
                return !this.$env.ProductPricing?.HideProductMemberPrice;
            },
            showNonMemberPrice() {
                return !this.$env.ProductPricing?.HideProductNonMemberPrice;
            },
            hidePoints() {
                return this.$env?.HidePoints;
            }
        },
        mounted() {
            this.makeAriaLabelForCard();
        },
        methods: {
            replaceToken,
            gtmClickPush() {
                const card = this.product;
                const cardLink = card?.PdpLink || '';
                const data = {
                    'id': card?.Sku || '', // Product ID or SKU (string) - REQUIRED
                    'name': card?.Title || '', // Product name (string) - REQUIRED
                    'price': this.priceRaw || '', // Product price (string)
                    'brand': card?.Brand || '', // Product brand (string)
                    'category': card?.Category || '', // Product category (string)
                    'variant': card?.Variant || '', // Product variant (string)
                    'position': this?.cardPosition || '' // Product position (number)
                };

                console.log('Click push seasonal card Data', data, cardLink);

                window.dataLayer && window.dataLayer.push({
                    'event': 'productClick',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '', // Local currency
                        'click': {
                            'actionField': {'list': this.impressionsTitle || this.$gtmList}, // Product list (string)
                            'products': [data]
                        }
                    },
                    'eventCallback': function() {
                        document.location = cardLink; // Product's Page URL (string)
                    }
                });
            },
            makeAriaLabelForCard() {
                this.ariaLabelForCard = this.$refs.seasonalInfo.textContent;
            }
        }
    };
</script>

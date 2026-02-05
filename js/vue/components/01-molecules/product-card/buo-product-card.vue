<template>
    <article class="m-prodCard" :class="cardVersion" :data-productid="product.Data.Sku">
        <component
            :is="product.Data.PdpLink ? 'a' : 'div'"
            :href="product.Data.PdpLink ? product.Data.PdpLink : false"
            class="m-prodCard__row -content"
            @click="onClick"
        >

            <div class="m-prodCard__header">

                <div v-if="product.Data.Image && product.Data.Image.Url" class="m-prodCard__media">
                    <img class="m-prodCard__hero" :src="product.Data.Image.Url" :alt="product.Data.Image.Alt ? product.Data.Image.Alt : product.Data.Title">
                </div>

                <div class="m-prodCard__heading">
                    <em class="m-prodCard__title">{{ product.Data.Title }}</em>
                    <div
                        v-if="cardVersion === '-backupOrder' || cardVersion === '-isCn -backupOrder'"
                        class="m-prodCard__buoMobilePricing"
                    >
                        <BuoProductCardPricing
                            :is-regular-price-not-a-range="!product.Data.PriceRange.ShowRangeForRegularPrice"
                            :is-preferred="isPreferred"
                            :points="points"
                            :preferred-price="preferredPrice"
                            :regular-price="regularPrice"
                            :regular-price-label="regular"
                            :show-points="userFlags.ViewPoints"
                            :view-points-highlight="userFlags.ViewPointsHighlight"
                        />
                    </div>
                </div>
            </div>

            <div class="m-prodCard__body">
                <div class="m-prodCard__content -bottom">
                    <BuoProductCardPricing
                        :is-regular-price-not-a-range="!product.Data.PriceRange.ShowRangeForRegularPrice"
                        :is-preferred="isPreferred"
                        :points="points"
                        :preferred-price="preferredPrice"
                        :regular-price="regularPrice"
                        :regular-price-label="regular"
                        :show-points="userFlags.ViewPoints"
                        :view-points-highlight="userFlags.ViewPointsHighlight"
                    />
                </div>
            </div>
        </component>

        <div class="m-prodCard__row -actions">
            <div v-if="$slots['button']" class="m-prodCard__actions">
                <slot name="button" />
            </div>
            <div v-else class="m-prodCard__button -shelfToggle">
                <!-- Add to BUO -->
                <o-shelf-configurator
                    v-if="!offSaleDisplay"
                    class="a-button justify-center w-full"
                    :class="buttonMods"
                    :cart="orderType"
                    :category="category"
                    :sku="product.Data.Sku"
                    :family-id="product.Data.FamilyId">
                    <span v-if="isCn && isMobile" aria-hidden="true" class="a-icon material-icons">add</span>
                    <span v-else :class="{'text-base' : isCn}">{{ cardCta }}</span>
                </o-shelf-configurator>

                <!-- Sold out / Off sale -->
                <div
                    v-else
                    class="m-prodCard__disabled"
                    v-html="offSaleDisplay">
                </div>
            </div>
        </div>
    </article>
</template>

<script>
    import { mapState } from 'vuex';
    import BuoProductCardPricing from './buo-product-card-pricing.vue';

    export default {
        name: 'MBackupProductCard',
        components: { BuoProductCardPricing },
        props: {
            cardCta: {
                type: String,
                default: 'Add'
            },
            cardVersion: {
                type: String,
                default: '-grid'
            },
            category: {
                type: String,
                default: ''
            },
            isPreferred: {
                type: Boolean,
                default: false
            },
            checkInventory: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => (
                    {'Labels':
                        {
                            'Points': 'Points ',
                            'Point': 'Point',
                            'RangeSrText': 'to'
                        }
                    })
            },
            buttonMods: {
                type: String,
                default: null
            },
            product: {
                type: Object,
                default: () => ({
                    Labels: Object,
                    Data: {
                        ItemId: String,
                        Image: {
                            Url: String,
                            Alt: String
                        },
                        Title: String,
                        PriceRange: {
                            MinRegularPrice: String,
                            MaxRegularPrice: String,
                            ShowRangeForRegularPrice: Boolean,
                            MinPreferredPrice: String,
                            MaxPreferredPrice: String,
                            ShowRangeForPreferredPrice: Boolean,
                            MinPoints: String,
                            MaxPoints: String,
                            ShowRangeForPoints: Boolean,
                            PreferredMemberSavings: String,
                            PackSavings: String,
                            HasPackSavings: Boolean
                        },
                        Stamp: String,
                        ShowPreferredSavings: Boolean,
                        PdpLink: String,
                        Sku: String
                    },
                    Id: String
                })
            },
            rangeSrText: {
                type: String,
                default: 'to'
            },
            regular: {
                type: String,
                default: 'Regular'
            }
        },
        data() {
            return {
                orderType: 'backuporder'
            };
        },
        computed: {
            ...mapState('userFlags', ['userFlags']),
            isCn() {
                return this.$env?.IsCn || false;
            },
            impressionPrice() {
                if(this.isPreferred) {
                    return this.preferredPrice;
                }
                if(this.regularPrice) {
                    return this.regular + ' ' + 'Price';
                }
                if(!this.priceRange.ShowRangeForRegularPrice) {
                    return this.regularPrice;
                }
                return '';
            },
            isMobile() {
                return (navigator.userAgent.toLowerCase().match(/mobile/i)) && (window.innerWidth <= 767);
            },
            offSaleDisplay() {
                let offsaleDisplay = null;
                const product = this.product?.Data;

                // If the card is configured to check Inventory API and the product has a valid ERP Date
                if(this.checkInventory && product?.IsErpDateValid) {
                    // If it's inventory controlled AND has no quantity, then displays offsale/soldout message
                    if(product.isInventoryControlled && product.quantityAvailable <= 0) {
                        if(product.IsOffSale) {
                            // Displays offsale message
                            offsaleDisplay = product.OffSaleTitle || 'OffSaleTitle Is Missing';
                        } else {
                            // Displays soldout message
                            offsaleDisplay = this.labels?.SoldOut || 'SoldOut Label Is Missing';
                        }
                    }
                }

                return offsaleDisplay;
            },
            points() {
                const minPoints = this.priceRange.MinPoints || '';
                const rawMinPoints = this.priceRange.RawMinPoints || 0;
                const showRange = this.priceRange.ShowRangeForPoints || false;
                const label = rawMinPoints === 1 && !showRange ? this.labels?.Point || 'point' : this.labels?.Points || 'points';
                const hasToken = label.includes('{0}');

                if(!showRange) {
                    return hasToken ? label.replace('{0}', minPoints) : `${minPoints} ${label}`;
                }

                return hasToken
                    ? this.label.Points.replace('{0}', `${minPoints} ${this.rangeSrMarkup} ${this.priceRange.MaxPoints}`)
                    : `${minPoints} ${this.rangeSrMarkup} ${this.priceRange.MaxPoints} ${label}`;
            },
            priceRange() {
                return this.product.Data?.PriceRange || {};
            },
            preferredPrice() {
                const minPreferredPrice = this.priceRange.MinPreferredPrice || '';

                if(!this.priceRange.ShowRangeForPreferredPrice) {
                    return minPreferredPrice;
                }

                return `${minPreferredPrice} ${this.rangeSrMarkup} ${this.priceRange.MaxPreferredPrice}`;
            },
            rangeSrMarkup() {
                return ` <span class="sr-only">${this.labels.RangeSrText}</span><span aria-hidden="true">-</span> `;
            },
            regularPrice() {
                const minRegularPrice = this.priceRange.MinRegularPrice || '';

                if(!this.priceRange.ShowRangeForRegularPrice) {
                    return minRegularPrice;
                }

                return `${minRegularPrice} ${this.rangeSrMarkup} ${this.priceRange.MaxRegularPrice}`;
            }
        },
        methods: {
            gtmClickPush(cardLink) {
                const data = {
                    'id': this.product?.Data?.Sku || '', // Product ID or SKU (string)
                    'name': this.product?.Data?.Title || '', // Product name (string)
                    'price': this.impressionPrice // Product price (string)
                };
                window.dataLayer && window.dataLayer.push({
                    'event': 'productClick',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '', // Local currency
                        'click': {
                            'actionField': {'list': 'SearchResults'}, // Product list (string)
                            'products': [data]
                        }
                    },
                    'eventCallback': function() {
                        document.location = cardLink; // Product's Page URL (string)
                    }
                });
            },
            onClick() {
                if(this.product?.Data?.PdpLink) {
                    this.gtmClickPush(this.product.Data.PdpLink);
                }
            }

        }
    };
</script>

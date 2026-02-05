<template>
    <article
        ref="mixinAd"
        class="m-mixinAd"
        :style="context.Data.BackgroundColor ? {
            backgroundColor: context.Data.BackgroundColor
        } : false">

        <div
            v-if="context.Data.BackgroundImage.Url"
            class="m-mixinAd__bg"
            :class="{'-isCn' : isCn}"
            :style="{ backgroundImage: 'url(\'' + context.Data.BackgroundImage.Url + '\')'}"
            aria-hidden="true">
        </div>

        <a
            class="m-mixinAd__row -content"
            :href="context.Data.CardLink.Url"
            :target="context.Data.CardLink.Target ? context.Data.CardLink.Target : false"
            :aria-label="context.Data.CardLinkAriaLabel"
            @click="gtmPromoPush">

            <div v-if="$slots['header-product-image']" class="m-mixinAd__img -header">
                <slot name="header-product-image" />
            </div>

            <div class="m-mixinAd__header">
                <div v-if="$slots['logo-image']" class="m-mixinAd__logo">
                    <slot name="logo-image" />
                </div>

                <div class="m-mixinAd__headline" v-html="context.Data.TopText"></div>
            </div>

            <div v-if="$slots['main-product-image']" class="m-mixinAd__img -main">
                <slot name="main-product-image" />
            </div>

            <div v-if="context.Data.BottomText" class="m-mixinAd__info" v-html="context.Data.BottomText"></div>
            <div v-if="isCn && $slots['add-to-cart']" class="m-mixinAd__row -ctaButton -isCn">
                <slot name="add-to-cart" />
            </div>
            <div
                v-if="context.Data.ProductPrice"
                class="m-mixinAd__priceBlock"
                :class="context.Data.ProductPriceStyle">

                <p v-if="showTopPricing" class="m-mixinAd__text -price" :class="isCn ? 'text-gray' : 'font-bold'">
                    <span role="text">
                        {{ topPricingValue }} <span v-html="topPricingLabel" />
                    </span>
                </p>

                <p v-if="showBottomPricing" class="m-mixinAd__text -price" :class="isCn ? 'font-bold text-gray-150' : ''">
                    <span role="text">
                        {{ bottomPricingValue }} <span v-html="bottomPricingLabel" />
                    </span>
                </p>

                <p v-if="userFlags.ViewPoints" class="m-mixinAd__text -points">
                    <span role="text">
                        <span v-html="points" />
                    </span>
                </p>
            </div>
        </a>

        <div v-if="!isCn && $slots['add-to-cart']" class="m-mixinAd__row -ctaButton">
            <slot name="add-to-cart" />
        </div>

        <div v-if="$slots['video-button']" class="m-mixinAd__row -videoButton">
            <slot name="video-button" />
        </div>

        <slot name="video-text" />

        <div v-if="$slots['footer-product-image']" class="m-mixinAd__img -footer">
            <slot name="footer-product-image" />
        </div>

        <div v-if="$slots['footer-text']" class="m-mixinAd__text -footerText">
            <slot name="footer-text" />
        </div>
    </article>
</template>

<script>
    const context = {
        Labels: {
            AddToCart: String
        },
        Data: {
            RenderingId: String,
            AddToCartAriaLabel: String,
            AddToCartStyle: String,
            BackgroundImage: {
                Url: String,
                Alt: String
            },
            BackgroundColor: String,
            BottomText: String,
            CardLink: {
                Url: String,
                Text: String,
                Target: String
            },
            CardLinkAriaLabel: String,
            CardType: String,
            FooterText: String,
            LogoImage: {
                Url: String,
                Alt: String
            },
            CardImage: {
                Url: String,
                Alt: String
            },
            ProductPrice: Boolean,
            ProductPriceStyle: String,
            ProductPoints: String,
            ProductPreferredPrice: String,
            ProductRegularPrice: String,
            ProductSku: String,
            SitecoreVideo: {
                VirtualVideo: {
                    Label: String,
                    Culture: String,
                    Description: String,
                    ImageUrl: String,
                    MediaId: String,
                    MediaItemName: String,
                    RuntimeSeconds: String,
                    SubtitlePath: String,
                    Title: String,
                    ThumbnailImageUrl: String,
                    VideoFolderPath: String,
                    Hls: String,
                    Dash: String,
                    Progressive1080: String,
                    Progressive720: String,
                    Progressive360: String,
                    Progressive270: String,
                    Progressive144: String
                }
            },
            TopText: String,
            VideoIcon: String,
            VideoIconStyle: String,
            WatchVideoText: String
        }
    };

    const userFlags = {
        IsAuthenticated: false,
        IsBackDating: false,
        IsGuest: false,
        IsGuestShoppingEnabled: false,
        ViewPoints: false,
        ViewMemberPricing: false,
        ViewLists: false
    };

    export const baseProps = {
        context: {
            type: Object,
            default: () => context
        },
        pointsLabel: {
            type: String,
            default: 'Points'
        },
        preferredLabel: {
            type: String,
            default: 'Preferred'
        },
        regularLabel: {
            type: String,
            default: 'Regular'
        },
        userFlags: {
            type: Object,
            default: () => userFlags
        }
    };

    export default {
        name: 'MMixinAd',
        props: {
            ...baseProps
        },
        data() {
            return {
                gtmPromoObj: {},
                isAddViewed: false
            };
        },
        computed: {
            bottomPricingLabel() {
                return this.userFlags.ViewMemberPricing ? this.regularLabel : this.preferredLabel;
            },
            bottomPricingValue() {
                return this.userFlags.ViewMemberPricing ? this.context.Data.ProductRegularPrice : this.context.Data.ProductPreferredPrice;
            },
            points() {
                const points = this.context.Data?.ProductPoints || '';

                if(!points) {
                    return '';
                }

                return this.pointsLabel.includes('{0}') ? this.pointsLabel.replace('{0}', points) : `${points} ${this.pointsLabel}`;
            },
            priceRaw() {
                return this.userFlags.ViewMemberPricing ? this.context.Data.ProductPreferredPriceRaw || '' : this.context.Data.ProductRegularPriceRaw || '';
            },
            showBottomPricing() {
                return !(this.userFlags.viewMemberPricing ? this.$env.ProductPricing?.HideProductNonMemberPrice : this.$env.ProductPricing?.HideProductMemberPrice);
            },
            showTopPricing() {
                return !(this.userFlags.viewMemberPricing ? this.$env.ProductPricing?.HideProductMemberPrice : this.$env.ProductPricing?.HideProductNonMemberPrice);
            },
            topPricingLabel() {
                return this.userFlags.ViewMemberPricing ? this.preferredLabel : this.regularLabel;
            },
            topPricingValue() {
                return this.userFlags.ViewMemberPricing ? this.context.Data.ProductPreferredPrice : this.context.Data.ProductRegularPrice;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            // register promo impression once
            isAddViewed() {
                if(this.isAddViewed) {
                    this.promoImpressions();
                }
            }
        },
        mounted() {
            const gtm = this.context?.Data?.Gtm;
            this.$nextTick(() => {
                const promoData = {
                    'id': gtm?.Id || '',
                    'name': gtm?.Name || '',
                    'creative': gtm?.Creative || '',
                    'position': gtm?.Position || ''
                };
                this.gtmPromoObj = promoData;
                this.isAdinViewport();
                window.addEventListener('scroll', this.isAdinViewport);
            });
        },
        destroyed() {
            document.removeEventListener('scroll', this.isAdinViewport);
        },
        methods: {
            gtmPromoPush() {
                const cardLink = this.context?.Data?.CardLink?.Url || '';
                if(!window.dataLayer) return;

                window.dataLayer && window.dataLayer.push({
                    'event': 'promoClick',
                    'ecommerce': {
                        'promoClick': {
                            'promotions': [ this.gtmPromoObj ]
                        }
                    },
                    'eventCallback': function () {
                        document.location = cardLink;
                    }
                });

                console.log(
                    '%c -- loaded promo clicks -- ',
                    'background-color:#FF00FF; color:black; border-radius: 2px;',
                    JSON.stringify(this.gtmPromoObj),
                    window.dataLayer
                );
            },

            promoImpressions() {
                if(!window.dataLayer) return;
                window.dataLayer.push({
                    'event': 'promoView',
                    'ecommerce': {
                        'promoView': {
                            'promotions': [this.gtmPromoObj]
                        }
                    }
                });

                console.log(
                    '%c -- loaded PROMOS -- ',
                    'background-color:#FF00FF; color:black; border-radius: 2px;',
                    this.gtmPromoObj,
                    window.dataLayer
                );
            },
            // check if mix-in-add in viewport
            isAdinViewport() {
                var mixinAd = this.$refs.mixinAd;
                var rect = mixinAd.getBoundingClientRect();

                if(rect.top >= 0 && rect.left >= 0 && rect.right <= (window.innerWidth || document.documentElement.clientWidth) && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
                    if(!this.isAddViewed) { this.isAddViewed = true; }
                }
            }

        }
    };
</script>

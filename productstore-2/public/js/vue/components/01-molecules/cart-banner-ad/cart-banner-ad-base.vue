<template>
    <article class="m-cartBannerAd" :style="context.Data.BackgroundColor ? { backgroundColor: context.Data.BackgroundColor } : false">
        <div
            v-if="context.Data.BackgroundImage"
            class="m-cartBannerAd__bg">
            <div class="m-cartBannerAd__media -desktop" :style="{ backgroundImage: `url(${context.Data.BackgroundImage.DesktopUrl})` }"></div>
            <div class="m-cartBannerAd__media -tablet" :style="{ backgroundImage: `url(${context.Data.BackgroundImage.TabletUrl})` }"></div>
            <div class="m-cartBannerAd__media -tabletPort" :style="{ backgroundImage: `url(${context.Data.BackgroundImage.TabletPortraitUrl ? context.Data.BackgroundImage.TabletPortraitUrl : context.Data.BackgroundImage.DesktopUrl })` }"></div>
            <div class="m-cartBannerAd__media -mobile" :style="{ backgroundImage: `url(${context.Data.BackgroundImage.MobileUrl})` }"></div>
        </div>
        <div class="m-cartBannerAd__row" :class="context.Data.RowAlignment">
            <div class="m-cartBannerAd__col -top">
                <div v-if="$slots['logo-image']" class="m-cartBannerAd__logo">
                    <slot name="logo-image" />
                </div>
                <div v-if="$slots['top-text']" class="m-cartBannerAd__topText m-rte">
                    <slot name="top-text" />
                </div>
            </div>
            <div class="m-cartBannerAd__col -bottom">
                <slot v-if="$slots['price-points']" name="price-points" />
                <div v-if="$slots['add-to-cart']" class="m-cartBannerAd__ctaButton">
                    <slot name="add-to-cart" />
                </div>
            </div>
        </div>
    </article>
</template>

<script>
    export const context = {
        Labels: {
            AddToCart: String
        },
        Data: {
            RenderingId: String,
            AddToCartAriaLabel: String,
            AddToCartStyle: String,
            BackgroundImage: {
                DesktopUrl: String,
                TabletUrl: String,
                MobileUrl: String
            },
            BackgroundColor: String,
            LogoImage: {
                Url: String,
                Alt: String
            },
            ProductTextColor: String,
            ProductPoints: String,
            ProductPreferredPrice: String,
            ProductRegularPrice: String,
            ProductSavings: String,
            ProductSku: String,
            RowAlignment: String,
            TopText: String
        }
    };
    export default {
        name: 'MCartBannerAd',
        props: {
            context: {
                type: Object,
                default: () => context
            },
            userFlags: {
                type: Object,
                default: () => ({})
            }
        }
    };
</script>

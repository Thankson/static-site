<template>
    <cart-banner-ad-base :context="context">
        <template
            v-if="context.Data.LogoImage"
            v-slot:logo-image>
            <img :src="context.Data.LogoImage.Url" :alt="context.Data.LogoImage.Alt">
        </template>

        <template
            v-if="context.Data.TopText"
            v-slot:top-text>
            <div v-html="context.Data.TopText"></div>
        </template>

        <template v-if="context.Labels.AddToCart" v-slot:add-to-cart>
            <o-shelf-configurator
                :class="context.Data.AddToCartStyle"
                :aria-label="context.Data.AddToCartAriaLabel"
                :sku="context.Data.ProductSku">

                {{ context.Labels.AddToCart }}
            </o-shelf-configurator>
        </template>
        <template
            v-slot:price-points>
            <div v-if="userFlags.ViewMemberPricing" class="m-cartBannerAd__price" :style="{ color: context.Data.ProductTextColor }">
                <p class="m-cartBannerAd__text -price -preferred">{{ context.Data.ProductPreferredPrice }} {{ context.Labels.Member }}</p>
                <p class="m-cartBannerAd__text -price">{{ context.Data.ProductRegularPrice }} {{ context.Labels.NonMember }}</p>
                <p class="m-cartBannerAd__text -price">{{ context.Data.ProductSavings }} {{ context.Labels.Savings }}</p>
                <p v-if="userFlags.ViewPoints" class="m-cartBannerAd__text -price">{{ context.Data.ProductPoints }} {{ context.Labels.Points }}</p>
            </div>
            <div v-else class="m-cartBannerAd__price" :style="{ color: context.Data.ProductTextColor }">
                <p class="m-cartBannerAd__text -price -preferred">{{ context.Data.ProductRegularPrice }}</p>
                <p class="m-cartBannerAd__text -price -preferred">{{ context.Labels.NonMember }}</p>
                <p class="m-cartBannerAd__text -price">{{ context.Data.ProductPreferredPrice }} {{ context.Labels.Member }}</p>
                <p v-if="userFlags.ViewPoints" class="m-cartBannerAd__text -price">{{ context.Data.ProductPoints }} {{ context.Labels.Points }}</p>
            </div>
        </template>
    </cart-banner-ad-base>
</template>

<script>
    import cartBannerAdBase, { context } from './cart-banner-ad-base.vue';

    export default {
        name: 'MCartBannerAd1',
        components: {
            cartBannerAdBase
        },
        props: {
            context: {
                type: Object,
                default: () => context
            },
            userFlags: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            isCn: function () {
                return this.$env?.IsCn || false;
            }
        }
    };
</script>

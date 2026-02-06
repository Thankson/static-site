<template>
    <component
        :is="variant"
        v-if="variant"
        :class="variantClass"
        :context="context"
        :user-flags="userFlags" />
</template>

<script>
    import { context } from './cart-banner-ad-base.vue';
    import cartBannerAd1 from './cart-banner-ad-1.vue';
    import cartBannerAd2 from './cart-banner-ad-2.vue';
    import cartBannerAd3 from './cart-banner-ad-3.vue';

    const cartBannerAdMap = {
        1: cartBannerAd1,
        2: cartBannerAd2,
        3: cartBannerAd3
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
        },
        computed: {
            variant() {
                return cartBannerAdMap[this.context.Data.RenderingId] || null;
            },
            variantClass() {
                return this.context.Data.RenderingId ? `-variant${this.context.Data.RenderingId}` : '';
            }
        }
    };
</script>

<template>
    <mix-in-ad-base v-bind="$props">
        <template
            v-if="context.Data.LogoImage && context.Data.LogoImage.Url"
            v-slot:logo-image>

            <img
                class="m-mixinAd__img"
                :src="context.Data.LogoImage.Url"
                :alt="context.Data.LogoImage.Alt" />
        </template>

        <template
            v-if="context.Data.CardImage && context.Data.CardImage.Url"
            v-slot:main-product-image>

            <img
                :src="context.Data.CardImage.Url"
                :alt="context.Data.CardImage.Alt" />
        </template>

        <template
            v-if="userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled"
            v-slot:add-to-cart>

            <o-shelf-configurator
                class="a-button"
                :class="context.Data.AddToCartStyle"
                :aria-label="context.Data.AddToCartAriaLabel"
                :sku="context.Data.ProductSku">

                {{ context.Labels.AddToCart || 'ADD TO CART' }}
            </o-shelf-configurator>
        </template>
    </mix-in-ad-base>
</template>

<script>
    import mixInAdBase, { baseProps } from './mix-in-ad-base.vue';

    export default {
        name: 'MMixInAd1',
        components: {
            mixInAdBase
        },
        props: {
            ...baseProps
        }
    };
</script>

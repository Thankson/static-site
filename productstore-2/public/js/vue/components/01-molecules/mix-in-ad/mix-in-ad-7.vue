<template>
    <mix-in-ad-base v-bind="$props">
        <template
            v-if="context.Data.CardImage && context.Data.CardImage.Url"
            v-slot:header-product-image>

            <img
                :src="context.Data.CardImage.Url"
                :alt="context.Data.CardImage.Alt" />
        </template>

        <template
            v-if="userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled"
            v-slot:add-to-cart>

            <o-shelf-configurator
                :class="[context.Data.AddToCartStyle,{ 'a-button': isCn }]"
                :aria-label="context.Data.AddToCartAriaLabel"
                :sku="context.Data.ProductSku">

                {{ context.Labels.AddToCart || 'ADD TO CART' }}
            </o-shelf-configurator>
        </template>

        <template v-if="context.Data.FooterText" v-slot:footer-text>
            <span v-html="context.Data.FooterText"></span>
        </template>
    </mix-in-ad-base>
</template>

<script>
    import mixInAdBase, { baseProps } from './mix-in-ad-base.vue';

    export default {
        name: 'MMixInAd7',
        components: {
            mixInAdBase
        },
        props: {
            ...baseProps
        },
        computed: {
            isCn() {
                return this.$env?.IsCn || false;
            }
        }
    };
</script>

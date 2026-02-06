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
    </mix-in-ad-base>
</template>

<script>
    import mixInAdBase, { baseProps } from './mix-in-ad-base.vue';

    export default {
        name: 'MMixInAd2',
        components: {
            mixInAdBase
        },
        props: {
            ...baseProps
        }
    };
</script>

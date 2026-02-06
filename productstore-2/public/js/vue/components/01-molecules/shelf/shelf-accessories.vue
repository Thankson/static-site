<template>
    <div class="m-shelfAccessory">
        <h3 class="m-shelfAccessory__heading">{{ labels.Accessories }}</h3>
        <div
            v-for="(accessory, index) in accessories"
            :key="index"
            class="m-shelfAccessory__item">

            <div class="m-shelfAccessory__details">
                <p class="m-shelfAccessory__desc">{{ accessory.Title }}</p>
            </div>
            <div class="m-shelfAccessory__fill">
                <img
                    :src="accessory.Image !== null ? accessory.Image.Url : 'https://placehold.co/68x68.jpg'"
                    :alt="accessory.Image !== null ? accessory.Image.Alt : ''"
                    class="m-shelfAccessory__img" />
            </div>
            <div class="m-shelfAccessory__controls">
                <o-shelf-configurator
                    class="m-shelfAccessory__btn"
                    :button-label="replaceToken(labels.AddToCart, accessory.Title)"
                    :is-free-product="isFreeProduct"
                    :sku="accessory.Sku"
                    :line-type="lineType"
                    :family-id="accessory.FamilyId"
                >
                    <a-icon size="inherit">add</a-icon>
                    <a-icon size="inherit">shopping_cart</a-icon>
                </o-shelf-configurator>
            </div>
        </div>
    </div>
</template>

<script>
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MShelfAccessories',
        props: {
            accessories: {
                type: Array,
                default: () => []
            },
            isFreeProduct: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => {}
            },
            lineType: {
                type: String,
                default: 'Normal'
            }
        },
        methods: {
            replaceToken
        }
    };
</script>

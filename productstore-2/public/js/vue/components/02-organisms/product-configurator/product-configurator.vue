<template>
    <component
        :is="configurator"
        v-if="configurator"
        :data="data"
        :impressions-title="impressionsTitle"
        :is-bogo="isBogo"
        :is-pdp="isPdp"
        :is-cart="isCart"
        :is-asian-models-for-try-on-tool="isAsianModelsForTryOnTool"
        :is-cn="isCn"
        :is-add-list="isAddList"
        :is-free-product="isFreeProduct"
        :is-riverbend="isRiverbend"
        :is-seasonal-promotion="isSeasonalPromotion"
        :qty-available="isSeasonalPromotion ? qtyAvailable : 0"
        :maximum-qty-tip="isSeasonalPromotion ? maximumQtyTip : null"
        :list-id="listId"
        :list-name="listName"
        :labels="labels"
        :pre-selected-sku="sku"
        :pre-selected-configurations="preSelectedConfigurations"
        :cart-position="cartPosition"
        :category="category"
        :readonly="readonly"
        :script-id-configurator="scriptIdConfigurator"
        :services-success="servicesSuccess"
        :services-error-reload-text="servicesErrorReloadText"
        :services-error-text="servicesErrorText"
        :show-carousel-on-confirm="showCarouselOnConfirm"
    >
        <template v-if="$slots['before'] || $scopedSlots['before']" v-slot:before="$configurator">
            <slot name="before" v-bind="$configurator" />
        </template>

        <template v-if="$slots['between'] || $scopedSlots['between']" v-slot:between="$configurator">
            <slot name="between" v-bind="$configurator" />
        </template>

        <template v-if="$slots['after'] || $scopedSlots['after']" v-slot:after="$configurator">
            <slot name="after" v-bind="$configurator" />
        </template>
    </component>
</template>

<script>
    import ConfiguratorNonKit from './configurator-non-kit.vue';
    import ConfiguratorKit from './configurator-kit.vue';
    import ConfiguratorMixMatch from './configurator-mix-match.vue';
    import ConfiguratorSingleProduct from './configurator-single-product.vue';

    export default {
        name: 'OProductConfigurator',
        props: {
            category: {
                type: String,
                default: ''
            },
            data: {
                type: Object,
                default: () => {}
            },
            isBogo: {
                type: Boolean,
                default: false
            },
            isFreeProduct: {
                type: Boolean,
                default: false
            },
            isPdp: {
                type: Boolean,
                default: false
            },
            isCart: {
                type: Boolean,
                default: true
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            isAddList: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => {}
            },
            listId: {
                type: [Number, String],
                default: null
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            isSeasonalPromotion: {
                type: Boolean,
                default: false
            },
            qtyAvailable: {
                type: Number,
                default: 0
            },
            maximumQtyTip: {
                type: String,
                default: null
            },
            listName: {
                type: String,
                default: null
            },
            cartPosition: {
                type: Number,
                default: null
            },
            oneStep: {
                type: Object,
                default: () => {}
            },
            /**
             * preselect facets for a specific sku
             * - may not be needed, but added as prop just in case
             */
            preSelectedSku: {
                type: String,
                default: null
            },
            /** @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration */
            /** @type {Array<Configuration>} */
            preSelectedConfigurations: {
                type: Array,
                default: () => []
            },
            /** can't add to cart, add to list, or add to bou */
            readonly: {
                type: Boolean,
                default: false
            },
            isAsianModelsForTryOnTool: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            servicesSuccess: {
                type: Boolean,
                default: false
            },
            servicesErrorReloadText: {
                type: String,
                default: ''
            },
            servicesErrorText: {
                type: String,
                default: ''
            },
            showCarouselOnConfirm: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            /**
             * configurator component to be used
             * @returns {Vue} Vue component to be rendered
             */
            configurator() {
                let configurator = null;
                switch (true) {
                    // Mix and Match - ShelfStyle === 'Secondary'
                    case this.data.ShelfStyle === 'Secondary':
                        configurator = ConfiguratorMixMatch;
                        break;
                    // Single Product - 1 product && empty Configurations && empty KitProducts
                    case
                        this.data.Products.length === 1 && // products array has only 1 item
                        !this.hasConfigurations && // configurations array doesn't exist or is empty
                        !this.hasKitProducts: // KitProducts array within that product doesn't exist or is empty

                        configurator = ConfiguratorSingleProduct;
                        break;
                    // Non-Configurable Kit - 1 product && Configurations > 1 && KitProducts > 1
                    case
                        this.data.Products.length === 1 &&
                        this.hasConfigurations &&
                        this.hasKitProducts:

                        configurator = ConfiguratorKit;
                        break;
                    // Non-Kit - Configurations > 0 && empty KitProducts
                    default:
                        configurator = ConfiguratorNonKit;
                        break;
                }
                return configurator;
            },
            hasConfigurations() {
                return this.data.Configurations && this.data.Configurations.filter(conf => conf.Type !== 'Static').length > 0;
            },
            /**
             * check if any product has kitproducts
             * @returns {boolean}
             */
            hasKitProducts() {
                let hasKitProducts = false;
                // start looping through first level of products
                for (let i = 0; i < this.data.Products.length; i++) {
                    // if any product has an array of KitProducts
                    if(this.data.Products[i].KitProducts && this.data.Products[i].KitProducts.length > 0) {
                        // it's determined this dataset has kit products and we should break out of loop
                        hasKitProducts = true;
                        break;
                    }
                }
                return hasKitProducts;
            },
            /**
             * currently selected sku
             */
            sku() {
                if(this.preSelectedSku) {
                    return this.preSelectedSku;
                }

                if(this.oneStep && this.oneStep.Sku) {
                    const skuFromData = this.data.Products.filter(product => product.Sku === this.oneStep.Sku);
                    if(skuFromData && skuFromData[0]) {
                        console.log('Product Configurator -- used Sku from One Step :: ', skuFromData);
                        return skuFromData[0].Sku;
                    }
                }

                if(this.data.Sku) {
                    return this.data.Sku;
                }

                return null;
            }
        }
    };
</script>

?<template>
    <div>
        <slot
            name="before"
            v-bind="slotProps" />

        <div v-if="servicesSuccess">
            <!-- wrapped in div so last-child styling is applied correctly -->
            <!-- loop on raw Configurations array instead of generated mixin array to prevent duplication -->
            <o-configurator-acc-mix-match
                v-for="(configuration, i) in data.Configurations"
                :key="i"
                :choose-label="labels.Choose"
                :includes-label="labels.Includes"
                :offsale-label="labels.OffSaleGenericMessage"
                :total-label="labels.TotalItems"
                :title="configuration.Title"
                :button-style="isPdp ? configuration.PdpStyle : configuration.ShelfStyle"
                :is-pdp="isPdp"
                :products="kit.Products || []"
                :options="configuration.Choices"
                :type="configuration.Type"
                :services-success="servicesSuccess"
                :selected-quantities="calcSelectedQuantities(configuration.Targets)"
                :keep-configuration-open="keepConfigurationOpen"
                @input="({ quantities, totalSelected }) => setQuantity({ targets: configuration.Targets, quantities, totalSelected })" />

            <o-configurator-included
                v-if="visibleIncludedConfigurations && visibleIncludedConfigurations.length > 0"
                :included-configurations="visibleIncludedConfigurations"
                :included-label="labels.Includes"
                :show-less-label="labels.ShowLess"
                :show-more-label="labels.ShowMore" />
        </div>
        <m-error-card v-if="!servicesSuccess" :reload-text="servicesErrorReloadText" :text="servicesErrorText"></m-error-card>

        <slot
            name="between"
            v-bind="slotProps" />

        <template v-if="!readonly">
            <m-cart-add-config
                v-if="isCart || isPdp"
                :bou-button-label="labels.BuoAddToCart"
                :button-label="labels.AddToCart"
                :can-one-step="!isPdp"
                :cart-position="cartPosition"
                :category="category"
                :configurations="selectedConfigurations"
                :configuration-errors="configurationErrors"
                :configuration-is-valid="configurationIsValid"
                :disabled="isOffsale"
                :has-configuration-error="isOffsale"
                :impressions-title="impressionsTitle"
                :is-bogo="isBogo"
                :is-free-product="isFreeProduct"
                :is-seasonal-promotion="isSeasonalPromotion"
                :qty-available="isSeasonalPromotion ? qtyAvailable : 0"
                :maximum-qty-tip="isSeasonalPromotion ? maximumQtyTip : null"
                :list-id="listId"
                :show-carousel-on-confirm="showCarouselOnConfirm"
                :sku="isComplete ? product.Sku : null"
                :update-label="labels.UpdateCart"
                :force-error="data.ForceErrorPatternLab || false"
                :labels="labels"
                @confirmation="reset" />

            <m-shoplists-add-config
                v-if="isAddList"
                :configurations="selectedConfigurations"
                :configuration-errors="configurationErrors"
                :configuration-is-valid="configurationIsValid"
                :family-id="product.FamilyId"
                :is-offsale="isOffsale"
                :list-id="listId"
                :list-name="listName"
                :localization="labels"
                :options="data.Configurations"
                :product="product"
                :pre-selected-configurations="product.ConfigurationSkus"
                :price="data.UserFlags && data.UserFlags.ViewMemberPricing ? preferredPrice : regularPrice"
                :points="points"
                :script-id-configurator="scriptIdConfigurator"
                :show-preferred-pricing="data.UserFlags && data.UserFlags.ViewMemberPricing"
                :sku="product.Sku"
                :view-points="data.UserFlags && data.UserFlags.ViewPoints" />
        </template>

        <slot
            name="after"
            v-bind="slotProps" />
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import configuratorMixin from '../../../mixins/configurator';

    export default {
        name: 'ConfiguratorMixMatch',
        mixins: [ configuratorMixin ],
        props: {
            category: {
                type: String,
                default: ''
            },
            data: {
                type: Object,
                default: () => {}
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            isBogo: {
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
            isAddList: {
                type: Boolean,
                default: false
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
            labels: {
                type: Object,
                default: () => {}
            },
            listId: {
                type: [Number, String],
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
            /** can't add to cart, add to list, or add to bou */
            readonly: {
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
        data() {
            return {
                /**
                 * map of configurations and selected choices in that configuration
                 * - 1st level property is fsku
                 * - 2nd level is key/value pair of facetRefinerId/quantity
                 * @type {Object<string, Object<string, number >>}
                 */
                quantities: {},
                /**
                 * total selected kit products
                 * - will need to be updated if there will ever be more than one possible parent Skus
                 */
                totalSelected: 0
            };
        },
        computed: {
            /**
             * overwrite mixin computed to simply be the normal configurations array
             */
            configurations() {
                return this.data.Configurations || [];
            },
            /** @typedef {{ FeatureSku: string, SelectedSku: string }} ConfigurationDef */
            /**
             * generate array of configuration objects to send to server
             * @returns {Array<ConfigurationDef>}
             */
            selectedConfigurations() {
                let selectedConfigurations = [];
                // loop through every configuration option that has values
                Object.entries(this.quantities).forEach(([ fsku, configuration ]) => {
                    // loop through every choice that has been selected
                    Object.entries(configuration).forEach(([ key, quantity ]) => {
                        // find kit object that matches current f-sku
                        const kit = this.data.Products[0].KitProducts.find(product => product.Sku === fsku);
                        if(kit) {
                            // find product object in kit products array
                            const product = kit.Products.find(product => product.FacetRefiners.includes(key));
                            if(product.Sku) {
                                for (let i = 0; i < quantity; i++) {
                                    selectedConfigurations.push({
                                        FeatureSku: fsku,
                                        SelectedSku: product.Sku
                                    });
                                }
                            }
                        }
                    });
                });

                selectedConfigurations = selectedConfigurations.concat(this.included);

                return selectedConfigurations;
            },
            /**
             * generate error message string when user doesn't have a configuration selected
             * @returns {Array<string>}
             */
            configurationErrors() {
                if(this.isOffsale) {
                    return this.offsaleMessage;
                }

                if(this.configurationIsValid) {
                    return;
                }

                // send as an array of one item because cart-add-config expects that format
                return [
                    this.labels.QuantitySelectedError?.replace('{0}', this.totalRequired) ?? `Please choose ${this.totalRequired} items`
                ];
            },
            /**
             * compute whether or not all configurations are selected
             * - there should only be one configuration for mix/match so we use that TotalRequired property
             * @returns {boolean}
             */
            configurationIsValid() {
                return this.totalSelected === this.totalRequired ?? false;
            },
            isComplete() {
                return this.configurationIsValid;
            },
            /**
             * compute whether all available products in kit are offsale
             * - if no products are available, need to disable add to cart and show offsale messsage
             * @returns {boolean}
             */
            isOffsale() {
                // For Add to List, offsale/sold out will always be false
                if(this.isAddList) {
                    return false;
                }

                if(!!this.product.Offsale || this.product.IsSoldOut) {
                    return true;
                }

                let isOffsale = true;

                this.data.Configurations.forEach(configuration => {
                    // need to loop through each configuration choice
                    for (let i = 0; i < configuration.Choices.length; i++) {
                        const refinerId = configuration.Choices[i]?.FacetRefinerId;
                        // find the corresponding product for this choice
                        const product = this.kit.Products?.find(product => product.FacetRefiners.includes(refinerId));
                        // if the product doesn't have an Offsale string, then it's available
                        if(product && !product.Offsale && !product.IsSoldOut) {
                            // if this is not offsale, break out of loop since the kit can no longer be offsale
                            isOffsale = false;
                            break;
                        }
                    }
                });

                return isOffsale;
            },
            /**
             * compute kit offsale message
             * @returns {Array<string>} array of error messages (needs to be an array for cart-add-config.vue to display properly)
             */
            offsaleMessage() {
                if(!!this.product.Offsale || this.product.IsSoldOut) {
                    return [ this.product.Offsale || this.labels.OffSaleGenericMessage ];
                }

                let offsaleMessage = [];

                if(this.isOffsale) {
                    // map offsale messages into an Array<string> format
                    const messages = this.kit?.Products?.map(product => product.Offsale);
                    // use the Set object to reduce array to only unique strings
                    const uniqueMessages = [ ...new Set(messages) ];
                    // if there is only one unique value, show that message. otherwise show generic localization message
                    offsaleMessage = uniqueMessages.length === 1 && uniqueMessages[0] ? uniqueMessages : [ this.labels.OffSaleGenericMessage ];
                }

                return offsaleMessage;
            },
            /**
             * return kit product from parent SKU's KitProducts array
             * - will need to change if there can be more than one kit product for mix/match
             */
            kit() {
                return this.product?.KitProducts.find(kit => kit.Products.length > 0);
            },
            concentratedLabel() {
                return this.labels?.Concentrated;
            },
            concentratedPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.ConcentratedPPUMeasurementType;
            },
            concentratedPreferredPricePerUnit() {
                return this.product?.PriceRange?.ConcentratedPreferredPricePerUnit;
            },
            concentratedRegularPricePerUnit() {
                return this.product?.PriceRange?.ConcentratedRegularPricePerUnit;
            },
            dilutedLabel() {
                return this.labels?.Diluted;
            },
            dilutedPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.DilutedPPUMeasurementType;
            },
            dilutedPreferredPricePerUnit() {
                return this.product?.PriceRange?.DilutedPreferredPricePerUnit;
            },
            dilutedRegularPricePerUnit() {
                return this.product?.PriceRange?.DilutedRegularPricePerUnit;
            },
            originalPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.OriginalPPUMeasurementType;
            },
            originalPreferredPricePerUnit() {
                return this.product?.PriceRange?.OriginalPreferredPricePerUnit;
            },
            originalRegularPricePerUnit() {
                return this.product?.PriceRange?.OriginalRegularPricePerUnit;
            },
            preferredPrice() {
                const price = this.product.PriceRange?.MinPreferredPrice || '';
                return !this.isFreeProduct ? price : this.getFreeProductPriceLabel(price, this.product.PriceRange?.RawMinPreferredPrice || 0);
            },
            preferredSavings() {
                if(this.labels.PreferredMemberSaving && this.product.PriceRange) {
                    return this.labels.PreferredMemberSaving.replace('{0}', this.product.PriceRange.PreferredMemberSavings);
                } else {
                    return '';
                }
            },
            product() {
                return this.data.Products?.[0] || {};
            },
            points() {
                return this.data.UserIsPreferred ? this.product.PriceRange?.MinPoints : null;
            },
            regularPrice() {
                const price = this.product.PriceRange?.MinRegularPrice || '';
                return !this.isFreeProduct ? price : this.getFreeProductPriceLabel(price, this.product.PriceRange?.RawMinRegularPrice || 0);
            },
            slotProps() {
                return {
                    accessories: this.product.Accessories,
                    description: this.product.Description,
                    hasPackSavings: this.product.PriceRange.HasPackSavings,
                    concentratedLabel: this.concentratedLabel,
                    concentratedPricePerUnitMeasurementType: this.concentratedPricePerUnitMeasurementType,
                    concentratedPreferredPricePerUnit: this.concentratedPreferredPricePerUnit,
                    concentratedRegularPricePerUnit: this.concentratedRegularPricePerUnit,
                    dilutedLabel: this.dilutedLabel,
                    dilutedPricePerUnitMeasurementType: this.dilutedPricePerUnitMeasurementType,
                    dilutedPreferredPricePerUnit: this.dilutedPreferredPricePerUnit,
                    dilutedRegularPricePerUnit: this.dilutedRegularPricePerUnit,
                    originalPricePerUnitMeasurementType: this.originalPricePerUnitMeasurementType,
                    originalPreferredPricePerUnit: this.originalPreferredPricePerUnit,
                    originalRegularPricePerUnit: this.originalRegularPricePerUnit,
                    packSavings: this.product.PriceRange.PackSavings,
                    preferredPrice: this.preferredPrice,
                    preferredSavings: this.preferredSavings,
                    points: this.points,
                    pdpLink: this.product.Url,
                    isOffsale: this.isOffsale,
                    isPreferred: this.data.UserIsPreferred,
                    isPriceRange: false,
                    isKit: true,
                    rawPoints: this.rawPoints,
                    regularPrice: this.regularPrice,
                    size: this.product.Size,
                    sku: this.product.Sku,
                    stamps: this.product.Stamps,
                    title: this.product.Name || '',
                    labels: this.labels
                };
            },
            /**
             * total products to select
             * - will need to change if there can be more than one Kit and/or parent product
             */
            totalRequired() {
                return this.data.Configurations?.find(configuration => {
                    // configuration will be correct if the current mix/match kit is in it's Targets array
                    return configuration.Targets.includes(this.kit.Sku);
                })?.TotalRequired ?? 0;
            },
            keepConfigurationOpen() {
                return this.data.KeepConfigurationOpen;
            }
        },
        watch: {
            preSelectedConfigurations() {
                this.generateSelectedFacets();
            }
        },
        mounted() {
            if(this.preSelectedConfigurations) {
                this.generateSelectedFacets();
            }

            if(this.isPdp) {
                this.$nextTick(() => {
                    this.setProduct({
                        sku: this.product.Sku,
                        name: this.product.Name,
                        url: this.product.Url,
                        size: this.product.Size,
                        stamps: this.product.Stamps,
                        userFlags: this.data.UserFlags,
                        // the property "weight" is being used in riverbend
                        weight: this.product.Weight
                    });
                });
            }
        },
        methods: {
            ...mapActions('productDetailPage', ['setProduct']),

            /**
             * generate object of pre-selected facetRefinerId/quantity pairs
             * @type {Object<string, number>}
             */
            calcSelectedQuantities(targets) {
                let quantities = {};
                targets.forEach(target => {
                    quantities = {
                        ...quantities,
                        ...this.quantities[target]
                    };
                });
                return quantities;
            },
            /**
             * derive which facets are selected based off of a provided Sku
             */
            generateSelectedFacets() {
                /**
                 * mapping of fskus to skus to quantities
                 * - 1st level property is fsku
                 * - 2nd level is key/value pair of sku/quantity
                 * @type {Object<string, Object<string, number>>}
                 */
                let quantityMap = {};

                // first we'll set up the map to make it easier to derive the selected configurations
                this.preSelectedConfigurations.forEach(configuration => {
                    if(!quantityMap[configuration.FeatureSku]) {
                        quantityMap[configuration.FeatureSku] = {};
                    }

                    if(!quantityMap[configuration.FeatureSku][configuration.SelectedSku]) {
                        quantityMap[configuration.FeatureSku][configuration.SelectedSku] = 0;
                    }

                    quantityMap[configuration.FeatureSku][configuration.SelectedSku]++;
                });

                // create quantities object here to avoid direct mutations
                let quantities = { ...this.quantities };

                Object.entries(quantityMap).forEach(([ fsku, values ]) => {
                    let kitProduct = null;

                    // loop through products to find correct kitProduct
                    for (let i = 0; i < this.data.Products.length; i++) {
                        kitProduct = this.data.Products[i].KitProducts.find(product => product.Sku === fsku);
                        if(kitProduct) {
                            break;
                        }
                    }

                    // if there is a matching kit product, and it has a populated Products array then it is configurable
                    if(kitProduct && kitProduct.Products && kitProduct.Products.length > 0) {
                        // from here we need to loop through our key/value pair of sku/quantity
                        Object.entries(values).forEach(([ sku, quantity ]) => {
                            // find the matching product from sku
                            const product = kitProduct.Products.find(product => product.Sku === sku);
                            if(product) {
                                if(!quantities[fsku]) {
                                    // make sure this is not undefined
                                    quantities[fsku] = {};
                                }

                                // using fsku, find related configuration in configurations array
                                const configuration = this.configurations.find(config => config.Targets.includes(fsku));

                                let refinerId = null;
                                // loop through choices to find correct facet refiner
                                for (const index in configuration.Choices.map(choice => choice.FacetRefinerId)) {
                                    const choice = configuration.Choices[index];
                                    if(product.FacetRefiners.includes(choice.FacetRefinerId)) {
                                        // if product has a matching FacetRefiner, this refiner id is the match
                                        refinerId = choice.FacetRefinerId;
                                        break;
                                    }
                                }

                                if(refinerId) {
                                    quantities[fsku][refinerId] = quantity;
                                }
                            }
                        });
                    }
                });

                this.quantities = quantities;
            },
            reset() {
                this.quantities = {};
                this.totalSelected = 0;
            },
            setQuantity({ targets, quantities, totalSelected }) {
                const map = { ...this.quantities };

                targets.forEach(target => {
                    if(Object.keys(quantities).length > 0) {
                        map[target] = quantities;
                    } else {
                        delete map[target]; // keep object clean to prevent unnecessary loop iterations
                    }
                });

                this.quantities = map;
                this.totalSelected = totalSelected;
            }
        }
    };
</script>

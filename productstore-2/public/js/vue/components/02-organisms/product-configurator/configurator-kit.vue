<template>
    <div>
        <slot
            name="before"
            v-bind="slotProps" />

        <div v-if="servicesSuccess">
            <!-- wrapped in div so last-child styling is applied correctly -->
            <o-configurator-acc
                v-for="(configuration, i) in configurations"
                ref="accordion"
                :key="i"
                :all-label="labels.All"
                :choose-label="labels.Choose"
                :offsale-label="labels.OffSaleGenericMessage"
                :title="configuration.Title"
                :subtitle="configuration.Subtitle"
                :button-style="isPdp ? configuration.PdpStyle : configuration.ShelfStyle"
                :is-pdp="isPdp"
                :products="getProducts(configuration.Targets)"
                :filtered-products="filteredProducts[i] ? filteredProducts[i].products : []"
                :filters="configuration.Filters"
                :options="configuration.Choices"
                :selected-refiner-id="selectedFacets[i] ? selectedFacets[i].id : null"
                :targets="configuration.Targets"
                :valid-refiner-ids="validRefinerIds"
                :try-on-tool-type="tryOnToolType"
                :services-success="servicesSuccess"
                :services-error-reload-text="servicesErrorReloadText"
                :services-error-text="servicesErrorText"
                :keep-configuration-open="keepConfigurationOpen"
                @input="facet => setFacet(facet, i)" />

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
                :family-id="product.FamilyId ? product.FamilyId : data.FamilyInfo ? data.FamilyInfo.Id : ''"
                :has-configuration-error="isOffsale"
                :impressions-title="impressionsTitle"
                :is-bogo="isBogo"
                :is-free-product="isFreeProduct"
                :list-id="listId"
                :is-seasonal-promotion="isSeasonalPromotion"
                :qty-available="isSeasonalPromotion ? qtyAvailable : 0"
                :maximum-qty-tip="isSeasonalPromotion ? maximumQtyTip : null"
                :show-carousel-on-confirm="showCarouselOnConfirm"
                :sku="isComplete ? product.Sku : null"
                :update-label="labels.UpdateCart"
                :force-error="data.ForceErrorPatternLab || false"
                :labels="labels"
                @submitError="onSubmitError" />

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
                :view-points="data.UserFlags && data.UserFlags.ViewPoints"
                @submitError="onSubmitError" />
        </template>

        <slot
            name="after"
            v-bind="slotProps" />
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import configuratorMixin from '../../../mixins/configurator';
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'ConfiguratorKit',
        mixins: [
            configuratorMixin,
            safeId
        ],
        safeIds: [
            'includesId'
        ],
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
                 * determines which facet accordion expands next
                 * @type {number}
                 */
                activeFacet: null,
                includesId: ''
            };
        },
        computed: {
            /**
             * final array of selected configurations to send to server
             * @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration
             * @returns {Array<Configuration>}
             */
            selectedConfigurations() {
                if(!this.configurationIsValid) {
                    return [];
                }

                let configurations = this.filteredProducts.map(product => ({
                    FeatureSku: product.fsku,
                    SelectedSku: product.selectedProduct?.Sku || null
                }));

                return configurations.concat(this.included);
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

                let errors = [];

                this.selectedFacets.forEach((facet, i) => {
                    if(!facet.id && !this.configurations[i].Sku) {
                        const facetTitle = this.configurations[i].Title;
                        errors.push(this.labels.UnselectedFacetError?.replace('{0}', facetTitle) || `Please select a ${facetTitle}`);
                    }
                });

                return errors;
            },
            /**
             * compute whether or not all configurations are selected
             * @returns {boolean}
             */
            configurationIsValid() {
                const invalidConfigurations = this.selectedFacets.filter((facet, i) => !facet.id && !this.configurations[i].Sku);

                return invalidConfigurations.length === 0;
            },
            isComplete() {
                return this.configurationIsValid;
            },
            /**
             * compute whether all available products in kit are offsale
             * - if any one product in the kit isn't available (a configuration can't be selected), need to disable add to cart and show offsale messsage
             * @returns {boolean}
             */
            isOffsale() {
                // For Add to List, offsale/sold out will always be false
                if(this.isAddList) {
                    return false;
                }

                if(this.product.Offsale || this.product.IsSoldOut) {
                    return true;
                }

                let isOffsale = false;

                // use this.data.Configurations to avoid looping through duplicates in this.configurations
                for (let i = 0; i < this.data.Configurations.length; i++) {
                    const configuration = this.data.Configurations[i];
                    const fsku = configuration.Targets[0];
                    const kit = this.kitProducts.find(product => product.Sku === fsku);
                    if(kit) {
                        // need to loop through each configuration choice
                        const offsaleProducts = kit.Products.filter(product => product.Offsale || product.IsSoldOut);
                        if(offsaleProducts.length === kit.Products.length) {
                            isOffsale = true;
                            break;
                        }
                    }
                }

                return isOffsale;
            },
            isTryOnTool() {
                return this.data.FamilyInfo.TryOnTool;
            },
            tryOnToolType() {
                return this.data.FamilyInfo?.tryOnToolType || '';
            },
            /**
             * compute kit offsale message
             * @returns {Array<string>} array of error messages (needs to be an array for cart-add-config.vue to display properly)
             */
            offsaleMessage() {
                if(this.product.Offsale || this.product.IsSoldOut) {
                    return [ this.product.Offsale || this.labels.OffSaleGenericMessage ];
                }

                let offsaleMessage = [];

                if(this.isOffsale) {
                    let messages = [];

                    this.data?.Configurations?.forEach(configuration => {
                        const fsku = configuration.Targets[0];
                        const kit = this.kitProducts.find(product => product.Sku === fsku);
                        if(kit) {
                            kit.Products.forEach(product => {
                                if(product.Offsale || product.IsSoldOut) {
                                    messages.push(product.Offsale);
                                }
                            });
                        }
                    });
                    // use the Set object to reduce array to only unique strings
                    const uniqueMessages = [ ...new Set(messages) ];
                    // if there is only one unique value, show that message. otherwise show generic localization message
                    offsaleMessage = uniqueMessages.length === 1 && uniqueMessages[0] ? uniqueMessages : [ this.labels.OffSaleGenericMessage ];
                }

                return offsaleMessage;
            },
            /**
             * @typedef {{ fsku: string, products: Array<Object<string, any>>, selectedProduct: Object<string, any>, validRefinersIds: Array<string> }} FilteredProduct
             * filtered products mapped to the index of their corresponding facet
             * - multi-dimensional array runs parallel to the selectedFacets array
             * - each facet for kits matches up 1:1 with a product (no filtering needed)
             * @returns {Array<FilteredProduct>}
             */
            filteredProducts() {
                return this.selectedFacets
                    .filter(facet => !facet.included)
                    .map(facet => {
                        // use first array item of facet Targets array because Kit configurator doesn't currently support more
                        let fsku = facet.targets[0];
                        let products = [];
                        let selectedProduct = null;
                        let validRefinerIds = [];

                        if(!facet.included) {
                            // first find the kit product
                            const kit = this.kitProducts.find(product => {
                                return product.Sku === fsku;
                            });

                            if(kit) {
                                products = kit.Products;

                                if(facet.id) {
                                    selectedProduct = kit.Products?.find(product => product.FacetRefiners?.includes(facet.id) || false) || null;
                                    validRefinerIds = [ facet.id ];
                                } else {
                                    kit.Products.forEach(product => {
                                        validRefinerIds.push(...product.FacetRefiners);
                                    });

                                    validRefinerIds = [ ...new Set(validRefinerIds) ];
                                }
                            }
                        }

                        return {
                            fsku,
                            products,
                            selectedProduct,
                            validRefinerIds
                        };
                    });
            },
            /**
             * kit product available for this sku
             * - will only have one parent product (may change)
             * @returns {Array<Object<string, any>>}
             */
            kitProducts() {
                return this.product?.KitProducts || [];
            },
            /**
             * price to show to preferred members
             * - shouldn't be a range of prices sice there is only one parent kit
             * @returns {string}
             */
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
            originalPriceMember() {
                return this.product?.PriceRange?.OriginalPriceMember;
            },
            originalPriceNonMember() {
                return this.product?.PriceRange?.OriginalPriceNonMember;
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
            /**
             * preferred savings message to show
             * - returns product message if available but will fall back to family if not
             * @returns {string}
             */
            preferredSavings() {
                if(this.labels.PreferredMemberSaving && this.product.PriceRange) {
                    return this.labels.PreferredMemberSaving.replace('{0}', this.product.PriceRange.PreferredMemberSavings);
                } else {
                    return '';
                }
            },
            /**
             * product object to pull details from
             * - kit products will always only have one item in the products array (may change)
             * @returns {Object<string, any>}
             */
            product() {
                return this.data.Products?.[0] || {};
            },
            /**
             * points to be displayed to user based off of facet refiners chosen
             * - shouldn't be a range of prices sice there is only one parent kit
             * @returns {string}
             */
            points() {
                // if product is narrowed down, there shouldn't be a range and we return min points
                return this.product.PriceRange.MinPoints;
            },
            /**
             * price to show to non-preferred members
             * - shouldn't be a range of prices sice there is only one parent kit
             * @returns {string}
             */
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
                    // this is hard coded as false, because this component will never return a price range
                    isPriceRange: false,
                    originalPriceMember: this.originalPriceMember,
                    originalPriceNonMember: this.originalPriceNonMember,
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
            validRefinerIds() {
                const validRefinerIds =
                    this.configurations
                        .map(configuration => configuration.Choices || [])
                        .map(choices => choices.map(choice => choice.FacetRefinerId || []));
                const uniqueValidIds = new Set(validRefinerIds.flat());
                return [ ...uniqueValidIds ];
            },
            keepConfigurationOpen() {
                return this.data.KeepConfigurationOpen;
            }
        },
        watch: {
            /**
             * whenever a facet is selected, we need to do a few of things
             * - set the activeFacet that controls which accordion is expanded
             * - filter the product array to possible products based on selected facets
             */
            selectedFacets() {
                this.setActiveFacet();

                if(!this.isTryOnTool) {
                    this.toggleAccordionVisibility();
                }
            },
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
             * derive which facets are selected based off of a provided Sku
             */
            generateSelectedFacets() {
                let selectedFacets = [ ...this.selectedFacets ];

                // loop through each selected configuration
                this.preSelectedConfigurations.forEach(selectedConfiguration => {
                    let kitProduct = null;

                    // find corresponding kit object from FeatureSku and break out of loop
                    for (let i = 0; i < this.data.Products.length; i++) {
                        kitProduct = this.data.Products[i].KitProducts.find(kit => kit.Sku === selectedConfiguration.FeatureSku);
                        // if found, break out of loop
                        if(kitProduct) {
                            break;
                        }
                    }

                    if(kitProduct) {
                        // find corresponding product from the SelectedSku
                        const product = kitProduct.Products.find(product => product.Sku === selectedConfiguration.SelectedSku);
                        if(product) {
                            const refiners = product.FacetRefiners;
                            if(refiners && refiners.length > 0) {
                                // loop through configurations array since it's length with match 1:1 to selectedFacets array
                                for (let configurationIndex = 0; configurationIndex < this.configurations.length; configurationIndex++) {
                                    const configuration = this.configurations[configurationIndex];
                                    // only check this configuration if it doesn't already have an assigned facetRefinerId
                                    if(!selectedFacets[configurationIndex].id) {
                                        // loop through choices
                                        for (let choiceIndex = 0; choiceIndex < configuration.Choices.length; choiceIndex++) {
                                            const choice = configuration.Choices[choiceIndex];
                                            // if refiners array of this product incudes this choice's FacetRefinerId, then it's a selected option
                                            if(refiners.includes(choice.FacetRefinerId)) {
                                                // setup selectedFacet object for this facet
                                                selectedFacets[configurationIndex] = {
                                                    id: choice.FacetRefinerId,
                                                    targets: configuration.Targets
                                                };

                                                break;
                                            }
                                        }

                                        // if this facet now has a selection, we can break out of loop
                                        if(selectedFacets[configurationIndex].id) {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                this.selectedFacets = selectedFacets;
            },
            /**
             * get all products associated with a configuration
             * @param {Array<string>} targets array of fsku target Ids
             * @returns {Array<Object<string, any>>} array of all related products
             */
            getProducts(targets) {
                let products = [];
                targets.forEach(target => {
                    const kitProduct = this.kitProducts.find(product => product.Sku === target);
                    if(kitProduct) {
                        products = products.concat(kitProduct.Products);
                    }
                });
                return products;
            },
            onSubmitError() {
                this.activeFacet = this.selectedFacets.findIndex(facet => facet.id === null && !facet.included);
                this.toggleAccordionVisibility();
            },
            /**
             * whenever a facet is selected, we need to set the activeFacet prop
             * - this determines which facet accordion expands next
             * - business logic dictates that only non-selected facets after the last selected facet will expand
             */
            setActiveFacet() {
                if(this.selectedFacets.find(facet => facet.id)) {
                    // first find the index of the last facet with a selection
                    const lastSelectedIndex = this.selectedFacets.map(facet => facet.id && !facet.included).lastIndexOf(true);
                    // the configuration to open will be the next non-included facet without a selection
                    this.activeFacet = this.selectedFacets.findIndex((facet, i) => {
                        return i > lastSelectedIndex && facet.id === null && !facet.included;
                    });
                } else {
                    this.activeFacet = 0;
                }
            },
            /**
             * sets facet refiner id at the correct index location of the selectedFacets array
             * @param {string?} id facet refiner id
             * @param {number} index location in the configurations array
             */
            setFacet(facet, index) {
                // create new array instance to avoid mutations
                let selectedFacets = [ ...this.selectedFacets ];
                selectedFacets[index] = facet;
                this.selectedFacets = [ ...selectedFacets ];
            },
            toggleAccordionVisibility() {
                const accordions = this.$refs['accordion'];
                accordions && accordions.forEach((acc, i) => {
                    if(i === this.activeFacet) {
                        acc.$emit('show');
                    } else if(this.selectedFacets[i] && this.selectedFacets[i].id) {
                        acc.$emit('hide');
                    }
                });
            }
        }
    };
</script>

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
                :button-style="isPdp ? configuration.PdpStyle : configuration.ShelfStyle"
                :is-pdp="isPdp"
                :has-try-on-tool-errors="isError"
                :try-on-tool-error-label="labels.ColorNotAvailable"
                :is-asian-models-for-try-on-tool="isAsianModelsForTryOnTool"
                :is-cn="isCn"
                :is-try-on-tool="isTryOnTool"
                :try-on-tool-type="tryOnToolType"
                :products="data.Products"
                :filtered-products="filteredAccordionProducts[i]"
                :filters="configuration.Filters"
                :options="configuration.Choices"
                :selected-refiner-id="selectedFacets[i] ? selectedFacets[i].id : null"
                :valid-refiner-ids="validRefinerIds[i]"
                :services-success="servicesSuccess"
                :services-error-reload-text="servicesErrorReloadText"
                :services-error-text="servicesErrorText"
                :is-visible="isVisible"
                :pre-selected-sku="preSelectedSku"
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

        <template v-if="!readonly && servicesSuccess">
            <m-cart-add-config
                v-if="isCart || isPdp"
                :bou-button-label="labels.BuoAddToCart"
                :button-label="labels.AddToCart"
                :can-one-step="!isPdp"
                :cart-position="cartPosition"
                :category="category"
                :configurations="included"
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
                :pre-selected-sku="preSelectedSku"
                :force-error="data.ForceErrorPatternLab || false"
                :labels="labels"
                @submitError="onSubmitError" />

            <m-shoplists-add-config
                v-if="isAddList"
                :configurations="included"
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
    import configuratorMixin, { EMPTY_FACET } from '../../../mixins/configurator';
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'ConfiguratorNonKit',
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
        data() {
            return {
                /**
                 * determines which facet accordion expands next
                 * @type {number}
                 */
                activeFacet: null,
                /**
                 * array of possible products based off of selected facet refiners
                 * - will have only one item if all facte refiners are selected
                 * @returns {Array<Object<string, any>>}
                 */
                filteredProducts: [],
                /**
                 * matrix of filtered products for each accordion
                 * - number of array items match 1 to 1 with the amount of facets (aka: accordions or rows)
                 * - each array item's value is an array of products
                 * - each accordion needs a filtered product array without the refiner ID selected by that group
                 * - this is needed to properly compute offsale messaging
                 * @returns {Array<Array<Object<string, any>>>}
                 */
                filteredAccordionProducts: [],
                /**
                 * price to be displayed to preferred members
                 * - based off of facet refiners chosen
                 * - can return a range if prices in filteredProducts array don't match
                 * @type {string}
                 */
                preferredPrice: '',
                /**
                 * determines whether or not the price displayed is a range
                 * - if the price is a range, then strikethrough price is not displayed
                 * @type {boolean}
                 */
                isPriceRange: false,
                /**
                 * price to be displayed to non-preferred members
                 * - based off of facet refiners chosen
                 * - can return a range if prices in filteredProducts array don't match
                 * @type {string}
                 */
                regularPrice: '',
                /**
                 * matrix of all unique refiner ids per facet (aka: accordion or row)
                 * - number of array items match 1 to 1 with the amount of facets (aka: accordions or rows)
                 * - each array item's value is an array of valid refiner ids
                 * @returns {Array<string>}
                 */
                validRefinerIds: []
            };
        },
        computed: {
            ...mapState('productDetailPage', { pdpProduct: 'product' }),
            ...mapState('tryOnTool', ['isError']),

            /**
             * generate error message string when user doesn't have a configuration selected
             * @returns {Array<string>}
             */
            configurationErrors() {
                if(this.isOffsale) {
                    return this.offsaleMessage;
                }

                if(this.configurationIsValid) {
                    return [];
                }

                let errors = [];

                this.selectedFacets.forEach((facet, i) => {
                    if(!facet.id && !this.data.Configurations[i].Sku) {
                        const facetTitle = this.data.Configurations[i].Title;
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
            /**
             * user has selected all configurations and product is narrowed down to a single sku
             * @returns {boolean}
             */
            isComplete() {
                return this.filteredProducts.length === 1;
            },
            /**
             * check if pre-selected product or full family is offsale
             * - family can be offsale if any full facet row can't be selected because all choices only associate to offsale products
             * @return {boolean}
             */
            isOffsale() {
                // For Add to List, offsale/sold out will always be false
                if(this.isAddList) {
                    return false;
                }

                if(this.preSelectedSku) {
                    return !!this.product.Offsale || this.product.IsSoldOut;
                }

                let isOffsale = true;

                for (let i = 0; i < this.data.Configurations.length; i++) {
                    const configuration = this.data.Configurations[i];
                    // total number of offsale choices in this Configuration
                    let offsaleFacetCount = 0;
                    configuration.Choices.forEach(choice => {
                        const refinerId = choice.FacetRefinerId;
                        // get all products related to this refiner
                        const products = this.data.Products.filter(product => product.FacetRefiners.includes(refinerId));
                        // get all offsale products in products array
                        const offsaleProducts = products.filter(product => product.Offsale || product.IsSoldOut);
                        // if the length of both array's length is the same, then this refiner is only associated with offsale products
                        if(products.length === offsaleProducts.length) {
                            offsaleFacetCount++;
                        }
                    });

                    // if there is at least one choice/refiner in this facet that is associated with non-offsale products, then the family can't be offsale
                    if(offsaleFacetCount < configuration.Choices.length) {
                        isOffsale = false;
                        break;
                    }
                }

                return isOffsale;
            },
            isTryOnTool() {
                return this.data.FamilyInfo.TryOnTool;
            },
            tryOnToolType() {
                return this.data.FamilyInfo?.TryOnToolType || '';
            },
            /**
             * compute family offsale message
             * - this message is only if the whole family is offsale
             * @returns {Array<string>} array of error messages (needs to be an array for cart-add-config.vue to display properly)
             */
            offsaleMessage() {
                let offsaleMessage = [];

                if(this.isOffsale) {
                    if(this.preSelectedSku && this.isComplete) {
                        return [ this.product.Offsale || this.labels.OffSaleGenericMessage ];
                    }

                    // map offsale messages into an Array<string> format
                    const messages = this.data.Products.map(product => product.Offsale);
                    // use the Set object to reduce array to only unique strings
                    const uniqueMessages = [ ...new Set(messages) ];
                    // if there is only one unique value, show that message. otherwise show generic localization message
                    offsaleMessage = uniqueMessages.length === 1 && uniqueMessages[0] ? uniqueMessages : [ this.labels.OffSaleGenericMessage ];
                }

                return offsaleMessage;
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
            preferredSavings() {
                if(this.labels.PreferredMemberSaving && this.product.PriceRange) {
                    return this.labels.PreferredMemberSaving.replace('{0}', this.product.PriceRange.PreferredMemberSavings);
                } else {
                    return '';
                }
            },
            /**
             * product object to pull details from
             * - will fallback to family object until filterProducts is narrowed down to one item
             * @returns {Object<string, any>}
             */
            product() {
                // filteredProducts array will only have 1 item if all facets selected
                if(this.isComplete) {
                    return this.filteredProducts[0];
                }

                // fallback to family info if user hasn't selected enough facets to narrow down to a single product
                return this.data.FamilyInfo;
            },
            /**
             * points to be displayed to user based off of facet refiners chosen
             * - can return a range if prices in filteredProducts array don't match
             * @returns {string}
             */
            points() {
                // if not preferred, return null right away to avoid calculations
                if(!this.data.UserFlags?.ViewPoints) {
                    return null;
                }

                const filteredProducts = this.filteredProducts.length > 0 ? this.filteredProducts : this.data.Products;

                // if product is narrowed down, there shouldn't be a range and we return min points
                // Or if there are no products available, use Family info price
                if(this.isComplete || this.data.Products.length < 1) {
                    return this.product.PriceRange.MinPoints;
                }

                const min = Math.min(...filteredProducts.map(product => product.PriceRange.RawMinPoints));
                const max = Math.max(...filteredProducts.map(product => product.PriceRange.RawMaxPoints));

                // if min === max, then all prices must be the same and we can display the first array item's display prop value
                if(min === max) {
                    return filteredProducts[0].PriceRange.MinPoints;
                }

                // we only reach this point if there is a range, so we need to generate the range string
                // need to use find so we can return the display value and not the raw value
                return filteredProducts.find(product => min === product.PriceRange.RawMinPoints).PriceRange.MinPoints +
                    ' - ' +
                    filteredProducts.find(product => max === product.PriceRange.RawMaxPoints).PriceRange.MaxPoints;
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
                    isPriceRange: this.isPriceRange,
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
                    rawPoints: this.rawPoints,
                    regularPrice: this.regularPrice,
                    size: this.product.Size,
                    sku: this.product.Sku,
                    stamps: this.product.Stamps,
                    title: this.product.Name || '',
                    labels: this.labels
                };
            },
            isVisible() {
                return this.isCn && this.isTryOnTool;
            },
            keepConfigurationOpen() {
                return this.data.KeepConfigurationOpen;
            }
        },
        watch: {
            /**
             * whenever products by row is filtered, we need to calculate the validRefinerId matrix
             */
            filteredAccordionProducts() {
                this.calculateValidRefinerIds();
            },
            /**
             * whenever the product array is filtered, we need to calculate pricing and validRefinerIds
             */
            filteredProducts() {
                this.preferredPrice = this.calculatePriceRange({
                    minProp: 'MinPreferredPrice',
                    rawMinProp: 'RawMinPreferredPrice',
                    maxProp: 'MaxPreferredPrice',
                    rawMaxProp: 'RawMaxPreferredPrice'
                });

                this.regularPrice = this.calculatePriceRange({
                    minProp: 'MinRegularPrice',
                    rawMinProp: 'RawMinRegularPrice',
                    maxProp: 'MaxRegularPrice',
                    rawMaxProp: 'RawMaxRegularPrice'
                });

                this.calculateFilteredAccordionProducts();
            },
            async product(newValue, oldValue) {
                const isNewLocalSku = newValue.Sku !== oldValue.Sku;
                const isNewPdpSku = newValue.Sku !== this.pdpProduct.sku;
                const isNewSku = (isNewLocalSku && isNewPdpSku) || !oldValue.Sku;

                if(isNewSku && this.isPdp) {
                    // any time selection is made or unselected,
                    // send product or family up to pdp
                    await this.setProduct({
                        sku: this.product.Sku,
                        name: this.product.Name,
                        url: this.product.Url,
                        size: this.product.Size,
                        stamps: this.product.Stamps,
                        userFlags: this.data.UserFlags,
                        // the property "weight" is being used in riverbend
                        weight: this.product.Weight
                    });
                }
            },
            /**
             * whenever a facet is selected, we need to do a few of things
             * - set the activeFacet that controls which accordion is expanded
             * - filter the product array to possible products based on selected facets
             */
            selectedFacets() {
                this.setActiveFacet();
                this.filteredProducts = this.calculateFilteredProducts();

                if(!this.isTryOnTool) {
                    this.toggleAccordionVisibility();
                }
            },
            preSelectedSku() {
                this.generateSelectedFacets();
            }
        },
        mounted() {
            if(this.preSelectedSku) {
                this.generateSelectedFacets();
            }
        },
        methods: {
            ...mapActions('productDetailPage', ['setProduct']),

            /**
             * calculate filtered product array for an accordion item
             * - each accordion needs a filtered product array without any refiner ID selected by that group
             * - this is needed to properly compute offsale messaging
             * @param {string|number} index // array index of facet
             * @returns {Array<Object<string, any>>} array of filtered products
             */
            calculateAccordionProducts(index) {
                let selectedFacets = [ ...this.selectedFacets ];
                if(selectedFacets[index]) {
                    selectedFacets[index] = EMPTY_FACET;
                }
                return this.calculateFilteredProducts(selectedFacets);
            },
            /**
             * calculate filtered product array for each accordion item
             * - each accordion needs a filtered product array without any refiner ID selected by that group
             * - this is needed to properly compute offsale messaging
             */
            calculateFilteredAccordionProducts() {
                const filteredAccordionProducts = [];

                this.configurations.forEach((config, i) => {
                    filteredAccordionProducts[i] = this.calculateAccordionProducts(i);
                });

                this.filteredAccordionProducts = filteredAccordionProducts;
            },
            /** @typedef {{ id: string?, targets: Array<string> }} SelectedFacet */
            /**
             * calculate filtered product array based off of selectedFacets
             * @param {Array<SelectedFacet>} [selectedFacets=this.selectedFacets] array of selected facets
             * @returns {Array<Object<string, any>>} array of filtered products
             */
            calculateFilteredProducts(selectedFacets = this.selectedFacets) {
                if(!selectedFacets || selectedFacets.length < 1) {
                    return this.data.Products;
                }

                let products = [ ...this.data.Products ];
                selectedFacets.forEach(facet => {
                    // only filter if this facet option is selected (not null)
                    if(facet.id) {
                        products = products.filter(product => {
                            const refiners = product.FacetRefiners;
                            for (let i = 0; i < refiners.length; i++) {
                                if(refiners[i] === facet.id) {
                                    // if product has this facet refiner tag, break out of for loop and add to array
                                    return true;
                                }
                            }

                            // otherwise, don't add this to filtered array
                            return false;
                        });
                    }
                });
                return products;
            },
            /** @typedef {{ minProp: string, rawMinProp:string, maxProp: string, rawMaxProp: string }} PriceProperties */
            /**
             * find price & price ranges
             * - arguments are the object property names for the price types (regular vs preferred)
             * @param {PriceProperties} properties property names for which price to calc
             * @returns {string} generated string for range or a single price
             */
            calculatePriceRange({ minProp, rawMinProp, maxProp, rawMaxProp }) {
                // reset isPriceRange before calculate
                this.isPriceRange = false;

                const filteredProducts = this.filteredProducts.length > 0 ? this.filteredProducts : this.data.Products;

                // if product is narrowed down, there shouldn't be a range and we return min price
                // Or if there are no products available, use Family info price

                if(this.isComplete || this.data.Products.length < 1) {
                    const price = this.product.PriceRange[minProp];
                    return !this.isFreeProduct ? price : this.getFreeProductPriceLabel(price, this.product.PriceRange[rawMinProp] || 0);
                }

                const min = Math.min(...filteredProducts.map(product => product.PriceRange[rawMinProp]));
                const max = Math.max(...filteredProducts.map(product => product.PriceRange[rawMaxProp]));

                // if min === max, then all prices must be the same and we can display the first array item's display prop value
                if(min === max) {
                    const price = filteredProducts[0].PriceRange[minProp];
                    return !this.isFreeProduct ? price : this.getFreeProductPriceLabel(price, this.filteredProducts[0].PriceRange[rawMinProp]);
                }

                // we only reach this point if there is a range, so we need to generate the range string
                // use find so we can return the display value and not the raw value
                // setting price range as true, so we do not display strike through price
                this.isPriceRange = true;
                const minProduct = filteredProducts.find(product => min === product.PriceRange[rawMinProp]);
                const minProductPrice = minProduct.PriceRange[minProp];
                const minProductPriceFinal = !this.isFreeProduct ? minProductPrice : this.getFreeProductPriceLabel(minProductPrice, minProduct.PriceRange[rawMinProp]);

                const maxProduct = filteredProducts.find(product => max === product.PriceRange[rawMaxProp]);
                const maxProductPrice = maxProduct.PriceRange[maxProp];
                const maxProductPriceFinal = !this.isFreeProduct ? maxProductPrice : this.getFreeProductPriceLabel(maxProductPrice, maxProduct.PriceRange[rawMaxProp]);
                // when price range comes to 'Free-Free', we should display 'Free' instead of 'Free - Free'
                const isBothWelcomeProductsFree = minProductPriceFinal === maxProductPriceFinal;
                return isBothWelcomeProductsFree && this.isFreeProduct
                    ? minProductPriceFinal
                    : `${minProductPriceFinal} - ${maxProductPriceFinal}`;
            },
            /**
             * generate a matrix of all unique refiner IDs included per facet (aka: accordion or row)
             */
            calculateValidRefinerIds() {
                const validRefinerIds = [];

                // loop through each facet (aka: accordion or row)
                this.filteredAccordionProducts.forEach((productArr, i) => {
                    const ids = [];
                    productArr.forEach(product => {
                        ids.push(...product.FacetRefiners);
                    });

                    // use a Set object to remove all duplicate ids: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
                    const uniqueIds = new Set(ids);

                    validRefinerIds[i] = [ ...uniqueIds ];
                });

                this.validRefinerIds = validRefinerIds;
            },
            /**
             * iterate currently selected facet array and remove any that conflict with new selection
             * @param {string} id facet refiner id
             * @returns {Array<string?>} selected facets with conflicts removed
             */
            deselectInvalidFacets(id, filteredProducts = this.filteredProducts) {
                let validSelectedFacets = [ ...this.selectedFacets ];

                this.selectedFacets.forEach((facet, facetIndex) => {
                    if(facet.id) {
                        let productIndex = 0; // define productIndex here to keep it in scope after loop

                        for (productIndex; productIndex < filteredProducts.length; productIndex++) {
                            const facetRefiners = filteredProducts[productIndex].FacetRefiners;
                            if(facetRefiners.includes(id) && facetRefiners.includes(facet.id)) {
                                break; // valid selection so break out of loop for performance
                            }
                        }

                        if(productIndex === filteredProducts.length) {
                            // the facet is invalid if the entire array was iterated without finding a product that includes both facet & Id
                            validSelectedFacets[facetIndex] = EMPTY_FACET;
                        }
                    }
                });

                return validSelectedFacets;
            },
            /**
             * derive which facets are selected based off of a provided Sku
             */
            generateSelectedFacets() {
                // find the product object for the selected sku
                const product = this.data.Products.find(product => product.Sku === this.preSelectedSku);
                if(product) {
                    const refiners = product.FacetRefiners;
                    if(refiners && refiners.length > 0) {
                        // create new array instance to avoid mutations
                        let selectedFacets = [ ...this.selectedFacets ];

                        // loop through configurations array since it's length with match 1:1 to selectedFacets array
                        this.data.Configurations.forEach((configuration, configurationIndex) => {
                            // loop through choices
                            for (let choiceIndex = 0; choiceIndex < configuration.Choices.length; choiceIndex++) {
                                const choice = configuration.Choices[choiceIndex];
                                // if refiners array of this product incudes this choice's FacetRefinerId, then it's a selected option
                                if(refiners.includes(choice.FacetRefinerId)) {
                                    // setup selectedFacet object for this facet
                                    selectedFacets[configurationIndex] = {
                                        id: choice.FacetRefinerId,
                                        targets: choice.targets
                                    };

                                    break;
                                }
                            }
                        });

                        this.selectedFacets = selectedFacets;
                    }
                } else {
                    // reset selected facets if no product matches sku
                    this.setupSelectedFacets();
                }
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
                let filteredProducts = [ ...this.filteredProducts ];

                if(selectedFacets[index].id) {
                    // if new refiner of a selected facet is set, deselect facet
                    selectedFacets[index] = EMPTY_FACET;
                    // assign to selectedFacets to update computed filteredProduct array
                    filteredProducts = this.calculateFilteredProducts(selectedFacets);
                }

                // don't need deselection logic if facet is being explicity deselected by user (facet.id === null)
                if(facet.id) {
                    // remove any selected facets that are invalid with new selection
                    selectedFacets = this.deselectInvalidFacets(facet.id, filteredProducts);
                }

                selectedFacets[index] = facet;
                this.selectedFacets = [ ...selectedFacets];
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

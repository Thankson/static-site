import { mapState } from 'vuex';
import { replaceDigits } from '@common/source/js/utils/regex';

/** @typedef {{ id: string?, targets: Array<string> }} SelectedFacet */

/**
 * base for selectedFacets array to indicate that facet needs a selection
 * @type {Facet}
 */
export const EMPTY_FACET = {
    id: null,
    targets: [],
    included: false
};

export default {
    props: {
        /**
         * product configurator data
         * - examples can be found here: \api\_mock-data\shelf
         */
        data: {
            type: Object,
            default: () => {}
        },
        /**
         * localization translations
         */
        labels: {
            type: Object,
            default: () => {}
        },
        isFreeProduct: {
            type: Boolean,
            default: false
        },
        /**
         * whether or not this is the product detail page of the configurator
         */
        isPdp: {
            type: Boolean,
            default: false
        },
        /**
         * pre-selected sku to determine selected configuration objects
         */
        preSelectedSku: {
            type: String,
            default: null
        },
        /**
         * pre-selected configurations
         */
        /** @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration */
        /** @type {Array<Configuration>} */
        preSelectedConfigurations: {
            type: Array,
            default: null
        }
    },
    data() {
        return {
            /**
             * map of included sku objects
             * @type {Object<number, Configuration>}
             */
            included: [],
            /**
             * object of selected facet refiner IDs and their corresponding fsku targets
             * - length will match the number of configurations available
             * - each configuration is a facet
             * - each choice in a configuration is the refiner
             * - null indicates no selection is made
             * @type {Object<SelectedFacet>}
             */
            selectedFacets: []
        };
    },
    watch: {
        data() {
            this.updateIncluded();
        }
    },
    computed: {
        ...mapState('cartSummary', ['welcomeProgramLsdAvailable']),

        /**
         * computed configurations array adding duplicate items for each Configuration that has a TotalRequired
         * @returns {Array<Object<string, any>>}
         */
        configurations() {
            if(!this.data.Configurations || this.data.Configurations.length < 1) {
                return [];
            }

            let configurations = [];

            this.data.Configurations.forEach(configuration => {
                if(configuration.Type !== 'Static') {
                    // we always add at least one instance by default
                    configurations.push(configuration);
                    // there needs to be duplicate configurations for each required product (equal to TotalRequired value)
                    if(configuration.TotalRequired) {
                        let duplicates = [];
                        // start loop at 1 because we already added the first instance above
                        for (let i = 1; i < configuration.TotalRequired; i++) {
                            duplicates.push(configuration);
                        }
                        // combine our duplicate array and our configurations array
                        configurations = configurations.concat(duplicates);
                    }
                }
            });

            return configurations;
        },
        /**
         * computed configurations of only "included" items
         * - an "included" item will have Type === 'Static'
         * - included configurations have no effect on product selections
         * - will be sent to the server as {{ FeatureSku: includedConfiguration.Sku, SelectedSku: null }}
         * @returns {Array<Object<string, any>>}
         */
        includedConfigurations() {
            if(!this.data.Configurations || this.data.Configurations.length < 1) {
                return [];
            }

            return this.data.Configurations.filter(configuration => configuration.Type === 'Static');
        },
        /**
         * computed configurations of all visible "included" items
         * - is visible if Visible property is true && Title property has a value
         * @returns {Array<Object<string, any>>}
         */
        visibleIncludedConfigurations() {
            if(this.includedConfigurations.length < 1) {
                return [];
            }

            return this.includedConfigurations.filter(configuration => configuration.Visible && configuration.Title);
        }
    },
    mounted() {
        // setup array for selected facets
        this.setupSelectedFacets();

        // setup included configurations
        this.updateIncluded();
    },
    methods: {
        /**
         * calculate display price for free products
         * @param {string} price formatted price string value
         * @param {number} rawPrice raw price value
         * @returns {string}
         */
        getFreeProductPriceLabel(price, rawPrice) {
            const remaining = rawPrice - this.welcomeProgramLsdAvailable;
            return remaining > 0 ? replaceDigits(price, remaining) : this.labels?.Free;
        },
        /**
         * setup selected facets array to match configurations list
         */
        setupSelectedFacets() {
            this.selectedFacets = this.configurations.map(configuration => ({
                id: null,
                targets: configuration.Targets,
                included: !!configuration.Sku
            }));
        },
        /**
         * setup/update array for "included" kit products
         * - only changes when base data object changes
         */
        updateIncluded() {
            this.included = this.data.Configurations
                .filter(configuration => configuration.Type === 'Static')
                .map(configuration => ({
                    FeatureSku: configuration.Sku,
                    SelectedSku: null
                }));
        }
    }
};

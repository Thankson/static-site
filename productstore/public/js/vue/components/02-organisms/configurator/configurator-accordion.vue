<template>
    <div
        class="o-configuratorAcc"
        :class="classes">

        <accordion
            v-if="servicesSucceeded"
            ref="accordion"
            arrow-size="-md"
            title-el="div"
            class="-config"
            :content-id="contentId"
            :toggle-id="toggleId"
            :visible="visible"
            @show="show"
            @hide="hide">

            <template v-slot:title>
                <span class="o-configuratorAcc__refiner" role="text">
                    {{ chooseLabel }}
                    <span v-if="!isSelected" class="ml-10">{{ title }}</span>
                    <span v-else class="text-gray-150 font-bold ml-10">{{ selectedOption.Title }}</span>

                    <template v-if="subtitle && visible">
                        <br />
                        <span class="o-configuratorAcc__note" v-html="subtitle" />
                    </template>
                </span>
            </template>

            <template v-slot:icon="$accordion">
                <span class="text-2xl text-gray-150 leading-none">
                    <a-icon size="inherit" :class="[ $accordion.isOpened ? '-flip': '', $accordion.isReady ? '-transition' : '']">
                        keyboard_arrow_down
                    </a-icon>
                </span>
            </template>

            <div
                class="o-configuratorAcc__content"
                :aria-labelledby="toggleId">

                <ul v-if="filters && filters.length > 0" class="o-configuratorAcc__list -filter">
                    <li class="o-configuratorAcc__item -filter">
                        <a-pill
                            class="font-normal"
                            size="sm"
                            :selected="activeFilter === null"
                            @click="() => setFilter(null)">

                            {{ allLabel }}
                        </a-pill>
                    </li>

                    <li
                        v-for="filter in filters"
                        :key="filter.FilterTarget"
                        class="o-configuratorAcc__item -filter">

                        <a-pill
                            class="font-normal"
                            size="sm"
                            :selected="activeFilter === filter.FilterTarget"
                            @click="() => setFilter(filter.FilterTarget)">

                            {{ filter.Title }}
                        </a-pill>
                    </li>
                </ul>

                <perfect-scrollbar ref="scroll" :options="{ suppressScrollX: true }">

                    <ul
                        class="o-configuratorAcc__list"
                        :class="isPdp && isSwatch ? '-swatchGrid' : ''">

                        <template v-for="(option, i) in options">
                            <li
                                v-if="!activeFilter || !isFiltered(option.FacetRefinerId)"
                                :key="option.FacetRefinerId"
                                class="o-configuratorAcc__item">

                                <!-- These are never "truly" disabled, so "-disabled" class is added instead of :disabled prop to prevent aria-disabled from being true -->
                                <a-pill
                                    v-if="isPill"
                                    :class="{ '-disabled': !validRefinerIds.includes(option.FacetRefinerId) || !!offsaleMessages[i] }"
                                    :disabled="!!offsaleMessages[i]"
                                    :selected="selectedIndex === i"
                                    v-on="!offsaleMessages[i] ? { click: () => selectOption(i) } : null">

                                    {{ option.Title }}{{ offsaleMessages[i] ? ` - ${offsaleMessages[i]}` : '' }}
                                </a-pill>

                                <m-refiner-swatch
                                    v-if="isSwatch"
                                    :class="{ '-disabled': !validRefinerIds.includes(option.FacetRefinerId), '-offsale': !!offsaleMessages[i], '-grid': isPdp && isSwatch }"
                                    :disabled="!!offsaleMessages[i]"
                                    :sku="isTryOnTool && products[i] ? isAsianModelsForTryOnTool ? products[i].Sku : getSku(option.Title) : null"
                                    :image-url="!isPdp ? option.ShelfImage : option.PdpImage"
                                    :image-alt="option.Title"
                                    :title="option.Title"
                                    :is-cn="isCn"
                                    :is-try-on-tool="isTryOnTool"
                                    :try-on-tool-type="tryOnToolType"
                                    :selected="selectedIndex === i"
                                    v-on="swatchListeners(i)">

                                    {{ option.Title }}
                                </m-refiner-swatch>

                                <m-refiner-image
                                    v-if="!isPill && !isSwatch"
                                    :class="{ '-disabled': !validRefinerIds.includes(option.FacetRefinerId) || !!offsaleMessages[i] }"
                                    :disabled="!!offsaleMessages[i]"
                                    :image-url="!isPdp ? option.ShelfImage : option.PdpImage"
                                    :image-alt="option.Title"
                                    :offsale-message="offsaleMessages[i]"
                                    :selected="selectedIndex === i"
                                    v-on="!offsaleMessages[i] ? { click: () => selectOption(i) } : null">

                                    {{ option.Title }}
                                </m-refiner-image>
                            </li>
                        </template>
                    </ul>

                    <div v-if="isTryOnTool && hasTryOnToolErrors" class="">
                        <p>{{ tryOnToolErrorLabel }}</p>
                    </div>
                </perfect-scrollbar>
            </div>

        </accordion>
        <m-error-card v-if="!servicesSucceeded" :reload-text="servicesFailureReloadText" :text="servicesFailureText"></m-error-card>
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OConfiguratorAcc',
        mixins: [
            localizationMixin,
            safeId
        ],
        safeIds: [
            'toggleId',
            'contentId'
        ],
        props: {
            buttonStyle: {
                type: String,
                default: ''
            },
            allLabel: {
                type: String,
                default: 'All'
            },
            chooseLabel: {
                type: String,
                default: ''
            },
            /**
             * fallback message to show for offsale
             * - shows if there is one or more SKUs associated with a refiner with different offsale messages
             */
            offsaleLabel: {
                type: String,
                default: 'Unavailable'
            },
            soldOutLabel: {
                type: String,
                default: 'Sold Out'
            },
            title: {
                type: String,
                required: true
            },
            subtitle: {
                type: String,
                default: ''
            },
            isPdp: {
                type: Boolean,
                default: false
            },
            isAsianModelsForTryOnTool: {
                type: Boolean,
                default: false
            },
            isVisible: {
                type: Boolean,
                default: false
            },
            isTryOnTool: {
                type: Boolean,
                default: false
            },
            scriptId: {
                type: String,
                default: 'service-failure-configurator-pdp'
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
            tryOnToolType: {
                type: String,
                default: ''
            },
            hasTryOnToolErrors: {
                type: Boolean,
                default: false
            },
            tryOnToolErrorLabel: {
                type: String,
                default: 'N/A'
            },
            keepConfigurationOpen: {
                type: Boolean,
                default: false
            },
            /**
             * full product array of possible products
             * - needed for refiner filtering
             * @type {Array<Object<string, any>>}
             */
            products: {
                type: Array,
                default: () => []
            },
            /**
             * product array after being filtered by parent
             * - this will be filtered WITHOUT this facet's currently selected refiner
             * @type {Array<Object<string, any>}
             */
            filteredProducts: {
                type: Array,
                default: () => []
            },
            /** @typedef {{ Title: string, FilterTarget: string? }} Filter */
            /** @type {Array<Filter>} */
            filters: {
                type: Array,
                default: () => []
            },
            /** @typedef {{ Title: string, FacetRefinerId: string, ShelfImage: string, PdpImage: string, Filters: Array }} Option */
            /** @type {Array<Option>} */
            options: {
                type: Array,
                required: true
            },
            selectedRefinerId: {
                type: String,
                default: null
            },
            targets: {
                type: Array,
                default: () => []
            },
            validRefinerIds: {
                type: Array,
                default: () => []
            },
            isCn: {
                type: Boolean,
                default: false
            },
            preSelectedSku: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                activeFilter: null,
                selectedIndex: null,
                visible: false,
                servicesSucceeded: false,
                servicesFailureReloadText: '',
                servicesFailureText: '',

                // dynamically generated Ids
                toggleId: '',
                contentId: ''
            };
        },
        computed: {
            classes() {
                let className = '';

                switch (this.buttonStyle) {
                    case 'text':
                        className = '-pill';
                        break;
                    case 'swatch':
                        className = '-swatch';
                        break;
                    default:
                        className = '-img';
                }

                return className;
            },
            isPill() {
                return this.buttonStyle === 'text';
            },
            isSwatch() {
                return this.buttonStyle === 'swatch';
            },
            isSelected() {
                return typeof this.selectedIndex === 'number';
            },
            offsaleMessages() {
                // generate an array of offsale messages matching up with length of this.options
                return this.options.map(option => {
                    // find all products associated to this option's refiner id
                    const relatedProducts = this.filteredProducts.filter(product => product.FacetRefiners.includes(option.FacetRefinerId));
                    // find all offsale products in associated products array
                    const offsaleProducts = relatedProducts.filter(product => product.Offsale);
                    // find all soldout products in associated products array
                    const soldOutProducts = relatedProducts.filter(product => product.IsSoldOut);

                    // if the length of both array's length is the same, then all products associated with this refiner are offsale
                    if(offsaleProducts.length === relatedProducts.length) {
                        // if all offsale messages are the same return that. otherwise return generic localization label
                        const rootMsg = offsaleProducts[0]?.Offsale || '';
                        return offsaleProducts.every(product => rootMsg && product.Offsale === rootMsg) ? rootMsg : this.offsaleLabel;
                    }

                    // if the length of both array's length is the same, then all products associated with this refiner are soldout
                    if(soldOutProducts.length === relatedProducts.length) {
                        // if all soldout products have an empty offsale label return an empty space to disable the UI, otherwise return offsale label
                        return soldOutProducts.every(product => product.Offsale === '') ? ' ' : soldOutProducts[0]?.Offsale;
                    }

                    return null;
                });
            },
            selectedOption() {
                return this.options[this.selectedIndex] ?? {};
            }
        },
        watch: {
            isVisible() {
                this.visible = this.isVisible;
            },
            selectedRefinerId() {
                this.setSelectedIndex();
            }
        },
        created() {
            this.$on('show', this.show);
            this.$on('hide', this.hide);
        },
        mounted() {
            this.visible = this.isVisible;
            this.setSelectedIndex();

            this.preSelectedSkuIndex();

            // if we don't get a "Success" response, assume error:
            // n.b. the default value of `false` is the complete opposite to what we do in `product-details.vue` -- this is
            // intentional, due to the way the localization scripts for `product-details` are generated:
            this.servicesSucceeded = this.servicesSuccess || this.getLocalizationProp('Success', false);
            this.servicesFailureReloadText = this.servicesErrorReloadText || this.getLocalizationProp('ErrorButtonText', 'Reload Page');
            this.servicesFailureText = this.servicesErrorText || this.getLocalizationProp('GenericFailureMessage', 'This part of the page had trouble loading.');

            this.$nextTick(() => {
                this.$refs.scroll.update();
                // Default configuration open for preselcted SKU
                if(this.preSelectedSku) {
                    this.show();
                }
            });
        },
        methods: {
            show() {
                this.visible = true;
            },
            getSku(title) {
                let product = this.products.filter((p) => p.OptionName === title);
                return product[0]?.Sku;
            },
            hide() {
                if(!this.keepConfigurationOpen) {
                    this.visible = false;
                }
            },
            /**
             * check if refiner is filtered base off of products array
             * @returns {boolean} returns true if refiner should be hidden
             */
            isFiltered(refinerId) {
                // first, find only products that match this refiner Id
                const filteredProducts = this.products.filter(product => product.FacetRefiners.includes(refinerId));
                // then, if a filter is active, filter by activeFilter refiner id
                // if the length of the array is zero, then this refiner should be hidden
                return filteredProducts.filter(product => product.FacetRefiners.includes(this.activeFilter)).length === 0;
            },
            selectOption(index) {
                this.selectedIndex = this.selectedIndex !== index ? index : null;
                this.update();
                if(window._etmc) {
                    window._etmc.push(['trackPageView', { 'item': this.products[index].Sku }]);
                }
            },
            setFilter(id) {
                this.activeFilter = id;
            },
            setSelectedIndex() {
                const index = this.options.findIndex(option => this.selectedRefinerId === option.FacetRefinerId);
                this.selectedIndex = index > -1 ? index : null;
            },
            swatchListeners(index) {
                return {
                    click: () => this.selectOption(index)
                };
            },
            update() {
                if(this.selectedOption.FacetRefinerId && !this.isTryOnTool && !this.keepConfigurationOpen) {
                    // only if an option was selected (not deselected), focus on accordion toggle
                    this.$refs['accordion'].$emit('focus');
                    // also close this accordion
                    this.hide();
                }

                this.$emit('input', {
                    id: this.selectedOption.FacetRefinerId ?? null,
                    targets: this.targets,
                    included: false
                });
            },
            preSelectedSkuIndex() {
                const selectedSkuIndex = this.products.findIndex(product => product.Sku === this.preSelectedSku);

                if(selectedSkuIndex !== -1) {
                    this.selectedIndex = selectedSkuIndex;
                    this.$on('click');
                }
            }
        }
    };
</script>

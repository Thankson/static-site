
<template>
    <div class="p-catListing">
        <slot />

        <div class="p-catListing__side">
            <div class="p-catListing__menu">
                <slot name="menu" />
            </div>

            <o-filter-mobile-shelf
                :visible="facetModalVisible"
                :heading="getLocalizationProp('Labels.FiltersModalHeading', 'Filters')"
                :loading="loading"
                @hide="onShelfHide">

                <template v-slot:controls>
                    <button type="button" class="o-catFacetModal__clear" :class="loading ? '-disabled' : ''" @click="clear">
                        <span v-html="getLocalizationProp('Labels.ClearAll', 'Clear All')"></span>
                    </button>
                </template>

                <template v-slot:done>
                    <v-button class="-catFacetModal" @click="facetModalVisible = false">
                        <span v-html="getLocalizationProp('Labels.Done', 'DONE')"></span>
                    </v-button>
                </template>

                <o-facet-group-radios
                    v-model="selectedSortValue"
                    class="-sort md:hidden"
                    :title="getLocalizationProp('Labels.SortBy', 'Sort by')"
                    accordion-title-class="-sortBy"
                    content-class="-sort"
                    :refiners="sortOptions" />

                <o-facet-group-checks
                    v-for="(facet, i) in facets"
                    :key="i"
                    :title="facet.Facet"
                    :facet-aria-label="getLocalizationProp('Labels.FilterAriaLabel')"
                    :refiners="facet.Refiners.map(refiner => ({
                        name: refinerName({ name: refiner.Title, disabled: !refiner.Enabled }),
                        value: refiner.ItemId,
                        disabled: !refiner.Enabled
                    }))"
                    :selected="refiners.map(refiner => refiner.value)"
                    :disabled="loading"
                    @input="update" />

            </o-filter-mobile-shelf>
        </div>

        <div class="p-catListing__main">
            <div v-if="$slots['banner']" class="p-catListing__banner">
                <slot name="banner" />
            </div>

            <div aria-live="polite">
                <div class="p-catListing__header">
                    <p class="p-catListing__total">
                        <template v-if="ready">
                            <span v-if="data.TotalResults !== 1" v-html="resultsCount"></span>
                            <span v-else v-html="resultsCountSingular"></span>
                        </template>
                    </p>

                    <div class="p-catListing__sort">
                        <div class="md:hidden">
                            <v-button
                                ref="facet-modal-toggle"
                                class="-transparent -full"
                                @click="facetModalVisible = true">

                                <span v-html="getLocalizationProp('Labels.FiltersModalToggle', 'SORT & FILTER')"></span>
                            </v-button>
                        </div>

                        <m-filter-sort
                            v-model="selectedSortValue"
                            class="hidden md:block"
                            :title="getLocalizationProp('Labels.SortBy', 'Sort by')"
                            :options="sortOptions" />
                    </div>
                </div>

                <refiner-tag
                    v-if="ready"
                    :clear-all="getLocalizationProp('Labels.ClearAll', 'Clear All')"
                    :remove="getLocalizationProp('Labels.Remove', 'Remove')"
                    :active-refiners="refiners"
                    @remove="remove"
                    @clearAll="clear" />

                <div class="p-catListing__results">
                    <ul v-if="showResults" class="p-catListing__grid" :class="loading ? '-isLoading' : ''">
                        <li
                            v-for="(card, i) in cards"
                            :key="i"
                            class="p-catListing__col">

                            <m-product-card
                                v-if="card.IsFamilyCard || card.IsProductCard"
                                :concentrated-label="getLocalizationProp('Labels.Concentrated')"
                                :diluted-label="getLocalizationProp('Labels.Diluted')"
                                :is-preferred="data.IsPreferredUser"
                                :is-sold-out="isSoldOut(card)"
                                :is-sold-out-label="getLocalizationProp('Labels.SoldOutLabel')"
                                :is-off-sale="isOffSale(card)"
                                :points-label="getLocalizationProp('Labels.Points')"
                                :points-label-singular="getLocalizationProp('Labels.PointsSingular')"
                                :product="card.InnerData"
                                :range-sr-text="getLocalizationProp('Labels.RangeSrText')"
                                :script-id-configurator="scriptIdConfigurator">

                                <template v-slot:regular-price-label>
                                    <span v-html="getLocalizationProp('Labels.Regular')"></span>
                                </template>

                                <template v-slot:preferred-price-label>
                                    <span v-html="getLocalizationProp('Labels.Preferred')"></span>
                                </template>

                                <template v-if="getLocalizationProp('Data.PreferredMemberLearnMoreLink')" v-slot:learn-more-link>
                                    <a
                                        :href="getLocalizationProp('Data.PreferredMemberLearnMoreLink.Url')"
                                        :target="getLocalizationProp('Data.PreferredMemberLearnMoreLink.Target', false) ? getLocalizationProp('Data.PreferredMemberLearnMoreLink.Target') : false">

                                        {{ getLocalizationProp('Data.PreferredMemberLearnMoreLink.Text') }}
                                    </a>
                                </template>
                            </m-product-card>

                            <m-mixin-ad v-if="card.IsMixInAdCard" :context="card.InnerData" />
                        </li>
                    </ul>

                    <template v-if="ready && !loading">
                        <div v-if="error" class="p-catListing__error" v-html="getLocalizationProp('Data.ErrorMessage')"></div>

                        <div v-else-if="!cards || cards.length === 0" class="mt-30" v-html="getLocalizationProp('Data.NoResultsMessage')"></div>
                    </template>

                    <div class="p-catListing__loading" :class="[ loading ? '-isVisible' : '', ready && !showResults ? '-error': '' ]">
                        <a-loading-spinner :visible="loading" />
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading && !ready" class="mt-30 md:mt-0 mx-auto">
            <a-loading-spinner :visible="loading" />
        </div>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapState, mapGetters } from 'vuex';
    import envSoldOut from '../../../mixins/env'; // sets the domain (when necessary)
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import placeholderMixin from '@common/source/js/vue/mixins/placeholder';

    export default {
        name: 'ExtraSavings',
        mixins: [ envSoldOut, localizationMixin, placeholderMixin ],
        props: {
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            }
        },
        data() {
            return {
                facetModalVisible: false,
                loading: false,
                ready: false,
                historyReset: false,
                urlParams: null,
                sortOptions: []
            };
        },
        computed: {
            ...mapGetters('categoryListing', ['params']),

            ...mapState('categoryListing', ['data', 'error', 'refiners', 'sortValue']),

            selectedSortValue: {
                get() {
                    return this.sortValue;
                },
                set(val) {
                    this.SET_SORT_VALUE(val);
                }
            },

            // api data
            cache() {
                return {
                    data: this.data,
                    refiners: this.refiners,
                    sortValue: this.sortValue
                };
            },
            facets() {
                return this.data?.FacetRefiners || [];
            },
            cards() {
                return this.data?.Cards || [];
            },
            showResults() {
                return !this.error && this.cards.length > 0;
            },

            // labels
            resultsCount() {
                return this.getLocalizationProp('Labels.ResultsCountTitle').replace('{0}', this.data.TotalResults || this.cards.length || 0);
            },
            resultsCountSingular() {
                return this.getLocalizationProp('Labels.ResultCountTitleSingular').replace('{0}', this.data.TotalResults || this.cards.length || 0);
            }
        },
        watch: {
            params() {
                const params = new URLSearchParams();
                // generate url search params based off of params object from vuex store
                Object.entries(this.params).forEach(([key, value]) => {
                    if(Array.isArray(value)) {
                        // if the value is an array, append as a repeating query string - Example: "./categorylisting?foo=bar&foo=baz"
                        // *Note: this may change depending on how backend expects these query parameters
                        value.forEach(value => params.append(key, value));
                    } else {
                        // otherwise it'll be a standard key/value query string
                        params.append(key, value);
                    }
                });
                this.urlParams = params;
            },
            async urlParams() {
                if(this.ready && !this.historyReset) {
                    window.history.pushState(null, '', decodeURIComponent(`${window.location.pathname}?${this.urlParams.toString()}`));

                    await this.load();

                    try {
                        window.history.replaceState(this.cache, '');
                    } catch (err) {
                        console.warn('Data cache size exceeds history state size limit. If this history state is re-entered, the data will be reloaded from the API.');
                    }
                }
            }
        },
        created() {
            // watch the history state for routing
            window.addEventListener('popstate', this.onPopstate);
        },
        async mounted() {
            // add any existing url params
            this.urlParams = new URLSearchParams(decodeURIComponent(window.location.search));

            this.setSortOptions();
            this.setupRefiners();

            // setup category ID to be used as the uri slug
            this.SET_CATEGORY_ID(this.getLocalizationProp('Data.CategoryPageId'));

            await this.load();

            try {
                window.history.replaceState(this.cache, '');
            } catch (err) {
                console.warn('Data cache size exceeds history state size limit. If this history state is re-entered, the data will be reloaded from the API.');
            }

            this.ready = true;
        },
        beforeDestroy() {
            window.removeEventListener('popstate', this.onPopstate);
        },
        methods: {
            ...mapActions('categoryListing', ['cancel', 'getData']),

            ...mapMutations('categoryListing', ['SET_CATEGORY_ID', 'SET_DATA', 'CLEAR_REFINERS', 'OVERWRITE_REFINERS', 'REMOVE_REFINER', 'SET_REFINER_KEY', 'TOGGLE_REFINER', 'SET_SORT_KEY', 'SET_SORT_VALUE']),

            async load() {
                if(!this.loading) {
                    this.loading = true;
                } else {
                    this.cancel();
                }

                const wasCanceled = await this.getData({ params: this.urlParams, initial: !this.ready });

                if(!wasCanceled) {
                    this.loading = false;
                }
            },
            update(refiner) {
                this.TOGGLE_REFINER(refiner);
            },
            remove(refiner) {
                this.REMOVE_REFINER(refiner);
            },
            clear() {
                if(this.refiners.length > 0) {
                    this.CLEAR_REFINERS();
                }
            },
            async onPopstate(evt) {
                this.historyReset = true;

                if(evt.state) {
                    this.SET_DATA(evt.state.data);
                    this.OVERWRITE_REFINERS(evt.state.refiners);
                    this.SET_SORT_VALUE(evt.state.sortValue);
                } else {
                    this.urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
                    await this.load();
                }

                this.$nextTick(() => (this.historyReset = false));
            },
            onShelfHide() {
                this.$refs['facet-modal-toggle'].$el.focus();
                this.facetModalVisible = false;
            },
            setSortOptions() {
                let sortOptions = this.getLocalizationProp('Data.SortOptions');
                if(sortOptions && sortOptions.length > 0) {
                    this.sortOptions = sortOptions.map(option => ({ name: option.Title, value: option.ItemId }));
                }

                const param = this.getLocalizationProp('Data.SortOrderQueryParamName', 'sortby');
                this.SET_SORT_KEY(param);
                this.SET_SORT_VALUE(this.urlParams?.get(param) || this.sortOptions[0]?.value || '');
            },
            setupRefiners() {
                const param = this.getLocalizationProp('Data.FacetRefinerQueryParamName', 'rf');
                this.SET_REFINER_KEY(param);
            },
            refinerName({ name, disabled }) {
                let formattedName = name;
                if(this.loading && this.getLocalizationProp('Labels.FiltersLoadingSrText')) {
                    formattedName = this.getLocalizationProp('Labels.FiltersLoadingSrText').replace('{0}', formattedName);
                } else if(disabled && this.getLocalizationProp('Labels.FiltersDisabledSrText')) {
                    formattedName = this.getLocalizationProp('Labels.FiltersDisabledSrText').replace('{0}', formattedName);
                }
                return formattedName;
            },
            isOffSale(card) {
                return card.InnerData.Data.IsOffSale;
            },
            isSoldOut(card) {
                return card.quantityAvailable <= 0 && card.isInventoryControlled;
            }
        }
    };
</script>

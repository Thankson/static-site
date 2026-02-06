
<template>
    <div class="p-vidLibrary" :class="{'-isCn' : isCn}">
        <slot />

        <div class="p-vidLibrary__side">
            <div class="p-vidLibrary__menu">
                <slot name="menu" />
            </div>

            <o-filter-mobile-shelf
                :visible="facetModalVisible"
                :heading="getLocalizationProp('Labels.FiltersModalHeading', 'Filters')"
                :loading="loading"
                @hide="onShelfHide">

                <template v-slot:controls>
                    <button type="button" class="o-catFacetModal__clear" :class="loading || refiners.length == 0 ? '-disabled' : ''" @click="clear">
                        <span v-html="getLocalizationProp('Labels.ClearAll', 'Clear All')"></span>
                    </button>
                </template>

                <template v-slot:done>
                    <v-button class="-catFacetModal" @click="facetModalVisible = false">
                        <span v-html="getLocalizationProp('Labels.Done', 'DONE')"></span>
                    </v-button>
                </template>

                <o-facet-group-radios
                    v-if="isCn"
                    v-model="selectedSortValue"
                    class="-sort md:hidden"
                    :title="getLocalizationProp('Labels.SortBy', 'Sort by')"
                    accordion-title-class="-sortBy"
                    content-class="-sort"
                    :gtm-radiobox-id="202"
                    :gtm-toggle-id="219"
                    :refiners="sortOptions" />

                <o-facet-group-checks
                    v-for="(facet, i) in facets"
                    :key="i"
                    :title="facet.Facet"
                    :refiners="getRefiner(facet.Refiners)"
                    :selected="refiners.map(refiner => refiner.value)"
                    :disabled="loading"
                    :gtm-checkbox-id="409"
                    @input="update" />

            </o-filter-mobile-shelf>
        </div>

        <div class="p-vidLibrary__main">
            <div v-if="$slots['banner']" class="p-vidLibrary__banner">
                <slot name="banner" />
            </div>

            <div aria-live="polite">
                <div class="p-vidLibrary__header">
                    <p class="p-vidLibrary__total">
                        <template v-if="ready">
                            <span v-if="data.TotalResults !== 1" v-html="resultsCount"></span>
                            <span v-else v-html="resultsCountSingular"></span>
                        </template>
                    </p>
                    <div class="p-vidLibrary__sort">
                        <div class="md:hidden">
                            <v-button
                                ref="facet-modal-toggle"
                                class="-transparent -full"
                                @click="facetModalVisible = true">

                                <span v-html="getLocalizationProp('Labels.FiltersModalToggle', 'SORT & FILTER')"></span>
                            </v-button>
                        </div>
                        <m-filter-sort
                            v-if="isCn"
                            v-model="selectedSortValue"
                            class="hidden md:block"
                            sort-type="video"
                            :title="getLocalizationProp('Labels.SortBy', 'Sort by')"
                            :options="sortOptions"
                            @change="gtmTrackAction({id: 14, text: $event.target.options[$event.target.options.selectedIndex].text}, $event)"
                        />
                    </div>
                </div>

                <refiner-tag
                    v-if="ready"
                    :clear-all="getLocalizationProp('Labels.ClearAll', 'Clear All')"
                    :remove="getLocalizationProp('Labels.Remove', 'Remove')"
                    :active-refiners="refiners"
                    @remove="remove"
                    @clearAll="clear" />

                <div class="p-vidLibrary__results">
                    <ul v-if="showResults" class="p-vidLibrary__grid" :class="loading ? '-isLoading' : ''">
                        <li
                            v-for="video in videos"
                            :key="
                                isLearningVideoLibrary ?
                                    uniqid(video.VirtualVideo.MediaItemName)
                                    : !isCn ?
                                        (video.LearnToEarn.Metadata.MetadataItemId
                                            || video.VirtualVideo.MediaId)
                                        : video.VirtualVideo.MediaId
                            "
                            class="p-vidLibrary__col"
                        >
                            <o-video-modal-card
                                v-if="isLearningVideoLibrary"
                                :id="video.VirtualVideo.MediaItemName"
                                card-size="-lib -learningLib"
                                :coupon-label="couponLabel"
                                :desc="video.VirtualVideo.Description"
                                :is-cn="false"
                                :labels="getLocalizationProp('Labels')"
                                :localization="getLocalization['Data']"
                                :render-share-button="!hideShareLink"
                                :coupon-localization="getLocalizationProp('Data')"
                                :prevent-seek="video.VirtualVideo.PreventSeek"
                                :title="video.VirtualVideo.Title"
                                :video-data="video.VirtualVideo"
                                :video-id-url-param="videoIdUrlParam"
                                :video-item-id="video.VirtualVideo.MediaItemName"
                            />
                            <o-video-modal-card
                                v-else
                                :id="!isCn ? video.LearnToEarn.Metadata.MetadataItemId : video.VirtualVideo.MediaId"
                                :amount-formatted="!isCn ? video.LearnToEarn.Metadata.FormattedLsdAmount : ''"
                                :amount-value="!isCn ? video.LearnToEarn.Metadata.LsdAmount : 0"
                                card-size="-lib"
                                :desc="video.VirtualVideo.Description"
                                :has-reset="video.VirtualVideo.HasReset"
                                :is-cn="isCn"
                                :is-new="video.VirtualVideo.IsNew"
                                :is-watched="video.VirtualVideo.IsWatched"
                                :lte="!isCn ? video.LearnToEarn : {}"
                                :localization="getLocalization['Data']"
                                :quiz="!isCn ? video.LearnToEarn.Quiz : {}"
                                :title="video.VirtualVideo.Title"
                                :video-data="video.VirtualVideo"
                                :video-item-id="video.VirtualVideo.MediaId"
                                :prevent-seek="video.VirtualVideo.PreventSeek || false"
                                :allow-seek="video.VirtualVideo.AllowSeek || false"
                            />
                        </li>
                    </ul>

                    <template v-if="ready && !loading">
                        <div v-if="error" class="p-vidLibrary__error" v-html="getLocalizationProp('Data.ErrorMessage')"></div>

                        <div v-else-if="!videos || videos.length === 0" class="mt-30" v-html="getLocalizationProp('Data.NoResultsMessage')"></div>
                    </template>

                    <div
                        v-if="showLoadMoreButton"
                        class="p-vidLibrary__loadMore"
                    >
                        <v-button
                            class="-white px-40 py-10 font-bold w-full md:w-auto -center mx-8"
                            @click="loadMore"
                        >
                            {{ getLocalizationProp('Labels.LoadMore', 'load more') }}
                        </v-button>
                    </div>

                    <div class="p-vidLibrary__loading" :class="[ loading ? '-isVisible' : '', ready && !showResults ? '-error': '' ]">
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

    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import placeholderMixin from '@common/source/js/vue/mixins/placeholder';
    import uniqid from 'uniqid';

    export default {
        name: 'VideoLibrary',
        mixins: [ localizationMixin, placeholderMixin ],
        data() {
            return {
                facetModalVisible: false,
                historyReset: false,
                isPaging: false,
                loading: false,
                ready: false,
                sortOptions: [],
                urlParams: null,
                videoIdUrlParam: ''
            };
        },
        computed: {
            ...mapGetters('lteVideos', ['getLocalization', 'params']),

            ...mapState('lteVideos', ['data', 'error', 'isApiCalled', 'pageNumber', 'refiners', 'sortValue', 'totalPages', 'videosList']),
            ...mapState('userFlags', ['userFlags']),

            // api data
            cache() {
                return {
                    data: this.data,
                    refiners: this.refiners,
                    sortValue: this.sortValue
                };
            },
            // Note that some labels use getLocalilzation (as opposed to getLocalizationProp) to get label values via the API for lte-videos
            couponLabel() {
                return this.getLocalizationProp('Labels.Coupon');
            },
            facets() {
                return this.data?.FacetRefiners || [];
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isLearningVideoLibrary() {
                return this.getLocalizationProp('Data.IsLearningVideoLibrary', false);
            },
            resultsCount() {
                return this.getLocalizationProp('Labels.ResultsCountTitle').replace('{0}', this.data.TotalResults || this.videos.length || 0);
            },
            resultsCountSingular() {
                return this.getLocalizationProp('Labels.ResultCountTitleSingular').replace('{0}', this.data.TotalResults || this.videos.length || 0);
            },
            selectedSortValue: {
                get() {
                    return this.sortValue;
                },
                set(val) {
                    this.SET_SORT_VALUE(val);
                }
            },
            showLoadMoreButton() {
                return this.videos.length && this.pageNumber < this.totalPages;
            },
            showResults() {
                return !this.error && this.videos.length > 0;
            },
            hideShareLink() {
                return this.getLocalizationProp('Data.HideShareLink', false) || !this.userFlags?.IsAuthenticated;
            },
            videos() {
                if(this.isCn) {
                    return this.videosList || [];
                } else {
                    return this.data?.Videos || [];
                }
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
                if(this.isPaging) {
                    return;
                }
                if(this.ready && !this.historyReset) {
                    window.history.pushState(null, '', decodeURIComponent(`${window.location.pathname}?${this.urlParams.toString()}`));
                    await this.load(true);

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
            // Get the User Flags
            this.getUserFlags();

            // Set component version state from localization
            this.SET_IS_LEARNING_VIDEO_LIBRARY(this.isLearningVideoLibrary);

            // add any existing url params
            this.urlParams = this.getCurrentUrlParams();

            // Currently for Learning Video Library
            // Save 'videoId' URL param in videoIdUrlParam data var
            // for passing to video-modal-card.vue child component
            this.videoIdUrlParam = this.urlParams.get('videoId');

            if(this.isCn) {
                this.setupSortOptions();
            }
            this.setupRefiners();

            // setup category ID to be used as the uri slug
            this.SET_CATEGORY_ID(this.getLocalizationProp('Data.CategoryPageId'));

            await this.load(true);

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
            ...mapActions('lteVideos', ['cancel', 'getData']),
            ...mapActions('userFlags', ['getUserFlags']),

            ...mapMutations('lteVideos', ['CLEAR_REFINERS', 'OVERWRITE_REFINERS', 'REMOVE_REFINER', 'SET_API_CALLED', 'SET_CATEGORY_ID', 'SET_DATA', 'SET_IS_LEARNING_VIDEO_LIBRARY', 'SET_PAGE_NUMBER', 'SET_REFINER_KEY', 'SET_SORT_KEY', 'SET_SORT_VALUE', 'TOGGLE_REFINER']),

            clear() {
                if(this.refiners.length > 0) {
                    this.CLEAR_REFINERS();
                }
            },
            getCurrentUrlParams() {
                return new URLSearchParams(decodeURIComponent(window.location.search));
            },
            getRefiner: function(refiner) {
                if(!refiner) {
                    return [];
                }
                return refiner.map(refiner => ({
                    name: this.refinerName({ name: refiner.Title, disabled: !refiner.Enabled }),
                    value: refiner.ItemId,
                    disabled: !refiner.Enabled
                }));
            },
            async load(sortChange) {
                if(!this.loading) {
                    this.loading = true;
                } else {
                    this.cancel();
                }

                if(sortChange) {
                    this.SET_PAGE_NUMBER(1);
                }

                if(this.isApiCalled) this.SET_API_CALLED(false);
                // add page number field.
                this.urlParams.set('pageNumber', this.pageNumber);
                const wasCanceled = await this.getData({ params: this.urlParams, initial: !this.ready, isCn: this.isCn});

                if(!wasCanceled) {
                    this.loading = false;
                }
            },
            loadMore() {
                if(this.loading) {
                    return;
                }

                // when is paging, do not trigger `watch` query.
                this.isPaging = true;
                this.urlParams = this.getCurrentUrlParams();
                this.SET_PAGE_NUMBER(this.pageNumber + 1);
                this.load().finally(() => {
                    this.isPaging = false;
                });
            },
            async onPopstate(evt) {
                this.historyReset = true;

                if(evt.state) {
                    this.SET_DATA(evt.state.data);
                    this.OVERWRITE_REFINERS(evt.state.refiners);
                    if(this.isCn) {
                        this.SET_SORT_VALUE(evt.state.sortValue);
                    }
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
            refinerName({ name, disabled }) {
                let formattedName = name;
                if(this.loading && this.getLocalizationProp('Labels.FiltersLoadingSrText')) {
                    formattedName = this.getLocalizationProp('Labels.FiltersLoadingSrText').replace('{0}', formattedName);
                } else if(disabled && this.getLocalizationProp('Labels.FiltersDisabledSrText')) {
                    formattedName = this.getLocalizationProp('Labels.FiltersDisabledSrText').replace('{0}', formattedName);
                }
                return formattedName;
            },
            remove(refiner) {
                this.REMOVE_REFINER(refiner);
            },
            setupRefiners() {
                const param = this.getLocalizationProp('Data.FacetRefinerQueryParamName', 'fr');
                this.SET_REFINER_KEY(param);
            },
            setupSortOptions() {
                let sortOptions = this.getLocalizationProp('Data.SortOptions');
                if(sortOptions && sortOptions.length > 0) {
                    this.sortOptions = sortOptions.map(option => ({ name: option.Title, value: option.ItemId }));
                }

                const param = this.getLocalizationProp('Data.SortOrderQueryParamName', 'so');
                this.SET_SORT_KEY(param);
                this.SET_SORT_VALUE(this.urlParams?.get(param) || this.sortOptions[0]?.value || '');
            },
            uniqid(a) {
                return uniqid(a);
            },
            update(refiner) {
                this.TOGGLE_REFINER(refiner);
            }
        }
    };
</script>

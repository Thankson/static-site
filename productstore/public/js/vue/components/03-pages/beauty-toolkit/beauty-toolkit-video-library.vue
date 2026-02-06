<template>
    <div class="p-vidLibrary -beautyToolkit">
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
                    <button type="button" class="o-catFacetModal__clear" :class="loading ? '-disabled' : ''" @click="clear">
                        <span v-html="getLocalizationProp('Labels.ClearAll', 'Clear All')"></span>
                    </button>
                </template>

                <template v-slot:done>
                    <v-button class="-catFacetModal" @click="facetModalVisible = false">
                        <span v-html="getLocalizationProp('Labels.Done', 'DONE')"></span>
                    </v-button>
                </template>

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
                    :gtm-checkbox-id="409"
                    :gtm-toggle-id="219"
                    :selected="refiners.map(refiner => refiner.value)"
                    :disabled="loading"
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
                            <span v-if="videos.length === 1" v-html="resultsCountSingular"></span>
                            <span v-else v-html="resultsCount"></span>
                        </template>
                    </p>
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
                            v-for="(video, index) in videos"
                            :key="resultsListKey(video, index)"
                            class="p-vidLibrary__col">

                            <o-video-modal-card
                                :id="videoModalCardId(video)"
                                amount-formatted=""
                                :amount-value="0"
                                card-size="-lib"
                                :desc="videoModalCardDescription(video)"
                                :has-reset="videoModalCardHasReset(video)"
                                :is-new="videoModalCardIsNew(video)"
                                :is-watched="videoModalCardIsWatched(video)"
                                :lte="{}"
                                :localization="getLocalization['Data']"
                                :quiz="{}"
                                :title="videoModalCardTitle(video)"
                                :show-download-button="true"
                                :video-data="videoModalCardVideoData(video)"
                                :video-item-id="videoModalCardVideoId(video)"
                                :download-button-text="getLocalizationProp('Labels.DownloadButtonText')"
                                :download-url="downloadUrl(video)"
                                :disable-video="videoModalCardShouldDisableVideo(video)"
                                :prevent-seek="videoModalCardPreventSeek(video)"
                                :allow-seek="videoModalCardAllowSeek(video)"
                            ></o-video-modal-card>
                        </li>
                    </ul>

                    <template v-if="ready && !loading">
                        <div v-if="error" class="p-vidLibrary__error" v-html="getLocalizationProp('Data.ErrorMessage')"></div>

                        <div v-else-if="!videos || videos.length === 0" class="mt-30" v-html="getLocalizationProp('Data.NoResultsMessage')"></div>
                    </template>

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
    import { mapActions, mapMutations, mapState, mapGetters } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import placeholderMixin from '@common/source/js/vue/mixins/placeholder';

    export default {
        name: 'BeautyToolKitVideoLibrary',
        mixins: [ localizationMixin, placeholderMixin ],
        data() {
            return {
                facetModalVisible: false,
                loading: false,
                ready: false,
                historyReset: false,
                urlParams: null,
                scrollDisable: false
            };
        },
        computed: {
            ...mapGetters('lteVideos', ['params', 'getLocalization']),

            ...mapState('lteVideos', ['data', 'videosList', 'pageNumber', 'error', 'refiners', 'isApiCalled']),

            // api data
            cache() {
                return {
                    data: this.data,
                    refiners: this.refiners
                };
            },
            facets() {
                return this.data?.FacetRefiners || [];
            },
            videos() {
                // check if Results array has video or file:
                return this.data?.Results?.filter(x => x.Videos || x.File?.Url) || [];
            },
            showResults() {
                return !this.error && this.videos.length > 0;
            },

            // labels
            resultsCount() {
                return this.getLocalizationProp('Labels.ResultsCountTitle').replace('{0}', this.videos.length || 0);
            },
            resultsCountSingular() {
                return this.getLocalizationProp('Labels.ResultCountTitleSingular').replace('{0}', this.videos.length || 0);
            },
            isCn() {
                return this.$env?.IsCn || false;
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
            let that = this;
            if(this.isCn) {
                setTimeout(function() {
                    window.addEventListener('scroll', function() {
                        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset;
                        var footerHeight = document.getElementsByTagName('footer')[0].offsetHeight;
                        if(scrollTop + window.innerHeight >= document.body.clientHeight - footerHeight) {
                            if(!that.scrollDisable) {
                                if(that.data && that.data.TotalResults > that.videos.length) {
                                    that.loadMore();
                                }
                            }
                        }
                    });
                }, 200);
            }
        },
        beforeDestroy() {
            window.removeEventListener('popstate', this.onPopstate);
        },
        methods: {
            ...mapActions('lteVideos', ['cancel', 'getData']),

            ...mapMutations('lteVideos', ['SET_API_CALLED', 'SET_CATEGORY_ID', 'SET_DATA', 'CLEAR_REFINERS', 'OVERWRITE_REFINERS', 'REMOVE_REFINER', 'SET_REFINER_KEY', 'TOGGLE_REFINER', 'SET_PAGE_NUMBER']),

            downloadUrl(video) {
                return video.Videos?.VirtualVideo?.Progressive1080 || video.File?.Url || '';
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
            async load() {
                if(!this.loading) {
                    this.loading = true;
                } else {
                    this.cancel();
                }

                if(this.isApiCalled) this.SET_API_CALLED(false);
                console.log('load called');
                const wasCanceled = await this.getData({ params: this.urlParams, initial: !this.ready, isCn: this.isCn, isBeautyToolkit: true});

                if(!wasCanceled) {
                    this.loading = false;
                }
            },
            loadMore() {
                if(this.loading) {
                    return;
                }
                this.scrollDisable = true;
                this.SET_PAGE_NUMBER(this.pageNumber + 1);
                this.scrollDisable = false;
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
            setupRefiners() {
                const param = this.getLocalizationProp('Data.FacetRefinerQueryParamName', 'fr');
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
            resultsListKey(video, index) {
                return video.Videos?.VirtualVideo?.MediaId || index;
            },
            videoModalCardAllowSeek(video) {
                return video.Videos?.VirtualVideo?.AllowSeek || false;
            },
            videoModalCardDescription(video) {
                return video.Videos?.VirtualVideo?.Description || '';
            },
            videoModalCardId(video) {
                return video.Videos?.VirtualVideo?.MediaId || '';
            },
            videoModalCardIsNew(video) {
                return video.Videos?.VirtualVideo?.IsNew;
            },
            videoModalCardIsWatched(video) {
                return video.Videos?.VirtualVideo?.IsWatched;
            },
            videoModalCardHasReset(video) {
                return video.Videos?.VirtualVideo?.HasReset;
            },
            videoModalCardPreventSeek(video) {
                return video.Videos?.VirtualVideo?.PreventSeek || false;
            },
            videoModalCardShouldDisableVideo(video) {
                // eslint-disable-next-line
                return video.Videos?.VirtualVideo?.MediaId ? false : true;
            },
            videoModalCardTitle(video) {
                return video.Videos?.VirtualVideo?.Title || video.Title;
            },
            videoModalCardVideoData(video) {
                let data = {};
                if(video.Videos?.VirtualVideo) {
                    data = video.Videos.VirtualVideo;
                } else if(video.File?.ThumbnailImage?.Url) {
                    data = {
                        ThumbnailImageUrl: video.File.ThumbnailImage.Url,
                        AltImage: video.File.ThumbnailImage.Alt
                    };
                }
                return data;
            },
            videoModalCardVideoId(video) {
                return video.Videos?.VirtualVideo?.MediaId || '';
            }
        }
    };
</script>

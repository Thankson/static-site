<template>
    <div class="o-searchBar" :class="{'-isCn': isCn }">
        <button
            class="o-searchBar__btn"
            :aria-label="getLocalizationProp('Labels.BtnAria', 'Press enter to search')"
            data-testid="button-searchBar"
            @click.enter.prevent="submit"
        >
            <img
                class="o-searchBar__icon"
                :src="getLocalizationProp('Data.SearchIcon.Url', '//cdnsc1.melaleuca.com/na/images/header/search2x.png')"
                :alt="getLocalizationProp('Data.SearchIcon.Alt', 'Click to Search')"
                aria-hidden="true">
        </button>
        <form
            id="search-bar"
            ref="searchBar"
            v-clickoutside="closeSuggestions"
            action=""
            method="post"
            name="search-bar"
            class="o-searchBar__form"
            role="search"
            autocomplete="off"
            @blur.capture="!isCn ? onBlur() : ''"
            @blur="isCn ? onBlur() : ''"
        >
            <input
                ref="search-input"
                v-model="input"
                class="o-searchBar__input"
                type="search"
                name="Search"
                :placeholder="getLocalizationProp('Labels.Placeholder', 'Search')"
                :aria-placeholder="getLocalizationProp('Labels.AriaPlaceholder', 'Type in here what you need and proceed to the following button')"
                data-testid="input-searchBar"
                @focus="[setValue(), checkSuggestions()]"
                @input="onInput"
                @keydown.enter.prevent="submit"
                @keyup.esc="closeSuggestions"
            >
            <button v-show="input.length > 0" :aria-label="getLocalizationProp('Labels.ClearBtnAria', 'Clear the search text')" class="o-searchBar__clear" @click.stop="clearSearchBar">close</button>
            <!-- Suggestion List -->
            <div
                v-if="showSuggestions"
                class="o-searchBar__suggestions"
                :class="{'-opened': showTopProd, '-showSimplifiedLayout': showSimplifiedLayout}"
                :style="{'height': suggestionComp, 'min-height': suggestionIniHeight + 'px'}"
            >
                <span v-if="showHistoricals && !typingStatus" class="o-searchBar__popular" :class="{'block' : isCn && !showTopProd}">
                    {{ getLocalizationProp('Labels.HistoricalSearchTerms', 'Historical Search Terms') }}
                    <span v-if="showHistoricals" class="ml-40 align-middle cursor-pointer" :class="{'material-icons' : !isCn}" aria-hidden="true" @click.capture="clearHistoricals">
                        <img
                            v-if="isCn" class="o-searchBar__deleteIcon"
                            :class="{'absolute right-10' : !showTopProd}"
                            :src="getLocalizationProp('Data.SearchDeleteIcon.Url', '//cdnsc1.melaleuca.com/na/images/header/delete.png')"
                            :alt="getLocalizationProp('Data.SearchDeleteIcon.Alt', 'Click to Delete')"
                            aria-hidden="true">
                        <span v-else>delete</span>
                    </span>
                </span>
                <ol v-if="showHistoricals && !typingStatus" ref="historicalList" role="list" class="o-searchBar__list">
                    <m-search-suggest
                        v-for="(item, index) in historicals"
                        :key="item + index"
                        :categories-list-aria-label="
                            getLocalizationProp('Labels.CategoriesListAriaLabel')
                        "
                        :cdn-media-url="getLocalizationProp('Data.CdnMediaUrl')"
                        :click-top-products="getLocalizationProp('Labels.ClickTopProducts')"
                        :culture="getLocalizationProp('Data.Culture', 'zh-CN')"
                        :env="servicesEnv"
                        :family-pdp-link="getLocalizationProp('Data.FamilyPdpLink', '')"
                        :in-label="getLocalizationProp('Labels.In', 'in')"
                        :index="index"
                        :is-cn="isCn"
                        :is-guest-shopping-enabled="
                            getLocalizationProp('Data.IsGuestShoppingEnabled')
                        "
                        :is-signed-in="getLocalizationProp('Data.IsSignedIn')"
                        :item="item"
                        :pdp-link="getLocalizationProp('Data.PdpLink')"
                        :search-page="getLocalizationProp('Data.SearchPageUrl')"
                        :screen-w="viewportWidth"
                        :show-simplified-layout="showSimplifiedLayout"
                        :top-labels="getLocalizationProp('Labels.TopResults')"
                        type="historicals"
                        :user-flags="userFlags"
                        v-on:showTopProd="setShowTopProd"
                    >
                    </m-search-suggest>
                </ol>
                <span v-if="isPopularTerm" class="o-searchBar__popular">
                    {{ getLocalizationProp('Labels.PopularSearchTerms', 'Popular Search Terms') }}
                </span>
                <component
                    :is="!isDesktop && showSimplifiedLayout ? 'perfect-scrollbar' : 'div'"
                    :style="!isDesktop && showSimplifiedLayout ? {'max-height': suggestionListHeight + 'px'} : ''"
                >
                    <ol ref="suggestionList" role="list" class="o-searchBar__list">
                        <m-search-suggest
                            v-for="(item, index) in suggestions" :key="item.term + index"
                            :categories-list-aria-label="getLocalizationProp('Labels.CategoriesListAriaLabel')"
                            :cdn-media-url="getLocalizationProp('Data.CdnMediaUrl')"
                            :click-top-products="getLocalizationProp('Labels.ClickTopProducts')"
                            :culture="getLocalizationProp('Data.Culture', 'en-us')"
                            :env="servicesEnv"
                            :family-pdp-link="getLocalizationProp('Data.FamilyPdpLink', '')"
                            :in-label="getLocalizationProp('Labels.In', 'in')"
                            :index="index"
                            :is-cn="isCn"
                            :is-guest-shopping-enabled="getLocalizationProp('Data.IsGuestShoppingEnabled')"
                            :is-signed-in="getLocalizationProp('Data.IsSignedIn')"
                            :item="item"
                            :pdp-link="getLocalizationProp('Data.PdpLink')"
                            :search-page="getLocalizationProp('Data.SearchPageUrl')"
                            :screen-w="viewportWidth"
                            :show-simplified-layout="showSimplifiedLayout"
                            :suffix-label="getLocalizationProp('Labels.SuffixLabel')"
                            :top-labels="getLocalizationProp('Labels.TopResults')"
                            :user-flags="userFlags"
                            v-on:showTopProd="setShowTopProd"
                        >
                        </m-search-suggest>
                    </ol>
                </component>
            </div>
        </form>
    </div>
</template>

<script>
    import localization from '@common/source/js/vue/mixins/localization';
    import cookie from '../../../utils/cookie';
    import eventBus from '../../../mixins/event-bus';
    import { mapActions, mapState } from 'vuex';
    import { debounce } from 'lodash';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import { theme } from '../../../../../../tailwind.config';

    const LG_THRESHOLD = parseInt(theme.screens.lg);

    export default {
        name: 'OSearchBar',

        directives: {
            clickoutside: {
                bind: function(el, binding, vnode, oldVnode) {
                    el.clickOutsideEvent = function(event) {
                        // Click outside the el and his childrens
                        if(!(el === event.target || el.contains(event.target))) {
                            // Call method provided in attribute value
                            vnode.context[binding.expression](event);
                        }
                    };
                    document.body.addEventListener('click', el.clickOutsideEvent);
                    document.body.addEventListener('touchstart', el.clickOutsideEvent);
                },
                unbind: function(el) {
                    document.body.removeEventListener('click', el.clickOutsideEvent);
                    document.body.removeEventListener('touchstart', el.clickOutsideEvent);
                },
                stopProp(event) {
                    event.stopPropagation();
                }
            }
        },

        mixins: [ localization, isDesktop ],

        data() {
            return {
                input: '',
                intervalId: null,
                showSuggestions: false,
                showHistoricals: false,
                showTopProd: false,
                typingStatus: false,
                suggestionsFiltered: [],
                suggestionIniHeight: null,
                suggestionListHeight: null,
                suggestionHeight: null,
                viewportWidth: 0,
                searchHistory: null
            };
        },

        computed: {
            ...mapState('search', ['isPopularTerm', 'popularSearch', 'suggestions']),
            ...mapState('userFlags', ['userFlags']),

            checkCultureAndLength() {
                return (this.input.length > 2 && /\p{Script=Latin}/u.test(this.input)) || (this.input.length > 0 && !/\p{Script=Latin}/u.test(this.input));
            },

            historicals() {
                var searchHistoricals = [];
                if(this.searchHistory !== null) {
                    this.searchHistory.split(',').reverse().forEach((item) => {
                        if(item !== 'null') {
                            var obj = {};
                            obj.term = item;
                            searchHistoricals.push(obj);
                        }
                    });
                }

                return searchHistoricals;
            },

            inputLowerCase() {
                return this.input.toLowerCase();
            },

            isCn() {
                return this.$env?.IsCn || false;
            },

            isKr() {
                return this.$env?.Country === 'Korea';
            },
            isMaxScreenLG() {
                return this.viewportWidth < LG_THRESHOLD;
            },

            servicesEnv() {
                return this.$env?.ServiceBaseUrl;
            },

            // Currently simplified layout includes:
            // - removal of carat on right,
            // - removal of gray arrow on hover,
            // - removal of categories,
            // - addition of scrollbar in mobile
            // - height adjustment so that dropdown is not hidden by virtual keyboar
            showSimplifiedLayout() {
                return this.localization?.Data?.SimplifySearchDisplay;
            },
            suggestionComp() {
                return (this.suggestionHeight) + ((this.suggestionHeight !== 'auto') ? 'px' : '');
            },

            useProductAutoSuggest() {
                return this.getLocalizationProp('Data.UseProductAutoSuggest', false);
            }
        },

        watch: {
            suggestions(val) {
                if(this.suggestions?.length) {
                    this.showSuggestions = true;
                    this.$nextTick(() => {
                        this.suggestionHeight = 'auto';
                        this.updateSuggestionHeight();
                    });
                } else {
                    this.showSuggestions = false;
                }
            },
            showSuggestions(val) {
                const focusedElement = document.querySelector(':focus');
                // Show only when in focus, has suggestions, and don't match Chinese letters.
                if(val &&
                    this.$refs.searchBar.contains(focusedElement) &&
                    this.suggestions?.length &&
                    this.checkCultureAndLength) {
                    this.showSuggestions = true;
                } else {
                    if(val && this.suggestions?.length && this.popularSearch.length && this.$refs.searchBar.contains(focusedElement)) {
                        this.setSuggestionPopular();
                        this.showSuggestions = true;
                    } else {
                        this.showSuggestions = false;
                    }
                }

                this.$nextTick(() => {
                    this.updateSuggestionHeight();
                });
            },
            viewportWidth(val) {
                if(val < 992) this.suggestionHeight = 'auto';

                // Update suggestion col initial height
                this.updateSuggestionHeight();
            },
            suggestionHeight(val) {
                this.updateSuggestionHeight();
            }
        },

        created () {
            // Debounce
            this.debounceInputSearch = debounce(this.debounceInputSearch, 100, { leading: false, trailing: true });

            // Viewport
            this.setViewport();

            // Create resize listener
            window.addEventListener('resize', this.resize);
        },

        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },

        mounted() {
            this.searchTopProdHeight();

            this.getUserFlags();

            this.setHistoricals();

            this.searchHistory = cookie.getCookie('search_history');

            if(this.isCn && this.historicals.length > 0 && this.input.length === 0) {
                this.showHistoricals = true;
            }
            // Inject term on the search input
            const termOnLoad = new URLSearchParams(window.location.search).get('searchTerm');
            if(termOnLoad) this.input = termOnLoad;
        },

        methods: {
            ...mapActions('search', ['getSuggestion', 'clearStoreSearch', 'setSuggestionPopular']),
            ...mapActions('userFlags', ['getUserFlags']),

            checkSuggestions() {
                if(this.suggestions?.length) {
                    this.showSuggestions = true;
                }

                if(!this.input) {
                    this.getPopularTerms();
                }
            },
            cleanSearch() {
                this.clearStoreSearch();
                this.showTopProd = false;
                this.suggestionHeight = 'auto';
            },

            clearHistoricals() {
                cookie.delCookie();
                this.showHistoricals = false;
                this.searchHistory = cookie.getCookie('search_history');
                this.updateSuggestionHeight();
            },

            clearSearchBar(event) {
                event.preventDefault();
                this.input = '';
                this.setSuggestionPopular();
                this.$refs['search-input'].focus();
            },

            closeSuggestions() {
                this.showSuggestions = false;
                this.showTopProd = false;
                this.suggestionHeight = 'auto';
            },

            createSuggestions() {
                // call API
                this.getSuggestion({
                    term: this.input,
                    culture: this.getLocalizationProp('Data.Culture', 'en-us'),
                    address: this.servicesEnv,
                    product: this.useProductAutoSuggest
                });
            },

            getPopularTerms() {
                // call API
                this.getSuggestion({
                    culture: this.getLocalizationProp('Data.Culture', 'en-us'),
                    address: this.servicesEnv,
                    product: this.useProductAutoSuggest
                });
            },

            resize() {
                this.setViewport();
            },

            search() {
                this.createSuggestions();
                this.showSuggestions = true;
            },

            setValue() {
                this.searchHistory = cookie.getCookie('search_history');
                clearInterval(this.intervalId);
                this.debounceInputSearch();
            },
            onBlur() {
                // Because the newly focused element doesn't receive focus (yet) when the onblur handler fires, we use "late timeouts" to push
                // the callback to the back of the browser execution stack. See <https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#late_timeouts>
                setTimeout(() => {
                    const focusedElement = document.querySelector(':focus');
                    if(!this.$refs.searchBar.contains(focusedElement)) {
                        this.closeSuggestions();
                    }
                }, 200);
            },
            onInput(val) {
                if(val?.target?.value) {
                    if(this.isCn) {
                        this.typingStatus = true;
                    }
                    this.input = val.target.value;
                } else {
                    if(this.isCn) {
                        this.typingStatus = false;
                    }
                }
                this.setValue();
                if(this.inputLowerCase.length === 0) {
                    this.showTopProd = false;
                    this.$emit('updateFilter');
                }
            },

            debounceInputSearch() {
                this.intervalId = setTimeout(() => {
                    if(this.isCn) {
                        if(this.historicals.length > 0 && this.input.length === 0) {
                            this.showHistoricals = true;
                        } else {
                            this.showHistoricals = false;
                        }
                    }
                    if(this.checkCultureAndLength) {
                        this.search();
                    } else {
                        this.setSuggestionPopular();
                    }
                }, 200);
            },

            searchTopProdHeight() {
                eventBus.$on('searchSuggestionHeight', (val) => {
                    const topProdHeight = val + 3;
                    const suggestionsCol = this.$refs.suggestionList?.clientHeight + this.$refs.historicalList?.clientHeight || 0;
                    const maxNum = Math.max(topProdHeight, suggestionsCol);

                    this.suggestionHeight = maxNum;
                });
            },

            setShowTopProd() {
                this.showTopProd = true;
            },

            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            },

            submit() {
                if(this.input.length === 0) {
                    window.location.reload();
                } else {
                    const searchPageUrl = this.getLocalizationProp('Data.SearchPageUrl');
                    let searchUrl = `${searchPageUrl}?searchTerm=${encodeURIComponent(this.input)}`;
                    if(this.isCn) {
                        cookie.setCookie(encodeURIComponent(this.input));
                        this.searchHistory = cookie.getCookie('search_history');
                    }
                    window.location = searchUrl;
                }
            },

            setHistoricals() {
                this.urlParams = new URLSearchParams(window.location.search);
                if(this.urlParams.get('searchTerm') && this.isCn) {
                    cookie.setCookie(encodeURIComponent(this.urlParams.get('searchTerm')));
                }
            },

            updateSuggestionHeight() {
                if(this.$refs.suggestionList?.clientHeight) {
                    if(this.isPopularTerm) {
                        // Title height
                        if(this.$refs.historicalList?.clientHeight) {
                            this.suggestionIniHeight = this.$refs.suggestionList.clientHeight + this.$refs.historicalList.clientHeight + 60;
                        } else if(this.showSimplifiedLayout && this.isMaxScreenLG) {
                            this.suggestionListHeight = this.$refs.suggestionList.clientHeight - 35;
                        } else {
                            this.suggestionIniHeight = this.$refs.suggestionList.clientHeight + 40;
                        }
                    } else {
                        if(this.$refs.historicalList?.clientHeight) {
                            this.suggestionIniHeight = this.$refs.suggestionList.clientHeight + this.$refs.historicalList.clientHeight + 40;
                        } else if(this.showSimplifiedLayout && this.isMaxScreenLG) {
                            this.suggestionListHeight = this.$refs.suggestionList.clientHeight - 35;
                        } else {
                            this.suggestionIniHeight = this.$refs.suggestionList.clientHeight + 22;
                        }
                    }
                }
            }
        }
    };
</script>

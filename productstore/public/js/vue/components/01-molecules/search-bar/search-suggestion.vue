<template>
    <li class="m-searchSuggest" role="listitem">

        <!-- Suggestions CTAs | left column -->
        <div
            ref="suggestionCol"
            class="m-searchSuggest__actions"
            :class="{'-active': showTopSuggestions && !catChosen, '-hideSimplified': !showSimplifiedLayout}"
            data-testid="container-searchSuggestions"
            @mouseenter="timerToOpenSuggest(true, termComp)"
            @mouseleave="timerToOpenSuggest(false)"
        >
            <a class="m-searchSuggest__btn" :href="searchLink(termComp)">
                <span class="m-searchSuggest__term">
                    {{ termComp }}
                </span>
            </a>
            <!-- Arrow button -->
            <button
                v-if="!isCn" class="m-searchSuggest__btn -arrow"
                :aria-expanded="String(showTopSuggestions)"
                :aria-label="clickTopProductsAriaLabel(termComp)"
                @mouseenter="timerToOpenSuggest(true, termComp)"
                @mouseleave="timerToOpenSuggest(false)"
                @click.enter.prevent="timerToOpenSuggest(true, termComp)"
            >
                <span v-if="!showSimplifiedLayout" aria-hidden="true" class="m-searchSuggest__arrow">chevron_right</span>
            </button>
        </div>

        <!-- Top Suggestions: regular | right column -->
        <div
            v-if="showTopSuggestions && !catChosen && screenWidthComp"
            class="m-searchSuggest__col">
            <m-search-top-products
                :cdn-media-url="cdnMediaUrl"
                :is-cn="isCn"
                :is-signed-in="isSignedIn"
                :labels="topLabels"
                :family-pdp-link="familyPdpLink"
                :pdp-link="pdpLink"
                :search-page="searchPage"
                :term="termComp"
                :user-flags="userFlags"
            ></m-search-top-products>
        </div>

        <!-- Categories | left column -->
        <ol
            v-if="categoriesComp && !showSimplifiedLayout && index === 0"
            class="m-searchSuggest__list"
            role="list"
            :aria-label="categoriesListAriaLabel"
            :aria-hidden="!(categoriesComp && index === 0)"
            :aria-expanded="categoriesComp && index === 0"
        >
            <li
                v-for="(cat, i) in categoriesComp" :key="i" role="listitem"
                class="m-searchSuggest__item">
                <div
                    ref="suggestionCol"
                    class="m-searchSuggest__actions"
                    :class="{'-active': catChosen === cat.name, '-hideSimplified': !showSimplifiedLayout}"
                    data-testid="container-searchSuggestions"
                    @mouseenter="timerToOpenSuggest(true, termComp, cat, i)"
                    @mouseleave="timerToOpenSuggest(false)"
                >
                    <a
                        v-if="cat.name"
                        class="m-searchSuggest__category"
                        :href="searchLink(termComp, cat.name, cat.categoryId)"
                    >
                        <span v-if="!isCn">{{ inLabel }} {{ cat.name }}
                            <span v-if="suffixLabel"> {{ suffixLabel }}</span>
                        </span>
                        <span v-else>{{ cat.name }}{{ inLabel }}</span>
                    </a>
                    <!-- Arrow button -->
                    <button
                        v-if="!isCn" class="m-searchSuggest__btn -arrow"
                        :aria-expanded="String(showTopSuggestions)"
                        :aria-label="clickTopProductsAriaLabel(`${termComp} ${inLabel} ${cat.name}`)"
                        @mouseenter="timerToOpenSuggest(true, termComp, cat, i)"
                        @mouseleave="timerToOpenSuggest(false)"
                        @click.prevent="openTopSuggestions(termComp, cat, i)"
                    >
                        <span aria-hidden="true" class="m-searchSuggest__arrow">chevron_right</span>
                    </button>
                </div>
                <!-- Top Suggestions: categories | right column -->
                <div
                    v-if="showTopSuggestions && (catChosen === cat.name) && screenWidthComp"
                    class="m-searchSuggest__col">
                    <m-search-top-products
                        :active="screenWidthComp"
                        :cat-id="cat.categoryId"
                        :cat-name="catChosen"
                        :cdn-media-url="cdnMediaUrl"
                        :culture="culture"
                        :family-pdp-link="familyPdpLink"
                        :is-cn="isCn"
                        :in-label="inLabel"
                        :is-guest-shopping-enabled="isGuestShoppingEnabled"
                        :is-signed-in="isSignedIn"
                        :labels="topLabels"
                        :pdp-link="pdpLink"
                        :search-page="searchPage"
                        :term="termComp"
                        :user-flags="userFlags"
                    ></m-search-top-products>
                </div>
            </li>
        </ol>
    </li>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import { mapActions } from 'vuex';

    export default {
        name: 'MSearchSuggest',

        props: {
            categoriesListAriaLabel: {
                type: String,
                default: ''
            },
            cdnMediaUrl: {
                type: String,
                default: null
            },
            clickTopProducts: {
                type: String,
                default: null
            },
            culture: {
                type: String,
                default: null
            },
            env: {
                type: String,
                default: null
            },
            familyPdpLink: {
                type: String,
                default: null
            },
            inLabel: {
                type: String,
                default: 'in'
            },
            index: {
                type: Number,
                default: null
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isGuestShoppingEnabled: {
                type: Boolean,
                default: false
            },
            isSignedIn: {
                type: Boolean,
                default: false
            },
            item: {
                type: Object,
                default: () => {}
            },
            pdpLink: {
                type: String,
                default: null
            },
            screenW: {
                type: Number,
                default: null
            },
            searchPage: {
                type: String,
                default: null
            },
            showSimplifiedLayout: {
                type: Boolean,
                default: false
            },
            suffixLabel: {
                type: String,
                default: ''
            },
            topLabels: {
                type: Object,
                default: () => {}
            },
            type: {
                type: String,
                default: 'suggestions'
            },
            userFlags: {
                type: Object,
                default: () => {}
            }
        },

        data() {
            return {
                catChosen: null,
                prevCatChosen: null,
                prevTermChosen: null,
                showTopSuggestions: false,
                timer: null
            };
        },

        computed: {
            categoriesComp() {
                if(this.type === 'suggestions') {
                    // Removed catChosen check as it is going to be null here anyhow. No relevance of this check - Bug 37310
                    const catFiltered = this.item?.categories?.filter(cat => cat.name !== '');
                    return catFiltered.slice(0, 5);
                } else {
                    return null;
                }
            },

            screenWidthComp() {
                return this.screenW >= 992;
            },

            termComp() {
                return this.item?.term;
            }
        },

        mounted() {
            this.closeAllTopSuggestions();
            this.checkElement();
        },

        methods: {
            ...mapActions('search', ['getTopResults']),

            clickTopProductsAriaLabel(term) {
                return this.clickTopProducts.replace('{0}', term);
            },

            closeAllTopSuggestions() {
                eventBus.$on('closeTopSuggestions', () => {
                    this.showTopSuggestions = false;
                    this.catChosen = null;
                });
            },

            checkElement(val) {
                eventBus.$on('checkElement', () => {
                    this.prevTermChosen = val;
                });
            },

            openTopSuggestions(term, cat, i) {
                eventBus.$emit('closeTopSuggestions');
                this.showTopSuggestions = true;
                this.catChosen = cat?.name;

                // Prevent calling the same data
                if((!cat && term !== this.prevTermChosen) || i !== this.prevCatChosen) {
                    eventBus.$emit('checkElement', term);
                    this.prevTermChosen = term;
                    this.prevCatChosen = i;

                    // call API
                    this.getTopResults({
                        searchterm: term,
                        category: cat,
                        culture: this.culture,
                        address: this.env
                    });
                }
            },

            timerToOpenSuggest(open, term, cat, i) {
                if(open) {
                    this.timer = setTimeout(() => {
                        this.openTopSuggestions(term, cat, i);
                        this.$emit('showTopProd');
                    }, 300);
                } else {
                    clearTimeout(this.timer);
                }
            },

            searchLink(term, catName, catId) {
                let searchUrl = `${this.searchPage}?searchTerm=${encodeURIComponent(term)}${catId ? `&categoryId=${catId}` : ''}${catName ? `&categoryName=${encodeURIComponent(catName)}` : ''}`;

                return searchUrl;
            }
        }
    };
</script>

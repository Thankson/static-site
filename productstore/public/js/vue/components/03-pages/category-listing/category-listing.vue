
<template>
    <div class="p-catListing" :class="isCn ? '-isCn' : ''">
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
                    <button type="button" class="o-catFacetModal__clear" :class="[loading ? '-disabled' : '', isCn ? 'o-filterMobile__clear':'']" @click="clear">
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
                    :gtm-radiobox-id="202"
                    :gtm-toggle-id="219"
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
                    :gtm-checkbox-id="202"
                    :gtm-toggle-id="219"
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
                            <span v-if="data && data.TotalResults !== 1" v-html="resultsCount"></span>
                            <span v-else v-html="resultsCountSingular"></span>
                        </template>
                    </p>

                    <div class="p-catListing__sort">
                        <div class="md:hidden">
                            <v-button
                                ref="facet-modal-toggle"
                                class="-transparent -full"
                                @click="facetModalVisible = true">

                                <span :class="isCn ? 'font-bold' : ''" v-html="getLocalizationProp('Labels.FiltersModalToggle', 'SORT & FILTER')"></span>
                            </v-button>
                        </div>

                        <m-filter-sort
                            v-model="selectedSortValue"
                            class="hidden md:block"
                            :title="getLocalizationProp('Labels.SortBy', 'Sort by')"
                            :show-title="'selected'"
                            :options="sortOptions"
                            @change="gtmTrackAction({id: 14, text: $event.target.options[$event.target.options.selectedIndex].text}, $event)"
                        />
                    </div>
                </div>

                <refiner-tag
                    v-if="ready"
                    :clear-all="getLocalizationProp('Labels.ClearAll', 'Clear All')"
                    :remove-filter-aria-label="getLocalizationProp('Labels.RemoveFilterAriaLabel')"
                    :is-cn="isCn"
                    :active-refiners="refiners"
                    @remove="remove"
                    @clearAll="clear" />

                <div class="p-catListing__results">
                    <!-- Spinner displayed when the user arrives in the page for the first time AND there's no results cached yet -->
                    <div v-if="showFirstSpinner" class="mt-30 md:mt-0 mx-auto">
                        <a-loading-spinner :visible="showFirstSpinner" />
                    </div>

                    <ul v-if="showResults" class="p-catListing__grid" :class="loading ? '-isLoading' : ''">
                        <li
                            v-for="(card, i) in cards"
                            :key="`${i}-${card.InnerData && card.InnerData.Data ? card.InnerData.Data.ItemId : ''}`"
                            class="p-catListing__col">

                            <m-product-card
                                v-if="card.IsFamilyCard || card.IsProductCard"
                                :add-list-mods="i % 2 === 0 ? '-category-list-left' : '-category-list-right'"
                                :become-member-rte="getLocalizationProp('Labels.BecomeAMember')"
                                :become-member-url="getLocalizationProp('Data.BecomeAMemberLink.Url', null)"
                                :card-cta="getLocalizationProp('Labels.Select')"
                                :concentrated-label="getLocalizationProp('Labels.Concentrated')"
                                :combo-label="getLocalizationProp('Labels.FamilyComboMessage', 'Shop {0} options')"
                                :diluted-label="getLocalizationProp('Labels.Diluted')"
                                :eligible-for-saving-packs="card.EligibleForSavingPacks || false"
                                :family-id="card.InnerData && card.InnerData.Data ? card.InnerData.Data.FamilyID : ''"
                                :family-label="getLocalizationProp('Labels.FamilyWithSkusMessage', 'Shop more options')"
                                :family-off-sale-message="getLocalizationProp('Labels.FamilyOffSaleMessage')"
                                :pdp-link="card.InnerData && card.InnerData.Data ? card.InnerData.Data.PdpLink : null"
                                :past-eligible-date-message="card.PastEligibleDateMessage || ''"
                                :is-category="true"
                                :is-cn="isCn"
                                :is-kr="isKr"
                                :is-saving-pack="card.IsSavingPack || false"
                                :is-erp-date-valid="card.InnerData && card.InnerData.Data ? card.InnerData.Data.IsErpDateValid : null"
                                :is-inventory-controlled="card.InnerData && card.InnerData.Data ? card.InnerData.Data.IsInventoryControlled : null"
                                :is-off-sale="card.InnerData && card.InnerData.Data ? card.InnerData.Data.IsOffSale : null"
                                :is-restricted-pack="determineRestrictedPack(card)"
                                :is-preferred="data.IsPreferredUser"
                                :is-sold-out-label="getLocalizationProp('Labels.SoldOutLabel')"
                                :is-promotion="isPromotion ? isPromotion : false"
                                :learn-more-label="getLocalizationProp('Labels.LearnMore')"
                                :lvip-status="isPromotion ? lvipStatus : null "
                                :lvip-price-type="isPromotion ? getLocalizationProp('Labels.LvipPriceType', '') : ''"
                                :off-sale-message="card.InnerData && card.InnerData.Data ? card.InnerData.Data.OffSaleMessage : null"
                                :off-sale-title="card.InnerData && card.InnerData.Data ? card.InnerData.Data.OffSaleTitle : null"
                                :online-enrollment-url="getLocalizationProp('Data.OnlineEnrollmentLink.Url', null)"
                                :points-label="getLocalizationProp('Labels.Points')"
                                :points-label-singular="getLocalizationProp('Labels.PointsSingular')"
                                :product="card.InnerData"
                                :quantity-available="card.quantityAvailable"
                                :range-sr-text="getLocalizationProp('Labels.RangeSrText')"
                                :save-label="getLocalizationProp('Labels.Save')"
                                :save-up-to-label="getLocalizationProp('Labels.SaveUpTo')"
                                :savings-label-pack="getLocalizationProp('Labels.VersusBuyingIndividual')"
                                :savings-label-preferred="savingsLabelPreferred !==null ? savingsLabelPreferred :getLocalizationProp('Labels.BecomingAPreferredMember')"
                                :script-id-configurator="scriptIdConfigurator"
                                :shelf-config-label="getLocalizationProp('Labels.SelectAriaLabel')"
                                :show-cta="showCta"
                                :show-strikethrough-feature-flag="isStrikethroughOriginalPriceEnabled"
                                :sku="card.InnerData && card.InnerData.Data ? card.InnerData.Data.Sku : ''"
                                :tooltip-text="isPromotion ? getLocalizationProp('Labels.ToolTipText', '') : ''"
                                :user-flags="userFlags"
                                :hide-becomemember-link-when-authed="getLocalizationProp('Data.HideBecomememberLinkWhenAuthed', false)"
                                :hide-lvip-tooltip-when-unauthed="getLocalizationProp('Data.HideLvipTooltipWhenUnauthed', false)"
                                :promotion-regular-price-label="isPromotion ? getLocalizationProp('Labels.PromotionRegularLabel') : ''">

                                <template v-slot:restricted-pack-label>
                                    <span v-html="getLocalizationProp('Labels.MemberOnlyOffer', 'Member-Only Offer')"></span>
                                </template>

                                <template v-slot:regular-price-label>
                                    <span v-if="isPromotion" v-html="getLocalizationProp('Labels.PromotionRegularLabel')"></span>
                                    <span v-if="!isPromotion" v-html="getLocalizationProp('Labels.Regular')"></span>
                                </template>

                                <template v-if="!isPromotion" v-slot:preferred-price-label>
                                    <span v-html="getLocalizationProp('Labels.Preferred')"></span>
                                </template>

                                <template v-else v-slot:promotion-preferred-price-label>
                                    <span v-html="getLocalizationProp('Labels.Preferred')"></span>
                                </template>

                                <template v-slot:learn-more-link>
                                    <a
                                        v-if="getLocalizationProp('Data.PreferredMemberLearnMoreLink') && !userFlags.IsGuest && !userFlags.ViewMemberPricing && userFlags.IsAuthenticated"
                                        :href="getLocalizationProp('Data.PreferredMemberLearnMoreLink.Url')"
                                        @click.stop.prevent="onClickCTA(getLocalizationProp('Data.PreferredMemberLearnMoreLink'))">

                                        {{ getLocalizationProp('Data.PreferredMemberLearnMoreLink.Text') }}
                                    </a>
                                    <a
                                        v-else-if="getLocalizationProp('Data.OnlineEnrollmentLink') && ((userFlags.IsAuthenticated && userFlags.IsGuest) || (!userFlags.IsAuthenticated && userFlags.IsGuestShoppingEnabled))"
                                        :href="getLocalizationProp('Data.OnlineEnrollmentLink.Url')"
                                        @click.stop.prevent="onClickCTA(getLocalizationProp('Data.OnlineEnrollmentLink'))">

                                        {{ getLocalizationProp('Data.OnlineEnrollmentLink.Text') }}
                                    </a>
                                </template>
                            </m-product-card>

                            <m-mixin-ad
                                v-if="card.IsMixInAdCard"
                                :points-label="getLocalizationProp('Labels.Points', 'Points')"
                                :preferred-label="getLocalizationProp('Labels.Preferred', 'Preferred')"
                                :regular-label="getLocalizationProp('Labels.Regular', 'Regular')"
                                :context="card.InnerData"
                                :user-flags="userFlags" />
                        </li>
                    </ul>

                    <template v-if="ready && !loading">
                        <div v-if="error" class="p-catListing__error" v-html="getLocalizationProp('Data.ErrorMessage')"></div>

                        <div v-else-if="!cards || cards.length === 0" class="mt-30" v-html="getLocalizationProp('Data.NoResultsMessage')"></div>
                    </template>

                    <!-- Spinner displayed every time Category API is loading -->
                    <div
                        v-if="!showFirstSpinner"
                        class="p-catListing__loading"
                        :class="[ loading ? '-isVisible' : '', ready && !showResults ? '-error': '' ]">
                        <a-loading-spinner :visible="loading" />
                    </div>
                </div>
                <div v-if="data && data.TotalResults && ready" class="p-catListing__actions">
                    <div v-if="data && data.TotalResults > cards.length">
                        <v-button
                            class="mr-16"
                            :aria-label="getLocalizationProp('Labels.LoadMoreAriaLabel', 'Load More Button')"
                            @click="[loadMore(), gtmTrackAction({id: 250}, $event)]">
                            {{ getLocalizationProp('Labels.LoadMore', 'Load More') }}
                        </v-button>
                        <v-button
                            :aria-label="getLocalizationProp('Labels.ShowAllAriaLabel', 'Show All Button')"
                            @click="[showAll(), gtmTrackAction({id: 250}, $event)]">
                            {{ getLocalizationProp('Labels.ShowAll', 'Show All') }}
                        </v-button>
                    </div>
                    <!-- Scroll top -->
                    <div class="p-catListing__backToTop">
                        <a-back-to-top
                            :button-text="getLocalizationProp('Labels.BackToTop', 'Back To Top')"
                        >
                        </a-back-to-top>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapState, mapGetters } from 'vuex';
    import { isEqual } from 'lodash';
    import envSoldOut from '../../../mixins/env'; // sets the domain (when necessary)
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import placeholderMixin from '@common/source/js/vue/mixins/placeholder';
    import requestAnimationFrame from '@common/source/js/utils/request-animation-frame';

    const HISTORY_STATE_SIZE_LIMIT = 'Data cache size exceeds history state size limit. If this history state is re-entered, the data will be reloaded from the API.';

    export default {
        name: 'CategoryListing',
        mixins: [ envSoldOut, localizationMixin, placeholderMixin ],
        props: {
            isExtraSavings: {
                type: Boolean,
                default: false
            },
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
                scrollTimer: null,
                sortOptions: [],
                isPromotion: false,
                lvipStatus: null,
                savingsLabelPreferred: null
            };
        },
        computed: {
            ...mapGetters('categoryListing', ['params']),

            ...mapState('categoryListing', ['cache', 'data', 'pageNumber', 'error', 'refiners', 'sortValue', 'isBirthdayPromotion', 'isLvipPromotion', 'inventoryProcessed']),

            ...mapGetters('gtm', ['checkMounted', 'checkCreated']),

            ...mapState('navigation', ['profileData']),

            selectedSortValue: {
                get() {
                    return this.sortValue;
                },
                set(val) {
                    this.SET_SORT_VALUE(val);
                }
            },
            showCta() {
                if(this.isBirthdayPromotion) {
                    if(this.userFlags.ViewMemberPricing) {
                        const today = new Date();
                        // Get user's month in their time zone
                        const todaysMonth = today.getMonth();
                        const birthday = new Date(this.profileData?.BirthDate);
                        const birthMonth = birthday?.getUTCMonth();
                        // check if user's birthday is this month
                        let spouseBirthMonth = null;
                        if(this.profileData?.SpouseBirthDate) {
                            const spouseBirthDate = new Date(this.profileData?.SpouseBirthDate);
                            spouseBirthMonth = spouseBirthDate?.getUTCMonth();
                        }
                        return todaysMonth !== null &&
                            ((birthMonth !== null && todaysMonth === birthMonth) ||
                                (spouseBirthMonth !== null && todaysMonth === spouseBirthMonth));
                    } else {
                        return false;
                    }
                }
                return true;
            },
            facets() {
                return this.data?.FacetRefiners || [];
            },
            cards() {
                return this.data?.Cards || [];
            },
            showFirstSpinner() {
                // Show spinner IF:
                // The Invetory API is NOT processed AND there's no cached data
                // OR the page is NOT ready
                return !this.inventoryProcessed || !this.ready;
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
            },
            userFlags() {
                return this.data?.UserFlags || {};
            },
            isPreferredUser() {
                return this.data?.IsPreferredUser || false;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isKr() {
                return this.$env?.Country === 'Korea';
            },
            isStrikethroughOriginalPriceEnabled() {
                return this.getLocalizationProp('Data.ShowStrikethroughOriginalPrice');
            }
        },
        watch: {
            params: {
                deep: true,
                handler() {
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
                }
            },
            urlParams: {
                deep: true,
                async handler() {
                    if(this.ready && !this.historyReset) {
                        window.history.replaceState(window.history.state, '', decodeURIComponent(`${window.location.pathname}?${this.urlParams.toString()}`));

                        await this.load();

                        this.replaceState();
                    }
                }
            },
            cards(newVal) {
                if(newVal.length > 0) {
                    // GTM counting created parent components
                    this.INCREMENT_CREATED();
                    // Run GTM Impressions
                    this.mountImpressions();
                }
            }
        },
        created() {
            if(window.history.state) {
                this.onPopstate({ state: window.history.state });
                // fetch and save previous scroll position
                this._cachedScrollTop = window.history.state?.scrollTop || null;
            }

            // watch the history state for routing
            window.addEventListener('popstate', this.onPopstate);
            // watch scroll to retain scroll position upon revisit
            window.addEventListener('scroll', this.onScroll);
        },
        async mounted() {
            const birthdayPromotion = this.getLocalizationProp('Data.IsBirthdayPromotion', false);
            this.SET_IS_BIRTHDAY_PROMOTION(birthdayPromotion);
            if(this.isBirthdayPromotion) this.getNavigation();
            this.isPromotion = this.getLocalizationProp('Data.IsLvipPromotion');
            this.lvipStatus = this.getLocalizationProp('Labels.LvipStatus', null);
            this.SET_IS_LVIP_PROMOTION(this.isPromotion);

            if(this.isCn) {
                if(this.isPromotion) {
                    if(this.lvipStatus === null) {
                        this.savingsLabelPreferred = this.getLocalizationProp('Labels.BecomingLVIPSaving');
                    } else {
                        this.savingsLabelPreferred = this.getLocalizationProp('Labels.PreferredMemberSaving');
                    }
                } else {
                    if(!this.userFlags.ViewMemberPricing) {
                        this.savingsLabelPreferred = this.getLocalizationProp('Labels.BecomingAPreferredMember');
                    } else {
                        this.savingsLabelPreferred = this.getLocalizationProp('Labels.VersusBuyingIndividual');
                    }
                }
            } else {
                if(this.isPromotion && this.lvipStatus === null && this.getLocalizationProp('Labels.BecomeVIPMember')) {
                    this.savingsLabelPreferred = this.getLocalizationProp('Labels.BecomeVIPMember');
                } else if(this.lvipStatus !== null && this.isPromotion) {
                    this.savingsLabelPreferred = '';
                } else {
                    this.savingsLabelPreferred = this.getLocalizationProp('Labels.BecomingAPreferredMember');
                }
            }

            if(this.isExtraSavings) {
                this.SET_IS_EXTRA_SAVINGS();
            }

            // add any existing url params
            this.urlParams = new URLSearchParams(decodeURIComponent(window.location.search));

            this.setSortOptions();
            this.setupRefiners();

            // setup category ID to be used as the uri slug
            this.SET_CATEGORY_ID(this.getLocalizationProp('Data.CategoryPageId'));

            this.urlParams.append('isLvipPromotion', this.isPromotion);
            if(this.isBirthdayPromotion) this.urlParams.append('isBirthdayPromotion', true);
            await this.load();

            // if a scroll position was cached, move user to that position
            if(this._cachedScrollTop) {
                document.documentElement.scrollTop = this._cachedScrollTop;
            }

            this.replaceState();

            this.ready = true;
        },
        beforeDestroy() {
            window.removeEventListener('popstate', this.onPopstate);
            window.removeEventListener('scroll', this.onScroll);
        },
        methods: {
            ...mapActions('categoryListing', ['cancel', 'getData']),

            ...mapMutations('categoryListing', ['SET_CATEGORY_ID', 'SET_DATA', 'SET_PAGE_NUMBER', 'SET_IS_EXTRA_SAVINGS', 'SET_IS_BIRTHDAY_PROMOTION', 'SET_IS_LVIP_PROMOTION', 'CLEAR_REFINERS', 'OVERWRITE_REFINERS', 'REMOVE_REFINER', 'SET_REFINER_KEY', 'TOGGLE_REFINER', 'SET_SORT_KEY', 'SET_SORT_VALUE']),

            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions', 'updateProductCards']),
            ...mapMutations('gtm', ['INCREMENT_CREATED']),

            ...mapActions('navigation', ['getNavigation']),

            async load() {
                if(!this.loading) {
                    this.loading = true;
                } else {
                    this.cancel();
                }

                const hasCache = this.cache.find(cacheItem => isEqual(cacheItem.params, this.params));

                if(hasCache) {
                    await this.SET_DATA(hasCache.data);
                    this.loading = false;
                    return;
                }

                const wasCanceled = await this.getData({ params: this.urlParams, initial: !this.ready });

                if(!wasCanceled) {
                    this.loading = false;
                }
            },
            loadMore() {
                if(this.loading) {
                    return;
                }
                // reset GTM cards to push new cards data
                this.updateProductCards();
                this.SET_PAGE_NUMBER(this.pageNumber + 1);
            },
            mountImpressions() {
                // Send GTM Card data
                const gtmProducts = this.cards || [];

                if(gtmProducts.length) {
                    for (let [i, card] of gtmProducts.entries()) {
                        const impressionItemData = {
                            sku: card.IsFamilyCard
                                ? card.InnerData.Data.FamilyID : card.InnerData.Data.Sku,
                            title: card.InnerData.Data.Title,
                            list: this.$gtmList,
                            position: i + 1
                        };

                        this.addCardImpressions(impressionItemData);
                    }

                    this.pushImpressions(); // GTM push product impressions
                }
            },
            onClickCTA(learnMoreObject) {
                if(learnMoreObject.Target) {
                    window.open(learnMoreObject.Url, learnMoreObject.Target);
                } else {
                    window.location.href = learnMoreObject.Url;
                }
            },
            showAll() {
                if(this.loading) {
                    return;
                }
                this.SET_PAGE_NUMBER(9999);
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
                    this.SET_DATA(evt.state.data || null);
                    this.OVERWRITE_REFINERS(evt.state.refiners);
                    this.SET_SORT_VALUE(evt.state.sortValue);
                } else {
                    this.urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
                    await this.load();
                }

                this.$nextTick(() => (this.historyReset = false));
            },
            onScroll() {
                clearTimeout(this.scrollTimer);
                this.scrollTimer = setTimeout(() => requestAnimationFrame(this.replaceState), 200);
            },
            onShelfHide() {
                this.$refs['facet-modal-toggle'].$el.focus();
                this.facetModalVisible = false;
            },
            replaceState() {
                const scrollTop = { scrollTop: window.pageYOffset };

                try {
                    window.history.replaceState({
                        ...window.history.state,
                        ...scrollTop
                    }, '');
                } catch (err) {
                    console.warn(HISTORY_STATE_SIZE_LIMIT);
                    // still retain scroll position just in case data needs to be reloaded
                    window.history.replaceState(scrollTop);
                }
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
            determineRestrictedPack(card) {
                return card.InnerData?.Data?.Products?.every(p => p.IsRestrictedPack) ?? false;
            }
        }
    };
</script>

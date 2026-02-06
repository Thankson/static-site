<template>
    <div :id="tabId" class="o-searchResults">
        <div class="o-searchResults__header">
            <div class="o-searchResults__text" aria-live="assertive" aria-atomic="true" role="status">
                <p v-if="!loading">{{ resultsText }}</p>
            </div>

            <div
                v-if="showSort"
                class="o-searchResults__sort">

                <m-filter-sort
                    v-model="sortValueData"
                    :title="labels.SortBy"
                    :aria-label="filterAriaLabel"
                    :options="sortOptions"
                    @input="getData({}, true)" />
            </div>
        </div>

        <a
            v-if="!showBusinessCenterButtonBelowResultsFeatureFlag && businessButton"
            class="a-button -white o-searchResults__button"
            :href="`${businessButton.Href}?q=${searchTerm}`"
            :target="businessButton.Target">

            <a-icon class="o-searchResults__icon" size="sm">search</a-icon>
            {{ businessButton.Text }}
        </a>

        <div class="o-searchResults__results" :class="{'-isCn': isCn }">
            <ul
                v-if="items.length"
                class="o-searchResults__grid"
                :class="loading ? '-isLoading' : ''">
                <li
                    v-for="(item, i) in itemsAndAds"
                    :key="i"
                    class="o-searchResults__col"
                    :class="`-${itemType}`">

                    <template v-if="itemType === 'Product'">
                        <m-mixin-ad
                            v-if="!item.InnerData"
                            :context="item"
                            :points-label="labels.Points || 'Points'"
                            :preferred-label="labels.Preferred || 'Preferred'"
                            :regular-label="labels.Regular || 'Regular'"
                            :user-flags="userFlags" />

                        <m-product-card
                            v-else-if="item.IsFamilyCard || item.IsProductCard"
                            :become-member-rte="labels.BecomeAMember"
                            :become-member-url="becomeMemberUrl"
                            :card-cta="labels.Select || 'Select'"
                            :combo-label="labels.FamilyComboMessage || 'Show more options'"
                            :concentrated-label="labels.Concentrated"
                            :diluted-label="labels.Diluted"
                            :eligible-for-saving-packs="item.EligibleForSavingPacks || false"
                            :family-id="item.InnerData && item.InnerData.Data ? String(item.InnerData.Data.FamilyId) : ''"
                            :family-label="labels.FamilyWithSkusMessage || 'Show {0} options'"
                            :family-off-sale-message="labels.FamilyOffSaleMessage"
                            :is-preferred="data.IsPreferred"
                            :is-off-sale="item.InnerData && item.InnerData.Data && item.InnerData.Data.IsOffSale"
                            :is-restricted-pack="determineRestrictedPack(item)"
                            :is-search="true"
                            :is-erp-date-valid="item.InnerData && item.InnerData.Data && item.InnerData.Data.IsErpDateValid"
                            :is-inventory-controlled="item.InnerData && item.InnerData.Data && item.InnerData.IsInventoryControlled"
                            :is-cn="isCn"
                            :is-kr="isKr"
                            :is-saving-pack="item.IsSavingPack || false"
                            :is-signed-in="data.UserFlags.IsAuthenticated"
                            :learn-more-label="labels.LearnMore"
                            :off-sale-message="item.InnerData && item.InnerData.Data && item.InnerData.Data.OffSaleMessage"
                            :off-sale-title="item.InnerData && item.InnerData.Data && item.InnerData.Data.OffSaleTitle"
                            :pdp-link="item.InnerData && item.InnerData.Data ? item.InnerData.Data.PdpLink : null"
                            :points-label="labels.Points"
                            :past-eligible-date-message="item.PastEligibleDateMessage || ''"
                            :add-list-label="labels.AddListAriaLabel"
                            :shelf-config-label="labels.ShelfConfigLabel"
                            :save-label="labels.Save"
                            :save-up-to-label="labels.SaveUpTo"
                            :savings-label-pack="labels.VersusBuyingIndividual"
                            :savings-label-preferred="labels.BecomingAPreferredMember"
                            :show-strikethrough-feature-flag="showStrikethroughFeatureFlag"
                            :points-label-singular="labels.PointsSingular"
                            :product="item.InnerData"
                            :quantity-available="item.quantityAvailable || 0"
                            :range-sr-text="labels.RangeSrText"
                            :script-id-configurator="scriptIdConfigurator"
                            :sku="item.InnerData && item.InnerData.Data ? item.InnerData.Data.Sku : ''"
                            :user-flags="userFlags"
                            :is-sold-out-label="labels.SoldOutLabel">

                            <template v-slot:restricted-pack-label>
                                <span v-html="labels.MemberOnlyOffer"></span>
                            </template>

                            <template v-slot:regular-price-label>
                                <span v-html="labels.Regular"></span>
                            </template>

                            <template v-slot:preferred-price-label>
                                <span v-html="labels.Preferred"></span>
                            </template>

                            <template v-if="preferredMemberLink" v-slot:learn-more-link>
                                <a :href="preferredMemberLink.Url" :target="preferredMemberLink.Target" @click.stop.prevent="onClickCTA(preferredMemberLink)">
                                    {{ preferredMemberLink.Text }}
                                </a>
                            </template>
                        </m-product-card>
                    </template>

                    <template v-if="itemType === 'Video'">
                        <m-mixin-ad
                            v-if="!item.VirtualVideo"
                            :context="item"
                            :points-label="labels.Points || 'Points'"
                            :preferred-label="labels.Preferred || 'Preferred'"
                            :regular-label="labels.Regular || 'Regular'"
                            :user-flags="userFlags" />

                        <o-video-modal-card
                            v-else
                            :id="getVideoId(item)"
                            card-size="-grid -searchResults"
                            :title="item.VirtualVideo.Title"
                            :desc="item.VirtualVideo.Description"
                            :has-reset="item.VirtualVideo.HasReset"
                            :is-watched="item.VirtualVideo.IsWatched"
                            :is-new="item.VirtualVideo.IsNew"
                            :localization="videoLabels"
                            :video-data="item.VirtualVideo"
                            :lte="item.LearnToEarn"
                            :prevent-seek="item.VirtualVideo.PreventSeek || false"
                            :allow-seek="item.VirtualVideo.AllowSeek || false" />
                    </template>

                    <a
                        v-if="itemType === 'Link'"
                        :href="item.Url" class="m-searchLink"
                        :aria-label="item.Title"
                        :target="[item.ContentType === 'ExternalLink'? '_blank': '_self']"
                        :rel="[item.ContentType === 'ExternalLink' ? 'noreferrer noopener' : '']">

                        <div class="m-searchLink__heading">
                            <h3
                                class="m-searchLink__title"
                                :class="{'text-red-riverbend': isRiverbend}"
                                v-html="item.Title" />

                            <span
                                v-if="item.ContentType === 'ExternalLink'"
                                class="m-searchLink__icon -newTab"
                                aria-hidden="true">
                                launch
                            </span>

                            <div
                                v-else-if="item.ContentType === 'Media'"
                                class="m-searchLink__pdf">

                                <span class="m-searchLink__icon -pdf" aria-hidden="true">description</span>
                                <span class="m-searchLink__details"> {{ labels.PDFText }}</span>
                            </div>
                        </div>

                        <p class="m-searchLink__url" aria-hidden="true" v-html="item.Url"></p>
                        <p class="m-searchLink__text" v-html="item.Description"></p>
                    </a>
                </li>
            </ul>

            <div
                v-if="showLoadMoreButton"
                class="o-searchResults__loadMore">

                <v-button
                    :aria-label="loadMoreAriaLabel"
                    class="-white px-40 py-10 font-bold w-full md:w-auto -center mx-8"
                    @click="loadMore">

                    {{ labels.LoadMore }}
                </v-button>
            </div>

            <div v-if="!loading && !items.length" class="o-searchResults__empty">
                <p class="o-searchResults__text -empty">
                    <span v-html="emptyTextField"></span>
                    <span v-if="indexTab > -1 && !isRiverbend" @click="goToTab" v-html="emptyTextTabComp"></span>
                </p>
            </div>
        </div>

        <div
            class="o-searchResults__loading"
            :class="[ loading ? '-isVisible' : '']">

            <a-loading-spinner :visible="loading" />
        </div>
    </div>
</template>
<script>
    import { mapActions, mapGetters, mapMutations } from 'vuex';
    import api from '@api/routes/productstore/search';
    import adsApi from '@api/routes/productstore/search/mixinads';
    import eventBus from '../../../mixins/event-bus';
    import soldOutApi from '@api/routes/products';
    import envSoldOut from '../../../mixins/env'; // sets the domain (when necessary)
    import inventoryProcessing from '../../../utils/inventory-processing';

    export default {
        name: 'OSearchTab',
        mixins: [ envSoldOut ],
        props: {
            businessButton: {
                type: Object,
                default: () => ({})
            },
            emptyText: {
                type: String,
                default: ''
            },
            endpoint: {
                type: String,
                required: true
            },
            filterAriaLabel: {
                type: String,
                default: ''
            },
            familyPdpLink: {
                type: String,
                default: ''
            },
            hasAds: {
                type: Boolean,
                default: false
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            loadMoreAriaLabel: {
                type: String,
                default: ''
            },
            localization: {
                type: Object,
                default: () => {}
            },
            pageSize: {
                type: Object,
                default: () => {}
            },
            paramsPl: {
                type: Object,
                default: () => {}
            },
            pdpLink: {
                type: String,
                default: ''
            },
            preferredMemberLink: {
                type: Object,
                default: () => ({})
            },
            showSort: {
                type: Boolean,
                default: true
            },
            sortValue: {
                type: String,
                default: ''
            },
            sortItems: {
                type: Array,
                default: () => []
            },
            tabId: {
                type: String,
                default: ''
            },
            itemType: {
                type: String,
                default: ''
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            showStrikethroughFeatureFlag: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                ads: [],
                categoryId: '',
                categoryName: '',
                loading: false,
                items: [],
                data: {},
                firstLoad: true,
                hasElements: {
                    Product: false,
                    Video: false,
                    Link: false
                },
                indexTab: 0,
                searchTerm: '',
                searchType: '',
                sortOptions: [],
                sortValueData: '',
                urlParams: null,
                userFlags: {
                    IsAuthenticated: false,
                    IsBackDating: false,
                    IsGuest: false,
                    IsGuestShoppingEnabled: false,
                    ViewPoints: false,
                    ViewMemberPricing: false,
                    ViewLists: false
                }
            };
        },
        computed: {
            ...mapGetters('lteVideos', [ 'getLocalization' ]),

            becomeMemberUrl() {
                return this.localization.Data?.BecomeAMemberLink?.Url;
            },
            emptyTextField() {
                return this.emptyText.replace('{0}', this.searchTerm || this.data.SearchTerm);
            },
            emptyTextTabComp() {
                const elKey = Object.keys(this.hasElements)[this.indexTab];
                const currBtn = `<button class="pl-5 text-green underline -linkTab">${this.labels[elKey]}</button>`;
                const txt = this.labels?.SeeResults?.replace('{0}', currBtn);
                return txt;
            },
            itemsAndAds() {
                const arr = [];
                this.items.forEach(item => {
                    if(item.InnerData?.Data) {
                        const pdpLink = this.getPdpLink(item.InnerData?.Data || {});
                        item.InnerData.Data.PdpLink = pdpLink;
                    }
                });
                arr.push(...this.items);
                this.ads.forEach(ad => {
                    arr.splice(ad.IndexValue - 1, 0, ad.Ad);
                });
                return arr;
            },
            labels() {
                return this.localization.Labels || {};
            },
            resultsText() {
                let searchTerm = this.searchTerm || this.data.SearchTerm;
                if(this.data.Fallback && this.data.Items.length) {
                    return this.labels.Fallback && this.data ? this.labels.Fallback
                        .replace('{0}', searchTerm)
                        .replace('{1}', this.data.SearchedTerm) : '';
                }
                if(this.categoryName && this.labels.ResultsInCategory && this.data) {
                    return this.labels.ResultsInCategory
                        .replace('{0}', this.items.length)
                        .replace('{1}', this.data.TotalItems)
                        .replace('{2}', searchTerm)
                        .replace('{3}', this.categoryName);
                }
                return this.labels.Results && this.data ? this.labels.Results
                    .replace('{0}', this.items.length)
                    .replace('{1}', this.data.TotalItems)
                    .replace('{2}', searchTerm) : '';
            },
            showBusinessCenterButtonBelowResultsFeatureFlag() {
                return this.localization?.Data?.ShowBusinessCenterButtonBelowResultsFeatureFlag || false;
            },
            showLoadMoreButton() {
                return this.items.length && this.data.CurrentPage < this.data.TotalPages;
            },
            videoLabels() {
                return this.getLocalization?.Data || {};
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isKr() {
                return this.$env?.Country === 'Korea';
            }
        },
        created() {
            if(this.itemType === 'Product') {
                this.INCREMENT_CREATED();
            }
        },
        mounted() {
            this.urlParams = new URLSearchParams(window.location.search);
            this.searchType = this.getUrlParam('searchType') || '';
            this.searchTerm = this.getUrlParam('searchTerm') || '';
            this.categoryId = this.getUrlParam('categoryId') || '';
            this.categoryName = this.getUrlParam('categoryName') || '';
            this.setSortOptions();
            this.getData(this.paramsPl || {});
            // Get Learn to Earn Labels
            if(this.itemType === 'videos') {
                this.fetchLocalization();
            }
            this.setResultPhrase();
        },
        methods: {
            ...mapActions('lteVideos', ['fetchLocalization']),
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapMutations('gtm', ['INCREMENT_CREATED']),

            calculatePageNumber() {
                if(this.firstLoad || this.pageSize.InitialPageSize === this.pageSize.LoadMorePageSize) {
                    return this.data.CurrentPage ? `&pageNumber=${this.data.CurrentPage}` : '';
                } else {
                    // this value needs to be calculated if the initialPageSize is different from the LoadMorePageSize
                    // the search results API will recalculate the number of pages to be displayed
                    // based on the new page size and total items. This new value will cause already delivered items
                    // to be returned if we just increment the pageNumber being returned

                    let pageSize = Number(this.pageSize.LoadMorePageSize);
                    let currentNumberOfItems = this.items.length;
                    const pageNumber = Math.floor((currentNumberOfItems + pageSize) / pageSize);
                    this.data.CurrentPage = pageNumber;
                    return `&pageNumber=${this.data.CurrentPage}`;
                }
            },
            async getInventoryData(searchData) {
                try {
                    let items = searchData?.Items || [];

                    // Prepare Inventory API params
                    const envCountry = this.$env?.Country || 'UnitedStates';
                    const warehouseGroup = window.dataLayer?.find(layer => layer.warehouseGroup)?.warehouseGroup || 'IdahoFalls';
                    const skuQuery = inventoryProcessing.getAllSku(items);
                    const skuParams = new URLSearchParams();
                    skuParams.append('warehouseGroup', warehouseGroup);
                    skuParams.append('country', `${envCountry}`);
                    skuQuery.forEach(value => skuParams.append('skus', value));

                    // Call Inventory API
                    const soldOutResponse = skuQuery.length ? await soldOutApi.query(skuParams) : null;

                    // Process Inventory API response
                    if(soldOutResponse?.success && soldOutResponse?.data?.length) {
                        items = inventoryProcessing.processAllSku(items, soldOutResponse.data);
                    }

                    return { ...searchData, Items: items };
                } catch (e) {
                    console.log('[SearchTab] getInventoryData - Exception');
                    console.log(e);
                    return searchData;
                }
            },
            getData: async function(params, sortChange) {
                this.loading = true;
                if(sortChange) {
                    this.data.CurrentPage = 1;
                }
                const category = this.categoryId ? `&categoryId=${this.categoryId}` : '';
                const sort = this.sortValueData ? `&sortBy=${this.sortValueData}` : '';
                const page = this.calculatePageNumber();
                const searchType = this.searchType ? `&searchType=${this.searchType}` : '';
                let size;
                if(sortChange) {
                    size = `&pageSize=${this.items.length}`;
                } else {
                    size = `&pageSize=${this.firstLoad ? this.pageSize.InitialPageSize : this.pageSize.LoadMorePageSize}`;
                }

                api.setRoute(`${this.endpoint}?searchTerm=${this.searchTerm}${sort}${category}${page}${size}${searchType}`);
                const response = await api.query(params);
                if(response.success) {
                    this.firstLoad = false;

                    // If it's Product, then call Inventory API
                    if(this.itemType === 'Product') {
                        this.data = await this.getInventoryData(response.data?.Data || {});
                    } else {
                        this.data = response.data?.Data || {};
                    }

                    // this.data = response.data?.Data || {};
                    this.userFlags = this.data.UserFlags || {};
                    if(sortChange) {
                        this.items = this.data?.Items || [];
                    } else {
                        this.items.push(...this.data.Items);
                    }
                    this.$emit('update-title', this.data.TotalItems);
                    if(this.hasAds) this.getMixinAds();
                    this.getResultPhrase();
                    this.loading = false;

                    // GTM
                    this.$emit('setGtmTabSearch', {'total': this.data.TotalItems, 'searchTerm': this.searchTerm});
                    this.mountImpressions();
                }
            },
            mountImpressions() {
                if(this.itemType === 'Product') {
                    // Send GTM Card data
                    const gtmProducts = this.items || [];

                    if(gtmProducts.length) {
                        for (let [i, item] of gtmProducts.entries()) {
                            let sku = item.IsFamilyCard
                                ? item.InnerData.Data.FamilyId : item.InnerData.Data.Sku;
                            const impressionItemData = {
                                sku,
                                title: item.InnerData.Data.Title,
                                list: this.$gtmList,
                                position: i + 1
                            };

                            this.addCardImpressions(impressionItemData);
                        }

                        this.pushImpressions(); // GTM push product impressions
                    }
                }
            },
            getPdpLink({ FamilyId: familyId, Sku: sku, Image: { Sku: familySku } }) {
                if(!sku && !familyId) {
                    return this.pdpLink;
                }

                const id = sku || familySku || familyId;
                const pdpLink = (sku || familySku) ? this.pdpLink : this.familyPdpLink;

                return pdpLink.replace('{0}', id);
            },
            getMixinAds: async function() {
                const response = await adsApi.query({
                    searchTerm: this.searchTerm,
                    searchresulttype: this.itemType,
                    numberOfRecords: this.data.ItemsPerPage * this.data.CurrentPage
                });

                if(response.success) {
                    this.ads = response.data?.Data?.Items;
                }
            },
            getResultPhrase() {
                let indexEl = Object.keys(this.hasElements).indexOf(this.itemType);
                eventBus.$emit('setResultPhrase', { el: this.itemType, hasEl: this.items.length, index: indexEl });
            },
            setResultPhrase() {
                eventBus.$on('setResultPhrase', (payload) => {
                    (payload.hasEl) ? this.hasElements[payload.el] = true : this.hasElements[payload.el] = false;

                    switch (!this.items.length) {
                        case !this.hasElements.Product:
                            if(this.hasElements.Video) {
                                this.indexTab = 1;
                            } else {
                                (!this.hasElements.Link) ? this.indexTab = -1 : this.indexTab = 2;
                            }
                            break;
                        case !this.hasElements.Video:
                            (this.hasElements.Product) ? this.indexTab = 0 : this.indexTab = 2;
                            break;
                        case !this.hasElements.Link:
                            (this.hasElements.Product) ? this.indexTab = 0 : this.indexTab = 1;
                            break;
                    }
                });
            },
            goToTab() {
                this.$emit('activeCurTab', this.indexTab);
            },
            getUrlParam: function(param) {
                return this.urlParams.get(param);
            },
            getVideoId: function(item) {
                return item.LearnToEarn?.Metadata?.MetadataItemId || item.VirtualVideo.MediaId;
            },
            loadMore: function() {
                if(this.loading) {
                    return;
                }
                this.data.CurrentPage += 1;
                this.getData();
            },
            setSortOptions: function() {
                if(this.sortItems && this.sortItems.length > 0) {
                    this.sortOptions = this.sortItems.map(option => ({ name: option.Title, value: option.ItemId }));
                }
                this.sortValueData = this.sortValue || this.sortOptions[0]?.value || '';
            },
            determineRestrictedPack(item) {
                return (item.InnerData?.Data?.Products?.every(p => p.IsRestrictedPack) && this.data.UserFlags.IsAuthenticated);
            },
            onClickCTA(learnMoreObject) {
                if(learnMoreObject.Target) {
                    window.open(learnMoreObject.Url, learnMoreObject.Target);
                } else {
                    window.location.href = learnMoreObject.Url;
                }
            }
        }
    };
</script>

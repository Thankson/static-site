<template>
    <div :id="tabId" class="o-searchResultsGrow">
        <div class="o-searchResults__header">
            <div class="o-searchResults__text" aria-live="assertive" aria-atomic="true" role="status">
                <p v-if="!loading">{{ resultsText }}</p>
            </div>
        </div>
        <div class="o-searchResults__results">
            <!-- Renders when there are items and hasGrowSuiteSearch is true -->
            <ul
                v-if="items.length && itemType !== 'all'"
                class="o-searchResults__grid -growSuite"
                :class="loading ? '-isLoading' : ''">
                <!-- You can place different or similar rendering logic here -->
                <li
                    v-for="(item, i) in items"
                    :key="item.Result_Model.Title + i"
                    class="o-searchResults__col -grow">
                    <m-search-result-item-with-image
                        v-if="item.Result_Model"
                        :title="item.Result_Model?.Title"
                        :description="item.Object?.Summary"
                        :image="item.Result_Model?.ImageUrl"
                        :alt="item.Result_Model?.Title"
                        :badge="item.Result_Model?.Badge"
                        :url="item.Result_Model?.Link" />
                </li>
            </ul>
            <!-- Renders when there are items -->
            <div
                v-else-if="items.length && itemType === 'all'"
                :class="loading ? '-isLoading' : ''">
                <!-- You can place different or similar rendering logic here -->
                <div
                    v-for="group in filteredGroups"
                    :key="group.Provider_Code"
                    class="searchResults__grid">
                    <h3 class="o-searchResults__grid__subheading">{{ getTabByType(group.Provider_Code)?.Title }}</h3>
                    <ul class="o-searchResults__grid -growSuite">
                        <li
                            v-for="(item, i) in group.Items"
                            :key="item.Result_Model?.Title + i"
                            class="o-searchResults__col -grow"
                        >
                            <m-search-result-item-with-image
                                v-if="item.Result_Model"
                                :title="item.Result_Model?.Title"
                                :description="item.Object?.Summary"
                                :image="item.Result_Model?.ImageUrl"
                                :alt="item.Result_Model?.Title"
                                :badge="item.Result_Model?.Badge"
                                :url="item.Result_Model?.Link"
                            />
                        </li>
                    </ul>
                    <div
                        v-if="showSeeMoreButton(group)"
                        class="o-searchResults__loadMore">
                        <v-button
                            :aria-label="loadMoreAriaLabel"
                            class="-white px-40 py-10 font-bold w-full md:w-auto -center mx-8"
                            @click="seeMore(group)">
                            {{ labels.SeeAll }}
                        </v-button>
                    </div>
                </div>
            </div>
            <div
                v-show="showLoadMore"
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
    import api from '@api/routes/productstore/search';
    export default {
        name: 'OGrowSearchTab',
        props: {
            emptyText: {
                type: String,
                default: ''
            },
            endpoint: {
                type: String,
                required: true
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
                type: Number,
                default: () => {}
            },
            paramsPl: {
                type: Object,
                default: () => {}
            },
            initialSearchTerm: {
                type: String,
                default: ''
            },
            tabId: {
                type: String,
                default: ''
            },
            tabs: {
                type: Array,
                default: () => []
            },
            visible: {
                type: Boolean,
                default: false
            },
            itemType: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                loading: false,
                items: [],
                data: {},
                firstLoad: true,
                indexTab: 0,
                searchTerm: '',
                searchType: '',
                totalItems: 0,
                tabData: [],
                urlParams: null,
                showLoadMore: false
            };
        },
        computed: {
            emptyTextField() {
                return this.emptyText.replace('{0}', this.getQueryParams());
            },
            filteredGroups() {
                return (this.data['Hydra:Member'] || []).filter(group => group.Total_Items > 0);
            },
            labels() {
                return this.localization.Labels || {};
            },
            resultsText() {
                let searchTerm = this.getQueryParams();
                return this.labels.SearchResults && this.data ? this.labels.SearchResults
                    .replace('{0}', this.items.length)
                    .replace('{1}', this.totalItems)
                    .replace('{2}', searchTerm) : '';
            }
        },
        watch: {
            visible: {
                async handler(newVal) {
                    if(newVal && this.firstLoad) {
                        await this.getData(this.paramsPl || {});
                        this.$nextTick(() => {
                            this.$emit('update-tab-data', this.tabData);
                        });
                    }
                },
                immediate: true
            }
        },
        methods: {
            calculatePageNumber() {
                if(this.firstLoad) {
                    return this.data.CurrentPage ? `&pageNumber=${this.data.CurrentPage}` : '';
                } else {
                    // the search results API will recalculate the number of pages to be displayed
                    // based on the new page size and total items. This new value will cause already delivered items
                    // to be returned if we just increment the pageNumber being returned
                    let pageSize = Number(this.pageSize);
                    let currentNumberOfItems = this.items.length;
                    const pageNumber = Math.floor((currentNumberOfItems + pageSize) / pageSize);
                    this.data.CurrentPage = pageNumber;
                    return `&pageNumber=${this.data.CurrentPage}`;
                }
            },
            getData: async function(params) {
                this.loading = true;
                const token = window.Grow?.getAccessToken() || '';
                const page = this.calculatePageNumber();
                let size = `&pageSize=${this.pageSize}`;
                let searchTerm = this.getQueryParams();
                const tokenTerm = `&token=${token}`;
                api.setRoute(`${this.endpoint}?searchTerm=${searchTerm}${page}${size}${token ? tokenTerm : ''}`);
                const response = await api.query(params);
                if(response.success && response.data?.Success) {
                    this.firstLoad = false;
                    this.data = response.data?.Data || {};
                    let results = this.data?.['Hydra:Member'] || [];
                    if(results.length > 0) {
                        if(this.itemType === 'all') {
                            const newItems = (results || []).flatMap(
                                group => group.Items || []
                            );
                            this.items.push(...newItems);
                            // Sum up all items from each group
                            this.totalItems = (results || []).reduce((sum, group) => {
                                this.setTabTotal(group.Provider_Code.toLowerCase(), group.Total_Items);
                                this.getTabByType(group.Provider_Code.toLowerCase());
                                return sum + (group.Total_Items || 0);
                            }, 0);
                            this.setTabTotal(this.itemType.toLowerCase(), this.totalItems);
                        } else {
                            this.items.push(...results);
                            if(this.data && this.data['Hydra:TotalItems'] !== undefined) {
                                this.totalItems = this.data?.['Hydra:TotalItems'] || 0;
                            }
                        }
                    }
                    this.loading = false;
                    this.showLoadMore = this.showLoadMoreButton(this.totalItems);
                    // GTM
                    this.$emit('setGtmTabSearch', {'total': this.totalItems, 'searchTerm': this.getQueryParams()});
                }
            },
            getQueryParams() {
                return this.initialSearchTerm || this.data.SearchTerm || '';
            },
            getTabByType(type) {
                const match = this.tabs.find(tab => tab.Type?.toLowerCase() === type?.toLowerCase());
                return match;
            },
            goToTab() {
                this.$emit('activeCurTab', this.indexTab);
            },
            seeMore: function(group) {
                const groupIndex = this.tabs.findIndex(g => g.Type.toLowerCase() === group.Provider_Code.toLowerCase());
                this.indexTab = groupIndex;
                this.goToTab();
            },
            loadMore: function(group) {
                if(this.loading) {
                    return;
                }
                this.data.CurrentPage += 1;
                this.getData();
            },
            setTabTotal(type, total) {
                const existingTab = this.tabData.find(tab => tab.type === type);
                if(!existingTab) {
                    this.tabData.push({ type, total });
                }
            },
            showSeeMoreButton(group) {
                if(group) {
                    return group.Total_Items > 3;
                }
                return false;
            },
            showLoadMoreButton(totalItems) {
                if(this.itemType === 'all') {
                    return false;
                }
                if(this.items.length && this.items.length < totalItems) {
                    return true;
                }
                return false;
            }
        }
    };
</script>

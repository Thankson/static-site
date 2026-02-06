<template>
    <section
        v-if="getLocalizationProp('Data')"
        class="p-growSearchResult">
        <o-tabs
            v-show="tabsReady"
            ref="searchtab"
            :update-title="update"
            :show-simplified-tabs="true"
            :tabs="tabsWithCount"
            tab-classes="-growSearchTab"
            @set-active="setActive" />

        <div v-if="$slots['banner']" class="relative z-0 md:pt-24 pb-15 md:pb-8">
            <slot name="banner" />
        </div>

        <div v-for="(tab, idx) in filteredTabs" :key="`${tab.Type} tab`">
            <o-grow-search-tab
                v-show="idx === activeTab"
                :visible="idx === activeTab"
                :tab-id="`${tab.Type}-tab`"
                :localization="localization"
                :item-type="tab.Type"
                :empty-text="getTabEmptyMessage(tab)"
                :endpoint="tab.Endpoint"
                :load-more-aria-label="tab.LoadMoreAriaLabel"
                :page-size="tab.PageSize"
                :params-pl="getLocalizationProp('Data.ParamsPl', {})"
                :initial-search-term="searchTerm"
                :tabs="filteredTabs"
                @update-tab-data="updateAllTabData"
                @activeCurTab="activeCurTab"
                @setGtmTabSearch="setGtmTabSearch">
            </o-grow-search-tab>
        </div>
    </section>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'PGrowSearchResult',
        mixins: [ localizationMixin ],
        data() {
            return {
                activeTab: 'all',
                searchTerm: '',
                tabsLoaded: 0,
                tabsName: [],
                totalItemsEachTab: [],
                update: '',
                tabsReady: false
            };
        },
        computed: {
            defaultEmptyText() {
                return this.getLocalizationProp('Labels.EmptyText', '');
            },
            filteredTabs() {
                return this.getLocalizationProp('Data.Tabs', []).filter(tab => !tab.Hidden);
            },
            sumTotalItems() {
                const sum = this.totalItemsEachTab.reduce((a, b) => a + b, 0);
                return sum;
            },
            tabsWithCount() {
                return this.filteredTabs.map(tab => {
                    return {
                        ...tab,
                        Title: tab.Title
                    };
                });
            },
            totalTabs() {
                const tabs = this.getLocalizationProp('Data.Tabs', []);
                return tabs.length;
            }
        },
        watch: {
            tabsLoaded(val) {
                // Push to DataLayer only when all data/tabs have been loaded
                if(val === this.totalTabs) this.dataLayerPush();
            }
        },
        mounted() {
            this.searchTerm = this.getUrlParam('searchTerm');
        },
        methods: {
            getUrlParam(paramName) {
                const params = new URLSearchParams(window.location.search);
                for (const [key, value] of params.entries()) {
                    if(key.toLowerCase() === paramName.toLowerCase()) {
                        return value;
                    }
                }
                return '';
            },
            getTabEmptyMessage(tab) {
                if(this.defaultEmptyText) {
                    return this.defaultEmptyText;
                }

                return tab.EmptyText;
            },
            updateAllTabData(tabDataArray) {
                if(tabDataArray.length === 0) return;
                const tabs = this.filteredTabs;
                const countMap = {};

                // Create a map for quick access
                tabDataArray.forEach(({ type, total }) => {
                    countMap[type] = total;
                });

                // Update tab titles
                tabs.forEach((tab, index) => {
                    const count = countMap[tab.Type?.toLowerCase()];
                    if(typeof count !== 'undefined') {
                        tab.Title = `${tab.Title} (${count})`;
                        tab.Hidden = index === 0 ? false : count === 0;
                    } else {
                        tab.Hidden = true;
                    }
                });

                this.tabsReady = true;
            },
            scrollActiveTabIntoView(tab) {
                tab.focus();
                tab.scrollIntoView({behavior: 'smooth', inline: 'center'});
            },
            setActive: function(value) {
                this.activeTab = value;
                const dataTab = this.filteredTabs;
                const tab = document.querySelectorAll(`.m-tabs__list button`)[value];
                const tabName = dataTab[value].Title;
                if(tab) {
                    this.scrollActiveTabIntoView(tab);
                }
                this.gtmTrackAction({id: 185, text: tabName}, {});
            },
            activeCurTab: function(value) {
                this.activeTab = value;
                this.$refs.searchtab.selectTab(value);
            },
            setGtmTabSearch(payload) {
                this.totalItemsEachTab.push(payload.total);
                this.searchTerm = payload.searchTerm;
            },
            dataLayerPush() {
                window.dataLayer && window.dataLayer.push({
                    'event': 'userEvent',
                    'eC': 'Internal Search Results',
                    'eA': this.sumTotalItems,
                    'eL': this.searchTerm
                });
            }
        }
    };
</script>

<template>
    <section
        v-if="getLocalizationProp('Data')"
        class="p-searchResult"
        :class="{'-isCn' : isCn}">

        <o-tabs
            ref="searchtab"
            :update-title="update"
            :show-simplified-tabs="showSimplifiedTabs"
            :tabs="getLocalizationProp('Data.Tabs', [])"
            @set-active="setActive" />

        <div v-if="$slots['banner'] && isRiverbend" class="relative z-0 md:pt-24 pb-15 md:pb-8">
            <slot name="banner" />
        </div>

        <div v-for="(tab, idx) in getLocalizationProp('Data.Tabs', [])" :key="idx">
            <o-search-tab
                v-show="idx === activeTab"
                :tab-id="`${tab.Type}-tab`"
                :business-button="getLocalizationProp('Data.BusinessButton', null)"
                :localization="localization"
                :show-sort="tab.ShowSort"
                :item-type="tab.Type"
                :empty-text="getTabEmptyMessage(tab)"
                :endpoint="tab.Endpoint"
                :filter-aria-label="tab.FilterAriaLabel"
                :family-pdp-link="tab.FamilyPdpLink"
                :is-riverbend="isRiverbend"
                :pdp-link="tab.PdpLink"
                :has-ads="tab.HasAds"
                :load-more-aria-label="tab.LoadMoreAriaLabel"
                :page-size="tab.PageSize"
                :params-pl="getLocalizationProp('Data.ParamsPl', {})"
                :preferred-member-link="tab.PreferredMemberLearnMoreLink || {}"
                :show-strikethrough-feature-flag="isStrikethroughOriginalPriceEnabled"
                :sort-items="tab.SortOptions || []"
                :sort-value="tab.SortValue || ''"
                :tabs="getLocalizationProp('Data.Tabs', [])"
                @update-title="updateTitle(tab, ...arguments)"
                @activeCurTab="activeCurTab"
                @setGtmTabSearch="setGtmTabSearch">
            </o-search-tab>
        </div>
    </section>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'PSearchResult',
        mixins: [ localizationMixin ],
        data() {
            return {
                activeTab: 0,
                isRiverbend: false,
                searchTerm: '',
                tabsLoaded: 0,
                tabsName: [],
                totalItensEachTab: [],
                update: ''
            };
        },
        computed: {
            defaultEmptyText() {
                return this.getLocalizationProp('Data.DefaultEmptyText', '');
            },
            sumTotalItems() {
                const sum = this.totalItensEachTab.reduce((a, b) => a + b, 0);
                return sum;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            showSimplifiedTabs() {
                return this.getLocalizationProp('Data.TabStyleUpdates', false);
            },
            totalTabs() {
                const tabs = this.getLocalizationProp('Data.Tabs', []);
                return tabs.length;
            },
            isStrikethroughOriginalPriceEnabled() {
                return this.getLocalizationProp('Data.ShowStrikethroughOriginalPrice');
            }
        },
        watch: {
            searchTerm() {
                if(!this.localization?.Data?.RiverbendKeywordsList?.trim()) {
                    this.isRiverbend = false;
                    return;
                }
                const keywordList = this.localization?.Data?.RiverbendKeywordsList?.toLowerCase().split(',').map(term => term.trim());
                this.isRiverbend = this.searchTerm && keywordList.some(a => {
                    // test if any keyword is a word in the searchTerm
                    let regex = new RegExp(`\\b${a}\\b`, 'i');
                    return regex.test(this.searchTerm);
                });
            },
            tabsLoaded(val) {
                // Push to DataLayer only when all data/tabs have been loaded
                if(val === this.totalTabs) this.dataLayerPush();
            }
        },
        methods: {
            getTabEmptyMessage(tab) {
                if(this.isRiverbend && tab?.RiverbendEmptyText) {
                    return tab.RiverbendEmptyText;
                }

                if(this.defaultEmptyText) {
                    return this.defaultEmptyText;
                }

                return tab.EmptyText;
            },
            getTab: function(itemType) {
                return this.getLocalizationProp(`Data.Tabs`).find(tab => tab.Type === itemType);
            },
            updateTitle: function(tab, value) {
                tab.Title = `${tab.Title.replace(/ *\([^)]*\) */g, '')} (${value})`;
                this.update = tab.Title;
                this.tabsName.push(tab.Title);
                this.tabsLoaded += 1;
            },
            setActive: function(value) {
                this.activeTab = value;
                const dataTab = this.getLocalizationProp(`Data.Tabs`);
                const tab = document.querySelectorAll(`.m-tabs__list button`)[value];
                const tabName = dataTab[value].Title;
                if(tab) {
                    tab.focus();
                }
                this.gtmTrackAction({id: 185, text: tabName}, {});
            },
            activeCurTab: function(val) {
                this.$refs.searchtab.selectTab(val);
            },
            setGtmTabSearch(payload) {
                this.totalItensEachTab.push(payload.total);
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

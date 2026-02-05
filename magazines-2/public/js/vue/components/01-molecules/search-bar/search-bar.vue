<template>
    <div
        v-click-outside="handlehidePanel"
        class="m-searchBar"
    >
        <div class="m-searchBar__control">
            <button class="m-searchBar__icon material-icons" aria-hidden="true" @click="handleSearch">search</button>
            <label for="search" class="sr-only">
                {{ getLocalizationProp('Labels.AriaLabels.SearchBtnAria', 'Press enter to search') }}
            </label>
            <input
                id="search"
                v-model.trim="keywords"
                class="m-searchBar__input"
                :class="{
                    '-word': keywords.length
                }"
                type="text"
                name="search"
                autocomplete="off"
                :placeholder="getLocalizationProp('Labels.Text', 'search')"
                @keyup.enter="handleSearch"
                @focus="handleShowPanel"
            />
            <button v-show="keywords.length" class="m-searchBar__icon -close material-icons" aria-hidden="true" @click="handleClear">close</button>
        </div>
        <div v-show="isShowPanel" class="m-searchBar__panelPc">
            <div class="m-searchBar__panelHeader">
                <div class="m-searchBar__panelTitle">{{ getLocalizationProp('Labels.History', 'Search History') }}</div>
                <button class="m-searchBar__panelDeleteIcon material-icons" @click="removeHistory">delete</button>
            </div>
            <div class="m-searchBar__panelContent">
                <ul class="m-searchBar__historyList">
                    <li v-for="h in historyListComputed" :key="h" class="m-searchBar__historyItem" @click="handleSearch(h)">
                        <button>{{ h }}</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { ls } from '@common/source/js/utils/local-storage';

    const MAGAZINE_SEARCH_HISTORY = 'MAGAZINE_SEARCH_HISTORY';
    export default {
        name: 'MSearchBar',
        mixins: [ localizationMixin],
        data() {
            return {
                showPanel: false,
                keywords: '',
                historyList: []
            };
        },
        computed: {
            historyListComputed() {
                if(this.keywords) {
                    return this.historyList.filter(i => (
                        i.indexOf(this.keywords) > -1
                    ));
                }
                return this.historyList;
            },
            isShowPanel() {
                return this.showPanel && this.historyListComputed.length;
            },
            maxHistoryCnt() {
                return Number(this.getLocalizationProp('Data.MaxHistoryCnt', 10));
            },
            showHistory() {
                return this.getLocalizationProp('Data.ShowHistory') === '1';
            }
        },
        mounted () {
            this.getHistory();
            const usp = new URLSearchParams(window.location.search);
            this.keywords = usp.get('keywords') || '';
        },
        methods: {
            gotoSearchPage(keywords) {
                this.setHistory(keywords);
                window.location.href = `${this.getLocalizationProp('Data.ResultPage', '#')}?keywords=${keywords}`;
            },
            handleSearch(keywords) {
                const kw = typeof keywords === 'string' ? keywords : this.keywords;
                if(!kw) return;
                this.gotoSearchPage(kw);
            },
            handleClear() {
                this.keywords = '';
            },
            handleShowPanel() {
                if(!this.showHistory) return;
                this.showPanel = true;
            },
            handlehidePanel() {
                this.showPanel = false;
            },
            getHistory() {
                this.historyList = ls.getItem(MAGAZINE_SEARCH_HISTORY, []);
            },
            setHistory(val) {
                this.getHistory();

                const valIndex = this.historyList.indexOf(val);
                if(valIndex > -1) {
                    this.historyList.splice(valIndex, 1);
                }
                this.historyList.unshift(val);

                if(this.historyList.length > this.maxHistoryCnt) {
                    this.historyList.splice(this.maxHistoryCnt);
                }
                ls.setItem(MAGAZINE_SEARCH_HISTORY, this.historyList);
            },
            removeHistory() {
                ls.removeItem(MAGAZINE_SEARCH_HISTORY);
                this.getHistory();
            }

        }
    };
</script>

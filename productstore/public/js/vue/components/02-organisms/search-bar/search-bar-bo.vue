<template>
    <div class="o-searchBar -bo">
        <form
            id="search-bar-bo"
            v-clickoutside="closeSuggestions"
            action=""
            method="post"
            name="search-bar-bo"
            class="o-searchBar__form"
            role="search"
            autocomplete="off"
        >
            <input
                ref="search-input-bo"
                v-model="input"
                class="o-searchBar__input"
                type="search"
                name="Search"
                :placeholder="getLocalizationProp('Labels.BackupOrderProducts.Search', 'Search')"
                :aria-placeholder="getLocalizationProp('Labels.BackupOrderProducts.AriaPlaceholder', 'Type in here what you need and proceed to the following button')"
                data-testid="input-searchBar"
                @focus="setValue"
                @input="onInput"
                @keydown.enter.prevent="submit"
                @keyup.esc="closeSuggestions"
            >
            <button v-show="input.length > 0" :aria-label="getLocalizationProp('Labels.BackupOrderProducts.ClearBtnAria', 'Clear the search text')" class="o-searchBar__clear -bo" @click="clearSearchBar">close</button>

            <!-- Suggestion List -->
            <div
                v-if="showSuggestions"
                class="o-searchBar__suggestions"
            >
                <ol ref="suggestionList" class="o-searchBar__list">
                    <m-search-suggest-bo
                        v-for="(item, index) in suggestions" :key="item.term + index"
                        :item="item"
                        @searchBo="submitSuggestion"
                        @closeSuggestions="closeSuggestions"
                    >
                    </m-search-suggest-bo>
                </ol>
            </div>
        </form>
        <button
            class="o-searchBar__btn"
            :aria-label="getLocalizationProp('Labels.BackupOrderProducts.BtnAria', 'Press enter to search')"
            data-testid="button-searchBar"
            @click.prevent="submit"
        >
            <img
                class="o-searchBar__icon"
                :src="getLocalizationProp('Data.SearchIcon.Url', '//cdnsc1.melaleuca.com/na/images/header/search2x.png')"
                :alt="getLocalizationProp('Data.SearchIcon.Alt', 'Click to Search')"
                aria-hidden="true">
        </button>
    </div>
</template>

<script>
    import localization from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';
    import { debounce } from 'lodash';

    export default {
        name: 'OSearchBarBo',

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

        mixins: [ localization ],

        data() {
            return {
                input: '',
                inputChangedBy: '',
                intervalId: null,
                showSuggestions: false
            };
        },

        computed: {
            ...mapState('searchBackupOrder', ['suggestions']),

            servicesEnv() {
                return this.$env?.ServiceBaseUrl;
            },

            inputLowerCase() {
                return this.input.toLowerCase();
            },

            useProductAutoSuggest() {
                return this.getLocalizationProp('Data.UseProductAutoSuggest', false);
            }
        },

        watch: {
            suggestions(val) {
                if(this.suggestions?.length) {
                    this.showSuggestions = true;
                } else {
                    this.showSuggestions = false;
                }
            },
            showSuggestions(val) {
                if(val && this.suggestions?.length && this.testInputValue(this.input)) {
                    this.showSuggestions = true;
                } else {
                    this.showSuggestions = false;
                }
            },
            input(val) {
                if(val.length === 0 && this.inputChangedBy !== 'resetSearch') {
                    this.$emit('updateFilter');
                }
            }
        },

        created() {
            // Debounce
            this.debounceInputSearch = debounce(this.debounceInputSearch, 100, { leading: false, trailing: true });
        },

        methods: {
            ...mapActions('searchBackupOrder', ['getSuggestion', 'clearStoreSearch']),

            cleanSearch() {
                this.clearStoreSearch();
            },

            clearSearchBar(event) {
                event.preventDefault();
                this.inputChangedBy = '';
                this.input = '';
                this.clearStoreSearch();
                this.$refs['search-input-bo'].focus();
            },

            closeSuggestions() {
                this.showSuggestions = false;
            },

            createSuggestions() {
                // call API
                this.getSuggestion({
                    term: this.inputLowerCase,
                    culture: this.getLocalizationProp('Data.Culture', 'en-us'),
                    address: this.servicesEnv,
                    channelid: this.getLocalizationProp('Data.ChannelId', 'backuporder'),
                    product: this.useProductAutoSuggest
                });
            },

            resetSearch() {
                this.inputChangedBy = 'resetSearch';
                this.input = '';
            },

            search() {
                this.createSuggestions();
                this.showSuggestions = true;
            },

            setValue() {
                const inputValue = this.inputLowerCase;

                clearInterval(this.intervalId);
                this.debounceInputSearch(inputValue);
            },

            onInput() {
                this.inputChangedBy = '';
                this.setValue();
            },

            debounceInputSearch(inputValue) {
                this.intervalId = setTimeout(() => {
                    if(this.testInputValue(inputValue)) {
                        this.search();
                    } else {
                        this.clearStoreSearch();
                    }
                }, 300);
            },

            submit() {
                this.closeSuggestions();
                this.$emit('updateFilter');
            },

            submitSuggestion(val) {
                this.input = val;
                this.submit();
            },

            testInputValue(inputValue) {
                return (inputValue.length > 2 && !/[\u4e00-\u9fa5]/.test(inputValue)) || (inputValue.length > 0 && /[\u4e00-\u9fa5]/.test(inputValue));
            }
        }
    };
</script>

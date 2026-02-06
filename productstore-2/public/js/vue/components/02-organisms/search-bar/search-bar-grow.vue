<template>
    <div v-click-outside="hideSearchBar" class="o-searchBarGrow o-searchBar justify-end">
        <div v-show="isOpen" class="w-full" aria-live="polite">
            <button
                class="o-searchBar__btn top-7"
                :aria-label="getLocalizationProp('Labels.BtnAria')"
                data-testid="button-searchBar"
                @click.enter.prevent="submit"
            >
                <img
                    class="o-searchBar__icon"
                    :src="getLocalizationProp('Data.SearchIcon.Url')"
                    :alt="getLocalizationProp('Data.SearchIcon.Alt')"
                    aria-hidden="true">
            </button>
            <form
                id="search-bar-grow"
                ref="searchBarGrow"
                action=""
                method="post"
                name="search-bar-grow"
                class="o-searchBar__form"
                role="search"
                autocomplete="off"
            >
                <input
                    ref="search-input"
                    v-model="input"
                    class="o-searchBar__input"
                    type="search"
                    name="Search"
                    :placeholder="getLocalizationProp('Labels.Placeholder')"
                    :aria-placeholder="getLocalizationProp('Labels.AriaPlaceholder')"
                    data-testid="input-searchBar"
                    @input="onInput"
                    @keydown.enter.prevent="submit"
                >
                <button :aria-label="getLocalizationProp('Labels.ClearBtnAria')" class="o-searchBar__clear" @click.stop="clearSearchBar">close</button>
            </form>
        </div>
        <button v-show="!isOpen" class="icon-button" @click="openSearch">
            <img
                :src="getLocalizationProp('Data.GrowSearchIcon.Url')"
                :alt="getLocalizationProp('Data.GrowSearchIcon.Alt')"
                aria-hidden="true">
        </button>
    </div>
</template>

<script>
    import localization from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    export default {
        name: 'OSearchBarGrow',

        mixins: [ localization, isDesktop ],

        data() {
            return {
                input: '',
                intervalId: null,
                isOpen: false,
                typingStatus: false
            };
        },

        computed: {
            ...mapState('userFlags', ['userFlags'])
        },

        watch: {
            isOpen(val) {
                const searchCol = document.querySelector('.o-siteHeaderGrow__search');
                if(val && !this.isDesktop) {
                    if(searchCol) {
                        const siblingCols = document.querySelectorAll('.o-siteHeader__col');
                        siblingCols.forEach(col => {
                            if(col !== searchCol) {
                                col?.classList?.add('hidden');
                            }
                        });
                    }
                    const myAccountCol = document.querySelector('.o-siteHeader__col.-actions');
                    if(myAccountCol) {
                        myAccountCol.classList?.remove('-actions');
                    }
                }
                searchCol?.classList?.add('w-full');
            }
        },

        mounted() {
            this.getUserFlags();
            // Inject term on the search input
            const termOnLoad = new URLSearchParams(window.location.search).get('searchTerm');
            if(termOnLoad) this.input = termOnLoad;
        },

        methods: {
            ...mapActions('userFlags', ['getUserFlags']),

            clearSearchBar(event) {
                event.preventDefault();
                this.input = '';
                this.hideSearchBar();
            },
            hideSearchBar() {
                this.isOpen = false;
                const searchCol = document.querySelector('.o-siteHeaderGrow__search');
                if(!this.isDesktop) {
                    if(searchCol) {
                        const siblingCols = document.querySelectorAll('.o-siteHeader__col');
                        siblingCols.forEach(col => {
                            if(col !== searchCol) {
                                col?.classList?.remove('hidden');
                            }
                        });
                    }
                    const myAccountCol = document.querySelector('.o-siteHeader__col.-actions');
                    if(myAccountCol) {
                        myAccountCol.classList?.add('-actions');
                    }
                    searchCol?.classList?.remove('w-full');
                }
            },
            onInput(val) {
                if(val?.target?.value) {
                    this.input = val.target.value;
                }
            },

            openSearch() {
                this.isOpen = true;
            },

            submit() {
                if(this.input.length === 0) {
                    window.location.reload();
                } else {
                    const searchPageUrl = this.getLocalizationProp('Data.SearchPageUrl');
                    let searchUrl = `${searchPageUrl}?searchTerm=${encodeURIComponent(this.input)}`;
                    window.location = searchUrl;
                }
            }
        }
    };
</script>

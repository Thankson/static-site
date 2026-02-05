<template>
    <div class="o-searchInfo o-categoryList">
        <div v-if="paging.totalResult" class="o-categoryList__content">
            <m-main-category
                v-for="(article, index) in items" :key="`${article.Title}-${index}`"
                :article="article"
                :labels="labels"
            ></m-main-category>
        </div>
        <search-without-result v-if="!paging.totalResult && !loading" :labels="labels" :keywords="keywords"></search-without-result>
        <div class="o-categoryList__paging">
            <a-loading-spinner :visible="loading" />
            <v-button
                v-show="showPagingBtn"
                @click="getNextPageData"
            >{{ labels.LoadMore }}</v-button>
        </div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import SearchWithoutResult from '../../01-molecules/search/search-without-result.vue';

    export default {
        name: 'OSearchInfo',
        components: {SearchWithoutResult},
        props: {
            labels: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                keywords: ''
            };
        },
        computed: {
            ...mapState('searchList', ['items', 'paging', 'loading']),
            showPagingBtn() {
                const {pageNumber, pageSize, totalResult} = this.paging;
                return (pageNumber * pageSize) < totalResult;
            },
            tagId() {
                return this.localization?.Data?.CategoryId || '';
            }
        },
        mounted () {
            this.UPDATE_SEARCH_PARAMS({
                ...this.getParamValFromUrl()
            });
        },
        methods: {
            ...mapMutations('searchList', ['UPDATE_SEARCH_PARAMS']),
            ...mapActions('searchList', ['getData']),
            getParamValFromUrl() {
                const usp = new URLSearchParams(window.location.search);
                this.keywords = usp.get('keywords');
                return {
                    // make sure keywords filed is required
                    keywords: this.keywords || ''
                };
            },
            getNextPageData() {
                this.getData({
                    pageNumber: this.paging.pageNumber + 1
                });
            }
        }
    };
</script>

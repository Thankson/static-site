<template>
    <div class="o-categoryList">
        <div v-if="paging.totalResult" class="o-categoryList__content">
            <m-main-category
                v-for="(article, index) in items" :key="`${article.Title}-${index}`"
                :article="article"
                :labels="labels"
            ></m-main-category>
        </div>
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

    export default {
        name: 'OCategoryListMain',
        props: {
            localization: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            ...mapState('categoryList', ['items', 'paging', 'loading']),
            labels() {
                return this.localization?.Labels || {};
            },
            categoryItemId() {
                return this.localization?.Data?.CategoryItemId || '';
            },
            showPagingBtn() {
                const {pageNumber, pageSize, totalResult} = this.paging;
                return (pageNumber * pageSize) < totalResult;
            }
        },
        mounted () {
            // waiting for localization prepared
            this.$nextTick(() => {
                this.UPDATE_SEARCH_PARAMS({
                    categoryItemId: this.categoryItemId
                });
            });
        },
        methods: {
            ...mapMutations('categoryList', ['UPDATE_SEARCH_PARAMS']),
            ...mapActions('categoryList', ['getData']),
            getNextPageData() {
                this.getData({
                    pageNumber: this.paging.pageNumber + 1,
                    // if without CategoryListingLoadingSize, then use previrous `response pageSize` value
                    pageSize: this.localization?.Data?.CategoryListingLoadingSize || this.paging.pageSize
                });
            }
        }
    };
</script>

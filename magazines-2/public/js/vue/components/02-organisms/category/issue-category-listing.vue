<template>
    <section class="o-issueCategoryListing">
        <m-category-header :payload="categoryHeaderPayload"></m-category-header>
        <o-category-list-main :localization="localization"></o-category-list-main>
    </section>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'OIssueCategoryListing',
        mixins: [ localizationMixin],
        computed: {
            ...mapState('categoryList', ['paging']),
            categoryHeaderPayload() {
                return {
                    image: this.getLocalizationProp('Data.Image'),
                    title: this.getLocalizationProp('Data.Title')
                };
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.getData({
                    pageSize: this.getLocalizationProp('Data.CategoryListingSize') || this.paging.pageSize
                });
            });
        },
        methods: {
            ...mapActions('categoryList', ['getData'])
        }
    };
</script>

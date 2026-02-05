<template>
    <div class="o-searchResult">
        <div class="mb-40 flex justify-between">
            <m-search-field :labels="labels"></m-search-field>
            <m-sort-button
                :sort-by-recent="getLocalizationProp('Labels.SortByRecent')"
                :sort-by-release-date-asc="getLocalizationProp('Data.SortByReleaseDateAsc')"
                :sort-by-release-date-desc="getLocalizationProp('Data.SortByReleaseDateDesc')"
            ></m-sort-button>
        </div>
        <div class="o-searchResult__info">
            <search-info :labels="labels"></search-info>
        </div>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import SearchInfo from './search-info.vue';
    export default {
        name: 'OSearchResult',
        components: {
            SearchInfo
        },
        mixins: [ localizationMixin],
        computed: {
            labels() {
                return this.getLocalizationProp('Labels', {});
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.getData({
                    pageNumber: 1
                });
            });
        },
        methods: {
            ...mapActions('searchList', ['getData'])
        }
    };
</script>

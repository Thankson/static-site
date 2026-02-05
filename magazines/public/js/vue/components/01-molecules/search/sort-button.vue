<template>
    <div class="m-sortButton">
        <v-button :cta="sortByRecent" class="-sort" :aria-sort="isDesc ? 'descending' : 'ascending'" @click.native="handleChangeSortType">
            <div class="m-sortButton__icons">
                <span class="m-sortButton__icon -asc material-icons" :class="{'-active': !isDesc}" :aria-current="!isDesc" aria-hidden="true">arrow_drop_up</span>
                <span class="m-sortButton__icon -desc material-icons" :class="{'-active': isDesc}" :aria-current="isDesc" aria-hidden="true">arrow_drop_down</span>
            </div>
        </v-button>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    export default {
        name: 'MSortButton',
        props: {
            sortByRecent: {
                type: String,
                default: ''
            },
            sortByReleaseDateAsc: {
                type: String,
                default: ''
            },
            sortByReleaseDateDesc: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                sortType: ''
            };
        },
        computed: {
            ...mapState('searchList', ['items', 'paging', 'loading']),
            isDesc() {
                return this.sortType === this.sortByReleaseDateDesc;
            }
        },
        mounted () {
            this.$nextTick(() => {
                // default is sort by desc.
                if(!this.sortType) {
                    this.sortType = this.sortByReleaseDateDesc;
                }
                this.UPDATE_SEARCH_PARAMS({
                    sortBy: this.sortType
                });
            });
        },
        methods: {
            ...mapMutations('searchList', ['UPDATE_SEARCH_PARAMS']),
            ...mapActions('searchList', ['getData']),
            handleChangeSortType() {
                // when is loading, you can not change parameters
                if(this.loading) return;

                this.sortType = this.isDesc ? this.sortByReleaseDateAsc : this.sortByReleaseDateDesc;
                this.handleSort();
            },
            handleSort() {
                this.UPDATE_SEARCH_PARAMS({
                    sortBy: this.sortType
                });
                this.getData({
                    pageNumber: 1
                });
            }
        }
    };
</script>

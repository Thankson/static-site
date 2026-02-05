<template>
    <div class="m-shoplistsSort">
        <div class="m-shoplistsSort__wrapper a-select -white -rounded -padding-sm w-full relative">
            <div v-if="!sort || !sort.length" class="m-shoplistsSort__loading">
                <a-loading-spinner
                    :visible="true"
                    size="sm"
                    class="m-shoplistsSort__loadingIcon"
                    aria-hidden="true">
                </a-loading-spinner>
            </div>
            <label ref="filterSortBy" class="m-shoplistsSort__sortBy" for="sort-by">
                {{ getLabels(localization, 'Labels.SortBy', 'Sort by') }}
            </label>
            <select
                id="sort-by"
                v-model="selected"
                class="a-select__field h-40 pl-10 pr-24"
                :style="'padding-left:' + paddingSelectSortBy + 'px'"
                :aria-label="getLabels(localization, 'Labels.SortBy', 'Sort by')"
                @change="gtmTrackAction({id: 14, text: $event.target.options[$event.target.options.selectedIndex].text}, $event)">
                <option
                    v-for="(op, index) in sort"
                    :key="index"
                    :value="op.Value">
                    {{ op.Title }}
                </option>
            </select>
            <arrow
                direction="-down"
                size="-sm"
                tailwind-color="black"
                other-mods="-sm -down -filled w-0 h-0 absolute right-15 top-10 pointer-events-none md:top-12">
            </arrow>
        </div>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';

    export default {
        name: 'MShoplistsSort',
        mixins: [ labels ],
        props: {
            initialSort: {
                type: [Number, String],
                default: null
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            sort: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                selected: null,
                paddingSelectSortBy: 70
            };
        },
        computed: {
            initialSelected() {
                return this.initialSort ? this.initialSort : (this.sort[0] ? this.sort[0].Value : null);
            }
        },
        watch: {
            selected(value) {
                // Emit changes to parent
                this.$emit('change', value);
            },
            initialSelected() {
                this.selected = this.initialSelected;
            },
            sort: {
                handler() {
                    // Set internal padding
                    this.labelSelectWidth();
                },
                deep: true
            }
        },
        mounted() {
            if(this.initialSelected) {
                this.selected = this.initialSelected;
            }

            // Set internal padding
            this.labelSelectWidth();
        },
        methods: {
            labelSelectWidth() {
                this.$nextTick(() => {
                    if(this.$refs.filterSortBy.clientWidth) {
                        const paddingSelect = 5;
                        this.paddingSelectSortBy = parseInt(this.$refs.filterSortBy.clientWidth + paddingSelect);
                    }
                });
            }
        }
    };
</script>

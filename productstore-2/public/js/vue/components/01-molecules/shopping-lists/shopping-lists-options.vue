<template>
    <focus-trap v-model="isTrapped">
        <div v-clickoutside="handleOutside" class="m-shoplistsOpts" :class="{'-open' : isOpen}" @keyup.esc="handleOutside">
            <!-- Selected List -->
            <div class="m-shoplistsOpts__selected" :class="{'-open' : isOpen}" @click="handleDropdown">
                <!-- Show spinner while API is being loaded -->
                <div v-if="showLoading && !loaded" class="m-shoplistsOpts__loading">
                    <a-loading-spinner
                        :visible="true"
                        size="sm"
                        class="m-shoplistsOpts__loadingIcon"
                        aria-hidden="true">
                    </a-loading-spinner>
                </div>

                <!-- Selected List -->
                <button
                    id="selected-list"
                    ref="selected-list"
                    class="m-shoplistsOpts__button -selected"
                    :class="{'-isCn' : isCn}"
                    aria-haspopup="listbox"
                    aria-labelledby="selected-list"
                    :aria-expanded="isOpen">
                    <span v-if="selected && selected.ListName" class="m-shoplistsOpts__title">
                        {{ selected.ListName }}
                        <span class="m-shoplistsOpts__count -selected">
                            {{ selected.ItemCount }} {{ getLabels(localization, 'Labels.Items', 'items') }}
                        </span>
                    </span>
                    <span v-else class="m-shoplistsOpts__title" v-html="getLabels(localization, 'Labels.NoList', 'No list selected')"></span>
                    <arrow
                        :direction="isOpen ? '-up' : '-down'"
                        size="-sm"
                        other-mods="-filled shadow-none pointer-events-none pl-5">
                    </arrow>
                </button>
            </div>

            <!-- Dropdown -->
            <div class="m-shoplistsOpts__dropdown" :class="{'-open' : isOpen}">
                <!-- All Lists -->
                <div
                    v-for="(listItem, x) in parsedLists"
                    :id="'combo-listbox-' + x"
                    :key="x"
                    class="m-shoplistsOpts__list"
                    role="listbox">
                    <perfect-scrollbar>
                        <div
                            v-for="(list, index) in listItem"
                            :key="index"
                            class="m-shoplistsOpts__item"
                            :class="{'-selected': selected && selected.ListId === list.ListId}">
                            <button
                                class="m-shoplistsOpts__button"
                                :class="{'-isCn' : isCn}"
                                :aria-selected="selected && selected.ListId === list.ListId"
                                role="option"
                                @click="selectList(list); gtmTrackAction({id: 215, text: list.ListName}, $event)">
                                {{ list.ListName }}
                                <span class="m-shoplistsOpts__count">
                                    {{ list.ItemCount }} {{ getLabels(localization, 'Labels.Items', 'items') }}
                                </span>
                            </button>
                        </div>
                    </perfect-scrollbar>
                </div>

                <!-- Create new list form -->
                <m-shoplists-create
                    ref="create-form"
                    :lists="lists"
                    :localization="localization">
                </m-shoplists-create>
            </div>
        </div>
    </focus-trap>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'MShoplistsOpts',
        directives: {
            clickoutside: {
                bind: function(el, binding, vnode) {
                    el.clickOutsideEvent = (event) => {
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
        mixins: [ labels ],
        props: {
            initialSelected: {
                type: [Number, String],
                default: null
            }
        },
        data() {
            return {
                localization: {},
                lists: [],
                parsedLists: [],
                customerLists: [],
                systemLists: [],
                selected: {},
                isOpen: false,
                isTrapped: false,
                loaded: false,
                showLoading: false,
                hasServicesFailure: false,
                selectedIndex: null
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedLists', 'storedLocalizationLists', 'storedApiLoading', 'storedHasApiError']),
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            isOpen() {
                this.isTrapped = this.isOpen;
            },
            lists(newValue, oldValue) {
                if(this.selectedIndex >= 0 && oldValue && newValue &&
                    oldValue[this.selectedIndex]?.ItemCount !== newValue[this.selectedIndex]?.ItemCount) {
                    this.selected.ItemCount = newValue[this.selectedIndex]?.ItemCount;
                }
            },
            selected(obj) {
                // Emit changes to parent
                this.$emit('change', obj);
            },
            storedApiLoading() {
                this.showLoading = this.storedApiLoading;
            },
            storedLists: {
                handler() {
                    // Receive lists from store
                    this.lists = this.storedLists;

                    // Organize customer and system lists
                    this.parseList();

                    // Check if there's API error
                    this.hasServicesFailure = !this.lists.length && this.storedHasApiError;

                    // Page is loaded
                    this.loaded = true;
                },
                deep: true
            },
            storedLocalizationLists: {
                handler() {
                    this.localization = this.storedLocalizationLists;
                },
                deep: true
            },
            hasServicesFailure() {
                this.$emit('has-services-failure', this.hasServicesFailure);
            }
        },
        mounted() {
            // Page is not loaded
            this.loaded = false;

            // Set emit
            this.setEventBus();

            // Get data from API
            this.getAllLists();
        },
        methods: {
            ...mapActions('shoppingLists', ['getAllLists']),

            handleDropdown() {
                // Open or close dropdown
                this.isOpen = !this.isOpen;

                // Reset Create Form
                this.$refs['create-form'].resetForm();
            },
            handleOutside() {
                if(this.isOpen) {
                    this.handleDropdown();
                }
            },
            async initSelect() {
                if(!this.selected || !this.selected?.ListName) {
                    // If there's no initial selected in the prop, then select the first customer list or first system list
                    if(this.initialSelected === null) {
                        this.selected = this.customerLists[0] || this.systemLists[0];
                        this.selectedIndex = 0;
                    } else {
                        // Get initial select from prop
                        this.selected = await this.lists.find((list, index) => {
                            if(list.ListId === this.initialSelected) {
                                this.selectedIndex = index;
                                return list;
                            }
                        });
                    }
                }
            },
            async parseList() {
                this.customerLists = [];
                this.systemLists = [];
                this.parsedLists = [];

                if(this.lists && this.lists.length) {
                    // Organize lists
                    await this.lists.map(list => {
                        if(list.ListType === 'CustomerList') {
                            this.customerLists.push(list);
                        } else if(list.SystemGenerated) {
                            this.systemLists.push(list);
                        }
                    });

                    // Sort lists
                    this.customerLists.sort((a, b) => (a.Order > b.Order) ? 1 : -1);
                    this.systemLists.sort((a, b) => (a.Order > b.Order) ? 1 : -1);

                    // Join lists
                    this.$set(this.parsedLists, 0, this.customerLists);
                    this.$set(this.parsedLists, 1, this.systemLists);
                }

                // Set initial selected list
                this.initSelect();
            },
            selectList(list) {
                // Set selected list
                this.selected = list;

                // Close select
                this.handleDropdown();

                // Set focus
                this.$refs['selected-list'].focus();
            },
            setEventBus() {
                eventBus.$on('clear-selected-list', (clear) => {
                    if(clear) {
                        this.selected = {};
                    }
                });
            }
        }
    };
</script>

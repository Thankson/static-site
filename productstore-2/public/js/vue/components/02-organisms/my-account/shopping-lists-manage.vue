<template>
    <div class="o-shoplistsManage">
        <!-- Show spinner while API is being loaded -->
        <div v-if="showLoading && !loaded && !removing" class="o-shoplistsManage__loading">
            <a-loading-spinner
                :visible="true"
                class="o-shoplistsManage__loadingIcon"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <!-- Header -->
        <div class="o-shoplistsManage__header">
            <h2 class="o-shoplistsManage__title">{{ getLabels(localization, 'Labels.ManageCustomLists', 'Manage My Custom Lists') }}</h2>
            <a class="o-shoplistsManage__back" href="#" @click="handleBack">
                <span aria-hidden="true" class="material-icons">arrow_back</span>
                {{ getLabels(localization, 'Labels.Back', 'Back') }}
            </a>
        </div>

        <!-- Grid -->
        <div v-if="lists && lists.length" class="o-shoplistsManage__grid">
            <!-- Items -->
            <div v-for="(list, index) in lists" :key="list.ListId" class="o-shoplistsManage__items">
                <!-- Show spinner while list is being deleted -->
                <div
                    v-if="showLoading && loaded && removing && activeList.ListId === list.ListId"
                    class="o-shoplistsManage__loading -remove">
                    <a-loading-spinner
                        :visible="true"
                        class="o-shoplistsManage__loadingIcon"
                        aria-hidden="true">
                    </a-loading-spinner>
                </div>

                <!-- View Column -->
                <div class="o-shoplistsManage__col -view" :class="{'-longViewLabel' : isViewLabelLong}">
                    <a
                        class="o-shoplistsManage__link"
                        :href="viewListLink + list.ListId">
                        {{ getLabels(localization, 'Labels.View', 'View') }}
                    </a>
                </div>

                <!-- Edit Form Column - is editing -->
                <div v-if="isEditing && activeList.ListId === list.ListId" class="o-shoplistsManage__col -form">
                    <m-shoplists-edit
                        :list="activeList"
                        :lists="lists"
                        :localization="localization"
                        @cancel="handleCancel"
                        @save="handleSave">
                    </m-shoplists-edit>
                </div>

                <!-- Data Column - is NOT editing -->
                <div v-else class="o-shoplistsManage__col -data" :class="isViewLabelLong ? '-longViewLabel' : ''">
                    <!-- Name Column -->
                    <div class="o-shoplistsManage__col -name" :class="isRenameAndDeleteLabelLong ? '-longRenameDeleteLabel' : ''">
                        <span class="o-shoplistsManage__name">
                            {{ list.ListName }}
                            <span class="o-shoplistsManage__count">
                                {{ list.ItemCount }} {{ getLabels(localization, 'Labels.Items', 'Items') }}
                            </span>
                        </span>
                    </div>

                    <!-- Actions Column - Single List -->
                    <div v-if="lists.length === 1" class="o-shoplistsManage__col -actions">
                        <!-- Rename button -->
                        <button
                            class="o-shoplistsManage__link"
                            type="button"
                            @click="handleEdit(list)">
                            {{ getLabels(localization, 'Labels.Rename', 'Rename') }}
                        </button>
                    </div>

                    <!-- Actions Column - Multiple Lists -->
                    <div v-else class="o-shoplistsManage__col -actions" :class="isRenameAndDeleteLabelLong ? '-longRenameDeleteLabel' : ''">
                        <!-- Rename button -->
                        <button
                            class="o-shoplistsManage__link"
                            type="button"
                            @click="[handleEdit(list), gtmTrackAction({id: 400}, $event)]">
                            {{ getLabels(localization, 'Labels.Rename', 'Rename') }}
                        </button>

                        <!-- Separator -->
                        <span class="o-shoplistsManage__link -separator">|</span>

                        <!-- Delete button -->
                        <button
                            class="o-shoplistsManage__link"
                            type="button"
                            :class="{'-disabled': removing}"
                            :disabled="removing"
                            @click="openDeleteModal(list)">
                            {{ getLabels(localization, 'Labels.Delete', 'Delete') }}
                        </button>

                        <!-- Ordering -->
                        <div class="o-shoplistsManage__ordering">
                            <!-- Order Up -->
                            <button
                                v-if="index > 0"
                                class="o-shoplistsManage__order"
                                :class="{'-decrease': index === (lists.length - 1)}"
                                type="button"
                                :arial-label="getLabels(localization, 'Labels.DecreaseOrder', 'Decrease Order')"
                                @click="handleOrder(list, index, 'decrease')">
                                <arrow
                                    direction="-up"
                                    size="-md"
                                    other-mods="-filled shadow-none pointer-events-none p-0"
                                    tailwind-color="green">
                                </arrow>
                            </button>

                            <!-- Order Down -->
                            <button
                                v-if="index < (lists.length - 1)"
                                class="o-shoplistsManage__order"
                                :class="{'-increase': index === 0}"
                                type="button"
                                :arial-label="getLabels(localization, 'Labels.IncreaseOrder', 'Increase Order')"
                                @click="handleOrder(list, index, 'increase')">
                                <arrow
                                    direction="-down"
                                    size="-md"
                                    other-mods="-filled shadow-none pointer-events-none p-0"
                                    tailwind-color="green">
                                </arrow>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Modal -->
        <modal id="shopping-list-delete" width="430px">
            <template v-slot:heading>
                <div :class="{'mx-30 md:mx-0':isCn}">
                    {{ getLabels(localization, 'Labels.ModalDeleteTitle', 'ModalDeleteTitle') }}
                </div>
            </template>

            <template v-slot:body>
                <p class="text-sm text-gray-120" :class="{'mx-30 md:mx-0':isCn}" style="line-height: 22px;">{{ getLabels(localization, 'Labels.ModalDeleteText', 'ModalDeleteText') }}</p>
            </template>

            <template v-slot:footer>
                <button
                    class="a-button -outline"
                    :class="{'px-25 w-auto py-12 mb-30 ml-30 mr-16 md:mb-0 md:ml-0':isCn , '-modal':!isCn}"
                    @click="$modal.hide()"
                >
                    {{ getLabels(localization, 'Labels.Cancel', 'Cancel') }}
                </button>
                <button
                    class="a-button"
                    :class="{'px-25 w-auto py-12 mb-30 mr-30 md:mb-0 md:mr-0':isCn , '-modal':!isCn}"
                    @click="[handleRemove(selectedItem), gtmTrackAction({id: 402}, $event)]"
                >
                    {{ getLabels(localization, 'Labels.Delete', 'Delete') }}
                </button>
            </template>
        </modal>

        <!-- Create new list form -->
        <div class="o-shoplistsManage__create">
            <m-shoplists-create
                class="-lg"
                form-mods="p-0 m-0"
                :localization="otherLabels"
                :lists="lists">
            </m-shoplists-create>
        </div>

        <!-- API validation error -->
        <div v-if="apiError && apiError.length" class="o-shoplistsManage__error e-formError">
            <p v-for="(error, index) in apiError" :key="index" class="e-formError__item">
                {{ error }}
            </p>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';

    export default {
        name: 'OShoplistsManage',
        mixins: [ labels ],
        props: {
            localization: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                isEditing: false,
                activeList: {},
                lists: [],
                loaded: false,
                showLoading: false,
                removing: false,
                reordering: false,
                selectedItem: {},
                apiError: []
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedLists', 'storedLocalizationLists', 'storedApiLoading', 'storedApiError']),

            viewListLink() {
                return this.localization?.Data?.ListsPage?.Url + '?listId=';
            },
            otherLabels() {
                return this.storedLocalizationLists;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            // If the Rename and Delete label combined are over 16 characters, add a class to the actions column to adjust styling
            isRenameAndDeleteLabelLong() {
                let renameAndDeleteLabel = this.localization?.Labels.Rename + this.localization?.Labels.Delete;
                return renameAndDeleteLabel?.length > 13;
            },
            isViewLabelLong() {
                return this.localization?.Labels.View?.length > 5;
            }
        },
        watch: {
            storedApiLoading() {
                this.showLoading = this.storedApiLoading;
            },
            storedApiError() {
                this.apiError = this.storedApiError;
            },
            storedLists: {
                handler() {
                    this.populateLists();
                },
                deep: true
            }
        },
        mounted() {
            // Page is not loaded
            this.loaded = false;
            this.removing = false;
            this.reordering = false;

            if(!this.storedLists || !this.storedLists.length) {
                // Get data from API
                this.getAllLists();
            } else {
                // Get data from Store
                this.populateLists();
            }
        },
        methods: {
            ...mapActions('shoppingLists', ['getAllLists', 'removeList', 'editList']),

            populateLists() {
                // Receive lists from store and filter for CustomerList
                this.lists = this.storedLists.filter(list => list.ListType === 'CustomerList');

                // Sort lists by order
                this.lists.sort((a, b) => (a.Order > b.Order) ? 1 : -1);

                // Page is loaded
                this.loaded = true;
            },
            handleEdit(list) {
                this.isEditing = true;
                this.activeList = list;
            },
            async handleOrder(list, index, order) {
                if(!this.reordering) {
                    this.loaded = false;
                    this.reordering = true;

                    let newOrder = parseInt(list.Order);
                    let currentOrder = newOrder;
                    let indexAside = null;

                    if(order === 'increase') {
                        // Increase order
                        newOrder++;

                        // Check next list
                        indexAside = index + 1;
                    } else {
                        // Decrease order
                        newOrder--;

                        // Check previous list
                        indexAside = index - 1;
                    }

                    if(newOrder < 0) newOrder = 0;

                    // Save data
                    await this.editList({
                        payload: {
                            ListId: list.ListId,
                            ListName: list.ListName,
                            Order: newOrder
                        }
                    });

                    // Change previous/next list
                    if(this.lists[indexAside] && this.lists[indexAside].ListId !== list.ListId) {
                        this.$store.commit('shoppingLists/SET_EDIT_LIST', {
                            ListId: this.lists[indexAside].ListId,
                            ListName: this.lists[indexAside].ListName,
                            Order: currentOrder
                        });
                    }

                    this.loaded = true;
                    this.reordering = false;
                }
            },
            async handleRemove(list) {
                // Allow deletion only if there are more than one list
                if(this.lists.length > 1 && !this.removing) {
                    this.$modal.hide({ id: 'shopping-list-delete' });
                    this.activeList = list;
                    this.removing = true;

                    // Emit to parent
                    this.$emit('removed-list', list);

                    // Remove list
                    await this.removeList({
                        listId: this.activeList.ListId
                    });

                    this.removing = false;
                }
            },
            handleCancel() {
                this.isEditing = false;
                this.activeList = {};
            },
            handleSave() {
                this.isEditing = false;
                this.activeList = {};
            },
            handleBack(event) {
                event.preventDefault();

                this.$emit('manage-lists', false);
            },
            openDeleteModal(list) {
                this.selectedItem = list;
                this.$modal.show({ id: 'shopping-list-delete' });
            }
        }
    };
</script>

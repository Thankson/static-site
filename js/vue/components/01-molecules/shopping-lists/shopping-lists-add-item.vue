<template>
    <div
        ref="add-item-to-list"
        class="m-shoplistsAddItem"
        :class="isCarousel ? '-carousel ' : ''">

        <button
            class="m-shoplistsAddItem__button"
            :aria-label="ariaLabelCta || popupTitle"
            :aria-pressed="visible ? 'true' : 'false'"
            type="button"
            v-on:click.stop.prevent="openPopup()"
            @click="gtmTrackAction({ id: gtmIdCheck, text: product.Title }, $event)">

            <slot name="icon" />
        </button>

        <popup
            ref="popup-add-to-list"
            :disable-trap="disablePopupTrap"
            :mods="popupMods"
            :arrow-mods="popupArrowMods"
            :arrow-direction="isSmall ? '-down' : '-up'"
            :header-title="popupTitle + ':'"
            header-title-mods="uppercase text-base pr-40"
            header-mods="border-none"
            :header-visible="true"
            :footer-visible="false"
            :initial-focus-el="initialFocusEl"
            v-on:visibility="checkVisibility">

            <!-- Show spinner while API (get all lists) is being loaded -->
            <div
                v-if="showLoading && !loaded"
                class="m-shoplistsAddItem__loading">

                <a-loading-spinner
                    :visible="true"
                    aria-hidden="true"
                    size="sm" />
            </div>

            <!-- Customer Lists and Create Form -->
            <div
                v-else
                class="m-shoplistsAddItem__wrapper">

                <!-- Show spinner while API (add/move to list and verify if item is already in list) is being loaded -->
                <div
                    v-if="((showLoading && submitted) || storedLoadingCheckInList)"
                    class="m-shoplistsAddItem__loading -adding">

                    <a-loading-spinner
                        :visible="true"
                        aria-hidden="true"
                        size="sm" />
                </div>

                <!-- Customer Lists -->
                <div class="m-shoplistsAddItem__list">
                    <perfect-scrollbar>
                        <div
                            v-for="(list, index) in customerLists"
                            :key="`${list.ListName}-${list.ListId}-${index}`"
                            class="m-shoplistsAddItem__item">

                            <!-- Opens shelf if it's not on list page and is not MOVE to list -->
                            <o-shelf-configurator-add-list
                                v-if="isShelf && !isMoving"
                                ref="shelf-configurator"
                                :class="['text-black', 'text-left']"
                                :script-id="scriptIdConfigurator"
                                :original-list-id="originalListId"
                                :list-id="list.ListId"
                                :list-name="list.ListName"
                                :list-labels="localization"
                                :family-id="productFamilyId"
                                :sku="product.Sku"
                                :title="popupTitle"
                                :pre-selected-configurations="preSelectedConfigurations"
                                @show="() => onShelfShow(index)"
                                @hide="onShelfHide">

                                {{ list.ListName }}
                            </o-shelf-configurator-add-list>

                            <!-- DO NOT open shelf if it's on list page -->
                            <button
                                v-else
                                @click="submitItemToList(list)">

                                {{ list.ListName }}
                            </button>
                        </div>
                    </perfect-scrollbar>
                </div>

                <!-- Create new list form -->
                <m-shoplists-create
                    ref="form-create-list"
                    :lists="allLists"
                    :localization="localization"
                    :class="{'-xs': isSmall, '-category-list': isCategoryList}"
                    :error-mods="isCarousel ? 'text-xs pb-0' : null" />

                <div
                    v-if="storedHasApiError && listErrors && !checkCreateListError"
                    class="m-shoplistsAddItem__error">
                    <p class="e-formError__item mt-0" role="alert">
                        <span
                            class="block"
                            role="text"
                            v-html="listErrors" />
                    </p>
                </div>
            </div>
        </popup>

        <!-- Modal - Item Already In List - NOT SHELF -->
        <m-shoplists-already-in-list-modal
            v-if="!isShelf && activeList && alreadyInList"
            :ref="modalId"
            :list="activeList"
            :localization="localization"
            :modal-id="modalId" />

        <!-- Shelf Confirmation - Used only inside a List Page and only for Add To List -->
        <shelf v-if="!isMoving && !isShelf && !alreadyInList">
            <template v-slot:default>
                <m-shelf-confirm-list
                    v-if="activeList"
                    :list-id="activeList.listId"
                    :list-name="activeList.listName"
                    :localization="localization"
                    :script-id-configurator="scriptIdConfigurator"
                    :pre-selected-configurations="preSelectedConfigurations"
                    :product="product"
                    :options="configurations"
                    :price="price"
                    :points="points"
                    :show-preferred-pricing="isPreferred"
                />
            </template>
        </shelf>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import shoplistsModalMixin from '../../../mixins/shopping-lists-modal';

    export default {
        name: 'MShoplistsAddItem',
        mixins: [ togglePopUpMixin, labels, shoplistsModalMixin ],
        props: {
            addListMods: {
                type: String,
                default: null
            },
            ariaLabelCta: {
                type: String,
                default: null
            },
            carouselSize: {
                type: String,
                default: '-lg'
            },
            isCarousel: {
                type: Boolean,
                default: false
            },
            isCategoryList: {
                type: Boolean,
                default: false
            },
            isOrderHistory: {
                type: Boolean,
                default: false
            },
            isShoppingLists: {
                type: Boolean,
                default: false
            },
            isMoving: {
                type: Boolean,
                default: false
            },
            isPdp: {
                type: Boolean,
                default: false
            },
            isShelf: {
                type: Boolean,
                default: true
            },
            isPreferred: {
                type: Boolean,
                default: null
            },
            isShownOffSaleDisplay: {
                type: Boolean,
                default: false
            },
            leftPopup: {
                type: Boolean,
                default: null
            },
            originalListId: {
                type: [Number, String],
                default: null
            },
            preSelectedConfigurations: {
                type: Array,
                default: () => []
            },
            product: {
                type: Object,
                default() {
                    return {};
                }
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            refreshList: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                initialFocusEl: null,
                disablePopupTrap: false,
                loaded: false,
                submitted: false,
                visible: true,
                alreadyInList: false,
                modalId: 'modal-item-already-in-list',
                activeList: null,
                viewportWidth: 0
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedLists', 'storedLocalizationLists', 'storedApiLoading', 'storedLoadingCheckInList', 'storedHasApiError', 'storedApiError']),

            customerLists() {
                // Get customer lists
                return this.storedLists.filter(list => (list.ListType === 'CustomerList' || list.ListType === 'SaveForLater') && list.ListId !== this.originalListId);
            },
            allLists() {
                return this.storedLists;
            },
            gtmIdCheck() {
                return !this.isMoving ? 172 : 12;
            },
            isSmall() {
                return this.isCarousel || (this.isCategoryList && this.isMobile);
            },
            localization() {
                // Get labels
                return this.storedLocalizationLists;
            },
            showLoading() {
                // Get API status
                return this.storedApiLoading;
            },
            popupTitle() {
                let title = this.getLabels(this.localization, 'Labels.AddToList', 'Add to List');

                if(this.isMoving) {
                    title = this.getLabels(this.localization, 'Labels.MoveToList', 'Move to List');
                }

                return title;
            },
            popupArrowMods() {
                let mods = '-filled -shadow absolute ';

                // Carousel
                if(this.isCarousel) {
                    if(!this.isCn) {
                        mods = mods + 'right-60 -bottom-12';
                    } else {
                        mods = mods + 'left-30 -bottom-18';
                    }
                } else {
                    // Category Listing Mobile
                    if(this.isCategoryList && this.isMobile) {
                        mods = mods + ' -bottom-13 ';

                        if(this.addListMods === '-category-list-right' || !this.isXSMobile) {
                            if(this.isCn) {
                                if(this.isShownOffSaleDisplay) {
                                    mods += 'left-30';
                                } else {
                                    mods += 'left-60';
                                }
                            } else {
                                mods += 'right-18';
                            }
                        } else {
                            if(this.isCn) {
                                if(this.isShownOffSaleDisplay) {
                                    mods += 'left-5';
                                } else {
                                    mods += 'left-50';
                                }
                            } else {
                                mods += 'right-40';
                            }
                        }

                    // Order History, PDP, Shoppping Lists Desktop, Category Listing Desktop
                    } else if(!this.leftPopup && (!this.isShoppingLists || (this.isShoppingLists && !this.isMobile))) {
                        mods = mods + '-top-13 right-18';

                    // leftPopup
                    } else if(this.leftPopup) {
                        mods = mods + '-top-13 right-1_2';

                    // Shoppping Lists Mobile
                    } else {
                        mods = mods + '-top-13 right-40';
                    }
                }

                return mods;
            },
            popupMods() {
                let mods = '-shoplists-add-item';

                // Carousel
                mods = mods + (this.isCarousel ? ' -carousel ' : '');

                // Category list
                mods = mods + (this.isCategoryList ? ' -category-list' : '');

                // Order History
                mods = mods + (this.isOrderHistory ? ' -orderHistory' : '');

                // Pdp
                mods = mods + (this.isPdp ? ' -pdp' : '');

                // Extra mods
                mods = mods + (this.addListMods ? ' ' + this.addListMods : '');

                // left Popup
                mods = mods + (this.leftPopup ? ' -leftPopup' : '');

                return mods;
            },
            configurations() {
                return this.product.Configurations || this.product.ConfigurationSkus;
            },
            points() {
                let points = this.product?.PriceRange?.MinPoints || '0';

                return points.toString();
            },
            price() {
                let price = this.product?.PriceRange?.MinRegularPrice;

                if(this.isPreferred) {
                    price = this.product?.PriceRange?.MinPreferredPrice;
                }

                return price;
            },
            productFamilyId() {
                return this.product?.FamilyId || this.product?.FamilyID || this.product?.FamilyInfo?.Id;
            },
            isMobile() {
                return this.viewportWidth < 768;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isXSMobile() {
                return this.viewportWidth < 415;
            },
            scrollMaxHeight() {
                return this.isCarousel ? 90 : 150;
            },
            listErrors() {
                const errors = [
                    ...this.storedApiError
                ];

                return errors.length > 0 ? errors.join('<br />') : '';
            },
            checkCreateListError() {
                const createFormError = this.$refs['form-create-list']?.apiError?.length;
                return createFormError;
            }
        },
        created() {
            // Viewport
            this.setViewport();

            // Create resize listener
            window.addEventListener('resize', this.resize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },
        mounted() {
            // Page is not loaded
            this.loaded = false;
            this.submitted = false;
        },
        methods: {
            ...mapActions('shoppingLists', ['getAllLists', 'addToList', 'moveToList']),

            checkVisibility(val) {
                this.visible = val;

                // Clear API error when the popup is closed
                if(!val) {
                    this.$store.commit('shoppingLists/SET_API_ERROR', []);
                    this.$emit('add-list-popup', {
                        isOpen: false,
                        isLoaded: this.loaded
                    });
                } else {
                    this.$emit('add-list-popup', {
                        isOpen: true,
                        isLoaded: this.loaded
                    });
                }
            },
            async openPopup() {
                // Open popup
                this.togglePopUp('popup-add-to-list');

                // Hide Shelf Confirmation
                this.$store.commit('shoppingLists/SET_SHOW_CONFIRMATION', false);

                // Page is not loaded
                this.loaded = false;
                this.submitted = false;

                // Reset creation form when popup is opened
                if(this.$refs['form-create-list']) {
                    this.$refs['form-create-list'].resetForm();
                }

                // If should refresh list, then get data from API
                if(this.refreshList) {
                    if(!this.storedLists || !this.storedLists.length) {
                        // Get data from API
                        await this.getAllLists();

                        this.loaded = true;

                        this.$emit('add-list-popup', {
                            isOpen: true,
                            isLoaded: this.loaded
                        });
                    } else {
                        // Page is loaded
                        this.loaded = true;
                    }

                // If should NOT refresh list, then get data from Vuex Store
                } else {
                    // Page is loaded
                    this.loaded = true;
                }

                // Update perfect scroll component
                this.$nextTick(() => {
                    if(this.customerLists && this.customerLists.length) {
                        this.updateScroll();
                    }
                });
            },
            async submitItemToList(list) {
                const skuConfig = this.configurations && this.configurations.length ? this.configurations : [];
                this.submitted = true;
                this.activeList = {
                    listId: list.ListId,
                    listName: list.ListName
                };

                // Close modal
                this.closeModal(this.modalId);

                // Hide Shelf Confirmation
                this.$store.commit('shoppingLists/SET_SHOW_CONFIRMATION', false);

                // Verify if the item is already in the list
                this.alreadyInList = await this.verifyAlreadyInList(list.ListId, this.product.Sku);

                // If the item is NOT in the list, then add/move the item
                if(!this.alreadyInList) {
                    // MOVE to list
                    if(this.isMoving) {
                        await this.moveToList({
                            payload: {
                                Sku: this.product.Sku,
                                Configurations: skuConfig, // "Configurations": [ {FeatureSku: "123", "SelectedSku": "235} ]
                                OriginalListId: this.originalListId,
                                MoveToListId: list.ListId
                            }
                        });

                        // Increase items count in the new list
                        this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                            listId: list.ListId,
                            increase: true
                        });

                        // Decrease items count in the old list
                        this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                            listId: this.originalListId,
                            decrease: true
                        });
                    // ADD to list
                    } else {
                        await this.addToList({
                            listId: list.ListId,
                            payload: {
                                Sku: this.product.Sku,
                                Configurations: skuConfig // "Configurations": [ {FeatureSku: "123", "SelectedSku": "235} ]
                            }
                        });

                        // No API error
                        if(!this.storedHasApiError) {
                            // Increase items count in the list
                            this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                                listId: list.ListId,
                                increase: true
                            });

                            // Open Shelf Confirmation
                            this.$nextTick(() => {
                                this.$shelf.show();
                            });

                            // Close popup
                            this.togglePopUp('popup-add-to-list');
                        } else {
                            // API error
                            this.submitted = false;
                        }
                    }

                    this.submitted = false;
                } else {
                    this.$nextTick(() => {
                        // Open Modal
                        this.openModal(this.modalId);

                        this.submitted = false;
                    });
                }
            },
            updateScroll() {
                const scrollInterval = setInterval(() => {
                    if(this.$refs['add-item-to-list'] && typeof this.$refs['add-item-to-list'].querySelector === 'function') {
                        const scroll = this.$refs['add-item-to-list'].querySelector('.m-shoplistsAddItem__list .ps');
                        if(scroll) {
                            clearInterval(scrollInterval);

                            // To fix $refs bug
                            setTimeout(() => {
                                if(scroll.offsetHeight >= this.scrollMaxHeight) {
                                    scroll.classList.add('ps--active-y');
                                    scroll.scrollTo(0, 1);
                                }
                            }, 100);
                        }
                    }
                });
            },
            resize() {
                this.setViewport();
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            },
            onShelfShow(index) {
                const triggerEl = this.$refs?.['shelf-configurator']?.[index]?.$el || null;
                this.initialFocusEl = triggerEl;

                this.disablePopupTrap = true;
            },
            onShelfHide() {
                this.$nextTick(() => {
                    this.$refs['popup-add-to-list'].isVisible = false;
                });

                this.disablePopupTrap = false;
            }
        }
    };
</script>

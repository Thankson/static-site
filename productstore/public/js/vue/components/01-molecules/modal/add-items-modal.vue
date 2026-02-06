<template>
    <modal :id="modalId" :key="`modal-${modalKey}`" :width="modalWidth">
        <!-- Show modal with API errors -->
        <div v-if="isApiErrorModal && !isBuoApiErrorModal" class="m-addItemsModal">
            <!-- Display API validation error -->
            <div class="e-formError">
                <p v-for="(error, index) in storedApiError" :key="index" class="e-formError__item">
                    {{ error }}
                </p>
            </div>
        </div>

        <!-- Specific error message for BUO if the request is NOT success -->
        <div v-if="isBuoApiErrorModal" class="m-addItemsModal">
            <!-- Display BUO API error -->
            <h2 class="p-checkout__errorTitle" v-html="genericFailureMessage.title"></h2>
            <p class="p-checkout__errorText" v-html="genericFailureMessage.message"></p>
            <v-button class="p-checkout__errorButton" @click="reloadPage">
                {{ genericFailureMessage.refresh }}
            </v-button>
        </div>

        <!-- Show modal with success message -->
        <div v-if="isSuccessModal" class="m-addItemsModal" :class="{'-isCn -pastOrder': isCn && fromPastOrder}">
            <!-- Title -->
            <h2
                id="global-modal-heading"
                class="m-addItemsModal__title"
                :class="titleMods"
                v-html="modalLabels.title">
            </h2>

            <!-- Description -->
            <div v-if="modalLabels.description" class="text-sm text-gray-150 italic md:text-xl mb-30" :class="{'not-italic': isCn}">
                {{ modalLabels.description }}
            </div>

            <!-- Footer -->
            <div class="m-addItemsModal__footer">
                <!-- If it's LIST -->
                <div v-if="isList" class="flex flex-wrap w-full">
                    <!-- Manage Lists CTA (if it's NOT Survey page) -->
                    <a
                        v-if="!fromSurvey"
                        class="m-addItemsModal__button a-button -white mb-15 md:mb-0 mr-0 md:mr-15"
                        :href="modalLabels.goToLink() + '&manageLists=true'">
                        {{ modalLabels.manageLabel }}
                    </a>

                    <!-- Go To List CTA -->
                    <a
                        class="m-addItemsModal__button a-button"
                        :class="goToListMods"
                        :href="modalLabels.goToLink()">
                        {{ modalLabels.goToLabel }}
                    </a>

                    <!-- Close CTA (ONLY Survey page) -->
                    <button
                        v-if="fromSurvey"
                        class="m-addItemsModal__button a-button -green"
                        type="button"
                        @click="close(modalId)">
                        {{ modalLabels.closeLabel }}
                    </button>
                </div>

                <!-- If it's CART or BUO -->
                <a
                    v-else
                    class="m-addItemsModal__button a-button -green"
                    :href="modalLabels.goToLink()">
                    {{ modalLabels.goToLabel }}
                </a>
            </div>
        </div>

        <!-- Show modal with unavailable items -->
        <div v-if="isItemsErrorModal" class="m-addItemsModal">
            <!-- Title -->
            <h2
                id="global-modal-heading"
                class="m-addItemsModal__title -error"
                :class="titleMods"
                v-html="modalLabels.title">
            </h2>

            <!-- Header notes -->
            <div v-if="(isCart && !isUpsell) || isList" class="m-addItemsModal__headernotes" v-html="modalLabels.headerNotesLabel"></div>

            <!-- List of unavailable items with scroll -->
            <m-unavailable-items
                ref="unavailable-items"
                :key="`unavailable-items-${modalKey}`"
                :items="unavailableItems"
                :localization="localization"
                :max-height="310"
                :allow-edit-pack="isCart && !isUpsell"
                :allow-edit-quantity="isCart && !isUpsell">
            </m-unavailable-items>

            <!-- Footer -->
            <div class="m-addItemsModal__footer">
                <!-- Manage BUO CTA -->
                <a
                    v-if="isBuo"
                    class="m-addItemsModal__button a-button -green -error"
                    :class="{'-isCn': isCn}"
                    :href="modalLabels.goToLink()">
                    {{ modalLabels.manageLabel }}
                </a>

                <!-- Continue CTA - ONLY for Upsell on Cart -->
                <button
                    v-if="isCart && isUpsell"
                    class="m-addItemsModal__button a-button -green -error"
                    @click="close(modalId)">
                    {{ modalLabels.continueLabel }}
                </button>

                <!-- If it's LIST -->
                <div v-if="isList" class="flex flex-wrap w-full">
                    <!-- Manage Lists CTA (if it's NOT Survey page) -->
                    <a
                        v-if="!fromSurvey"
                        class="m-addItemsModal__button a-button -white mb-15 md:mb-0 mr-0 md:mr-15"
                        :href="modalLabels.goToLink() + '&manageLists=true'">
                        {{ modalLabels.manageLabel }}
                    </a>

                    <!-- Go To List CTA -->
                    <a
                        class="m-addItemsModal__button a-button"
                        :class="goToListMods"
                        :href="modalLabels.goToLink()">
                        {{ modalLabels.goToLabel }}
                    </a>

                    <!-- Close CTA (ONLY Survey page) -->
                    <button
                        v-if="fromSurvey"
                        class="m-addItemsModal__button a-button -green"
                        type="button"
                        @click="close(modalId)">
                        {{ modalLabels.closeLabel }}
                    </button>
                </div>

                <!-- Footnotes -->
                <div
                    v-if="modalLabels.footNotesLabel"
                    class="m-addItemsModal__footnotes"
                    :class="{'not-italic':isCn}"
                    v-html="modalLabels.footNotesLabel">
                </div>
            </div>
        </div>
    </modal>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'MAddItemsModal',
        props: {
            isCart: {
                type: Boolean,
                default: false
            },
            isBuo: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isList: {
                type: Boolean,
                default: false
            },
            isUpsell: {
                type: Boolean,
                default: false
            },
            fromPastOrder: {
                type: Boolean,
                default: false
            },
            fromSurvey: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            modalId: {
                type: String,
                default: 'modal-add-list-cart-buo'
            }
        },
        data() {
            return {
                viewportWidth: 0,
                shopListsCode: [
                    'DuplicateSkus',
                    'ShoppingListCannotContainDuplicateSkus'
                ],
                list: {},
                modalKey: '',
                editedItems: []
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedApiError', 'storedAddListResult', 'storedHasBuoApiError']),
            ...mapState('productsSurvey', ['storedSurveyListResult']),
            ...mapState('addToCart', ['cartData', 'cartUnavailableItems']),
            ...mapGetters('addToCart', ['showConfirmation']),

            modalWidth() {
                let width = '420px';

                if(this.viewportWidth < 768) {
                    width = '96%';
                } else if(this.isBuoApiErrorModal) {
                    width = '620px';
                } else if(this.isSuccessModal && this.isList && this.fromSurvey) {
                    width = '430px';
                }

                return width;
            },
            isApiErrorModal() {
                return ((!this.result || !this.result?.length) && this.storedApiError && !this.result?.Items);
            },
            isBuoApiErrorModal() {
                return this.storedHasBuoApiError && this.localization?.Labels?.AddToBackupOrder;
            },
            isItemsErrorModal() {
                return this.hasErrors && this.result && this.result?.Items;
            },
            isSuccessModal() {
                return !this.hasErrors && this.result && this.result?.Items;
            },
            result() {
                // If it's 'Which Product List' from Survey page
                if(this.fromSurvey) return this.storedSurveyListResult || {};

                // If it's Cart and Upsell
                if(this.isCart && this.isUpsell) return this.cartUnavailableItems || {};

                return this.storedAddListResult || {};
            },
            unavailableItems() {
                let items = null;
                let temp = [];

                if(this.result && this.result.Items) {
                    // Get all items with non-empty validation and that has not being add to cart yet (Edit Pack/Edit Quantity)
                    items = this.result.Items.filter(i => {
                        // IF the item has valid validation array and the SKU is not in the array yet and the SKU is not edited yet
                        if(!temp.includes(i.Details.Sku) && i.Validation && i.Validation.length &&
                            !this.editedItems.includes(i.Details.Sku)) {
                            // Mark as added to avoid duplicated SKU
                            temp.push(i.Details.Sku);

                            return true;
                        } else {
                            return false;
                        }
                    });

                    // Get all items with non-empty validation except Shopping Lists validation
                    if(items && items.length) {
                        items = items.filter(i => !i.Validation.some(msg => this.shopListsCode.includes(msg.ValidationCode)));
                    }
                }

                return items;
            },
            hasErrors() {
                let errors = false;

                if(this.unavailableItems && this.unavailableItems.length) {
                    errors = true;
                }

                return errors;
            },
            titleMods() {
                let mods = null;

                if(this.isSuccessModal) {
                    if(this.isList) {
                        if(this.fromSurvey) {
                            mods = 'md:text-2xl-2 block text-2xl text-gray-150 font-normal';
                        } else {
                            mods = 'font-bold';
                        }
                    }
                } else {
                    if(this.isCart && !this.isUpsell) mods = 'mb-0';
                    else if(this.isBuo) mods = 'mb-15 md:mb-30';
                    else if(this.isList) mods = 'mb-30';

                    if(mods && this.fromSurvey) {
                        mods = mods + ' -survey';
                    }
                }

                return mods;
            },
            goToListMods() {
                let mods = !this.fromSurvey ? '-green' : '-white mb-15 md:mb-0 mr-0 md:mr-15';
                return mods;
            },
            modalLabels() {
                let title = null;
                let goToLabel = null;
                let manageLabel = null;
                let closeLabel = null;
                let headerNotesLabel = null;
                let footNotesLabel = null;
                let description = null;
                let continueLabel = null;

                if(this.result) {
                    // If it's the success modal
                    if(!this.hasErrors) {
                        // Cart
                        if(this.isCart) {
                            title = this.localization?.Labels?.ModalAddListCart ||
                                'The items in this list were added to your shopping cart.';
                            goToLabel = this.localization?.Labels?.GoToCart || 'Go to cart';

                        // Buo
                        } else if(this.isBuo) {
                            title = this.localization?.Labels?.ModalAddListBuo ||
                                'The items in this list were added to your Backup Order.';
                            goToLabel = this.localization?.Labels?.GoToBuo || 'Go to Backup Order';

                        // List
                        } else if(this.isList) {
                            // If it's Order History
                            if(this.fromPastOrder) {
                                ({ title, goToLabel, manageLabel } = this.getOrderHistoryMessage());

                            // If it's Survey page
                            } else if(this.fromSurvey) {
                                title = this.localization?.Labels?.AddListModal?.Title || 'Added to List:';
                                description = this.list.ListName;
                                closeLabel = this.localization?.Labels?.AddListModal?.Close || 'Close';
                                goToLabel = this.localization?.Labels?.GoToList || 'Go to List';
                                headerNotesLabel = null;
                            }
                        }

                    // If it's the unavailable items modal
                    } else {
                        headerNotesLabel = this.localization?.Labels?.ModalUnavailableProductsHeaderNotes;
                        footNotesLabel = this.localization?.Labels?.ModalUnavailableProductsFootNotes;

                        // Cart
                        if(this.isCart) {
                            // If it's Upsell
                            if(this.isUpsell) {
                                title = this.localization?.UnavailableProducts?.ModalUnavailableProducts || 'Some items could not be added to your Cart.';
                                continueLabel = this.localization?.UnavailableProducts?.Continue || 'Continue';
                                footNotesLabel = this.localization?.UnavailableProducts?.ModalUnavailableProductsFootNotes;
                                headerNotesLabel = null;

                            // If it's regular Cart
                            } else {
                                title = this.localization?.Labels?.ModalUnavailableProducts || 'Some items could not be added to your Cart.';

                                if(this.unavailableItems.length === 1 && this.localization?.Labels?.ModalUnavailableProductsSingleItem) {
                                    title = this.localization.Labels.ModalUnavailableProductsSingleItem;
                                }
                            }

                        // Buo
                        } else if(this.isBuo) {
                            title = this.localization?.Labels?.ModalUnavailableProductsBuo || 'Some items could not be added to Backup Order.';

                            manageLabel = this.localization?.Labels?.ManageBUO;

                        // List
                        } else if(this.isList) {
                            // If it's Order History, always show success message
                            if(this.fromPastOrder) {
                                ({ title, headerNotesLabel, goToLabel, manageLabel } = this.getOrderHistoryMessage());

                            // If it's Survey page, then display attention item message
                            } else if(this.fromSurvey) {
                                title = this.localization?.Labels?.SomeItemsError || 'Some items could not be added.';
                                closeLabel = this.localization?.Labels?.AddListModal?.Close || 'Close';
                                goToLabel = this.localization?.Labels?.GoToList || 'Go to List';
                                headerNotesLabel = null;
                            }
                        }
                    }
                }

                return {
                    title: title,
                    manageLabel: manageLabel,
                    headerNotesLabel: headerNotesLabel,
                    footNotesLabel: footNotesLabel,
                    closeLabel: closeLabel,
                    goToLabel: goToLabel,
                    description: description,
                    continueLabel: continueLabel,
                    goToLink: () => {
                        let link = '/';

                        // Cart
                        if(this.isCart) {
                            if(!this.isUpsell && this.localization?.Data?.CartPage?.Url) {
                                link = this.localization.Data.CartPage.Url;
                            }

                        // Buo
                        } else if(this.isBuo) {
                            if(this.localization?.Data?.BuoPage?.Url) {
                                link = this.localization.Data.BuoPage.Url;
                            }

                        // List
                        } else if(this.isList) {
                            const listPage = this.localization?.Data?.ListsPage || this.localization?.Data?.GoToListLink;

                            if(listPage?.Url) {
                                link = listPage.Url + '?listId=' + this.list?.ListId;
                            }
                        }

                        return link;
                    }
                };
            },
            genericFailureMessage() {
                let obj = {};

                if(this.isBuo) {
                    obj = {
                        title: this.localization?.Labels?.AddToBackupOrder?.Title || null,
                        message: this.localization?.Labels?.AddToBackupOrder?.GenericFailureMessage || null,
                        refresh: this.localization?.Labels?.AddToBackupOrder?.RefreshPage || null
                    };
                }

                return obj;
            }
        },
        watch: {
            showConfirmation() {
                const sku = this.cartData?.Item?.Details?.Sku;

                // If the item is successfully added to cart using Edit Pack/Edit Quantity CTA
                if(this.isCart && this.showConfirmation && sku && !this.isUpsell) {
                    // Mark as edited item
                    this.editedItems.push(sku);

                    // Remove the item from child component (necessary due to modal reactivity problem)
                    if(typeof this.$refs['unavailable-items']?.removeItem === 'function') {
                        this.$refs['unavailable-items'].removeItem(sku);
                    }

                    // If all items were added to cart, then close the modal
                    if(!this.unavailableItems.length) {
                        this.close(this.modalId);
                    }
                }
            }
        },
        created() {
            // Viewport
            this.setViewport();

            this.modalKey = Math.random();

            // Create resize listener
            window.addEventListener('resize', this.resize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                this.$emit('adding-list-hide', true);
            });

            this.$modal.$on.shown(() => {
                this.updateScroll();
            });
        },
        methods: {
            open(modalId) {
                // It it's BUO and all products were added, then redirect to BUO page
                if(this.isBuo && this.result && !this.hasErrors && !this.storedApiError?.length && !this.storedHasBuoApiError) {
                    this.$nextTick(() => {
                        window.location.href = this.modalLabels.goToLink();
                    });
                } else {
                    this.$modal.show({ id: modalId });

                    this.$nextTick(() => {
                        this.updateScroll();
                    });
                }
            },
            close(modalId) {
                this.$modal.hide({ id: modalId });
            },
            reloadPage() {
                window.location.reload();
            },
            resize() {
                this.setViewport();

                this.updateScroll();
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            },
            updateScroll() {
                if(this.hasErrors && this.unavailableItems && this.unavailableItems.length && this.$refs['unavailable-items']) {
                    this.$refs['unavailable-items'].updateScroll();
                }
            },
            setList(list) {
                this.list = list;
            },
            removeListItems() {
                // If it's Add List to Cart and it's a SaveForLater list
                if(this.isCart && this.list?.ListId > -1 && this.list?.ListType === 'SaveForLater' && !this.isUpsell) {
                    // Set as removed items
                    this.$store.commit('shoppingLists/SET_ITEMS_REMOVED', {
                        removed: true
                    });

                    // Remove only added to cart items from SaveForLater list
                    if(this.hasErrors && this.unavailableItems?.length) {
                        // Remove all items, except the items that were not added to cart (unavailable items)
                        const remainingItems = this.list.ListItems.filter(item => {
                            return this.unavailableItems.some(i => i.Details.Sku === item.Sku);
                        });

                        // Update SaveForLater list items
                        this.$store.commit('shoppingLists/SET_LIST_ITEMS', {
                            items: remainingItems
                        });

                        // Update SaveForLater list count
                        this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                            listId: this.list.ListId,
                            toInteger: remainingItems.length
                        });
                    // Remove all items from SaveForLater list
                    } else {
                        // Remove all SaveForLater list items
                        this.$store.commit('shoppingLists/SET_LIST_ITEMS', {
                            items: []
                        });

                        // Set SaveForLater list count to zero
                        this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                            listId: this.list.ListId,
                            toInteger: 0
                        });
                    }
                }
            },
            getOrderHistoryMessage() {
                let title = this.localization?.Labels?.OrderSaved || 'The items has been saved to:';

                // Contact list name
                if(this.list && this.list.ListId > -1) {
                    title += `<span class="${!this.isCn ? ` italic ` : ''}font-normal block">  ${this.list.ListName} </span>`;
                }

                let headerNotesLabel = this.localization?.Labels?.SomeItemsError;
                let goToLabel = this.localization?.Labels?.GoToList;
                let manageLabel = this.localization?.Labels?.ManageList;

                return { title, headerNotesLabel, goToLabel, manageLabel };
            }
        }
    };
</script>

import { mapState, mapActions } from 'vuex';

export default {
    name: 'MShoplistsAddItemModal',

    data() {
        return {
            listAdded: false,
            listAdding: false,
            listAddingType: null,
            listModalOpened: false,
            modalResultId: null
        };
    },
    computed: {
        ...mapState('shoppingLists', ['storedSkuInLists', 'storedLists'])
    },
    methods: {
        ...mapActions('shoppingLists', ['getAllLists', 'addItemsToCart', 'addItemsToBuo', 'getAllLists', 'addItemsToList']),

        openModal(modalId, isAddItems) {
            if(this.$refs[modalId]) {
                if(!isAddItems || (isAddItems && this.listAdded)) {
                    this.$refs[modalId].open(modalId);
                }
            }
        },
        closeModal(modalId) {
            if(this.$refs[modalId]) {
                this.$refs[modalId].close(modalId);

                this.listAdded = false;
                this.listAdding = false;
                this.listAddingType = null;
                this.listModalOpened = false;
            }
        },
        // Verify if an item or a collection of items are already in a list
        async verifyAlreadyInList(listId, sku, doNotLoad = false) {
            let alreadyInList = false;

            // If SKU is empty/null, then it's not possible to verify the item
            if(!sku) {
                return alreadyInList;
            }

            // Set loading
            if(!doNotLoad) {
                this.$store.commit('shoppingLists/SET_LOADING_CHECK_IN_LIST', true);
            }

            // Get items from list
            await this.getAllLists({
                sku: sku
            });

            // Verify if the item is already in the list
            const found = await this.storedSkuInLists.find(list => (Array.isArray(listId) && sku.includes(list.ListId)) || list.ListId === listId);

            // Item is in the list
            if(found && found.ListId >= 0) {
                alreadyInList = true;
            }

            // Clear shelf stored items
            this.$store.commit('shoppingLists/SET_LIST_ITEMS', { shelf: true, items: [] });

            // Set loading
            if(!doNotLoad) {
                // Set loading
                this.$store.commit('shoppingLists/SET_LOADING_CHECK_IN_LIST', false);
            }

            return alreadyInList;
        },
        // Prepare items to be added to BUO or Cart
        async prepareListItems(listItems, isOrderHistory, listId) {
            let items = [];
            let payload = {};

            await listItems.forEach(item => {
                // If the items is not removed from list or moved to another list
                if(!item.Removed && !item.MovedTo) {
                    payload = {
                        Sku: item.Sku,
                        Quantity: isOrderHistory ? item.Quantity : 1,
                        Configurations: item.ConfigurationSkus || item.Configurations,
                        LineType: item.LineType || 'Normal'
                    };

                    // If there's a list ID
                    if(listId > -1) {
                        payload.ListId = listId;
                    }

                    // If it's CART
                    if(this.listAddingType === 'cart') {
                        payload.PromotionId = null;
                        payload.RevenueSource = 'Web';

                    // If it's BUO
                    } else if(this.listAddingType === 'buo') {
                        payload.Category = null;
                    }

                    // Push item to list items
                    items.push(payload);
                }
            });

            return items;
        },
        // Open modal if the user is trying to add multiple items to Cart
        async handleAddItemsToCart(listItems, modalId, isOrderHistory, list) {
            // If there are products in the list
            if(listItems && listItems.length) {
                this.listAddingType = 'cart';
                this.listAdded = false;
                this.listAdding = true;
                this.$emit('adding-list', this.listAdding);

                // Prepare payload
                const payload = await this.prepareListItems(listItems, isOrderHistory, list?.ListId);

                // Add list to cart
                await this.addItemsToCart({
                    payload: payload
                });

                this.listAdded = true;
                this.listAdding = false;
                this.$emit('adding-list', this.listAdding);

                this.$nextTick(() => {
                    // If is SaveForLater list, then set list data and remove list items
                    if(list?.ListId > -1 && list?.ListType === 'SaveForLater') {
                        if(this.$refs[modalId] && typeof this.$refs[modalId].setList === 'function') {
                            list.ListItems = listItems;
                            this.$refs[modalId].setList(list);
                            this.$refs[modalId].removeListItems();
                        }
                    }

                    // Open modal
                    this.openModal(modalId, true);
                });
            }
        },
        // Open modal if the user is trying to add multiple items to BUO
        async handleAddItemsToBuo(listItems, modalId, isOrderHistory) {
            // If there are products in the list
            if(listItems && listItems.length) {
                this.listAddingType = 'buo';
                this.listAdded = false;
                this.listAdding = true;
                this.$emit('adding-list', this.listAdding);

                // Prepare payload
                const payload = await this.prepareListItems(listItems, isOrderHistory);

                // Add list to backup order
                await this.addItemsToBuo({
                    payload: payload
                });

                this.listAdded = true;
                this.listAdding = false;
                this.$emit('adding-list', this.listAdding);

                this.$nextTick(() => {
                    // Open modal
                    this.openModal(modalId, true);
                });
            }
        },
        // Get all lists from a user
        async handleAddItemsToList(modalId, modalResultId) {
            this.listAdding = true;

            if(!this.storedLists || !this.storedLists.length) {
                // Get lists from API
                await this.getAllLists();
            }

            this.listModalOpened = true;
            this.listAdding = false;
            this.modalResultId = modalResultId;

            this.$nextTick(() => {
                // Open modal
                this.openModal(modalId);
            });
        },
        // Open modal if the user is trying to add multiple items to a list and there's some error
        async handleItemsAddedToList(list, modalResultId) {
            if(modalResultId) {
                this.modalResultId = modalResultId;
            }

            const modalId = this.modalResultId;
            this.listModalOpened = false;
            this.listAddingType = 'list';
            this.listAdded = true;
            this.listAdding = false;

            this.$nextTick(() => {
                if(this.$refs[modalId] && typeof this.$refs[modalId].setList === 'function') {
                    this.$refs[modalId].setList(list);
                }

                this.$nextTick(() => {
                    // Open modal
                    this.openModal(modalId, true);
                });
            });
        }
    }
};

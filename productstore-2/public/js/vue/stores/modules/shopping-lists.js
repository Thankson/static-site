import Vue from 'vue';
import apiAllLists from '@api/routes/shoppinglists';
import apiSingleList from '@api/routes/shoppinglist';
import apiCart from '@api/routes/cart/list';
import apiBuo from '@api/routes/backuporder/cart/list';
import soldOutApi from '@api/routes/products';

const namespaced = true;

const state = {
    isEdit: false,
    needsConfigurations: false,
    riverbendSavedForLaterID: null,
    storedHasApiError: false,
    storedHasBuoApiError: false,
    storedLists: [],
    storedLocalizationLists: {},
    storedListItems: [],
    storedListItemsShelf: [],
    storedAddListResult: {},
    storedItemConfirmation: {},
    storedApiError: [],
    storedApiLoading: false,
    storedShowConfirmation: false,
    storedIsMoving: false,
    storedListId: {},
    storedListItemsRemoved: false,
    storedListModalData: {},
    storedInventory: [],
    storedLoadingInventory: false,
    oneStepEligible: false,
    storedLoadingCheckInList: false,
    storedSkuInLists: []
};

const parseError = (errorMessages = []) => {
    let errors = [];

    if(Array.isArray(errorMessages)) {
        errorMessages.forEach(error => {
            errors.push(error.Translation || error.Original || error);
        });
    } else {
        errors = [ errorMessages ];
    }

    return errors;
};

const actions = {
    // Get inventory data
    async getInventoryData({ commit }, payload) {
        const envCountry = this._vm.$env.Country ? this._vm.$env.Country : 'UnitedStates';
        const skuParams = new URLSearchParams();
        const skuQuery = payload;
        const warehouseGroup = window.dataLayer?.find(layer => layer.warehouseGroup)?.warehouseGroup || 'IdahoFalls';

        commit('SET_INVENTORY_LOADING', true);

        skuQuery.forEach(prod => skuParams.append('skus', prod.Sku));
        skuParams.append('warehouseGroup', warehouseGroup);
        skuParams.append('country', `${envCountry}`);
        if(skuQuery.length) {
            const response = await soldOutApi.query(skuParams);
            if(response.success) {
                const inventoryData = response?.data;
                commit('SET_INVENTORY_DATA', inventoryData);
                commit('SET_INVENTORY_LOADING', false);
            }
        }
    },
    // Get all lists
    async getAllLists({ commit }, payload = null) {
        let loading = true;
        let lists = [];

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set route
        apiAllLists.setRoute('/api/shoppinglists');
        let params = {};

        if(payload && payload.sku) {
            params.sku = payload.sku;
        }

        // Get data from API
        const response = await apiAllLists.query(params);

        // Process response
        if(response.success && response?.data?.Success) {
            lists = response?.data?.Data?.Lists;
            const localization = response?.data?.Data?.Localization;
            const skuInLists = response?.data?.Data?.SkuInLists;

            if(skuInLists) {
                commit('SET_SKU_IN_LISTS', skuInLists);
            }
            commit('SET_LISTS', lists);
            commit('SET_LOCALIZATION_LISTS', localization);
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }

            commit('SET_LISTS', []);
        }

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
    },
    // Get the products from a list
    async getListItems({ commit, state, dispatch }, { payload }) {
        let loading = true;
        let items = [];
        let params = null;
        const shelf = payload.isShelf;
        let listId = null;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set dynamic route
        if(payload.ListId !== null && payload.ListId !== undefined) {
            apiSingleList.setRoute(`/api/shoppinglist/${payload.ListId}`);
        } else if(payload.ListType) {
            apiSingleList.setRoute(`/api/shoppinglists/${payload.ListType}`);
        }

        // Set sort param
        if(payload.so) {
            params = {
                so: payload.so
            };
        }

        // Get data from API
        const response = await apiSingleList.query(params);

        // Process response
        if(response.success && response?.data?.Success) {
            const data = response?.data?.Data;
            items = data.Items;
            listId = data.ListId;

            // Check inventory
            if(payload.checkInventory) {
                dispatch('getInventoryData', items);
            }

            // Modals
            const modalDetails = data?.AttentionItems;
            if(modalDetails) {
                commit('SET_LIST_MODAL', modalDetails);
            }

            commit('SET_LIST_ITEMS', { items, shelf, listId });
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }

            items = [];
            commit('SET_LIST_ITEMS', { items, shelf, listId });
        }

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
    },
    // Create a new list
    async createList({ commit }, { payload }) {
        let loading = true;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set route
        apiAllLists.setRoute('/api/shoppinglists');

        // Save data
        const response = await apiAllLists.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            const list = response?.data?.Data?.List;

            commit('SET_NEW_LIST', list);
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
    },
    // Edit a list
    async editList({ commit }, { payload }) {
        let loading = true;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set route
        apiSingleList.setRoute('/api/shoppinglist');

        // Save data
        const response = await apiSingleList.put(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            let list = response?.data?.Data;
            list.ListId = payload.ListId;
            list.ListName = payload.ListName;
            list.Order = payload.Order;

            commit('SET_EDIT_LIST', list);
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);

        return response.success && response.data?.Success;
    },
    // Remove a list
    async removeList({ commit }, { listId }) {
        let loading = true;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set dynamic route
        apiAllLists.setRoute(`/api/shoppinglists/${listId}`);

        // Delete data on API
        const response = await apiAllLists.delete();

        // Process response
        if(response.success && response?.data?.Success) {
            const id = listId;

            commit('SET_REMOVED_LIST', id);
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
    },
    // Add item to list
    async addToList({ commit }, { listId, payload }) {
        let loading = true;
        let show = null;
        let item = null;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set route
        apiSingleList.setRoute(`/api/shoppinglist/${listId}`);

        // Save data
        const response = await apiSingleList.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            show = true;
            item = response.data?.Data?.item;
        } else {
            show = false;

            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Add product information to confirmation shelf
        commit('SET_ITEM_CONFIRMATION', item);

        // Show/Hide confirmation shelf
        commit('SET_SHOW_CONFIRMATION', show);

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);

        return response;
    },
    // Move item to list
    async moveToList({ commit }, { payload }) {
        let loading = true;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set route
        apiAllLists.setRoute('/api/shoppinglists/move');

        // Save data
        const response = await apiAllLists.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            const sku = payload.Sku;
            const newList = response.data.Data?.List || {};

            commit('SET_MOVED_ITEM', { sku, newList });
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
    },
    // Add many items to list
    async addItemsToList({ commit }, { listId, payload }) {
        let loading = true;
        let result = null;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set route
        apiSingleList.setRoute(`/api/shoppinglist/products/${listId}`);

        // Save data
        const response = await apiSingleList.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            result = response?.data?.Data;
        } else {
            result = null;

            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Set result
        commit('SET_ADD_LIST_RESULT', result);

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);

        return response;
    },
    // Remove an item from a list
    async removeFromList({ commit }, { payload }) {
        let loading = true;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Set dynamic route
        apiSingleList.setRoute(`/api/shoppinglist/${payload.ListId}/${payload.Sku}`);

        // Delete data on API
        const response = await apiSingleList.delete();

        // Process response
        if(response.success && response?.data?.Success) {
            const sku = payload.Sku;

            commit('SET_REMOVED_ITEM', sku);
        } else {
            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
        return response;
    },
    // Add items to cart
    async addItemsToCart({ commit }, { payload }) {
        let loading = true;
        let result = null;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Add items to CART
        const response = await apiCart.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            result = response?.data?.Data;
        } else {
            result = null;

            if(response?.data?.ErrorMessages) {
                // Display API errors if they exist
                commit('SET_API_ERROR', parseError(response.data.ErrorMessages));
            }
        }

        // Set result
        commit('SET_ADD_LIST_RESULT', result);

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
    },
    // Add items to backup order
    async addItemsToBuo({ commit }, { payload }) {
        let loading = true;
        let result = null;

        // Reset errors
        commit('RESET_API_ERROR');
        // Enable loading
        commit('SET_API_LOADING', loading);

        // Add items to BUO
        const response = await apiBuo.post(payload);

        // Process response
        if(response.success && response?.data?.Success && response?.data?.Data?.Items) {
            result = response?.data?.Data;
        } else if(!response.success || !(response?.data?.Success)) {
            // Display API errors if they exist
            commit('SET_BUO_API_ERROR', true);
        } else {
            result = null;
            let error = [];

            if(response?.data?.ErrorMessages) {
                error = parseError(response.data.ErrorMessages);
            } else {
                error = [ response ];
            }

            // Display API errors if they exist
            commit('SET_API_ERROR', error);
        }

        // Set result
        commit('SET_ADD_LIST_RESULT', result);

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', loading);
    }
};

const getters = {
};

const mutations = {
    SET_BUO_API_ERROR(state, isError) {
        state.storedHasBuoApiError = isError;
    },
    SET_API_ERROR(state, error = []) {
        const errorArr = Array.isArray(error) ? error : [ error ];
        state.storedApiError = errorArr;
        state.storedHasApiError = true;
    },
    RESET_API_ERROR(state) {
        state.storedApiError = [];
        state.storedHasApiError = false;
        state.storedHasBuoApiError = false;
    },
    SET_INVENTORY_LOADING(state, loading) {
        state.storedLoadingInventory = loading;
    },
    SET_IS_EDIT(state, isEdit) {
        state.isEdit = isEdit;
    },
    SET_IS_ONE_STEP_ELIGIBLE(state, oneStepEligible) {
        if(!state.isEdit) {
            state.oneStepEligible = oneStepEligible;
        }
    },
    SET_API_LOADING(state, loading) {
        state.storedApiLoading = loading;
    },
    SET_INVENTORY_DATA(state, data) {
        state.storedInventory = data;
    },
    SET_LISTS(state, lists) {
        state.storedLists = lists;
    },
    SET_NEEDS_CONFIGURATIONS(state, needsConfigurations) {
        state.needsConfigurations = needsConfigurations;
    },
    SET_RIVERBEND_SAVED_FOR_LATER_ID(state, id) {
        state.riverbendSavedForLaterID = id;
    },
    SET_SKU_IN_LISTS(state, skuInLists) {
        state.storedSkuInLists = skuInLists;
    },
    SET_LIST_ITEMS(state, { items, shelf, listId }) {
        if(shelf) {
            state.storedListItemsShelf = items;
        } else {
            state.storedListItems = items;
        }

        if(listId) {
            state.storedListId = listId;
        }
    },
    SET_LIST_MODAL(state, modalData) {
        state.storedListModalData = modalData;
    },
    SET_NEW_LIST(state, list) {
        state.storedLists.push(list);
    },
    SET_EDIT_LIST(state, list) {
        let listType = null;
        let oldOrder = null;
        let currentOrder = null;
        // Set current list order
        state.storedLists.map((storedList, index) => {
            if(storedList.ListId === list.ListId) {
                listType = list.ListType;
                oldOrder = list.Order;
                currentOrder = state.storedLists[index].Order;
                // Forcing Vue reactivity
                Vue.set(state.storedLists[index], 'ListName', list.ListName);
                Vue.set(state.storedLists[index], 'Order', list.Order);
            }
        });
        // Set old list order
        state.storedLists.map((storedList, index) => {
            if(storedList.ListType === listType && storedList.ListId !== list.ListId && storedList.Order === oldOrder) {
                Vue.set(state.storedLists[index], 'Order', currentOrder);
            }
        });
    },
    SET_REMOVED_LIST(state, id) {
        state.storedLists = state.storedLists.filter(list => list.ListId !== id);
    },
    SET_LOCALIZATION_LISTS(state, localization) {
        state.storedLocalizationLists = localization;
    },
    SET_IS_MOVING(state, moving) {
        state.storedIsMoving = moving;
    },
    SET_MOVED_ITEM(state, { sku, newList }) {
        state.storedListItems.map((item, index) => {
            if(item.Sku === sku) {
                // Forcing Vue reactivity
                Vue.set(state.storedListItems[index], 'MovedTo', true);
                Vue.set(state.storedListItems[index], 'MovedToListId', newList?.ListId);
                Vue.set(state.storedListItems[index], 'MovedToListName', newList?.ListName);

                state.storedIsMoving = true;
            }
        });
    },
    SET_REMOVED_ITEM(state, sku) {
        state.storedListItems.map((item, index) => {
            if(item.Sku === sku) {
                // Forcing Vue reactivity
                Vue.set(state.storedListItems[index], 'Removed', true);
            }
        });
    },
    SET_ITEMS_COUNT(state, { listId, increase, decrease, toInteger }) {
        state.storedLists.map((list, index) => {
            if(list.ListId === listId) {
                let count = parseInt(list.ItemCount);
                if(increase) {
                    count++;
                } else if(decrease) {
                    count--;
                } else if(toInteger > -1) {
                    count = toInteger;
                }

                // Forcing Vue reactivity
                Vue.set(state.storedLists[index], 'ItemCount', count);
            }
        });
    },
    SET_VISIBLE_ITEM(state, index) {
        if(state.storedListItems[index]) {
            // Forcing Vue reactivity
            Vue.set(state.storedListItems[index], 'Visible', true);
        }
    },
    SET_SHOW_CONFIRMATION(state, show) {
        state.storedShowConfirmation = show;
    },
    SET_ITEM_CONFIRMATION(state, item) {
        state.storedItemConfirmation = item;
    },
    SET_ADD_LIST_RESULT(state, result) {
        state.storedAddListResult = result;
    },
    SET_ITEMS_REMOVED(state, removed) {
        state.storedListItemsRemoved = removed;
    },
    SET_LOADING_CHECK_IN_LIST(state, loading) {
        state.storedLoadingCheckInList = loading;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

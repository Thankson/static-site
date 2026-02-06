import api from '@api/routes/backuporder/cart';
import apiProducts from '@api/routes/backuporder/products';
import apiCards from '@api/routes/backuporder/cards';
import soldOutApi from '@api/routes/products';

const namespaced = true;

const state = {
    backupOrder: [],
    buoCartLoaded: false,
    savedBackupOrder: { index: -1, key: null, isCustomCard: null },
    currentOrder: [],
    monthlyPointCommitment: 0,
    formattedMonthlyPointCommitment: '',
    calculatedPoints: 0,
    calculatedPrice: 0,
    calculatedPriceCommitment: 0,
    cartTotal: 0,
    cartCommitmentTotal: 0,
    cartItemCount: 0,
    errorMessage: null,
    hasError: false,
    lastSku: null,
    products: [],
    productsLoaded: false,
    pageSize: 0,
    pageNum: 1,
    totalProducts: 0,
    selectedCategory: 0,
    selectedOptions: 0,
    successfulSave: false,
    confirmationData: {}
};

const getInventoryData = async (products, vm) => {
    let inventoryData = [];

    try {
        // Filter products that has SKU and IsInventoryControlled === true
        const skuQuery = products.filter(prod => prod.Sku && prod.IsInventoryControlled);
        const skuParams = new URLSearchParams();
        const warehouseGroup = window.dataLayer?.find(layer => layer.warehouseGroup)?.warehouseGroup || 'IdahoFalls';
        const envCountry = vm?.$env?.Country ? vm.$env.Country : 'UnitedStates';

        if(skuQuery?.length) {
            // Prepare query strings for Inventory API
            skuQuery.forEach(prod => skuParams.append('skus', prod.Sku));
            skuParams.append('warehouseGroup', warehouseGroup);
            skuParams.append('country', `${envCountry}`);

            // Ping Inventory API
            const response = await soldOutApi.query(skuParams);
            if(response?.success) {
                inventoryData = response.data;
            }
        }
    } catch (e) {
        console.log('[CustomBUOStore] getInventoryData');
        console.log(e);
    }

    return inventoryData;
};

const filterInventoryData = (products, inventoryData) => {
    return products.filter(prod => {
        // Return products that have IsErpDateValid === true
        if(prod.IsErpDateValid) {
            const inventory = inventoryData.find(item => item.sku === prod.Sku);

            // Merge product object with inventory API object
            if(inventory?.sku) {
                prod = Object.assign(prod, inventory);
            }

            return true;
        } else {
            return false;
        }
    });
};

const actions = {
    updateCartSelection({ commit }, item) {
        const currentOrder = item;
        console.log('update cart selection', currentOrder);
        commit('UPDATE_CART_SELECTION', currentOrder.Item.Details);
        commit('UPDATE_SUMMARY', currentOrder);
        commit('CLEAR_ERROR_MESSAGES');
    },
    async getCBOProducts({ commit }, params) {
        const response = await apiProducts.post(
            { Category: params.catId,
                Sort: params.sortId,
                Search: params.searchTerm,
                PageNumber: params.pageNum,
                LastSku: params.lastSku,
                ShowAll: params.showAll || false
            }
        );
        if(response.success && response.data?.Success) {
            const data = response.data.length > 0 ? response.data[0] : response.data;
            const noProducts = response.data.Data.Products.length <= 0;
            if(noProducts) {
                commit('TOGGLE_LOADER', true);
            } else {
                // Get inventory data from Inventory API
                const inventoryData = await getInventoryData(response.data.Data.Products, this._vm);

                // Filter products according to inventory data
                data.Data.Products = filterInventoryData(response.data.Data.Products, inventoryData);

                if(data.Data.Products.length) {
                    commit('GET_CBOPRODUCTS', { data: data.Data, params });
                } else {
                    commit('TOGGLE_LOADER', true);
                }
            }
        } else {
            console.log(response.ErrorMessages);
            commit('TOGGLE_LOADER', true);
        }
    },
    async getBackupOrderCart({ commit }) {
        // added to let backend know its initial load
        const cart = 'init';
        const response = await api.query({ cart });
        if(response.success) {
            const data = response.data.length > 0 ? response.data[0] : response.data;
            commit('GET_BACKUPORDERCART', data.Data);
        } else {
            console.log('Error getting cart');
        }
    },
    async deleteProduct({ commit }, params) {
        const response = await api.delete({ LineItemId: params.lineItemId });
        const itemIndex = params.index;
        if(response.success) {
            commit('DELETE_PRODUCT', itemIndex);
            commit('UPDATE_SUMMARY', response.data);
            commit('CLEAR_ERROR_MESSAGES');
        }
    },
    async saveBackupOrder({ commit }, params) {
        const orderType = params.url ? params.orderType : params; // use null for testing error
        const response = await apiCards.post(orderType);

        if(response.success) {
            if(response.data?.Success) {
                commit('SAVE_BACKUP_ORDER', { params });
            } else {
                const message = response.data.ErrorMessages[0].Translation;
                commit('SHOW_ERROR_MESSAGES', { message: message, successfulSave: true });
            }
        } else {
            const message = response.error;
            commit('SHOW_ERROR_MESSAGES', message);
        }
    },
    showErrorMessages({commit}, payload) {
        commit('SHOW_ERROR_MESSAGES', { message: payload.msg, successfulSave: payload.status });
    },
    clearErrorMessages({ commit }, status) {
        commit('CLEAR_ERROR_MESSAGES', status);
    },
    resetProducts({ commit }) {
        commit('RESET_PRODUCTS');
    },
    toggleLoader({ commit }, showProducts) {
        commit('TOGGLE_LOADER', showProducts);
    }
};

const getters = {};

const mutations = {
    UPDATE_CART_SELECTION(state, lineItem) {
        let currentOrder = [ ...state.currentOrder ];
        const index = state.currentOrder.findIndex(order => order.LineItemId === lineItem.LineItemId);
        if(index > -1) {
            currentOrder[index] = lineItem;
        } else {
            currentOrder.push(lineItem);
        }
        state.currentOrder = currentOrder;
        console.log('UPDATE_CART SELECTION', state.currentOrder);
    },
    UPDATE_SUMMARY(state, data) {
        console.log('UPDATE_SUMMARY', data);
        state.monthlyPointCommitment = data.MonthlyCommitment;
        state.formattedMonthlyPointCommitment = data.FormattedMonthlyCommitment;
        state.calculatedPoints = data.Summary?.OrderPoints;
        state.calculatedPrice = data.Summary?.OrderTotal;
        state.calculatedPriceCommitment = data.Summary?.OrderCommitmentTotal;
        state.cartItemCount = data.Summary?.ItemCount;
        state.cartTotal = data.Summary?.FormattedOrderTotal;
        state.cartCommitmentTotal = data.Summary?.FormattedOrderCommitmentTotal;
    },
    UPDATE_ITEM(state, data) {
        let updatedProduct = state.currentOrder[data.index];
        updatedProduct.Points = data.points;
        updatedProduct.Quantity = data.quantity;
        updatedProduct.FormattedPrice = data.price;
    },
    UPDATE_CONFIRMATION(state, data) {
        state.confirmationData = data;
    },
    CLEAR_ERROR_MESSAGES(state, saveStatus) {
        state.hasError = false;
        state.successfulSave = saveStatus !== undefined ? saveStatus : false;
        state.errorMessage = '';
    },
    DELETE_PRODUCT(state, itemIndex) {
        state.currentOrder.splice(itemIndex, 1);
    },
    GET_BACKUPORDERCART(state, data) {
        state.buoCartLoaded = true;
        state.monthlyPointCommitment = data.MonthlyCommitment || 0;
        state.formattedMonthlyPointCommitment = data.FormattedMonthlyCommitment || '';
        state.calculatedPoints = data.Summary?.OrderPoints || 0;
        state.calculatedPrice = data.Summary?.OrderTotal || 0;
        state.calculatedPriceCommitment = data.Summary?.OrderCommitmentTotal || 0;
        state.cartItemCount = data.Summary?.ItemCount || 0;
        state.cartTotal = data.Summary?.FormattedOrderTotal || '';
        state.cartCommitmentTotal = data.Summary?.FormattedOrderCommitmentTotal || '';
        state.currentOrder = data.LineItems ? data.LineItems : [];
    },
    GET_CBOPRODUCTS(state, { data, params }) {
        if(data.PageNumber === 1 || params.showAll) {
            state.products = [];
            state.products = data.Products;
        } else {
            state.products.push(...data.Products);
        }
        state.pageSize = data.PageSize;
        state.pageNum = data.PageNumber;
        state.totalProducts = data.TotalItems;
        state.selectedCategory = params.catId;
        state.selectedOptions = params.sortId;
        state.productsLoaded = true;
        // get lastSku
        const lastProd = state.products[state.products.length - 1];
        state.lastSku = lastProd.Sku;
    },
    SET_BACKUP_ORDER_CARDS(state, backupOrder) {
        state.backupOrder = backupOrder;
    },
    RESET_PRODUCTS(state) {
        state.products = [];
        state.totalProducts = 0;
    },
    SAVE_BACKUP_ORDER(state, payload) {
        state.savedBackupOrder = { index: payload.params.index, key: payload.params.key, isCustomCard: payload.params.isCustomCard };
        state.hasError = false;
        state.successfulSave = true;
    },
    TOGGLE_LOADER(state, productsLoaded) {
        state.productsLoaded = productsLoaded;
    },
    SHOW_ERROR_MESSAGES(state, payload) {
        state.hasError = true;
        state.successfulSave = payload.successfulSave !== undefined ? payload.successfulSave : false;
        state.errorMessage = payload.message;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

import categoryApi from '@api/routes/category/search';
import extraSavingsApi from '@api/routes/category/manual/search';
import soldOutApi from '@api/routes/products';
import inventoryProcessing from '../../utils/inventory-processing';

const namespaced = true;

/** @typedef {{ name: string, value: string, disabled: boolean }} Refiner */

const state = {
    data: null,
    error: false,
    categoryId: '',
    isExtraSavings: false,
    refinerKey: '',
    /** @type {Array<Refiner>} */
    refiners: [],
    cache: [],
    pageNumber: null,
    sortKey: '',
    sortValue: '',
    isBirthdayPromotion: false,
    isLvipPromotion: false,
    inventoryProcessed: false
};

const actions = {
    cancel() {
        categoryApi.cancel();
    },
    async getData({ commit, state, getters }, { params, initial }) {
        commit('SET_INVENTORY_PROCESSED', false);

        const api = !state.isExtraSavings ? categoryApi : extraSavingsApi;
        const response = await api.query(params, state.categoryId);

        if(response.success && response.data?.Cards) {
            // If the store is empty, then set the data, EXCEPT the cards data
            // The cards data will be set only after Inventory API response is processed
            if(!state.data) {
                commit('SET_DATA', { ...response.data, Cards: [] });
            }

            if(initial) {
                commit('SET_PAGE_NUMBER', response.data?.CurrentPage || 1);
                commit('CHECK_REFINER_PARAMS', params);
            }

            // Prepare Inventory API params
            const envCountry = this._vm.$env.Country ? this._vm.$env.Country : 'UnitedStates';
            const warehouseGroup = window.dataLayer?.find(layer => layer.warehouseGroup)?.warehouseGroup || 'IdahoFalls';
            const skuQuery = inventoryProcessing.getAllSku(response.data.Cards);
            const skuParams = new URLSearchParams();
            skuParams.append('warehouseGroup', warehouseGroup);
            skuParams.append('country', `${envCountry}`);
            skuQuery.forEach(value => skuParams.append('skus', value));
            commit('SET_CACHE', {data: response.data, params: getters.params});

            // Call Inventory API
            const soldOutResponse = skuQuery.length ? await soldOutApi.query(skuParams) : null;

            // Process Inventory API response
            if(soldOutResponse?.success && soldOutResponse?.data?.length) {
                const newCards = inventoryProcessing.processAllSku(response.data.Cards, soldOutResponse.data);
                commit('SET_DATA', { ...response.data, Cards: newCards });
            } else if(!soldOutResponse?.cancelled) {
                commit('SET_DATA', response.data);
            } else {
                commit('SET_DATA', null);
            }

            commit('SET_INVENTORY_PROCESSED', true);
            return soldOutResponse?.cancelled;
        } else if(!response.cancelled) {
            commit('SET_ERROR', true);
            commit('SET_INVENTORY_PROCESSED', true);
        }

        return response.cancelled;
    },
    loadMore({ commit, state, dispatch }) {
        state.data.CurrentPage += 1;
        dispatch('getData');
    }
};

const getters = {
    params() {
        const params = {};
        params[state.sortKey] = state.sortValue;
        params.pageNumber = state.pageNumber;
        params.isBirthdayPromotion = state.isBirthdayPromotion;
        params.isLvipPromotion = state.isLvipPromotion;
        params[state.refinerKey] = state.refiners.map(refiner => refiner.value);

        return params;
    }
};

const mutations = {
    CLEAR_REFINERS(state) {
        state.refiners = [];
        state.pageNumber = 1;
    },
    SET_REFINER_KEY(state, key) {
        state.refinerKey = key;
    },
    CHECK_REFINER_PARAMS(state, params) {
        const refinerParams = params?.getAll(state.refinerKey) || [];
        if(refinerParams.length > 0 && state.data.FacetRefiners !== undefined) {
            state.data.FacetRefiners.forEach(facet => facet.Refiners.forEach(refiner => {
                if(refinerParams.includes(refiner.ItemId)) {
                    state.refiners.push({
                        name: refiner.Title,
                        value: refiner.ItemId
                    });
                }
            }));
        }
    },
    TOGGLE_REFINER(state, refiner) {
        let active = false;
        // check if refiner is active (exists in refiner array)
        for (let i = 0; i < state.refiners.length; i++) {
            if(refiner.value === state.refiners[i].value) {
                active = true;
                break;
            }
        }

        if(active) {
            state.refiners = state.refiners.filter(item => item.value !== refiner.value);
        } else {
            state.refiners.push(refiner);
        }

        window.history.replaceState({
            ...window.history.state,
            ...{refiners: state.refiners}
        }, '');

        state.pageNumber = 1;
    },
    REMOVE_REFINER(state, refiner) {
        state.refiners = state.refiners.filter(item => item.value !== refiner.value);
        window.history.replaceState({
            ...window.history.state,
            ...{refiners: state.refiners}
        }, '');
    },
    OVERWRITE_REFINERS(state, refiners) {
        if(refiners) {
            state.refiners = [ ...refiners ];
            window.history.replaceState({
                ...window.history.state,
                ...{refiners: state.refiners}
            }, '');
        }
    },
    SET_CACHE(state, data) {
        state.cache.push(data);
    },
    SET_CATEGORY_ID(state, id) {
        state.categoryId = id;
    },
    SET_IS_BIRTHDAY_PROMOTION(state, isBirthdayPromotion = false) {
        state.isBirthdayPromotion = isBirthdayPromotion;
    },
    SET_IS_EXTRA_SAVINGS(state, isExtraSavings = true) {
        state.isExtraSavings = isExtraSavings;
    },
    SET_IS_LVIP_PROMOTION(state, isLvipPromotion = true) {
        state.isLvipPromotion = isLvipPromotion;
    },
    SET_PAGE_NUMBER(state, key) {
        state.pageNumber = parseInt(key);
    },
    SET_SORT_KEY(state, key) {
        state.sortKey = key;
    },
    SET_SORT_VALUE(state, value) {
        state.sortValue = value || null;
    },
    SET_DATA(state, data) {
        state.data = { ...data };
    },
    // api status
    SET_ERROR(state, isError) {
        state.error = isError;
    },
    SET_ERROR_MESSAGE(state, msg) {
        state.errorMsg = msg;
    },
    SET_INVENTORY_PROCESSED(state, processed) {
        state.inventoryProcessed = processed;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

import api from '@api/routes/riverbend/customers/getfreeshipping';

const namespaced = true;

const state = {
    freeShippingSku: null,
    freeShippingThreshold: 0,
    hasFreeShipping: false
};

const actions = {
    async getFreeShipping({ commit }) {
        const response = await api.get();
        if(response.success && response.data.Success) {
            commit('SET_FREE_SHIPPING', response.data.Data.FreeShipping);
        }
    }
};

const mutations = {
    SET_FREE_SHIPPING(state, freeShipping) {
        state.freeShippingSku = freeShipping?.FreeShippingSku;
        state.freeShippingThreshold = freeShipping?.FreeShippingThreshold;
        state.hasFreeShipping = freeShipping?.HasFreeShipping;
    }
};

export default {
    namespaced,
    state,
    mutations,
    actions
};

import deleteApi from '@api/routes/customeraccount/deleteconveniencestore';
import getApi from '@api/routes/customeraccount/getconveniencestores';

const namespaced = true;

const state = {
    addresses: []
};

const actions = {
    async deleteAddress({commit}, params) {
        commit('SET_LOADING');
        const response = await deleteApi.delete({
            CustomerConvenienceStoreHistoryId: params
        });

        if(response.success && response.data?.Success) {
            commit('DELETE_ADDRESS', params);
        }
        commit('SET_LOADING', false);
    },
    async fetchAddresses({ commit }, addressType = 'cvsAddress') {
        commit('SET_LOADING');
        const response = await getApi.get();
        if(response.success && response.data?.Success) {
            commit('UPDATE_ADDRESSES', response.data?.Data || []);
        }
        commit('SET_LOADING', false);
    }
};

const mutations = {
    DELETE_ADDRESS(state, id) {
        const removedAddressArray = state.addresses;
        let removedAddress = removedAddressArray.findIndex(removedAddressArray => removedAddressArray.CustomerConvenienceStoreHistoryId === id);
        removedAddressArray.splice(removedAddress, 1);
        state.addresses = removedAddressArray;
    },
    UPDATE_ADDRESSES(state, data) {
        state.addresses = data;
    },
    SET_LOADING(state, loading = true) {
        state.loading = loading;
    }
};

export default {
    namespaced,
    state,
    mutations,
    actions
};

import api from '@api/routes/recentlypurchasedproducts';

const namespaced = true;

const state = {
    recentlyPurchasedProducts: []
};

const actions = {
    async getData({ commit }, params) {
        await api.query(params).then(response => {
            if(response?.data?.Success) {
                const _data = response.data.Data;
                commit('CREATE_RECENTLY_LIST', {commit, _data});
            } else {
                console.log('error=> ', response);
            }
        });
    }
};

const getters = {
    recentlyPurchased() {
        return state.recentlyPurchasedProducts || [];
    }
};

const mutations = {
    CREATE_RECENTLY_LIST(state, payload) {
        state.recentlyPurchasedProducts = payload._data;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

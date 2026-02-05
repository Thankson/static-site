import api from '@api/routes/paymethod/creditcard/cardissuers';

const namespaced = true;

const state = {
    cardIssuers: [],
    loaded: false,
    loading: false
};

const actions = {
    async getCardIssuers({ commit, state }, country) {
        if(state.loading) return;

        commit('SET_LOADING');

        const response = await api.query({ country });

        if(response.success) {
            commit('SET_CARD_ISSUERS', response.data?.Data);
            commit('SET_LOADED');
        }

        commit('SET_LOADING', false);
    }
};

const getters = {};

const mutations = {
    SET_CARD_ISSUERS(state, issuers = []) {
        state.cardIssuers = issuers;
    },
    SET_LOADED(state, loaded = true) {
        state.loaded = loaded;
    },
    SET_LOADING(state, loading = true) {
        state.loading = loading;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

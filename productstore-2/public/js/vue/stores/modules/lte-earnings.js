import api from '@api/routes/learntoearn/history';

const namespaced = true;

const state = {
    isLoading: false,
    lteEarningsData: {},
    storeLoaded: false
};

const actions = {
    async getData({ commit }) {
        // Setting as true so we have only one API call
        commit('SET_STORE_LOADED', true);

        commit('SET_IS_LOADING', true);
        const response = await api.get();
        this.loading = false;
        if(response.success) {
            commit('SET_LTEE_DATA', response.data?.Data || {});
            commit('SET_IS_LOADING', false);
            return;
        }
        console.warning('Sorry, we could not get the l2e informations, try again later.');
    }
};

const getters = {};

const mutations = {
    SET_LTEE_DATA(state, data) {
        state.lteEarningsData = { ...data };
    },
    SET_IS_LOADING(state, key) {
        state.isLoading = key;
    },
    SET_STORE_LOADED(state, key) {
        state.storeLoaded = key;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

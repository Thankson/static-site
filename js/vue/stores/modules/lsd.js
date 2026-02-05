import lsdApi from '@api/routes/account/lsd';

const namespaced = true;

const state = {
    isLsdLoaded: false,
    lsdDetails: {},
    showApiError: false
};

const actions = {
    async fetchLSD({ commit }, address) {
        const response = await lsdApi.get();
        if(response.success && response?.data?.Success) {
            let _data = response.data;
            commit('UPDATE_LSD_DETAILS', {commit, _data});
            commit('UPDATE_LOADED');
        } else {
            commit('UPDATE_LOADED');
            commit('SET_FAIL_REQUEST');
        }
    },

    async getLsdApiData({ commit, dispatch }) {
        let lsdFetch = dispatch('fetchLSD');
        return Promise.all([lsdFetch]);
    },

    async getLsdApiDataError({ commit }) {
        const response = await lsdApi.query({forceError: true});
        if(response.success && !response?.data?.Success) {
            console.log('||-Force-Error-PL-Only-||');
            commit('UPDATE_LOADED');
            commit('SET_FAIL_REQUEST');
        }
    }
};

const getters = {
    getLsdData() {
        return state.lsdDetails;
    }
};

const mutations = {
    SET_FAIL_REQUEST(state) {
        state.showApiError = true;
    },

    RESET_FAIL_REQUEST(state) {
        state.showApiError = false;
    },
    UPDATE_LSD_DETAILS(state, payload) {
        if(payload._data) state.lsdDetails = payload._data?.Data;
    },

    UPDATE_LOADED(state) {
        state.isLsdLoaded = true;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

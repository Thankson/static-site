const namespaced = true;

const state = {
    loading: false
};

const actions = {};

const getters = {};

const mutations = {
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

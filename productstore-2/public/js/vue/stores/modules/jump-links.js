const namespaced = true;

const state = {
    hasIngredients: false
};

const actions = {};

const getters = {};

const mutations = {
    SET_HAS_INGREDIENTS(state, hasIngredients) {
        state.hasIngredients = hasIngredients;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

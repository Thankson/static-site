import soldOutApi from '@api/routes/products';

const namespaced = true;

const state = {
    soldOutHost: ''
};

const actions = {
    async setSoldOutHost({ commit }, $env) {
        commit('SET_SOLDOUT_HOST', $env);
        soldOutApi.setHost(state.soldOutHost);

        console.log(
            '%c -- setSoldOutHost -- ',
            'background-color:red; color:white; border-radius: 2px;',
            state.soldOutHost,
            soldOutApi
        );
    }
};

const getters = {
    soldOutHostGet() {
        return state.soldOutHost || null;
    }
};

const mutations = {
    SET_SOLDOUT_HOST(state, $env) {
        state.soldOutHost = $env.ServiceBaseUrl;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

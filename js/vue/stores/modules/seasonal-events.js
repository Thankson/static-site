import api from '@api/routes/events';

const namespaced = true;

const state = {
    apiResponse: {},
    error: false,
    events: [],
    userFlags: {},
    eventRequestFail: false
};

const actions = {
    async getData({ commit }, payload) {
        commit('IS_LOADING');
        commit('SET_EVENTS_REQUEST_FAIL', false);

        // ForceError is used only on PatternLab to display Service Failure message
        let params = null;
        if(process?.env?.NODE_ENV === 'development' && payload?.forceError) {
            params = {
                forceError: payload.forceError
            };
        }

        const response = await api.query(params);
        if(response.data?.Success && response.data?.Data) {
            commit('GET_DATA', response.data);
            return response;
        } else {
            commit('API_ERROR');
            commit('SET_EVENTS_REQUEST_FAIL', true);
        }
        commit('STOP_LOADING');
    }
};

const getters = {
    events() {
        return state.events;
    },
    error() {
        return state.error;
    },
    userFlags() {
        return state.userFlags;
    }
};

const mutations = {
    API_ERROR(state) {
        state.error = true;
    },
    GET_DATA(state, response) {
        state.apiResponse = response.Data;
        state.events = response.Data.Coupons || [];
        state.userFlags = response.Data?.UserFlags || {};
    },
    IS_LOADING(state) {
        state.isLoading = true;
    },
    STOP_LOADING(state) {
        state.isLoading = false;
    },
    SET_EVENTS_REQUEST_FAIL(state, fail) {
        state.eventRequestFail = fail;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

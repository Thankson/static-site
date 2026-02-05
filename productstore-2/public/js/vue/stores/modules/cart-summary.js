import api from '@api/routes/cart/summary';
import logError from '../../utils/log-api-error';

const namespaced = true;

const state = {
    apiError: false,
    itemCount: null,
    loading: false,
    points: null,
    userFlags: {},
    welcomeProgramLsdAvailable: 0
};

const actions = {
    async getSummary({ commit }) {
        if(state.loading) {
            return;
        }

        commit('SET_LOADING');
        commit('SET_ERROR', false);
        const { data, error, success } = await api.query();

        if(success && data.Success) {
            const {
                Summary: summary,
                UserFlags: userFlags
            } = data.Data || {};
            commit('SET_CART_SUMMARY', summary);
            commit('SET_WELCOME_PROGRAM_LSD_AVAILABLE', summary);
            commit('SET_USER_FLAGS', userFlags);
        } else {
            commit('SET_ERROR', true);
            logError(api.route, error, data.ErrorMessages);
        }

        commit('SET_LOADING', false);
    }
};

const getters = {
    getUserFlags(state) {
        return state.userFlags;
    },
    summaryApiError(state) {
        return state.apiError;
    }
};

const mutations = {
    SET_CART_SUMMARY(state, summary) {
        const {
            ItemCount: itemCount,
            Points: points
        } = summary || {};

        state.itemCount = itemCount || 0;
        state.points = points || '0';
    },
    SET_ERROR(state, error) {
        state.apiError = error;
    },
    SET_LOADING(state, loading = true) {
        state.loading = loading;
    },
    SET_WELCOME_PROGRAM_LSD_AVAILABLE(state, summary) {
        const welcomeProgramLsdAvailable = summary?.WelcomeProgramLsdAvailable?.Available ?? null;

        if(welcomeProgramLsdAvailable !== null) {
            state.welcomeProgramLsdAvailable = welcomeProgramLsdAvailable;
        }
    },
    SET_USER_FLAGS(state, userFlags) {
        state.userFlags = userFlags;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

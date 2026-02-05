const namespaced = true;

const state = {
    formApiError: {},
    errorsMsgs: [],
    validSuccessCnt: 0
};

const mutations = {
    SET_FORM_API_ERROR(state, payload) {
        state.formApiError = payload;
    },

    SET_ERRORS_MSGS(state, payload) {
        state.errorsMsgs = payload;
    },

    SET_VALID_SUCCESS_CNT(state) {
        state.validSuccessCnt = state.validSuccessCnt + 1;
    }
};

const getters = {};

const actions = {};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

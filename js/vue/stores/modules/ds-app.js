const namespaced = true;

const state = {
    isSubmitSuccess: false,

    showExamTerm: true,
    showExamQuestion: false
};

const mutations = {
    HIDE_EXAM(state) {
        state.showExamTerm = false;
        state.showExamQuestion = false;
    },
    SHOW_EXAM_QUESTION() {
        state.showExamQuestion = true;
    }
};

const actions = {
    showExamQuestionOnly({ commit }) {
        commit('HIDE_EXAM');
        commit('SHOW_EXAM_QUESTION');
    }
};

export default {
    namespaced,
    state,
    mutations,
    actions
};

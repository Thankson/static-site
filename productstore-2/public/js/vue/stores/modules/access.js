const namespaced = true;

const state = {
    identification: null,
    melaleucaId: null,
    customerId: null,
    pin: null,
    stepIndex: 0,
    stepCount: 0,
    steps: []
};

const actions = {
    nextStep({ commit }) {
        commit('NEXT_STEP');
    },
    prevStep({ commit }) {
        commit('PREV_STEP');
    },
    goToStep({ commit }, id) {
        commit('GO_TO_STEP', id);
    },
    setSteps({ commit }, count) {
        commit('SET_STEPS', count);
    }
};

const getters = {
    active() {
        return state.steps[state.stepIndex] || '';
    }
};

const mutations = {
    NEXT_STEP(state) {
        if(state.stepIndex < (state.stepCount - 1)) {
            state.stepIndex++;
        }
    },
    PREV_STEP(state) {
        if(state.stepIndex) {
            state.stepIndex--;
        }
    },
    GO_TO_STEP(state, id) {
        const index = state.steps.indexOf(id);
        if(index !== -1) {
            state.stepIndex = index;
        }
    },
    SET_STEPS(state, steps) {
        if(Array.isArray(steps) && steps.length > 0) {
            state.steps = steps;
            state.stepCount = steps.length;
        }
    },
    SET_IDENTIFICATION(state, value) {
        state.identification = value;
    },
    SET_MELALEUCAID(state, value) {
        state.melaleucaId = value;
    },
    SET_CUSTOMERID(state, value) {
        state.customerId = value;
    },
    SET_PIN(state, value) {
        state.pin = value;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

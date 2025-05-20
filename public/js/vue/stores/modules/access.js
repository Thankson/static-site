const namespaced = true;

const state = {
    progressBar: [],
    activeStepProcessId: ''
};

const mutations = {
    SET_PROGRESS_BAR(state, payload) {
        state.progressBar = payload;
    },
    SET_ACTIVE_STEP_PROCESS_ID(state, payload) {
        const destProcessIdIndex = state.progressBar.findIndex(item => item.ProcessID === payload);
        if(destProcessIdIndex > -1) {
            state.activeStepProcessId = payload;
        }
    },
    GOTO_NEXT_STEP_PROCESS_ID(state) {
        const currentProcessIdIndex = state.progressBar.findIndex(item => item.ProcessID === state.activeStepProcessId);
        if(currentProcessIdIndex < state.progressBar.length - 1) {
            state.activeStepProcessId = state.progressBar[currentProcessIdIndex + 1].ProcessID;
        }
    },
    GOTO_PREV_STEP_PROCESS_ID(state) {
        const currentProcessIdIndex = state.progressBar.findIndex(item => item.ProcessID === state.activeStepProcessId);
        if(currentProcessIdIndex > 0) {
            state.activeStepProcessId = state.progressBar[currentProcessIdIndex - 1].ProcessID;
        }
    }
};

const actions = {
    setActiveStepProcessId({state, commit}, payload) {
        const destProcessId = payload || state.progressBar[0]?.ProcessID;
        commit('SET_ACTIVE_STEP_PROCESS_ID', destProcessId);
    }
};

export default {
    namespaced,
    state,
    mutations,
    actions
};

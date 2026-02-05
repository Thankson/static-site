import Vue from 'vue';

const namespaced = true;

const state = {
    sequenceLength: null,
    sequence: [],
    sequenceInitialized: false
};

const actions = {
    findAndSetNextActive({commit, state}) {
        for (let i = 0; i < state.sequence.length; i++) {
            if(state.sequence[i].completed === false) {
                commit('UPDATE_SEQUENCE_ISACTIVE_STATE', i);
                break;
            }
        }
    },
    initializeSequence({commit, state }, sequenceLength) {
        const sequence = [ ...state.sequence ];
        for (let i = 0; i < sequenceLength; i++) {
            sequence[i] = sequence[i] || {
                completed: undefined,
                index: i,
                sequence: i,
                loading: true,
                isActive: false,
                isEmpty: undefined,
                selectedTitle: ''
            };
        }
        commit('SET_SEQUENCE', sequence);
        commit('SET_SEQUENCE_INITIALIZED', true);
    },
    setSelectedTitle({commit}, data) {
        commit('SET_SELECTED_TITLE', data);
    },
    setSpecificSequenceObjectActive({commit}, index) {
        commit('SET_SPECIFIC_SEQUEMCE_OBJECT_ACTIVE', index);
    },
    completeSequence({commit, dispatch}, data) {
        commit('UPDATE_SEQUENCE_STATE', data);
        if(state.sequence.every(seq => seq.completed !== undefined)) {
            dispatch('findAndSetNextActive');
        }
    },
    updateSequence({commit}, data) {
        commit('UPDATE_SEQUENCE_STATE', data);
    }
};

const mutations = {
    SET_SEQUENCE(state, sequence) {
        state.sequence = sequence || [];
    },
    SET_SELECTED_TITLE(state, data) {
        updateSequenceObject(state.sequence, data.index,
            {
                ...state.sequence[data.index],
                ...{selectedTitle: data.selectedTitle}
            }
        );
    },
    SET_SEQUENCE_INITIALIZED(state, value) {
        state.sequenceInitialized = value;
    },
    SET_SPECIFIC_SEQUEMCE_OBJECT_ACTIVE(state, index) {
        state.sequence.forEach((obj, i) => {
            if(i === index) {
                updateSequenceObject(state.sequence, i,
                    {
                        ...state.sequence[i],
                        ...{isActive: true, index: i}
                    });
            } else {
                updateSequenceObject(state.sequence, i,
                    {
                        ...state.sequence[i],
                        ...{isActive: false, index: i}
                    });
            }
        });
    },
    UPDATE_SEQUENCE_STATE(state, data) {
        updateSequenceObject(state.sequence, data.index,
            {
                ...state.sequence[data.index],
                ...data
            });
    },
    UPDATE_SEQUENCE_ISACTIVE_STATE(state, index) {
        updateSequenceObject(state.sequence, index,
            {
                ...state.sequence[index],
                ...{isActive: true}
            });
    }
};

const getters = {
    sequenceInfo: (state) => (id) => {
        return state.sequence[id];
    },
    showSequenceNumber(state) {
        return state.sequence.length > 1;
    }
};

function updateSequenceObject(sequence, index, payload) {
    Vue.set(sequence, index, payload);
}

export default {
    namespaced,
    state,
    actions,
    mutations,
    getters
};

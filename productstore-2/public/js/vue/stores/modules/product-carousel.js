const CAROUSEL_HISTORY_STATE_KEY = '__product_carousel__';

let carouselIncrement = 0;
let storeReady = false;

const namespaced = true;

const state = {
    history: [],
    uidMap: {}
};

const actions = {
    setupHistoryStore({ commit }) {
        // use a "ready" boolean so these only happen once per page load
        if(!storeReady) {
            this.watch(
                // setup watcher to update window history state
                ({ productCarousel }) => productCarousel.history,
                history => {
                    const newHistory = {
                        ...window.history.state,
                        [CAROUSEL_HISTORY_STATE_KEY]: history
                    };
                    window.history.replaceState(newHistory, '');
                });

            // then update state with browser history if it exists
            const carouselHistory = window.history?.state?.[CAROUSEL_HISTORY_STATE_KEY] || [];
            commit('SET_HISTORY', carouselHistory);

            storeReady = true;
        }
    },
    setHistoryItem({ commit, state }, { id, index }) {
        commit('SET_UID_MAP_ITEM', { [id]: carouselIncrement });

        const finalIndex = state.history[carouselIncrement] || index;
        commit('SET_HISTORY_ITEM', { id, index: finalIndex });

        carouselIncrement++;
    }
};

const getters = {
    getHistoryIndex: () => id => {
        const index = state.uidMap[id];
        return state.history[index] || null;
    }
};

const mutations = {
    SET_HISTORY(state, history) {
        if(Array.isArray(history)) {
            state.history = history;
        }
    },
    SET_HISTORY_ITEM(state, { id, index }) {
        const history = [ ...state.history ];
        const itemIndex = state.uidMap[id];
        history[itemIndex] = index;
        state.history = history;
    },
    SET_UID_MAP_ITEM(state, item) {
        const uidMap = {
            ...state.uidMap,
            ...item
        };
        state.uidMap = uidMap;
    },
    UPDATE_HISTORY_ITEM(state, { id, index }) {
        const itemIndex = state.uidMap[id];
        if(typeof itemIndex === 'number') {
            const history = [ ...state.history ];
            history[itemIndex] = index;
            state.history = history;
        }
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

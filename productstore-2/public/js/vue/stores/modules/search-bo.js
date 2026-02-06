import suggestions from '@api/routes/search/suggestions';

const namespaced = true;

const state = {
    isLoading: false,
    suggestions: []
};

const actions = {
    async getSuggestion({ commit }, params) {
        const paramTerm = encodeURIComponent(params.term);
        const paramCulture = params.culture;
        const paramAddress = params.address;
        const paramChannelId = params.channelid;
        const useProductAutoSuggest = params.product;
        const url = window.location.hostname;

        commit('SET_LOADING', true);

        // If pass an address and it's not localhost
        if(paramAddress && url !== 'localhost') {
            let url;
            if(useProductAutoSuggest) {
                url = `${paramAddress}/search/suggestions/products?searchTerm=${paramTerm}&culture=${paramCulture}&channelid=${paramChannelId}`;
            } else {
                url = `${paramAddress}/search/suggestions?searchTerm=${paramTerm}&culture=${paramCulture}&channelid=${paramChannelId}`;
            }

            // Set request config
            const config = {
                method: 'GET'
            };

            fetch(url, config)
                .then(async response => {
                    const _data = await response.json();
                    if(_data) {
                        if(paramTerm) {
                            // Regular Search
                            commit('SET_LOADING', false);
                            if(useProductAutoSuggest) {
                                commit('UPDATE_SUGGESTION', {commit, _data: _data.products});
                            } else {
                                commit('UPDATE_SUGGESTION', {commit, _data});
                            }
                        }
                    }
                })
                .catch(error => {
                    console.log('error= ', error);
                });
        } else {
            // get from Mirage
            const response = await suggestions.query({ term: paramTerm, culture: paramCulture, channelid: paramChannelId });

            if(response.success && response.data) {
                let _data = response.data;

                if(paramTerm) {
                    // Regular Search
                    commit('SET_LOADING', false);
                    if(useProductAutoSuggest) {
                        commit('UPDATE_SUGGESTION', {commit, _data: _data.products});
                    } else {
                        commit('UPDATE_SUGGESTION', {commit, _data});
                    }
                }
            }
        }
    },

    clearStoreSearch({ commit }) {
        commit('CLEAR_SEARCH', true);
    }
};

const getters = {};

const mutations = {
    UPDATE_SUGGESTION(state, payload) {
        const newData = payload._data;
        state.suggestions = newData.slice(0, 10);
    },

    SET_LOADING(state, loading) {
        state.isLoading = loading;
    },

    CLEAR_SEARCH(state) {
        state.suggestions = [];
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

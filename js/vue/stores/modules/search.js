import suggestions from '@api/routes/search/suggestions';
import topProducts from '@api/routes/search/v2/products/topproducts';

const namespaced = true;

const state = {
    isLoading: false,
    isLoadingTopProd: false,
    isPopularTerm: false,
    popularSearch: [],
    suggestions: [],
    topProducts: []
};

const actions = {
    async getSuggestion({ commit }, params) {
        const paramTerm = params.term ? encodeURIComponent(params.term) : '';
        const paramCulture = params.culture;
        const paramAddress = params.address;
        const useProductAutoSuggest = params.product;
        const url = window.location.hostname;

        commit('SET_LOADING', true);

        // If pass an address
        if(paramAddress && url !== 'localhost') {
            let url;
            if(useProductAutoSuggest) {
                url = `${paramAddress}/search/suggestions/products?searchTerm=${paramTerm}&culture=${paramCulture}`;
            } else {
                url = `${paramAddress}/search/suggestions?searchTerm=${paramTerm}&culture=${paramCulture}`;
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
                        } else {
                            // Popular Search
                            if(!this.popularSearch?.length) {
                                if(useProductAutoSuggest) {
                                    commit('UPDATE_POPULAR_TERMS', {commit, _data: _data.products});
                                } else {
                                    commit('UPDATE_POPULAR_TERMS', {commit, _data});
                                }
                            }
                        }
                    }
                })
                .catch(error => {
                    console.log('error= ', error);
                });
        } else {
            // get from Mirage
            const response = await suggestions.query({ term: paramTerm, culture: paramCulture });

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
                } else {
                    // Popular Search
                    if(!this.popularSearch?.length) {
                        if(useProductAutoSuggest) {
                            commit('UPDATE_POPULAR_TERMS', {commit, _data: _data.products});
                        } else {
                            commit('UPDATE_POPULAR_TERMS', {commit, _data});
                        }
                    }
                }
            }
        }
    },

    async getTopResults({ commit, getters }, params) {
        const paramTerm = params.searchterm;
        const paramCategory = params.category?.name;
        const paramCategoryId = params.category?.categoryId;
        const paramCulture = params.culture;
        const paramAddress = params.address;
        const url = window.location.hostname;
        const isAuth = getters.getUserFlags?.IsAuthenticated;

        commit('SET_LOADING_TOP_PROD', true);

        // If pass an address
        if(paramAddress && url !== 'localhost') {
            const url = `${paramAddress}/search/v2/products/topproducts?searchTerm=${paramTerm}&categoryId=${paramCategoryId}&culture=${paramCulture}&isAuthenticated=${isAuth}`;

            // Set request config
            const config = {
                method: 'GET'
            };

            fetch(url, config)
                .then(async response => {
                    const _data = await response.json();
                    if(_data) {
                        commit('SET_LOADING_TOP_PROD', false);
                        commit('UPDATE_TOP_PRODUCTS', _data);
                    }
                })
                .catch(error => {
                    console.log('error= ', error);
                    commit('SET_LOADING_TOP_PROD', false);
                    commit('UPDATE_TOP_PRODUCTS', []);
                });
        } else {
            // Get from Mirage
            const response = await topProducts.query({
                searchTerm: paramTerm,
                category: paramCategory,
                culture: paramCulture,
                isAuthenticated: isAuth
            });

            if(response.success && response.data) {
                let _data = response.data;
                commit('SET_LOADING_TOP_PROD', false);
                commit('UPDATE_TOP_PRODUCTS', _data);
            }
        }
    },

    clearStoreSearch({ commit }) {
        commit('CLEAR_SEARCH', true);
    },

    setSuggestionPopular({ commit }) {
        commit('CHANGE_SUGGESTION');
    }
};

const getters = {
};

const mutations = {
    CHANGE_SUGGESTION() {
        state.suggestions = state.popularSearch;
        state.isPopularTerm = true;
    },
    UPDATE_SUGGESTION(state, payload) {
        const newData = payload._data;
        state.suggestions = newData.slice(0, 10);
        state.isPopularTerm = false;
    },

    UPDATE_POPULAR_TERMS(state, payload) {
        const newData = payload._data.slice(0, 10);
        if(newData.length >= 5) {
            state.popularSearch = newData;
            state.suggestions = newData;
        }
    },

    UPDATE_TOP_PRODUCTS(state, payload) {
        const newData = payload.results;
        state.topProducts = [];
        // Get only the innerData
        if(newData) {
            newData.map((item) => {
                if(item.innerData) state.topProducts.push(item.innerData);
            });
        }
    },

    SET_LOADING(state, loading) {
        state.isLoading = loading;
    },

    SET_LOADING_TOP_PROD(state, loading) {
        state.isLoadingTopProd = loading;
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

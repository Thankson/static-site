import api from '@api/routes/magazines/categorylist';

const namespaced = true;

const state = {
    searchParams: {
        categoryItemId: ''
    },
    paging: {
        pageNumber: 1,
        pageSize: 10,
        totalResult: 0
    },
    loading: false,
    items: []
};

const mutations = {
    SET_SEARCH_PARAMS(state, payload) {
        state.searchParams = payload;
    },
    UPDATE_SEARCH_PARAMS(state, payload) {
        state.searchParams = {
            ...state.searchParams,
            ...payload
        };
    },
    SET_PAGING(state, payload) {
        state.paging = payload;
    },
    SET_LOADING(state, loading) {
        state.loading = loading;
    },
    SET_ITEMS(state, payload) {
        state.items = payload;
    }
};

const actions = {
    async getData({ state, commit }, customParams) {
        if(state.loading) return;

        commit('SET_LOADING', true);
        const response = await api.query({
            pageNumber: state.paging.pageNumber,
            ...state.searchParams,
            ...customParams
        });
        if(response.success && response.data.Success) {
            const apiResults = response.data?.Data?.ArticleList || [];
            // update page info
            commit('SET_PAGING', {
                ...state.paging,
                pageNumber: response.data?.Data?.PageNumber,
                pageSize: response.data?.Data?.PageSize,
                totalResult: response.data?.Data?.TotalResult
            });
            // update search result
            if(state.paging.pageNumber === 1) {
                commit('SET_ITEMS', apiResults);
            } else {
                commit('SET_ITEMS', [...state.items, ...apiResults]);
            }
        }
        commit('SET_LOADING', false);
    }
};

export default {
    namespaced,
    state,
    mutations,
    actions
};

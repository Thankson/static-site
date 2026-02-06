import api from '@api/routes/bogo';

const namespaced = true;

const state = {
    isLoaded: false,
    hasBogoInCart: false,
    productList: []
};

const actions = {
    async getData({ commit }) {
        const response = await api.get();

        if(response?.data?.Success) {
            const _data = response.data.Data;
            commit('CREATE_PRODUCT_LIST', {commit, _data});
            commit('CHECK_BOGO_IN_CART', {commit, _data});
            return response;
        } else {
            console.log('bogo error=> ', response);
        }
    }
};

const getters = {
    getRequiredPoints: (state) => (product) => {
        if(!product) return null;

        return product.ProductPointsRequired ||
               product.ProductTotalRequired ||
               null;
    }
};

const mutations = {
    CREATE_PRODUCT_LIST(state, payload) {
        state.isLoaded = true;
        state.productList = [];
        state.productList = payload._data.Cards;
    },
    CHECK_BOGO_IN_CART(state, payload) {
        state.hasBogoInCart = payload._data.HasBogoInCart;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

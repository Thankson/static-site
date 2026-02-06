import cartApi from '@api/routes/cart';

const namespaced = true;

const state = {
    souLoading: false,
    souFeatureOn: false,
    currentOffer: {},
    availableOffers: [],
    minimalMarketing: false
};

const actions = {
    async getCartSouData({ commit }) {
        commit('SET_SOU_LOADING', true);
        const response = await cartApi.get();

        if(response?.data?.Success) {
            const _data = response.data.Data;
            const freeShippingEnabled = _data.Summary?.FreeShippingEnabled;
            if(freeShippingEnabled) {
                commit('SET_SOU_FEATURE', freeShippingEnabled);
                commit('SET_CURRENT_OFFER', _data.Summary
                    ?.FreeShipping
                    ?.CurrentOffer ?? {});
                commit('SET_AVAILABLE_OFFERS', _data.Summary
                    ?.FreeShipping
                    ?.AvailableOffers ?? []);
            } else {
                commit('SET_SOU_FEATURE', _data.Summary?.ShippingOnUsEnabled);
                commit('SET_CURRENT_OFFER', _data.Summary
                    ?.ShippingOnUsRates
                    ?.CurrentOffer ?? {});
                commit('SET_AVAILABLE_OFFERS', _data.Summary
                    ?.ShippingOnUsRates
                    ?.AvailableOffers ?? []);
            }
        } else {
            console.log('cart related shipping on us error=> ', response);
        }
        commit('SET_SOU_LOADING', false);
        return response;
    },
    async getCartSummaryData({ commit }, summary) {
        commit('SET_MINIMAL_MARKETING_FEATURE', summary?.MinimalMarketingInRegion);
        const freeShippingEnabled = summary?.FreeShippingEnabled;
        if(freeShippingEnabled) {
            commit('SET_SOU_FEATURE', freeShippingEnabled);
            commit('SET_CURRENT_OFFER', summary
                ?.FreeShipping
                ?.CurrentOffer ?? {});
            commit('SET_AVAILABLE_OFFERS', summary
                ?.FreeShipping
                ?.AvailableOffers ?? []);
        } else {
            commit('SET_SOU_FEATURE', summary?.ShippingOnUsEnabled);
            commit('SET_CURRENT_OFFER', summary
                ?.ShippingOnUsRates
                ?.CurrentOffer ?? {});
            commit('SET_AVAILABLE_OFFERS', summary
                ?.ShippingOnUsRates
                ?.AvailableOffers ?? []);
        }
    }
};

const getters = {};

const mutations = {
    SET_SOU_LOADING(state, bool) {
        state.souLoading = bool;
    },
    SET_SOU_FEATURE(state, bool) {
        state.souFeatureOn = bool;
    },
    SET_CURRENT_OFFER(state, payload) {
        state.currentOffer = payload;
    },
    SET_AVAILABLE_OFFERS(state, payload) {
        state.availableOffers = payload;
    },
    SET_MINIMAL_MARKETING_FEATURE(state, payload) {
        state.minimalMarketing = payload;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

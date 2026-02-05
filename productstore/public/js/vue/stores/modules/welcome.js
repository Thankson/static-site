import Vue from 'vue';
import apiProducts from '@api/routes/welcome/products';

const eventBus = new Vue();

const namespaced = true;

const state = {
    hasWatchedVideo: false,
    products: [],
    videoBannerMounted: false
};

const actions = {
    async getProductData({ commit }) {
        const response = await apiProducts.get();
        if(response.success && response.data.Success) {
            commit('SET_PRODUCTS', response.data.Data);
        }
    },
    showVideoModal() {
        eventBus.$emit('showVideoModal');
    }
};

const getters = {
    onShowVideoModal: () => fn => {
        eventBus.$on('showVideoModal', fn);
    },
    showVideoModal(state) {
        return state.videoBannerMounted && !state.hasWatchedVideo;
    }
};

const mutations = {
    SET_HAS_WATCHED_VIDEO(state, value) {
        state.hasWatchedVideo = value;
    },
    SET_PRODUCTS(state, data) {
        state.products = data.map(product => {
            return {
                Accessories: product?.InnerData?.Data?.Accessories,
                Category: product?.InnerData?.Data?.Category,
                FamilyID: product?.InnerData?.Data?.FamilyID,
                ItemId: product?.InnerData?.Data?.ItemId,
                Image: product?.InnerData?.Data?.Image,
                Title: product?.InnerData?.Data?.Title,
                PdpLink: product?.InnerData?.Data?.PdpLink,
                PriceRange: product?.InnerData?.Data?.PriceRange
            };
        });
    },
    SET_VIDEO_BANNER_MOUNTED(state, value) {
        state.videoBannerMounted = value;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

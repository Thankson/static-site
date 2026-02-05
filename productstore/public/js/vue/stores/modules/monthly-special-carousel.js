import api from '@api/routes/carousel/monthly-special-carousel';

const namespaced = true;

const state = {
    impressionsTitle: '',
    initCarousel: false,
    isLoaded: 0,
    pagesLoaded: [],
    storeCarousel: {},
    totalProdOnSlide: [],
    productCards: [],
    userFlags: {}
};

const actions = {
    async getData({ commit, dispatch }, {page, id, address}) {
        // Got problems? Reset.
        if(typeof page === 'undefined') page = 1;

        const response = await api.query({ carouselID: id, page });

        if(response.success && response.data) {
            // Build product card array for gtm impressions for first page only
            if(page === 1) {
                commit('PRODUCT_CARDS_DATA', response.data.slides);
                commit('ADD_IMPRESSIONS_TITLE', response.data.ImpressionsTitle);

                for (let [i, card] of state.productCards.entries()) {
                    const impressionItemData = {
                        sku: card.Sku,
                        title: card.Title,
                        position: i + 1,
                        list: this._vm.$gtmList
                    };

                    dispatch('gtm/addCardImpressions', { impressionItemData }, { root: true });
                }

                dispatch('gtm/pushImpressions', null, {root: true}); // GTM push product impressions
            }

            // Render slides regardless of sold-out api status
            const _data = { ...response.data, slides: response.data.slides };
            commit('UPDATE_PAGE_LOADED', { commit, page, _data });
            commit('CHECK_PAGES_LOADED', { commit, page, _data });
        }
    }
};

const getters = {
    totalPagesGet() {
        return state.storeCarousel.totalPages;
    },
    totalProdOnSlideGet() {
        return state.totalProdOnSlide;
    },
    totalProductsGlobalGet() {
        return state.storeCarousel.totalProductsGlobal;
    },
    totalSlidesGlobalGet() {
        return state.storeCarousel.totalSlidesGlobal;
    },
    slides() {
        return state.storeCarousel.slides;
    },
    storeCarouselGet() {
        return state.storeCarousel;
    },
    getProductCardData() {
        return state.productCards;
    }
};

const mutations = {
    CHECK_PAGES_LOADED(state, payload) {
        const _page = payload.page;
        const _data = payload._data;
        const _commit = payload.commit;
        const _slides = _data.slides;

        if(_page === 1) {
            _commit('INIT_STORE_CAROUSEL', _data);
        } else {
            const storeSlides = this.getters['monthlySpecialCarousel/slides'];

            // Add loaded slide to the State.
            _slides.map((element, index) => {
                storeSlides.splice(((_page - 1) * 3) + index, 1, element);
            });
        }
    },

    ADD_TOTAL_PROD_ON_SLIDE(state, slides) {
        for (let i = 0; i <= slides.length; i++) {
            if(slides[i]) {
                const totalProd = slides[i]['products'].length;
                state.totalProdOnSlide.push(totalProd);
            }
        }
    },

    ADD_IMPRESSIONS_TITLE(state, payload) {
        state.impressionsTitle = payload;
    },

    PRODUCT_CARDS_DATA(state, slides) {
        let productData = [];

        slides.forEach(slide => {
            slide.products.forEach(product => {
                productData.push(product);
            });
        });

        state.productCards = productData;
    },

    STORE_CAROUSEL_SET(state, payload) {
        state.storeCarousel = payload;
    },

    INIT_STORE_CAROUSEL(state, payload) {
        if(!state.initCarousel) {
            state.storeCarousel = payload;
            const totalSlides = payload.totalSlidesGlobal - 3; // we have 3 slides already
            const slidesLoaded = payload.slides;
            const template = {};
            const storeSlides = this.getters['monthlySpecialCarousel/slides'];

            for (let i = 0; i <= totalSlides - 1; i++) {
                // Fill with template slides
                storeSlides.push(template);
            }

            state.initCarousel = true;

            // isLoaded confirmation
            const objLength = Object.keys(slidesLoaded).length;
            state.isLoaded = objLength;

            // User flags
            state.userFlags = payload.userFlags;
        }
    },

    UPDATE_PAGE_LOADED(state, payload) {
        const pageLoaded = payload.page;
        state.pagesLoaded.push(pageLoaded);

        // Add total products of each slide
        const _commit = payload.commit;
        const _data = payload._data;
        const _slides = _data.slides;
        _commit('ADD_TOTAL_PROD_ON_SLIDE', _slides);
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

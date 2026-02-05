import ApiService from '@api/api-service';

const api = new ApiService();

const parser = new DOMParser();

// load as string to prevent Node object from updating to match Vue rendering
const preloadedDoc = moveIngredientsImage(document.documentElement.innerHTML);

function getLocalization() {
    const scriptEl = document.getElementById('data-configurator-pdp');
    if(scriptEl) {
        return JSON.parse(scriptEl.innerHTML);
    }
}

function hideIngredientsImage() {
    const localization = getLocalization();
    let match = document.querySelector('.o-widthControl > img[src*="product-labels"]');

    // If it's PDP
    if(localization && match) {
        match = match.parentNode;

        if(!localization.Data?.UserFlags?.IsAuthenticated) {
            // If the user is NOT authenticated, then hide the image and its parent
            match.classList.add('hidden');
        } else {
            // If the user is authenticated, then show the image and its parent
            match.classList.remove('hidden');
        }
    }
}

function moveIngredientsImage(response) {
    if(typeof response !== 'string') {
        return null;
    }
    const localization = getLocalization();
    const doc = parser.parseFromString(response, 'text/html');

    // query for all possible matchs for a nutrition facts rte
    const query = '.o-widthControl > img[src*="product-labels"]';
    let match = doc.querySelector(query);

    if(match) {
        // match is current just the image, so redefine matching img element to include the wrapper div
        match = match.parentNode;

        // if there is a match, get the ingredients product-dynamic-section component
        const ingredients = doc.querySelector('product-dynamic-section[section-name="ingredients"]');

        // // if there is a match, we need to remove any possible placeholder text in the ingredients section
        const placeholder = ingredients?.querySelector('[data-pdp-placeholder="ingredients"]');
        if(placeholder) {
            placeholder.remove();
        }

        if(ingredients) {
            // remove match from document to be cached
            match.remove();
            // also remove from current DOM if it exists
            document.documentElement.querySelector(query)?.parentNode?.remove(); // eslint-disable-line
            // append match rte inside the ingredients section
            ingredients.append(match);
        }

        // If it's PDP
        if(localization) {
            if(!localization.Data?.UserFlags?.IsAuthenticated) {
                // If the user is NOT authenticated, then hide the image and its parent
                match.classList.add('hidden');
            } else {
                // If the user is authenticated, then show the image and its parent
                match.classList.remove('hidden');
            }
        }
    }

    return doc;
}

const namespaced = true;

const state = {
    /**
     * @typedef {{ sku: string, name: string, url: string }} product
     * @type {product}
     */
    product: {},
    pdpHtmlCache: {},
    initUrl: null
};

const actions = {
    /**
     * load pdp html if it's not ready in pdpHtmlCache
     * @param {string} url new url to show html for
     */
    async getPdpHtml({ commit, state }, product) {
        if(!state.loading) {
            commit('mainSpinner/SET_LOADING', true, { root: true });
        }

        api.setRoute(product.url);
        const response = await api.get();
        if(response.success) {
            commit('SET_PDP_HTML_CACHE', { url: product.url, html: moveIngredientsImage(response.data) });
        }
        /** set the product regardless if response is successful, need initial product data */
        commit('SET_PRODUCT', product);
        if(!response.cancelled) {
            commit('mainSpinner/SET_LOADING', false, { root: true });
        }
    },
    refreshModules() {
        window.refreshPeakCarousel && window.refreshPeakCarousel();
        window.refreshMelaPlayer && window.refreshMelaPlayer();
        window.refreshVideoModal && window.refreshVideoModal();
        window.refreshProdMedia && window.refreshProdMedia();
        window.refreshProductCarousel && window.refreshProductCarousel();
        window.refreshAccordionModule && window.refreshAccordionModule();
    },
    /**
     * set active product for newly selected pdp page
     * - if html is cached, don't load again and set url as active
     * - if html is NOT cached, get pdp html w/ ajax
     * @param {string} url new url to show html for
     */
    async setProduct({ commit, dispatch }, product) {
        if(state.loading) {
            api.cancel();
        }

        if(state.initUrl) {
            if(state.pdpHtmlCache[product.url]) {
                commit('SET_PRODUCT', product);
                commit('mainSpinner/SET_LOADING', false, { root: true });
            } else {
                await dispatch('getPdpHtml', product);
            }
        } else {
            commit('SET_INIT_CACHE', product.url);
            commit('SET_PRODUCT', product);
        }
        hideIngredientsImage();
    }
};

const getters = {
    pdpHtml() {
        return state.pdpHtmlCache[state.product.url];
    }
};

const mutations = {
    SET_PRODUCT(state, product) {
        state.product = product;
    },
    SET_PDP_HTML_CACHE(state, { url, html }) {
        let pdpHtmlCache = { ...state.pdpHtmlCache };
        pdpHtmlCache[url] = html;
        state.pdpHtmlCache = pdpHtmlCache;
    },
    SET_INIT_CACHE(state, url) {
        state.initUrl = url;
        let pdpHtmlCache = { ...state.pdpHtml };
        if(!pdpHtmlCache[state.initUrl]) {
            pdpHtmlCache[state.initUrl] = '';
        }
        pdpHtmlCache[state.initUrl] = preloadedDoc;
        state.pdpHtmlCache = pdpHtmlCache;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

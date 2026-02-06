const namespaced = true;

const state = {
    createdCount: 0,
    mountedCount: 0,
    productCards: [],
    prodCardCount: 0,
    gtmImpressions: { // dl = dataLayer
        'event': 'impressions',
        'ecommerce': {
            'currencyCode': '',
            'impressions': []
        }
    }
};

const actions = {
    async addCardImpressions({ commit }, { sku, title, price, brand, category, variant, list, position, dimension1 }) {
        // On Parent mount, get card data and push to array
        if(!sku) {
            return;
        }
        const impression = {
            id: `${sku}`,
            name: title,
            price: price || '',
            brand: brand || '',
            category: category || '',
            variant: variant || '',
            list: list || '',
            position: position || '',
            dimension1: dimension1 || ''
        };
        commit('ADD_PRODUCT_CARD', impression);
    },
    async pushImpressions({ commit }, doNotCount) {
        let dnc = doNotCount || false;
        commit('INCREMENT_MOUNTED');

        if(!dnc && state.createdCount === state.mountedCount) {
            commit('ECOM_CARD_IMPRESSIONS', state.productCards);
            window.dataLayer && window.dataLayer.push(state.gtmImpressions);

            console.log(
                '%c -- GTM STORE FINAL STATE -- ',
                'background-color:pink; color:black; border-radius: 2px;',
                state
            );
        } else if(dnc) {
            // For instances were we do not need to count components/cards
            // to do a full clean data layer push
            commit('ECOM_CARD_IMPRESSIONS', state.productCards);
            window.dataLayer && window.dataLayer.push(state.gtmImpressions);

            console.log(
                '%c -- GTM STORE FINAL STATE (no count)-- ',
                'background-color:pink; color:black; border-radius: 2px;',
                state
            );
        }
    }
};

const getters = {
    checkProdCardCount() {
        return state.prodCardCount;
    },
    checkCreated() {
        return state.createdCount;
    },
    checkMounted() {
        return state.mountedCount;
    }
};

const mutations = {
    ADD_PRODUCT_CARD(state, impression) {
        state.productCards.push(impression);
    },
    INCREMENT_PROD_CARD(state) {
        state.prodCardCount++;
    },
    DECREMENT_CREATED(state) {
        state.createdCount--;
    },
    DECREMENT_MOUNTED(state) {
        state.mountedCount--;
    },
    INCREMENT_CREATED(state) {
        state.createdCount++;
    },
    INCREMENT_MOUNTED(state) {
        state.mountedCount++;
    },
    ECOM_CARD_IMPRESSIONS(state, impressions) {
        state.gtmImpressions.ecommerce.currencyCode = this._vm.$env?.CurrencyCode;
        state.gtmImpressions.ecommerce.impressions = impressions;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

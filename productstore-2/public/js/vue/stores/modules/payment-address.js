import api from '@api/routes/customeraccount/paymethods';
import apiDefault from '@api/routes/customeraccount/paymethods/default';
import * as paymentMethodsUtil from '../../utils/payment-methods';

const namespaced = true;
const state = {
    creditInfo: [],
    defaultProductCard: '',
    apiLoading: false,
    apiError: false,
    showDefaultError: false,
    errorDefaultCardReasons: []
};

const actions = {
    setRoute({ commit }, { apiEndpoint }) {
        api.setRoute(apiEndpoint);
    },

    async fetchCreditInfo({ commit }, params) {
        commit('SET_API_LOADING', true);
        const response = await api.query(params);
        commit('SET_API_LOADING', false);
        if(response.success && response.data?.Success) {
            let _data = response.data?.Data;
            commit('UPDATE_CREDITINFO', { commit, _data });
        } else if(!response.data?.Success) {
            commit('API_ERROR', true);
        }
    },
    async setDefaultCard({ commit }, { paymentId, hasProdServ, otherDefaults, source, customerId }) {
        commit('SET_API_LOADING', true);

        let defaultType = paymentMethodsUtil.defaultPaymentTypes.products;
        let _source = source || '';

        if(hasProdServ) {
            defaultType = defaultType + ',' + paymentMethodsUtil.defaultPaymentTypes.services;
        }

        if(otherDefaults && otherDefaults.length) {
            defaultType = defaultType + ',' + otherDefaults.join(',');
        }

        const customerIdQuery = customerId ? '&customerId=' + customerId : '';

        // Set endpoint
        apiDefault.setRoute('/api/customeraccount/paymethods/default?payMethodId=' + paymentId + '&payMethodDefaultType=' + defaultType + customerIdQuery);

        const response = await apiDefault.post();
        // If source is empty then mutate data done for credit-card-ads.vue
        if(_source === '') {
            if(response.data.Success) {
                commit('SET_DEFAULTCARD', {commit, paymentId, defaultType});
            } else {
                commit('ERROR_DEFAULTCARD', {commit, errorDefaultCardReasons: response.data?.ErrorMessages});
            }
        }

        commit('SET_API_LOADING', false);

        return response;
    },
    async setDefaultCardSimple({ commit }, {paymentId, existingDefaults, defaultToAdd }) {
        commit('SET_API_LOADING', true);
        const defaultsTemp = [defaultToAdd, ...existingDefaults];
        const defaults = [...new Set(defaultsTemp)].join(',');

        // Set endpoint
        apiDefault.setRoute(`/api/customeraccount/paymethods/default?payMethodId=${paymentId}&payMethodDefaultType=${defaults}`);
        const response = await apiDefault.post();

        commit('SET_API_LOADING', false);
        return response;
    },
    async deletePaymentMethod({ commit }, params) {
        commit('SET_API_LOADING', true);

        const response = await api.delete({
            PayMethodId: params
        });

        if(response.data.Success) {
            commit('DELETE_PAYMENTMETHOD', params);
        }

        commit('SET_API_LOADING', false);
    }
};

const getters = {
    creditInfo: state => state.creditInfo,
    defaultProductCard: state => state.defaultProductCard,
    apiLoading: state => state.apiLoading,
    apiError: state => state.apiError
};

const mutations = {
    SET_API_LOADING(state, loading) {
        state.apiLoading = loading;
    },
    DELETE_PAYMENTMETHOD(state, paymentId) {
        let removePaymentArray = state.creditInfo;
        const removedPayment = removePaymentArray.findIndex(removePaymentArray => removePaymentArray.PayMethodId === paymentId);
        removePaymentArray.splice(removedPayment, 1);
        state.creditInfo = removePaymentArray;
    },
    CLOSE_ERROR_DEFAULT_CARD(state) {
        state.showDefaultError = false;
        state.errorDefaultCardReasons = [];
    },
    ERROR_DEFAULTCARD(state, {errorDefaultCardReasons}) {
        state.showDefaultError = true;
        state.errorDefaultCardReasons = errorDefaultCardReasons || [];
    },
    API_ERROR(state) {
        state.apiError = true;
    },
    SET_DEFAULTCARD(state, payload) {
        let setDefaultArray = state.creditInfo;
        const newDefaultType = payload.defaultType ? payload.defaultType.split(',') : [paymentMethodsUtil.defaultPaymentTypes.products];

        // Get ID of the OLD default payment
        const oldCard = setDefaultArray.findIndex(setDefaultArray => setDefaultArray.PayMethodId === state.defaultProductCard.PayMethodId);

        if(setDefaultArray[oldCard]) {
            // Put the OLD default payment at the LAST array position
            let removedOldCard = setDefaultArray.splice(oldCard, 1);
            let newDefaults = [];

            // Set the default types for the OLD default payment
            if(removedOldCard[0].PayMethodDefaults.length) {
                for (let defaultType of removedOldCard[0].PayMethodDefaults) {
                    // If the default type is different from Products and Services, keep it
                    if(!paymentMethodsUtil.isProductsDefault(defaultType) && !paymentMethodsUtil.isServicesDefault(defaultType)) {
                        newDefaults.push(defaultType);
                    }
                }
            }

            removedOldCard[0].PayMethodDefaults = newDefaults;
            setDefaultArray.push(removedOldCard[0]);
        }

        // Get ID of the NEW default payment
        const newCard = setDefaultArray.findIndex(setDefaultArray => setDefaultArray.PayMethodId === payload.paymentId);

        // Put the NEW default payment at the FIRST array position
        let removedNewCard = setDefaultArray.splice(newCard, 1);

        // Set the default types for the NEW default payment
        removedNewCard[0].PayMethodDefaults = newDefaultType;
        setDefaultArray.unshift(removedNewCard[0]);

        // Update default payment state
        state.defaultProductCard = setDefaultArray[0];

        // Update payment list state
        state.creditInfo = setDefaultArray;
    },
    UPDATE_CREDITINFO(state, payload) {
        const _data = payload._data || [];
        let dataByPayMethod = [];
        let _defaultProductCard = '';

        for (var p = 0; p < _data.length; p++) {
            const payMethod = _data[p];
            const payMethodDefaults = payMethod.PayMethodDefaults;

            const hasProducts = paymentMethodsUtil.isProductsDefault(payMethodDefaults) && !paymentMethodsUtil.isServicesDefault(payMethodDefaults);
            const hasServices = !paymentMethodsUtil.isProductsDefault(payMethodDefaults) && paymentMethodsUtil.isServicesDefault(payMethodDefaults);
            const hasProductsServices = paymentMethodsUtil.isProductsDefault(payMethodDefaults) && paymentMethodsUtil.isServicesDefault(payMethodDefaults);
            const hasBackupOrder = paymentMethodsUtil.isBackupOrderDefault(payMethodDefaults);
            const hasHomeSecurity = paymentMethodsUtil.isHomeSecurityDefault(payMethodDefaults);
            const hasRiverbend = paymentMethodsUtil.isRiverbendDefault(payMethodDefaults);
            const empty = payMethodDefaults.length === 0;

            if(hasProducts) {
                dataByPayMethod.splice(0, 0, payMethod);
                _defaultProductCard = payMethod;
            } else if(hasServices || hasProductsServices) {
                dataByPayMethod.splice(0, 0, payMethod);
                _defaultProductCard = payMethod;
            } else if(hasBackupOrder || hasHomeSecurity || hasRiverbend || empty) {
                dataByPayMethod.push(payMethod);
            }
        }

        state.defaultProductCard = _defaultProductCard;
        state.creditInfo = dataByPayMethod;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

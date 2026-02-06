import apiSitecore from '@api/routes/customeraccount/paymethods';
import apiCheckoutPayMethods from '@api/routes/customeraccount/checkout/paymethods';
import apiCheckoutPayMethodsCn from '@api/routes/customeraccount/checkout/paymethodscn';
import clientToken from '@api/routes/checkout/clienttoken';
import apiSitecoreBanks from '@api/routes/customeraccount/paymethods/banks';
import apiSitecoreRefresh from '@api/routes/customeraccount/paymethods/refresh';
import apiSitecoreCountry from '@api/routes/customeraccount/paymethods/getavailablepaymethods';
import apiShippingAddress from '@api/routes/customeraccount/addresses';
import getDevice from '../../utils/get-device';
import * as paymentFormErrors from '../../utils/payment-form-errors';
import cardNumber from '@common/source/js/vue/utils/card-number';

import apiSaveCC from '@api/routes/paymethod/1.0/creditcard';
import apiGuestCustomer from '@api/routes/paymethod/creditcard/guestcustomer';
import apiSaveChecking from '@api/routes/paymethod/1.0/automatedclearinghouse';

import { isRiverbendDefault } from '../../utils/payment-methods';
import isFirstTimeUser from '@api/routes/customeraccount/paymethods/firstTimeUser';

const namespaced = true;

const state = {
    paypalClientToken: '',
    storedPayMethods: [],
    storedPayMethod: {},
    shiftedPayMethod: {},
    storedPayInfo: {},
    storedFEError: [],
    storedApiError: [],
    storedApiErrorFields: [],
    storedApiErrorTypes: [],
    storedApiLoading: false,
    storedApiCheckoutLoaded: false,
    storedApiSuccess: false,
    storedBanks: [],
    storedCountryInfo: {},
    storedCountryInfoLoaded: false,
    storedDefaultAddress: {},
    storedExternalPayMethods: {},
    isCn: null,
    showPreAuthError: false,
    isFirstTimeUser: false,
    isGuestPayMethodUrl: false
};

const translateServicesError = (result, errorTranslations, commit, errors = []) => {
    const errorList = Array.isArray(errors) ? [ ...errors ] : [];
    const errorListTypes = [];
    if(result?.errorMessage === 'NonPersonalCardCanNotSetDefault') {
        commit('OPEN_PRE_AUTH_ERROR');
        return {
            errorList,
            errorListTypes
        };
    } else if(result?.errorMessage === paymentFormErrors.prePaidCard) {
        errorListTypes.push(result?.errorMessage);
    }
    if(errorTranslations) {
        // Set specific key translation
        // Need to account for various versions of this response schema. The rules for what returns a different schema are unclear.
        const respContent = result.OriginalResponseContent || result.originalResponseContent;
        const respContentKey = respContent?.ErrorMessage || respContent?.errorMessage;
        const errorMsgKey = result.messageType || result.errorMessage;
        const key = errorMsgKey || respContentKey;

        // Search for specific key translation
        const found = errorTranslations.find(translation => translation.Error === key);

        // If there's a specific key translation on Sitecore and Services
        if(found && found.Translation) {
            errorList.push(found.Translation);
            errorListTypes.push(found.Error);
        } else {
            // Search for 'Default' translation
            const defaultError = errorTranslations.find(translation => translation.Error === 'Default');

            // If there's a 'Default' translation on Sitecore and Services
            if(defaultError && defaultError.Translation) {
                errorList.push(defaultError.Translation);
                errorListTypes.push(defaultError.Error);
            }
        }
    }
    return {
        errorList,
        errorListTypes
    };
};

const actions = {
    // Get country information
    async getCountryInfo({ commit }, { country, customerId }) {
        let loading = true;
        let error = [];
        const fields = [];

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        // If it's development then simulate a country
        const payload = process.env.NODE_ENV === 'development' ? {
            country: country || 'UnitedStates',
            customerId
        } : null;

        const response = payload ? await apiSitecoreCountry.query(payload) : await apiSitecoreCountry.get();

        if(response.success && response.data?.Success) {
            const info = response.data.Data;

            if(country === 'Korea') {
                // if Korea, we need to manually add KR card brands
                const ccIndex = info?.PayMethods.findIndex((method) => method.Paymethod === 'CreditCard');
                if(ccIndex > -1) {
                    info.PayMethods[ccIndex]?.Options.push({ Name: cardNumber.cardBrands.all });
                }
            }

            commit('SET_COUNTRY_INFO', {commit, info});
            commit('SET_COUNTRY_INFO_LOADED');
        } else {
            // Extract error from Sitecore API
            if(response.data?.ErrorMessages) {
                error = response.data.ErrorMessages[0] ? ['[GetCountryInfo] ' + response.data.ErrorMessages[0].Translation] : response.data.ErrorMessages;
            }
        }

        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', {commit, loading});
    },
    async getCheckoutPayMethod({ commit }, params) {
        let loading = true;
        let error = [];
        const fields = [];
        const customerId = params?.customerId;

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        let response = await apiCheckoutPayMethods.get(`?includeOneTimeUse=true${customerId ? `&customerId=` + customerId : ''}`);

        if(response.success) {
            let paymentMethods = [];

            paymentMethods = response.data?.Data || [];

            commit('SET_PAYMENT_METHODS', {commit, paymentMethods});
        } else {
            if(response.error) {
                error = [response.error];
            }
        }

        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', {commit, loading});
    },

    // Get all customer pay methods from Sitecore API
    async getPayMethods({ commit }, payload) {
        let loading = true;
        let error = [];
        const fields = [];
        const { checkout } = payload || false;
        const { owingBalance } = payload || false;
        const { country } = payload || '';

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        if(checkout) {
            commit('SET_CHECKOUT_LOADED', false);
        }

        // Get data from Sitecore API
        let response = null;
        if(state.isCn) {
            response = await (checkout ? apiCheckoutPayMethodsCn.get('?channel=' + getDevice()) : apiSitecore.get());
            // The comment below only for mock data in patten lab
            // response = await (checkout ? apiCheckoutPayMethodsCn.get('?channel=' + getDevice()) : apiSitecore.query({isCn: true}));
        } else {
            let params = {};

            // PatternLab Only
            if(process?.env?.NODE_ENV === 'development' && payload?.customerId) {
                params.customerId = payload.customerId;
            }
            response = await (checkout ? apiCheckoutPayMethods.get(`?includeOneTimeUse=true${owingBalance ? `&customerId=${payload?.customerId}&country=${country}` : ''}`) : apiSitecore.query(params));
        }
        if(response.success) {
            let paymentMethods = [];

            paymentMethods = response.data?.Data || [];
            paymentMethods = owingBalance ? paymentMethods.filter(method => method.CanBeUsedForOwingBalance > 0) : paymentMethods;
            commit('SET_PAYMENT_METHODS', {commit, paymentMethods});
        } else {
            if(response.error) {
                error = [response.error];
            }
        }

        if(checkout) {
            commit('SET_CHECKOUT_LOADED', true);
        }

        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', {commit, loading});
    },

    async getPayPalClientToken({ commit }, params) {
        let loading = true;
        let error = [];
        const fields = [];
        const customerId = params?.customerId;

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        let response = await clientToken.get(customerId ? '?customerId=' + customerId : '');

        if(response?.data?.Success) {
            commit('SET_PAYPAL_TOKEN', response.data?.Data);
        } else {
            // Extract error from Sitecore API
            if(response.data?.ErrorMessages) {
                error = response.data.ErrorMessages[0] ? response.data.ErrorMessages[0].Translation : response.data.ErrorMessages;
            }
        }
        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', {commit, loading});
    },

    async getRiverbendPayMethod({commit, getters}, {customerId, ignoreCache} = {customerId: null, ignoreCache: false}) {
        let loading = true;
        let error = [];
        const fields = [];

        // Enable loading
        commit('SET_API_LOADING', {commit, getters, loading});

        // Get data from Sitecore API
        let response = null;
        let params = {ignoreCache};

        // PatternLab Only
        if(process?.env?.NODE_ENV === 'development' && customerId) {
            params.customerId = customerId;
        }

        response = await apiSitecore.query(params);
        if(response.success) {
            let paymentMethods = [];

            paymentMethods = response.data?.Data || [];

            commit('SET_PAYMENT_METHODS', {commit, paymentMethods});

            const paymentMethod = getters.riverbendDefaultMethod;
            if(paymentMethod) {
                commit('SET_PAYMENT_METHOD', {commit, paymentMethod});
            }
        } else {
            if(response.error) {
                error = [response.error];
            }
        }

        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', {commit, loading});
    },
    // Get pay method by ID (filter on Sitecore API stored result)
    async getPayMethod({ commit }, { customerId, paymentId }) {
        let paymentMethod = {};

        // Filter by paymentID and customerId
        if(state.storedPayMethods && state.storedPayMethods.length) {
            paymentMethod = state.storedPayMethods.find(pay => {
                return pay.PayMethodId === paymentId && pay.CustomerId === customerId;
            }) || {};
        }

        // Set payment method data
        commit('SET_PAYMENT_METHOD', {commit, paymentMethod});
    },

    // Get all payment methods from Sitecore API used by CN
    async getExternalPayMethod({ commit }, params) {
        let loading = true;
        let error = [];
        const fields = [];

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        commit('SET_CHECKOUT_LOADED', false);

        // Get data from Sitecore API
        let response = null;

        response = await apiCheckoutPayMethodsCn.get(params.isReceipt ? '' : '?channel=' + getDevice());

        if(response.success) {
            const externalPaymentMethods = response.data;
            const payMethod = externalPaymentMethods.PayMethods.find((item) => {
                return item.IsDefault;
            });
            commit('SET_EXTERNAL_PAYMENT_METHODS', {commit, externalPaymentMethods});
            commit('checkout/SET_SELECTED_PAYMENT_METHOD_ID', payMethod ? payMethod.PayMethodId : externalPaymentMethods?.PayMethods[1]?.PayMethodId, { root: true });
        } else {
            if(response.error) {
                error = [response.error];
            }
        }

        commit('SET_CHECKOUT_LOADED', true);

        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', {commit, loading});
    },

    // Create a pay method using Fetch API to ping Services API
    async savePayMethod({ commit, dispatch }, {
        isEditing,
        isCreditCard,
        isPayPal,
        customerId,
        bearerToken,
        country,
        payload,
        isCommissionDeposit,
        envService,
        errorTranslations,
        fromCheckout,
        isCustomerIdNeededInPayload }) {
        let url = null;
        let success = false;
        let result = {};
        let fields = [];
        let isClearingHouseUrl = false;
        const payMethodUrl = '/paymethod/1.0/paymethod/';
        const paypalPayMethodUrl = '/paymethod/v1/customers/';
        const payMethodGuestUrl = '/paymethod/v1/paymethod/';
        let payMethodUrlType = '/creditcard';
        let payMethodGuestUrlType = 'creditcard/guestcustomer';

        // Enable loading
        commit('SET_API_LOADING', {commit, loading: true});

        // Set request headers
        let requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + bearerToken);
        requestHeaders.append('Content-Type', 'application/json; charset=utf-8');

        // Set request config
        // If the user is editing an existing account (i.e. isEditing = true) then it should be a PUT request (to update the existing account
        // For Direct Debit, if it s a completely Direct Debit account (new bank and number) then it would be a POST. Only if the user is editing an existing Direct Debit account, then it should be a PUT.

        let config = {
            method: !isEditing ? 'POST' : 'PUT',
            headers: requestHeaders,
            body: JSON.stringify(payload)
        };

        // Define route to ADD (post)
        if(!isEditing && !isCreditCard && !isPayPal && !state.isCn) {
            // Define commission deposit URL & checking URL
            payMethodUrlType = '/automatedclearinghouse';
            payMethodGuestUrlType = 'automatedclearinghouse/guestcustomer';
            isClearingHouseUrl = true;
        }
        // Route for PayPal is different from credit card or checking
        if(isPayPal) {
            url = envService + paypalPayMethodUrl + customerId + '/paymethods?country=' + country;
        } else if(!state.isGuestPayMethodUrl) {
            url = envService + payMethodUrl + customerId + payMethodUrlType;
        } else {
            url = envService + payMethodGuestUrl + payMethodGuestUrlType;
        }

        // Post or put data
        if(process.env.NODE_ENV !== 'development') {
            await fetch(url, config)
                .then(async response => {
                    fields = [];
                    // Unlike other pay methods, there is no response for PayPal
                    if(!(isPayPal && isEditing)) {
                        result = await response?.json();
                    }
                    if(!response.ok) {
                        success = false;

                        // Translate services error messages
                        const servicesError = translateServicesError(result, errorTranslations, commit);

                        // Display API errors if they exist
                        commit('SET_API_ERROR', {
                            commit,
                            error: servicesError.errorList,
                            types: servicesError.errorListTypes,
                            fields
                        });

                        // NOT Success
                        commit('SET_API_SUCCESS', {commit, success});

                        // Set payment result
                        commit('SET_PAYMENT_INFO', {commit, result});
                    } else {
                        if((isClearingHouseUrl && !state.isGuestPayMethodUrl) || isPayPal) {
                            // Response for /automatedclearinghouse is different so result needs to be transformed to match /creditcard response
                            // this only applies for non-guest pay method response, for some reason
                            result = { payMethodId: result };
                        }

                        // log for higher env testing of first time user accounts
                        console.log('pay method saved - before refresh', result);

                        success = await dispatch('handleSuccess', {result, payload, fromCheckout, customerId: isCustomerIdNeededInPayload && customerId});
                    }
                })
                .catch(err => {
                    console.log('error', err);
                    success = false;
                    fields = [];
                    result = {};
                    const servicesError = translateServicesError(result, errorTranslations, commit);

                    // Display API errors if they exist
                    commit('SET_API_ERROR', {
                        commit,
                        error: servicesError.errorList,
                        types: servicesError.errorListTypes,
                        fields
                    });

                    // Not success
                    commit('SET_API_SUCCESS', {commit, success});

                    // Set payment result
                    commit('SET_PAYMENT_INFO', {commit, result});
                });
        } else {
            // thsi will be used just during development
            let response = {};
            if(isCreditCard || isPayPal) {
                if(config.method === 'POST') {
                    if(url.includes('creditcard/guestcustomer')) {
                        response = await apiGuestCustomer.post(config);
                    } else {
                        response = await apiSaveCC.post(config);
                    }
                } else {
                    response = await apiSaveCC.put(config);
                }
            } else {
                response = await apiSaveChecking.post(config);
            }

            const isAutomatedClearingHouse = payMethodUrlType === '/automatedclearinghouse';
            result = !isClearingHouseUrl || isAutomatedClearingHouse ? response.data : {
                payMethodId: response.data
            };
            if(response.success) {
                success = await dispatch('handleSuccess', {result, payload, fromCheckout, customerId: isCustomerIdNeededInPayload && customerId});
            } else {
                let fields = [];

                success = false;
                // Translate services error messages
                const servicesError = translateServicesError(result, errorTranslations, commit);

                // Display API errors if they exist
                commit('SET_API_ERROR', {
                    commit,
                    error: servicesError.errorList,
                    types: servicesError.errorListTypes,
                    fields
                });

                // NOT Success
                commit('SET_API_SUCCESS', {commit, success});

                // Set payment result
                commit('SET_PAYMENT_INFO', {commit, result});
            }
        }
        // Disable loading
        commit('SET_API_LOADING', {commit, loading: false});

        return {
            response: result,
            success
        };
    },
    async handleSuccess({commit, rootState}, {result, payload, fromCheckout, customerId}) {
        // Refresh Sitecore
        await apiSitecoreRefresh.post({
            payMethodId: result?.payMethodId,
            fromCheckout: fromCheckout,
            ...(customerId && {customerId})
        });
        // Set payment result
        result = {...result, ...payload};
        commit('SET_PAYMENT_INFO', {commit, result});

        // Clear API error
        let error = [];
        let fields = [];
        commit('SET_API_ERROR', {commit, error, fields});

        // Success
        let success = true;
        commit('SET_API_SUCCESS', {commit, success});
        return success;
    },
    shiftStoredPayMethodBack({commit}) {
        commit('SHIFT_STORED_PAY_METHOD_BACK');
    },
    shiftStoredPayMethodOff({commit}) {
        commit('SHIFT_STORED_PAY_METHOD_OFF');
    },
    // Delete pay method using id
    async deletePayMethod({ commit, state }, { payMethodId, customerId }) {
        commit('SET_API_LOADING', {loading: true});

        const payload = customerId
            ? { PayMethodId: payMethodId, CustomerId: customerId }
            : { PayMethodId: payMethodId };

        const response = await apiSitecore.delete(payload);

        if(response.data.Success) {
            console.log('deleted pay method:', payMethodId);
        } else {
            console.error('Error trying to delete pay method', response.data.Error);
        }
        commit('SET_API_LOADING', {loading: false});
    },
    // Get all banks from Sitecore API
    async getBanks({ commit }, country) {
        let loading = true;
        let error = [];
        const fields = [];

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        // Get data from Sitecore API
        let response;

        // Adding country condition for passing isVirtualAccountInstitution for Malaysia ONLY
        country === 'Malaysia' ? response = await apiSitecoreBanks.query({ country: country, isVirtualAccountInstitution: false }) : response = await apiSitecoreBanks.query({ country });

        if(response.success && response.data?.Success) {
            const banks = response.data.Data;
            commit('SET_BANKS', {commit, banks});
        } else {
            // Extract error from Sitecore API
            if(response.data?.ErrorMessages) {
                error = response.data.ErrorMessages[0] ? ['[GetBanks] ' + response.data.ErrorMessages[0].Translation] : response.data.ErrorMessages;
            }
        }

        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});

        // Disable loading
        loading = false;
        commit('SET_API_LOADING', {commit, loading});
    },
    // Get default Shipping Address
    async getDefaultAddress({ commit, rootState }, addressType = 'shippingAddress') {
        if(rootState.riverbendSubscription.isGuestEnrollment) return;
        let addresses = [];
        const response = await apiShippingAddress.query({ addressType });

        if(response.success && response.data?.Data) {
            addresses = response.data?.Data;
        }

        // Set default address
        commit('SET_DEFAULT_ADDRESS', {commit, addresses});
    },
    async getIsFirstTimeUser({ commit }) {
        let isFirstTime = false;
        const response = await isFirstTimeUser.get();
        if(response.success) {
            isFirstTime = response.data?.success;
        }
        commit('SET_FIRST_TIME_USER', {commit, isFirstTime});
    }
};

const getters = {
    apiError() {
        return state.storedApiError;
    },
    apiLoading() {
        return state.storedApiLoading;
    },
    apiSuccess() {
        return state.storedApiSuccess;
    },
    paymentMethods() {
        return state.storedPayMethods;
    },
    paymentMethod() {
        return state.storedPayMethod;
    },
    paymentMethodById: (state) => (id) => {
        return state.storedPayMethods.find((method) => method.PayMethodId === id) || {};
    },
    cardOptions(...[, getters]) {
        const ccPayMethod = getters.countryInfo.PayMethods?.find((method) => method.Paymethod === 'CreditCard') || null;
        const options = ccPayMethod?.Options || [];

        return options.map((option) => ({
            Src: option.Icon?.Url,
            Alt: option.Icon?.Alt,
            Name: option.Name
        }));
    },
    countryInfo() {
        return state.storedCountryInfo;
    },
    defaultAddress() {
        return state.storedDefaultAddress;
    },
    paypalClientToken() {
        return state.paypalClientToken;
    },
    externalPayMethods() {
        return state.storedExternalPayMethods;
    },
    riverbendDefaultMethod() {
        const method = state.storedPayMethods.find(payMethod => isRiverbendDefault(payMethod.PayMethodDefaults));
        return method;
    }
};

const mutations = {
    SET_FE_ERROR(state, payload) {
        if(payload.reset) {
            if(payload.error) {
                // Search for array index
                const key = state.storedFEError.findIndex(validation => validation.error === payload.error);

                // Remove a message from store
                if(key > -1) {
                    state.storedFEError.splice(key, 1);
                }
            } else {
                // Clear all messages
                state.storedFEError = [];
                if(state.isCn) {
                    state.storedApiError = [];
                }
            }
        } else {
            // Check if message is already in store
            const found = state.storedFEError.find(validation => validation.error === payload.error);

            // Add message to store if it's not there yet
            if(!found) {
                state.storedFEError.push({
                    field: payload.field,
                    error: payload.error
                });
            }
        }
    },
    SET_API_ERROR(state, payload) {
        state.storedApiError = payload.error;
        state.storedApiErrorFields = payload.fields;
        state.storedApiErrorTypes = payload.types;
    },
    SET_API_LOADING(state, payload) {
        state.storedApiLoading = payload.loading;
    },
    SET_CHECKOUT_LOADED(state, payload) {
        state.storedApiCheckoutLoaded = payload;
    },
    SET_API_SUCCESS(state, payload) {
        state.storedApiSuccess = payload.success;
    },
    SET_PAYMENT_INFO(state, payload) {
        state.storedPayInfo = payload.result;
    },
    SET_PAYMENT_METHODS(state, payload) {
        state.storedPayMethods = payload.paymentMethods;
    },
    SET_PAYMENT_METHOD(state, payload) {
        state.storedPayMethod = payload.paymentMethod || {};
    },
    SET_PAYPAL_TOKEN(state, payload) {
        state.paypalClientToken = payload;
    },
    SET_BANKS(state, payload) {
        state.storedBanks = payload.banks || [];
    },
    SET_COUNTRY_INFO(state, payload) {
        state.storedCountryInfo = payload.info || {};
    },
    SET_COUNTRY_INFO_LOADED(state) {
        state.storedCountryInfoLoaded = true;
    },
    SET_DEFAULT_ADDRESS(state, payload) {
        let defaultAddress = {};

        if(payload?.addresses?.length) {
            defaultAddress = payload.addresses.find(address => address.IsDefault);
        }

        state.storedDefaultAddress = defaultAddress || {};
    },
    SET_EXTERNAL_PAYMENT_METHODS(state, payload) {
        state.storedExternalPayMethods = payload.externalPaymentMethods;
    },
    SET_FIRST_TIME_USER(state, payload) {
        state.isFirstTimeUser = payload;
    },
    SET_IS_GUEST_PAY_METHOD_URL(state, isGuestPayMethodUrl) {
        state.isGuestPayMethodUrl = isGuestPayMethodUrl;
    },
    SET_CN(state, payload) {
        state.isCn = payload;
    },
    SHIFT_STORED_PAY_METHOD_BACK(state) {
        state.storedPayMethod = state.shiftedPayMethod;
    },
    SHIFT_STORED_PAY_METHOD_OFF(state) {
        state.shiftedPayMethod = state.storedPayMethod;
        state.storedPayMethod = {};
    },
    OPEN_PRE_AUTH_ERROR(state) {
        state.showPreAuthError = true;
    },
    CLOSE_PRE_AUTH_ERROR(state) {
        state.showPreAuthError = false;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

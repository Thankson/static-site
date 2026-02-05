/**
 * @typedef {{
 *  Carrier: string,
 *  ShipMethod: string,
 *  ShipMethodQuote: number,
 *  FormattedShipMethodQuote: string,
 *  EstimatedDateTo: string,
 *  FormattedEstimatedDateTo: string,
 *  EstimatedDateFrom: string,
 *  FormattedEstimatedDateFrom: string,
 *  SortOrder: number
 * }} ShippingOption
 */

/**
 * @typedef {{
 * PaymethodNameDisplay: string,
 * CreditCardDescription: string,
 * ExpirationDisplay: string,
 * ExpiresSoon: boolean,
 * PayMethodImage: { Url: string, Text: string },
 * Expired: boolean,
 * RoutingNumber: number,
 * CustomerId: number,
 * PayMethodId: number,
 * InvoiceId: number,
 * PayMethodType: string,
 * NameOnAccount: string,
 * LastFourDigitsOfAccount: string,
 * AccountNickName: string,
 * PayMethodDefaults: Array<string>
 * PayMethodDirection: string,
 * ExpirationDate: string,
 * IsMelaleucaCard: boolean,
 * IsOneTimeCard: boolean,
 * ShA1Hash: string,
 * BinNumber: string,
 * IsEditable: boolean
 * }} PaymentMethod
 */

/**
 * @typedef {{
 * InvoiceNameDisplay: string,
 * RoutingNumber: number,
 * CustomerId: number,
 * InvoiceId: number,
 * InvoiceType: string,
 * NameOnAccount: string,
 * LastFourDigitsOfAccount: string,
 * AccountNickName: string,
 * InvoiceDefaults: Array<string>
 * InvoiceDirection: string,
 * IsMelaleucaCard: boolean,
 * IsOneTimeCard: boolean,
 * ShA1Hash: string,
 * BinNumber: string,
 * IsEditable: boolean
 * }} Invoice
 */

import api from '@api/routes/checkout';

const namespaced = true;
const state = {
    attentionItems: [],
    country: '',
    customerRiskData: null,
    endpointError: false,
    formattedBackDatingDate: '',
    hasACHDelay: false,
    hideDefaultPaymethodLink: false,
    hideDeleteDefaultPaymethodLink: false,
    isBackDated: false,
    isCrossCountry: false,
    isPreferred: false,
    isFirstTimeCheckout: false,
    isRiverbend: false,
    items: [],
    requiresCvv: false,
    selectedInvoiceType: '',
    selectedPayMethodId: '',
    selectedShippingAddressId: '',
    /** @type {ShippingOption} */
    selectedShippingOption: {},
    /**
     * array of available shipping method options
     * @type {Array<ShippingOption>}
     */
    shippingOptions: [],
    summary: {},
    crossCountryOldAddressIndex: null,
    selectedCrossCountry: false,
    isCn: null,
    userFlags: {},
    hasTermsModal: false,
    hideOneTimeUsePaymethod: false, // Reactivation Order
    isOleCheckoutGetAllAddresses: false
};

const actions = {
    cancel() {
        api.cancel();
    },
    async getData({ dispatch, rootState, state }) {
        await dispatch('getCheckout');
        if(state.isOleCheckoutGetAllAddresses || rootState?.riverbendSubscription?.isRiverbend) {
            await dispatch('shippingAddress/fetchAllAddresses', '', { root: true });
        } else {
            dispatch('shippingAddress/fetchAddresses', 'shippingAddress', { root: true });
        }
        if(state.isCn) {
            dispatch('paymentMethod/getExternalPayMethod', true, { root: true });
            dispatch('invoice/getInvoices', true, { root: true });
            dispatch('commitmentProfile/getData', true, { root: true });
        } else {
            if(!state.isRiverbend) {
                dispatch('paymentMethod/getPayMethods', { checkout: true }, { root: true });
            }
        }
    },
    /**
     * GET checkout data from api
     * @returns {boolean} returns true if the request was cancelled
     */
    async getCheckout({ commit }) {
        let cancelled = false;
        commit('SET_API_ERROR', false);
        const response = await api.query();
        cancelled = response.cancelled;

        if(response.data?.Success) {
            const data = response.data.Data || {};
            commit('UPDATE_CHECKOUT_DATA', data);
            commit('SET_BACKDATING_DATE', data);
            if(!state.isCn) {
                commit('SET_SELECTED_PAYMENT_METHOD_ID', data.PayMethodId);
            }
            commit('SET_SELECTED_SHIPPING_ADDRESS_ID', data.ShippingAddressId);
            if(!state.isCn) {
                const selectedShippingOptionIndex = state.shippingOptions.findIndex(
                    option =>
                        data?.Carrier
                            ? option.ShipMethod === data.ShipMethod && option.Carrier === data.Carrier
                            : option.ShipMethod === data.ShipMethod
                );
                commit('SET_SELECTED_SHIP_OPTION', selectedShippingOptionIndex);
            }
        } else {
            commit('SET_API_ERROR', true);
        }

        return cancelled;
    },
    /**
     * PUT shipping & payment information to api
     * @returns {boolean} returns true if the request was cancelled
     */
    async putCheckout({ dispatch, commit }, params) {
        let cancelled = false;
        let getResponse = false;
        let response = null;

        if(params?.GetResponse) {
            getResponse = true;
            delete params.GetResponse;
        }

        if(state.isCn) {
            // Not update the payMethodId request the PUT api in CN
            if(params.PayMethodId) {
                commit('SET_SELECTED_PAYMENT_METHOD_ID', params.PayMethodId);
                return cancelled;
            }
        } else {
            if(params.PayMethodId) {
                commit('SET_SELECTED_PAYMENT_METHOD_ID', params.PayMethodId);
            }
            if(params.ShipMethod) {
                const selectedShippingOptionIndex = state.shippingOptions.findIndex(option => option.ShipMethod === params.ShipMethod);
                commit('SET_SELECTED_SHIP_OPTION', selectedShippingOptionIndex);
            }
        }

        if(params.ShippingAddressId) {
            commit('SET_SELECTED_SHIPPING_ADDRESS_ID', params.ShippingAddressId);
        }

        response = await api.put({
            ...params
        });

        if(getResponse) {
            return response;
        }

        cancelled = response.cancelled;

        if(response.data?.Success) {
            cancelled = await dispatch('getCheckout');
        }

        return cancelled;
    }
};

const getters = {
    isPreferred(state) {
        return state.isPreferred;
    },
    isCrossCountry(state) {
        return state.isCrossCountry;
    },
    cashReceiptOptions(state, getters) {
        return getters.selectedPayMethod?.CashReceipt || [];
    },
    crossCountryOldAddressIndex(state) {
        return state.crossCountryOldAddressIndex;
    },
    /** @returns {PaymentMethod} */
    selectedPayMethod(state, getters, rootState) {
        if(state.isCn) {
            return rootState.paymentMethod.storedExternalPayMethods.PayMethods?.find(method => method.PayMethodId === state.selectedPayMethodId) || {};
        } else {
            return rootState.paymentMethod.storedPayMethods?.find(method => method.PayMethodId === state.selectedPayMethodId) || {};
        }
    },
    /** @returns {Invoice} */
    selectedInvoice(state, getters, rootState) {
        return rootState.invoice.storedInvoices?.find(method => method.IsSelected === true) || {};
    }
};

const mutations = {
    UPDATE_CHECKOUT_DATA(state, data) {
        state.attentionItems = data.AttentionItems || [];
        state.customerRiskData = data?.CustomerRiskData || false;
        state.hasACHDelay = data.HasACHDelay;
        state.hideDefaultPaymethodLink = data.HideDefaultPaymethodLink;
        state.hideDeleteDefaultPaymethodLink = data.HideDeleteDefaultPaymethodLink;
        state.hideOneTimeUsePaymethod = data.HideOneTimeUsePaymethod;
        state.isCrossCountry = data.IsInCrossCountry;
        state.isPreferred = data.IsPreferredMember;
        state.isFirstTimeCheckout = data.IsFirstTimeCheckout;
        state.items = data.Items || [];
        state.requiresCvv = data.RequiresCvv || false;
        state.summary = data.Summary || {};
        state.shippingOptions = data.Summary?.ShippingOptions || [];
        state.userFlags = data?.UserFlags;
    },
    SET_API_ERROR(state, data) {
        state.endpointError = data || false;
    },
    SET_BACKDATING_DATE(state, data) {
        state.isBackDated = data.IsOrderBackDated;
        state.formattedBackDatingDate = data.FormattedBackDatingDate;
    },
    SET_SELECTED_PAYMENT_METHOD_ID(state, id = null) {
        state.selectedPayMethodId = id;
    },
    SET_SELECTED_SHIPPING_ADDRESS_ID(state, id) {
        state.selectedShippingAddressId = id;
    },
    SET_SELECTED_SHIP_OPTION(state, selectedIndex) {
        const index = selectedIndex && selectedIndex > -1 ? selectedIndex : 0;
        state.selectedShippingOption = state.shippingOptions[index] || {};
    },
    SET_CROSS_COUNTRY_OLD_ADDRESS_INDEX(state, index) {
        state.crossCountryOldAddressIndex = index;
    },
    SET_SELECTED_CROSS_COUNTRY(state, isCrossCountry) {
        state.selectedCrossCountry = isCrossCountry;
    },
    SET_COUNTRY(state, country) {
        state.country = country;
    },
    SET_CN(state, payload) {
        state.isCn = payload;
    },
    // marketplace shipping options
    SET_SHIPPING_OPTIONS(state, data) {
        state.shippingOptions = data;
    },
    SET_TERMS_MODAL(state, payload) {
        state.hasTermsModal = payload;
    },
    // for OLE checkout flow
    SET_OLE_CHECKOUT_INITIAL_CALL(state, payload) {
        state.isOleCheckoutGetAllAddresses = payload;
    },
    SET_IS_RIVERBEND_CHECKOUT(state, payload) {
        state.isRiverbend = payload;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

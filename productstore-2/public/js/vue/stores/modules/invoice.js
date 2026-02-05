import apiSitecoreInvoices from '@api/routes/account/getinvoicetitles';
import apiSitecoreUpdateInvoices from '@api/routes/account/updateinvoicetype';
import apiSitecoreRefresh from '@api/routes/customeraccount/paymethods/refresh';
const namespaced = true;

const state = {
    storedInvoices: [],
    storedInvoice: {},
    storedFEError: [],
    storedApiError: [],
    storedApiErrorFields: [],
    storedApiLoading: false,
    storedApiSuccess: false
};

const parseError = (objError) => {
    const errorFields = Object.keys(objError);
    let error = [];
    let errorMsgs = null;

    for (let i = 0; i < errorFields.length; i++) {
        errorMsgs = objError[errorFields[i]];

        if(Array.isArray(errorMsgs)) {
            error = error.concat(errorMsgs);
        } else {
            error.push(errorMsgs);
        }
    }

    return error;
};

const actions = {
    // Get country information
    async getCountryInfo({ commit }, { country }) {
        let response = {};
        let loading = true;
        let error = [];
        const fields = [];

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        if(response.success && response.data?.Success) {
            const info = response.data.Data;
            commit('SET_COUNTRY_INFO', {commit, info});
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
    // Get all customer invoices methods from Sitecore API
    async getInvoices({ commit }, checkout = false) {
        let loading = true;
        let error = [];
        const fields = [];

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        // Get data from Sitecore API
        const response = await (apiSitecoreInvoices.get());

        if(response.success) {
            const invoiceMethods = response.data.Data;
            commit('SET_INVOICE_METHODS', {commit, invoiceMethods});
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

    async updateInvoicestype({ commit }, {invoiceType}) {
        let loading = true;
        let error = [];
        const fields = [];

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        // Get data from Sitecore API
        const invoicetype = invoiceType;
        const response = await apiSitecoreUpdateInvoices.put({ InvoiceType: invoicetype });

        if(response.success) {
            // Disable loading
            loading = false;
            commit('SET_API_LOADING', {commit, loading});
        } else {
            if(response.error) {
                error = [response.error];
            }
        }

        // Display API errors if they exist
        commit('SET_API_ERROR', {commit, error, fields});
    },

    // Get invoice method by ID (filter on Sitecore API stored result)
    async getInvoice({ commit }, { customerId, invoiceId }) {
        let invoiceMethod = {};

        if(state.storedInvoices && state.storedInvoices.length) {
            invoiceMethod = state.storedInvoices.filter(pay => pay.IsSelected === true);
            invoiceMethod = invoiceMethod[0] || {};
        }

        // Set invoice method data
        commit('SET_INVOICE_METHOD', {commit, invoiceMethod});
    },

    // Create a pay method using Fetch API to ping Services API
    async saveInvoiceMethod({ commit }, {
        isEditing,
        isCreditCard,
        customerId,
        bearerToken,
        country,
        payload,
        isCommissionDeposit,
        envService }) {
        let url = null;
        let success = false;
        let loading = true;
        let error = [];
        let fields = [];
        const apiServicesUrl = envService + '/invoice/1.0/';

        // Enable loading
        commit('SET_API_LOADING', {commit, loading});

        // Set request headers
        let requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + bearerToken);
        requestHeaders.append('Content-Type', 'application/json; charset=utf-8');

        // Set request config
        const config = {
            method: (!isEditing) ? 'POST' : 'PUT',
            headers: requestHeaders,
            body: JSON.stringify(payload)
        };

        // Define route to ADD (post)
        url = apiServicesUrl + 'customers/' + customerId + '/invoices?country=' + country;

        // Post or put data
        fetch(url, config)
            .then(async response => {
                let result = null;
                let objError = null;
                loading = false;
                error = [];
                fields = [];

                if(!response.ok) {
                    success = false;
                    result = await response.json();

                    // Extract field validation errors from "errors" key
                    if(result.errors) {
                        error = parseError(result.errors);
                    // Extract field validation errors from "OriginalResponseContent" key
                    } else if(result.OriginalResponseContent) {
                        if(result.OriginalResponseContent.ErrorMessage) {
                            if(result.OriginalResponseContent.ErrorMessage.indexOf('"errors":') > -1) {
                                objError = JSON.parse(result.OriginalResponseContent.ErrorMessage);

                                if(objError.errors.DomainValidations) {
                                    fields = fields.concat(objError.errors.DomainValidations);
                                    error = error.concat(objError.errors.DomainValidations);
                                }
                            } else {
                                error.push(result.OriginalResponseContent.ErrorMessage);
                            }

                            if(result.OriginalResponseContent.MemberNames) {
                                fields = fields.concat(result.OriginalResponseContent.MemberNames);
                            }
                        } else if(result.OriginalResponseContent.errors) {
                            error = parseError(result.OriginalResponseContent.errors);
                        } else {
                            error.push(result.OriginalResponseContent);
                        }
                    // Extract generic errors from "Message" key
                    } else if(result.Message) {
                        error.push(result.Message);
                    // Extract generic errors from "message" key
                    } else if(result.message) {
                        error.push(result.message);
                    // Extract generic errors from "errorMessage" key
                    } else if(result.errorMessage) {
                        error.push(result.errorMessage);
                    }

                    // Display API errors if they exist
                    commit('SET_API_ERROR', {commit, error, fields});

                    // NOT Success
                    commit('SET_API_SUCCESS', {commit, success});
                } else {
                    // Clear API error
                    error = [];
                    fields = [];
                    commit('SET_API_ERROR', {commit, error, fields});

                    // Success
                    success = true;
                    commit('SET_API_SUCCESS', {commit, success});

                    // Refresh Sitecore
                    apiSitecoreRefresh.post();
                }

                // Disable loading
                commit('SET_API_LOADING', {commit, loading});
            })
            .catch(error => {
                loading = false;
                success = false;
                error = [error];
                fields = [];

                // Disable loading
                commit('SET_API_LOADING', {commit, loading});

                // Display API errors if they exist
                commit('SET_API_ERROR', {commit, error, fields});

                // Not success
                commit('SET_API_SUCCESS', {commit, success});
            });
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
    invoiceMethods() {
        return state.storedInvoices;
    },
    invoiceMethod() {
        return state.storedInvoice;
    }
};

const mutations = {
    SET_FE_ERROR(state, payload) {
        if(payload.reset) {
            if(payload.error) {
                // Search for array index
                const key = Object.entries(state.storedFEError).find(i => i[1] === payload.error);

                // Remove a message from store
                if(key && key[0]) {
                    state.storedFEError.splice(key[0], 1);
                }
            } else {
                // Clear all messages
                state.storedFEError = [];
            }
        } else {
            // Add message to store
            if(!state.storedFEError.includes(payload.error)) {
                state.storedFEError.push(payload.error);
            }
        }
    },
    SET_API_ERROR(state, payload) {
        state.storedApiError = payload.error;
        state.storedApiErrorFields = payload.fields;
    },
    SET_API_LOADING(state, payload) {
        state.storedApiLoading = payload.loading;
    },
    SET_API_SUCCESS(state, payload) {
        state.storedApiSuccess = payload.success;
    },
    SET_INVOICE_METHODS(state, payload) {
        state.storedInvoices = payload.invoiceMethods;
    },
    SET_INVOICE_METHOD(state, payload) {
        state.storedInvoice = payload.invoiceMethod || {};
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

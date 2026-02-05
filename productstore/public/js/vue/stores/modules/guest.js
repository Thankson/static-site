import apiEnroll from '@api/routes/enroll';
import apiEnrollValidate from '@api/routes/enroll/validate';
import apiEnrollValidatePin from '@api/routes/guest/enrollment/pin';
import apiSaveGuest from '@api/routes/guest';
import apiSaveEnroll from '@api/routes/guest/enrollment/enroll';

const namespaced = true;

const state = {
    storedGuest: {},
    storedGuestApiError: [],
    storedGuestApiLoading: false,
    storedGuestFEError: [],
    storedGuestUserValidation: {},
    storedGuestUserValidate: false,
    storedGuestPinValidate: false,
    storedGuestSaved: false
};

const parseError = (errorMessages = []) => {
    let errors = [];

    if(Array.isArray(errorMessages)) {
        errorMessages.forEach(error => {
            errors.push(error.Translation || error);
        });
    } else {
        errors = [ errorMessages ];
    }

    return errors;
};

const actions = {
    async getGuestInfo({ commit }, payload) {
        // Reset errors
        commit('RESET_API_ERROR');

        // Enable loading
        commit('SET_API_LOADING', true);

        let response = null;

        // If it's development then simulate a customer
        if(process?.env?.NODE_ENV === 'development') {
            // Get data from API
            response = await apiEnroll.query({
                customerId: payload?.customerId || 'default'
            });
        } else {
            // Get data from API
            response = await apiEnroll.get();
        }

        // Process response
        if(response.success && response?.data?.Success && response?.data?.Data) {
            // Define guest information
            commit('SET_GUEST_INFO', response.data.Data);
        } else {
            // Reset guest information
            commit('SET_GUEST_INFO', {});

            // Extract error message from response
            const errors = response?.data?.ErrorMessage || response?.data?.ErrorMessages || [];

            // Display API errors if they exist
            commit('SET_API_ERROR', parseError(errors));
        }

        // Disable loading
        commit('SET_API_LOADING', false);
    },
    async applyGuestValidation({ commit }, payload) {
        // Reset errors
        commit('RESET_API_ERROR');

        // Enable loading
        commit('SET_API_LOADING', true);

        // Get data from API
        const response = await apiEnrollValidate.post(payload);

        // Process response
        if(response.success && response?.data?.Success && response?.data?.Data) {
            // Define guest information
            commit('SET_USER_VALIDATION', response.data.Data);
            commit('SET_USER_VALIDATE', true);
        } else {
            // Reset guest information
            commit('SET_USER_VALIDATION', {});
            commit('SET_USER_VALIDATE', false);

            // Extract error message from response
            const errors = response?.data?.ErrorMessage || response?.data?.ErrorMessages || [];

            // Display API errors if they exist
            commit('SET_API_ERROR', parseError(errors));
        }

        // Disable loading
        commit('SET_API_LOADING', false);
    },
    async sendGuestPin({ commit }, payload) {
        // Reset errors
        commit('RESET_API_ERROR');

        // Enable loading
        commit('SET_API_LOADING', true);

        // Get data from API
        const response = await apiEnrollValidatePin.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            // Define pin information
            commit('SET_PIN_VALIDATE', true);
        } else {
            // Reset pin information
            commit('SET_PIN_VALIDATE', false);

            // Extract error message from response
            const errors = response?.data?.ErrorMessage || response?.data?.ErrorMessages || [];

            // Display API errors if they exist
            commit('SET_API_ERROR', parseError(errors));
        }

        // Disable loading
        commit('SET_API_LOADING', false);
    },
    async saveGuest({ commit }, payload) {
        // Reset errors
        commit('RESET_API_ERROR');

        // Enable loading
        commit('SET_API_LOADING', true);

        // Save Guest Checkout using Sitecore API
        const response = await apiSaveGuest.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            // Define guest information
            commit('SET_GUEST_SAVED', true);
        } else {
            // Reset guest information
            commit('SET_GUEST_SAVED', false);

            // Extract error message from response
            const errors = response?.data?.ErrorMessage || response?.data?.ErrorMessages || [];

            // Display API errors if they exist
            commit('SET_API_ERROR', parseError(errors));
        }

        // Disable loading
        commit('SET_API_LOADING', false);
    },
    async saveEnrollment({ commit }, payload) {
        // Reset errors
        commit('RESET_API_ERROR');

        // Enable loading
        commit('SET_API_LOADING', true);

        // Save Online Enrollment using Sitecore API
        const response = await apiSaveEnroll.post(payload);

        // Process response
        if(response.success && response?.data?.Success) {
            // Define guest information
            commit('SET_GUEST_SAVED', true);
        } else {
            // Reset guest information
            commit('SET_GUEST_SAVED', false);

            // Extract error message from response
            const errors = response?.data?.ErrorMessage || response?.data?.ErrorMessages || [];

            // Display API errors if they exist
            commit('SET_API_ERROR', parseError(errors));
        }

        // Disable loading
        commit('SET_API_LOADING', false);
    }
};

const getters = {};

const mutations = {
    SET_API_ERROR(state, error = []) {
        const errorArr = Array.isArray(error) ? error : [ error ];
        state.storedGuestApiError = errorArr;
    },
    RESET_API_ERROR(state) {
        state.storedGuestApiError = [];
    },
    SET_API_LOADING(state, loading) {
        state.storedGuestApiLoading = loading;
    },
    SET_GUEST_INFO(state, info) {
        state.storedGuest = info;
    },
    SET_USER_VALIDATION(state, info) {
        state.storedGuestUserValidation = info;
    },
    SET_USER_VALIDATE(state, validate) {
        state.storedGuestUserValidate = validate;
    },
    SET_PIN_VALIDATE(state, validate) {
        state.storedGuestPinValidate = validate;
    },
    SET_GUEST_SAVED(state, saved) {
        state.storedGuestSaved = saved;
    },
    SET_FE_ERROR(state, payload) {
        if(payload.reset) {
            if(payload.error) {
                // Search for array index
                const key = state.storedGuestFEError.findIndex(validation => validation.error === payload.error);

                // Remove a message from store
                if(key > -1) {
                    state.storedGuestFEError.splice(key, 1);
                }
            } else {
                // Clear all messages
                state.storedGuestFEError = [];
            }
        } else {
            // Check if message is already in store
            const found = state.storedGuestFEError.find(validation => validation.error === payload.error);

            // Add message to store if it's not there yet
            if(!found) {
                state.storedGuestFEError.push({
                    field: payload.field,
                    error: payload.error
                });
            }
        }
    },
    REMOVE_FE_ERROR(state, arrFields) {
        if(arrFields?.length) {
            state.storedGuestFEError = state.storedGuestFEError.filter(validation => !arrFields.includes(validation.field));
        }
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

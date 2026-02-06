import phoneNumberApi from '@api/routes/subscription/phonenumber';
import phoneIsDuplicateApi from '@api/routes/account/identifications/isDuplicatePhone';

const namespaced = true;
const state = {
    number: '',
    numberId: '',
    optin: false,
    isDefault: false,
    isUsername: false,
    loading: false,
    successCall: false
};

const actions = {
    async getPhoneIsDuplicate({ commit }, phone) {
        commit('SET_LOADING');
        const response = await phoneIsDuplicateApi.query({ phone });
        const { data, success } = response;
        // Data property will be false if this phone number is NOT a duplicate
        if(success && data?.Success && !data?.Data) {
            commit('SET_NUMBER', phone);
        }
        commit('SET_LOADING', false);
        return response;
    },
    async getMobilePhone({ commit, dispatch }) {
        commit('SET_LOADING');
        const response = await phoneNumberApi.get();
        if(response.success) {
            dispatch('updatePhone', response.data?.Data || {});
        }

        commit('SET_LOADING', false);
    },
    async postMobilePhone({commit}, payload) {
        commit('SET_LOADING');
        const response = await phoneNumberApi.post(payload);
        if(response.success && response.data?.Success) {
            commit('SET_NUMBER', payload.PhoneNumber.Value);
        }
        commit('SET_LOADING', false);
        return response;
    },
    setNumber({commit}, payload) {
        commit('SET_NUMBER', payload);
    },
    updatePhone({ commit }, data) {
        commit('SET_IS_DEFAULT', data.PhoneNumber?.IsDefault);
        commit('SET_IS_USERNAME', data.PhoneNumber?.IsUsername);
        commit('SET_NUMBER', data.PhoneNumber?.Value);
        commit('SET_NUMBER_ID', data.PhoneNumber?.Id);
        commit('SET_OPTIN', data.IsOptInForText);
    }
};

const getters = {
    phone(state) {
        return state.number;
    }
};

const mutations = {
    SET_IS_DEFAULT(state, isDefault) {
        state.isDefault = isDefault ?? false;
    },
    SET_IS_USERNAME(state, isUsername) {
        state.isUsername = isUsername || false;
    },
    SET_LOADING(state, loading = true) {
        state.loading = loading;
    },
    SET_NUMBER(state, number) {
        state.number = number;
    },
    SET_NUMBER_ID(state, numberId) {
        state.numberId = numberId ?? '';
    },
    SET_OPTIN(state, optin) {
        state.optin = optin || false;
    },
    SET_SUCCESS(state, param) {
        state.successCall = param;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

import identifyApi from '@api/routes/customeraccount/createaccount/identify';
import verifyApi from '@api/routes/customeraccount/createaccount/verify';
import passwordApi from '@api/routes/customeraccount/createaccount/password';

const namespaced = true;

const state = {
    contact: '',
    loading: false
};

const actions = {
    async postEmailPhone({ commit }, params) {
        commit('TOGGLE_LOADING');
        const response = await identifyApi.post(params);
        commit('TOGGLE_LOADING');

        if(response.success && response.data?.Success) {
            if(!response.data.MultipleAccounts) {
                commit('UPDATE_USER', response.data?.User);
            }

            return {
                success: true,
                multiple: response.data.MultipleAccounts
            };
        }

        return {
            success: false,
            error: response.data?.ErrorMessage || ''
        };
    },
    async postCode({ commit }, params) {
        commit('TOGGLE_LOADING');
        const response = await verifyApi.post({
            User: state.user,
            ...params
        });
        commit('TOGGLE_LOADING');

        if(response.success && response.data?.Success && response.data.Data?.ValidPin) {
            return true;
        }
    },
    async postPassword({ commit }, params) {
        commit('TOGGLE_LOADING');
        const response = await passwordApi.post({
            User: state.user,
            ...params
        });
        commit('TOGGLE_LOADING');

        if(response.success && response.data?.Success) {
            if(response.data.RedirectUrl) {
                window.location.href = response.data.RedirectUrl;
            }

            return true;
        }
    },
    async skipPassword({ commit }) {
        commit('TOGGLE_LOADING');
        const response = await passwordApi.post({
            Skip: true,
            User: state.user
        });
        commit('TOGGLE_LOADING');

        if(response.success && response.data?.Success) {
            if(response.data.RedirectUrl) {
                window.location.href = response.data.RedirectUrl;
            }

            return true;
        }
    }
};

const getters = {
    loading() {
        return state.loading;
    }
};

const mutations = {
    SET_CONTACT(state, contact) {
        state.contact = contact;
    },
    TOGGLE_LOADING(state) {
        state.loading = !state.loading;
    },
    UPDATE_USER(state, user) {
        if(user) {
            state.user = user;
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

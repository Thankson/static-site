import api from '@api/routes/commitment/profile';

const namespaced = true;

const state = {
    commitmentProfile: {}
};

const actions = {
    async getData({ commit }) {
        const response = await api.query();

        if(response.success && response?.data?.Success) {
            commit('SET_COMMITMENT_PROFILE', response.data.Data);
            return response;
        } else {
            console.log('commitment profile error=> ', response);
        }
    }
};

const getters = {};

const mutations = {
    SET_COMMITMENT_PROFILE(state, commitmentProfile) {
        state.commitmentProfile = commitmentProfile;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

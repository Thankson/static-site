import api from '@api/routes/profile/flags';
import Vue from 'vue';

const eventBus = new Vue();

const namespaced = true;

const state = {
    loading: false,
    loaded: false,
    userFlags: {}
};

const actions = {
    emitUserFlagsLoaded() {
        eventBus.$emit('userFlagsLoaded');
    },
    async getUserFlags({ commit, dispatch, state }, test) {
        if(state.loading || state.loaded) return;

        commit('SET_LOADING', true);

        const response = await api.get();

        if(response.data.Success) {
            const flags = response.data?.Data;
            commit('SET_USER_FLAGS', flags);
            commit('SET_LOADED');
        } else {
            console.warn('Error getting userFlags');
        }

        commit('SET_LOADING', false);

        dispatch('emitUserFlagsLoaded');
    }
};

const getters = {
    onUserFlagsLoaded: () => fn => {
        eventBus.$on('userFlagsLoaded', fn);
    }
};

const mutations = {
    SET_LOADED(state) {
        state.loaded = true;
    },
    SET_LOADING(state, loading) {
        state.loading = loading;
    },
    SET_USER_FLAGS(state, data) {
        state.userFlags = data || {};
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

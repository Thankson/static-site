import api from '@api/routes/customeraccount/subscribedservices';
import apiSummary from '@api/routes/customeraccount/subscribedservices/summary';
import isEmpty from 'lodash/isEmpty';

const namespaced = true;

const state = {
    growError: false,
    growErrorMsg: '',
    growErrorMessages: [],
    growLoading: false,
    growMessage: {},
    growModalData: {},
    isGrowSubscribed: false,
    moreError: false,
    moreErrorMsg: '',
    moreLoading: false,
    moreModalData: {},
    isMoreSubscribed: false,
    subscribedServicesSummary: null
};

const actions = {
    async growSubscription({ commit, state }, params) {
        commit('SET_GROW_SUBSCRIPTION_ERROR', false);
        commit('TOGGLE_GROW_LOADING');
        params.ServiceType = 'METools';
        let response = null;
        switch (params.RequestType) {
            case 'Get':
                response = await apiSummary.get(`?serviceType=${params.ServiceType}&subscribed=${state.isGrowSubscribed}`);
                break;
            case 'Post':
                params.BeginDate = new Date();
                response = await api.post(params);
                break;
            case 'Put':
                if(state.isGrowSubscribed) {
                    params.EndDate = new Date();
                } else {
                    params.BeginDate = new Date();
                }
                response = await api.put(params);
                break;
        }
        commit('TOGGLE_GROW_LOADING');
        if(response.success && params.RequestType === 'Get') {
            commit('UPDATE_GROW_SUBSCRIPTION', response.data.Data);
        } else {
            commit('SET_GROW_SUBSCRIPTION_ERROR', true);
            if(response.error) {
                commit('SET_GROW_SUBSCRIPTION_ERROR_MESSAGE', response.error);
            } else if(response.data?.ErrorMessages && !isEmpty(response.data.ErrorMessages)) {
                commit('SET_GROW_ERROR_MESSAGES', response.data.ErrorMessages);
            }
        }
    },
    async moreSubscription({ commit, state }, params) {
        commit('SET_MORE_SUBSCRIPTION_ERROR', false);
        commit('TOGGLE_MORE_LOADING');
        params.ServiceType = 'MoreReportSubscription';
        let response = null;
        switch (params.RequestType) {
            case 'Get':
                response = await apiSummary.get(`?serviceType=${params.ServiceType}&subscribed=${state.isMoreSubscribed}`);
                break;
            case 'Post':
                params.BeginDate = new Date();
                response = await api.post(params);
                break;
            case 'Put':
                params.EndDate = new Date();
                response = await api.put(params);
                break;
        }
        commit('TOGGLE_MORE_LOADING');
        if(response.success && params.RequestType === 'Get') {
            commit('UPDATE_MORE_SUBSCRIPTION', response.data.Data);
        } else {
            commit('SET_MORE_SUBSCRIPTION_ERROR', true);
            if(response.error) {
                commit('SET_MORE_SUBSCRIPTION_ERROR_MESSAGE', response.error);
            }
        }
    }
};

const getters = {};

const mutations = {
    SET_GROW_SUBSCRIPTION_ERROR(state, isError) {
        state.growError = isError;
        if(isError) {
            state.isGrowSubscribed = !state.isGrowSubscribed;
        }
    },
    SET_GROW_SUBSCRIPTION_ERROR_MESSAGE(state, msg) {
        state.growErrorMsg = msg;
    },
    SET_MORE_SUBSCRIPTION_ERROR(state, isError) {
        state.moreError = isError;
        if(isError) {
            state.isMoreSubscribed = !state.isMoreSubscribed;
        }
    },
    SET_MORE_SUBSCRIPTION_ERROR_MESSAGE(state, msg) {
        state.moreErrorMsg = msg;
    },
    TOGGLE_GROW_LOADING(state) {
        state.growLoading = !state.growLoading;
    },
    TOGGLE_MORE_LOADING(state) {
        state.moreLoading = !state.moreLoading;
    },
    UPDATE_GROW_MESSAGE(state, message) {
        state.growMessage = message;
    },
    UPDATE_GROW_MODAL(state, data) {
        state.growModalData = data;
    },
    UPDATE_GROW_SUBSCRIPTION(state, data) {
        state.isGrowSubscribed = data.Subscribed;
        state.growMessage = data.Message ? data.Message : {};
        state.growModalData = data.Modal ? data.Modal : {};
        state.subscribedServicesSummary = data.SubscribedServicesSummary ? data.SubscribedServicesSummary : null;
    },
    UPDATE_MORE_MODAL(state, data) {
        state.moreModalData = data;
    },
    UPDATE_MORE_SUBSCRIPTION(state, data) {
        state.isMoreSubscribed = data.Subscribed;
        state.moreModalData = data.Modal ? data.Modal : {};
    },
    SET_GROW_ERROR_MESSAGES(state, data) {
        state.growErrorMessages = data;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

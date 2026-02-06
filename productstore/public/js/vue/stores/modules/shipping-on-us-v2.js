import apiShippingTracker from '@api/routes/rewards/shippingtracker';

import apiReceipt from '@api/routes/receipt';

const namespaced = true;

const state = {
    activeMilestone: {},
    orderId: '',
    souData: {},
    shippingConfigId: null,
    rewardConfigId: null,
    souLoading: false
};

const actions = {
    async getSOU({ commit }, params) {
        if(!state.rewardConfigId && !params.rewardId &&
            !state.shippingConfigId && !params.shippingId) return;
        commit('SET_SOU_LOADING', true);

        let queryType = new URLSearchParams();

        if(params.shippingId) {
            queryType.append('shippingConfigId', params.shippingId);
        }
        if(params.rewardId) {
            queryType.append('rewardConfigId', params.rewardId);
        }
        if(params.orderId) {
            queryType.append('orderId', params.orderId);
        }

        let response;

        if(params.isReceipt && params.hasNewLoyaltySOU) {
            response = await apiReceipt.get('?' + queryType.toString());
        } else {
            response = await apiShippingTracker.get('?' + queryType.toString());
        }

        if(response?.data?.Success) {
            const _data = response.data.Data;
            commit('SET_SOU_DATA', _data);
            commit('SET_ACTIVE_MILESTONE', _data?.Milestones?.find(milestone => milestone.IsActive));
        } else {
            console.log('shipping on us error=> ', response);
        }

        commit('SET_SOU_LOADING', false);
        return response;
    }
};

const getters = {};

const mutations = {
    SET_SOU_LOADING(state, bool) {
        state.souLoading = bool;
    },
    SET_SOU_DATA(state, souData) {
        state.souData = souData;
    },
    SET_ACTIVE_MILESTONE(state, activeMilestone) {
        state.activeMilestone = activeMilestone;
    },
    SET_SHIPPING_CONFIG_ID(state, id) {
        state.shippingConfigId = id;
    },
    SET_REWARD_CONFIG_ID(state, id) {
        state.rewardConfigId = id;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

import api from '@api/routes/coupons';
import apiReminder from '@api/routes/coupons/reminder';
import apiClearReminder from '@api/routes/coupons/clearreminder';

const namespaced = true;

const state = {
    error: false,
    isLoading: false,
    coupons: [],
    currentMonth: '',
    formattedAvailableSavings: '',
    hasReminderDate: null,
    nextMonthAbbr: '',
    reminderDay: 0,
    reminderDaySuffix: '',
    resetDropDownDate: false,
    setReminderDate: 0,
    userFlags: {},
    couponRequestFail: false,
    couponReminderRequestFail: false
};

const actions = {
    async setDate({ commit }, date) {
        commit('IS_LOADING');
        const response = await apiReminder.post({ ReminderDate: date});
        if(response.data?.Success && response.data?.Data) {
            commit('SET_REMINDER_DATE', response.data?.Data);
        } else {
            commit('API_ERROR');
        }
        commit('STOP_LOADING');
    },
    async clearDate({ commit }) {
        commit('IS_LOADING');
        commit('RESET_DATE');
        const response = await apiClearReminder.delete();
        if(response.data?.Success === true) {
            commit('DELETE_REMINDER_DATE');
        } else {
            commit('API_ERROR');
        }
        commit('STOP_LOADING');
    },
    async getData({ commit }, payload) {
        commit('IS_LOADING');
        commit('SET_COUPON_REQUEST_FAIL', false);

        // ForceError is used only on PatternLab to display Service Failure message
        let params = null;
        if(process?.env?.NODE_ENV === 'development' && payload?.forceError) {
            params = {
                forceError: payload.forceError
            };
        }

        const response = await api.query(params);
        if(response.data?.Success && response.data?.Data) {
            commit('GET_DATA', response.data);
        } else {
            commit('API_ERROR');
            commit('SET_COUPON_REQUEST_FAIL', true);
        }
        commit('STOP_LOADING');
    },
    async getReminderData({ commit }, payload) {
        commit('IS_LOADING');
        commit('SET_COUPON_REMINDER_REQUEST_FAIL', false);

        // ForceError is used only on PatternLab to display Service Failure message
        let params = null;
        if(process?.env?.NODE_ENV === 'development' && payload?.forceError) {
            params = {
                forceError: payload.forceError
            };
        }

        const response = await apiReminder.query(params);
        if(response.data?.Success && response.data?.Data) {
            commit('GET_REMINDER_DATA', response.data);
        } else {
            commit('API_ERROR');
            commit('SET_COUPON_REMINDER_REQUEST_FAIL', true);
        }
        commit('STOP_LOADING');
    }
};

const getters = {
    coupons() {
        return state.coupons;
    },
    error() {
        return state.error;
    },
    getDate() {
        return state.setReminderDate;
    },
    hasReminderDate() {
        return state.hasReminderDate;
    },
    userFlags() {
        return state.userFlags;
    }
};

const mutations = {
    API_ERROR(state) {
        state.error = true;
    },
    DELETE_REMINDER_DATE(state) {
        state.hasReminderDate = false;
    },
    GET_DATA(state, response) {
        state.apiResponse = response.Data;
        state.coupons = response.Data.Coupons;
        state.formattedAvailableSavings = response.Data.FormattedAvailableSavings;
        state.hasReminderDate = response.Data.HasReminderDate;
        state.userFlags = response.Data?.UserFlags || {};
    },
    GET_REMINDER_DATA(state, response) {
        if(response.Data.CurrentUTCDate) {
            const utcDate = new Date(response.Data.CurrentUTCDate);
            let nextMonth = new Date();
            const culture = window.dataLayer && window.dataLayer.find(element => element.uiCulture)?.uiCulture;

            nextMonth.setMonth(utcDate.getMonth() + 1);
            state.currentMonth = utcDate.toLocaleDateString(culture, {month: 'long'});
            state.nextMonthAbbr = nextMonth.toLocaleDateString(culture, {month: 'short'});
        } else {
            state.currentMonth = '';
            state.nextMonthAbbr = '';
        }
        state.reminderDay = response.Data.ReminderDay;
        state.hasReminderDate = response.Data.HasReminderDate;
        state.reminderDaySuffix = response.Data.ReminderDaySuffix ? response.Data.ReminderDaySuffix : '';
    },
    IS_LOADING(state) {
        state.isLoading = true;
    },
    REMOVE_COUPON(state, sku) {
        const itemIndex = state.coupons.findIndex(coupon => coupon.Sku === sku);
        state.coupons.splice(itemIndex, 1);
    },
    RESET_DATE(state) {
        state.resetDropDownDate = true;
    },
    SET_REMINDER_DATE(state, data) {
        state.reminderDay = data.ReminderDay;
        state.reminderDaySuffix = data.ReminderDaySuffix;
        state.hasReminderDate = true;
    },
    STOP_LOADING(state) {
        state.isLoading = false;
    },
    SET_COUPON_REQUEST_FAIL(state, fail) {
        state.couponRequestFail = fail;
    },
    SET_COUPON_REMINDER_REQUEST_FAIL(state, fail) {
        state.couponReminderRequestFail = fail;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

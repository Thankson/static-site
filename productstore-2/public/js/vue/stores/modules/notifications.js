import api from '@api/routes/customerprofile/notification';

const namespaced = true;

const state = {
    storedNotifications: [],
    storedDismissedNotifications: []
};

const actions = {
    async getNotifications({ commit }, { push }) {
        const response = await api.get();

        if(response.success) {
            const notifications = response.data;

            if(push) {
                commit('PUSH_NOTIFICATIONS', {commit, notifications});
            } else {
                commit('SET_NOTIFICATIONS', {commit, notifications});
            }
        }
    },

    async dismissNotification({ commit }, { notificationID }) {
        const response = await api.put({
            MessageId: notificationID
        });

        if(response.success) {
            commit('SET_DISMISSED_NOTIFICATION', {commit, notificationID});
        }
    },

    async dismissPartialNotifications({ commit }, { notificationIDs, enableNewWebalert }) {
        const response = await api.put({
            MessageIds: notificationIDs
        });

        if(response.success && response.data) {
            // when `enableNewWebalert` is true, don't set notification dismissed, otherwise those informations will not be displayed in the popup
            if(enableNewWebalert) return;

            commit('SET_DISMISSED_NOTIFICATION', {commit, listNotificationID: notificationIDs});
        }
    },

    async dismissAllNotifications({ commit }, { listNotificationID }) {
        const response = await api.post();

        if(response.success) {
            commit('SET_DISMISSED_NOTIFICATION', {commit, listNotificationID});
        }
    }
};

const getters = {
    notifications() {
        return state.storedNotifications;
    },
    dismissedNotifications() {
        return state.storedDismissedNotifications;
    }
};

const mutations = {
    SET_NOTIFICATIONS(state, payload) {
        state.storedNotifications = payload.notifications;
    },
    PUSH_NOTIFICATIONS(state, payload) {
        if(payload.notifications && payload.notifications.length) {
            let alreadyExists = false;
            const newNotifications = payload.notifications.filter((item) => {
                alreadyExists = state.storedNotifications.filter((i) => {
                    return i.MessageId === item.MessageId;
                });

                return !alreadyExists.length;
            });

            if(newNotifications.length) {
                state.storedNotifications = newNotifications.concat(state.storedNotifications);
            }
        }
    },
    SET_DISMISSED_NOTIFICATION(state, payload) {
        if(payload.notificationID) {
            state.storedNotifications.map((item) => {
                if(item.MessageId === payload.notificationID) {
                    item.ViewedTime = new Date();
                }
            });

            state.storedDismissedNotifications.push(payload.notificationID);
        }

        if(payload.listNotificationID) {
            state.storedNotifications.forEach((item) => {
                if(payload.listNotificationID.includes(item.MessageId)) {
                    item.ViewedTime = new Date();
                }
            });

            state.storedDismissedNotifications = [
                ...state.storedDismissedNotifications,
                ...payload.listNotificationID
            ];
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

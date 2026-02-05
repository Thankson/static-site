import Vue from 'vue';
import api from '@api/routes/navigation';
import apiCn from '@api/routes/navigation/cn';
import logError from '../../utils/log-api-error';

const bus = new Vue();

const namespaced = true;

const state = {
    formattedCustomerType: '',
    formattedName: '',
    formattedStatus: '',
    formattedVIPStatus: '',
    greetingLabels: '',
    isLoaded: false,
    isCn: false,
    labels: {},
    loading: false,
    lsdLabels: '',
    lsd: '',
    lsdTitle: '',
    lsdMobileLabels: '',
    expiringThisMonthLabel: '',
    hasExpiringThisMonth: false,
    lsdExpiringInCurrentMonth: '',
    lvipStatus: '',
    lvipIcon: '',
    profileData: {},
    typeOrStatus: '',
    userFlags: {}
};

const actions = {
    async getNavigation({ commit, state }) {
        if(state.loading) {
            return;
        }

        commit('SET_LOADING');

        let navResponse;
        if(state.isCn) {
            navResponse = await apiCn.get();
        } else {
            navResponse = await api.get();
        }

        if(navResponse.success && navResponse.data.Success) {
            if(state.isCn) {
                const navData = navResponse.data.Data || {};
                commit('SET_FORMATTED_NAME', navData.AccountProfile.CustomerName);
                commit('SET_FORMATTED_STATUS', navData.AccountProfile.Status);
                commit('SET_LVIP_STATUS', navData.AccountProfile.LVip);
                commit('SET_LVIP_ICON', navData.Labels.LVip_Icon?.Url || '');
                commit('SET_IS_LOADED');
                commit('SET_GREETING_LABELS', navData.Labels.Greeting_Label);
                commit('SET_LSD_LABELDESKTOP', navData.Labels.LSD_Balance_LabelDesktop);
                commit('SET_LSD_LABELMOBILE', navData.Labels.LSD_Balance_LabelMobile);
                commit('SET_EXPIRING_THIS_MONTH_LABEL', navData.Labels.ExpiringThisMonthLabel);
                commit('SET_HAS_EXPIRING_THIS_MONTH', navData.AccountProfile.HasExpiringThisMonth);
                commit('SET_LSD_EXPIRING_IN_CURRENT_MONTH', navData.AccountProfile.LsdExpiringInCurrentMonth);
                commit('SET_LSD_TITLE', navData.Labels.LSD_Balance_Title);
                commit('SET_LSD', navData.AccountProfile.LSD_Balance);
                commit('SET_TYPE_OR_STATUS', navData.AccountProfile.Status);
                commit('SET_PROFILE_DATA', navData.ProfileData);
                commit('SET_LABELS', navData.Labels);
            } else {
                const {
                    FormattedName: formattedName,
                    FormattedCustomerType: formattedCustomerType,
                    FormattedStatus: formattedStatus,
                    FormattedVIPStatus: formattedVIPStatus,
                    ProfileData: profileData,
                    Labels: labels,
                    UserFlags: userFlags,
                    TypeOrStatus: typeOrStatus
                } = navResponse.data.Data || {};

                commit('SET_USER_FLAGS', userFlags);
                commit('SET_PROFILE_DATA', profileData);
                commit('SET_FORMATTED_NAME', formattedName);
                commit('SET_FORMATTED_CUSTOMER_TYPE', formattedCustomerType);
                commit('SET_FORMATTED_STATUS', formattedStatus);
                commit('SET_FORMATTED_VIP_STATUS', formattedVIPStatus);
                commit('SET_TYPE_OR_STATUS', typeOrStatus);
                commit('SET_IS_LOADED');
                commit('SET_LABELS', labels);
            }
        } else {
            logError(api.route, navResponse.error, navResponse.data.ErrorMessages);
        }

        commit('SET_LOADING', false);

        return navResponse;
    },
    emitNavMenuExpanded() {
        bus.$emit('navMenuExpanded');
    },
    closeNavMenu() {
        bus.$emit('closeNavMenu');
    }
};

const getters = {
    firstName() {
        return state.profileData?.CustomerNames?.CustomerFirstName || '';
    },
    isAuthenticated() {
        if(state.isCn) {
            return true;
        }
        return state.userFlags.IsAuthenticated || false;
    },
    onNavMenuExpanded: () => fn => {
        bus.$once('navMenuExpanded', fn);
    },
    onCloseNavMenu: () => fn => {
        bus.$on('closeNavMenu', fn);
    },
    userBalances() {
        return state.profileData?.Balance || {};
    },
    vipStatus() {
        return state.profileData?.CustomerVIPStatus;
    }
};

const mutations = {
    SET_FORMATTED_CUSTOMER_TYPE(state, formattedCustomerType) {
        state.formattedCustomerType = formattedCustomerType;
    },
    SET_FORMATTED_NAME(state, formattedName) {
        state.formattedName = formattedName || '';
    },
    SET_FORMATTED_STATUS(state, formattedStatus) {
        state.formattedStatus = formattedStatus || '';
    },
    SET_FORMATTED_VIP_STATUS(state, formattedVIPStatus) {
        state.formattedVIPStatus = formattedVIPStatus || '';
    },
    SET_TYPE_OR_STATUS(state, typeOrStatus) {
        state.typeOrStatus = typeOrStatus || '';
    },
    SET_IS_CN(state, isCn) {
        state.isCn = isCn;
    },
    SET_GREETING_LABELS(state, greetingLabels) {
        state.greetingLabels = greetingLabels || {};
    },
    SET_LSD_LABELDESKTOP(state, lsdLabels) {
        state.lsdLabels = lsdLabels || '';
    },
    SET_LSD_LABELMOBILE(state, lsdMobileLabels) {
        state.lsdMobileLabels = lsdMobileLabels || '';
    },
    SET_EXPIRING_THIS_MONTH_LABEL(state, expiringThisMonthLabel) {
        state.expiringThisMonthLabel = expiringThisMonthLabel || '';
    },
    SET_HAS_EXPIRING_THIS_MONTH(state, hasExpiringThisMonth) {
        state.hasExpiringThisMonth = hasExpiringThisMonth || false;
    },
    SET_LSD_EXPIRING_IN_CURRENT_MONTH(state, lsdExpiringInCurrentMonth) {
        state.lsdExpiringInCurrentMonth = lsdExpiringInCurrentMonth || '';
    },
    SET_LSD_TITLE(state, lsdTitle) {
        state.lsdTitle = lsdTitle || '';
    },
    SET_LSD(state, lsd) {
        state.lsd = lsd || '';
    },
    SET_LVIP_STATUS(state, lvipStatus) {
        state.lvipStatus = lvipStatus || '';
    },
    SET_LVIP_ICON(state, lvipIcon) {
        state.lvipIcon = lvipIcon || '';
    },
    SET_IS_LOADED(state, isLoaded = true) {
        state.isLoaded = isLoaded;
    },
    SET_LABELS(state, labels) {
        state.labels = labels || {};
    },
    SET_LOADING(state, loading = true) {
        state.loading = loading;
    },
    SET_PROFILE_DATA(state, profileData) {
        state.profileData = profileData;
    },
    SET_USER_FLAGS(state, userFlags) {
        state.userFlags = userFlags;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

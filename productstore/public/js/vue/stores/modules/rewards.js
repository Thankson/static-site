import giftMonthApi from '@api/routes/rewards/welcomegift';
const namespaced = true;

const state = {
    welcomeGiftMonths: [],
    isWelcomeGiftEligible: 0,
    moduleList: [],
    isGiftLoading: false,
    isIntroVideoWatched: false
};

const actions = {
    async getGiftMonths({ commit }) {
        commit('SET_GIFT_LOADING', true);
        await giftMonthApi.get().then((status) => {
            let response = status.data;
            if(response?.Success) {
                const data = response?.Data;
                commit('SET_GIFT_MONTHS', data.Months);
                commit('SET_GIFT_ELIGIBILITY', data.IsEligible);
            } else {
                console.log('Error retrieving customer welcome gift');
            }
        });
        commit('SET_GIFT_LOADING', false);
    }
};

const getters = {
    active() {
        return state.steps[state.stepIndex] || '';
    }
};

const mutations = {
    SET_GIFT_LOADING(state, isLoading) {
        state.isGiftLoading = isLoading;
    },
    SET_GIFT_MONTHS(state, giftMonths) {
        state.welcomeGiftMonths = giftMonths;
    },
    SET_GIFT_ELIGIBILITY(state, months) {
        state.isWelcomeGiftEligible = months;
    },
    SET_INTRO_VIDEO_AS_WATCHED(state, isWatched) {
        state.isIntroVideoWatched = isWatched;
    },
    REGISTER_COMP(state, comp) {
        state.moduleList.push(comp);
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

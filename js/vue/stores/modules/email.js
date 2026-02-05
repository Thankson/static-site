import emailsDuplicateApi from '@api/routes/account/identifications/isDuplicateEmail';

const namespaced = true;
const state = {
    isItDuplicateEmail: false
};

const actions = {
    async getEmailIsDuplicate({ commit }, emailValue) {
        const { data, success } = await emailsDuplicateApi.query({ email: emailValue });
        if(success && data?.Success) {
            const isDuplicate = data?.Data;
            commit('SET_IS_EMAIL_DUPLICATE', isDuplicate);
        } else {
            console.error('An error occured:', data?.ErrorMessages);
        }
    }
};

const mutations = {
    SET_IS_EMAIL_DUPLICATE(state, isDuplicate = false) {
        state.isItDuplicateEmail = isDuplicate;
    }
};

export default {
    namespaced,
    state,
    actions,
    mutations
};

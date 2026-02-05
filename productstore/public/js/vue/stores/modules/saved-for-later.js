import removeApi from '@api/routes/shoppinglists/saveforlater';

const namespaced = true;

const state = {
    savedForLaterItems: []
};

const actions = {
    async removeSavedForLater({dispatch, commit, rootState }, sku) {
        let response;
        if(rootState.shoppingLists?.riverbendSavedForLaterID) {
            response = await dispatch('shoppingLists/removeFromList', {
                payload: {
                    ListId: rootState.shoppingLists.riverbendSavedForLaterID,
                    Sku: sku
                }
            }, {root: true});
        } else {
            response = await removeApi.delete({ Sku: sku });
        }
        if(response.success) {
            commit('REMOVE_SAVED_FOR_LATER', sku);
        }
    }
};

const getters = {
    savedForLaterItems() {
        return state.savedForLaterItems;
    }
};

const mutations = {
    SET_SAVED_FOR_LATER(state, data) {
        state.savedForLaterItems = data.Items;
    },
    REMOVE_SAVED_FOR_LATER(state, sku) {
        const index = state.savedForLaterItems.findIndex(prod => prod.Sku === sku);
        // Removes the element from the array that the vue component will automatically update
        state.savedForLaterItems.splice(index, 1);

        // Tell slick slider an element has been removed, but we don't want slick slider
        // to remove the element since it was removed from the savedForLaterItems array.
        window.removeSavedLaterCarouselItem(state.savedForLaterItems.length);
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

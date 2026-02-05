import Vue from 'vue';
import cart from '@api/routes/cart';
import cartChangeLineType from '@api/routes/cart/linetype';
import saveItem from '@api/routes/shoppinglists/saveforlater';
import saveItemRiverbend from '@api/routes/shoppinglists/riverbendsaveforlater';
import couponsApi from '@api/routes/coupons';
import extraSavingsApi from '@api/routes/promotions/extrasaving';
import specialsApi from '@api/routes/promotions/specials';
import adsApi from '@api/routes/ads';

const eventBus = new Vue();

const namespaced = true;

const state = {
    data: {},
    checkoutUrl: '',
    items: [], // this will need to be independent of the api response to keep track of previously deleted items
    /** @typedef { import("../../utils/attention-items").ValidationItem } ValidationItem */
    /** @type { Array<ValidationItem> } */
    attentionItems: [],
    coupons: [],
    extraSavingsItems: [],
    removedItems: [],
    savedItems: [],
    summary: {},
    localization: {},
    error: false,
    newSaveLater: false,
    loading: false,
    errorMsg: '',
    hasLimitModal: false,
    hasLimitModalContent: {},
    isRiverbend: false,
    lsdOnlyOneProductId: null,
    userFlags: {},
    isCn: null,
    hasMultipleCartErrors: false
};

const actions = {
    async getData({ commit, dispatch }, params) {
        commit('SET_ERROR', false);
        const response = await cart.query(params);

        if(response.success && response?.data?.Success) {
            commit('SET_CART', response.data);
            commit('UPDATE_ATTENTION_ITEMS', response.data.Data?.AttentionItems);

            // update summary store for shared components
            commit('cartSummary/SET_CART_SUMMARY', response.data.Data?.Summary || {}, { root: true });
            commit('cartSummary/SET_WELCOME_PROGRAM_LSD_AVAILABLE', response.data.Data?.Summary || {}, { root: true });

            const adQuery = response.data.Data.Items.map(item => ({
                Sku: item.Sku,
                Position: item.Position,
                LineId: item.LineId
            }));

            const adsResponse = await adsApi.post(adQuery);
            let formattedItems = state.items;

            if(adsResponse.success) {
                const ads = Array.isArray(adsResponse.data) ? adsResponse.data : [];
                // Object Assign -> First starts off with a base of an empty object. Then if it finds an add, it will add
                // it to the empty object. Lastly is the information we got from the cart api. It will overwrite anything
                // mentioned in the ad api (fix for 85328)
                formattedItems = formattedItems.map(item => Object.assign({}, ads.find(ad => ad.Sku === item.Sku), item));
            }

            commit('UPDATE_CART_ITEMS', formattedItems);

            // Get commitment profile used for CN
            if(state.isCn) {
                dispatch('commitmentProfile/getData', true, { root: true });
            }

            return adsResponse.cancelled;
        } else {
            commit('SET_ERROR', true);
            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    async getCoupons({ commit }, params) {
        commit('SET_ERROR', false);
        commit('SET_LOADING', true);
        const response = await couponsApi.query(params);
        commit('SET_LOADING', false);

        if(response.success) {
            commit('SET_COUPONS', response.data.Data);
        } else {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    async getExtraSavings({ commit }, params) {
        commit('SET_ERROR', false);
        let response = null;
        if(state.isRiverbend) {
            response = await specialsApi.query(params);
        } else {
            response = await extraSavingsApi.query(params);
        }

        if(response.success && response.data?.Success) {
            commit('SET_EXTRA_SAVINGS', response.data.Data);
        } else {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    async saveItem({ commit, dispatch, rootState }, lineId) {
        commit('SET_ERROR', false);
        let response;
        if(rootState.shoppingLists?.riverbendSavedForLaterID) {
            response = await saveItemRiverbend.put({ LineId: lineId });
        } else {
            response = await saveItem.put({ LineId: lineId });
        }

        if(response.success) {
            await dispatch('refreshData');
            commit('SET_SAVED_LATER', true);
        } else {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    setIsRiverbend({ commit, dispatch, state }, isRiverbend) {
        commit('attentionItems/SET_IS_RIVERBEND', isRiverbend, { root: true });
        commit('SET_IS_RIVERBEND', isRiverbend);
    },
    async refreshData({ commit, dispatch, state, rootState }, { showSpinner } = { showSpinner: false }) {
        if(showSpinner) {
            commit('SET_LOADING');
        }
        commit('shippingOnUsV2/SET_SOU_DATA', {}, { root: true }); // reset SOU data

        commit('SET_ERROR', false);
        const response = await cart.query({
            ...(process.env.MOCK_SERVER && { refresh: true })
        });

        if(response.success) {
            commit('SET_CART', response.data);
            commit('UPDATE_CART_SUMMARY', response.data.Data?.Summary);
            commit('UPDATE_ATTENTION_ITEMS', response.data.Data?.AttentionItems);
            if(state.isRiverbend) {
                dispatch('freeShipping/getFreeShipping', true, { root: true });
            } else if(response.data.Data?.Summary?.ShippingOnUsEnabled && (rootState.shippingOnUsV2?.rewardConfigId || rootState.shippingOnUsV2?.shippingConfigId)) {
                dispatch('shippingOnUsV2/getSOU', { rewardId: rootState.shippingOnUsV2?.rewardConfigId, shippingId: rootState.shippingOnUsV2?.shippingConfigId }, { root: true });
            }
            // update summary store for shared components
            commit('cartSummary/SET_CART_SUMMARY', response.data.Data?.Summary || {}, { root: true });

            const items = response.data.Data?.Items.map(item => ({
                ...item,
                IsRemoved: false,
                IsSaved: false
            }));

            const removedItems = state.removedItems.map(item => ({
                ...item,
                IsRemoved: true,
                IsSaved: false
            }));

            const savedItems = state.savedItems.map(item => ({
                ...item,
                IsRemoved: false,
                IsSaved: true
            }));

            const mergedItems = [
                ...items,
                ...removedItems,
                ...savedItems
            ].sort((firstItem, secondItem) => {
                return firstItem.Position - secondItem.Position || secondItem.isRemoved - firstItem.isRemoved || secondItem.isSaved - firstItem.isSaved;
            });

            const adQuery = response.data.Data.Items.map(obj => {
                return {
                    Sku: obj.Sku,
                    Position: obj.Position,
                    LineId: obj.LineId
                };
            });
            const adsResponse = await adsApi.post(adQuery);
            let formattedItems = mergedItems;

            if(adsResponse.success) {
                const ads = Array.isArray(adsResponse.data) ? adsResponse.data : [];
                formattedItems = formattedItems.map(item => Object.assign({}, ads.find(ad => ad.Sku === item.Sku), item));
            }

            commit('UPDATE_CART_ITEMS', formattedItems);

            // Get commitment profile used for CN
            if(state.isCn) {
                dispatch('commitmentProfile/getData', true, { root: true });
            }
            dispatch('emitCartRefresh');
            dispatch('addToCart/getUpsells', null, { root: true });
        } else {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }

        if(showSpinner) {
            commit('SET_LOADING', false);
        }
    },
    sendCollectCode({ state }) {
        if(state.items.every(item => item.IsRemoved)) {
            if(window._etmc) {
                window._etmc.push(['trackCart', { 'clear_cart': true } ]);
            }
            return;
        }
        const items = state.items.map(item => {
            return {
                item: `${item.Sku}-${state.data.CountryInitial}`,
                unique_id: item.Sku,
                item_type: 'product',
                name: item.Title,
                url: item.PdpUrl,
                image_url: item.Image?.Url,
                available: true,
                price: item.Price,
                sale_price: item.Price,
                quantity: item.Quantity
            };
        });
        if(window._etmc) {
            window._etmc.push(['trackPageView', {'cart': items}]);
        }
    },
    subtractLastFromRemovedItems({ commit, state }) {
        let removedItems = state.removedItems;
        removedItems.slice(0, -1);
        commit('UPDATE_REMOVED_ITEMS', removedItems);
    },
    subtractFromRemovedItems({ commit, state }, lineId) {
        const removedItems = state.removedItems.filter(item => item.LineId !== lineId);
        commit('UPDATE_REMOVED_ITEMS', removedItems);
    },
    addToRemovedItems({ commit, state }, lineId) {
        const removedItems = state.removedItems.concat(
            state.items.filter(item => {
                return item.LineId === lineId;
            })
        );
        commit('UPDATE_REMOVED_ITEMS', removedItems);
    },
    subtractFromSavedItems({ commit, state }, lineId) {
        const savedItems = state.savedItems.filter(item => item.LineId !== lineId);
        commit('UPDATE_SAVED_ITEMS', savedItems);
    },
    addToSavedItems({ commit, state }, lineId) {
        const savedItems = state.savedItems.concat(
            state.items.filter(item => {
                return item.LineId === lineId;
            })
        );
        commit('UPDATE_SAVED_ITEMS', savedItems);
    },
    async updateItem({ commit }, { sku, quantity, lineType, lineId, position }) {
        const params = {
            Sku: sku,
            Quantity: quantity ?? null,
            LineType: lineType ?? null,
            LineId: lineId ?? null,
            Position: position ?? null
        };

        commit('SET_ERROR', false);

        const response = await cart.put(params);
        if(response.success) {
            const validation = response.data.Data?.Item?.Validation || [];
            const hasModal = validation.filter(item => item.Status === 'Critical').length > 0;
            const modelContent = validation.find(item => item.Status === 'Critical');
            commit('UPDATE_LIMIT_MODAL_SHOW', hasModal);
            commit('UPDATE_LIMIT_MODAL_CONTENT', modelContent);
        } else {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    async updateLineType({commit, dispatch}, data) {
        // As requested from backend, quantity should always be 1
        const response = await cartChangeLineType.post(data);
        if(response.success) {
            commit('UPDATE_LINE_TYPE', data);

            if(data.Quantity > 1 && data.LineType !== 'Normal') {
                dispatch('getData');
            }
        } else {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    async updateQuantity({commit, dispatch, state}, payload) {
        commit('SET_LOADING');
        commit('SET_HAS_UPDATE_MULTIPLE_CART_ERRORS', false);
        await Promise.all(payload.map(async item => {
            await commit('SET_ERROR', false);
            if(item?.quantity > 0) {
                await dispatch('updateItem', item);
            } else {
                await dispatch('removeItem', item);
            }
            if(state.error) {
                commit('SET_HAS_UPDATE_MULTIPLE_CART_ERRORS', true);
            }
        }));

        await dispatch('refreshData');

        commit('SET_LOADING', false);
    },
    async removeItem({ commit }, {lineId}) {
        const params = {
            LineId: lineId ?? null
        };
        commit('SET_ERROR', false);
        const response = await cart.delete(params);

        if(!response.success || !response?.data?.Success) {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    async undoItem({ commit }, { sku, quantity, lineType, lineId, position, promotionId, configurations }) {
        const params = {
            Sku: sku,
            Configurations: configurations ?? null,
            Quantity: quantity ?? null,
            LineType: lineType ?? null,
            LineId: lineId ?? null,
            Position: position ?? null,
            PromotionId: promotionId ?? null
        };
        commit('SET_ERROR', false);
        const response = await cart.post(params);

        if(!response.success) {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
    },
    setLsdOnlyOneProductId({ commit }, { lineId }) {
        commit('SET_LSD_ONE_PROD_ID', lineId);
    },
    emitCartRefresh() {
        eventBus.$emit('cartRefresh');
    }
};

const getters = {
    formattedUsedThisOrder() {
        return state.summary?.LoyaltyShoppingDollars?.FormattedUsed || '';
    },
    formattedRemaining() {
        return state.summary?.LoyaltyShoppingDollars?.FormattedRemaining || '';
    },
    formattedAvailableToSpend() {
        return state.summary?.LoyaltyShoppingDollars?.FormattedAvailableToSpend || '';
    },
    lsdAvailableToSpend() {
        const lsdVal = state.summary?.LoyaltyShoppingDollars?.AvailableToSpend;
        return typeof lsdVal === 'number' && lsdVal >= 0;
    },
    lsdExpiringThisMonth() {
        const lsdVal = state.summary?.LoyaltyShoppingDollars?.ExpiringThisMonth;
        return typeof lsdVal === 'number' && lsdVal >= 0;
    },
    lsdUsedThisOrder() {
        const lsdVal = state.summary?.LoyaltyShoppingDollars?.Used;
        return typeof lsdVal === 'number' && lsdVal >= 0;
    },
    lsdRemaining() {
        const lsdVal = state.summary?.LoyaltyShoppingDollars?.Remaining;
        return typeof lsdVal === 'number' && lsdVal >= 0;
    },
    isBackDated() {
        return state.data.IsOrderBackDated || false;
    },
    formattedBackDatingDate() {
        return state.data.FormattedBackDatingDate || '';
    },
    customerId() {
        return state.data.CustomerId;
    },
    totalLsdBalance() {
        return state.summary?.LoyaltyShoppingDollars?.Balance > 0;
    },
    hasLsdBalance() {
        return state.summary?.LoyaltyShoppingDollars?.Balance > 0 || state.summary?.LoyaltyShoppingDollars?.Used > 0;
    },
    hasWelcomeLsdBalance() {
        return state.summary?.WelcomeProgramLsdAvailable?.Available > 0;
    },
    formattedTotalLsdBalance() {
        return state.summary?.LoyaltyShoppingDollars?.FormattedBalance || '';
    },
    expiringThisMonth() {
        return state.summary?.LoyaltyShoppingDollars?.ExpiringThisMonth > 0;
    },
    formattedExpiringThisMonth() {
        return state.summary?.LoyaltyShoppingDollars?.FormattedExpiringThisMonth || '';
    },
    totalCcBalance() {
        return state.summary?.ConvenienceCertificates?.Balance > 0;
    },
    formattedTotalCcBalance() {
        return state.summary?.ConvenienceCertificates?.FormattedBalance;
    },
    isPreferred() {
        return state.data.IsPreferredMember;
    },
    coupons() {
        return state.coupons || [];
    },
    extraSavings() {
        return state.extraSavingsItems || [];
    },
    error() {
        return state.error;
    },
    summary() {
        return state.summary;
    },
    monthlyPointCommitment() {
        return state.data.MonthlyPointCommitment;
    },
    pointsEarnedInCurrentMonth() {
        return state.data?.PointsEarnedViaProductsInCurrentMonth;
    },
    pointsEarnedViaServicesInCurrentMonth() {
        return state.data?.PointsEarnedViaServicesInCurrentMonth;
    },
    pointsEarnedViaProductsInCurrentMonth() {
        return state.data?.PointsEarnedViaProductsInCurrentMonth;
    },
    hasBogo() {
        return state.data.IsRedirectToBogo;
    },
    hasLimitModal() {
        return state.hasLimitModal;
    },
    hasLimitModalContent() {
        return state.hasLimitModalContent;
    },
    hasMaxServicePoints() {
        return state.data.HasMaxServicePoints;
    },
    onCartRefresh: () => fn => {
        eventBus.$on('cartRefresh', fn);
    }
};

const mutations = {
    REMOVE_COUPON(state, sku) {
        const itemIndex = state.coupons.findIndex(coupon => coupon.Sku === sku);
        state.coupons.splice(itemIndex, 1);
    },
    SET_CART(state, data) {
        state.data = { ...data.Data };
        state.items = data.Data?.Items || [];
        state.points = data.Data?.Summary?.Points || 0;
        state.summary = data.Data?.Summary || {};
        state.attentionItems = data.Data?.AttentionItems || [];
        state.userFlags = data.Data?.UserFlags || {};
    },
    SET_AD_ITEMS(state, items) {
        state.items = items;
    },
    SET_CHECKOUT_URL(state, checkoutUrl) {
        state.checkoutUrl = checkoutUrl;
    },
    SET_COUPONS(state, data) {
        state.coupons = data.Coupons;
        state.hasReminderDate = data.HasReminderDate;
    },
    SET_EXTRA_SAVINGS(state, data) {
        state.extraSavingsItems = data;
    },
    SET_ERROR(state, isError) {
        state.error = isError;
    },
    SET_ERROR_MESSAGE(state, msg) {
        state.errorMsg = msg;
    },
    SET_HAS_UPDATE_MULTIPLE_CART_ERRORS(state, isError) {
        state.hasMultipleCartErrors = isError;
    },
    SET_IS_RIVERBEND(state, bool) {
        state.isRiverbend = bool;
    },
    SET_LOADING(state, loading = true) {
        state.loading = loading;
    },
    SET_LSD_CHECKBOX_MESSAGE(state, items) {
        const itemsCount = items.length;
        const lsdCount = items.filter((obj) => obj.LineType === 'LSD').length;

        if((itemsCount - 1) === lsdCount) {
            const items = state.items.map(obj => {
                if(obj.LineType !== 'LSD') {
                    return {
                        ...obj,
                        lsdTooMany: true,
                        lsdTooltipVariant: true
                    };
                }
                return obj;
            });
            state.items = items;
        } else {
            const items = state.items.map(obj => {
                return {
                    ...obj,
                    lsdTooMany: false,
                    lsdTooltipVariant: false
                };
            });
            state.items = items;
        }
    },
    SET_SAVED_LATER(state, savedLater) {
        state.newSaveLater = savedLater;
    },
    SET_LSD_ONE_PROD_ID(state, id) {
        state.lsdOnlyOneProductId = id;
    },
    UPDATE_CART_ITEMS(state, items) {
        state.items = items;
    },
    UPDATE_LINE_TYPE(state, item) {
        let lineItem = state.items.find(updatedItem => updatedItem.LineId === item.LineId);
        lineItem.LineType = item.LineType;
    },
    UPDATE_CART_SUMMARY(state, summary) {
        state.summary = summary;
    },
    UPDATE_REMOVED_ITEMS(state, removedItems) {
        // Remove duplicates in removedItems
        state.removedItems = removedItems.length > 1
            ? removedItems.filter((item, index, self) => self.findIndex((i) => i.Sku === item.Sku) === index)
            : removedItems;
    },
    UPDATE_SAVED_ITEMS(state, savedItems) {
        state.savedItems = savedItems;
    },
    UPDATE_ATTENTION_ITEMS(state, attentionItems) {
        state.attentionItems = attentionItems;
    },
    UPDATE_LIMIT_MODAL_SHOW(state, hasModal) {
        state.hasLimitModal = hasModal;
    },
    UPDATE_LIMIT_MODAL_CONTENT(state, modelContent) {
        state.hasLimitModalContent = modelContent;
    },
    SET_IS_CN(state, isCn) {
        state.isCn = isCn;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

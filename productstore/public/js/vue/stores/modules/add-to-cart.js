import ApiService from '@api/api-service';
import buoApi from '@api/routes/backuporder/cart';
import cartApi from '@api/routes/cart';
import cartUpsellApi from '@api/routes/cart/upsells';
import promoMessagesApi from '@api/routes/promotions/messages';

import AttentionItemUtil from '../../utils/attention-items';

const namespaced = true;

const state = {
    showConfirmation: false,
    isPreferred: false,
    isEdit: false,
    isSeasonalEvents: false,
    canEditMoreThanQuantity: false,
    cartData: {},
    cartType: null,
    cartIsUpdating: false,
    configurations: [],
    lineType: 'Normal',
    promotionId: '',
    loading: false,
    errorIds: [],
    loadingLineIds: [],
    hasCartErrors: false,
    cartErrorMsg: '',
    selectedLineId: '',
    selectedSku: '',
    selectedQuantity: 0,
    upgradeAdPrevLineId: null,
    upsell: null,
    upsells: [],
    requestId: null,
    loadingPromoMessages: false,
    promoMessages: [],
    pageType: '',
    inlineMessages: '',
    oneStepEligible: false,
    userFlags: {},
    cartRequestFail: false,
    needsConfigurations: false,
    cartUnavailableItems: {},
    bogoAddToCartProduct: {}
};

const actions = {
    addToCart({ dispatch }, data) {
        if(state.cartType === 'backuporder') {
            dispatch('updateBou', {
                Sku: data.product.Sku,
                FamilyId: data.product.FamilyId,
                Quantity: data.product.Quantity,
                Configurations: data.product.Configurations,
                Category: data.product.Category,
                LineItemId: data.product.LineItemId
            });
        } else if(state.cartType === 'upsell') {
            let filteredUpsell = state.upsell?.Products.map(product => {
                let kitConfiguration;
                // If we need additional items to satisfy for upsell, we are showing the configurator,
                // so we get the selected configurations from `data.product.Configurations`:
                if(state.upsell.AdditionalQuantityToSatisfy) {
                    kitConfiguration = data.product.Configurations;
                // If additional items to satisfy is 0, configurations are already selected;
                // so we just pass the configurations from the upsell GET response:
                } else {
                    kitConfiguration = product.Configurations?.map(x => {
                        return {'FeatureSku': x.FeatureSku, 'SelectedSku': x.SelectedSku };
                    });
                }
                return {
                    'Sku': product.Sku,
                    'KitConfiguration': kitConfiguration
                };
            });

            dispatch('updateUpsells', {
                lineId: state.upsell.LineId,
                qualifyingLineIds: state.upsell.QualifyingLineIds,
                upsell: filteredUpsell,
                Configurations: data.product.Configurations
            });
        } else {
            dispatch('updateCart', {
                Sku: data.product.Sku,
                FamilyId: data.product.FamilyId,
                Quantity: data.product.Quantity,
                Configurations: data.product.Configurations,
                PromotionId: data.product.PromotionId,
                LineType: data.product.LineType,
                LineId: data.product.LineId,
                ListId: data.product.ListId,
                RevenueSource: data.product.RevenueSource,
                Position: data.product.Position,

                // Used only on PatternLab to display Service Failure message
                ...(data.forceError && process?.env?.NODE_ENV === 'development' && { forceError: data.forceError })
            });
        }
    },
    async getUpsells({ commit }) {
        const response = await cartUpsellApi.get();

        if(response.success && response.data && response.data.Success) {
            const data = response.data.Data;
            commit('SET_UPSELLS', data?.Upsells);
        }
    },
    async replaceItem({ dispatch, commit, state }, data) {
        await dispatch('removeItem', {
            lineId: data.oldLineId
        }).then(() => {
            if(!state.hasCartErrors) {
                dispatch('updateCart', {
                    Sku: data.product.Sku,
                    FamilyId: data.product.FamilyId,
                    Quantity: data.product.Quantity,
                    Configurations: data.product.Configurations,
                    PromotionId: data.product.PromotionId,
                    LineType: data.product.LineType,
                    LineId: data.product.LineId,
                    RevenueSource: data.product.RevenueSource,
                    Position: data.product.Position
                }).then(() => {
                    if(state.hasCartErrors) {
                        commit('ADD_ERROR_IDS', data.product.LineId);
                    }
                });
            } else {
                commit('ADD_ERROR_IDS', data.oldLineId);
            }
        });
    },
    async undoItem({ commit }, { sku, quantity, lineType, lineId, position }) {
        commit('ADD_LOADING_LINE_ID', lineId);
        const params = {
            Sku: sku,
            Quantity: quantity ?? null,
            LineType: lineType ?? null,
            LineId: lineId ?? null,
            Position: position ?? null
        };
        commit('SET_ERROR', false);
        const response = await cartApi.post(params);

        if(!response.success) {
            commit('SET_ERROR', true);

            if(response.error) {
                commit('SET_ERROR_MESSAGE', response.error);
            }
        }
        commit('REMOVE_LOADING_LINE_ID', lineId);
    },
    async updateBou({ commit, state, dispatch }, data) {
        commit('SET_LOADING', true);
        commit('UPDATING_CART', true);
        let api = buoApi;
        if(state.isEdit) {
            api = await new ApiService(`${api.route}/${data.LineItemId}`);
        }

        const response = !state.isEdit ? await api.post(data) : await api.put(data);
        if(response.success) {
            const cartData = response.data.Data;
            const attentionItems = new AttentionItemUtil(cartData.Item.Validation);
            if(response.data.Success) {
                commit('CLEAR_CART_ERRORS');

                if(cartData.Item.Details && !attentionItems.isCritical) {
                    commit('ADD_TO_CART', { cartData });
                    commit('UPDATING_CART', false);
                    commit('SET_INLINE_MESSAGES', attentionItems.inlineMessages);
                } else {
                    commit('SHOW_CART_ERRORS', { message: attentionItems.inlineMessages });
                }
            } else {
                const message = response.ErrorMessages?.filter(error => error.Translation).map(error => error.Translation).join('<br />') || '';
                commit('SHOW_CART_ERRORS', { message });
            }
        } else {
            console.warn(response.error);
        }

        commit('SET_LOADING', false);
    },
    async updateUpsells({ commit, dispatch, state }, data) {
        commit('SET_LOADING', true);
        commit('ADD_LOADING_LINE_ID', data.LineId);
        commit('SET_CONFIG', data.Configurations);

        const response = await cartUpsellApi.post(data);

        if(response.success) {
            commit('SET_CART_REQUEST_FAIL', false);
            if(response.data.Success) {
                const upsellData = response.data.Data || {};
                commit('CLEAR_CART_ERRORS');
                // Promo Messages
                commit('SET_REQUEST_ID', upsellData.RequestId);

                // If there's some unavailable item and BE says NOT to display the shelf confirmation
                const hasUnavailableItems = upsellData.Items?.some(item => item.Validation?.length);
                console.log('hasUnavailableItems: ', hasUnavailableItems);
                console.log('ShowConfirmation: ', upsellData.ShowConfirmation);
                if(hasUnavailableItems && !upsellData.ShowConfirmation) {
                    // find which items have failed; if `Validation` property (array) is not empty, then it has not been added:
                    let unavailableItems = upsellData.Items
                        .filter(item => item.Validation.length);

                    // Set unavailable items data to be displayed in the modal
                    commit('SET_UNAVAILABLE_ITEMS', unavailableItems);
                } else {
                    // Clear unavailable items data
                    commit('SET_UNAVAILABLE_ITEMS', []);
                    // Refresh Cart
                    dispatch('cart/refreshData', { showSpinner: true }, { root: true });

                    if(state.cartType === 'upsell') {
                        // confirmation shelf is looking for a specific schema in `state.cartData`, so we map the object accordingly:
                        const cartData = {
                            ComputedQuantity: upsellData.ComputedQuantity,
                            Item: upsellData.Items[0],
                            Products: upsellData.Products,
                            ShowConfirmation: upsellData.ShowConfirmation,
                            Summary: upsellData.CartSummary,
                            UserFlags: upsellData.UserFlags
                        };
                        commit('ADD_TO_CART', { cartData });
                    }
                }
            } else {
                console.warn('ErrorMessages on Upsells: ', response.data);
                const message = response.data?.ErrorMessages?.filter(error => error.Translation).map(error => error.Translation).join('<br />') || 'Error';
                commit('SHOW_CART_ERRORS', { message });
            }
        } else {
            commit('SET_CART_REQUEST_FAIL', true);
            console.warn(response.error);
        }
        commit('REMOVE_LOADING_LINE_ID', data.LineId);
        commit('SET_LOADING', false);
    },
    async updateCart({ commit, dispatch, state, rootState }, data) {
        let editCartResponse = '';
        commit('SET_LOADING', true);
        commit('ADD_LOADING_LINE_ID', data.LineId);
        commit('SET_CONFIG', data.Configurations);

        if(state.isEdit) {
            editCartResponse = await cartApi.put(data);
        } else {
            editCartResponse = await cartApi.post(data);
        }

        const response = editCartResponse;

        if(response.success) {
            commit('SET_CART_REQUEST_FAIL', false);
            if(response.data.Success) {
                const cartData = response.data.Data;
                commit('CLEAR_CART_ERRORS');
                // Promo Messages
                commit('SET_REQUEST_ID', cartData.RequestId);

                const attentionItems = new AttentionItemUtil(cartData.Item.Validation);
                const isCart = state.pageType === 'CART';
                const shouldGetCartData = state.pageType === 'FREE_PRODUCTS';
                if(cartData.Item.Details && !attentionItems.isCritical) {
                    commit('ADD_TO_CART', { cartData });
                    commit('SET_INLINE_MESSAGES', attentionItems.inlineMessages);

                    // this is used on the shelf for the shipping on us banner
                    commit('cart/UPDATE_CART_SUMMARY', response.data.Data?.Summary || {}, { root: true });

                    // this will update the number on the cart icon in the header
                    commit('cartSummary/SET_CART_SUMMARY', response.data.Data?.Summary || {}, { root: true });
                    // update lsd available values in cart summary
                    commit('cartSummary/SET_WELCOME_PROGRAM_LSD_AVAILABLE', response.data.Data?.Summary || {}, { root: true });

                    // Only refresh if add to cart comes from cart page
                    if(isCart || shouldGetCartData) {
                        dispatch('cart/refreshData', { showSpinner: true }, { root: true });
                    }
                } else {
                    // remove loader so shelf can show errors
                    commit('ADD_TO_CART', { cartData, shelfError: true });
                    commit('SET_IS_ONE_STEP_ELIGIBLE', false);
                    commit('SHOW_CART_ERRORS', { message: attentionItems.inlineMessages });
                }
                // for SeasonalEvents
                if(state.isSeasonalEvents) {
                    dispatch('seasonalEvents/getData', true, { root: true });
                }
            } else {
                console.warn('ErrorMessages on AddToCart: ', response.data);
                const message = response.data?.ErrorMessages?.filter(error => error.Translation).map(error => error.Translation).join('<br />') || 'Error';
                commit('SHOW_CART_ERRORS', { message });
            }
        } else {
            commit('SET_CART_REQUEST_FAIL', true);
            console.warn(response.error);
        }
        commit('REMOVE_LOADING_LINE_ID', data.LineId);
        commit('SET_LOADING', false);
    },
    async removeItem({ commit }, {lineId}) {
        commit('ADD_LOADING_LINE_ID', lineId);
        const params = {
            LineId: lineId ?? null
        };
        const response = await cartApi.delete(params);

        if(!response.data.Success) {
            commit('ADD_ERROR_IDS', lineId);
            const message = response.ErrorMessages?.filter(error => error.Translation).map(error => error.Translation).join('<br />') || '';
            commit('SHOW_CART_ERRORS', { message: message });
        }
        commit('REMOVE_LOADING_LINE_ID', lineId);
    },
    async updatePromoMessage({ commit }, data) {
        commit('UPDATE_LOADING', {target: 'loadingPromoMessages', value: true});
        const response = await promoMessagesApi.query({id: data});

        if(response.success) {
            commit('SET_PROMO_MESSAGES', response.data.Data);
            commit('UPDATE_LOADING', {target: 'loadingPromoMessages', value: false});
        } else {
            // if any error
            commit('SET_PROMO_MESSAGES', '');
            commit('UPDATE_LOADING', {target: 'loadingPromoMessages', value: false});
        }
    }
};

const getters = {
    isPreferred(state) {
        return state.cartType === 'backuporder' ? true : state.isPreferred;
    },
    isBackupOrder(state) {
        return state.cartType === 'backuporder';
    },
    upgradeAdPrevLineId(state) {
        return state.upgradeAdPrevLineId;
    },
    showConfirmation(state) {
        return state.showConfirmation;
    }
};

const mutations = {
    ADD_TO_CART(state, payload) {
        const shelfError = payload.shelfError;
        if(!shelfError) {
            state.showConfirmation = true;
        }
        state.cartData = payload.cartData;
    },
    ADD_LOADING_LINE_ID(state, lineId) {
        if(!state.loadingLineIds.includes(lineId)) {
            let lineIds = [ ...state.loadingLineIds ];
            lineIds.push(lineId);
            state.loadingLineIds = lineIds;
        }
    },
    REMOVE_LOADING_LINE_ID(state, lineId) {
        state.loadingLineIds = state.loadingLineIds.filter(loadingLineId => loadingLineId !== lineId);
    },
    REMOVE_ERROR_IDS(state, lineIds) {
        lineIds.forEach((lineId) => {
            state.errorIds = state.errorIds.filter(errorId => errorId !== lineId || errorId !== lineId);
        });
    },
    ADD_ERROR_IDS(state, id) {
        if(!state.errorIds.includes(id)) {
            let ids = [ ...state.errorIds ];
            ids.push(id);
            state.errorIds = ids;
        }
    },
    RESET_CONFIRMATION(state) {
        state.showConfirmation = false;
    },
    RESET_PROMO_MESSAGES(state) {
        state.promoMessages = [];
    },
    SET_CAN_EDIT_MORE_THAN_QUANTITY(state, bool) {
        state.canEditMoreThanQuantity = bool;
    },
    SET_CART_DATA(state, data) {
        state.selectedSku = data.Sku;
        state.selectedLineId = data.LineId;
        state.promotionId = data.PromotionId;
        state.lineType = data.LineType;
        state.cartType = data.CartType;
        state.selectedQuantity = data.Quantity;
    },
    SET_PAGE_TYPE(state, data) {
        state.pageType = data;
    },
    SET_CONFIG(state, configurations) {
        state.configurations = configurations;
    },
    SET_IS_ONE_STEP_ELIGIBLE(state, oneStepEligible) {
        if(!state.isEdit) {
            state.oneStepEligible = Boolean(oneStepEligible);
        }
    },
    SET_IS_SEASONAL_EVENTS(state, value) {
        state.isSeasonalEvents = value;
    },
    SHOW_CART_ERRORS(state, payload) {
        state.hasCartErrors = true;
        state.cartErrorMsg = payload.message;
    },
    CLEAR_CART_ERRORS(state) {
        state.hasCartErrors = false;
        state.cartErrorMsg = '';
    },
    SET_LOADING(state, loading) {
        state.loading = loading;
    },
    SET_PROMO_MESSAGES(state, data) {
        state.promoMessages = data;
    },
    SET_REQUEST_ID(state, data) {
        state.requestId = data;
    },
    SET_INLINE_MESSAGES(state, inlineMessages) {
        state.inlineMessages = inlineMessages;
    },
    SET_IS_PREFERRED(state, isPreferred) {
        state.isPreferred = isPreferred;
    },
    SET_IS_EDIT(state, isEdit) {
        state.isEdit = isEdit;
    },
    SET_NEEDS_CONFIGURATIONS(state, needsConfigurations) {
        state.needsConfigurations = needsConfigurations;
    },
    SET_UPGRADE_AD_PREV_LINE_ID(state, prevLineId) {
        state.upgradeAdPrevLineId = prevLineId;
    },
    SET_UPSELL(state, upsell) {
        state.upsell = upsell;
    },
    SET_UPSELLS(state, upsells) {
        state.upsells = upsells;
    },
    SET_USER_FLAGS(state, flags) {
        state.userFlags = flags;
    },
    SET_CART_REQUEST_FAIL(state, fail) {
        state.cartRequestFail = fail;
    },
    UPDATE_LOADING(state, payload) {
        state[payload.target] = payload.value;
    },
    UPDATING_CART(state, payload) {
        state.cartIsUpdating = payload;
    },
    SET_UNAVAILABLE_ITEMS(state, items) {
        if(items?.length) {
            state.cartUnavailableItems = {
                Items: items
            };
        } else {
            state.cartUnavailableItems = {};
        }
    },
    SET_BOGO_ADD_TO_CARD_PRODUCT(state, product) {
        state.bogoAddToCartProduct = product;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

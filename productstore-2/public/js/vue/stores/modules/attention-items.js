import AttentionItemUtil from '../../utils/attention-items';

const namespaced = true;

const state = {
    /** @type {AttentionItemUtil} */
    attentionItemUtil: null,
    dirty: false,
    isRiverbend: false
};

const actions = {};

const getters = {
    // Attention Item error messages being added using attention-item util file
    attentionItemErrorMessages() {
        return state.attentionItemUtil?.attentionItemErrorMessages || [];
    },
    critical() {
        return state.attentionItemUtil?.critical;
    },
    footerMessages() {
        return state.attentionItemUtil?.footerMessages || '';
    },
    inlineMessages() {
        return state.attentionItemUtil?.inlineMessages || '';
    },
    lineItemMessages() {
        return state.attentionItemUtil?.lineItemMessages || {};
    },
    messages() {
        return state.attentionItemUtil?.messages || [];
    },
    modals() {
        return state.attentionItemUtil?.modals || [];
    },
    validationCodes() {
        return state.attentionItemUtil?.attentionItems?.map(item => item.ValidationCode) || [];
    }
};

const mutations = {
    SET_ATTENTION_ITEMS(state, { attentionItems, excludedInlineAttentionItems }) {
        state.attentionItemUtil = new AttentionItemUtil(attentionItems, excludedInlineAttentionItems);
    },
    SET_DIRTY(state, dirty) {
        state.dirty = dirty;
    },
    SET_IS_RIVERBEND(state, bool) {
        state.isRiverbend = bool;
    },
    UPDATE_ERROR_MESSAGES_FOR_STICKY_TOAST_MODAL(state, snippetArray) {
        !state.attentionItemUtil.attentionItemErrorMessages?.includes(snippetArray) &&
        state.attentionItemUtil.attentionItemErrorMessages?.push(snippetArray);
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

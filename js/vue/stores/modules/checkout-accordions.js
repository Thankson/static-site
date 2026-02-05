import Vue from 'vue';

const namespaced = true;

// using event bus here because these events shouldn't be used globally
// initializing outside of state since it doesn't need any reactivity
const eventBus = new Vue();

const VALIDATION_CODES = {
    PAYMENT_METHOD: [
        'DayWaitAchRule',
        'OverMonthlyAchOrders',
        'OrderOverMonthlyTotal',
        'PaymethodExpirationDateExpired',
        'NoSelectedMethodOfPayment',
        'CollectionHoldAch'
    ],
    SHIPPING_ADDRESS: [
        'ShippingAddressIncomplete',
        'UnverifiedAddress'
    ],
    SHIPPING_METHOD: [
        'OrderShipMethodChanged',
        'InvalidShipMethodAch',
        'OrderProductNonShippable'
    ]
};

const state = {
    paymentMethodError: false,
    shippingAddressError: false,
    shippingMethodError: false
};

const actions = {
    expandInvoice() {
        eventBus.$emit('expandInvoice');
    },
    expandPaymentMethod() {
        eventBus.$emit('expandPaymentMethod');
    },
    expandGuiOption() {
        eventBus.$emit('expandGuiOption');
    },
    expandShippingAddress() {
        eventBus.$emit('expandShippingAddress');
    },
    expandShippingMethod() {
        eventBus.$emit('expandShippingMethod');
    },
    collapseInvoice() {
        eventBus.$emit('collapseInvoice');
    },
    collapsePaymentMethod() {
        eventBus.$emit('collapsePaymentMethod');
    },
    collapseGuiOption() {
        eventBus.$emit('collapseGuiOption');
    },
    collapseShippingAddress() {
        eventBus.$emit('collapseShippingAddress');
    },
    collapseShippingMethod() {
        eventBus.$emit('collapseShippingMethod');
    },
    openAccordionModal() {
        eventBus.$emit('openAccordionModal');
    },
    resetShippingMethodError({commit}) {
        commit('SET_SHIPPING_METHOD_ERROR', false);
    }
};

const getters = {
    onExpandGuiOption: () => fn => {
        eventBus.$on('expandGuiOption', fn);
    },
    onExpandInvoice: () => fn => {
        eventBus.$on('expandInvoice', fn);
    },
    onExpandPaymentMethod: () => fn => {
        eventBus.$on('expandPaymentMethod', fn);
    },
    onExpandShippingAddress: () => fn => {
        eventBus.$on('expandShippingAddress', fn);
    },
    onExpandShippingMethod: () => fn => {
        eventBus.$on('expandShippingMethod', fn);
    },
    onCollapseGuiOption: () => fn => {
        eventBus.$on('collapseGuiOption', fn);
    },
    onCollapseInvoice: () => fn => {
        eventBus.$on('collapseInvoice', fn);
    },
    onCollapsePaymentMethod: () => fn => {
        eventBus.$on('collapsePaymentMethod', fn);
    },
    onCollapseShippingAddress: () => fn => {
        eventBus.$on('collapseShippingAddress', fn);
    },
    onCollapseShippingMethod: () => fn => {
        eventBus.$on('collapseShippingMethod', fn);
    },
    onOpenAccordionModal: () => fn => {
        eventBus.$on('openAccordionModal', fn);
    },
    paymentMethodError(state, getters, rootState, rootGetters) {
        const errorCode = rootGetters['attentionItems/validationCodes']?.some(code => VALIDATION_CODES.PAYMENT_METHOD.includes(code)) || false;
        return errorCode || state.paymentMethodError;
    },
    shippingAddressError(state, getters, rootState, rootGetters) {
        const errorCode = rootGetters['attentionItems/validationCodes']?.some(code => VALIDATION_CODES.SHIPPING_ADDRESS.includes(code)) || false;
        return errorCode || state.shippingAddressError;
    },
    shippingMethodError(state, getters, rootState, rootGetters) {
        const errorCode = rootGetters['attentionItems/validationCodes']?.some(code => VALIDATION_CODES.SHIPPING_METHOD.includes(code)) || false;
        return errorCode || state.shippingMethodError;
    }
};

const mutations = {
    SET_PAYMENT_METHOD_ERROR(state, hasError = true) {
        state.paymentMethodError = hasError;
    },
    SET_SHIPPING_ADDRESS_ERROR(state, hasError = true) {
        state.shippingAddressError = hasError;
    },
    SET_SHIPPING_METHOD_ERROR(state, hasError = true) {
        state.shippingMethodError = hasError;
    }
};

export default {
    namespaced,
    state,
    mutations,
    getters,
    actions
};

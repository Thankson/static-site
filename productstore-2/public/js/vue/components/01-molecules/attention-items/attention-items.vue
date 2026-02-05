<template>
    <div>
        <!-- With sequence open error, button needs to look disabled-->
        <!-- With sticky toast visible, button needs to move below errors-->
        <v-button
            v-if="!isStickyToastVisible"
            :class="[ buttonClass, {'-pointer-events-none' : disabled },
                      {'-disabled -cursor-pointer' : isVisuallyDisabled } ]"
            :disabled="!isVisuallyDisabled && disabled"
            data-testid="button-attentionItems"
            @click="onClick">

            <slot />
        </v-button>

        <template v-if="$slots['between']">
            <slot name="between" />
        </template>

        <div v-if="showInlineMessages" class="mt-5" role="alert">
            <span v-html="inlineMessages"></span>

            <slot name="inline-messages" />
        </div>

        <!-- CTA Button on sticky toast-->
        <v-button
            v-if="isStickyToastVisible"
            :class="[ buttonClass, {'-disabled -cursor-pointer' : isVisuallyDisabled} ]"
            :disabled="!isVisuallyDisabled && disabled"
            data-testid="button-attentionItems"
            @click="onClick">
            <slot />
        </v-button>

        <component
            :is="modal.component"
            v-for="(modal, i) in modalQueue"
            ref="modal"
            :key="i"
            :code="modal.validationCode"
            :modal-data="modal.modalData"
            :checkout="handler"
            :is-checkout-edit-account-info="isCheckoutEditAccountInfo"
            @hide="onModalHide" />
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

    // attention item modals
    import badDebt from './modals/aif-bad-debt.vue';
    import bogo from './modals/aif-bogo.vue';
    import duplicateOrder from './modals/aif-duplicate-orders.vue';
    import oneButton from './modals/aif-one-button.vue';
    import giftPromotion from './modals/aif-gift-promotion.vue';
    import homeConversionPack from './modals/aif-home-conversion-pack.vue';
    import invalidShipMethodAch from './modals/aif-invalid-ship-method.vue';
    import invalidShippingAddress from './modals/aif-invalid-shipping-address.vue';
    import lsdAlert from './modals/aif-lsd-alert.vue';
    import lsdBalanceChange from './modals/aif-lsd-balance-change.vue';
    import lsdOnly from './modals/aif-lsd-only.vue';
    import lsdOnlyCheckout from './modals/aif-lsd-only-checkout.vue';
    import nonshippable from './modals/aif-non-shippable.vue';
    import riverbendNonShippable from './modals/aif-riverbend-non-shippable.vue';
    import nonSkuGifts from './modals/aif-non-sku-gifts.vue';
    import noPayMethod from './modals/aif-no-pay-method.vue';
    import noShipLsd from './modals/aif-no-ship-lsd.vue';
    import orderMax from './modals/aif-order-max.vue';
    import orderMaxMx from './modals/aif-order-max-mx.vue';
    import orderShipMethodChanged from './modals/aif-order-ship-method-changed.vue';
    import outOfStock from './modals/aif-out-of-stock.vue';
    import collectionHoldAch from './modals/aif-collection-hold-ach.vue';
    import productPointCommitment from './modals/aif-product-point-commitment.vue';
    import unverifiedAddress from './modals/aif-verify-address.vue';
    import pue from './modals/aif-pue.vue';
    import pueNotice from './modals/aif-pue-notice.vue';
    import reactivationNotMet from './modals/aif-reactivation-not-met.vue';
    import singlAchOrderMax from './modals/aif-single-ach-order-max.vue';
    import pendingOrder from './modals/aif-pending-order.vue';
    import weightLimitExceeded from './modals/aif-weight-limit-exceeded.vue';
    import showSurcharge from './modals/aif-alaska-shipping-surcharge.vue';
    import showPricesChanged from './modals/aif-puerto-rico-prices-changed.vue';
    import reactivationGiftNotMet from './modals/aif-reactivation-gift-not-met.vue';

    const aiModalArray = [
        badDebt,
        bogo,
        duplicateOrder,
        giftPromotion,
        homeConversionPack,
        invalidShipMethodAch,
        invalidShippingAddress,
        lsdAlert,
        lsdBalanceChange,
        lsdOnly,
        lsdOnlyCheckout,
        nonshippable,
        riverbendNonShippable,
        nonSkuGifts,
        noPayMethod,
        noShipLsd,
        orderMax,
        orderMaxMx,
        orderShipMethodChanged,
        outOfStock,
        collectionHoldAch,
        oneButton,
        productPointCommitment,
        unverifiedAddress,
        pue,
        pueNotice,
        singlAchOrderMax,
        reactivationNotMet,
        pendingOrder,
        weightLimitExceeded,
        showSurcharge,
        showPricesChanged,
        reactivationGiftNotMet
    ];

    export default {
        name: 'MAttentionItems',
        props: {
            /**
             * array of attention items or attention items
             * @type {Array<AttentionItem>}
             */
            attentionItems: {
                type: Array,
                default: () => []
            },
            buttonClass: {
                type: String,
                default: '-cartCheckout'
            },
            deferOnLoad: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
            /**
             * array of inline attention items to exclude
             * - inline item will be excluded via it's error code string
             * @type {Array<string>}
             */
            excludedInlineAttentionItems: {
                type: Array,
                default: () => []
            },
            /** function to execute once user is in a valid state to proceed */
            handler: {
                type: Function,
                required: true
            },
            hasSequenceOpenErrorOnCheckout: {
                type: Boolean,
                default: false
            },
            hide: {
                type: Boolean,
                default: false
            },
            isCheckoutEditAccountInfo: {
                type: Boolean,
                default: false
            },
            isStickyToastVisible: {
                type: Boolean,
                default: false
            },
            showImprovedCTACheckout: {
                type: Boolean,
                default: false
            },
            showSequenceOpenErrorOnCheckout: {
                type: Boolean,
                default: false
            },
            visuallyDisabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                aifModals: {},
                attentionItemUtil: null,
                /** @typedef { import("../../../utils/attention-items").Modal } Modal */
                /** @typedef { import("../../../utils/attention-items").ModalData } ModalData */
                /**
                 * array of modal components that can be shown
                 * - if attention items array is updated, all acknowledged values will be reset to false because of possible context switching with different products
                 * - any validation with the "Critical" status can't be "acknowledged" until user fixes the problem (acknowledged can never be true for these items)
                 * @type {Array<{
                 *  acknowledged: boolean
                 *  component: Vue,
                 *  modaDatal: ModalData,
                 *  validationCode: string
                 * }>}
                 */
                modalQueue: []
            };
        },
        computed: {
            ...mapState('attentionItems', ['isRiverbend', 'dirty']),
            ...mapGetters('attentionItems', ['critical', 'inlineMessages', 'modals']),

            isVisuallyDisabled() {
                return this.visuallyDisabled || this.hasSequenceOpenErrorOnCheckout;
            },
            showInlineMessages() {
                return !this.isStickyToastVisible && !this.hide && this.inlineMessages.length;
            }
        },
        watch: {
            attentionItems() {
                this.SET_ATTENTION_ITEMS({
                    attentionItems: this.attentionItems,
                    excludedInlineAttentionItems: this.excludedInlineAttentionItems
                });
            },
            excludedInlineAttentionItems() {
                this.SET_ATTENTION_ITEMS({
                    attentionItems: this.attentionItems,
                    excludedInlineAttentionItems: this.excludedInlineAttentionItems
                });
            },
            modals() {
                this.generateModalQueue();
            }
        },
        created() {
            // non-reactive bool to indicate if onLoad action has happened
            this._loaded = false;

            const aifModals = {};

            // map aif modals by error code
            aiModalArray.forEach((modal) => {
                modal.errorCodes?.forEach((code) => {
                    aifModals[code] = modal;
                });
            });

            this.aifModals = aifModals;
        },
        mounted() {
            this.SET_ATTENTION_ITEMS({
                attentionItems: this.attentionItems,
                excludedInlineAttentionItems: this.excludedInlineAttentionItems
            });

            if(this.deferOnLoad) {
                this.$once('onLoad', this.onLoad);
            } else {
                this.onLoad();
            }
        },
        methods: {
            ...mapActions('cart', ['setLsdOnlyOneProductId']),
            ...mapMutations('attentionItems', ['SET_ATTENTION_ITEMS', 'SET_DIRTY']),
            generateModalQueue() {
                this.setLsdOnlyOneProductId({lineId: null});
                this.modalQueue =
                    this.modals
                        .filter(modal => this.aifModals[modal.validationCode])
                        .map(modal => ({
                            ...modal,
                            acknowledged: modal.ignoreCta ?? false, // Set as true if ignoreCta
                            component: this.aifModals[modal.validationCode]
                        }));

                // if showImprovedCTACheckout flag is off, verify if any ForceLoad modals need to be shown
                if(!this.showImprovedCTACheckout || !this.dirty) {
                    this.verifyForceLoadAI();
                }
            },
            onClick() {
                // On ShowImprovedCTACheckout flag enabled placing order should check for Sequence Open Error first
                if(this.hasSequenceOpenErrorOnCheckout) {
                    this.handler();
                } else if(!this.disabled) {
                    this.SET_DIRTY(true);
                    const allModalsAcknowledged = this.modalQueue.every(({ acknowledged }) => acknowledged);
                    if(!this.critical && allModalsAcknowledged) {
                        this.handler();
                    } else if(this.modalQueue.length > 0) {
                        const nextModalIndex = this.modalQueue.findIndex(({ acknowledged }) => !acknowledged);
                        if(nextModalIndex > -1) {
                            this.$refs['modal'][nextModalIndex].$emit('show');
                        }
                    }
                }
            },
            onLoad() {
                if(!this._loaded) {
                    this._loaded = true;

                    this.verifyForceLoadAI();
                }
            },
            verifyForceLoadAI() {
                this.$nextTick(() => {
                    const index = this.modalQueue.findIndex(({ modalData }) => modalData.ForceLoad);
                    if(index > -1) {
                        this.$refs['modal'][index].$emit('show');
                    }
                });
            },
            onModalHide({ code }) {
                for (let i = 0; i < this.modalQueue.length; i++) {
                    const modal = this.modalQueue[i];
                    if(!modal.critical && modal.validationCode === code) {
                        let modals = [ ...this.modalQueue ];
                        modals[i].acknowledged = true;
                        this.modalQueue = modals;
                        break;
                    }
                }
            }
        }
    };
</script>

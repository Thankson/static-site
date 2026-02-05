<template>
    <div
        class="o-cartItem"
        :class="{'-isCn':isCn}"
        :data-testid="`cartItemContainer${sku}-div`"
    >
        <div class="o-cartItem__row -product" :class="{'-upsell': showUpsellMessage}">
            <div
                v-if="isRemoved || isSaved"
                class="o-cartItem__container -removed">

                <component
                    :is="pdpUrl ? 'a' : 'div'"
                    :href="pdpUrl ? pdpUrl : false"
                    class="o-cartItem__thumbnail -smaller">

                    <span class="aspectRatioBox -aspect-1-1">
                        <img
                            :src="imgSrc"
                            :alt="imgAlt"
                            class="aspectRatioBox__content" />
                    </span>
                </component>

                <div
                    v-if="isRemoved"
                    class="self-center"
                    :class="{'-isCn -removed' : isCn}">

                    <slot name="item-removed" />

                    <button
                        v-if="!ino"
                        class="o-cartItem__link -inline font-bold no-underline"
                        data-testid="cartItemUndo-button"
                        @click="undo"
                    >

                        <slot name="undo-removed" />
                    </button>
                </div>

                <button
                    v-if="isRemoved"
                    :id="`isRemovedButton${sku}`"
                    tabindex="0"
                    aria-label="Close Box"
                    class="ml-auto"
                    @click="dismissRemoved">
                    <p class="sr-only" role="alert">{{ itemRemovedLabel }}</p>
                    <img
                        src="//cdnsc1.melaleuca.com/na/images/header/clear2x.png"
                        alt="Close Box"
                        aria-hidden="true" />
                </button>

                <div
                    v-if="isSaved"
                    class="flex items-center self-center">

                    <slot name="item-saved" />

                    <span class="o-cartItem__link -inline font-bold no-underline text-gray-150" :class="{'-isCn -saved' : isCn}">
                        <slot name="saved-for-later" />
                    </span>
                </div>

                <button
                    v-if="isSaved"
                    tabindex="0"
                    aria-label="Close Box"
                    class="ml-auto -saved-dismiss"
                    @click="dismissSaved">

                    <img
                        src="//cdnsc1.melaleuca.com/na/images/header/clear2x.png"
                        alt="Close Box"
                        aria-hidden="true">
                </button>
            </div>

            <div
                v-if="!isRemoved && !isSaved"
                class="o-cartItem__container">
                <div class="o-cartItem__topRow">

                    <component
                        :is="pdpUrl ? 'a' : 'div'"
                        :href="pdpUrl ? pdpUrl : false"
                        class="o-cartItem__thumbnail">

                        <!-- Start: Stamps -->
                        <div
                            v-if="stamp"
                            class="o-cartItem__tag">

                            <div>
                                <em
                                    class="a-stamp"
                                    :class="stamp.Style">

                                    {{ stamp.StampTitle }}
                                </em>
                            </div>
                        </div>
                        <!-- End: Stamps -->

                        <span class="aspectRatioBox -aspect-1-1">
                            <img
                                :src="imgSrc"
                                :alt="imgAlt"
                                class="aspectRatioBox__content" />
                        </span>
                    </component>
                    <div class="o-cartItem__rightSection">
                        <div class="o-cartItem__details">
                            <h2 class="o-cartItem__heading">
                                <component
                                    :is="pdpUrl ? 'a' : 'span'"
                                    :href="pdpUrl"
                                    data-testid="cartItemProductName-link"
                                >

                                    {{ title }}
                                </component>
                            </h2>

                            <p class="o-cartItem__info">
                                <slot name="info" />
                            </p>

                            <div class="o-cartItem__configurations">
                                <slot name="configurations" />

                                <o-shelf-configurator
                                    v-if="$slots['edit']"
                                    :sku="sku"
                                    :line-id="lineId"
                                    :line-type="lineType"
                                    :quantity="updatedQuantity"
                                    :pre-selected-sku="sku"
                                    :pre-selected-configurations="configurations"
                                    :is-edit="true"
                                    class="o-cartItem__link -inline">

                                    <slot name="edit" />
                                </o-shelf-configurator>

                            </div>
                        </div>

                        <div class="o-cartItem__controls">
                            <div class="flex justify-between w-full">
                                <div class="o-cartItem__quantity">
                                    <a-quantity
                                        v-if="!isDeleteDisabled"
                                        :ref="`aquantity-${lineId}`"
                                        :key="quantityKey"
                                        input-class="-cartItem"
                                        :disabled="loading || hasIno"
                                        :value="updatedQuantity"
                                        :min-value="0"
                                        :max-length="2"
                                        @input="updateQuantity" />
                                </div>

                                <div class="o-cartItem__totals">
                                    <div>
                                        <p class="o-cartItem__price">
                                            <slot name="price" />
                                        </p>

                                        <p v-if="showPoints" class="o-cartItem__points">
                                            <span><slot name="points" /></span>
                                            <slot name="points-label" />
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p v-if="additionalLabel" class="o-cartItem__messages" v-html="additionalLabel">
                            </p>

                            <div v-if="!isCn || (isCn && !isMobile)" class="o-cartItem__actions">
                                <template v-if="$slots['lsd-caption']">
                                    <slot name="lsd-caption" />
                                </template>

                                <!-- INO (In Next Order) -->
                                <div
                                    v-if="$slots['ino']"
                                    class="o-cartItem__ino">

                                    <slot name="ino" />
                                </div>

                                <button
                                    v-if="!isDeleteDisabled"
                                    :ref="`removeButton${sku}`"
                                    type="button"
                                    class="o-cartItem__link"
                                    data-testid="cartItemRemove-button"
                                    @click="remove"
                                >

                                    <slot name="remove" />
                                </button>

                                <button
                                    v-if="!isPromotion && !isDeleteDisabled"
                                    type="button"
                                    class="o-cartItem__link"
                                    data-testid="cartItemSaveForLater-button"
                                    @click="save"
                                >

                                    <slot name="save" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
                <div v-if="$slots['accessories'] || $slots['payment'] || $scopedSlots['payment'] || (isCn && isMobile)" class="o-cartItem__bottom">
                    <div v-if="$slots['accessories']" class="o-cartItem__accessories">
                        <slot name="accessories" />
                    </div>

                    <div v-if="isCn && isMobile" class="o-cartItem__actions">
                        <template v-if="$slots['lsd-caption']">
                            <slot name="lsd-caption" />
                        </template>

                        <!-- INO (In Next Order) -->
                        <div
                            v-if="$slots['ino']"
                            class="o-cartItem__ino">

                            <slot name="ino" />
                        </div>

                        <button
                            :ref="`removeButton${sku}`"
                            type="button"
                            class="o-cartItem__link"
                            data-testid="cartItemRemove-button"
                            @click="remove"
                        >

                            <slot name="remove" />
                        </button>

                        <button
                            v-if="!isPromotion"
                            type="button"
                            class="o-cartItem__link"
                            data-testid="cartItemSaveForLater-button"
                            @click="save"
                        >

                            <slot name="save" />
                        </button>
                    </div>

                    <div v-if="$slots['payment'] || $scopedSlots['payment']" class="o-cartItem__payment">
                        <slot
                            name="payment"
                            :loading="loading"
                            :lsd-payment="lsdPayment"
                            :cc-payment="ccPayment" />
                    </div>

                </div>
            </div>

            <!-- INO (In Next Order) Modal -->
            <modal id="ino-cart">
                <template v-slot:heading>
                    <span
                        v-if="hasInoTitle"
                        aria-live="polite"
                        aria-atomic="true"
                        :aria-label="hasInoTitle"
                        :class="isCn ? 'to-md:block to-md:font-bold to-md:px-20 md:px-0 text-2xl leading-base text-gray-150':'text-gray-150'">

                        {{ hasInoTitle }}
                    </span>
                </template>

                <template v-slot:body>
                    <p
                        v-if="hasInoDesc"
                        :class="isCn ? 'text-sm text-gray-120 to-md:px-20 md:pl-0 md:pr-15':'text-sm text-gray-120 pr-0 md:pr-15'">

                        {{ hasInoDesc }}
                    </p>
                </template>

                <template v-slot:footer>
                    <button
                        v-if="hasInoCta"
                        :class="isCn ? 'uppercase text-white bg-green px-24 py-15 mx-20 md:mx-0 rounded-md':'uppercase text-white bg-green px-24 py-15 rounded-md'"
                        @click="inoModalClose">

                        {{ hasInoCta }}
                    </button>
                </template>
            </modal>

            <!-- LSD Quantity Limit Modal -->
            <modal id="lsd-cc-quantity-limit">
                <template v-slot:body>
                    <p class="text-2xl text-gray-120 leading-tight pb-10 pr-0 md:pr-15">
                        {{ labelExceededBalance }}
                    </p>
                    <p class="text-2xl text-gray-120 leading-tight pr-0 md:pr-15">
                        {{ lsdCcQtyLmtModalLabels.SeperateItem }}
                    </p>
                </template>

                <template v-slot:footer>
                    <button
                        class="a-button -white text-base px-24 py-12 mr-10"
                        @click="lsdOrCcQuantityClose(false)"
                    >
                        {{ lsdCcQtyLmtModalLabels.Cancel }}
                    </button>
                    <button
                        class="a-button text-base px-24 py-12"
                        @click="lsdOrCcQuantityClose(true)"
                    >
                        {{ lsdCcQtyLmtModalLabels.Continue }}
                    </button>
                </template>
            </modal>

            <!-- Free Product Exceeded Balance Modal -->
            <FreeProductExceededBalance
                ref="free-product-exceeded-balance"
                :cancel-label="getLocalizationProp('Labels.ExceededBalanceModal.CancelButton')"
                :continue-label="getLocalizationProp('Labels.ExceededBalanceModal.ContinueButton')"
                :title-label="getLocalizationProp('Labels.ExceededBalanceModal.Title')"
            />
        </div>
        <m-upsell-message
            v-if="showUpsellMessage"
            :button-text="upsellButtonText"
            :text="upsellText"
            :shelf-text="upsellShelfText"
            :line-id="lineId"
            :quantity="quantity"
            :sku="upsellSku"
            :pre-selected-sku="upsellSku"
            :pre-selected-configurations="upsell.Products[0].Configurations"
            :savings-value="upsellSavingsValue"
            :upsell="upsell"
        />
        <div
            v-if="showAd && !isRemoved"
            class="o-cartItem__row -ad">

            <m-banner-upgrade-ad
                v-if="adType === 'Upgrade'"
                :context="adContext"
                :family-id="adFamilyId"
                :sku="adSku"
                :user-flags="userFlags"
                :line-id-remove="lineId" />

            <m-cart-banner-ad
                v-if="adType === 'Regular'"
                :context="adContext"
                :user-flags="userFlags" />
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import {replaceTokenArray} from '@common/source/js/vue/utils/replace-token';
    import FreeProductExceededBalance from '../modals/free-product-exceeded-balance.vue';

    export default {
        name: 'OCartItem',
        components: {
            FreeProductExceededBalance
        },
        mixins: [ localizationMixin ],
        props: {
            additionalLabel: {
                type: String,
                default: null
            },
            adContext: {
                type: Object,
                default: () => {}
            },
            adFamilyId: {
                type: String,
                default: ''
            },
            adSku: {
                type: String,
                default: ''
            },
            adType: {
                type: String,
                default: null
            },
            brand: {
                type: String,
                default: null
            },
            category: {
                type: String,
                default: null
            },
            configurations: {
                type: Array,
                default: () => []
            },
            familyId: {
                type: String,
                default: ''
            },
            hasConfigurations: {
                type: Boolean,
                default: false
            },
            imgAlt: {
                type: String,
                default: ''
            },
            imgSrc: {
                type: String,
                required: true
            },
            ino: {
                type: Number,
                default: null
            },
            inoLocalization: {
                type: Object,
                default: () => {}
            },
            isAuthenticatedGuests: {
                type: Boolean,
                default: false
            },
            isAuthenticatedNonIntentToPreferred: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isDeleteDisabled: {
                type: Boolean,
                default: false
            },
            isRemoved: {
                type: Boolean,
                default: false
            },
            isSaved: {
                type: Boolean,
                default: false
            },
            isUnauthenticatedVisitors: {
                type: Boolean,
                default: false
            },
            itemRemovedLabel: {
                type: String,
                default: ''
            },
            lineId: {
                type: String,
                required: true
            },
            lineType: {
                type: String,
                default: 'Normal'
            },
            lsdCcQtyLmtModalLabels: {
                type: Object,
                default() {
                    return {};
                }
            },
            pdpUrl: {
                type: String,
                default: null
            },
            position: {
                type: Number,
                required: true
            },
            price: {
                type: String,
                default: ''
            },
            priceRange: {
                type: Object,
                default () {
                    return {
                        'MinPreferredPrice': '',
                        'MinRegularPrice': ''
                    };
                }
            },
            promotionId: {
                type: [Number, String],
                default: null
            },
            quantity: {
                type: Number,
                required: true
            },
            quantityUntilCcLimit: {
                type: Number,
                default: 0
            },
            quantityUntilLsdLimit: {
                type: Number,
                default: 0
            },
            showAd: {
                type: Boolean,
                default: false
            },
            sku: {
                type: String,
                required: true
            },
            stamp: {
                type: Object,
                default: () => {}
            },
            title: {
                type: String,
                required: true
            },
            upsell: {
                type: Object,
                default: () => {}
            },
            userFlags: {
                type: Object,
                default: () => {}
            },
            variant: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                inoAvailable: false, // INO (In Next Order)
                updatedQuantity: 0,
                upsellShelfText: '',
                productNotBeingAddedWithLsdOrCC: {},
                quantityKey: 0
            };
        },
        computed: {
            ...mapState('cart', ['loading', 'lsdOnlyOneProductId']),
            ...mapState('cartSummary', ['welcomeProgramLsdAvailable']),

            hasIno() {
                return this.ino > 0;
            },
            hasInoCta() {
                // Adding fallback if there is bad data
                return this.inoLocalization?.ContinueButton || 'Continue';
            },
            hasInoDesc() {
                return this.inoLocalization?.Summary || 'Call Customer Service if you have any questions regarding this item.';
            },
            hasInoTitle() {
                return this.inoLocalization?.Title || 'Item added by Melaleuca Customer Service per your request.';
            },
            isMobile() {
                return (navigator.userAgent.toLowerCase().match(/mobile/i)) && (window.innerWidth <= 767);
            },
            isPromotion() {
                return this.lineType === 'Promotion';
            },
            labelExceededBalance() {
                if(this.lineType === 'Certificate') return this.lsdCcQtyLmtModalLabels?.ExceededCcBalance;
                if(this.lineType === 'LSD') return this.lsdCcQtyLmtModalLabels?.ExceededLsdBalance;
                return '';
            },
            product() {
                return this.upsell?.Products && this.upsell?.Products[0];
            },
            singleItemPriceGtm() {
                let price = this.userFlags.ViewMemberPricing ? this.priceRange.MinPreferredPrice : this.priceRange.MinRegularPrice;
                price = price.replace(/[^0-9.,-]+/g,''); // eslint-disable-line
                return price;
            },
            totalItemPriceGtm() {
                return this.price.replace(/[^0-9.,-]+/g,''); // eslint-disable-line
            },
            showPoints() {
                return this.userFlags.ViewPoints && !this.isAuthenticatedGuests && !this.isUnauthenticatedVisitors;
            },
            showUpsellMessage() {
                return (
                    this.upsell &&
                    this.userFlags.ViewMemberPricing &&
                    !this.ino &&
                    !this.showAd &&
                    (this.lineType === 'LSD' || this.lineType === 'Normal' || this.lineType === 'Certificate')
                );
            },
            upsellButtonText() {
                const unitOfMeasureValue = this.upsell?.UpsellUnitOfMeasureValue;
                return replaceTokenArray(this.getLocalizationProp('Labels.Upsell.ButtonText'), [unitOfMeasureValue]);
            },
            upsellFamilyName() {
                return this.upsell?.Products?.filter(x => x.FamilyName)[0]?.FamilyName || [];
            },
            uniqueLineItemFamilyNames() {
                return this.upsell?.UniqueLineItemFamilyNames || [];
            },
            upsellUnitOfMeasure() {
                return this.upsell?.UpsellUnitOfMeasureValue || '';
            },
            upsellSavingsValue() {
                return this.upsell?.Products?.[0].PriceRange.PackSavings || '';
            },
            upsellSku() {
                return this.upsell?.Products?.[0].Sku;
            },
            upsellText() {
                if(!this.upsell) {
                    return;
                }

                const upsellTextVariants = this.getLocalizationProp('Labels.Upsell.Text');

                let upsellText;
                if(this.upsell.SingleQualifyingLineItem) {
                    upsellText = replaceTokenArray(upsellTextVariants.Variant1, [this.upsellFamilyName, this.upsellSavingsValue]);
                } else if(this.upsell.AllQualifyingLineItemsShareAFamily) {
                    upsellText = replaceTokenArray(upsellTextVariants.Variant2, [this.uniqueLineItemFamilyNames[0], this.upsellUnitOfMeasure, this.upsellSavingsValue]);
                } else {
                    let concatenatedFamilyNames = [...this.uniqueLineItemFamilyNames];
                    const lastFamilyName = concatenatedFamilyNames.pop();

                    // if we have 3+ items (total) then concatenate with commas:
                    if(concatenatedFamilyNames.length > 1) {
                        concatenatedFamilyNames = concatenatedFamilyNames.map(x => `${x}, `).join('');
                    }
                    upsellText = replaceTokenArray(upsellTextVariants.Variant3, [concatenatedFamilyNames, lastFamilyName, this.upsellUnitOfMeasure, this.upsellSavingsValue]);
                }

                return upsellText;
            }
        },
        watch: {
            upsellSavingsValue() {
                this.upsellShelfText = replaceTokenArray(this.getLocalizationProp('Labels.Upsell.ShelfText'), [this.upsellSavingsValue]);
            }
        },
        created () {
            if(this.hasIno) this.inoAvailable = true;
        },
        mounted() {
            this.updatedQuantity = this.quantity;
            this.setEventBus();
        },
        updated() {
            this.updatedQuantity = this.quantity;
        },
        methods: {
            ...mapActions('cart', ['refreshData', 'sendCollectCode', 'addToRemovedItems', 'subtractFromRemovedItems', 'subtractLastFromRemovedItems', 'addToSavedItems', 'subtractFromSavedItems', 'saveItem', 'updateItem', 'removeItem', 'undoItem', 'updateLineType']),
            ...mapActions('addToCart', ['getUpsells']),
            ...mapMutations('cart', ['SET_LOADING']),
            ...mapGetters('cart', ['hasLimitModal', 'upsells']),

            async remove() {
                // If has INO open a modal with warning
                if(this.inoAvailable) return this.inoModalOpen();
                if(this.hasIno) this.inoAvailable = true;

                // Last normal product
                if(!this.isCn && this.lineId === this.lsdOnlyOneProductId) {
                    this.$emit('openLsdOnlyOneProdModal');
                    return false;
                }

                if(!this.loading) {
                    this.SET_LOADING();
                    this.subtractLastFromRemovedItems();
                    this.addToRemovedItems(this.lineId);
                    await this.removeItem({
                        lineId: this.lineId
                    });
                    await this.refreshData();
                    this.sendCollectCode();
                    this.SET_LOADING(false);
                }
                // GA
                this.dataLayerRemove();
            },
            dataLayerRemove(quantity) {
                const price = quantity ? (this.singleItemPriceGtm * quantity) : this.totalItemPriceGtm;
                window.dataLayer && window.dataLayer.push({
                    'event': 'removeFromCart',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '',
                        'remove': {
                            'products': [{
                                'id': this.sku || '',
                                'name': this.title || '',
                                'price': price || '',
                                'brand': this.brand || '',
                                'category': this.category || '',
                                'variant': this.variant || '',
                                'quantity': quantity || this.quantity || ''
                            }]
                        }
                    }
                });
            },
            dataLayerAdd(quantity) {
                window.dataLayer && window.dataLayer.push({
                    'event': 'addToCart',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '',
                        'add': {
                            'products': [{
                                'id': this.sku || '',
                                'name': this.title || '',
                                'price': (this.singleItemPriceGtm * quantity) || '',
                                'brand': this.brand || '',
                                'category': this.category || '',
                                'variant': this.variant || '',
                                'quantity': quantity || this.quantity || ''
                            }]
                        }
                    }
                });
            },
            async undo() {
                this.SET_LOADING();
                this.subtractFromRemovedItems(this.lineId);
                const lineType = (this.lineType === 'LSD' || this.lineType === 'Certificate') ? 'Normal' : this.lineType;
                await this.undoItem({
                    sku: this.sku,
                    configurations: this.configurations,
                    quantity: this.quantity,
                    lineId: this.lineId,
                    lineType: lineType,
                    position: this.position,
                    promotionId: this.promotionId
                });
                await this.refreshData();
                this.SET_LOADING(false);
            },
            async dismissRemoved() {
                this.SET_LOADING();
                this.subtractFromRemovedItems(this.lineId);
                await this.refreshData();
                this.SET_LOADING(false);
            },
            async dismissSaved() {
                this.SET_LOADING();
                this.subtractFromSavedItems(this.lineId);
                await this.refreshData();
                this.SET_LOADING(false);
            },
            async save() {
                this.SET_LOADING();
                this.addToSavedItems(this.lineId);
                await this.saveItem(this.lineId);
                this.SET_LOADING(false);
                const saveBox = document.querySelectorAll('.o-cartItem__container.-removed .-saved-dismiss')[0];
                saveBox.focus();
            },
            async update(payload) {
                if(!this.loading) {
                    this.SET_LOADING();

                    if(payload.quantity === '0' || payload.quantity === 0) {
                        this.addToRemovedItems(this.lineId);
                        await this.removeItem({
                            lineId: this.lineId
                        });
                    } else {
                        let product = {
                            sku: this.sku,
                            quantity: payload.quantity,
                            lineId: this.lineId,
                            lineType: payload.lineType,
                            position: this.position
                        };
                        await this.updateItem(product);
                    }
                    if(!this.hasLimitModal()) {
                        await this.refreshData();
                    }
                    this.SET_LOADING(false);
                }
            },
            async updateLineItem(payload) {
                if(!this.loading) {
                    this.SET_LOADING();
                    this.subtractLastFromRemovedItems();
                    await this.updateLineType({
                        LineId: this.lineId,
                        LineType: payload.lineType,
                        Quantity: 1
                    });
                    await this.refreshData();
                    this.SET_LOADING(false);
                }
            },
            async updateQuantity(payload, type, diff) {
                // Last normal product
                if(this.lineId === this.lsdOnlyOneProductId && payload === 0) {
                    this.$emit('openLsdOnlyOneProdModal', 'update');
                    return false;
                }

                // force trigger updateQuantity on child thru focus - BUG 124025
                this.$refs[`aquantity-${this.lineId}`].onFocus();

                if(((this.lineType === 'LSD' && diff > this.quantityUntilLsdLimit) ||
                    (this.lineType === 'Certificate' && diff > this.quantityUntilCcLimit)) &&
                    type === 'increase') {
                    this.lsdOrCcQuantityOpen(payload, type, diff);

                    this.productNotBeingAddedWithLsdOrCC = {payload, type, diff};
                    return false;
                }

                if(this.lineType === 'WelcomeProgram' && type === 'increase' && this.welcomeProgramLsdAvailable <= 0) {
                    // need to reset quantity because the cart update will either be canceled or create a new line item
                    this.$refs[`aquantity-${this.lineId}`]?.setValue();

                    const willContinue = await this.$refs['free-product-exceeded-balance']?.show();
                    if(!willContinue) return;
                }

                if(this.updatedQuantity !== payload) {
                    this.updateQuantityAction(payload, type, diff);
                }
            },
            async updateQuantityAction(payload, type, diff) {
                if(type === 'decrease') {
                    this.dataLayerRemove(diff); // GA
                }

                if(type === 'increase') {
                    this.dataLayerAdd(diff); // GA
                }

                if(!this.hasLimitModal()) {
                    this.subtractLastFromRemovedItems();
                    await this.update({ quantity: payload, lineType: this.lineType });
                    this.updatedQuantity = payload;
                    await this.getUpsells();
                    this.sendCollectCode();
                }
            },
            // payment options
            lsdPayment(val) {
                if(val) {
                    this.updateLineItem({ lineId: this.lineId, lineType: 'LSD' });
                } else {
                    this.updateLineItem({ lineId: this.lineId, lineType: 'Normal' });
                }
            },
            ccPayment(val) {
                if(val) {
                    this.updateLineItem({ lineId: this.lineId, lineType: 'Certificate' });
                } else {
                    this.updateLineItem({ lineId: this.lineId, lineType: 'Normal' });
                }
            },

            // INO (In Next Order)
            inoModalOpen() {
                this.$modal.show({
                    id: 'ino-cart',
                    width: '630px'
                });
                this.$modal.$on.hidden(() => {
                    if(this.$refs[`removeButton${this.sku}`]) {
                        this.$refs[`removeButton${this.sku}`].focus();
                    }
                });
            },
            // TODO: might need to move this data fetch to `cart.vue` (because the page is a list) and pass values via props:
            async inoModalClose() {
                this.inoAvailable = false;
                this.$modal.hide();
                await this.remove();
                this.$nextTick(() => {
                    document.querySelector(`#isRemovedButton${this.sku}`).focus();
                });
            },

            lsdOrCcQuantityOpen() {
                this.$modal.show({
                    id: 'lsd-cc-quantity-limit',
                    width: '470px',
                    headingVisible: false
                });
                this.updatedQuantity = this.quantity;
                // force component to update showing original quantity so if
                // custoemr cancels or closes modal original quanity is shown
                this.quantityKey += 1;
            },

            async lsdOrCcQuantityClose(addToCart) {
                if(addToCart) {
                    this.$modal.hide();
                    await this.updateQuantityAction(
                        this.productNotBeingAddedWithLsdOrCC.payload,
                        this.productNotBeingAddedWithLsdOrCC.type,
                        this.productNotBeingAddedWithLsdOrCC.diff);
                } else {
                    this.$modal.hide();
                }
                this.productNotBeingAddedWithLsdOrCC = {};
            },

            setEventBus() {
                eventBus.$on('setInputCartItemValue', (payload) => {
                    if(this.lineId === this.lsdOnlyOneProductId) {
                        const inputTarget = this.$refs[`aquantity-${this.lineId}`];
                        if(inputTarget) this.$refs[`aquantity-${this.lineId}`].quantity = 1;
                    }
                });
            }
        }
    };

</script>

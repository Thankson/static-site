<template>
    <div class="m-payMethod">
        <h2 class="m-payMethod__heading">
            {{ heading }}
        </h2>

        <div class="m-payMethod__content">
            <div
                v-for="(method, index) in payMethods"
                :key="index"
                :class="{'mr-36': (method.ExpirationDisplay && method.ExpiresSoon)}"
                class="m-payMethod__radio">

                <m-radio
                    v-model="selectedIndex"
                    :input-value="index"
                    label-mods=""
                    :mods="'flex-1 ' + radioMods"
                    name="CheckoutPaymentMethod">
                    <span
                        v-if="isPayPal(method)" class="m-payMethod__label">
                        <a-pay-label
                            class="flex"
                            :display-name="method.PaymethodNameDisplay"
                            :image="method.PayMethodImage"
                            :type="method.PayMethodType"
                            :name-on-account="method.NameOnAccount"
                        />
                    </span>
                    <span v-else class="m-payMethod__label">
                        <img
                            v-if="method.PayMethodImage && method.PayMethodImage.Url"
                            :alt="method.PayMethodImage.Alt || method.PaymethodNameDisplay"
                            :src="method.PayMethodImage.Url"
                            class="m-payMethod__img"
                            :class="cardImageMods">
                        <span class="m-payMethod__card" role="text">
                            <span class="m-payMethod__info">
                                <span class="m-payMethod__name">{{ method.PaymethodNameDisplay || method.PayMethodType }} </span>
                                <span v-if="method.LastFourDigitsOfAccount" class="m-payMethod__account" v-html="getMasking(method.MaskingCondensed, method.LastFourDigitsOfAccount)"></span>
                            </span>
                        </span>
                    </span>
                </m-radio>

                <div class="m-payMethod__data">
                    <span v-if="method.ExpirationDisplay && method.ExpiresSoon" class="m-payMethod__expiration">
                        {{ expiresLabel }} {{ method.ExpirationDisplay }}
                    </span>

                    <a
                        v-if="method.IsEditable && method.PayMethodId && editLink"
                        :aria-label="getEditAria(method.LastFourDigitsOfAccount)"
                        :href="`${editLink}?PayMethodId=${method.PayMethodId}`"
                        class="m-payMethod__edit">

                        <span aria-hidden="true" class="font-material text-base leading-base">edit</span>
                        <span aria-hidden="true" class="uppercase pl-5">{{ editLabel }}</span>
                    </a>
                </div>
            </div>

            <v-button
                v-if="showAllButton"
                :aria-label="showAllAriaLabel"
                :cta="showAllText"
                :is-anchor="false"
                aria-expanded="false"
                class="-link text-base font-bold px-0 py-0 mt-20 ml-40"
                type="button"
                @click="[showMore = true, gtmTrackAction({id: gtm.showAllId, text: showAllText}, $event)]"
            />

            <div class="m-payMethod__action">
                <v-button
                    v-if="addPaymentLink"
                    :class="addPaymentMods"
                    :cta="addPaymentText"
                    :href="addPaymentLink"
                    :is-anchor="true"
                    type="link"
                />

                <v-button
                    v-if="managePaymentLink"
                    :class="managePaymentMods"
                    :cta="managePaymentText"
                    :href="managePaymentLink"
                    :is-anchor="true"
                    type="link"
                />
            </div>

            <hr v-if="showHr" class="mt-25 mb-5" />

            <div class="md:flex justify-between">
                <div>
                    <!-- Installment Options -->
                    <o-checkout-installment
                        v-if="isInstallment"
                        ref="installment"
                        class="-owingBalance"
                        :labels="installmentData.labels"
                        :rte="installmentData.data"
                        :installment-options="installmentData.data.List"
                        :is-portal="isPortal"
                        :is-owing-balance="true"
                        :pay-method-type="payMethodType"
                        :total-balance-selected="totalBalanceSelected"
                        @update="onInstallmentUpdate"
                    />
                    <CheckoutFpxBanks
                        v-if="showFpx"
                        ref="fpx-bank"
                        :bank-error-label="virtualPaymentLabels.CardSelectionError"
                        :bank-label="virtualPaymentLabels.CardSelection"
                        :bank-placeholder="virtualPaymentLabels.SelectBank"
                        :bank-offline-label="bankOfflineLabel"
                        :is-owing-balance="true"
                        @update="onFpxUpdate"
                    />
                </div>

                <div v-if="$slots['default']">
                    <slot />
                </div>
            </div>
        </div>

    </div>
</template>
<script>
    import { mapActions, mapState, mapMutations } from 'vuex';
    import OCheckoutInstallment from '../../02-organisms/checkout/checkout-installment.vue';
    import CheckoutFpxBanks from '../../02-organisms/checkout/checkout-fpx-banks.vue';
    import { portal } from '../../../utils/payment-types';
    import * as paymentTypes from '../../../utils/payment-types';

    export default {
        name: 'MPayMethod',
        components: {
            OCheckoutInstallment,
            CheckoutFpxBanks
        },
        props: {
            addPaymentLink: {
                type: String,
                default: ''
            },
            addPaymentMods: {
                type: String,
                default: ''
            },
            addPaymentText: {
                type: String,
                default: ''
            },
            bankOfflineLabel: {
                type: String,
                default: '{0} (Offline)'
            },
            cardImageMods: {
                type: String,
                default: ''
            },
            editLabel: {
                type: String,
                default: null
            },
            editAriaLabel: {
                type: String,
                default: null
            },
            editLink: {
                type: String,
                default: null
            },
            expiresLabel: {
                type: String,
                default: 'Expires'
            },
            gtm: {
                type: Object,
                default: () => ({
                    showAllId: null
                })
            },
            heading: {
                type: String,
                default: ''
            },
            installmentData: {
                type: Object,
                default: null
            },
            managePaymentText: {
                type: String,
                default: ''
            },
            managePaymentLink: {
                type: String,
                default: ''
            },
            managePaymentMods: {
                type: String,
                default: ''
            },
            numberOfPaymentsShown: {
                type: Number,
                default: 2
            },
            radioMods: {
                type: String,
                default: ''
            },
            selectedPayMethodId: {
                type: String,
                default: ''
            },
            showAllAriaLabel: {
                type: String,
                default: ''
            },
            showAllText: {
                type: String,
                default: ''
            },
            showHr: {
                type: Boolean,
                default: true
            },
            totalBalanceSelected: {
                type: Number,
                default: 0
            },
            useCheckoutApi: {
                type: Boolean,
                default: false
            },
            virtualPaymentLabels: {
                type: Object,
                default: () =>
                    ({
                        'CardSelection': 'Bank Choice',
                        'CardSelectionError': 'Please select a bank.',
                        'SelectBank': 'Select Bank'
                    })
            }
        },
        data() {
            return {
                card: null,
                installment: null,
                selectedIndex: -1,
                showMore: false,
                gtmData: {},
                fpxBankId: null,
                fpxBanks: null,
                fpxData: null,
                hasFpxPaymentError: false

            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedPayMethods']),

            isInstallment() {
                const payMethod = this.payMethods[this.selectedIndex];

                if(this.$env.Country === 'Korea') {
                    // in KR AllowedForInstallment set to false and PayMethodType set to "CreditCard" indicates it's a debit card
                    return payMethod?.AllowedForInstallment || payMethod?.PayMethodType === 'CreditCard';
                }

                return payMethod?.AllowedForInstallment;
            },
            isPortal() {
                return this.payMethodType === portal;
            },
            payMethods() {
                let payMethods = this.storedPayMethods.filter((method) => method.CanBeUsedForOwingBalance);

                if(this.showAllText && !this.showMore) {
                    payMethods = payMethods.slice(0, this.numberOfPaymentsShown);
                }

                return payMethods;
            },
            payMethodType() {
                return this.selectedPayMethod?.PayMethodType || null;
            },
            selectedPayMethod() {
                return this.payMethods[this.selectedIndex];
            },
            showAllButton() {
                return this.showAllText && this.showMore === false && this.storedPayMethods.length > this.numberOfPaymentsShown;
            },
            showFpx() {
                return this.showVirtualPayment && this.selectedPayMethod?.CollectionsProcessorType === 'FPX3DPortal';
            },
            showVirtualPayment() {
                return this.selectedPayMethod?.PayMethodType === paymentTypes.virtualPayment;
            }
        },
        watch: {
            card() {
                this.emitUpdate();
            },
            installment() {
                this.emitUpdate();
            },
            selectedPayMethod(newVal) {
                this.SET_PAYMENT_METHOD({paymentMethod: newVal});
                this.emitUpdate();
            },
            selectedPayMethodId() {
                this.setPayMethodIndex();
            }
        },
        created() {
            this.$on('installment-error', this.showInstallmentError);
            this.$on('show-fpx-error', this.showFpxError);
        },
        mounted() {
            this.getAllPayMethods();
        },
        methods: {
            ...mapActions('paymentMethod', ['getPayMethods', 'getCheckoutPayMethod']),
            ...mapMutations('paymentMethod', ['SET_PAYMENT_METHOD']),

            async getAllPayMethods() {
                // Get all payment methods of the customer
                if(this.useCheckoutApi) {
                    await this.getCheckoutPayMethod();
                } else {
                    await this.getPayMethods({checkout: true});
                }

                this.setPayMethodIndex();
            },
            getEditAria(num) {
                return this.editAriaLabel.replace('{0}', num);
            },
            getMasking(mask, lastDigits) {
                return mask + ' ' + lastDigits;
            },
            isPayPal(method) {
                return method?.PayMethodType.toLowerCase() === 'paypal';
            },
            setPayMethodIndex() {
                const methodIndex = this.payMethods.find(method => method.PayMethodId === this.selectedPayMethodId);
                this.selectedIndex = methodIndex > -1 ? methodIndex : 0;
            },
            showInstallmentError() {
                this.$refs['installment']?.$emit('show-error');
            },
            emitUpdate() {
                this.$emit('update', {
                    card: this.card,
                    installment: this.installment,
                    isPortal: this.isPortal,
                    payMethodId: this.selectedPayMethod?.PayMethodId || null,
                    payMethodType: this.payMethodType,
                    enableMultipleOrders: this.selectedPayMethod?.CanUseOnMultipleOrders,
                    showFpx: this.showFpx,
                    fpxBankId: this.fpxBankId,
                    collectionsProcessorType: this.selectedPayMethod?.CollectionsProcessorType,
                    binNumber: this.selectedPayMethod?.BinNumber,
                    selectedPayMethod: this.selectedPayMethod
                });
            },
            onInstallmentUpdate({ card, installment }) {
                this.card = card;
                this.installment = installment;
                this.emitUpdate();
            },
            onFpxUpdate({ bankId }) {
                this.fpxBankId = bankId;
                this.emitUpdate();
            },
            showFpxError() {
                this.$refs['fpx-bank'].$emit('show-error');
            }
        }
    };
</script>

<template>
    <div class="o-checkoutPayMethods">
        <CheckoutPaymentMethodsList
            v-if="isListVisible"
            ref="paymentMethodsList"
            :delete-payment-label="getLocalizationProp('Labels.PayMethodSection.Delete', 'Delete')"
            :edit-label="getLocalizationProp('Labels.Checkout.Edit')"
            :edit-link="getLocalizationProp('Data.Checkout.EditPayMethodsLink.Url', null)"
            :edit-guest-link="getLocalizationProp('Data.Checkout.GuestPaymentLink', null)"
            :error-aria-label="getLocalizationProp('Labels.Checkout.ErrorAriaLabel.PaymentMethods', 'Error attention required')"
            :expires-label="getLocalizationProp('Labels.Checkout.Expires', 'Expires')"
            :expired-label="getLocalizationProp('Labels.Checkout.Expired', 'Expired')"
            :is-guest="isGuestShopping"
            :use-default-method-of-payment="isOwingBalance"
            :modal-labels-delete-pay-method="modalLabelsDeletePayMethod"
            :owing-balance-customer-id="owingBalanceCustomerId"
            :set-as-default-label="getLocalizationProp('Labels.PayMethodSection.SetAsDefault', 'Set as default')"
            :title="getLocalizationProp('Labels.Checkout.PayWith', 'Pay With')"
            @edit="edit"
            @initialPayment="(args) => $emit('initialPayment', args)"
            @update="(args) => $emit('update', args)"
        />

        <CheckoutPaymentForm
            v-if="isPaymentFormVisible"
            ref="checkout-payment-form"
            :hide-one-time-use-paymethod="hideOneTimeUsePaymethod"
            :is-first-pay-method="!hasPayMethodOptions"
            :is-guest="isGuestShopping"
            :is-owing-balance="isOwingBalance"
            :is-riverbend="isRiverbend"
            :owing-balance-customer-id="owingBalanceCustomerId"
            :pay-method-id="activePayMethodId"
            :rb-is-editing="false"
            :labels="riverbendLabels"
            :script-id="scriptId"
            @saved="onPaymentSaved"
            @cancel="cancel"
        />

        <div
            v-if="!isPaymentFormVisible"
            class="flex flex-col md:flex-row justify-start items-start md:items-center mt-40">
            <div v-if="showImprovedCTACheckout">
                <button
                    v-if="!isOwingBalance"
                    class="a-authorBtn bg-green rounded font-medium py-16 px-30 mr-20 mt-20 md:max-w-1_2"
                    data-testid="button-checkoutPayMethods"
                    @click="close">
                    {{ getLocalizationProp('Labels.PayMethodSection.UseThisPaymethod', 'Use This Paymethod') }}
                </button>
                <button
                    class="a-authorBtn bg-white rounded font-medium py-15 px-30 mt-20 mr-20 md:mr-100 md:max-w-1_2"
                    data-testid="button-checkoutPayMethods"
                    @click="add">
                    {{ getLocalizationProp('Data.Checkout.AddPaymentLink.Text') }}
                </button>
            </div>
            <div v-else>
                <button
                    class="a-authorBtn rounded font-medium py-16 px-30 mr-20 mb-20 md:mb-0"
                    :class="isOwingBalance ? 'bg-white' : 'bg-green'"
                    data-testid="button-checkoutPayMethods"
                    @click="add">
                    {{ getLocalizationProp('Data.Checkout.AddPaymentLink.Text', '+ Add New Pay Method') }}
                </button>
                <button
                    v-if="!isOwingBalance"
                    class="a-authorBtn bg-white rounded font-medium py-15 px-30"
                    data-testid="button-checkoutPayMethods"
                    @click="close">
                    {{ getLocalizationProp('Labels.PayMethodSection.Close', 'Close') }}
                </button>
            </div>
        </div>

        <OAddressPaymethodPrompt
            ref="paymentPrompt"
            :cancel-label="labelCancel"
            :confirm-label="labelConfirm"
            :desc-label="labelDesc"
            :is-pay-method-prompt="true"
            :is-prompt-enabled="isPaymethodPromptEnabled"
            :is-riverbend="isRiverbend"
            :ok-label="getLocalizationProp('Labels.Checkout.Ok', 'Ok')"
            :title-label="labelTitle"
            :updated-label="labelUpdated"
        />
    </div>

</template>

<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import CheckoutPaymentForm from './checkout-payment-form.vue';
    import CheckoutPaymentMethodsList from './checkout-payment-methods-list.vue';
    import OAddressPaymethodPrompt from '@productstore/source/js/vue/components/02-organisms/modals/address-paymethod-prompt.vue';

    export default {
        name: 'OCheckoutPaymentMethodsConfigurable',
        components: {
            CheckoutPaymentForm,
            CheckoutPaymentMethodsList,
            OAddressPaymethodPrompt
        },
        mixins: [ localizationMixin ],
        props: {
            owingBalanceCustomerId: {
                type: Number,
                default: null
            },
            hasPayMethod: {
                type: Boolean,
                default: false
            },
            hasCvvError: {
                type: Boolean,
                default: false
            },
            index: {
                type: Number,
                default: 2
            },
            invalidCvv: {
                type: Boolean,
                default: false
            },
            isGuestShopping: {
                type: Boolean,
                default: false
            },
            isOwingBalance: {
                type: Boolean,
                default: false
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            modalLabelsDeletePayMethod: {
                type: Object,
                default: () => {}
            },
            riverbendLabels: {
                type: Object,
                default: () => ({Labels: {}, DAta: {}})
            }
        },
        data() {
            return {
                activePayMethodId: null,
                isPaymentFormVisible: false
            };
        },
        computed: {
            ...mapState('checkout', ['selectedPayMethodId', 'hideOneTimeUsePaymethod']),
            ...mapState('paymentMethod', ['storedPayMethods', 'storedExternalPayMethods']),

            hasPayMethodOptions() {
                let payMethods = this.storedPayMethods || [];

                if(this.$env.IsCn) {
                    payMethods = this.storedExternalPayMethods?.PayMethods || [];
                }

                return Boolean(payMethods.length);
            },
            isPaymethodPromptEnabled() {
                return this.localization?.Data?.FeatureFlag?.PaymethodAddressPrompt || this.localization?.Data?.RiverbendPaymethodAddressPrompt;
            },
            isListVisible() {
                // always shown if payment form is not
                if(!this.isPaymentFormVisible) {
                    return true;
                }

                // if payment form is visible, only show if new payment (no activePayMethodId)
                return !this.activePayMethodId;
            },
            labelCancel() {
                return this.getPromptLabel('ChangeOne');
            },
            labelConfirm() {
                return this.getPromptLabel('ChangeBoth');
            },
            labelDesc() {
                return this.getPromptLabel('Description');
            },
            labelTitle() {
                return this.getPromptLabel('Title');
            },
            labelUpdated() {
                return this.getPromptLabel('Updated');
            },
            showImprovedCTACheckout() {
                return this.localization.Data?.ShowImprovedCTACheckout;
            }
        },
        watch: {
            hasPayMethod() {
                this.updateSequence({
                    completed: this.hasPayMethod,
                    index: this.index,
                    isEmpty: !this.hasPayMethod
                });
            },
            hasPayMethodOptions() {
                this.isPaymentFormVisible = !this.hasPayMethodOptions;
            },
            isPaymentFormVisible(value) {
                this.$emit('payment-form-visible', value);
            },
            selectedPayMethodId() {
                this.updateSequence({
                    completed: this.hasPayMethod,
                    index: this.index,
                    isEmpty: !this.hasPayMethod
                });
            }
        },
        async mounted() {
            this.isPaymentFormVisible = !this.hasPayMethodOptions;

            if(!this.isOwingBalance) {
                await Promise.all([
                    this.getCountryInfo({ country: this.$env.Country }),
                    this.getPayMethods({ checkout: true, owingBalance: this.isOwingBalance})
                ]);
                this.completeSequence({
                    completed: this.hasPayMethod,
                    isActive: false,
                    isEmpty: !this.hasPayMethod,
                    index: this.index,
                    loading: false
                });
            } else {
                const customerId = this.isOwingBalance ? this.getLocalizationProp('Data.CustomerId') : undefined;
                await this.getPayMethods({ checkout: true, owingBalance: this.isOwingBalance, customerId: customerId, country: this.$env.Country });
            }
        },
        methods: {
            ...mapActions('sequentialSections', ['completeSequence', 'updateSequence']),
            ...mapActions('paymentMethod', ['getCountryInfo', 'shiftStoredPayMethodOff', 'shiftStoredPayMethodBack', 'getPayMethods']),
            ...mapMutations('paymentMethod', ['SET_PAYMENT_METHOD']),

            add() {
                this.activePayMethodId = null;
                this.isPaymentFormVisible = true;
                if(this.isRiverbend || this.isOwingBalance) {
                    this.shiftStoredPayMethodOff();
                }
            },
            cancel() {
                this.isPaymentFormVisible = false;
                if(this.isRiverbend) {
                    this.$refs['checkout-payment-form'].$refs['payment-form'].riverbendIsEditingManuallyEnteredCard = false;
                }
            },
            close() {
                if(this.isRiverbend) {
                    this.shiftStoredPayMethodBack();
                }
                this.updateSequence({
                    completed: this.hasPayMethod,
                    index: this.index,
                    isActive: false,
                    isEmpty: !this.hasPayMethod
                });
            },
            edit(payMethodId) {
                this.activePayMethodId = payMethodId;
                this.isPaymentFormVisible = true;
                if(this.isRiverbend || this.isOwingBalance) {
                    const selectedMethod = this.storedPayMethods.find(method => method.PayMethodId === payMethodId);
                    this.SET_PAYMENT_METHOD({paymentMethod: selectedMethod});
                }
            },
            getPromptLabel(label) {
                const objPrompt = this.isRiverbend ? 'RBPrompt' : 'NSEPrompt';
                return this.getLocalizationProp(`Labels.AddressPaymethodPromptModel.${objPrompt}.${label}`);
            },
            onPaymentSaved(payload) {
                this.activePayMethodId = null;
                this.isPaymentFormVisible = false;
                if(!this.isOwingBalance) {
                    this.completeSequence({
                        completed: true,
                        index: this.index,
                        isActive: false,
                        isEmpty: false
                    });
                }

                this.$emit('payment-saved', payload);
            },
            updateScroll() {
                this.$refs.paymentMethodsList?.updateScroll?.();
            }
        }
    };
</script>

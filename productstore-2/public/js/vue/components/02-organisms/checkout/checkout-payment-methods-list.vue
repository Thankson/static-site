<template>
    <div class="o-checkoutEditPaymentSection">
        <perfect-scrollbar ref="scrollbar">
            <ul class="o-checkoutEditPaymentSection__list">
                <li
                    v-for="(method, index) in payMethodsSorted"
                    :key="index"
                    class="o-checkoutEditPaymentSection__item">

                    <m-radio
                        v-model="selectedIndex"
                        :class="method.ClassMod"
                        name="CheckoutPaymentMethodList"
                        :input-value="index"
                        mods="w-auto flex-1"
                        label-mods="-ole">

                        <a-pay-label
                            v-if="!isCn"
                            class="-payMethodList"
                            :account-number-preview="method.LastFourDigitsOfAccount"
                            :display-name="method.PaymethodNameDisplay"
                            :card-brand-name="method.CreditCardDescription"
                            :expiration-date="method.ExpirationDisplay"
                            :expires-label="expiresLabel"
                            :expired-label="expiredLabel"
                            :expires-soon="method.ExpiresSoon"
                            :is-expired="method.Expired"
                            :image="method.PayMethodImage"
                            :name-on-account="method.NameOnAccount"
                            :type="method.PayMethodType"
                            :card-masking="method.MaskingCondensed"
                            :is-cn="isCn"
                            :show-expired-date="true"
                        />

                        <a-pay-label
                            v-else
                            class="-payMethodList"
                            :display-name="method.Text"
                            :image="method.Image"
                            :is-cn="isCn"
                            :show-expired-date="true"
                        />
                    </m-radio>

                    <ul
                        v-if="!isCn"
                        class="m-payMethodCtrls ml-40">

                        <li
                            v-if="isEditable(method)"
                            class="m-payMethodCtrls__item">

                            <button
                                type="button"
                                class="m-payMethodCtrls__btn"
                                :aria-label="getEditAriaLabel(method)"
                                data-testid="button-editCta"
                                @click="$emit('edit', method.PayMethodId)">

                                {{ editLabel }}
                            </button>
                        </li>

                        <li
                            v-if="method.PayMethodId && method.CanBeDeleted"
                            class="m-payMethodCtrls__item">

                            <CheckoutDeletePaymentMethod
                                class="m-payMethodCtrls__btn"
                                :cancel-label="modalLabelsDeletePayMethod.Cancel"
                                :can-delete-selected="true"
                                :delete-label="modalLabelsDeletePayMethod.Delete"
                                :is-default="Boolean(method.PayMethodDefaults.length)"
                                :manage-pay-methods-link="{ text: modalLabelsDeletePayMethod.ManagePayMethods, url: modalLabelsDeletePayMethod.ManagePayMethodsUrl }"
                                :modal-heading="modalLabelsDeletePayMethod.DeletePayMethodDetails"
                                :modal-desc="modalLabelsDeletePayMethod.DeletePayMethodDetails"
                                :modal-heading-default="modalLabelsDeletePayMethod.DeletePayMethodDefaultHeading"
                                :modal-desc-default="modalLabelsDeletePayMethod.DeletePayMethodDefaultDetails"
                                :modal-heading-selected="modalLabelsDeletePayMethod.DeletePayMethodSelectedHeading"
                                :modal-desc-selected="modalLabelsDeletePayMethod.DeletePayMethodSelectedDetails"
                                :modal-cta-selected="modalLabelsDeletePayMethod.DeletePayMethodSelectedAction"
                                :owing-balance-customer-id="owingBalanceCustomerId"
                                :pay-method-id="method.PayMethodId"
                                data-testid="button-deleteCta"
                                @deletingPayMethod="(args) => $emit('deletingPayMethod', args)"
                                @delete-selected="onDeleteSelected">

                                <span role="text">
                                    {{ deletePaymentLabel }} <span class="sr-only" v-html="method.LastFourDigitsOfAccount"></span>
                                </span>
                            </CheckoutDeletePaymentMethod>
                        </li>
                        <li
                            v-if="(method.CanBeDefault && !isDefault(method.PayMethodDefaults))"
                            class="m-payMethodCtrls__item">

                            <CheckoutSetDefaultPaymentMethod
                                class="m-payMethodCtrls__btn"
                                :set-as-default-label="setAsDefaultLabel"
                                :has-prod-serv-defaults="hasProdServDefaults"
                                :pay-method-defaults="method.PayMethodDefaults"
                                :pay-method-id="method.PayMethodId"
                                :is-riverbend="isRiverbend"
                                :owing-balance-customer-id="owingBalanceCustomerId"
                                data-testid="button-makeDefaultCta"
                            />
                        </li>
                    </ul>
                </li>
            </ul>
        </perfect-scrollbar>

        <!-- START: TODO - Figure out what to do with this guest shopping edit link
        <a
            class="o-checkoutAccordion__edit"
            :href="editGuestLink">

            <span class="font-material text-base leading-base" aria-hidden="true">edit</span>
            <span class="uppercase pl-5">{{ editLabel }} <span class="sr-only" v-html="selectedPayMethod.PaymethodNameDisplay + ' ' + selectedPayMethod.LastFourDigitsOfAccount"></span></span>
        </a>
        END: TODO -->
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import CheckoutDeletePaymentMethod from '../../00-atoms/checkout/checkout-delete-payment-method.vue';
    import CheckoutSetDefaultPaymentMethod from '../../00-atoms/checkout/checkout-set-default-payment-method.vue';
    import paymentMethodsMixin from '../../../mixins/payment-methods';
    import { isProductsDefault, isServicesDefault, isRiverbendDefault } from '../../../utils/payment-methods';
    import { checking, directDebit } from '../../../utils/payment-types';

    export default {
        name: 'OCheckoutPaymentMethodsList',
        components: {
            CheckoutDeletePaymentMethod,
            CheckoutSetDefaultPaymentMethod
        },
        mixins: [ paymentMethodsMixin ],
        props: {
            deletePaymentLabel: {
                type: String,
                default: 'Delete'
            },
            owingBalanceCustomerId: {
                type: Number,
                default: null
            },
            setAsDefaultLabel: {
                type: String,
                default: 'Set as Default '
            },
            useDefaultMethodOfPayment: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState('paymentMethod', ['storedCountryInfo']),
            ...mapState('riverbendSubscription', ['isRiverbend']),

            hasProdServDefaults() {
                const payMethod = this.payMethodsSorted.find(item => isProductsDefault(item.PayMethodDefaults) && isServicesDefault(item.PayMethodDefaults));
                return Boolean(payMethod && payMethod.PayMethodId);
            }
        },
        methods: {
            isDefault(payMethodDefaults) {
                return this.isRiverbend
                    ? isRiverbendDefault(payMethodDefaults)
                    : isProductsDefault(payMethodDefaults);
            },
            isEditable(method) {
                if(this.isCn) {
                    return false;
                }

                // aggregate all possible payment type strings for checking pay methods
                const checkingOptions = this.storedCountryInfo.PayMethods?.find((availableMethods) => availableMethods.Paymethod === checking)?.Options || [];
                const checkingOptionNames = checkingOptions.map(({ Name }) => Name);

                // can't be edited if direct debit or checking
                if(method.PayMethodType === directDebit || checkingOptionNames.includes(method.PayMethodType)) {
                    return false;
                }

                return method.IsEditable && method.PayMethodId;
            },
            onDeleteSelected() {
                const payMethodId = this.payMethodsSorted.find((method) => isProductsDefault(method.PayMethodDefaults))?.PayMethodId;
                if(payMethodId) {
                    this.$emit('update', { PayMethodId: payMethodId });
                }
            },
            updateScroll() {
                this.$refs.scrollbar?.update();
            }
        }
    };
</script>

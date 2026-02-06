<template>
    <section class="o-payForm" :class="rootClasses">
        <component
            :is="componentType"
            id="payment-form"
            v-bind="formAttributes">
            <!-- Show spinner while API is being loaded submited -->
            <div v-if="showSpinner" class="o-payForm__loading">
                <a-loading-spinner
                    :visible="true"
                    class="o-payForm__loadingIcon"
                    aria-hidden="true">
                </a-loading-spinner>
            </div>

            <slot name="before" v-bind="slotProps" />

            <!-- Form fields -->
            <div class="o-payForm__wrapper" :class="wrapperClasses">
                <!-- Slot to receive payment title -->
                <slot v-if="$slots['payment-title']" name="payment-title" />

                <div v-if="isChecking && isEditing && !isRiverbendSubscription" class="o-payForm__notEditable e-formError py-0">
                    <p class="e-formError__item" role="alert" v-html="getLabels('Labels.Header.NotEditable', 'Checking account cannot be edited')"></p>
                </div>

                <!-- Payment methods (US, KR and MX only; add mode only) -->
                <div v-if="!isEditing && showPaymentMethods" class="o-payForm__row -payMethods">
                    <p class="o-payForm__title -payMethods" :class="newPaymentMethodTitleMods" v-html="newPaymentMethodTitle"></p>
                    <div class="flex" :class="[{ 'flex-col md:flex-row': isInline }, radioButtonMods || { 'justify-between': showPayPalPaymentOption }]">
                        <!-- Payment methods - Debit/Credit Card Option -->
                        <m-radio
                            v-if="isCreditCardAllowed"
                            ref="paymentMethodType"
                            v-model="selectedMethod"
                            :class="usePayPalStyleFirstElement"
                            :name="paymentMethodType1.Name"
                            :label="creditDebitCardRadioLabel"
                            :label-mods="creditDebitCardRadioMods"
                            :input-value="paymentMethodType1.Value"
                            @change="gtmTrackAction({id: 205, text: 'Debit or Credit Card'}, $event)">
                        </m-radio>

                        <!-- Payment methods - Checking Option -->
                        <m-radio
                            v-if="showCheckingPaymentMethodOption"
                            ref="paymentMethodType"
                            v-model="selectedMethod"
                            :class="isInline ? 'md:pl-10 md:w-auto' : 'pl-10'"
                            :name="paymentMethodType2.Name"
                            :label="checkingRadioLabel"
                            :label-mods="checkingRadioMods"
                            :input-value="paymentMethodType2.Value"
                            @change="gtmTrackAction({id: 205, text: 'Checking'}, $event)">
                        </m-radio>

                        <!-- Payment methods - PayPal Option (MX Only) -->
                        <m-radio
                            v-if="showPayPalPaymentOption"
                            ref="paymentMethodType"
                            v-model="selectedMethod"
                            :class="usePayPalStyleNotFirstElement"
                            :name="paymentMethodType3.Name"
                            :label="paypalRadioLabel"
                            :label-mods="paypalRadioMods"
                            :input-value="paymentMethodType3.Value"
                            @change="gtmTrackAction({id: 205, text: 'PayPal'}, $event)">
                        </m-radio>

                        <!-- Payment methods - Direct Debit Option (MX only) -->
                        <m-radio
                            v-if="isDirectDebitAllowed"
                            ref="paymentMethodType"
                            v-model="selectedMethod"
                            :class="usePayPalStyleNotFirstElement"
                            :name="paymentMethodType4.Name"
                            :label="getLabels('Labels.DirectDebit.DirectDebit', paymentMethodType4.Label)"
                            :label-mods="directDebitRadioMods"
                            :input-value="paymentMethodType4.Value"
                            @input="gtmTrackAction({id: 205, text: 'Direct Debit'}, $event)">
                        </m-radio>
                    </div>
                    <p v-if="checkingDeliveryTimelineMessage && selectedMethod === 'checking'" class="o-payForm__checkingDeliveryMessage"><br />{{ checkingDeliveryTimelineMessage }}</p>
                </div>

                <!-- Payment form for Debit/Credit Card -->
                <slot
                    v-if="showCreditPaymentForm"
                    name="credit"
                    v-bind="slotProps">

                    <payment-form-credit
                        v-if="showCreditPaymentForm"
                        ref="paymentFormCredit"
                        :is-enrollment="isEnrollment"
                        :is-guest-checkout="isGuestCheckout"
                        :label-expired="labelExpired"
                        :label-expires="labelExpires"
                        :script-id="scriptId"
                        :mask-card-number="isEditing"
                        :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                        :use-nick-name="!hideNickName"
                        :use-default-layout="useDefaultCreditLayout"
                        :card-number="cardNumberDefaults"
                        :rb-is-editing="rbIsEditing"
                        :zip="zipDefaultValues">
                    </payment-form-credit>
                </slot>

                <!-- ACH - Delayed Shipping Message -->
                <expandable-message
                    v-if="showExpandableMessage"
                    :message-text="expandableMessageText"
                    :message-text-expanded="expandableMessageTextFull"
                    :less-text="getLabels('Labels.Checking.Less')"
                    :more-text="getLabels('Labels.Checking.More')">
                </expandable-message>

                <!-- Payment form for Checking (US only and Add Form only) -->
                <slot
                    v-if="isCheckingAllowed && isChecking && !isEditing"
                    name="checking"
                    v-bind="slotProps">

                    <payment-form-checking
                        ref="paymentFormChecking"
                        :is-enrollment="isEnrollment"
                        :is-guest-checkout="isGuestCheckout"
                        :rb-is-editing="rbIsEditing"
                        :script-id="scriptId">
                    </payment-form-checking>
                </slot>

                <div v-if="isChecking && isEditing && isRiverbendSubscription && !isCA && !isRiverbend" class="mb-20">
                    <p class="a-input__cardWrapper -pseudo">
                        <span class="a-input__cardMaskWrapper">
                            <span class="a-input__cardName">{{ rbCheckingLabel }}</span>
                            <span v-html="storedPayMethod.MaskingCondensed"></span>
                            <span>{{ storedPayMethod.LastFourDigitsOfAccount }}</span>
                            <span v-if="checkingDeliveryTimelineMessage" class="italic"><br />{{ checkingDeliveryTimelineMessage }}</span>
                        </span>
                    </p>
                </div>

                <!-- Payment form for Direct Debit  -->
                <slot
                    v-if="isDirectDebitAllowed && isDirectDebit && !isEditing"
                    name="direct-debit"
                    v-bind="slotProps">
                    <!-- Direct debit- Form-Submit view -->
                    <PaymentFormDirectDebitForm
                        v-if="isDirectDebitAForm"
                        ref="paymentFormDirectDebitForm"
                        :is-sepa="isSepaDirectDebit"
                        :script-id="scriptId" />
                    <!-- Direct debit - Form-Download view -->
                    <payment-form-direct-debit
                        v-else
                        ref="paymentFormDirectDebit"
                        :is-enrollment="isEnrollment"
                        :is-guest-checkout="isGuestCheckout"
                        :script-id="scriptId">
                    </payment-form-direct-debit>
                </slot>

                <a-pay-label
                    v-if="isEditing && isPayPal && storedPayMethod"
                    class="o-payForm__title -payPal"
                    :image="storedPayMethod.PayMethodImage"
                    :name-on-account="storedPayMethod.NameOnAccount"
                    :type="storedPayMethod.PayMethodType"
                    :display-name="storedPayMethod.PaymethodNameDisplay"
                > </a-pay-label>

                <!-- Second Pay Label for Adding New Paypal Method of Payment -->
                <a-pay-label
                    v-if="!isEditing && paypalNonceReceived && isPayPal"
                    class="o-payForm__title -payPal"
                    :image="getLabels('Labels.PayPal.PayMethodImage')"
                    :name-on-account="paypalEmail"
                    type="PayPal"
                    :display-name="getLabels('Labels.PayPal.PaymethodNameDisplay')"
                > </a-pay-label>

                <!-- One Time Use option (only for add debit/credit card/paypal and when coming from Checkout) -->
                <!-- Hidden for reactivation order -->
                <div
                    v-if="showOneTimeUse"
                    class="o-payForm__row"
                    :class="oneTimeUseMods">

                    <!-- Frequency Title -->
                    <p
                        v-if="getLabels('Labels.Frequency.SavePaymethodHeading')"
                        class="text-base pt-15 pb-12 text-gray-120"
                        v-html="getLabels('Labels.Frequency.SavePaymethodHeading')"
                    />

                    <!-- Save to Account -->
                    <m-radio
                        v-model="selectedFrequency"
                        class="mb-5"
                        :name="paymentFrequency1.Name"
                        :label="getLabels('Labels.Frequency.SaveAccount', paymentFrequency1.Label)"
                        :label-mods="`${oneTimeUseLabelMods} ${selectedFrequency === 'save' ? oneTimeUseHighlightMods : ''}`"
                        :input-value="paymentFrequency1.Value">
                    </m-radio>

                    <!-- One Time Use -->
                    <m-radio
                        v-model="selectedFrequency"
                        class="mb-5"
                        :disabled="isPayPal && !storedPayMethods.length"
                        :name="paymentFrequency2.Name"
                        :label="getLabels('Labels.Frequency.OneTime', paymentFrequency2.Label)"
                        :label-mods="`${oneTimeUseLabelMods} ${selectedFrequency === 'onetime' ? oneTimeUseHighlightMods : ''}`"
                        :input-value="paymentFrequency2.Value">
                    </m-radio>
                </div>

                <!-- Make default payments (only for debit/credit card option, checking option and direct-debit SEPA - Eu countries) -->
                <slot
                    v-if="showDefaultCheckBoxes"
                    name="default-checkboxes"
                    v-bind="slotProps">

                    <div class="o-payForm__row -defaultPay">

                        <!-- Phrase "Make this default" -->
                        <p
                            v-if="!hideDefaultPay"
                            class="o-payForm__title"
                            :class="defaultCheckboxTitleMods"
                            v-html="getLabels('Labels.Defaults.MakeThisMyDefault', defaultPayTitle)"
                        />

                        <div class="o-payForm__defaultPay" :class="{'ml-0' : hideDefaultPay, 'mt-10' : hideDefaultPay && isCheckout && isPayPal, 'mt-25' : hideDefaultPay && isCheckout && !isPayPal}">
                            <!-- Product Purchases option -->
                            <div v-if="isDefaultProductsAllowed">
                                <m-checkbox
                                    ref="productPurchases"
                                    v-model="productPurchasesValue"
                                    :disabled="hideOneTimeUsePaymethod || isOneTimeUse"
                                    :name="productPurchases.Name"
                                    :label="getLabels('Labels.Defaults.ProductPurchases', productPurchases.Label)"
                                    :label-mods="defaultProductsLabelMods"
                                    :input-value="productPurchases.Value"
                                    @input="gtmTrackAction({id: 204, text:getLabels('Labels.Defaults.ProductPurchases', productPurchases.Label)}, {target: null})">
                                </m-checkbox>
                                <FormFieldErrorMessage
                                    id="defaultPayMethodErrorMsg"
                                    :is-visible="!productPurchasesValid"
                                    :msg="getLabels('Labels.ErrorMessages.ShouldBeDefault.Required', '')"
                                />
                            </div>

                            <!-- Riverbend purchase option -->
                            <div v-if="isDefaultRiverbendAllowed">
                                <m-checkbox
                                    ref="riverbendPurchases"
                                    v-model="riverbendPurchasesValue"
                                    :disabled="hideOneTimeUsePaymethod || isOneTimeUse"
                                    :name="productPurchases.Name"
                                    :label="getLabels('Labels.Defaults.RiverbendRanch', riverbendPurchases.Label)"
                                    :label-mods="defaultProductsLabelMods"
                                    :input-value="productPurchases.Value"
                                    @input="gtmTrackAction({id: 204, text:getLabels('Labels.Defaults.RiverbendRanch', '')}, {target: null})">
                                </m-checkbox>
                                <FormFieldErrorMessage
                                    id="defaultPayMethodErrorMsg"
                                    :is-visible="!productPurchasesValid"
                                    :msg="getLabels('Labels.ErrorMessages.ShouldBeDefault.Required', '')"
                                />
                            </div>

                            <!-- Marketplace Services option -->
                            <m-checkbox
                                v-if="isDefaultServicesAllowed && !isRiverbendSubscription"
                                ref="marketplaceServices"
                                v-model="marketplaceServicesValue"
                                :disabled="isOneTimeUse || isMarktplaceFlow"
                                :name="marketplaceServices.Name"
                                :label="getLabels('Labels.Defaults.MarketplaceServices', marketplaceServices.Label)"
                                :label-mods="defaultServicesLabelMods"
                                :input-value="marketplaceServices.Value">
                            </m-checkbox>
                            <!-- Mandate-Agreement (SEPA-Eu countries) -->
                            <div v-if="isSepaMandateRequired">
                                <m-checkbox
                                    ref="mandateAgreement"
                                    v-model="mandateAgreementValue"
                                    :label-mods="mandateLabels"
                                    :aria-required="true"
                                    :label="getLabels('Labels.Defaults.MandateAgreement','')"
                                    name="mandateAgreement"
                                    input-value="mandateAgreement"
                                />
                                <FormFieldErrorMessage
                                    id="mandateErrorMsg"
                                    :is-visible="!mandateAgreementValid"
                                    :msg="getLabels('Labels.ErrorMessages.MandateAgreement.Required', '')"
                                />
                            </div>
                        </div>
                    </div>
                </slot>

                <!-- PayPal form - currently on MX -->
                <slot
                    v-if="showPayPalPaymentOption && isPayPal && !paypalNonceReceived"
                    name="paypal"
                    v-bind="slotProps"
                >
                    <PaymentFormPaypal
                        :is-checkout="isCheckout"
                        :paypal-client-token="paypalClientToken"
                        :paypal-billing-agreement-label="paypalBillingAgreementLabel"
                        :paypal-error-label="paypalErrorLabel"
                        :paypal-name-display="getLabels('Labels.PayPal.PaymethodNameDisplay')"
                        :paypal-image="getLabels('Labels.PayPal.PayMethodImage')"
                        :show-pay-pal-error="showPayPalError"
                        @paypal-data="handlePayPalData"
                    />

                </slot>

                <!-- Footnote (only for debit/credit card/ direct-debit-form  option and checking option) -->
                <div
                    v-if="showFootnote"
                    class="o-payForm__row -footnote mb-20" :class="!isGuestOrEnrollment ? 'mt-20' : 'mt-0'">
                    <p
                        class="o-payForm__footnote"
                        v-html="
                            hasCardFootnotesData
                                ? getLabels('Labels.Card.Footnotes')
                                : getLabels('Labels.Defaults.FutureCharges', defaultPayFootNote)
                        "
                    />
                </div>
            </div>

            <!-- CTAs and Validation message -->
            <div class="o-payForm__actions" :class="{'-aside': isActionsAside, 'self-end': isActionsAside && !$slots['aside-content']}">
                <!-- Slot to receive extra aside content -->
                <slot v-if="$slots['aside-content']" name="aside-content" />

                <!-- Action Buttons -->
                <div
                    v-if="isCreditCard || isDirectDebit || isPayPal || isRiverbendSubscription || (isChecking && !isEditing)"
                    class="o-payForm__row -actions flex-wrap"
                    :class="{'-aside': isActionsAside}">

                    <slot
                        name="actions"
                        v-bind="slotProps">

                        <!-- Cancel Button -->
                        <div
                            v-if="showCancelButton"
                            class="o-payForm__col -cancelBtn to-md:w-full to-md:mr-0 to-md:mb-10">
                            <v-button
                                :cta="getLabels('Labels.FormSubmit.Cancel', buttonCancel)"
                                class="-cancel -cancelPay"
                                @click="[handleCancel(), gtmTrackAction({id: 204}, $event)]">
                            </v-button>
                        </div>

                        <!-- Save Button (only for debit/credit card option and checking option)  -->
                        <div
                            v-if="showSaveButton"
                            class="o-payForm__col -saveBtn"
                            :class="isActionsAside ? 'w-full' : 'to-md:w-full to-md:mr-0'">

                            <!-- Save Button -->
                            <v-button
                                :cta="submitCTA"
                                class="o-payForm__save -save"
                                type="submit"
                                @click="[handleSubmit($event), gtmTrackAction({id: 204}, $event)]">
                            </v-button>
                        </div>

                        <!-- Download Button (only for direct debit option)  -->
                        <div v-else class="o-payForm__col -downloadBtn" :class="isActionsAside ? 'w-full' : 'to-md:w-full to-md:mr-0'">
                            <!-- Download Button -->
                            <v-button
                                :cta="getLabels('Labels.FormSubmit.Download', 'Download')"
                                class="-save"
                                :is-anchor="true"
                                :href="fileDownload"
                                target="_blank">
                            </v-button>
                        </div>

                    </slot>

                    <!-- Show API/FE errors messages -->
                    <div
                        v-if="dirty && listError && listError.length && !showPayPalError && !showPrePaidError"
                        class="o-payForm__apiError e-formError"
                        :class="isActionsAside ? 'w-full flex flex-col items-end justify-end' : 'w-full'"
                        data-testid="container-addNewPaymentSubmitErrorMessage">
                        <p
                            v-for="(validation, index) in listError"
                            :id="`${'validation-error-'+ index}`"
                            :key="index"
                            class="e-formError__item"
                            :class="isActionsAside ? 'block text-right py-0' : 'py-0'"
                            role="alert"
                            data-testid="paragraph-addNewPaymentSubmitErrorMessage">
                            {{ validation.error ? validation.error : validation }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Modal - CHECKING ACCOUNT -->
            <modal id="modal-checking" width="430px">
                <div class="o-payForm -modal">
                    <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                        {{ getLabels('Labels.Checking.DeleteTitle', 'Are you sure?') }}
                    </h2>

                    <p
                        class="o-payForm__modalText"
                        v-html="getLabels('Labels.Checking.DeleteText', 'This will overwrite any existing checking account information and cannot be undone.')"></p>

                    <div class="o-payForm__modalFooter">
                        <button
                            class="o-payForm__modalBtn a-button -cancel"
                            @click="closeModal(currentModalId)">
                            {{ getLabels('Labels.FormSubmit.Cancel', buttonCancel) }}
                        </button>
                        <button
                            class="o-payForm__modalBtn a-button -save"
                            @click="confirmDelete">
                            {{ getLabels('Labels.FormSubmit.Confirm', 'Confirm') }}
                        </button>
                    </div>
                </div>
            </modal>

            <!-- Modal - DIRECT DEBIT -->
            <modal id="modal-direct-debit" width="430px">
                <div class="o-payForm -modal">
                    <p
                        class="o-payForm__modalText"
                        v-html="directDebitModalHeader"></p>

                    <div class="o-payForm__modalFooter">
                        <button
                            class="o-payForm__modalBtn a-button -cancel"
                            @click="closeModal(currentModalId)">
                            {{ getLabels('Labels.DirectDebit.Modal.Cancel') }}
                        </button>
                        <button
                            class="o-payForm__modalBtn a-button -save"
                            @click="confirmDelete">
                            {{ getLabels('Labels.DirectDebit.Modal.Confirm') }}
                        </button>
                    </div>
                </div>
            </modal>

            <OAddressPaymethodPrompt
                v-if="!isInline"
                ref="paymentPrompt"
                :cancel-label="getLocalizationProp('Labels.PaymethodPromptModel.ChangeOne', '')"
                :confirm-label="getLocalizationProp('Labels.PaymethodPromptModel.ChangeBoth', '')"
                :desc-label="getLocalizationProp('Labels.PaymethodPromptModel.Description', '')"
                :is-pay-method-prompt="true"
                :is-prompt-enabled="isPaymethodPromptEnabled"
                :is-riverbend="isRiverbend"
                :ok-label="getLocalizationProp('Labels.Checkout.Ok', 'OK')"
                :title-label="getLocalizationProp('Labels.PaymethodPromptModel.Title', '')"
                :updated-label="getLocalizationProp('Labels.PaymethodPromptModel.Updated', '')"
                @onComplete="goToPreviousPage"
            />
        </component>
    </section>
</template>

<script>
    import { mapGetters, mapState, mapActions, mapMutations } from 'vuex';
    import getFocusable from '@common/source/js/utils/get-focusable';
    import cookie from '../../../utils/cookie';
    import ExpandableMessage from '../../01-molecules/expandable-message/expandable-message.vue';
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import paymentFormMixin from '../../../mixins/payment-form';
    import * as paymentMethodsUtil from '../../../utils/payment-methods';
    import cardNumber from '@common/source/js/vue/utils/card-number';
    import apiClearCache from '@api/routes/subscription/clearcache';
    import PaymentFormDirectDebitForm from '../../01-molecules/my-account/payment-form-direct-debit-form.vue';
    import PaymentFormPaypal from '../../01-molecules/my-account/payment-form-paypal.vue';
    import OAddressPaymethodPrompt from '@productstore/source/js/vue/components/02-organisms/modals/address-paymethod-prompt.vue';
    import { checking, directDebit, achChecking} from '../../../utils/payment-types';

    export default {
        name: 'PaymentForm',
        components: {
            ExpandableMessage,
            FormFieldErrorMessage,
            OAddressPaymethodPrompt,
            PaymentFormDirectDebitForm,
            PaymentFormPaypal
        },
        mixins: [ paymentFormMixin ],
        props: {
            buttonCancel: {
                type: String,
                default: 'Cancel'
            },
            buttonSave: {
                type: String,
                default: 'Save'
            },
            buttonContinue: {
                type: String,
                default: null
            },
            defaultCheckboxLabelMods: {
                type: String,
                default: ''
            },
            defaultCheckboxTitleMods: {
                type: String,
                default: '-defaultPay'
            },
            defaultPayTitle: {
                type: String,
                default: 'Make this my default payment method for:'
            },
            defaultPayFootNote: {
                type: String,
                default: 'Your method of payment may be charged for future orders, services or to settle outstanding debt on this account.'
            },
            checkFirstTimeUser: {
                type: Boolean,
                default: true
            },
            hideDefaultCheckboxes: {
                type: Boolean,
                default: false
            },
            hideOneTimeUse: {
                type: Boolean,
                default: false
            },
            hideOneTimeUsePaymethod: {
                type: Boolean,
                default: false
            },
            hiddenErrorTypes: {
                type: Array,
                default: () => []
            },
            hideCheckoutPaypalLabel: {
                type: Boolean,
                default: false
            },
            isCheckoutDirectDebitAForm: {
                type: Boolean,
                default: false
            },
            isOwingBalance: {
                type: Boolean,
                default: false
            },
            isRiverbendSubscriptionFlow: {
                type: Boolean,
                default: false
            },
            labelExpired: {
                type: String,
                default: 'Expired'
            },
            labelExpires: {
                type: String,
                default: 'Expires'
            },
            newPaymentMethodTitleMods: {
                type: String,
                default: ''
            },
            oneTimeUseMods: {
                type: String,
                default: 'mb-15'
            },
            oneTimeUseHighlightMods: {
                type: String,
                default: 'font-bold'
            },
            oneTimeUseLabelMods: {
                type: String,
                default: ''
            },
            owingBalanceCustomerId: {
                type: Number,
                default: null
            },
            paymentMethodTitle: {
                type: String,
                default: 'Payment Method Type'
            },
            paymentMethodType1: {
                type: Object,
                default: function() {
                    return {
                        Name: 'paymentmethodtype',
                        Value: 'card',
                        Label: 'Debit/Credit Card'
                    };
                }
            },
            paymentMethodType2: {
                type: Object,
                default: function() {
                    return {
                        Name: 'paymentmethodtype',
                        Value: 'checking',
                        Label: 'Checking'
                    };
                }
            },
            paymentMethodType3: {
                type: Object,
                default: function() {
                    return {
                        Name: 'paymentmethodtype',
                        Value: 'paypal',
                        Label: 'PayPal'
                    };
                }
            },
            paymentMethodType4: {
                type: Object,
                default: function() {
                    return {
                        Name: 'paymentmethodtype',
                        Value: 'directdebit',
                        Label: 'Direct debit'
                    };
                }
            },
            paymentFrequency1: {
                type: Object,
                default: function() {
                    return {
                        Name: 'paymentmethodfrequency',
                        Value: 'save',
                        Label: 'Save'
                    };
                }
            },
            paymentFrequency2: {
                type: Object,
                default: function() {
                    return {
                        Name: 'paymentmethodfrequency',
                        Value: 'onetime',
                        Label: 'One Time use'
                    };
                }
            },
            paypalEmailCheckout: {
                type: String,
                default: ''
            },
            paypalNonceCheckout: {
                type: String,
                default: ''
            },
            prePaidCreditCardApplicationId: {
                type: Number,
                default: 1
            },
            productPurchases: {
                type: Object,
                default: function() {
                    return {
                        InputType: 'checkbox',
                        Id: 'prodpurchases',
                        Name: 'prodpurchases',
                        Value: paymentMethodsUtil.defaultPaymentTypes.products,
                        Label: 'Product Purchases'
                    };
                }
            },
            radioButtonMods: {
                type: String,
                default: ''
            },
            riverbendPurchases: {
                type: Object,
                default: function() {
                    return {
                        InputType: 'checkbox',
                        Id: 'riverbendprodpurchases',
                        Name: 'riverbendprodpurchases',
                        Value: paymentMethodsUtil.defaultPaymentTypes.riverbend,
                        Label: 'Riverbend Purchases'
                    };
                }
            },
            riverbendLabels: {
                type: Object,
                default: () => ({Labels: {}, Data: {}})
            },
            marketplaceServices: {
                type: Object,
                default: function() {
                    return {
                        InputType: 'checkbox',
                        Id: 'marketplace',
                        Name: 'marketplace',
                        Value: paymentMethodsUtil.defaultPaymentTypes.services,
                        Label: 'Marketplace Services including Protection, Health Care Savings and Melaleuca Deals'
                    };
                }
            },
            membershipFeeAgreement: {
                type: Boolean,
                default: false
            },
            membershipFeeAgreementRequired: {
                type: Boolean,
                default: false
            },
            showPrePaidError: {
                type: Boolean,
                default: false
            },
            token: {
                type: String,
                default: null
            },
            isCustomerManagementAgreementForm: {
                type: Boolean,
                default: false
            },
            isEnrollment: {
                type: Boolean,
                default: false
            },
            isGuestCheckout: {
                type: Boolean,
                default: false
            },
            isActionsAside: {
                type: Boolean,
                default: false
            },
            wrapperMods: {
                type: String,
                default: ''
            },
            userNameFallback: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                dirty: false,
                formIsValid: false,
                paymentMethodTypeValue: 'card',
                paymentMethodFrequencyValue: 'save',
                bankValue: null,
                cardHolderValue: null,
                cardMaxLength: null,
                cardMinLength: null,
                cardNumberValue: null,
                cardNumberType: null,
                creditCardType: null,
                defaultPayMethodForPaymentPrompt: {
                    PayMethodDefaults: null,
                    PayMethodId: null
                },
                expMonthValue: null,
                expYearValue: null,
                cvvValue: null,
                zipValue: null,
                nicknameValue: null,
                accountHolderValue: null,
                accountTypeValue: null,
                routingNumberValue: null,
                accountNumberValue: null,
                productPurchasesValue: null,
                productPurchasesValid: true,
                marketplaceServicesValue: null,
                nameOnAccountValue: null,
                riverbendPurchasesValue: null,
                apiSuccess: false,
                paypalEmail: '',
                paypalNonce: '',
                paypalNonceReceived: false,
                showPayPalError: false,
                showSubmitLoading: false,
                shouldOverwriteAccount: false,
                initialLoad: false,
                urlParams: null,
                clearSpinner: false,
                isMarktplaceFlow: false,
                isSlotFormValid: false,
                // Mandate Checkbox
                mandateAgreementValue: null,
                mandateAgreementValid: true,
                wasNotProductDefault: null,
                wasNotRiverbendDefault: null
            };
        },
        computed: {
            ...mapState('paymentMethod', [
                'paypalClientToken',
                'storedApiError',
                'storedApiErrorTypes',
                'storedApiLoading',
                'storedApiSuccess',
                'storedBanks',
                'storedCountryInfoLoaded',
                'storedPayMethod',
                'storedPayInfo']),
            ...mapState('riverbendSubscription', ['isRiverbend', 'isRiverbendSubscription']),
            ...mapGetters('checkoutAccordions', ['onExpandPaymentMethod']),

            showSpinner() {
                return ((this.showSubmitLoading || !this.initialLoad || this.apiSuccess) && !this.clearSpinner);
            },
            applicationLocation() {
                return this.urlParams.get('location') ?? '';
            },
            bearerToken() {
                // Get token from prop
                let token = this.token;

                // If prop is null/false/undefined
                if(!token) {
                    // Get token from cookie
                    const cookieToken = cookie.getCookie('paymentClient');

                    if(cookieToken !== null) {
                        token = cookieToken;
                    }
                }

                return token;
            },
            checkingDeliveryTimelineMessage() {
                return this.isRiverbendSubscription ? this.localization?.Labels?.CheckingDeliveryTimelineMessage : '';
            },
            checkingRadioLabel() {
                return this.getLabels('Labels.Header.Checking', this.paymentMethodType2.Label) || this.riverbendLabels?.Labels?.CheckingLabel;
            },
            checkingRadioMods() {
                return [
                    !this.isInline ? '-tight to-md:text-xs' : 'text-base font-bold',
                    this.selectedMethod === 'checking' && !this.isInline ? 'font-bold' : ''
                ].filter((mod) => mod).join(' ');
            },
            componentType() {
                if(this.isRiverbendSubscription) {
                    return 'div';
                } else {
                    return this.isGuestOrEnrollment && !this.isGuestCheckoutEditing ? 'div' : 'form';
                }
            },
            creditDebitCardRadioLabel() {
                return this.getLabels('Labels.Header.DebitOrCreditCard', this.paymentMethodType1.Label) || this.riverbendLabels?.Labels?.CreditCardLabel;
            },
            creditDebitCardRadioMods() {
                return [
                    !this.isInline ? '-tight to-md:text-xs' : 'text-base font-bold',
                    this.selectedMethod === 'card' && !this.isInline ? 'font-bold' : ''
                ].filter((mod) => mod).join(' ');
            },
            customerId() {
                return this.localization?.Data?.CustomerId ? this.localization?.Data?.CustomerId : this.$custInfo?.customerID;
            },
            defaultProductsLabelMods() {
                return [
                    this.isMX & this.isCheckout ? '-removeLeftPadding' : '',
                    !this.productPurchasesValid ? '-error' : '',
                    this.isJP || this.isKR || this.isSGMY || this.isUK || this.isSepaDirectDebit ? 'font-normal' : '',
                    this.defaultCheckboxLabelMods
                ].join(' ');
            },
            defaultServicesLabelMods() {
                return [
                    this.isKR ? 'font-normal' : '',
                    this.defaultCheckboxLabelMods
                ].join(' ');
            },
            directDebitModalHeader() {
                return this.localization?.Data?.DirectDebit?.Modal?.RTE || '';
            },
            directDebitRadioMods() {
                return [
                    !this.isInline ? '-tight to-md:text-xs' : 'text-base font-bold',
                    this.selectedMethod === 'directdebit' && !this.isInline ? 'font-bold' : ''
                ].filter((mod) => mod).join(' ');
            },
            errorMessages() {
                let errorMessages = this.localization?.Labels?.ErrorMessages || {};

                if(this.isRiverbendSubscription) {
                    errorMessages = this.riverbendLabels?.Labels?.ErrorMessages || {};
                }

                return errorMessages;
            },
            expandableMessageText() {
                return this.getLabels('Labels.Checking.ExpandableMessage.Text');
            },
            expandableMessageTextFull() {
                return this.getLabels('Labels.Checking.ExpandableMessage.ExpandedText');
            },
            filteredApiListError() {
                if(!this.hiddenErrorTypes?.length) return this.storedApiError;

                if(this.storedApiError && this.storedApiErrorTypes) {
                    return this.storedApiError.filter((...[, index]) => {
                        const type = this.storedApiErrorTypes[index];
                        return !this.hiddenErrorTypes.includes(type);
                    });
                }
                return this.storedApiError ? this.storedApiError[0] : '';
            },
            hasCheckingAccount() {
                if(this.storedPayMethods && this.storedPayMethods.length) {
                    let type = null;
                    const accounts = this.storedPayMethods.filter(pay => {
                        type = pay.PayMethodType ? pay.PayMethodType.toLowerCase() : null;

                        return type.indexOf('checking') > -1 || type.indexOf('savings') > -1;
                    });

                    if(accounts && accounts.length) return true;
                }

                return false;
            },
            hideDefaultPay() {
                return this.isMX || this.isJP || this.isKR || this.isSGMY || this.isUK || this.isPL || this.isSepaDirectDebit || this.isPayPal;
            },
            isACH() {
                // Check if pay method type is ach checking, direct debit or checking, accounting for casing differences
                // Checking is sometimes has the value of 'ACH' and sometimes 'checking', so we need to check both
                const paymentTypes = [
                    achChecking.toLowerCase(),
                    checking.toLowerCase(),
                    directDebit.toLowerCase(),
                    'checking'
                ];
                return paymentTypes.includes(this.paymentMethodTypeValue.toLowerCase());
            },
            isChecking() {
                if(this.paymentMethodTypeValue === 'checking') {
                    return true;
                }

                return false;
            },
            isCreditCard() {
                if(this.paymentMethodTypeValue === 'card') {
                    return true;
                }

                return false;
            },
            isDirectDebit() {
                if(this.paymentMethodTypeValue === 'directdebit') {
                    return true;
                }

                return false;
            },
            isJP() {
                return this.$env?.Country === 'Japan' || false;
            },
            isPayPal() {
                return this.paymentMethodTypeValue?.toLowerCase() === 'paypal' || this.methodType === 'paypal';
            },
            isSepaMandateRequired() {
                return this.isSepaDirectDebit && this.onDirectDebitForm;
            },
            // Shows whether user is on the Direct debit form - A form(for now SEPA Europe countries and MX)
            onDirectDebitForm() {
                return this.isDirectDebitAllowed && this.isDirectDebit && !this.isEditing && this.isDirectDebitAForm;
            },
            mandateLabels() {
                return `font-normal -items-start${!this.mandateAgreementValid ? ' -error' : ''}`;
            },
            isPaymethodPromptEnabled() {
                return this.localization?.Data?.FeatureFlag?.PaymethodAddressPrompt || this.localization?.Data?.RiverbendPaymethodAddressPrompt;
            },
            currentModalId() {
                let modalId = '';
                if(this.Checking) {
                    modalId = 'modal-checking';
                } else if(this.IsDirectDebit) {
                    modalId = 'modal-direct-debit';
                }
                return modalId;
            },
            newPaymentMethodTitle() {
                if(this.isRiverbendSubscription) {
                    return this.riverbendLabels?.Labels?.Header?.PayMethodType;
                } else {
                    return this.getLabels('Labels.Header.PayMethodType', this.paymentMethodTitle);
                }
            },
            // Style first radio button if PayPal is included
            usePayPalStyleFirstElement() {
                return `${!this.isInline
                    ? this.showPayPalPaymentOption
                        ? 'w-auto'
                        : ''
                    : this.isPayPalAllowed
                        ? 'md:pl-10 md:w-auto md:mr-40'
                        : 'md:pl-10 md:w-auto md:mr-100'}`;
            },

            usePayPalStyleNotFirstElement() {
                return `${!this.isInline
                    ? this.showPayPalPaymentOption
                        ? 'w-auto'
                        : 'pl-10'
                    : this.isPayPalAllowed
                        ? 'md:pr-20 md:w-auto'
                        : 'md:pl-10 md:w-auto'}`;
            },
            paypalRadioLabel() {
                return this.getLabels('Labels.Header.PayPal', this.paymentMethodType3.Label);
            },
            paypalRadioMods() {
                return [
                    !this.isInline ? '-tight to-md:text-xs' : 'text-base font-bold',
                    this.selectedMethod === 'paypal' && !this.isInline ? 'font-bold' : ''
                ].filter((mod) => mod).join(' ');
            },
            rbAddNewPayMethodLabel() {
                return this.riverbendLabels.Labels?.AddNewPayMethod;
            },
            rbCancelLabel() {
                return this.riverbendLabels.Labels?.ShippingSection?.Cancel;
            },
            rbCheckingLabel() {
                return this.riverbendLabels.Labels?.CheckingLabel;
            },
            rbContinueLabel() {
                return this.riverbendLabels.Labels?.Continue;
            },
            rootClasses() {
                return [
                    this.isGuestOrEnrollment && !this.isGuestCheckoutEditing ? '-isGuest' : '',
                    this.isInline ? '-inline' : ''
                ];
            },
            shouldBeDefault() {
                // When add payment is thru reactivation order
                if(this.hideOneTimeUsePaymethod) {
                    return true;
                }
                // When ADDING
                if(!this.isEditing) {
                    // It should be default for Products IF:
                    // - the user does NOT have an account yet
                    // - it's NOT one time use
                    // - it's NOT Guest Checkout / Online Enrollment
                    return !this.storedPayMethods?.length && !this.isOneTimeUse && !this.isGuestOrEnrollment;

                // When EDITING
                } else {
                    // It should be default for Products IF:
                    // - the current payment is the default for Products
                    return paymentMethodsUtil.isProductsDefault(this.storedPayMethod.PayMethodDefaults);
                }
            },
            shouldBeDefaultRiverbend() {
                return paymentMethodsUtil.isRiverbendDefault(this.storedPayMethod.PayMethodDefaults);
            },
            showAddNewPayMethod() {
                if(this.isEditing && this.isRiverbendSubscription) return true;
                return false;
            },
            showCancelButton() {
                return !this.isGuestOrEnrollment || this.isGuestCheckoutEditing;
            },
            showCheckingPaymentMethodOption() {
                if(this.isRiverbendSubscription) {
                    return !(this.$env.Country === 'Canada') && this.isCheckingAllowed;
                } else {
                    return this.isCheckingAllowed;
                }
            },
            showCreditPaymentForm() {
                if(this.isRiverbendSubscription) {
                    return this.isCreditCardAllowed && (this.isCreditCard || (this.$env.Country === 'Canada' && this.storedPayMethod.PayMethodType !== 'ACHChecking'));
                } else {
                    return this.isCreditCardAllowed && this.isCreditCard;
                }
            },
            showDefaultCheckBoxes() {
                if(this.localization?.Data?.HideDefaultPayMethodCheckBoxes) return false;

                if(this.isRiverbendSubscription && this.isRiverbendSubscriptionFlow) return false;

                if(this.hideDefaultCheckboxes) return false;

                return ((this.isCreditCardAllowed && this.isCreditCard) || (this.isPayPal) || (this.isCheckingAllowed && this.isChecking && !this.isEditing) || (this.onDirectDebitForm)) && !this.isGuestOrEnrollment;
            },
            showExpandableMessage() {
                const showACHDelayedShipping = this.getLocalizationProp('Data.ShowAchDelayedShipping', false);
                return !!(showACHDelayedShipping && this.isACH && this.expandableMessageText && this.expandableMessageTextFull);
            },
            showFootnote() {
                if(this.isRiverbendSubscription || this.isInline) return false;
                if(this.onDirectDebitForm) return true;
                return (this.isCreditCard || this.isPayPal || (!this.isDirectDebit && this.isChecking && !this.isEditing)) && !this.isGuestCheckout;
            },
            showImprovedCTACheckout() {
                return this.getLocalizationProp('Data.ShowImprovedCTACheckout', false);
            },
            showSaveButton() {
                return !this.isDirectDebit || (this.isDirectDebit && this.isEnrollment) || (this.isDirectDebit && this.isDirectDebitAForm);
            },
            showPaymentMethods() {
                if(this.isJP || this.isKR) {
                    return true;
                }

                return this.isCreditCardAllowed && (this.isCheckingAllowed || this.isDirectDebitAllowed || this.isPayPalAllowed);
            },
            showOneTimeUse() {
                if(this.hideOneTimeUse || this.hideOneTimeUsePaymethod || !this.storedPayMethods.length) return false;
                // If user already has PayPal payment method, don't show One Time Use
                if(this.isPayPal && this.hasPayPalPaymentMethod && this.isCheckout) return false;
                return this.isCheckout && ((this.isCreditCardAllowed && this.isCreditCard) || this.isPayPal) && !this.isEditing && !this.isGuestOrEnrollment;
            },
            fileDownload() {
                return this.localization?.Data?.DirectDebit?.FormAccessLink?.Url;
            },
            isCheckout() {
                // don't need to check query param for ole checkout
                if(this.isOleCheckout) return true;

                // Customer management agreement form should not be treated as checkout
                if(this.hideCheckoutPaypalLabel) return false;

                // Is Checkout if has fromCheckout query string or is on Guest Checkout flow
                return this.urlParams?.get('fromCheckout') === 'true' || this.isGuestCheckout;
            },
            isOneTimeUse() {
                return this.selectedFrequency === 'onetime';
            },
            listError() {
                let errors = [];

                if(this.filteredApiListError && this.filteredApiListError.length) {
                    errors = errors.concat(this.filteredApiListError);
                }

                return errors;
            },
            methodType() {
                const methodType = this.checkMethodType();

                if(methodType) return methodType;

                return this.paymentMethodTypeValue;
            },
            selectedMethod: {
                get() {
                    return this.methodType;
                },
                set(val) {
                    this.paymentMethodTypeValue = val;
                }
            },
            selectedFrequency: {
                get() {
                    return this.paymentMethodFrequencyValue;
                },
                set(val) {
                    this.paymentMethodFrequencyValue = val;
                }
            },
            useDefaultCreditLayout() {
                return this.isJP || this.isKR || this.isSGMY;
            },
            userName() {
                return this.localization?.Data?.Username || this.userNameFallback;
            },
            userCountry() {
                let country = null;
                if(this.localization?.Data?.Country) {
                    country = this.localization.Data.Country.replace(/\s/g, '');
                }
                return country;
            },
            isGuestOrEnrollment() {
                return this.isGuestCheckout || this.isEnrollment;
            },
            isGuestCheckoutEditing() {
                return this.isGuestCheckout && this.isEditing;
            },
            formAttributes() {
                let attr = {};

                if(this.isGuestOrEnrollment && !this.isGuestCheckoutEditing) {
                    // Attributes for Guest Checkout / Online Enrollment
                    attr = {
                        class: 'o-payForm__guest'
                    };
                } else {
                    // Attributes for Regular Payment Form
                    attr = {
                        class: 'o-payForm__form',
                        action: '',
                        method: 'post',
                        name: 'payment-form'
                    };
                }

                return attr;
            },
            paypalBillingAgreementLabel() {
                return this.getLabels('Labels.PayPal.BillingAgreementDescription');
            },
            paypalErrorLabel() {
                return this.getLabels('Labels.PayPal.Setup');
            },
            submitCTA() {
                let cta = null;

                if(this.isRiverbendSubscription) {
                    cta = this.getLabels('Labels.Continue', this.buttonSave);
                } else if(this.isGuestOrEnrollment && !this.isGuestCheckoutEditing) {
                    cta = this.buttonContinue;
                } else {
                    cta = this.getLabels('Labels.FormSubmit.Save', this.buttonSave);
                }

                return cta;
            },
            slotProps() {
                return {
                    cardNumberDefaults: this.cardNumberDefaults,
                    dirty: this.dirty,
                    fileDownloadHref: this.fileDownload,
                    handleCancel: this.handleCancel,
                    handleSubmit: this.handleSubmit,
                    isChecking: this.isChecking,
                    isPayPal: this.isPayPal,
                    isDefaultProductsAllowed: this.isDefaultProductsAllowed,
                    isEditing: this.isEditing,
                    isOneTimeUse: this.isOneTimeUse,
                    paymentMethodTypeValue: this.paymentMethodTypeValue,
                    productPurchases: this.productPurchases,
                    productPurchasesValue: this.productPurchasesValue,
                    resetListErrors: this.resetListErrors,
                    setFormValidation: this.setFormValidation,
                    setProductPurchaseCheckbox: this.setProductPurchaseCheckbox,
                    showCancelButton: this.showCancelButton,
                    showSaveButton: this.showSaveButton,
                    useDefaultCreditLayout: this.useDefaultCreditLayout
                };
            },
            wrapperClasses() {
                return [
                    this.wrapperMods,
                    this.isActionsAside ? '-hasAside' : ''
                ];
            },
            zipDefaultValues() {
                if(this.isRiverbendSubscription) {
                    const Placeholder = this.$env.Country === 'Canada'
                        ? this.getLocalizationProp('Labels.ShippingSection.PostalCodePlaceholder')
                        : this.getLocalizationProp('Labels.ShippingSection.ZipCodePlaceholder');
                    return {
                        Id: 'zip',
                        Name: 'zip',
                        MinLength: 5,
                        MaxLength: 15,
                        Placeholder,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'BILLING ZIP CODE'
                    };
                }
                return undefined;
            }
        },
        watch: {
            isChecking() {
                if(this.isChecking && this.isEditing && !this.isGuestOrEnrollment) {
                    this.goToPreviousPage();
                }
            },
            mandateAgreementValue(newValue) {
                this.validateMandate();
            },
            methodType() {
                this.resetListErrors();
                this.mandateAgreementValid = true;
                this.productPurchasesValid = true;
                this.paymentMethodTypeValue = this.methodType;

                // Define as "Save to Account" every time that user changes the pay method type
                this.paymentMethodFrequencyValue = 'save';
            },
            paypalEmailCheckout(newValue) {
                this.paypalEmail = newValue;
            },
            paypalNonceCheckout(newValue) {
                this.paypalNonce = newValue;
                if(newValue) {
                    this.paypalNonceReceived = true;
                }
            },
            selectedMethod() {
                this.dirty = false;
            },
            showPayPalError(newValue) {
                this.$emit('update-paypal-error', newValue);
            },
            storedApiLoading() {
                this.showSubmitLoading = this.storedApiLoading;
            },
            storedApiSuccess() {
                this.apiSuccess = this.storedApiSuccess;

                // If pay method is successful
                if(this.apiSuccess && this.isRiverbendSubscription) {
                    this.clearSpinner = true;
                } else if(this.apiSuccess) {
                    if(!this.isGuestOrEnrollment) {
                        // Back to previous page - if it's NOT Guest Checkout or Online Enrollment
                        // unless the payment prompt modal should be shown
                        if(!this.isInline &&
                            this.isPaymethodPromptEnabled &&
                            (this.wasNotProductDefault && this.productPurchasesValue) &&
                            this.$refs['paymentPrompt'].shouldShowPaymentModal
                        ) {
                            this.$refs['paymentPrompt'].showPaymethodPrompt(this.defaultPayMethodForPaymentPrompt);
                        } else {
                            this.goToPreviousPage();
                        }
                    } else {
                        // Clear spinner if it's Guest Checkout or Online Enrollment
                        this.clearSpinner = true;
                    }
                }
            },
            storedPayInfo() {
                // Emit result to parent
                if(this.apiSuccess) {
                    this.$emit('payment-saved', this.storedPayInfo);
                }
            },
            isOneTimeUse() {
                // If is One Time Use, then prevent to be default pay method
                if(this.isOneTimeUse) {
                    this.productPurchasesValue = false;
                    this.marketplaceServicesValue = false;
                    this.riverbendPurchasesValue = false;
                } else {
                    // Set value for default checkboxes
                    this.setDefaults();
                }
                // Validate FE error message for Products checkbox
                this.validateDefaults();
            },
            paymentId() {
                if(this.isInline) {
                    // reset all child component validation
                    this.dirty = false;
                    Object.entries(this.$refs).forEach(([, component]) => {
                        component?.$v?.$reset?.();
                    });
                    this.setupStoredPayMethod();
                }
            },
            productPurchasesValue() {
                // Validate FE error message for Products checkbox
                this.validateDefaults();
            },
            riverbendPurchasesValue() {
                // Validate FE error message for Products checkbox
                this.validateDefaults();
            }
        },
        created() {
            this.onExpandPaymentMethod($event => this.handleSubmit($event, true));
        },
        async mounted() {
            this.setMarketplaceFlow();
            this.setEventBus();
            this.setCardCharLimits();

            this.resetListErrors();

            if(this.isRiverbendSubscription || this.isPayPal) {
                this.paymentMethodTypeValue = this.checkMethodType();
            }

            if(this.checkFirstTimeUser) {
                // check first time user to show direct-deposit-MX
                this.getIsFirstTimeUser();
            }

            // Get cross country information
            // Get all payment methods of the customer
            if(!this.isRiverbendSubscription && !this.isOwingBalance) {
                await this.setupStoredPayMethod();
            }

            this.setWhatInitialDefaultValueWasForPaymentPrompt();
            this.initialLoad = true;
            if(this.isPayPalAllowed) {
                await this.getPayPalClientToken({customerId: this.isOwingBalance && this.owingBalanceCustomerId});
            }
        },
        methods: {
            ...mapActions('payAddress', ['setDefaultCard']),
            ...mapActions('paymentMethod', ['getCountryInfo', 'getPayMethods', 'getPayMethod', 'getPayPalClientToken', 'savePayMethod', 'shiftStoredPayMethodBack', 'getIsFirstTimeUser']),
            ...mapMutations('paymentMethod', ['SET_API_ERROR']),

            focusFirstEl() {
                const focusable = getFocusable(this.$el);
                if(focusable && focusable.length) {
                    focusable[0].focus();
                }
            },
            handlePayPalData(data) {
                // Handle the received nonce and email
                const { nonce, email } = data;
                if(nonce && email) {
                    this.paypalNonceReceived = true;
                    this.paypalEmail = email;
                    this.paypalNonce = nonce;
                } else if(this.paypalEmailCheckout && this.paypalNonceCheckout) {
                    this.paypalNonceReceived = true;
                    this.paypalEmail = this.paypalEmailCheckout;
                    this.paypalNonce = this.paypalNonceCheckout;
                }
            },
            setCardCharLimits() {
                const charLimits = cardNumber.getCharLimitByCountry(this.$env.CountryCode);
                this.cardMaxLength = charLimits.max;
                this.cardMinLength = charLimits.min;
            },
            setDefaults() {
                if(this.isMarktplaceFlow) {
                    this.marketplaceServicesValue = true;
                } else if(this.isEditing && this.storedPayMethod) {
                    if(this.hideOneTimeUsePaymethod) {
                        this.productPurchasesValue = true;
                    } else {
                        this.productPurchasesValue = paymentMethodsUtil.isProductsDefault(this.storedPayMethod.PayMethodDefaults);
                        this.riverbendPurchasesValue = paymentMethodsUtil.isRiverbendDefault(this.storedPayMethod.PayMethodDefaults);
                    }
                    this.marketplaceServicesValue = paymentMethodsUtil.isServicesDefault(this.storedPayMethod.PayMethodDefaults);
                } else {
                    this.productPurchasesValue = this.shouldBeDefault;
                    this.marketplaceServicesValue = false;
                }
            },
            setMarketplaceFlow() {
                this.urlParams = new URLSearchParams(window.location.search);
                if(this.urlParams.get('marketplaceFlow')) {
                    this.isMarktplaceFlow = true;
                }
            },
            setCheckingValues(payMethod) {
                this.paymentMethodTypeValue = 'checking';
                this.$nextTick(() => {
                    this.$refs['paymentFormChecking']?.setValues(payMethod);
                });
            },
            setCreditValues(payMethod) {
                this.$refs['paymentFormCredit']?.setValues(payMethod);
            },
            setWhatInitialDefaultValueWasForPaymentPrompt() {
                if(this.isRiverbend) {
                    this.wasNotRiverbendDefault = !this.riverbendPurchasesValue;
                } else {
                    this.wasNotProductDefault = !this.productPurchasesValue;
                }
            },
            validateDefaults() {
                this.productPurchasesValid = true;

                // If should be default for Products, but checkbox is NOT selected
                if(!this.productPurchasesValue && this.shouldBeDefault && !this.isRiverbend) {
                    this.productPurchasesValid = false;
                }

                // If should be default for Riverbend, but checkbox is NOT selected
                if(!this.riverbendPurchasesValue && this.shouldBeDefaultRiverbend && this.isRiverbend) {
                    this.productPurchasesValid = false;
                }
            },
            validateMandate() {
                this.mandateAgreementValid = true;
                if(this.isSepaMandateRequired && !this.mandateAgreementValue) {
                    this.mandateAgreementValid = false;
                }
            },
            goToPreviousPage() {
                // Check if there's a target URL on query string
                if(this.urlParams.get('backTo')) {
                    window.location.href = this.urlParams.get('backTo');
                } else {
                    // Check if there's a My Account URL on localization data
                    if(this.localization?.Data?.MyAccountPaymentAddressPage?.Url) {
                        window.location.href = this.localization.Data.MyAccountPaymentAddressPage.Url;
                    }
                }
            },
            openModal(modalId) {
                this.shouldOverwriteAccount = false;
                this.$modal.show({ id: modalId });
            },
            closeModal(modalId) {
                this.$modal.hide({ id: modalId});
            },
            confirmDelete() {
                this.shouldOverwriteAccount = true;
                this.closeModal();
                this.submitForm();
            },
            handleCancel() {
                this.goToPreviousPage();
            },

            async handleSubmit(event, onlyValidate = false) {
                if(event) {
                    event?.preventDefault();
                }
                this.dirty = true;

                // On user clicking Continue, if PayPal nonce is not received, show error under PayPal checkout button
                if(this.isPayPal && !this.isEditing) {
                    if(this.paypalNonceReceived) {
                        this.showPayPalError = false;
                    } else {
                        this.showPayPalError = true;
                        return;
                    }
                }

                if(this.isRiverbendSubscription && this.isChecking && this.isEditing) {
                    // handle adding Riverbend as the default pay method to the
                    // default products checking paymethod
                    let response = await this.setDefaultCard({
                        paymentId: this.storedPayMethod?.PayMethodId,
                        hasProdServ: paymentMethodsUtil.isServicesDefault(this.storedPayMethod?.PayMethodDefaults),
                        otherDefaults: [ paymentMethodsUtil.defaultPaymentTypes.riverbend ],
                        source: 'riverbendSubscription'
                    });
                    if(response?.data?.Success) {
                        this.$emit('riverbend-payment-saved');
                    } else {
                        this.SET_API_ERROR({error: response.data.ErrorMessages});
                    }
                } else {
                    // Check if the form was already submitted and saved
                    if(this.apiSuccess && this.storedPayInfo?.payMethodId > 0 && !this.isRiverbendSubscription) {
                        this.$emit('payment-saved', this.storedPayInfo);
                        return;
                    }

                    let error = false;
                    let paymentTypes = [];

                    if((this.isCreditCard && this.isCreditCardAllowed) ||
                        (this.isChecking && this.isCheckingAllowed && !this.isEditing) ||
                        (this.isDirectDebit && this.isDirectDebitAllowed && (this.isFirstTimeUser || this.isEnrollment)) ||
                        (this.isPayPal && this.isPayPalAllowed)) {
                        this.resetListErrors();

                        // Emit to parent (needs to be after resetListErrors())
                        this.$emit('payment-submitted', true);

                        // Set payment type name for Debit/Credit form
                        if(this.isCreditCard) {
                            let paymentFormCredit = !this.isReadonlyExpiration ? ['expMonth', 'expYear'] : [];

                            if(!this.isEditing) {
                                paymentFormCredit.push('cardHolder');
                                paymentFormCredit.push('cardNumber');

                                if(this.useCvv) {
                                    paymentFormCredit.push('cvv');
                                }

                                if(this.useZipcode) {
                                    paymentFormCredit.push('zip');
                                }
                            }

                            if(this.isEditing && this.isJP) {
                                paymentFormCredit.push('cvv');
                            }

                            if(!this.isGuestOrEnrollment && !this.isRiverbendSubscription && !this.isInline) {
                                paymentFormCredit.push('nickname');
                            }

                            paymentTypes.push({ paymentFormCredit });
                            // Set payment type name for Checking form
                        } else if(this.isChecking) {
                            paymentTypes.push({
                                paymentFormChecking: ['accountHolder', 'accountType', 'routingNumber', 'accountNumber']
                            });
                        } else if(this.isDirectDebit) {
                            // Set direct debit on Add Payment Method( only on SEPA- Europe countries)
                            if(this.isSepaMandateRequired) {
                                this.validateMandate();
                                paymentTypes.push({
                                    paymentFormDirectDebitForm: ['cardHolder', 'routingNumber', 'accountNumber']
                                });
                            // Currently this applies to MX only. On My Account the variable for the name is cardHolderValue
                            // where on OLE checkout it is nameOnAccountValue
                            } else if(!this.isSepaMandateRequired && !this.isOleCheckout) {
                                paymentTypes.push({
                                    paymentFormDirectDebitForm: ['cardHolder', 'bank', 'accountNumber']
                                });
                            } else { // Set payment type name for DirectDebit form inside Online Enrollment
                                paymentTypes.push({
                                    paymentFormDirectDebit: ['nameOnAccount', 'bank', 'accountNumber']
                                });
                            }
                        }

                        // Loop to re-check if there is some validation error in the payment types
                        paymentTypes.forEach((type) => {
                            Object.entries(type).forEach(([ref, fields]) => {
                                const component = this.$refs[ref];
                                if(Array.isArray(fields) && component) {
                                    fields.forEach((fieldName) => {
                                        const validation = component.$v?.[fieldName + 'Value'];
                                        // Apply validation
                                        validation?.$touch();

                                        // Check if the field is invalid
                                        if(validation?.$invalid) {
                                            if('required' in validation) {
                                                error = true;
                                                this.handleValidationError(fieldName, validation);
                                            } else {
                                                validation.$reset();
                                            }
                                        }
                                    });
                                } else if(!component) {
                                    // if no ref component is found, it may be in a scoped slot
                                    // in which case, formIsValid will already be updated via slotProps event setFormValidation
                                    error = !this.isSlotFormValid;
                                }
                            });
                        });

                        // Validate Default Checkboxes
                        if(!this.isRiverbendSubscription) {
                            this.validateDefaults();
                            this.validateMandate();
                        }

                        // Define if the form is valid
                        this.formIsValid = !error && this.productPurchasesValid && this.mandateAgreementValid;

                        // Verify if the Membership Fee checkbox is selected
                        if(this.formIsValid && this.membershipFeeAgreementRequired) {
                            this.formIsValid = this.membershipFeeAgreement;
                        }

                        // Submit form
                        if(!onlyValidate) {
                            this.submitForm();
                        }
                    }
                }
            },
            async submitForm() {
                this.$refs?.paymentFormCredit?.touch();

                // Submit form only if it's valid
                if(this.formIsValid) {
                    // Opens modal if it's checking and is US and customer has another checking account and the customer didn't confirmed the deletion yet
                    if(this.isChecking && this.isCheckingAllowed && this.hasCheckingAccount && !this.shouldOverwriteAccount) {
                        this.openModal('modal-checking');
                    } else {
                        this.showSubmitLoading = true;
                        let payload = {};
                        payload.payMethodDefaults = [];
                        payload.applicationLocation = this.isOleCheckout ? 'Checkout' : this.applicationLocation;

                        // New condition for OLE users
                        if(this.isCustomerManagementAgreementForm) {
                            // For OLE users, always add Products and BackupOrder
                            payload.payMethodDefaults.push(paymentMethodsUtil.defaultPaymentTypes.products, paymentMethodsUtil.defaultPaymentTypes.backupOrder);
                        }
                        // If NOT Guest Checkout OR Online Enrollment
                        if(!this.isGuestOrEnrollment && !this.localization?.Data?.HideDefaultPayMethodCheckBoxes) {
                            if(this.productPurchasesValue) {
                                payload.payMethodDefaults.push(paymentMethodsUtil.defaultPaymentTypes.products);
                            }

                            if(this.marketplaceServicesValue && (this.isDefaultServicesAllowed || this.isRiverbend)) {
                                payload.payMethodDefaults.push(paymentMethodsUtil.defaultPaymentTypes.services);
                            }

                            if(this.riverbendPurchasesValue) {
                                payload.payMethodDefaults.push(paymentMethodsUtil.defaultPaymentTypes.riverbend);
                            }
                        }

                        // Populate fields for debit/credit form
                        if(this.isCreditCard && this.isCreditCardAllowed) {
                            // Prepare payload for Credit Card
                            payload = this.prepareCreditCard(payload);

                        // Populate fields for checking form
                        } else if(this.isChecking && this.isCheckingAllowed) {
                            // Only for ADD (post)
                            if(!this.isEditing) {
                                // Prepare payload for Checking
                                payload = this.prepareChecking(payload);
                            }
                        } else if(this.isDirectDebit && this.isDirectDebitAllowed) {
                            if(this.hasDirectDebitPayMethod && !this.isSepaDirectDebit && !this.shouldOverwriteAccount) {
                                this.showSubmitLoading = false;
                                this.openModal('modal-direct-debit');
                                return;
                            } else if(!this.isEditing) {
                                payload = this.prepareDirectDebit(payload);
                            }
                        } else if(this.isPayPal && this.isPayPalAllowed) {
                            // Prepare payload for PayPal
                            payload = this.preparePayPal(payload);
                        }

                        // Save payment method using Services API
                        const { response, success } = await this.savePayMethod({
                            isEditing: this.isEditing,
                            isCreditCard: this.isCreditCard,
                            isPayPal: this.isPayPal,
                            customerId: this.isOwingBalance ? this.owingBalanceCustomerId : this.customerId,
                            bearerToken: this.bearerToken,
                            country: this.userCountry,
                            payload: payload,
                            envService: this.$env?.ServiceBaseUrl,
                            errorTranslations: this.localization?.Labels?.ServerErrorTranslation || null,
                            fromCheckout: this.isCheckout,
                            isCustomerIdNeededInPayload: this.isOwingBalance
                        });

                        if(success) {
                            if(!this.isInline && this.isPaymethodPromptEnabled) {
                                // store this value for the modal that will show
                                // asking if the user wants to add riverbend to
                                // this paymethod default
                                this.defaultPayMethodForPaymentPrompt.PayMethodDefaults = payload.payMethodDefaults;
                                if(this.isEditing) {
                                    this.defaultPayMethodForPaymentPrompt.PayMethodId = this.paymentId;
                                } else {
                                    this.defaultPayMethodForPaymentPrompt.PayMethodId = response.payMethodId;
                                }
                            }
                            if(this.isRiverbendSubscription) {
                                this.$emit('riverbend-payment-saved', {
                                    ...payload,
                                    ...response
                                });
                                this.riverbendIsEditingManuallyEnteredCard = false;
                                await apiClearCache.delete();
                            } else {
                                this.$emit('saved', response.payMethodId);
                            }
                        }
                    }
                }
            },
            prepareCreditCard(payload) {
                const expDayValue = new Date(this.expYearValue, this.expMonthValue, 0).getDate();

                let payMethodUpdating;
                if(this.isRiverbendSubscription && !this.storedPayMethod.PayMethodId) {
                    let last4 = this.cardNumberValue.slice(-4);
                    payMethodUpdating = this.storedPayMethods.filter(payMethod => payMethod.LastFourDigitsOfAccount === last4)
                        .reduce((acc, payMethod) => {
                            acc = payMethod;
                            return acc;
                        }, {});
                    if(payMethodUpdating.PayMethodId) {
                        this.riverbendIsEditingManuallyEnteredCard = true;
                    } else {
                        this.riverbendIsEditingManuallyEnteredCard = false;
                    }
                }

                // this is for editing a pay method and simplifying which PayMethodId to use
                let getPayMethodId = () => {
                    if(this?.riverbendIsEditingManuallyEnteredCard) {
                        return payMethodUpdating.PayMethodId;
                    } else if(this.isRiverbendSubscription) {
                        return this.storedPayMethod?.PayMethodId;
                    } else {
                        return this.paymentId;
                    }
                };
                // Only for ADD (post)
                if(!this.isEditing) {
                    // trim spaces from card number
                    payload.creditCardNumber = this.cardNumberValue.replace(/\s/g, '');
                    payload.userName = this.userName;
                    payload.hostName = window.location.hostname;
                    payload.payType = this.cardNumberType;
                    payload.nameOnAccount = this.isMX && this.cardHolderLastValue ? this.cardHolderValue + ' ' + this.cardHolderLastValue : this.cardHolderValue;
                    payload.cvvCode = this.cvvValue;
                    payload.postalCode = this.useZipcode ? this.zipValue : '';
                    payload.accountNickName = this.nicknameValue || '';
                    payload.oneTimeUse = this.isOneTimeUse && this.isCheckout;

                    // One Time Use cannot be default
                    if(payload.oneTimeUse) {
                        payload.payMethodDefaults = [];
                    }
                // Only for EDIT (put)
                } else {
                    payload.payMethodID = getPayMethodId();
                    payload.username = this.userName;
                    payload.hostname = window.location.hostname;
                    payload.clearPayMethodDefaults = true;
                    payload.nameOnAccount = this.isRiverbendSubscription ? this.storedPayMethod?.NameOnAccount : this.cardHolderValue;
                    payload.accountNickName = this.isRiverbendSubscription ? this.storedPayMethod?.AccountNickName : (this.nicknameValue || '<clearfield>');
                    payload.oneTimeUse = false;
                }

                if(this.isKR || this.isJP) {
                    const cardHolderNames =
                        this.getLocalizationProp('Data.CardHoldersNames', '')
                            .split(',')
                            .map((name) => name.trim())
                            .filter((name) => name);
                    const isSpouse = this.cardHolderValue === cardHolderNames[1];

                    payload.birthDate = !isSpouse ? this.getLocalizationProp('Data.CustomerBirthDate') : this.getLocalizationProp('Data.SpouseBirthDate');
                    // For Japan paytype should be specific credit card, like 'VisaCard' or 'MasterCard'
                    if(this.isKR) {
                        payload.nameOnAccount = !isSpouse ? this.getLocalizationProp('Data.CustomerFirstName') : cardHolderNames[1];
                        payload.payType = 'CreditCard';
                    } else {
                        payload.nameOnAccount = !isSpouse ? cardHolderNames[0] : cardHolderNames[1];
                        payload.payType = this.creditCardType;
                    }
                }

                payload.expirationDate = this.expYearValue + '-' + this.expMonthValue + '-' + expDayValue;
                payload.countryType = this.userCountry;
                payload.isActive = true;
                payload.applicationId = this.prePaidCreditCardApplicationId;
                payload.payMethodDirection = 'Inbound'; // Inbound or Outbound

                if(this.isEditing && this.isRiverbendSubscription && !this.isOleCheckout) {
                    // isOleCheckout returns true for Riverbend checkout and false for Riverbend subscription
                    if(this?.riverbendIsEditingManuallyEnteredCard && payMethodUpdating?.PayMethodDefaults) {
                        payload.payMethodDefaults = [...payMethodUpdating.PayMethodDefaults, paymentMethodsUtil.defaultPaymentTypes.riverbend];
                    } else {
                        if(!this.storedPayMethod?.PayMethodDefaults.includes('Riverbend')) {
                            payload.payMethodDefaults = this.storedPayMethod?.PayMethodDefaults ? [...this.storedPayMethod.PayMethodDefaults, paymentMethodsUtil.defaultPaymentTypes.riverbend] : [paymentMethodsUtil.defaultPaymentTypes.riverbend];
                        } else {
                            payload.payMethodDefaults = this.storedPayMethod?.PayMethodDefaults || [];
                        }
                    }
                } else if(this.isRiverbendSubscription && !this.isOleCheckout) {
                    // isOleCheckout returns true for Riverbend checkout and false for Riverbend subscription
                    payload.payMethodDefaults = [paymentMethodsUtil.defaultPaymentTypes.riverbend];
                } else if(!this.isOleCheckout && this.storedPayMethod?.PayMethodDefaults?.includes('Riverbend') && !payload.payMethodDefaults.includes('Riverbend')) {
                    // if this isn't here then payment methods that are used for Riverbend are being lost when edited in my account pay method edit
                    payload.payMethodDefaults = [...payload.payMethodDefaults, 'Riverbend'];
                }

                return payload;
            },
            prepareChecking(payload) {
                payload.country = this.userCountry;
                payload.oneTimeUse = false;
                payload.isActive = true;
                payload.payType = this.accountTypeValue;
                payload.nameOnAccount = this.accountHolderValue;
                payload.accountNickName = this.accountHolderValue;
                payload.accountNumber = this.accountNumberValue;
                payload.routingNumber = this.routingNumberValue;
                payload.payMethodDirection = 'Inbound'; // Inbound or Outbound

                if(this.isRiverbendSubscription) {
                    const payMethodUpdating = this.storedPayMethods.filter(payMethod => payMethod.PayMethodType === 'ACHChecking')
                        .reduce((acc, payMethod) => {
                            acc = payMethod;
                            return acc;
                        }, {});
                    if(payMethodUpdating?.PayMethodId && payMethodUpdating?.PayMethodDefaults && !this.isOleCheckout) {
                        // isOleCheckout returns true for Riverbend checkout and false for Riverbend subscription
                        payload.payMethodDefaults = [...payMethodUpdating.PayMethodDefaults, paymentMethodsUtil.defaultPaymentTypes.riverbend];
                    } else if(!this.isOleCheckout) {
                        if(!this.storedPayMethod?.PayMethodDefaults?.includes('Riverbend')) {
                            payload.payMethodDefaults = this.storedPayMethod?.PayMethodDefaults ? [...this.storedPayMethod.PayMethodDefaults, paymentMethodsUtil.defaultPaymentTypes.riverbend] : [paymentMethodsUtil.defaultPaymentTypes.riverbend];
                        } else {
                            payload.payMethodDefaults = this.storedPayMethod?.PayMethodDefaults || [];
                        }
                    } else {
                        payload.payMethodDefaults = [];
                    }
                }

                return payload;
            },
            prepareDirectDebit(payload) {
                const bank = this.storedBanks.find((bank) => bank.Id === this.bankValue);

                payload.country = this.userCountry;
                payload.oneTimeUse = false;
                payload.isActive = true;
                payload.payType = 'DirectDebit';
                payload.nameOnAccount = this.isSepaDirectDebit || !this.isOleCheckout ? this.cardHolderValue : this.nameOnAccountValue;
                payload.accountNumber = this.accountNumberValue;
                payload.payMethodDirection = 'Inbound';
                payload.bankName = bank?.Name || null;
                payload.routingNumber = this.isSepaDirectDebit ? this.routingNumberValue : bank?.RoutingNumber || null;
                return payload;
            },
            preparePayPal(payload) {
                // Adding a new PayPal payment method
                payload.token = this.paypalNonce;
                payload.email = this.paypalEmail;
                payload.country = this.userCountry;
                payload.payType = 'PayPal';
                payload.payMethodDirection = 'Inbound';
                payload.isActive = true;
                payload.oneTimeUse = this.isOneTimeUse && this.isCheckout;
                payload.isActive = true;
                payload.payType = 'PayPal';
                payload.country = this.userCountry;

                // In case of editing, the name on account should be the same as the stored pay method
                payload.nameOnAccount = this.paypalEmail || this.storedPayMethod?.NameOnAccount;

                if(this.isEditing) {
                    payload.payMethodId = this.storedPayMethod?.PayMethodId;
                }
                // One Time Use cannot be default
                if(payload.oneTimeUse) {
                    payload.payMethodDefaults = [];
                }

                return payload;
            },
            setEventBus() {
                eventBus.$on('update-payment-form', (payload) => {
                    if(payload) {
                        this[payload.model] = payload.value;
                        if(payload.model === 'cardNumberType') {
                            this.creditCardType = payload.value;
                        }
                    }
                });
            },
            setProductPurchaseCheckbox(val) {
                this.productPurchasesValue = val;
            },
            setFormValidation(inValid) {
                this.isSlotFormValid = inValid === false;
            },
            async setupStoredPayMethod() {
                this.resetListErrors();

                // Get cross country information
                // Get all payment methods of the customer
                if(!this.initialLoad) {
                    // conditions need to be checked here before Promise.all to prevent timing issues with async store methods
                    const loadPayMethods = !this.isCustomerManagementAgreementForm && !this.storedPayMethods?.length && !this.storedApiLoading;
                    const loadCountryInfo = !this.storedCountryInfoLoaded;
                    await Promise.all([
                        loadCountryInfo ? this.getCountryInfo({ country: this.$env.Country }) : null,
                        loadPayMethods ? this.getPayMethods({ checkout: this.isOleCheckout, customerId: this.customerId }) : null
                    ]);
                }

                // Get payment method data according to payment ID (it will activate the edit mode)
                if((!this.isCustomerManagementAgreementForm && (this.isInline || !this.initialLoad))) {
                    await this.getPayMethod({
                        paymentId: this.paymentId,
                        customerId: this.customerId
                    });
                }

                // Set value for default checkboxes
                this.$nextTick(() => {
                    this.setDefaults();
                });
            }
        }
    };
</script>

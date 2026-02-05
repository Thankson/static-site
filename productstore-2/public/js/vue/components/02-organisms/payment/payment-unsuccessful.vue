<template>
    <div class="o-paymentUnsuccessful">
        <div class="o-paymentUnsuccessful__payments">
            <h2 class="o-paymentUnsuccessful__header">{{ getLocalizationProp("Data.PaymentUnsuccessfulTitle", "Payment Unsuccessful") }}</h2>
            <p
                class="o-paymentUnsuccessful__text"
                v-html="getLocalizationProp('Data.PaymentSectionTitle', 'Please select your pay method and proceed to be transferred to process payment.')">
            </p>
            <m-pay-method
                ref="pay-method"
                card-image-mods="o-paymentUnsuccessful__cardImg"
                :expires-label="getLocalizationProp('Labels.Expires', 'Expires')"
                :manage-payment-text="getLocalizationProp('Data.ManagePayMethodsLink.Text', 'MANAGE PAYMENT METHODS')"
                :manage-payment-link="getLocalizationProp('Data.ManagePayMethodsLink.Url')"
                :number-of-payments-shown="4"
                radio-mods="pt-10 md:pt-7"
                :show-hr="false"
                :show-all-aria-label="getLocalizationProp('Labels.ShowAllAriaLabel', 'Show All payment options')"
                :show-all-text="getLocalizationProp('Labels.ShowAll', 'Show All')"
                :use-checkout-api="false"
                :add-payment-link="getAddPaylink"
                :add-payment-text="getLocalizationProp('Data.NewPaymentMethod.Text', '+ Add new Payment Method')"
                add-payment-mods="-white rounded-md py-12 px-15 md:px-50 text-base font-medium tracking-wide mt-6 text-center block md:ml-40 md:inline-flex"
                manage-payment-mods="-link text-center o-paymentUnsuccessful__managePayment"
                @update="updatePayment">
            </m-pay-method>
        </div>

        <div class="o-paymentUnsuccessful__payments pl-44 pt-15 md:px-30 md:pt-30 border-t-1 border-gray-50">
            <div class="md:flex md:items-baseline">
                <span class="text-base pb-12 block md:pr-16">{{ getLocalizationProp('Labels.Cvv.Title') }}</span>
                <div class="p-checkout__form">
                    <label class="text-sm font-medium pb-3 md:sr-only" for="cvvCode">{{ getLocalizationProp('Labels.Cvv.Label') }}</label>
                    <input-basic
                        id="cvvCode"
                        ref="cvvCode"
                        v-model="cvvCode"
                        name="cvvCode"
                        :class="{'-isInvalid': hasCvvError}"
                        :min-length="getLocalizationProp('Data.Cvv.MinLength')"
                        :max-length="getLocalizationProp('Data.Cvv.MaxLength')"
                        tailwind-mods="bg-clear o-paymentUnsuccessful__input px-7"
                        :placeholder="getLocalizationProp('Labels.Cvv.Placeholder')"
                        model-name="cvvCode"
                        aria-required="true">
                    </input-basic>
                    <div class="pt-10 md:pt-15">
                        <button class="o-paymentUnsuccessful__modalButton" @click="openCvvModal"> {{ getLocalizationProp('Labels.Cvv.CvvModal.WhatIsThisTitle') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <hr v-show="needFurtherPaymentValidation">
        <div class="px-15 md:px-30" :class="{'pt-15 md:pt-30 md:flex md:justify-between md:space-x-10' : needFurtherPaymentValidation}">
            <m-pay-method-info
                v-show="needFurtherPaymentValidation"
                ref="payMethodInfoRef"
                :script-id="scriptId"
                @validated="isPayMethodInfoValid = $event"
                @notSatisfiedWithAtLeastOneInfo="notSatisfiedWithAtLeastOneInfo = $event"
                @updateErrorInfo="payMethodErrorInfo = $event"
            />

            <div class="o-paymentUnsuccessful__continueButton" :class="{'mt-30 md:mt-64' : needFurtherPaymentValidation}">
                <v-button
                    :cta="getLocalizationProp('Labels.Proceed', 'Proceed')"
                    :is-anchor="false"
                    :disabled="isApiLoading"
                    class="rounded-md py-12 px-15 font-medium tracking-wide mt-6 w-full block text-base hover:font-medium"
                    type="button"
                    @click="submitPayment"
                />

                <div aria-live="polite">
                    <div
                        v-show="shouldDisplayPaymentError"
                        class="text-red-100 text-xs md:text-sm flex pt-20 mt-2 pl-1 leading-tight">

                        <a-icon class="pr-4" color="red" size="inherit">error_outline</a-icon>
                        <span v-html="getLocalizationProp('Labels.ErrorMessage', errorMessage)">
                        </span>
                    </div>
                    <div
                        v-show="hasCvvError"
                        class="text-red-100 text-xs md:text-sm flex pt-20 mt-2 pl-1 leading-tight">
                        <a-icon class="pr-4" color="red" size="inherit">error_outline</a-icon>
                        <span v-html="cvvErrorMessage">
                        </span>
                    </div>
                    <template v-if="needFurtherPaymentValidation">
                        <FormFieldErrorMessage
                            modifier-classes="-icon-font-normal mt-10"
                            :is-visible="payMethodErrorInfo.isPhoneNumberError"
                            :msg="payMethodErrorInfo.phoneNumberErrorMsg"
                        />
                        <FormFieldErrorMessage
                            modifier-classes="-icon-font-normal mt-10"
                            :is-visible="payMethodErrorInfo.isEmailError"
                            :msg="payMethodErrorInfo.emailErrorMsg"
                        />
                        <FormFieldErrorMessage
                            modifier-classes="-icon-font-normal mt-10"
                            :is-visible="notSatisfiedWithAtLeastOneInfo"
                            :msg="getLocalizationProp('Labels.CardholderInfo.ErrorMessages.MobileOrEmailRequired')"
                        />
                    </template>
                </div>
            </div>
        </div>
        <!-- CVV Modal -->
        <modal id="modal-cvv" width="400px">
            <template v-slot:content>
                <div class="m-termsModal__body" v-html="getLocalizationProp('Labels.Cvv.CvvModal.CvvModalContent')"></div>

                <button
                    v-modal-hide
                    type="button"
                    class="a-button p-checkout__cvvModalBtn">
                    {{ getLocalizationProp('Labels.Checkout.Close', 'Close') }}
                </button>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import apiSubmitPayment from '@api/routes/account/submitpayment';
    import { validationMixin } from 'vuelidate';
    import { required, minLength, maxLength } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'OPaymentUnsuccessful',
        components: {
            FormFieldErrorMessage
        },
        mixins: [ validationMixin, localizationMixin ],
        validations() {
            return {
                // Phone Validation Settings
                cvvCode: {
                    required,
                    digitsOnly: value => {
                        const regexDigits = new RegExp(`^\\d{0,9}$`);
                        return Boolean(regexDigits.exec(value));
                    },
                    minLength: minLength(this.localization?.Data?.Cvv?.MinLength || 0),
                    maxLength: maxLength(this.localization.Data?.Cvv?.MaxLength || 0)
                }
            };
        },
        data() {
            return {
                card: null,
                cvvCode: '',
                cvvErrorMessage: '',
                errorMessage: 'Your payment method was declined. Please <span class="font-bold underline">enter another payment method.</span>',
                hasCvvError: false,
                isApiLoading: false,
                isPayMethodInfoValid: false,
                notSatisfiedWithAtLeastOneInfo: false,
                payMethodErrorInfo: {},
                selectedPayment: null,
                selectedPayMethod: null,
                shouldDisplayPaymentError: false
            };
        },
        computed: {
            getAddPaylink() {
                const newPaymentLink = this.getLocalizationProp('Data.NewPaymentMethod.Url');
                return newPaymentLink.includes('backTo') ? newPaymentLink : `${newPaymentLink}?backTo=${window.location.pathname}&fromCheckout=true`;
            },
            needFurtherPaymentValidation() {
                return this.selectedPayMethod?.NeedFurtherPaymentValidation;
            }
        },
        methods: {
            async handleProcessOwingBalance() {
                this.isApiLoading = true;

                const payMethodInfoData = this.$refs.payMethodInfoRef?.getInfo() || {};
                const processOwingBalanceParams = {
                    OrderIds: [this.getLocalizationProp('Data.OrderId')],
                    PayMethodId: this.selectedPayMethod?.PayMethodId,
                    CollectionsProcessorType: this.selectedPayMethod?.CollectionsProcessorType,
                    CvvCode: this.cvvCode,
                    ThreeDSCustomerEmail: payMethodInfoData?.email,
                    ThreeDSCustomerMobileNumber: payMethodInfoData?.phoneNumber
                };
                const processOwingBalanceResponse = await apiSubmitPayment.post(processOwingBalanceParams);
                // Either `processOwingBalanceResponse.success` or `processOwingBalanceResponse.data?.Success` is false, will jump to the payment failure page.
                let redirectUrl = this.getLocalizationProp('Data.PaymentFailurePage.Url');
                if(processOwingBalanceResponse.success && processOwingBalanceResponse.data?.Success) {
                    if(processOwingBalanceResponse.data?.Data?.IsPaymentSuccessfulAlready) {
                        // IsPaymentSuccessfulAlready then redirect to receipt page
                        redirectUrl = this.getLocalizationProp('Data.ReceiptPage');
                    } else if(processOwingBalanceResponse.data?.Data?.AdditionalVerificationRequired) {
                        redirectUrl = processOwingBalanceResponse.data?.Data?.StepUpUrl;
                    }
                }

                this.isApiLoading = false;
                return redirectUrl;
            },
            openCvvModal() {
                this.$modal.show({ id: 'modal-cvv' });
            },
            setCvvErrorMessage() {
                let message;
                if(!this.$v.cvvCode.minLength) {
                    message = this.localization?.Labels?.Cvv?.ErrorMessages?.MinLength;
                } else if(!this.$v.cvvCode.maxLength) {
                    message = this.localization?.Labels?.Cvv?.ErrorMessages?.MaxLength;
                } else if(!this.$v.cvvCode.required) {
                    message = this.localization?.Labels?.Cvv?.ErrorMessages?.Required;
                } else if(!this.$v.cvvCode.digitsOnly) {
                    message = this.localization?.Labels?.Cvv?.ErrorMessages?.Numeric;
                }
                this.cvvErrorMessage = message;
            },
            updatePayment({ card, installment, isPortal, payMethodId, payMethodType, showFpx, fpxBankId, selectedPayMethod }) {
                this.card = card;
                this.payMethodType = payMethodType;
                this.selectedPayment = payMethodId;
                this.selectedPayMethod = selectedPayMethod;
            },
            async submitPayment() {
                // validate cvv
                this.$v.$touch();
                if(this.$v.$invalid) {
                    this.hasCvvError = true;
                    this.setCvvErrorMessage();
                    return;
                }
                this.hasCvvError = false;

                // validate pay method info if needed
                if(this.needFurtherPaymentValidation) {
                    this.$refs.payMethodInfoRef.validate();
                    if(!this.isPayMethodInfoValid) {
                        return;
                    }

                    const processOwingBalanceRedirectUrl = await this.handleProcessOwingBalance();
                    window.location.href = processOwingBalanceRedirectUrl;

                    return;
                }

                this.isApiLoading = true;
                const response = await apiSubmitPayment.post({
                    'cardId': this.card,
                    'payMethodId': this.selectedPayment,
                    'payMethodType': this.payMethodType,
                    'orderIds': [this.localization?.Data?.OrderId]
                });
                this.isApiLoading = false;

                if(response.success) {
                    window.location = this.getLocalizationProp('Data.ReceiptPage');
                } else {
                    this.shouldDisplayPaymentError = true;
                }
            }
        }
    };
</script>

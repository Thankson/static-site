<template>
    <div class="p-balance">
        <div class="p-balance__title">
            <h1
                v-if="!isReenrollment"
                class="p-balance__heading"
                v-html="getLocalizationProp('Data.Title', 'Taking care of an unpaid balance…')"
            />

            <p
                class="p-balance__text"
                v-html="getLocalizationProp('Data.Description', subtitle)"
            />
        </div>

        <div class="p-balance__content">
            <owing-balance-table
                :balance-owed="getLocalizationProp('Labels.TotalBalanceOwed', 'Total Balance Owed:')"
                :column-one-title="getLocalizationProp('Labels.OrderDate', 'Order Date:')"
                :column-three-title="getLocalizationProp('Labels.BalanceDue', 'Balance Due:')"
                :column-two-title="getLocalizationProp('Labels.Order', 'Order #: ')"
                :enable-multiple-orders="enableMultipleOrders"
                :localization="localization"
                :pay-method="payMethodType"
                :total-balance="totalBalance"
                :unpaid-items="unpaidItems"
                :enable-cancel-order="getLocalizationProp('Data.EnableCancelOrder')"
                :limit-one-order="getLocalizationProp('Data.LimitOneOrder', false)"
                @update="onUpdateSelections"
            />

            <h2
                v-if="isReenrollment"
                class="mb-12 text-gray-120"
            >
                {{ getLocalizationProp('Labels.PaymentMethod') }}
            </h2>

            <OCheckoutPaymentMethodsConfigurable
                v-if="isReenrollment && isLoaded"
                ref="paymentMethods"
                class="lg:w-2_3"
                :owing-balance-customer-id="customerId"
                :is-owing-balance="true"
                :has-cvv-error="false"
                :has-pay-method="false"
                :index="2"
                :invalid-cvv="false"
                :is-cn="false"
                :is-guest-shopping="false"
                :is-kr="false"
                :modal-labels-delete-pay-method="modalLabelsDeletePayMethod"
                :script-id="scriptId"
                @initialPayment="updateInfoInitial"
                @payment-form-visible="hideSubmitButton"
                @payment-saved="onPaymentSaved"
                @update="updateInfo"
            />

            <m-pay-method
                v-else-if="isLoaded"
                ref="pay-method"
                :add-payment-link="getAddPaylink"
                :add-payment-text="getLocalizationProp('Labels.NewPaymentMethod', '+ Add new Payment Method')"
                :bank-offline-label="getLocalizationProp('Labels.BankOffline', '{0} (Offline)')"
                :edit-aria-label="getLocalizationProp('Labels.EditAriaLabel', 'Edit')"
                :edit-label="getLocalizationProp('Labels.Edit', 'Edit')"
                :edit-link="getLocalizationProp('Data.EditLink')"
                :expires-label="getLocalizationProp('Labels.Expires', 'Expires')"
                :manage-payment-text="getLocalizationProp('Labels.ManagePaymentMethods', 'MANAGE PAYMENT METHODS')"
                :manage-payment-link="getLocalizationProp('Data.ManagePaymentLink')"
                :gtm="{showAllId: '208'}"
                :heading="getLocalizationProp('Labels.PaymentMethod', 'PAYMENT METHOD:')"
                :show-all-aria-label="getLocalizationProp('Labels.ShowAllAriaLabel', 'Show All payment options')"
                :show-all-text="getLocalizationProp('Labels.ShowAll', 'Show All')"
                :use-checkout-api="false"
                :installment-data="installmentData"
                :virtual-payment-labels="getLocalizationProp('Labels.VirtualPayment', {})"
                add-payment-mods="-white rounded-md py-12 px-15 md:px-50 text-base font-medium tracking-wide mt-6 text-center block md:ml-40 md:inline-flex"
                manage-payment-mods="-link text-base font-medium tracking-wide text-center border-none block mt-6 py-12 px-15 md:inline-flex md:px-50"
                :total-balance-selected="totalBalanceSelected"
                @update="updatePayment"
            />

            <a-loading-spinner :visible="!isLoaded" />

            <hr v-if="isLoaded && isReenrollment && showSubmitButton" class="my-40" />

            <div class="p-balance__bottom" :class="{'-withCvvCode': showCvv, '-withPayMethodInfo': needFurtherPaymentValidation}">
                <div v-if="showCvv" class="p-balance__cvvCode">
                    <div class="p-balance__cvvCode -container">
                        <div class="p-balance__cvvCode -input">
                            <span class="p-checkout__title -cvv">{{ getLocalizationProp('Labels.Cvv.Title') }}</span>
                            <div class="p-checkout__form">
                                <label class="p-checkout__label" for="cvvCode">{{ getLocalizationProp('Labels.Cvv.Label') }}</label>
                                <input-basic
                                    id="cvvCode"
                                    ref="cvvCode"
                                    v-model="cvvCode"
                                    name="cvvCode"
                                    :min-length="getLocalizationProp('Data.Cvv.MinLength')"
                                    :max-length="getLocalizationProp('Data.Cvv.MaxLength')"
                                    :class="{'-isInvalid': hasCvvError && invalidCvv}"
                                    tailwind-mods="bg-clear p-checkout__input"
                                    model-name="cvvCode"
                                    aria-required="true"
                                    @keydown="handleInteger">
                                </input-basic>
                            </div>
                        </div>
                        <div class="showCvvWhatIs">
                            <button class="p-checkout__cvvWhatIs" @click="openCvvModal"> {{ getLocalizationProp('Labels.Cvv.CvvModal.WhatIsThisTitle') }}</button>
                        </div>
                    </div>
                    <em v-if="hasCvvError && invalidCvv" class="p-checkout__error" role="alert">
                        {{ getLocalizationProp('Labels.Cvv.ErrorMessages.Empty') }}
                    </em>
                </div>

                <hr v-show="needFurtherPaymentValidation" class="p-balance__payMethodInfoLine my-20" />
                <div v-show="needFurtherPaymentValidation" class="p-balance__payMethodInfo">
                    <m-pay-method-info
                        ref="payMethodInfoRef"
                        :script-id="scriptId"
                        @validated="isPayMethodInfoValid = $event"
                        @notSatisfiedWithAtLeastOneInfo="notSatisfiedWithAtLeastOneInfo = $event"
                        @updateErrorInfo="payMethodErrorInfo = $event"
                    />
                </div>

                <div class="p-balance__checkout">
                    <v-button
                        v-if="showSubmitButton"
                        :cta="getLocalizationProp('Labels.SubmitPayment', 'Submit Payment')"
                        :is-anchor="false"
                        :disabled="isApiLoading || selectedPaymentIsExpired"
                        class="rounded-md py-12 px-15 font-normal tracking-wide mt-6 w-full block text-base md:text-xl hover:font-normal"
                        type="button"
                        @click="submitPayment"
                    />
                    <a-loading-spinner :visible="isApiLoading" />

                    <div aria-live="polite">
                        <!-- Payment declined error message -->
                        <transition
                            :duration="650"
                            name="p-balance__animation"
                        >
                            <div
                                v-show="shouldDisplayPaymentError"
                                class="text-red-100 text-xs md:text-sm flex pt-20 mt-2 pl-1 leading-tight"
                            >
                                <a-icon class="pr-4" color="red" size="inherit">error_outline</a-icon>
                                <span v-html="getLocalizationProp('Labels.ErrorMessage', errorMessage)" />
                            </div>
                        </transition>
                        <!-- Partial Payment Error message for Re-enrollment flow -->
                        <transition
                            :duration="650"
                            name="p-balance__animation"
                        >
                            <div
                                v-show="shouldDisplayPartialPaymentErrorMessage"
                                class="text-red-100 text-xs md:text-sm flex pt-20 mt-2 pl-1 leading-tight"
                            >
                                <a-icon class="pr-4" color="red" size="inherit">error_outline</a-icon>
                                <span v-html="getLocalizationProp('Labels.PartialPaymentErrorMessage')" />
                            </div>
                        </transition>
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
            <!-- fpx terms-->
            <div v-if="showFpx">
                <p class="text-xs text-gray-150 italic pt-12 px-24 text-center md:text-right md:pt-16 md:px-20" v-html="getLocalizationProp('Labels.FpxTerms')"></p>
            </div>
        </div>

        <!-- 3D Payment Portal Iframe -->
        <o-easypay-portal
            ref="portal"
            :is-visible="showPortal"
            :pay-info="portalData"
            :card-id="card"
            :install-id="installment"
            :url="getLocalizationProp('Data.EasyPay.Url')"
        />

        <!-- FPX -->
        <FpxPayment
            ref="fpx"
            :is-visible="showFpx"
            :pay-info="fpxData"
        />

        <!-- OptIframe Payment Portal Iframe -->
        <OtpPayment
            ref="otp"
            :is-visible="showOtp"
            :pay-info="otpData"
            :token-info="otpTokenInfo"
            v-on:sessionIdAvailable="onSessionIdAvailable"
        />

        <modal id="owing-balance-partial-error" width="640px">
            <template #content>
                <div v-html="getLocalizationProp('Data.ErrorModal.RTE')"></div>
                <a
                    :href="getLocalizationProp('Data.ErrorModal.Button.Url')"
                    :rel="getLocalizationProp('Data.ErrorModal.Button.Target') ? 'noreferrer noopener' : ''"
                    :target="getLocalizationProp('Data.ErrorModal.Button.Target') ? getLocalizationProp('Data.ErrorModal.Button.Target') : ''"
                    class="a-button py-15 px-25 text-base"
                    @click="gtmTrackAction({id: 407}, $event)">

                    {{ getLocalizationProp('Data.ErrorModal.Button.Text', 'Add payment method') }}
                </a>
            </template>
        </modal>

        <modal id="select-one-bill-error" width="450px">
            <template #content>
                <p class="py-10" v-html="getLocalizationProp('Labels.VirtualCreditCard.ModalData')"></p>
                <button class="a-button py-15 px-25 text-base" @click="closeModal">{{ getLocalizationProp('Labels.Close', 'Close') }}</button>
            </template>
        </modal>
        <!-- CVV Modal -->
        <modal id="modal-cvv" width="400px">
            <template v-slot:content>
                <div class="m-termsModal__body" v-html="getLocalizationProp('Labels.Cvv.CvvModal.CvvModalContent')"></div>

                <button
                    v-modal-hide
                    type="button"
                    class="a-button p-checkout__cvvModalBtn">
                    {{ getLocalizationProp('Labels.Close', 'Close') }}
                </button>
            </template>
        </modal>
        <!-- Convenience store paymethod modal -->
        <modal id="owing-balance-modal">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.ConvenienceStoreModal.Header', '') }}
            </template>
            <template v-slot:body>
                <div
                    v-html="getLocalizationProp('Labels.ConvenienceStoreModal.Body', '')">
                </div>
            </template>
            <template v-slot:footer>
                <v-button
                    class="text-base px-90 py-15"
                    @click="hideModal">
                    {{ getLocalizationProp('Labels.ConvenienceStoreModal.Footer', '') }}
                </v-button>
            </template>
        </modal>
        <!-- Reenrollment Payment Success Modal- CMA flow-->
        <modal
            id="reenrollment-payment-success"
            heading-class="font-bold text-2xl leading-initial"
            :prevent-close="true"
        >
            <template v-slot:heading>
                <span v-html="getLocalizationProp('Labels.ReenrollmentModal.Header')" />
            </template>

            <template v-slot:body>
                <p
                    class="text-gray-120 leading-tight"
                    v-html="getLocalizationProp('Labels.ReenrollmentModal.Body')"
                />
            </template>

            <template v-slot:footer>
                <v-button
                    :is-anchor="true"
                    class="px-24 py-12 text-base"
                    :href="getLocalizationProp('Data.RedirectUrlCmaForm')"
                    :type="null"
                >
                    {{ getLocalizationProp('Labels.ReenrollmentModal.Footer') }}
                </v-button>
            </template>
        </modal>

    </div>
</template>

<script>
    import { mapActions, mapState, mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/account/customerbalance';
    import apiSubmitPayment from '@api/routes/account/submitpayment';
    import OEasypayPortal from '../../02-organisms/easy-pay/easy-pay.vue';
    import { convenienceStore, payPal, portal, virtualPayment } from '../../../utils/payment-types';
    import apiExternalPayment from '@api/routes/externalpayment/requestforpayment';
    import otpApi from '@api/routes/customeraccount/paymethods/paymentauthentication';
    import payMethodsApi from '@api/routes/customeraccount/paymethods/getavailablepaymethods';
    import cardNumber from '@common/source/js/vue/utils/card-number';
    import FpxPayment from '../../02-organisms/fpx-payment/fpx-payment.vue';
    import OtpPayment from '../../02-organisms/otp-payment/otp-payment.vue';
    import getJwtToken from '@api/routes/checkout/jwttoken';
    import getBrowser from '@productstore/source/js/vue/utils/get-browser';
    import OCheckoutPaymentMethodsConfigurable from '@productstore/source/js/vue/components/02-organisms/checkout/checkout-payment-methods-configurable.vue';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'OwingBalance',
        components: {
            OEasypayPortal,
            FormFieldErrorMessage,
            FpxPayment,
            OtpPayment,
            OCheckoutPaymentMethodsConfigurable
        },
        mixins: [localizationMixin],
        props: {
            options: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                card: null,
                customerRiskData: null,
                deviceData: null, // For PayPal/Braintree
                fpxData: null,
                fpxBankId: null,
                installment: null,
                errorMessage: 'Your payment method was declined. Please <span class="font-bold underline">enter another payment method.</span>',
                hasPayMethodResponse: false,
                hideConvenienceStoreModal: null,
                isApiLoading: false,
                isPortal: false,
                isPayMethodInfoValid: false,
                notSatisfiedWithAtLeastOneInfo: false,
                selectedPayment: '',
                selectedPayMethod: null,
                selectedBills: [],
                shouldDisplayPaymentError: false,
                shouldDisplayPartialPaymentErrorMessage: false,
                subtitle: 'Sure enough, our records indicate your balance needs a little love. Paying it off and getting square is easy. Just select a method of payment below and submit payment. Taking care of your balance now will allow us to continue serving you without any restrictions. Thank you!',
                totalBalance: '',
                unpaidItems: [],
                payMethodErrorInfo: {},
                payMethodType: '',
                portalData: null,
                showFpx: false,
                showOtp: false,
                showSubmitButton: true,
                orderData: null,
                otpData: null,
                otpTokenInfo: null,
                otpSessionID: null,
                collectionsProcessorType: null,
                binNumber: null,
                stopSubmitOtp: false,
                requiresCvv: false,
                hasCvvError: false,
                cvvCode: '',
                payOptions: []
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedPayMethods', 'storedCountryInfo', 'paypalClientToken']),
            allowedKeys() {
                return [8, 9, 13, 35, 36, 37, 39, 46];
            },
            modalLabelsDeletePayMethod() {
                return {
                    ...this.getLocalizationProp('Labels.DeletePayMethodModal', {}),
                    ManagePayMethods: this.getLocalizationProp('Data.ManagePayMethodsLink.Text', ''),
                    ManagePayMethodsUrl: this.getLocalizationProp('Data.ManagePayMethodsLink.Url', '')
                };
            },
            browser() {
                return getBrowser(this.$custInfo?.uiCulture);
            },
            customerId() {
                return this.getLocalizationProp('Data.CustomerId') || null;
            },
            enableMultipleOrders() {
                return this.getLocalizationProp('Data.ShowMultiSelectOptions', false);
            },
            getAddPaylink() {
                const newPaymentLink = this.getLocalizationProp('Data.NewPaymentLink');
                return newPaymentLink.includes('backTo') ? newPaymentLink : `${newPaymentLink}?backTo=${window.location.pathname}&fromCheckout=true`;
            },
            installmentData() {
                return {
                    labels: this.getLocalizationProp('Labels.Installments', {}),
                    data: this.getLocalizationProp('Data.Installments', {}),
                    country: this.getLocalizationProp('Data.Country')
                };
            },
            isLoaded() {
                return this.localization?.Labels && this.hasPayMethodResponse;
            },
            // CMA flow for reenrollments
            isReenrollment() {
                return this.getLocalizationProp('Data.IsReenrollment', false);
            },
            needFurtherPaymentValidation() {
                return this.selectedPayMethod?.NeedFurtherPaymentValidation;
            },
            showConvenienceStoreModal() {
                if(this.selectedBills.some(bill => bill.PaymethodType === convenienceStore)) {
                    return this.getLocalizationProp('Data.ShowConvenienceStoreModalFeature');
                }
                return false;
            },
            showPortal() {
                return this.payMethodType === portal;
            },
            totalBalanceSelected() {
                return this.selectedBills.map((bill) => bill.Balance).reduce((prev, current) => prev + current, 0);
            },
            cybersource() {
                return this.collectionsProcessorType === 'CyberSource';
            },
            // For Cybersource and WorldPay
            selectedOrderId() {
                return this.selectedBills[0]?.OrderId;
            },
            selectedOrderNumber() {
                return this.selectedBills[0]?.OrderNumber;
            },
            selectedPaymentIsExpired() {
                return this.isReenrollment && this.storedPayMethods.find(method => method.PayMethodId === this.selectedPayment)?.Expired;
            },
            showCvv() {
                return !this.isReenrollment && this.requiresCvv && this.payOptions.some(cardType => cardType.Name === this.payMethodType);
            },
            showCvvWhatIs() {
                return this.showCvv && this.getLocalizationProp('Labels.Cvv.CvvModal', false);
            },
            invalidCvv() {
                const minLength = this.getLocalizationProp('Data.Cvv.MinLength') || 0;
                return this.showCvv && (!this.cvvCode.length || this.cvvCode.length < minLength || isNaN(this.cvvCode));
            },
            useOrderData() {
                return this.getLocalizationProp('Data.UseOrderData', false);
            },
            worldPay() {
                return this.collectionsProcessorType?.toLowerCase() === 'worldpay';
            }
        },
        watch: {
            customerId() {
                if(this.isReenrollment) {
                    this.getCcPayOptions();
                }
            },
            async payMethodType(val) {
                if(val === portal) {
                    // 3D portal can only be paid one at a time so there will only be one selected
                    this.portalData = {
                        cartTotal: this.selectedBills[0]?.Balance,
                        customerId: this.getLocalizationProp('Data.CustomerId'),
                        customerName: this.getLocalizationProp('Data.CustomerName'),
                        mallId: this.getLocalizationProp('Data.MallId'),
                        orderNumber: this.selectedBills[0].OrderNumber,
                        orderId: this.selectedBills[0].OrderId,
                        paymentId: this.selectedPayment,
                        responseUrl: this.getLocalizationProp('Data.ResponseUrl'),
                        userId: this.getLocalizationProp('Data.UserName'),
                        datasourceItemId: this.getLocalizationProp('Data.DatasourceItemId')
                    };
                }
                if(val === payPal) {
                    this.isApiLoading = true;
                    if(!this.paypalClientToken) {
                        await this.getPayPalClientToken();
                    }
                    await this.getPaypalDeviceData();
                    this.isApiLoading = false;
                }
            }
        },
        async created() {
            await this.getCcPayOptions();
        },
        async mounted() {
            this.getOrderData();

            // Hides the modal from an external js file handled by BE
            window.closeCheckoutModal = async () => {
                await this.$modal.hide({id: 'otp-modal'});
                this.stopSubmitOtp = true;
                // Retain data when re-calling placeOrder after successful OTP verification.
                const shouldClearData = false;
                this.submitPayment(shouldClearData);
            };
        },

        methods: {
            ...mapActions('paymentMethod', ['getCountryInfo', 'getPayMethods', 'getPayPalClientToken']),
            ...mapMutations('paymentMethod', ['SET_COUNTRY_INFO']),
            getPaypalDeviceData() {
                window.braintree?.client?.create(
                    {
                        authorization: this.paypalClientToken
                    },
                    (clientErr, clientInstance) => {
                        if(clientErr) {
                            console.error('Error creating client: ', clientErr);
                            return;
                        }
                        // Initialize device data collection
                        window.braintree?.dataCollector?.create({
                            client: clientInstance,
                            paypal: true
                        }, (dataCollectorErr, dataCollectorInstance) => {
                            if(dataCollectorErr) {
                                console.error('Error creating data collector:', dataCollectorErr);
                                return;
                            }
                            this.deviceData = dataCollectorInstance?.deviceData;
                        });
                    }
                );
            },
            async onPaymentSaved(prop) {
                await this.getPayMethods({ customerId: prop?.customerId, checkout: true, owingBalance: true, country: this.$env.Country});

                // logs for higher env testing of first time user accounts
                console.log('pay method saved - after refresh', this.storedPayMethods);
                console.log('selected checkout pay method', this.selectedPayMethodId);

                const payMethod = this.storedPayMethods?.find((method) => method.PayMethodId === prop?.payMethodId);
                if(payMethod) {
                    this.updateInfo({
                        PayMethodId: prop?.payMethodId
                    });
                }
                !this.isReenrollment && this.getCountryInfo({ country: this.$env.Country });
            },
            updateInfoInitial(prop) {
                const payMethodId = prop?.PayMethodId;
                const payMethodType = prop?.PayMethodType;
                this.updatePayment({payMethodId, payMethodType});
            },
            updateInfo(prop) {
                const payMethodId = prop?.PayMethodId;
                const payMethodType = this.storedPayMethods.find(method => method.PayMethodId === payMethodId)?.PayMethodType;
                this.updatePayment({payMethodId, payMethodType});
            },
            closeModal() {
                this.$modal.hide({id: 'select-one-bill-error'});
            },
            // If emitted value paymentFormVisible is true, hide the submit button
            hideSubmitButton(value) {
                this.showSubmitButton = !value;
            },
            openCvvModal() {
                this.$modal.show({ id: 'modal-cvv' });
            },
            async getOrderData() {
                // Pass customer id for reenrollemnt CMA flow
                const response = await (this.customerId && this.isReenrollment
                    ? api.get(`?customerId=${this.customerId}`) : api.get());
                if(response.success) {
                    const data = response.data?.Data;
                    // Get the first two orders
                    this.customerRiskData = data?.CustomerRiskData || false;
                    this.totalBalance = data?.FormattedTotalBalance;
                    this.unpaidItems = data?.UnpaidOrderPayments;
                    this.requiresCvv = data?.RequiresCvv;
                }
            },
            async getCcPayOptions() {
                // Get all available creditCard payment options
                // Pass customer id for reenrollemnt CMA flow
                const payMethodResponse = await (this.customerId && this.isReenrollment
                    ? payMethodsApi.get(`?customerId=${this.customerId}&country=${this.$env.Country}`) : payMethodsApi.get());
                this.hasPayMethodResponse = true;
                if(payMethodResponse.success) {
                    const data = payMethodResponse.data?.Data;
                    this.paymentIndex = data?.PayMethods.findIndex((method) => method.Paymethod === 'CreditCard');
                    if(this.paymentIndex > -1) {
                        const creditCardOptions = data.PayMethods[this.paymentIndex].Options;
                        !this.isReenrollment && creditCardOptions.push({ Name: cardNumber.cardBrands.all });
                        this.payOptions = creditCardOptions;
                    }
                    this.isReenrollment && this.SET_COUNTRY_INFO({info: data});
                }
            },
            async getJwtTokenData() {
                let data;
                const requestUrl = this.getLocalizationProp('Data.ThreeDSDDCRequestUrl', 'https://centinelapistag.cardinalcommerce.com/V1/Cruise/Collect');
                const listenUrl = this.getLocalizationProp('Data.ThreeDSDDCListenUrl', 'https://centinelapistag.cardinalcommerce.com');
                const response = await getJwtToken.get();
                if(response?.data?.Success) {
                    data = response?.data?.Data;
                    this.otpTokenInfo = {
                        jWTToken: data,
                        binNumber: this.binNumber,
                        requestUrl: requestUrl,
                        listenUrl: listenUrl
                    };
                    this.isApiLoading = true;
                } else {
                    this.otpTokenInfo = null;
                }
            },
            async handleProcessOwingBalance() {
                this.isApiLoading = true;

                const payMethodInfoData = this.$refs.payMethodInfoRef?.getInfo() || {};
                const processOwingBalanceParams = {
                    OrderIds: [this.selectedOrderId],
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
                        redirectUrl = this.getLocalizationProp('Data.ReceiptUrl') + this.selectedOrderNumber;
                    } else if(processOwingBalanceResponse.data?.Data?.AdditionalVerificationRequired) {
                        redirectUrl = processOwingBalanceResponse.data?.Data?.StepUpUrl;
                    }
                }

                this.isApiLoading = false;
                return redirectUrl;
            },
            hideModal() {
                this.hideConvenienceStoreModal = true;
                this.$modal.hide({id: 'owing-balance-modal'});
                this.submitPayment();
            },
            onUpdateSelections(params) {
                switch (params.action) {
                    case 'add': {
                        let index = this.unpaidItems.findIndex((b) => b.OrderId === params.order);
                        let hasMatch = index === -1;
                        if(hasMatch) return;

                        this.selectedBills?.push(this.unpaidItems[index]);
                        break;
                    }

                    case 'remove': {
                        let index = this.selectedBills.findIndex((b) => b.OrderId === params.order);
                        let hasMatch = index >= 0;
                        if(hasMatch) {
                            this.selectedBills.splice(index, 1);
                        }
                        break;
                    }

                    case 'remove-all':
                        this.selectedBills = [];
                        break;

                    default:
                    case 'all': {
                        let allBills = this.unpaidItems.slice();
                        this.selectedBills = allBills;
                        break;
                    }
                }
            },
            onSessionIdAvailable(sessionId) {
                this.isApiLoading = false;
                this.otpSessionID = sessionId;
            },
            async updatePayment({ card, installment, isPortal, payMethodId, payMethodType, showFpx, fpxBankId, collectionsProcessorType, binNumber, selectedPayMethod }) {
                this.card = card;
                this.installment = installment;
                this.isPortal = isPortal;
                this.payMethodType = payMethodType;
                this.selectedPayment = payMethodId;
                this.showFpx = showFpx;
                this.fpxBankId = fpxBankId;
                this.collectionsProcessorType = collectionsProcessorType;
                this.binNumber = binNumber;
                this.selectedPayMethod = selectedPayMethod;

                if(payMethodId) {
                    const type = this.storedPayMethods.find(method => method.PayMethodId === payMethodId)?.PayMethodType;
                    // Otp Payment when selecting credit cards
                    if(type && (this.cybersource || this.worldPay) && this.payOptions.some(card => card.Name === type)) {
                        // Get the JWT token data to be retrieved asynchronously
                        try {
                            await this.getJwtTokenData();
                            await this.$nextTick();
                            await this.$refs['otp'].submitToken();
                        } catch (error) {
                            console.error('Error getting OTP token inside updatePayment:', error);
                        }
                    }
                }
            },
            async submitFpx(orderNum) {
                let data;
                const params = {
                    collectionProcessorType: 'FPX3DPortal',
                    orderNumber: orderNum,
                    paymentId: this.selectedPayment,
                    bankId: this.fpxBankId
                };
                const fpxResponse = await apiExternalPayment.post(params);
                if(fpxResponse?.data?.Success) {
                    data = fpxResponse?.data?.Data?.requestForm;
                    this.fpxData = {
                        action: data?.action,
                        method: data?.method,
                        ...data?.inputs
                    };
                } else {
                    this.fpxData = null;
                }
            },
            async submitOtp() {
                let data;
                let params;
                if(this.useOrderData) {
                    params = {
                        orderId: this.selectedOrderId,
                        orderNumber: this.selectedOrderNumber,
                        PayMethodID: this.selectedPayment,
                        CvvCode: this.cvvCode || null,
                        CollectionsProcessorType: this.collectionsProcessorType,
                        ...(this.customerRiskData && {
                            CustomerRiskData: this.customerRiskData
                        }),
                        dfReferenceId: this.otpSessionID,
                        amount: this.totalBalanceSelected,
                        browser: this.browser
                    };
                } else {
                    params = {
                        PayMethodID: this.selectedPayment,
                        CvvCode: this.cvvCode || null,
                        CollectionsProcessorType: this.collectionsProcessorType,
                        ...(this.customerRiskData && {
                            CustomerRiskData: this.customerRiskData
                        }),
                        dfReferenceId: this.otpSessionID,
                        amount: this.totalBalanceSelected,
                        browser: this.browser
                    };
                }
                const otpResponse = await otpApi.post(params);
                if(otpResponse?.data?.Success) {
                    this.showOtp = true;
                    data = otpResponse?.data?.Data;
                    this.otpData = {
                        JournalKey: data?.JournalKey,
                        IsDSVerificationRequired: data?.IsDSVerificationRequired,
                        MachineCookie: data?.MachineCookie,
                        ThreeDSChallengeToken: data?.ThreeDSChallengeToken,
                        ThreeDSTransactionId: data?.ThreeDSTransactionId,
                        StepUpUrl: data?.StepUpUrl
                    };
                } else {
                    this.showOtp = false;
                    this.otpData = null;
                }
            },
            async submitPayment(shouldClearData = true) {
                if(this.needFurtherPaymentValidation) {
                    this.$refs.payMethodInfoRef.validate();
                    if(!this.isPayMethodInfoValid) {
                        return;
                    }

                    if(this.invalidCvv) {
                        this.hasCvvError = true;
                        return;
                    }
                    this.hasCvvError = false;

                    const processOwingBalanceRedirectUrl = await this.handleProcessOwingBalance();
                    window.location.href = processOwingBalanceRedirectUrl;

                    return;
                }

                // Clear the data if the user clicks on the place order button as we need to get new information from the API
                if(shouldClearData && this.worldPay) {
                    this.stopSubmitOtp = false;
                    if(this.otpData) this.otpData.ThreeDSTransactionId = undefined;
                }

                if(this.showConvenienceStoreModal && !this.hideConvenienceStoreModal) {
                    this.$modal.show({id: 'owing-balance-modal'});
                    return;
                }

                if(this.isPortal && !this.card) {
                    this.$refs['pay-method'].$emit('installment-error');
                    return;
                }

                if(this.showFpx && (this.fpxBankId === null || this.selectedBills[0].OrderNumber === null)) {
                    this.$refs['pay-method'].$emit('show-fpx-error');
                    return;
                }

                if(this.invalidCvv) {
                    this.hasCvvError = true;
                    return;
                }

                const hasMoreOneSelected = this.selectedBills.length <= 1;

                // user not allowed to select more than one bill if if portal payment
                if(this.enableMultipleOrders && this.isPortal && !hasMoreOneSelected) {
                    this.$modal.show({id: 'select-one-bill-error'});
                    return;
                }

                if(this.payMethodType === portal && this.card !== null) {
                    this.$refs['portal'].showPopup();
                    return;
                }

                if(this.payMethodType === virtualPayment && this.showFpx && !this.fpxData &&
                    this.fpxBankId !== null && this.selectedBills[0].OrderNumber) {
                    await this.submitFpx(this.selectedBills[0].OrderNumber);
                    this.$refs['fpx'].submit();
                }

                this.isApiLoading = true;
                this.hasCvvError = false;
                const params = {
                    cardId: this.card,
                    installmentId: this.installment,
                    payMethodId: this.selectedPayment,
                    payMethodType: this.payMethodType,
                    orderIds: this.selectedBills.map(order => order.OrderId),
                    cvvCode: this.cvvCode || null,
                    dfReferenceId: this.otpSessionID,
                    threeDSTransactionId: this.otpData?.ThreeDSTransactionId,
                    ...(this.customerId && {
                        customerId: this.customerId
                    }),

                    // PayPal/Braintree
                    ...(this.deviceData && {
                        DeviceData: this.deviceData
                    }),

                    // Fpx
                    ...(this.showFpx && {
                        BankId: this.fpxBankId
                    }),
                    // conditional worldpay params
                    ...(this.worldPay && {
                        ...(this.customerRiskData && !this.stopSubmitOtp && {
                            CustomerRiskData: this.customerRiskData
                        }),
                        MachineCookie: this.otpData?.MachineCookie,
                        orderId: this.selectedOrderId,
                        orderNumber: this.selectedOrderNumber,
                        ...(!this.stopSubmitOtp && {
                            browser: this.browser,
                            JournalKey: this.otpData?.JournalKey
                        }),
                        CollectionsProcessorType: this.collectionsProcessorType
                    })
                };

                const type = this.storedPayMethods.find(method => method.PayMethodId === this.selectedPayment)?.PayMethodType;

                if(type && !this.stopSubmitOtp && this.cybersource && this.useOrderData && this.payOptions.some(card => card.Name === type)) {
                    if(!this.otpSessionID) await this.$refs['otp'].submitToken(); // Bug 139170 - This prevents DReferenceId getting passed as null
                    await this.submitOtp();
                    await this.$nextTick();
                    params.CollectionsProcessorType = this.collectionsProcessorType;
                    if(this.otpData?.IsDSVerificationRequired) {
                        this.$refs['otp'].submitForm();
                        this.isApiLoading = false;
                        return;
                    }
                    params.JournalKey = this.otpData?.JournalKey;
                }

                const response = await apiSubmitPayment.post(params);

                if(!response.data?.Success) {
                    this.shouldDisplayPaymentError = true;
                    this.getOrderData();

                    if(response.data?.Data?.MessageCode === 'TransactionFailed') {
                        if(!this.isReenrollment) this.$modal.show({id: 'owing-balance-partial-error'});
                        else {
                            this.shouldDisplayPaymentError = false;
                            this.shouldDisplayPartialPaymentErrorMessage = true;
                        }
                    }
                    if(response.data?.Data?.MessageCode === 'AdditionalVerificationRequired') {
                        this.showOtp = true;
                        if(!this.otpSessionID) await this.$refs['otp'].submitToken();
                        !this.worldPay && this.$refs['otp'].submitForm();
                        const data = response.data.Data;
                        const worldPayData = data?.WorldPay;
                        this.otpData = {
                            JournalKey: data?.JournalKey || worldPayData?.JournalKey,
                            IsDSVerificationRequired: data?.IsDSVerificationRequired || worldPayData?.IsDSVerificationRequired,
                            MachineCookie: worldPayData?.MachineCookie,
                            ThreeDSChallengeToken: worldPayData?.ThreeDSChallengeToken,
                            ThreeDSTransactionId: worldPayData?.ThreeDSTransactionId,
                            StepUpUrl: worldPayData?.StepUpUrl
                        };
                        // Worldpay needs to call submitForm after setting the otpData.
                        this.worldPay && this.$nextTick(() => {
                            this.$refs['otp'].submitForm();
                        });
                    }
                } else if(response.success && !this.showFpx) {
                    this.isReenrollment
                        ? this.$modal.show({id: 'reenrollment-payment-success'})
                        : window.location = this.getLocalizationProp('Data.PageUrl');
                }
                this.isApiLoading = false;
            },
            handleInteger(event, payload) {
                if(payload && payload.model) {
                    const regex = new RegExp('^[0-9]+$');
                    const keyCode = event.keyCode ? event.keyCode : event.which;
                    const key = event.key;

                    if(!this.allowedKeys.includes(keyCode) && !event.ctrlKey) {
                        // If NOT integer blocks the key
                        if(!regex.test(key)) {
                            event.preventDefault();
                        }
                    }
                }
            }
        }
    };
</script>

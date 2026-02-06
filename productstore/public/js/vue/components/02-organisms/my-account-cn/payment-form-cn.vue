<template>
    <section
        class="o-payForm -isCn" :class="{
            'mt-0': enablePreAuth,
            'md:-mt-30': enablePreAuth
        }">
        <form id="payment-form-cn" action="" method="post" name="payment-form" class="o-payForm__form">
            <!-- Show spinner while API is being loaded submitted -->
            <div v-if="showSpinner" class="o-payForm__loading">
                <a-loading-spinner
                    :visible="true"
                    class="o-payForm__loadingIcon"
                    aria-hidden="true">
                </a-loading-spinner>
            </div>

            <!-- Form fields -->
            <div class="o-payForm__wrapper">
                <!-- Payment methods: -->
                <div v-show="!isEditing" class="o-payForm__row pb-20 md:pb-25">
                    <p class="o-payForm__title -isCn" v-html="getLabels('Labels.Header.PayMethodType', paymentMethodTitle)"></p>
                    <div class="flex">
                        <!-- Payment methods - Credit Card Option -->
                        <m-radio
                            v-if="isCreditCardAllowed"
                            ref="paymentMethodType"
                            v-model="selectedPaymentMethod"
                            class="mr-10"
                            :name="paymentMethodType1.Name"
                            :label="getLabels('Labels.Header.Credit', paymentMethodType1.Label)"
                            :input-value="paymentMethodType1.Value"
                            @change="gtmTrackAction({id: 205, text: 'Credit Card'}, $event)">
                        </m-radio>

                        <!-- Payment methods - Debit Card Option -->
                        <!-- TODO: if we need to add check for `isDebitCardAllowed` then we'd need to add 'debit card' as a payment method -->
                        <m-radio
                            ref="paymentMethodType"
                            v-model="selectedPaymentMethod"
                            :name="paymentMethodType2.Name"
                            :label="getLabels('Labels.Header.Debit', paymentMethodType2.Label)"
                            :input-value="paymentMethodType2.Value"
                            @change="gtmTrackAction({id: 205, text: 'Debit Card'}, $event)">
                        </m-radio>
                    </div>
                </div>

                <!-- Payment form for credit cards: -->
                <payment-form-credit-cn
                    v-if="isCreditCardAllowed && isCreditCard"
                    ref="paymentFormCredit"
                    is-cn="true"
                    :script-id="scriptId">
                </payment-form-credit-cn>

                <!-- Payment form for debit cards: -->
                <payment-form-debit-cn
                    v-if="isDebitCard"
                    ref="paymentFormDebit"
                    is-cn="true"
                    :script-id="scriptId">
                </payment-form-debit-cn>

                <!-- Checkbox -- default payment: -->
                <!-- TODO: if we need to add check for `isDebitCardAllowed` then we'd need to add 'debit card' as a payment method -->
                <div
                    v-if="isCreditCardAllowed"
                    class="o-payForm__row">
                    <m-checkbox
                        v-if="isDefaultProductsAllowed"
                        id="defaultPayment"
                        ref="defaultPayment"
                        v-model="defaultPaymentValue"
                        :name="setDefaultPayment.Name"
                        :label="getLabels('Labels.Defaults.MakeThisMyDefault', defaultPayTitle)"
                        :label-mods="`${$v.defaultPaymentValue.$error ? ' -error' : ''}`"
                        :input-value="setDefaultPayment.Value"
                        :is-cn="true"
                        @input="gtmTrackAction({id: 204, text:getLabels('Labels.Defaults.ProductPurchases', setDefaultPayment.Label)}, {target: null})">
                    </m-checkbox>
                    <div v-if="$v.defaultPaymentValue.$error" :id="`${setDefaultPayment.Name}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert" v-html="getLabels('Labels.ErrorMessages.SetAsDefault.Required', '')"></p>
                    </div>
                </div>

                <!-- Checkbox -- user agreement confirmation: -->
                <div class="o-payForm__row">
                    <m-checkbox
                        id="privacyTerms"
                        ref="privacyTerms"
                        v-model="privacyTermsValue"
                        name="privacyTerms"
                        :label="confirmationCheckboxLabel()"
                        :label-mods="`${$v.privacyTermsValue.$error ? ' -error' : ''}`"
                        :is-cn="true"
                        :input-value="termsOfServiceAgreement.Value"
                    >
                    </m-checkbox>
                    <div v-if="$v.privacyTermsValue.$error" :id="`${termsOfServiceAgreement.Name}-error`" class="e-formError">
                        <p class="e-formError__item" role="alert" v-html="getLabels('Labels.ErrorMessages.Terms.Required', '')"></p>
                    </div>
                </div>
                <!-- Action Buttons -->
                <div
                    class="o-payForm__row -actions pt-15">
                    <!-- Cancel Button -->
                    <div class="o-payForm__col -cancelBtn">
                        <v-button
                            :cta="getLabels('Labels.FormSubmit.Cancel', buttonCancel)"
                            class="-cancel text-sm md:text-base"
                            @click="[handleCancel(), gtmTrackAction({id: 204}, $event)]">
                        </v-button>
                    </div>

                    <!-- Save Button:  -->
                    <div class="o-payForm__col -saveBtn">
                        <v-button
                            :cta="getLabels('Labels.FormSubmit.Save', buttonSave)"
                            class="-save text-sm md:text-base"
                            type="submit"
                            @click="[handleSubmit($event), gtmTrackAction({id: 204}, $event)]">
                        </v-button>
                    </div>

                    <!-- Modal - used for payment service -->
                    <modal id="modal-payment-service" width="535px">
                        <div class="o-payForm -modal">
                            <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                                {{ getLabels('Data.Modal.PaymentService.Title') }}
                            </h2>
                            <div class="m-rte" v-html="getLabels('Data.Modal.PaymentService.Rte')"></div>
                        </div>
                    </modal>

                    <!-- Modal - used for privacy terms -->
                    <modal id="modal-privacy-terms" width="535px">
                        <div class="o-payForm -modal -noScroll">
                            <h2 id="global-modal-heading" class="o-payForm__modalTitle">
                                {{ getLabels('Data.Modal.PrivacyTerms.Title') }}
                            </h2>
                            <div class="o-payForm__scroll -isCn">
                                <!--Custom scrollbar-->
                                <perfect-scrollbar ref="scroll">
                                    <div class="m-rte pr-16" v-html="getLabels('Data.Modal.PrivacyTerms.Rte')"></div>
                                </perfect-scrollbar>
                            </div>
                        </div>
                    </modal>

                    <!-- Modal - debit submit - Saved successfully-->
                    <modal id="modal-payment-success" width="535px">
                        <div class="o-payForm -modal">
                            <div v-html="isDebitCard ? getLabels('Data.Modal.PaymentSuccessDebit.Title') : getLabels('Data.Modal.PaymentSuccessCredit.Title')"></div>
                            <div class="m-rte" v-html="isDebitCard ? getLabels('Data.Modal.PaymentSuccessDebit.Rte') : getLabels('Data.Modal.PaymentSuccessCredit.Rte')"></div>
                        </div>
                    </modal>

                    <modal id="cnNotPreAuthModal" width="370px">
                        <template v-slot:heading>
                            {{ nonPersonalCard.BankCardNotSaveasDefaultTitle }}
                        </template>

                        <template v-slot:body>
                            <div class="text-gray-120 text-lg" style="line-height: 1.15;">
                                <p v-html="nonPersonalCard.BankCardNotSaveasDefaultDescription"></p>
                            </div>
                        </template>

                        <template v-slot:footer>
                            <button class="a-button px-15 w-120 text-center inline-block py-12" @click="closeCnNotPreAuthModal">{{ nonPersonalCard.BankCardNotSaveasDefaultAlertButtonText }}</button>
                        </template>
                    </modal>
                </div>
                <!-- Show API/FE errors messages -->
                <div v-if="listError && listError.length" class="o-payForm__apiError e-formError">
                    <p v-for="(validation, index) in listError" :key="index" class="e-formError__item py-0" role="alert">
                        {{ validation.error ? validation.error : validation }}
                    </p>
                </div>
            </div>
        </form>
    </section>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import cookie from '../../../utils/cookie';
    import eventBus from '../../../mixins/event-bus';
    import paymentFormMixin from '../../../mixins/payment-form';
    import * as paymentMethodsUtil from '../../../utils/payment-methods';
    import { validationMixin } from 'vuelidate';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'PaymentFormCn',
        mixins: [ paymentFormMixin, validationMixin ],
        validations() {
            return {
                // Termsofserviceagreement Validation Settings
                privacyTermsValue: {
                    required: () => {
                        return this.privacyTermsValue;
                    }
                },
                // DefaultPaymentValue Validation Settings
                defaultPaymentValue: {
                    required: () => {
                        return this.defaultPaymentValue;
                    }
                }
            };
        },
        props: {
            buttonCancel: {
                type: String,
                default: 'Cancel'
            },
            buttonSave: {
                type: String,
                default: 'Save'
            },
            // Used only on PatternLab to set user's country
            country: {
                type: String,
                default: null
            },
            defaultPayTitle: {
                type: String,
                default: 'I agree to set the above as the default payment account, and authorize Melaleuca to automatically deduct the corresponding payment for backup orders, phone orders and email from the default payment account.'
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
                        Label: 'Credit Card'
                    };
                }
            },
            paymentMethodType2: {
                type: Object,
                default: function() {
                    return {
                        Name: 'paymentmethodtype',
                        Value: 'debit',
                        Label: 'Debit Card'
                    };
                }
            },
            setDefaultPayment: {
                type: Object,
                default: function() {
                    return {
                        InputType: 'checkbox',
                        Id: 'defaultPayment',
                        Name: 'defaultPayment',
                        Value: paymentMethodsUtil.defaultPaymentTypes.products,
                        Label: 'Product Purchases'
                    };
                }
            },
            termsOfServiceAgreement: {
                type: Object,
                default: function() {
                    return {
                        InputType: 'checkbox',
                        Id: 'privacyTerms',
                        Name: 'privacyTerms',
                        Value: 'TermsOfService'
                    };
                }
            },
            token: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                formIsValid: false,
                paymentMethodTypeValue: 'card',
                cardHolderValue: null,
                cardNumberValue: null,
                cardNumberType: null,
                clearSpinner: false,
                expMonthValue: null,
                expYearValue: null,
                accountTypeValue: null,
                defaultPaymentValue: false,
                privacyTermsValue: false,
                apiListError: null,
                apiSuccess: false,
                showSubmitLoading: false,
                shouldOverwriteAccount: false,
                initialLoad: false,
                urlParams: null
            };
        },
        computed: {
            ...mapState('paymentMethod', [
                'storedApiError',
                'storedApiLoading',
                'storedApiSuccess',
                'storedPayMethod',
                'storedPayMethods',
                'storedPayInfo',
                'showPreAuthError'
            ]),

            showSpinner() {
                return ((this.showSubmitLoading || !this.initialLoad || this.apiSuccess) && !this.clearSpinner);
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
            customerId() {
                return this.localization?.Data?.CustomerId;
            },
            isCreditCard() {
                if(this.paymentMethodTypeValue === 'card') {
                    return true;
                }

                return false;
            },
            isDebitCard() {
                if(this.paymentMethodTypeValue === 'debit' || this.paymentMethodTypeValue === 'directdebit') {
                    return true;
                }

                return false;
            },
            isProduct() {
                if(this.isEditing && this.storedPayMethod) {
                    return paymentMethodsUtil.isProductsDefault(this.storedPayMethod.PayMethodDefaults);
                }

                return this.defaultPaymentValue;
            },
            listError() {
                let errors = [];

                if(this.apiListError && this.apiListError.length) {
                    errors = errors.concat(this.apiListError);
                }

                return errors;
            },
            methodType() {
                const methodType = this.checkMethodType();

                if(methodType) return methodType;

                return this.paymentMethodTypeValue;
            },
            selectedPaymentMethod: {
                get() {
                    return this.methodType;
                },
                set(val) {
                    this.paymentMethodTypeValue = val;
                }
            },
            userName() {
                return this.localization?.Data?.Username;
            },
            userCountry() {
                let country = null;
                if(this.localization?.Data?.Country) {
                    country = this.localization.Data.Country.replace(/\s/g, '');
                }
                return country;
            },
            nonPersonalCard() {
                return this.getLocalizationProp('Labels.NonPersonalCardCanNotSetDefault') || {};
            },
            enablePreAuth() {
                return this.getLocalizationProp('Data.EnablePreAuth');
            }
        },
        watch: {
            isProduct() {
                this.defaultPaymentValue = this.isProduct;
            },
            methodType() {
                this.resetListErrors();
                if(!this.isEditing) {
                    this.defaultPaymentValue = false;
                    this.privacyTermsValue = false;
                    this.$v.$reset();
                }
                this.paymentMethodTypeValue = this.methodType;
            },
            storedApiLoading() {
                this.showSubmitLoading = this.storedApiLoading;
            },
            storedApiError() {
                this.apiListError = this.storedApiError;
            },
            storedApiSuccess() {
                this.apiSuccess = this.storedApiSuccess;
                // If pay method is successful
                this.openModalPaymentSuccess(); // modal for success
                this.clearSpinner = true;
            },
            storedPayInfo() {
                // Emit result to parent
                if(this.apiSuccess) {
                    this.$emit('payment-saved', this.storedPayInfo);
                }
            },
            showPreAuthError(val) {
                if(this.enablePreAuth && val) {
                    this.$modal.show({id: 'cnNotPreAuthModal'});
                    this.$nextTick(() => {
                        this.CLOSE_PRE_AUTH_ERROR();
                    });
                }
            }
        },
        async mounted() {
            this.$store.commit('paymentMethod/SET_CN', true);

            this.initialLoad = false;

            this.urlParams = new URLSearchParams(window.location.search);

            this.setEventBus();

            this.resetListErrors();

            // Get cross country information
            // Get all payment methods of the customer
            await Promise.all([this.getCountryInfo({ country: this.country}), this.getPayMethods()]);

            // Get payment method data according to payment ID (it will activate the edit mode)
            if(this.paymentId) {
                await this.getPayMethod({
                    paymentId: this.paymentId,
                    customerId: this.customerId
                });
            }

            this.initialLoad = true;
            // this.confirmationCheckboxLabel();
            this.bindTermsLink();

            if(this.isEditing) {
                this.privacyTermsValue = true;
            }
        },
        methods: {
            ...mapMutations('paymentMethod', ['CLOSE_PRE_AUTH_ERROR', 'OPEN_PRE_AUTH_ERROR']),
            ...mapActions('paymentMethod', ['getCountryInfo', 'getPayMethods', 'getPayMethod', 'savePayMethod']),
            replaceTokenArray,

            confirmationCheckboxLabel() {
                const checkboxLabel = this.replaceTokenArray(
                    this.getLocalizationProp('Labels.ConfirmationLabel.Confirm'),
                    ['<a href="#" class="text-green-100 payment-link z-1">' + this.getLocalizationProp('Labels.ConfirmationLabel.PaymentServiceDescription') + '</a>', '<a href="#" class="text-green-100 privacy-link z-1">' + this.getLocalizationProp('Labels.ConfirmationLabel.PrivacyTerms') + '</a>']
                );
                return checkboxLabel;
            },
            bindTermsLink() {
                if(this.$refs['privacyTerms']) {
                    const paymentLink = this.$refs['privacyTerms'].$el.querySelector('.payment-link');
                    const privacyLink = this.$refs['privacyTerms'].$el.querySelector('.privacy-link');

                    if(paymentLink) {
                        paymentLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.openModalPaymentService();
                            return false;
                        });
                    }
                    if(privacyLink) {
                        privacyLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.openModalPrivacyTerms();
                            return false;
                        });
                    }
                }
            },
            goToPreviousPage() {
                // Check if there's a My Account URL on localization data
                window.location.href = document.referrer;
            },
            openModalPrivacyTerms() {
                this.$modal.show({ id: 'modal-privacy-terms' });
            },
            openModalPaymentService() {
                this.$modal.show({ id: 'modal-payment-service' });
            },
            openModalPaymentSuccess() {
                if(this.enablePreAuth) {
                    if(this.isEditing) {
                        this.goToPreviousPage();
                    } else if(!this.isEditing && this.storedPayInfo?.payMethodId) {
                        window.location.href = `${this.getLocalizationProp('Data.PreAuthPageUrl.Url')}?paymethodid=${this.storedPayInfo?.payMethodId}`;
                    }
                    return;
                }

                this.$modal.show({ id: 'modal-payment-success' });
                this.$modal.$on.hidden(() => {
                    this.goToPreviousPage();
                });
            },
            handleCancel() {
                this.goToPreviousPage();
            },
            handleSubmit(event) {
                try {
                    event.preventDefault();

                    // Check if the form was already submitted and saved
                    if(this.apiSuccess && this.storedPayInfo?.payMethodId > 0) {
                        this.$emit('payment-saved', this.storedPayInfo);
                        return;
                    }

                    let component = null;
                    let input = null;
                    let error = false;
                    let fields = [];
                    let validation = null;

                    this.resetListErrors();

                    // Set fields name for Credit card form
                    if(this.isCreditCard) {
                        let paymentFormCredit = ['expMonth', 'expYear', 'privacyTerms'];

                        if(!this.isEditing) {
                            paymentFormCredit.push('cardHolder', 'cardNumber');
                        }
                        if(this.storedPayMethods.length <= 0 || this.isProduct) {
                            paymentFormCredit.push('defaultPayment');
                        }

                        fields.push({
                            paymentFormCredit: paymentFormCredit
                        });
                    // Set fields name for Debit Card form
                    } else {
                        if(!this.isEditing) {
                            fields.push({
                                paymentFormDebit: ['cardHolder', 'cardNumber', 'privacyTerms']
                            });
                            if(this.storedPayMethods.length <= 0 || this.isProduct) {
                                fields.push({
                                    paymentFormDebit: ['defaultPayment']
                                });
                            }
                        } else {
                            fields.push({
                                paymentFormDebit: ['privacyTerms']
                            });
                            if(this.storedPayMethods.length <= 0 || this.isProduct) {
                                fields.push({
                                    paymentFormDebit: ['defaultPayment']
                                });
                            }
                        }
                    }

                    // Loop to re-check if there is some validation error in the fields
                    for (let i = 0; i < fields.length; i++) {
                        component = Object.keys(fields[i])[0];
                        input = fields[i][component];

                        if(Array.isArray(input)) {
                            for (let x = 0; x < input.length; x++) {
                                if(input[x] === 'privacyTerms' || input[x] === 'defaultPayment') {
                                    validation = this.$refs[input[x]].$parent.$v[input[x] + 'Value'];
                                } else {
                                    validation = this.$refs[component].$refs[input[x]].$parent.$v[input[x] + 'Value'];
                                }
                                // Apply validation
                                validation.$touch();

                                // Check if the field is invalid
                                if(validation.$invalid) {
                                    if('required' in validation) {
                                        error = true;
                                        this.handleValidationError(input[x], validation);
                                    } else {
                                        validation.$reset();
                                    }
                                }
                            }
                        }
                    }

                    // Define if the form is valid
                    this.formIsValid = !error;

                    // Submit form
                    this.submitForm();
                } catch (e) {
                    console.log('[PaymentForm] HandleSubmit - Exception:');
                    console.log(e);
                }
            },
            async submitForm() {
                // Submit form only if it's valid
                if(this.formIsValid) {
                    this.showSubmitLoading = true;
                    let payload = {};
                    payload.payMethodDefaults = [];

                    if(this.defaultPaymentValue) {
                        payload.payMethodDefaults.push(paymentMethodsUtil.defaultPaymentTypes.products, paymentMethodsUtil.defaultPaymentTypes.backupOrder);
                    }

                    const expDayValue = new Date(this.expYearValue, this.expMonthValue, 0).getDate();

                    // Only for ADD (post)
                    if(!this.isEditing) {
                        payload.creditCardNumber = this.cardNumberValue;
                        payload.userName = this.userName;
                        payload.hostName = window.location.hostname;
                        payload.payType = this.isDebitCard ? 'DebitCard' : 'UnionPayCard'; // Only for CN
                        payload.nameOnAccount = this.cardHolderValue;
                    // Only for EDIT (put)
                    } else {
                        payload.payMethodID = this.paymentId;
                        payload.username = this.userName;
                        payload.hostname = window.location.hostname;
                        payload.nameOnAccount = this.cardHolderValue;
                        payload.clearPayMethodDefaults = true;
                    }

                    if(!this.isDebitCard) {
                        payload.expirationDate = this.expYearValue.toString() + '-' + this.expMonthValue.toString() + '-' + expDayValue;
                    }

                    payload.countryType = this.userCountry;
                    payload.oneTimeUse = false;
                    payload.isActive = true;
                    payload.applicationId = 1;
                    payload.payMethodDirection = 'Inbound'; // Inbound or Outbound

                    // Save payment method
                    await this.savePayMethod({
                        isEditing: this.isEditing,
                        isCreditCard: this.isCreditCard,
                        isCommissionDeposit: false,
                        customerId: this.customerId,
                        bearerToken: this.bearerToken,
                        country: this.userCountry,
                        payload: payload,
                        envService: this.$env?.ServiceBaseUrl,
                        errorTranslations: this.localization?.Labels?.ServerErrorTranslation || null
                    });
                }
            },
            setEventBus() {
                eventBus.$on('update-payment-form', (payload) => {
                    if(payload) {
                        this[payload.model] = payload.value;
                    }
                });
            },
            closeCnNotPreAuthModal: function() {
                this.$modal.hide({id: 'cnNotPreAuthModal'});
                window.location.href = this.getLocalizationProp('Data.AddNewPaymethod', '#');
            }
        }
    };
</script>

import { mapState } from 'vuex';
import eventBus from './event-bus';
import localizationMixin from '@common/source/js/vue/mixins/localization';
import { defaultPaymentTypes } from '../utils/payment-methods';
import * as paymentTypes from '../utils/payment-types';

export default {
    mixins: [ localizationMixin ],
    props: {
        isInline: {
            type: Boolean,
            default: false
        },
        isOleCheckout: {
            type: Boolean,
            default: false
        },
        paymentIdValue: {
            type: [ Number, String ],
            default: null
        },
        rbIsEditing: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            riverbendIsEditingManuallyEnteredCard: false,
            creditCardValue: 'CreditCard',
            paymentMethodType: 'CreditCard',
            sepaDirectDebitValue: 'SepaDirectDebit',
            virtualAccountValue: 'VirtualAccount'
        };
    },
    computed: {
        ...mapState('paymentMethod', ['storedCountryInfo', 'storedPayMethod', 'storedPayMethods', 'storedApiErrorFields', 'storedFEError', 'isFirstTimeUser']),

        allowedKeys() {
            return [8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46, 91, 92, 93, 144, 182, 183];
        },
        cardNumberDefaults() {
            return {
                Id: 'ccn',
                Name: 'cardNumber',
                MinLength: this.isKR ? 12 : 14,
                MaxLength: this.isKR ? 19 : 16,
                Placeholder: null,
                Value: null,
                ValidationAlert: 'This field is required.',
                Label: 'CARD NUMBER'
            };
        },
        defaultCreditCard() {
            return this.getLocalizationProp('Data.DefaultCreditCard', false);
        },
        errorMessages() {
            return this.localization?.Labels?.ErrorMessages || {};
        },
        hasCardFootnotesData() {
            return this.localization?.Labels?.Card?.Footnotes || false;
        },
        hasPayPalPaymentMethod() {
            return this.storedPayMethods?.some(pay => pay.PayMethodType.toLowerCase() === 'paypal');
        },
        // In KR, if user is early enrollment, user have option to select Virtual Account
        // If user selects Virtual Account, no credit card fields are shown/no validation needed
        hideCcForm() {
            return (this.paymentMethodType === this.virtualAccountValue);
        },
        // User can only save one direct debit on their account at a time. Currently only for MX.
        hasDirectDebitPayMethod() {
            return (this.storedPayMethods?.some(pay => pay.PayMethodType === 'DirectDebit') && this.isDirectDebitAForm && !this.isSepaDirectDebit);
        },
        hideNickName() {
            return this.getLocalizationProp('Data.HideNickName', false);
        },
        isUS() {
            return !this.lang || ['en-us', 'es-us'].includes(this.lang.toLowerCase());
        },
        isCA() {
            return this.lang && ['en-ca', 'fr-ca'].includes(this.lang.toLowerCase());
        },
        isMX() {
            return this.lang && this.lang.toLowerCase() === 'es-mx';
        },
        isNZ() {
            return this.lang && this.lang.toLowerCase() === 'en-nz';
        },
        isAU() {
            return this.lang && this.lang.toLowerCase() === 'en-au';
        },
        isJP() {
            return this.lang && this.lang.toLowerCase() === 'ja-jp';
        },
        isKR() {
            return this.lang && this.lang.toLowerCase() === 'ko-kr';
        },
        isPH() {
            return this.lang && this.lang.toLowerCase() === 'en-ph';
        },
        isPL() {
            return this.lang && this.lang.toLowerCase() === 'pl-pl';
        },
        isSepaDirectDebit() {
            return this.lang && ['de-de', 'de-at', 'en-ie', 'nl-nl', 'lt-lt'].includes(this.lang.toLowerCase());
        },
        isSGMY() {
            return this.lang && ['en-my', 'zh-my', 'ms-my', 'en-sg', 'zh-sg'].includes(this.lang.toLowerCase());
        },
        isUK() {
            return this.lang && this.lang.toLowerCase() === 'en-gb';
        },
        isCreditCardAllowed() {
            let allowed = false;

            if(this.storedCountryInfo?.PayMethods) {
                allowed = this.storedCountryInfo.PayMethods.some(pay => pay.Paymethod === paymentTypes.creditCard);
            }

            return allowed;
        },
        isCheckingAllowed() {
            let allowed = false;

            // If it's Guest Checkout flow, then does NOT allow to create Checking Account
            if(this.isGuestCheckout) {
                return false;
            }

            if(this.storedCountryInfo?.PayMethods) {
                const checking = this.storedCountryInfo.PayMethods.find(pay => pay.Paymethod === paymentTypes.checking);
                if(this.isOwingBalance && checking?.Options) {
                    allowed = !checking?.Options?.some(payOption => payOption.CanBeUsedForOwingBalance === false);
                } else if(checking) {
                    allowed = true;
                }
            }

            return allowed;
        },
        isDirectDebitAllowed() {
            let allowed = false;

            // If it's Guest Checkout flow or this is not a first time user or the HideDirectDebit flag is on, then does NOT allow to create Direct Debit Account
            if(this.isGuestCheckout || this.getLocalizationProp('Data.HideDirectDebit')) {
                return false;
            }

            // If checkout and not a first time user, then does NOT allow to create Direct Debit Account.
            // Different behavior for checkout than original payment forms
            if(this.isOleCheckout && !this.isFirstTimeUser) {
                return false;
            }

            if(this.storedCountryInfo?.PayMethods) {
                const directDebit = this.storedCountryInfo.PayMethods.find(pay => pay.Paymethod === paymentTypes.directDebit);
                if(this.isOwingBalance && directDebit?.Options) {
                    allowed = !directDebit?.Options?.some(payOption => payOption.CanBeUsedForOwingBalance === false);
                } else if(directDebit) {
                    allowed = true;
                }
            }

            return allowed;
        },
        isDirectDebitAForm() {
            return this.getLocalizationProp('Data.IsDirectDebitAForm', false) || this.isCheckoutDirectDebitAForm;
        },
        isCommissionDepositAllowed() {
            let allowed = false;

            // The backend will return false if the user already has a commission deposit account
            // or for any other reason the form should not be displayed
            const showCommissionDepositForm = this.getLocalizationProp('Data.ShowCommissionDepositForm', true);

            // If it's Guest Checkout flow, then does NOT allow to create Commission Deposit Account
            if(this.isGuestCheckout || !showCommissionDepositForm) {
                return false;
            }

            if(this.storedCountryInfo?.PayMethods) {
                allowed = this.storedCountryInfo.PayMethods.some(pay => pay.Paymethod === paymentTypes.directDeposit);
            }

            return allowed;
        },
        isDefaultProductsAllowed() {
            let allowed = false;

            // If it's Guest Checkout or Online Enrollment flow or Riverbend checkout, then does NOT allow to set as default for product
            if(this.isGuestOrEnrollment || this.isRiverbend) {
                return false;
            }

            if(this.storedCountryInfo?.Defaults) {
                allowed = this.storedCountryInfo.Defaults.some(option => option.Name === defaultPaymentTypes.products);
            }

            return allowed;
        },
        isDefaultRiverbendAllowed() {
            let allowed = false;

            // If it's Guest Checkout or Online Enrollment flow or OLE checkout, then does NOT allow to set as default for product
            if(this.isGuestOrEnrollment) {
                return false;
            }

            allowed = this.isRiverbend;

            return allowed;
        },
        isDefaultServicesAllowed() {
            let allowed = false;

            // If it's Guest Checkout or riverbend checkout, then does NOT allow to set as default for services
            if(this.isGuestOrEnrollment || this.isRiverbend) {
                return false;
            }

            // Does NOT allow if JP or KR
            if(this.isJP || this.isKR) {
                return false;
            }

            if(this.storedCountryInfo?.Defaults) {
                allowed = this.storedCountryInfo.Defaults.some(option => option.Name === defaultPaymentTypes.services);
            }

            return allowed;
        },
        isEditing() {
            return Boolean(this.storedPayMethod && this.storedPayMethod.PayMethodId) || this.riverbendIsEditingManuallyEnteredCard;
        },
        isPayPalAllowed() {
            let allowed = false;

            if(this.storedCountryInfo?.PayMethods) {
                allowed = this.storedCountryInfo.PayMethods.some(pay => pay.Paymethod === 'PayPal');
            }

            return allowed;
        },
        isReadonlyExpiration() {
            return this.isKR && this.isEditing;
        },
        isReactivateWithSepa() {
            return (this.paymentMethodType === this.sepaDirectDebitValue) || false;
        },
        useCvv() {
            const hideCvv = this.getLocalizationProp('Data.HideCvv', false);
            // Exclude KR, MY, SG, PH
            const excludedCultures = ['ko-kr', 'en-my', 'zh-my', 'ms-my', 'en-sg', 'zh-sg', 'en-ph'];

            if(hideCvv) return false;
            else return this.lang && !excludedCultures.includes(this.lang.toLowerCase());
        },
        useZipcode() {
            const hideZipCode = this.getLocalizationProp('Data.HideZipCode', false);
            // Exclude AU, NZ, JP, KR, MY, SG, PH
            const excludedCultures = ['en-au', 'en-nz', 'ja-jp', 'ko-kr', 'en-my', 'zh-my', 'ms-my', 'en-sg', 'zh-sg', 'en-ph'];

            if(hideZipCode) return false;
            else return this.lang && !excludedCultures.includes(this.lang.toLowerCase());
        },

        lang() {
            const langCode = this.localization?.Data?.Culture;
            let language = 'en-US';

            if(langCode) {
                language = langCode;

                if(!['en-us', 'es-us', 'en-ca', 'fr-ca', 'es-mx', 'en-au', 'en-nz', 'ja-jp', 'ko-kr', 'en-my', 'zh-my', 'ms-my', 'en-sg', 'zh-sg', 'en-ph', 'pl-pl', 'en-gb', 'de-de', 'de-at', 'en-ie', 'lt-lt', 'nl-nl'].includes(language.toLowerCase())) {
                    language = 'en-US';
                }
            }

            return language;
        },
        paymentId() {
            if(this.isInline) {
                const paymentId = parseInt(this.paymentIdValue);
                return !isNaN(paymentId) ? paymentId : null;
            }

            return this.localization?.Data?.PaymethodId && this.localization?.Data?.IsEditing === true ? parseInt(this.localization.Data.PaymethodId) : null;
        },
        defaultCustomerName() {
            return this.localization?.Data?.CustomerName || '';
        },
        feListError() {
            return this.storedFEError;
        },
        showCardBrands() {
            return !this.isKR && !this.isSGMY && !this.isPH && !this.isEditing && !this.hasCardFootnotesData;
        },
        // Show PayPal radio button if user does not have PayPal payment method already
        showPayPalPaymentOption() {
            return !this.hasPayPalPaymentMethod && this.isPayPalAllowed;
        },
        // Show PayPal Checkout button if user selects PayPal radio, and user does not have PayPal payment method already
        showExistingPayPalAccount() {
            return this.isPayPal && this.hasPayPalPaymentMethod;
        }
    },
    methods: {
        checkMethodType() {
            let type = null;
            if(this.isEditing && this.storedPayMethod) {
                type = this.storedPayMethod?.PayMethodType?.toLowerCase();

                if(type?.indexOf('debit') > -1) {
                    return 'directdebit';
                } else if(type?.indexOf('checking') > -1 || type?.indexOf('savings') > -1) {
                    return 'checking';
                } else if(type?.indexOf('paypal') > -1) {
                    return 'paypal';
                } else {
                    return 'card';
                }
            } else if(this.isRiverbendSubscription) {
                return 'card';
            }

            return null;
        },
        checkRange(value, min, max) {
            if(value) {
                const inputLength = (value).length;
                min = parseInt(min);
                max = parseInt(max);

                if((min !== null && inputLength < min) || (max !== null && inputLength > max)) {
                    return false;
                }
            }

            return true;
        },
        getInitialValue(prop, store, current) {
            if(prop.Value) {
                return prop.Value;
            }

            return (this.isEditing && this.storedPayMethod) || this.rbIsEditing ? current : null;
        },
        getLabels(path, placeholder) {
            return this.getLocalizationProp(path, placeholder) || placeholder;
        },
        handleBlur(model) {
            if(typeof this[model] !== 'undefined' && (model !== 'cardNumberValue' && this.isKR)) {
                if(this.$v[model]) {
                    // Apply validation
                    this.$v[model].$touch();

                    // Display error messages
                    this.handleValidationError(model, this.$v[model]);
                }
            }
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
        },
        handleValidationError(input, validation) {
            try {
                const arrInputs = [
                    // Credit Card Fields
                    {
                        input: 'cardHolder',
                        label: 'CardholderName',
                        validate: [
                            'required',
                            'min',
                            'max',
                            'allowed'
                        ]
                    },
                    {
                        input: 'cardNumber',
                        label: 'CardNumber',
                        validate: [
                            'required',
                            'integer',
                            'min',
                            'max',
                            'allowed'
                        ]
                    },
                    {
                        input: 'cvv',
                        label: 'CVV',
                        validate: [
                            'required',
                            'integer',
                            'min',
                            'max'
                        ]
                    },
                    {
                        input: 'expMonth',
                        label: 'ExpirationMonth',
                        validate: [
                            'required',
                            'allowed'
                        ]
                    },
                    {
                        input: 'expYear',
                        label: 'ExpirationYear',
                        validate: [
                            'required',
                            'allowed'
                        ]
                    },
                    {
                        input: 'zip',
                        label: 'BillingZipCode',
                        validate: [
                            'required',
                            'min',
                            'max',
                            'allowed'
                        ]
                    },
                    {
                        input: 'nickname',
                        label: 'Nickname',
                        validate: [
                            'max'
                        ]
                    },

                    // Checking Fields
                    {
                        input: 'accountHolder',
                        label: 'NameOnAccount',
                        validate: [
                            'required',
                            'min',
                            'max',
                            'allowed'
                        ]
                    },
                    {
                        input: 'accountType',
                        label: 'AccountType',
                        validate: [
                            'required'
                        ]
                    },
                    {
                        input: 'routingNumber',
                        label: 'RoutingNumber',
                        validate: [
                            'required',
                            'integer',
                            'min',
                            'max'
                        ]
                    },
                    {
                        input: 'accountNumber',
                        label: 'AccountNumber',
                        validate: [
                            'required',
                            'integer',
                            'min',
                            'max'
                        ]
                    },

                    // Commission Deposit Fields
                    {
                        input: 'consentCheckbox',
                        label: 'ConsentCheckbox',
                        validate: [
                            'required'
                        ]
                    },
                    {
                        input: 'accountHolder',
                        label: 'NameOnAccount',
                        validate: [
                            'required',
                            'min',
                            'max'
                        ]
                    },
                    {
                        input: 'bankNumber',
                        label: 'BankNumber',
                        validate: [
                            'required'
                        ]
                    },
                    {
                        input: 'bank',
                        label: 'Bank',
                        validate: [
                            'required'
                        ]
                    },
                    {
                        input: 'accountNumber',
                        label: 'AccountNumber',
                        validate: [
                            'required',
                            'integer',
                            'min',
                            'max'
                        ]
                    },
                    {
                        input: 'bsbNumber',
                        label: 'BSB',
                        validate: [
                            'required',
                            'min',
                            'max'
                        ]
                    },
                    {
                        input: 'privacyTerms',
                        label: 'Terms',
                        validate: [
                            'required'
                        ]
                    },
                    {
                        input: 'termsCheckbox',
                        label: 'TermsCheckbox',
                        validate: [
                            'required'
                        ]
                    },
                    {
                        input: 'defaultPayment',
                        label: 'SetAsDefault',
                        validate: [
                            'required'
                        ]
                    }
                ];
                const activeInput = arrInputs.find(item => item.input === input || item.input + 'Value' === input);
                if(activeInput && validation) {
                    let msg = null;
                    let isRequired = activeInput.validate.includes('required');
                    let error = 0;

                    activeInput.validate.map(type => {
                        msg = null;

                        // Test "required" requirement first
                        if(type === 'required') {
                            // If the "required" requirement is NOT completed
                            msg = this.errorMessages[activeInput.label].Required;

                        // If the "required" requirement is completed, then test other requirements
                        } else if(validation.required || !isRequired) {
                            // Set expected error message
                            switch (type) {
                                case 'min':
                                    msg = this.errorMessages[activeInput.label] ? this.errorMessages[activeInput.label].MinLength : null;
                                    break;
                                case 'max':
                                    msg = this.errorMessages[activeInput.label] ? this.errorMessages[activeInput.label].MaxLength : null;
                                    break;
                                case 'integer':
                                    msg = this.errorMessages[activeInput.label] ? this.errorMessages[activeInput.label].Integer : null;
                                    break;
                                case 'allowed':
                                    msg = this.errorMessages[activeInput.label] ? this.errorMessages[activeInput.label].Invalid : null;
                                    break;
                            }
                        }
                        // If the requirement is completed, then remove the error message from Vuex Store
                        if(validation[type] !== false && msg) {
                            this.resetListErrors(msg, activeInput.label);
                        } else {
                            // If the requirement is NOT completed, then add the error message to Vuex Store
                            if(msg) {
                                this.$store.commit('paymentMethod/SET_FE_ERROR', {
                                    error: msg,
                                    field: activeInput.label
                                });
                                error++;
                            }
                        }
                    });

                    // If it's not required and there's no other validation error, but validate plugin keeps indicating error
                    if(!isRequired && !error && validation.$invalid) {
                        validation.$reset();
                    }
                }
            } catch (e) {
                console.log('[PaymentFormMixin] HandleValidationError - Exception:');
                console.log(e);
            }
        },
        resetListErrors(msg, field) {
            if(!msg) {
                // Clear error messages from Vuex Store
                this.$store.commit('paymentMethod/SET_FE_ERROR', {reset: true});
            } else {
                // Clear a specific error message from Vuex Store
                this.$store.commit('paymentMethod/SET_FE_ERROR', {reset: true, error: msg, field: field});
            }
        },
        getFieldError(field) {
            let msg = null;

            if(this.feListError?.length) {
                const arr = this.feListError.filter(validation => validation.field === field);
                if(arr?.length) {
                    msg = arr[arr.length - 1].error;
                }
            }

            return msg;
        },
        selectOptionsLabels(selectOptions) {
            let labels = '';

            if(selectOptions) {
                selectOptions.map(option => {
                    labels += option.Label + ',';
                });

                labels = labels.slice(0, -1);
            }

            return labels;
        },
        selectOptionsValues(selectOptions) {
            let values = [];

            if(selectOptions) {
                selectOptions.map(option => {
                    values.push(option.Value);
                });
            }

            return values;
        },
        updateModel(payload, enableNameValidate) {
            let value = null;
            let model = null;
            let validate = true;

            if(typeof payload === 'object') {
                model = payload.model;
                value = payload.value;
                validate = payload.validate;
                this[model] = value;
            } else {
                model = payload;
            }

            if(typeof this[model] !== 'undefined') {
                if(this.$v[model] && validate && (payload !== 'cardNumberValue' && (this.isKR || this.isAU))) {
                    // Apply validation
                    this.$v[model].$touch();

                    // Display error messages
                    this.handleValidationError(model, this.$v[model]);
                }

                eventBus.$emit('update-payment-form', {
                    model: model,
                    value: !enableNameValidate ? this[model] : this[model].toUpperCase().trim()
                });
            }
        }
    }
};

import api from '@api/routes/customeraccount/reactivate';
import localizationMixin from '@common/source/js/vue/mixins/localization';
import safeId from '@common/source/js/vue/mixins/safe-id';
import cardNumber from '@common/source/js/vue/utils/card-number';
import CheckboxGroup from '@common/source/js/vue/components/02-organisms/form-fields/checkbox-group.vue';
import CheckboxList from '@common/source/js/vue/components/02-organisms/form-fields/checkbox-list.vue';
import paymentFormMixin from './payment-form';
import { mapActions, mapGetters, mapState } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required, minLength, maxLength } from 'vuelidate/lib/validators';

/**
 * @typedef {Object} Checkbox
 * @property {boolean} Checked
 * @property {string} Text
 * @property {string} Name
 * @property {boolean} Required
 */

/**
 * @typedef {Object} SerializedCheckbox
 * @property {boolean} checked
 * @property {string} text
 * @property {string} name
 * @property {boolean} required
 */

export default {
    components: {
        CheckboxGroup,
        CheckboxList
    },
    mixins: [ localizationMixin, paymentFormMixin, safeId, validationMixin ],
    safeIds: [
        'ccCvvId',
        'ccNameId',
        'ccNumberId'
    ],
    validations() {
        return {
            isConsent: {
                required: (value) => value
            },
            ccNumber: {
            },
            expirationMonth: {
            },
            expirationYear: {
            },
            ...((!this.showCardOnfile && !this.hideCcFields) && {
                ccNumber: {
                    required,
                    ...(!this.showImprovedCTACheckout && {
                        maxLength: maxLength(this.cardMaxLength),
                        minLength: minLength(this.cardMinLength)
                    }),
                    // Trim whitespace before checking length
                    ...(this.showImprovedCTACheckout && {
                        maxLength: value => {
                            return value.replace(/\s/g, '').length >= this.cardMaxLength;
                        },
                        minLength: value => {
                            return value.replace(/\s/g, '').length >= this.cardMinLength;
                        }
                    })
                },
                expirationMonth: {
                    required
                },
                expirationYear: {
                    required
                }
            })
        };
    },
    data() {
        return {
            ccCvv: '',
            ccCvvId: '',
            ccName: '',
            ccNameId: '',
            ccNumber: '',
            ccNumberId: '',
            ccType: '',
            consentCheckbox: 'false',
            error: '',
            expirationMonth: '',
            expirationMonths: [],
            expirationYear: '',
            expirationYears: [],
            isConsent: false,
            loading: false
        };
    },
    computed: {
        ...mapState('paymentMethods', ['storedCountryInfoLoaded']),
        ...mapGetters('paymentMethod', ['cardOptions']),

        cardMaxLength() {
            const defaultMax = cardNumber.getCharLimitByCountry(this.$env.CountryCode).max;
            const max = this.getLocalizationProp('Data.CardNumberMaxValue', defaultMax);

            return typeof max === 'number' ? max : defaultMax;
        },
        cardMinLength() {
            const defaultMin = cardNumber.getCharLimitByCountry(this.$env.CountryCode).min;
            const min = this.getLocalizationProp('Data.CardNumberMinValue', defaultMin);

            return typeof min === 'number' ? min : defaultMin;
        },
        ccNames() {
            return this.getLocalizationProp('Data.CardholderNameValues', []);
        },
        cvvMaxLength() {
            return cardNumber.cardCvvCharLimitsByCountry.default.max;
        },
        cvvMinLength() {
            return cardNumber.cardCvvCharLimitsByCountry.default.min;
        },
        checkboxes() {
            return this.getLocalizationProp('Data.Checkboxes', []);
        },
        childCheckboxes() {
            return this.checkboxes
                .map((category) => {
                    return {
                        name: category?.CategoryName,
                        checkboxes: category?.Checkboxes.map(this.serializeCheckbox)
                    };
                });
        },
        country() {
            return this.getLocalizationProp('Data.Country', this.$env.Country);
        },
        defaultCreditCard() {
            return this.getLocalizationProp('Data.DefaultCreditCard');
        },
        // Check if defaultCreditCard exists, is not expired, and has PayMethodDefaults set to BackupOrder
        defaultCreditCardIsValid() {
            return (this.defaultCreditCard !== null) && (typeof this.defaultCreditCard) === 'object' && !this.defaultCreditCard.Expired && this.defaultCreditCard?.PayMethodDefaults.includes('BackupOrder');
        },
        getDescription() {
            return this.getLocalizationProp('Data.Description') || this.getLocalizationProp('Labels.Description');
        },
        gtmData() {
            return {
                'event': 'userEvent',
                'eC': 'Modal',
                'eA': 'View',
                'eL': this.getDescription
            };
        },
        // If user selects Virtual Account, no credit card fields are shown/no validation needed
        hideCcFields() {
            return (this.paymentMethodType === this.virtualAccountValue) || this.defaultCreditCardIsValid;
        },
        // If user is not early enrollment, hide the pay method section, including default card
        hidePayMethod() {
            return !this.removeValidationFromCCNumber && this.showCardOnfile;
        },
        isJP() {
            return this.country === 'Japan';
        },
        isKR() {
            return this.country === 'Korea';
        },
        monthLabel() {
            return this.getLocalizationProp('Labels.Month', 'Month');
        },
        // RemoveValidationFromCC is set for KR users who enrolled prior to a certain date
        // Note that RemoveValidationFromCC equates to early enrollment in KR
        removeValidationFromCCNumber() {
            return this.getLocalizationProp('Data.RemoveValidationFromCC', false);
        },
        // HidePaymethod by default is true whenever defaultCreditCard has a value
        // if a KR user does not have a valid CC file on file, show CC form and virtual account options
        showCardOnfile() {
            return this.defaultCreditCardIsValid && (typeof this.defaultCreditCard) === 'object';
        },
        showImprovedCTACheckout() {
            return this.getLocalizationProp('Data.ShowImprovedCTACheckout', false);
        },
        showLegend() {
            return this.defaultCreditCardIsValid || !this.hidePayMethod;
        },
        // For case when Korea user is enrolled early, show virtual account options
        // Note that data structure is different between reactivation-form-with-paymethod and reactivation-modal-with-paymethod, with VirtualAcount not being within labels in the former
        showVirtualOption() {
            return (this.getLocalizationProp('Labels.VirtualAccount') || this.virtualAccountLabel) && this.removeValidationFromCCNumber;
        },
        yearLabel() {
            return this.getLocalizationProp('Labels.Year', 'Year');
        },
        virtualAccountLabel() {
            return this.getLocalizationProp('VirtualAccount', false);
        }
    },
    created() {
        if(!this.storedCountryInfoLoaded) {
            this.getCountryInfo({
                country: this.country
            });
        }
    },
    mounted() {
        this.ccName = this.ccNames.length ? this.ccNames[0] : '';
        this.expirationMonths = cardNumber.getCardMonth(this.monthLabel);
        this.expirationYears = cardNumber.getCardYear(this.yearLabel);
    },
    methods: {
        ...mapActions('paymentMethod', ['getCountryInfo']),

        onCardNumberError({ brand }) {
            this.ccType = brand;
        },
        onCheckboxListChange({ isAllRequiredChecked }) {
            this.isConsent = isAllRequiredChecked;
        },
        onCheckboxGroupChange({ isAllRequiredChecked }) {
            this.isConsent = isAllRequiredChecked;
        },
        /**
         * serialize checkbox property names from Pascal Case to Camel Case
         * @param {Checkbox} checkbox
         * @returns {SerializedCheckbox}
         */
        serializeCheckbox(checkbox) {
            return {
                checked: checkbox.Checked,
                label: checkbox.Text,
                name: checkbox.Name,
                required: checkbox.Required
            };
        },
        async submit() {
            this.$v.$touch();

            if(this.loading || this.$v.$invalid) {
                return;
            }

            this.error = '';
            this.loading = true;

            const payloadPayMethod = this.paymentMethodType ? this.paymentMethodType : 'CreditCard';

            let payload = {
                Name: this.ccName,
                CardNumber: this.ccNumber.replace(/\s/g, ''),
                ExpirationMonth: this.expirationMonth,
                ExpirationYear: this.expirationYear,
                HasAcceptedCustomerAgreement: this.isConsent,
                PayMethodType: payloadPayMethod
            };

            // Japanese overrides - only cvv, not credit card
            if(this.isJP) {
                payload.CvvCode = this.ccCvv;
            }

            // Korean overrides
            if(this.isKR) {
                const customerFirstName = this.getLocalizationProp('Data.CustomerFirstName', this.ccNames[0]);
                const spouseFirstName = this.getLocalizationProp('Data.SpouseFirstName', this.ccNames[1]);

                payload.Name = this.ccName === this.ccNames[0] ? customerFirstName : spouseFirstName;
            }

            if(this.hidePayMethod) {
                payload = {
                    Name: this.ccName,
                    HasAcceptedCustomerAgreement: this.isConsent
                };
            }

            const response = await api.post(payload);

            if(response.success && response.data.Success) {
                this.$modal.hide();
                window.location.href = response.data.redirectUrl;
            } else {
                this.error = response.data?.ErrorMessage || response.error || '';
            }

            this.loading = false;
        }
    }
};

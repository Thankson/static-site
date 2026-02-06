import { mapState, mapActions, mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';
import { integer, required } from 'vuelidate/lib/validators';
import cardNumber from '@common/source/js/vue/utils/card-number';
import eventBus from './event-bus';
import paymentFormMixin from './payment-form';
import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
import getCountryCode from '@common/source/js/utils/get-country-code';
import formHelper from '@common/source/js/vue/utils/form-helper';
import regexParser from 'regex-parser';

export default {
    components: {
        vInput
    },
    mixins: [ paymentFormMixin, validationMixin ],
    validations() {
        return {
            cardHolderLastValue: {
            },
            ...(!this.isEditing && this.isMX && {
                cardHolderLastValue: {
                    required,
                    allowed: value => {
                        return formHelper.isValidTextInput(value);
                    },
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.cardHolderLast.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.cardHolderLast.MaxLength;
                    }
                }
            }),
            ...(!this.isEditing && {
                // Cardholder Validation Settings
                cardHolderValue: {
                    required,
                    allowed: value => {
                        return formHelper.isValidTextInput(value);
                    },
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.cardHolder.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.cardHolder.MaxLength;
                    },
                    ...(this.enableNameValidateFlag && {
                        isValidEnNameValue: value => {
                            const patternStr = regexParser(this.getLabels('Labels.Card.CardholderNamePattern', ''));
                            return patternStr.test(value);
                        }
                    })
                },

                // CardNumber Validation Settings
                cardNumberValue: {
                    required,
                    allowed: value => {
                        return !this.cardNumberNotAllowed;
                    },
                    ...(!this.showImprovedCTACheckout && {
                        integer,
                        min: value => {
                            if(value === null) return false;
                            return value.length >= this.cardNumber.MinLength;
                        },
                        max: value => {
                            if(value === null) return false;
                            return value.length <= this.cardNumber.MaxLength;
                        }
                    }),
                    // Trim whitespace before checking length
                    ...(this.showImprovedCTACheckout && {
                        min: value => {
                            if(!value) return false;
                            return value.replace(/\s/g, '').length >= this.cardNumber.MinLength;
                        },
                        max: value => {
                            if(!value) return false;
                            return value.replace(/\s/g, '').length <= this.cardNumber.MaxLength;
                        }
                    })
                }
            }),

            // ExpMonth Validation Settings
            expMonthValue: {
                required
            },

            // ExpYear Validation Settings
            expYearValue: {
                required
            },

            ...(this.useZipcode && !this.isEditing && {
                // Billing Zip Code Validation Settings
                zipValue: {
                    required,
                    allowed: value => {
                        if(value) {
                            let hasPattern;
                            let customerCulture = window.dataLayer ? window.dataLayer[0]?.customerCulture?.toLowerCase() : '';
                            if(customerCulture === 'en-ca' || customerCulture === 'fr-ca') {
                                hasPattern = /^[a-vxyA-VXY][0-9][a-zA-Z] [0-9][a-zA-Z][0-9]$/.exec(
                                    value
                                );
                            } else if(customerCulture === 'en-us') {
                                hasPattern = /^[0-9]{5}(?:-[0-9]{4})?$/.exec(
                                    value
                                );
                            } else {
                                const countryCode = getCountryCode(this.$env.Country)?.toLowerCase() || '';
                                hasPattern = formHelper.isValidPostalCode(value, countryCode);
                            }

                            return Boolean(hasPattern);
                        }
                        return false;
                    },
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.zip.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.zip.MaxLength;
                    }
                }
            }),

            ...(this.showNickName && {
                // Nickname Validation Settings
                nicknameValue: {
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.nickname.MaxLength;
                    }
                }
            }),

            ...(this.useCvv && (!this.isEditing || this.isJP) && {
                // CVV Validation Settings
                cvvValue: {
                    required,
                    integer,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.cvvMin;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.cvvMax;
                    }
                }
            })
        };
    },
    props: {
        cardTitle: {
            type: String,
            default: 'Melaleuca Accepts:'
        },
        cardHolder: {
            type: Object,
            default: function() {
                return {
                    Id: 'cardholder',
                    Name: 'cardholder',
                    MinLength: 1,
                    MaxLength: 100,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    SelectMod: '-bg-transparent -sm-md w-full',
                    Label: 'CARDHOLDER NAME',
                    Arrow: {
                        Direction: '-down',
                        Size: '-sm',
                        OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-15 pointer-events-none',
                        TailwindColor: 'gray'
                    }
                };
            }
        },
        cardHolderLast: {
            type: Object,
            default: function() {
                return {
                    Id: 'cardholderlast',
                    Name: 'cardholderlast',
                    MinLength: 1,
                    MaxLength: 100,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'CARDHOLDER LAST NAME'
                };
            }
        },
        cardNumber: {
            type: Object,
            default: function() {
                return {
                    Id: 'ccn',
                    Name: 'ccn',
                    MinLength: 14,
                    MaxLength: 16,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'CARD NUMBER'
                };
            }
        },
        expMonth: {
            type: Object,
            default: function() {
                return {
                    Id: 'select-expmonth',
                    Name: 'expmonth',
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    SelectMod: '-bg-transparent -sm-md w-full',
                    Label: 'EXPIRATION',
                    Arrow: {
                        Direction: '-down',
                        Size: '-sm',
                        OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-15 pointer-events-none',
                        TailwindColor: 'gray'
                    }
                };
            }
        },
        expYear: {
            type: Object,
            default: function() {
                return {
                    Id: 'select-expyear',
                    Name: 'expyear',
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    SelectMod: '-bg-transparent -sm-md w-full',
                    Label: 'Expiration year',
                    Arrow: {
                        Direction: '-down',
                        Size: '-sm',
                        OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-15 pointer-events-none',
                        TailwindColor: 'gray'
                    }
                };
            }
        },
        cvv: {
            type: Object,
            default: function() {
                return {
                    Id: 'cvv',
                    Name: 'cvv',
                    MinLength: 3,
                    MaxLength: 4,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'CVC/CVV'
                };
            }
        },
        zip: {
            type: Object,
            default: function() {
                return {
                    Id: 'zip',
                    Name: 'zip',
                    MinLength: 5,
                    MaxLength: 15,
                    Placeholder: '00000',
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'BILLING ZIP CODE'
                };
            }
        },
        nickname: {
            type: Object,
            default: function() {
                return {
                    Id: 'nickname',
                    Name: 'nickname',
                    MinLength: 1,
                    MaxLength: 100,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'NICKNAME (optional)'
                };
            }
        },
        isEnrollment: {
            type: Boolean,
            default: false
        },
        isGuestCheckout: {
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
        maskCardNumber: {
            type: Boolean,
            default: true
        },
        rbIsEditing: {
            type: Boolean,
            default: true
        },
        shouldCallAddressesApi: {
            type: Boolean,
            default: true
        },
        showImprovedCTACheckout: {
            type: Boolean,
            default: false
        },
        useDefaultLayout: {
            type: Boolean,
            default: false
        },
        useNickName: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            brandStatic: {},
            cardBrandImageSrc: {},
            cardNumberNotAllowed: false,
            cardHolderNameOptions: [],
            cardHolderValue: '',
            cardHolderLastValue: '',
            cardNumberValue: null,
            cardNumberType: null,
            expMonthValue: null,
            expYearValue: null,
            cvvValue: '',
            zipValue: '',
            nicknameValue: ''
        };
    },
    computed: {
        ...mapState('paymentMethod', ['storedPayMethod', 'storedCountryInfo', 'storedDefaultAddress']),
        ...mapState('riverbendSubscription', ['isRiverbend', 'isRiverbendSubscription', 'riverbendAddress']),
        ...mapGetters('paymentMethod', ['cardOptions']),
        ...mapState('shippingAddress', ['addresses']),

        cvvMax() {
            if(this.cardNumberType === cardNumber.cardBrands.amex) return cardNumber.cardCvvCharLimitsByCard.amex.max;

            return cardNumber.cardCvvCharLimitsByCard.default.max;
        },
        cvvMin() {
            if(this.cardNumberType === cardNumber.cardBrands.amex) return cardNumber.cardCvvCharLimitsByCard.amex.min;

            return cardNumber.cardCvvCharLimitsByCard.default.min;
        },
        enableNameValidateFlag() {
            return this.getLabels('Data.EnableCardholderNameValidation', false);
        },
        expirationLabel: function() {
            return this.storedPayMethod.Expired ? this.labelExpired : this.labelExpires;
        },
        expMonthOptions() {
            const placeholder = this.getLabels('Labels.Card.Month', 'Month');
            return cardNumber.getCardMonth(placeholder);
        },
        expYearOptions() {
            const placeholder = this.getLabels('Labels.Card.Year', 'Year');
            return cardNumber.getCardYear(placeholder);
        },
        expMonthLabel() {
            const expiration = this.getLabels('Labels.Card.Expiration', 'Expiration');
            const month = this.getLabels('Labels.Card.Month', 'Month');
            return `${expiration} ${month}`;
        },
        expYearLabel() {
            const expiration = this.getLabels('Labels.Card.Expiration', 'Expiration');
            const year = this.getLabels('Labels.Card.Year', 'Year');
            return `${expiration} ${year}`;
        },
        isGuestOrEnrollment() {
            return this.isGuestCheckout || this.isEnrollment;
        },
        isGuestCheckoutEditing() {
            return this.isGuestCheckout && this.isEditing;
        },
        isJP() {
            return this.$env?.Country === 'Japan' || false;
        },
        isPH() {
            return this.$env?.Country === 'Philippines' || false;
        },
        expirationMods() {
            let mods = '';

            if(this.useZipcode || this.useDefaultLayout) {
                // US and CA
                mods = mods + (this.isGuestOrEnrollment ? 'lg:w-2_5' : 'md:w-2_5');
            } else {
                // MX
                mods = mods + (this.isGuestOrEnrollment ? 'lg:w-2_3' : 'md:w-2_3');
            }

            return mods;
        },
        cvvMods() {
            let mods = this.isMX ? 'w-full pr-0 ' : 'w-1_2 pr-10 ';

            if(this.useZipcode) {
                // US and CA
                mods = mods + (this.isGuestOrEnrollment ? 'lg:w-1_4 lg:pr-20 lg:pl-20 ' : 'md:w-1_4 md:pl-20 md:pr-20 ');
            } else {
                // MX
                mods = mods + (this.isGuestOrEnrollment ? 'lg:w-1_3 lg:pr-0 lg:pl-20 ' : 'md:w-1_3 md:pl-20 md:pr-0 ');
            }

            if(this.isJP) {
                mods = mods + 'mr-auto ';
            }

            if(this.isRiverbendSubscription || this.showCvvIcon) {
                mods += '-hasCvvIcon';
            }

            return mods;
        },
        showCardHolderName() {
            if(!this.isRiverbendSubscription) return true;
            if(this.isEditing) return false;
            return true;
        },
        showCvvIcon() {
            return this.isRiverbendSubscription || this.localization.Data?.ShowCvvIcon;
        },
        showNickName() {
            if(!this.useNickName || this.isRiverbendSubscription || this.isSGMY || this.isPH) {
                return false;
            }
            return !this.isGuestOrEnrollment || !this.isRiverbendSubscription;
        }
    },
    watch: {
        riverbendAddress() {
            if(this.isRiverbendSubscription && !this.storedPayMethod?.PayMethodId && !this.cardNumberValue) {
                this.setRiverbendValues();
            }
        },
        storedPayMethod: {
            deep: true,
            handler() {
                this.getValuesFromStore();
            }
        },
        isEditing(newVal) {
            if(newVal === false && this.isMX) {
                // clears the card holder value
                this.cardHolderValue = '';
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            if(this.shouldCallAddressesApi) this.setDefaultAddress();
            this.setDefaultCustomerName();
            this.setCardHolderNameOptions();
            this.getValuesFromStore();
        });
    },
    methods: {
        ...mapActions('paymentMethod', ['getDefaultAddress']),

        getInitialValue(prop, store, current) {
            if(prop.Value) {
                return prop.Value;
            }

            return (this.isEditing && this.storedPayMethod) || this.rbIsEditing ? current : null;
        },
        getValuesFromStore() {
            if(this.storedPayMethod?.PayMethodId) {
                this.setStoredValues();
            } else if(this.isRiverbendSubscription && !this.storedPayMethod?.PayMethodId) {
                this.setRiverbendValues();
            } else if(!this.isEditing) {
                // Set cardNumberValue to null if not editing; otherwise it will pass a value even for new pay method
                this.cardNumberValue = null;
            }
        },
        handleCardNumber(payload) {
            this.cardNumberNotAllowed = payload.error;
            this.cardNumberType = payload.brand;

            eventBus.$emit('update-payment-form', {
                model: 'cardNumberType',
                value: this.cardNumberType
            });
        },
        async setDefaultAddress() {
            // Same for US / CA / MX - as of 6/14/2023
            if(!this.isEditing && !this.paymentId) {
                // Get default shipping address
                await this.getDefaultAddress();
                // Set default postal code
                if(this.storedDefaultAddress?.PostalCode && !this.zipValue && !this.isRiverbend) {
                    this.zipValue = this.storedDefaultAddress.PostalCode;
                } else if(this.isRiverbend && this.addresses.some(a => a.AddressType === 'RiverbendAddress')) {
                    this.zipValue = this.addresses.find(a => a.AddressType === 'RiverbendAddress')?.PostalCode;
                }
            }
        },
        setRiverbendValues() {
            this.cardHolderValue = this.riverbendAddress?.NameOnAddress || this.$custInfo.customerName || '';
            this.cardNumberValue = null;
            this.cardNumberType = null;
            this.expMonthValue = null;
            this.expYearValue = null;
            this.cvvValue = '';
            this.zipValue = this.riverbendAddress?.PostalCode ? this.riverbendAddress.PostalCode : '';
            this.nicknameValue = '';
        },
        setStoredValues() {
            const expirationDate = this.storedPayMethod.ExpirationDate.substring(0, 10).split('-');

            this.cardHolderValue = this.isEditing || !this.isMX ? this.storedPayMethod.NameOnAccount : '';
            this.cardHolderLastValue = '';
            this.cardNumberValue = '000000000000' + this.storedPayMethod.LastFourDigitsOfAccount;
            this.expMonthValue = expirationDate[1];
            this.expYearValue = expirationDate[0];
            this.cvvValue = null;
            this.zipValue = null;
            this.nicknameValue = this.storedPayMethod.AccountNickName === '<clearfield>' ? '' : this.storedPayMethod.AccountNickName;
            this.cardBrandImageSrc = this.storedPayMethod.PayMethodImage;
            this.brandStatic = this.cardOptions.find(card => card.Name === this.storedPayMethod.PayMethodType);
            this.cardNumberType = this.storedPayMethod.PayMethodType;
            this.handleCardNumber({
                error: false,
                brand: this.storedPayMethod.PayMethodType
            });
        },
        setValues({ cardHolder, cardNumber, cardType, expirationDate, cvv, zip }) {
            const expirationDateArr = expirationDate.substring(0, 10).split('-');

            this.cardHolderValue = cardHolder;
            this.cardNumberValue = cardNumber;
            this.cardTypeValue = cardType;
            this.expMonthValue = expirationDateArr[1];
            this.expYearValue = expirationDateArr[0];
            this.cvvValue = cvv;
            this.zipValue = zip;
        },
        setDefaultCustomerName() {
            // If it's adding a new pay method
            if(!this.isEditing && !this.paymentId && !this.cardHolderValue && !this.isMX) {
                this.cardHolderValue = !this.enableNameValidateFlag ? this.defaultCustomerName : '';
            }
        },
        setCardHolderNameOptions() {
            const cardHolderNames =
                    this.localization.Data?.CardHoldersNames?.split(',')
                        .map((name) => name.trim())
                        .filter((name) => name);

            this.cardHolderNameOptions = cardHolderNames?.map((name) => ({
                Label: name,
                Value: name
            })) || [];
        },
        touch() {
            this.$v.$touch();
        }
    }
};

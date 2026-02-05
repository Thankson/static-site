import eventBus from './event-bus';
import formHelper from '@common/source/js/vue/utils/form-helper';
import getCountryCode from '@common/source/js/utils/get-country-code';
import { validationMixin } from 'vuelidate';
import { requiredIf } from 'vuelidate/lib/validators';
import { mapActions, mapState } from 'vuex';

export default {
    mixins: [validationMixin],
    validations() {
        return {
            emailValue: {
                required: requiredIf(() => this.labels?.Email?.Required),
                email: val => {
                    if(!val) return true;
                    return formHelper.isValidEmail(val);
                }
            },
            firstName: {
                required: requiredIf(() => this.labels?.FirstName?.Required)
            },
            lastName: {
                required: requiredIf(() => this.labels?.LastName?.Required)
            },
            phoneNumber: {
                required: requiredIf(() => this.labels?.Phone?.Required),
                phone: val => {
                    if(!val && !this.$refs[`${this.formId}-phonetype`]) return true;

                    if(this.countryCode !== null && (this.countryCode === 'au' || this.countryCode === 'nz')) {
                        return formHelper.isValidPhoneNumberByPhoneType(val,
                            this.countryCode,
                            this.$refs[`${this.formId}-phonetype`].selectedVal);
                    }

                    return formHelper.isValidPhoneNumber(
                        val,
                        this.countryCode
                    );
                }
            }
        };
    },
    props: {
        formForSelfInfo: {
            type: Boolean,
            default: false
        },
        formId: {
            type: String,
            default: 'personalInfoForm'
        },
        isCollapseOpen: {
            type: Boolean,
            default: false
        },
        labels: {
            type: Object,
            default: () => ({})
        },
        preFilledData: {
            type: Object,
            default: () => ({
                DOB: {
                    Formatted: '',
                    Month: '',
                    Day: '',
                    Year: ''
                },
                Email: '',
                FirstName: '',
                LastName: '',
                MiddleName: '',
                PhoneNumber: '',
                PhoneType: 'MobilePhone'
            })
        }
    },
    data() {
        return {
            birthDate: null,
            email: {
                id: 'email',
                name: 'email',
                required: true
            },
            emailValue: '',
            firstName: null,
            hasValidationBeenTriggered: false,
            initial: null,
            initialEmail: '',
            initialPhoneNumber: '',
            isDuplicateEmail: false,
            isDuplicatePhone: false,
            isInputClear: false,
            isBirthDateInvalid: false,
            lastName: null,
            phoneNumber: null,
            phoneType: null,
            secondLastName: null
        };
    },
    computed: {
        ...mapState('email', ['isItDuplicateEmail']),

        countryCode() {
            return getCountryCode(this.$env.Country)?.toLowerCase();
        },
        emailAriaDescribedby() {
            if(this.$v.emailValue.$error) return `${this.formId}-emailErrorMsg`;
            else if(this.isDuplicateEmail) return `${this.formId}-duplicateEmailErrorMsg`;
        },
        getInitialPhoneType() {
            return (
                this.preFilledData?.PhoneType ||
                this.transformedPhoneTypeValues[0]
            );
        },
        isBirthDateRequired() {
            return this.labels?.BirthDate?.Required || false;
        },
        phoneNumberAriaDescribedby() {
            if(this.$v.phoneNumber.$error) return `${this.formId}-phoneNumberErrorMsg`;
            else if(this.isDuplicatePhone) return `${this.formId}-duplicatePhoneNumberErrorMsg`;
        },
        phoneNumberErrorVisible() {
            return this.$v.phoneNumber.$error || this.isDuplicatePhone;
        },
        phoneNumberErrorMessage() {
            if(this.$v.phoneNumber.$error) {
                return this.determinePhoneNumberErrorMsg(); // e.g., "Phone number is invalid"
            } else if(this.isDuplicatePhone) {
                return this.labels.Phone.DuplicateErrorMessage;
            }
            return '';
        },
        requiredSpan() {
            return `<span>*</span>`;
        },
        transformedPhoneTypeOptions() {
            return this.labels?.ValidPhoneTypes?.map(phone => phone.Text);
        },
        transformedPhoneTypeValues() {
            return this.labels?.ValidPhoneTypes?.map(phone => phone.Type);
        },
        // Update Username when user edits email/phone if it was same as Username type
        userName() {
            if(formHelper.isValidEmail(this.preFilledData?.Username)) {
                return this.emailValue;
            } else {
                return this.phoneNumber;
            }
        },
        isEurope() {
            return [
                'UnitedKingdom',
                'Poland',
                'Netherlands',
                'Germany',
                'Austria',
                'Lithuania',
                'Latvia',
                'Ireland',
                'Spain',
                'Luxembourg',
                'Belgium',
                'Estonia',
                'Finland',
                'Hungary'
            ].includes(this.$env?.Country);
        }
    },
    watch: {
        // Clear the form fields when the accordion is collapsed
        // Not applicable to self-form
        isCollapseOpen(newVal) {
            this.isInputClear = !newVal;
        },
        isInputClear(newVal) {
            if(newVal) {
                this.$v.$reset();
                this.isDuplicatePhone = false;
                this.isDuplicateEmail = false;
                this.firstName = '';
                this.initial = '';
                this.emailValue = '';
                this.phoneNumber = '';
                this.lastName = '';
                this.updateFullName();
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.emailValue = this.preFilledData?.Email;
            this.firstName = this.preFilledData?.FirstName;
            this.initial = this.preFilledData?.MiddleName;
            this.lastName = this.preFilledData?.LastName;
            this.secondLastName = this.preFilledData?.SecondLastName;
            this.phoneNumber = this.preFilledData?.PhoneNumber;

            // Store initial values
            this.initialEmail = this.preFilledData?.Email;
            this.initialPhoneNumber = this.preFilledData?.PhoneNumber;
        });
    },
    methods: {
        ...mapActions('email', ['getEmailIsDuplicate']),
        ...mapActions('phoneNumber', ['getPhoneIsDuplicate']),
        isDigitOnly (value) {
            return /^[0-9]*$/.test(value);
        },
        convertPhoneNumberToDigitsOnly(phoneNumber) {
            return phoneNumber.replace(/[\s.-.()-]?/g, '').trim();
        },
        determineEmailErrorMsg() {
            if(this.$v.emailValue.required === false) return this.labels?.Email?.RequiredErrorMessage;
            else if(this.$v.emailValue.email === false) return this.labels?.Email?.InvalidErrorMessage;
        },
        determinePhoneNumberErrorMsg() {
            if(this.$v.phoneNumber.required === false) return this.labels?.Phone?.RequiredErrorMessage;
            else if((this.countryCode === 'au' || this.countryCode === 'nz') && this.isDigitOnly(this.phoneNumber) === false) return this.labels?.Phone?.DigitOnlyErrorMessage;
            else if(this.$v.phoneNumber.phone === false) return this.labels?.Phone?.InvalidErrorMessage;
        },
        resetDuplicatePhoneFlag() {
            this.isDuplicatePhone = false;
        },
        setBirthDate(birthDate, bool) {
            this.birthDate = birthDate;
            this.isBirthDateInvalid = bool;
        },
        setFormValidations() {
            eventBus.$on('validate', () => {
                // Validate if the form is in open state
                if(this.isCollapseOpen) {
                    this.$v.$touch();
                    this.hasValidationBeenTriggered = true;
                    if(this.formForSelfInfo) this.$refs.birthDateSelector.validateBirthDate();
                    if(
                        // Validate form fields
                        // Validate if email and phone are not duplicate
                        // Validate if birthdate is applicable and valid
                        !this.$v.$invalid &&
                        !(this.isDuplicateEmail || this.isDuplicatePhone) &&
                        ((this.formForSelfInfo && !this.isBirthDateInvalid) ||
                            !this.formForSelfInfo)
                    ) {
                        // Params required to be posted
                        const formInputs = this.formForSelfInfo
                            ? {
                                BirthDate: this.birthDate || null,
                                Email: this.emailValue,
                                FirstName: this.firstName,
                                LastName: this.lastName,
                                MiddleNameInitials: this.initial,
                                Phone: this.convertPhoneNumberToDigitsOnly(this.phoneNumber),
                                PhoneType: this.$refs[
                                    `${this.formId}-phonetype`
                                ].selectedVal,
                                SecondLastName: this.secondLastName,
                                UserName: this.userName
                            }
                            : {
                                Spouse: {
                                    Email: this.emailValue,
                                    FirstName: this.firstName,
                                    LastName: this.lastName,
                                    SecondLastName: this.secondLastName,
                                    MiddleNameInitials: this.initial,
                                    Phone: this.convertPhoneNumberToDigitsOnly(this.phoneNumber),
                                    PhoneType: this.$refs[
                                        `${this.formId}-phonetype`
                                    ].selectedVal
                                }
                            };
                        eventBus.$emit('getInput', formInputs, true);
                    } else eventBus.$emit('getInput', false, false);
                } else eventBus.$emit('getInput', false, true); // Set valid to true if form is not open
            });
        },
        setValue(item, value) {
            this[item] = value;
        },
        updateFullName() {
            let initial = this.initial;
            if(this.$env?.Country === 'Mexico') {
                initial = '';
            }
            const fullName =
                    this.firstName && this.lastName
                        ? initial
                            ? `${this.firstName} ${initial} ${this.lastName}${
                                this.secondLastName
                                    ? ' ' + this.secondLastName
                                    : ''
                            }`
                            : `${this.firstName} ${this.lastName}${
                                this.secondLastName
                                    ? ' ' + this.secondLastName
                                    : ''
                            }`
                        : '';
            // emit for other components to update the full name
            eventBus.$emit('updateFullName', this.formForSelfInfo, fullName);
        },
        async validateEmail(emailValue) {
            // Skip validation if email is same as initial prefilled email
            if(emailValue === this.initialEmail) {
                this.isDuplicateEmail = false;
                return;
            }

            await this.getEmailIsDuplicate(emailValue);
            this.isDuplicateEmail = this.isItDuplicateEmail;
        },
        async validatePhoneNumber(phoneValue) {
            // Skip validation if phone is same as initial prefilled phone
            if(phoneValue === this.initialPhoneNumber) {
                this.isDuplicatePhone = false;
                return;
            }
            const { data, success } = await this.getPhoneIsDuplicate(
                this.convertPhoneNumberToDigitsOnly(phoneValue)
            );
            if(success && data?.Success) {
                this.isDuplicatePhone = data?.Data;
            } else {
                console.error(
                    'An error occurred:',
                    data?.ErrorMessages
                );
            }
        }
    }
};

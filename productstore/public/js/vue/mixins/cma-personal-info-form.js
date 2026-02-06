import eventBus from './event-bus';
import formHelper from '@common/source/js/vue/utils/form-helper';
import getCountryCode from '@common/source/js/utils/get-country-code';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { mapActions, mapState } from 'vuex';

const MEMBERSHIP_TYPE_PREFERRED = 'preferred';

export default {
    mixins: [validationMixin],
    validations() {
        const validations = {};
        validations.confirmPasswordValue = {
            required,
            match: confirmPassword => {
                if(confirmPassword === null) return false;
                return confirmPassword === this.passwordValue;
            }
        };
        validations.emailValue = {
            required,
            email: email => {
                if(email === null) return false;
                return formHelper.isValidEmail(email);
            }
        };
        validations.firstName = {
            required
        };
        validations.lastName = {
            required
        };
        validations.passwordValue = {
            required,
            password: password => {
                if(password === null) return false;
                return this.password.passedCriteria;
            }
        };
        validations.phoneNumber = {
            required,
            phone: phoneNumber => {
                if(phoneNumber === null) return false;

                return this.validatePhoneByCountry(phoneNumber);
            }
        };
        validations.username = {
            required,
            username: username => {
                if(username === null) return false;
                const isPhoneValid = this.validatePhoneByCountry(username);
                return (
                    isPhoneValid ||
                formHelper.isValidEmail(username)
                );
            }
        };

        return validations;
    },
    props: {
        labels: {
            type: Object,
            default: () => ({})
        },
        prospectiveCustomerData: {
            type: Object,
            default: () => ({
                CustomerType: '',
                Email: {
                    Id: '1',
                    Value: '',
                    IsDefault: true,
                    IdenType: ''
                },
                FirstName: '',
                LastName: '',
                SecondLastName: '',
                PhoneNumber: {
                    Id: '2',
                    Value: '',
                    IsDefault: false,
                    IdenType: ''
                },
                Region: ''
            })
        },
        title: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            birthDate: null,
            confirmPassword: {
                id: 'confirmPassword',
                name: 'confirmPassword',
                minLength: 1,
                maxLength: 100,
                passedCriteria: false
            },
            confirmPasswordValue: '',
            customerType: null,
            defaultUsername: '',
            email: {
                id: 'email',
                name: 'email',
                required: true
            },
            emailValue: '',
            firstName: null,
            hasValidationBeenTriggered: false,
            isDuplicateEmail: false,
            isDuplicatePhone: false,
            isBirthDateInvalid: false,
            initial: null,
            lastName: null,
            secondLastName: '',
            password: {
                id: 'password',
                name: 'password',
                minLength: 1,
                maxLength: 100,
                passedCriteria: false
            },
            passwordValue: '',
            phoneType: null,
            phoneNumber: null,
            selectedCulture: null,
            settingInitialData: false,
            triggerValue: null,
            username: null
        };
    },
    computed: {
        ...mapState('email', ['isItDuplicateEmail']),

        confirmPasswordAttributes() {
            return {
                id: this.confirmPassword.id,
                maxlength: this.confirmPassword.maxLength,
                minlength: this.confirmPassword.minLength,
                name: this.confirmPassword.name,
                placeholder: this.labels?.ConfirmPassword?.Placeholder,
                'aria-required': true,
                'aria-invalid': this.$v.confirmPasswordValue.$error,
                'aria-describedby': this.$v.confirmPasswordValue.$error
                    ? 'confirmPasswordErrorMsg'
                    : null
            };
        },
        countryCode() {
            return getCountryCode(this.$env.Country)?.toLowerCase();
        },
        culturesDataArray() {
            return this.labels?.ValidRegions || [];
        },
        emailAriaDescribedby() {
            if(this.$v.emailValue.$error) return 'emailErrorMsg';
            else if(this.isDuplicateEmail) return 'duplicateEmailErrorMsg';
        },
        getInitialCulture() {
            return (
                this.prospectiveCustomerData?.Region ||
                this.labels?.ValidRegions.map(object => object.Culture)[0]
            );
        },
        getInitialCustomerType() {
            return (
                this.prospectiveCustomerData?.CustomerType ||
                this.transformedCustomerTypeValues[0]
            );
        },
        getInitialPhoneType() {
            return (
                this.prospectiveCustomerData?.PhoneNumber?.IdenType ||
                this.transformedPhoneTypeValues[0]
            );
        },
        getInitialUsername() {
            if(
                this.prospectiveCustomerData?.Email?.IsDefault &&
                this.prospectiveCustomerData?.Email?.Value
            ) {
                return this.prospectiveCustomerData?.Email?.Value;
            }
            if(
                this.prospectiveCustomerData?.PhoneNumber?.IsDefault &&
                this.prospectiveCustomerData?.PhoneNumber?.Value
            ) {
                return this.prospectiveCustomerData?.PhoneNumber?.Value;
            }
            return null;
        },
        isBirthDateRequired() {
            return this.labels?.BirthDate?.Required || false;
        },
        passwordAttributes() {
            return {
                Criteria: this.passwordCriteria,
                id: this.password.id,
                maxlength: this.password.maxLength,
                minlength: this.password.minLength,
                name: this.password.name,
                placeholder: this.labels?.Password?.Placeholder,
                'aria-required': true,
                'aria-invalid': this.$v.passwordValue.$error,
                'aria-describedby': this.$v.passwordValue.$error
                    ? 'passwordErrorMsg'
                    : null
            };
        },
        passwordCriteria() {
            return {
                case: this.labels?.PasswordCriteria?.Case,
                qtityChar: this.labels?.PasswordCriteria?.QtityChar,
                number: this.labels?.PasswordCriteria?.Number,
                title: this.labels?.PasswordCriteria?.Title
            };
        },
        phoneNumberAriaDescribedby() {
            if(this.$v.phoneNumber.$error) return 'phoneNumberErrorMsg';
            else if(this.isDuplicatePhone) return 'duplicatePhoneNumberErrorMsg';
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
        transformedCustomerTypeOptions() {
            return this.labels?.ValidCustomerTypes?.map(
                customer => customer.Text
            );
        },
        transformedCustomerTypeValues() {
            return this.labels?.ValidCustomerTypes?.map(
                customer => customer.Type
            );
        },
        transformedPhoneTypeOptions() {
            return this.labels?.ValidPhoneTypes?.map(phone => phone.Text);
        },
        transformedPhoneTypeValues() {
            return this.labels?.ValidPhoneTypes?.map(phone => phone.Type);
        },
        usernameAriaDescribedby() {
            if(this.$v.username.$error) return 'usernameErrorMsg';
            else if(this.isDuplicatePhone) return 'duplicateUsernamePhoneNumberErrorMsg';
            else if(this.isDuplicateEmail) return 'duplicateUsernameEmailErrorMsg';
        }
    },
    watch: {
        customerType(newVal, oldVal) {
            if(oldVal != null) {
                const customerTypeText =
                    this.labels?.ValidCustomerTypes?.filter(type => type.Type === newVal)[0].Text;
                this.pushToDataLayer(customerTypeText);
            }
        }
    },
    mounted() {
        this.settingInitialData = true;
        this.$nextTick(() => {
            this.settingInitialData = false;
            this.defaultUsername = this.prospectiveCustomerData?.Email?.IsDefault
                ? 'email'
                : 'phone';
            this.emailValue = this.prospectiveCustomerData?.Email?.Value;
            this.phoneNumber = this.prospectiveCustomerData?.PhoneNumber?.Value;
            this.username = this.getInitialUsername;
            this.selectedCulture = this.getInitialCulture;
        });
    },
    methods: {
        ...mapActions('email', ['getEmailIsDuplicate']),
        ...mapActions('phoneNumber', ['getPhoneIsDuplicate']),
        isDigitOnly (value) {
            return /^[0-9]*$/.test(value);
        },
        // Set username as email / phone number if confirm is selected on modal
        confirmUserName(isModalTriggerOnEmail) {
            if(isModalTriggerOnEmail) {
                this.username = this.emailValue;
            } else {
                this.username = this.phoneNumber;
            }
        },
        convertPhoneNumberToDigitsOnly(phoneNumber) {
            return phoneNumber.replace(/[\s.-.()-]?/g, '').trim();
        },
        isValueDifferentThanUsername(value) {
            return value !== this.username;
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
        handlePasswordCriteria(isValid) {
            this.password.passedCriteria = isValid;
        },
        isInputDuplicateEmail(username) {
            return this.isDuplicateEmail && formHelper.isValidEmail(username);
        },
        isInputDuplicatePhone(username) {
            return (
                this.isDuplicatePhone && this.validatePhoneByCountry(username)
            );
        },
        pushToDataLayer(eL) {
            window.dataLayer && window.dataLayer.push({
                event: 'userEvent',
                eC: 'Enrollment Funnel',
                eA: 'CTA',
                eL: eL
            });
        },
        resetCustomerType() {
            const preferredType = this.labels?.ValidCustomerTypes?.find(
                customerType => customerType.Type.toLowerCase() === MEMBERSHIP_TYPE_PREFERRED
            );
            this.$refs['customerType'].selectedVal = preferredType.Type;
        },
        // Reset username as email / phone number if cancel is selected on modal
        resetEmailOrPhoneField(isModalTriggerOnEmail) {
            if(isModalTriggerOnEmail) {
                this.emailValue =
                    this.isValueDifferentThanUsername(this.emailValue)
                        ? this.prospectiveCustomerData?.Email?.Value
                        : this.username;
            } else {
                this.phoneNumber =
                    this.isValueDifferentThanUsername(this.phoneNumber)
                        ? this.prospectiveCustomerData?.PhoneNumber?.Value
                        : this.username;
            }
        },
        resetDuplicatePhoneFlag() {
            this.isDuplicatePhone = false;
        },
        setBirthDate(birthDate, bool) {
            this.birthDate = birthDate;
            this.isBirthDateInvalid = bool;
        },
        setCustomerType(event) {
            if(event.value) {
                this.customerType = event.value;
                this.$emit('setCustomerType', this.customerType);
            }
        },
        setSelectedCulture(cultureSelected) {
            if(cultureSelected !== this.selectedCulture) {
                this.selectedCulture = cultureSelected;

                const regionText =
                    this.labels?.ValidRegions?.filter(region => region.Culture === cultureSelected)[0].Text;
                this.pushToDataLayer(regionText);

                const url = new URL(window.location.href);
                url.searchParams.set('sc_lang', cultureSelected);
                window.location.href = url.toString();
            }
        },
        setValue(item, value) {
            this[item] = value;
        },
        showUpdateUsernameModal(value) {
            this.triggerValue = value;
            this.$modal.show({ id: 'confirm-update-username' });
        },
        validatePhoneByCountry(phoneNumber) {
            if(this.countryCode && (this.countryCode === 'au' || this.countryCode === 'nz')) {
                return formHelper.isValidPhoneNumberByPhoneType(
                    phoneNumber,
                    this.countryCode,
                    this.$refs['phoneType'].selectedVal
                );
            }

            return formHelper.isValidPhoneNumber(
                phoneNumber,
                this.countryCode
            );
        },
        validateAndUpdateUserName(username) {
            // Set default username type - email or phone number - and validate input
            if(formHelper.isValidEmail(username)) {
                this.defaultUsername = 'email';
                this.validateEmail(username);
            } else if(this.validatePhoneByCountry(username)) {
                this.defaultUsername = 'phone';
                this.validatePhoneNumber(username);
            } else this.$v.username.$touch();
        },
        async validateEmail(emailValue) {
            if(
                this.defaultUsername === 'email' &&
                formHelper.isValidEmail(emailValue) &&
                this.isValueDifferentThanUsername(emailValue)
            ) {
                this.$emit('showUpdateUsernameModal', 'emailField');
            } else this.$v.emailValue.$touch();
            await this.getEmailIsDuplicate(emailValue);
            this.isDuplicateEmail = this.isItDuplicateEmail;
        },
        async validatePhoneNumber(phoneValue) {
            if(
                this.defaultUsername === 'phone' &&
                this.validatePhoneByCountry(phoneValue) &&
                this.isValueDifferentThanUsername(phoneValue)
            ) {
                this.$emit('showUpdateUsernameModal', 'phoneField');
            } else this.$v.phoneNumber.$touch();
            const { data, success } = await this.getPhoneIsDuplicate(this.convertPhoneNumberToDigitsOnly(phoneValue));
            if(success && data?.Success) {
                this.isDuplicatePhone = data?.Data;
            } else {
                console.error(
                    'An error occurred:',
                    data?.ErrorMessages
                );
            }
        },
        setFormValidations() {
            eventBus.$on('validate', () => {
                this.$v.$touch();
                this.hasValidationBeenTriggered = true;
                this.$refs.birthDateSelector.validateBirthDate();
                if(
                    !this.$v.$invalid &&
                    !(this.isDuplicateEmail || this.isDuplicatePhone || this.isBirthDateInvalid)
                ) {
                    // Params required to be posted
                    const personalInfo = {
                        BirthDate: this.birthDate || null,
                        ConfirmPassword: this.confirmPasswordValue,
                        CustomerStatus: this.customerType,
                        Email: this.emailValue,
                        FirstName: this.firstName,
                        MiddleNameInitials: this.initial,
                        LastName: this.lastName,
                        SecondLastName: this.secondLastName,
                        Password: this.passwordValue,
                        Phone: this.convertPhoneNumberToDigitsOnly(this.phoneNumber),
                        PhoneType: this.$refs['phoneType'].selectedVal,
                        Region: this.selectedCulture,
                        Username: this.username
                    };
                    eventBus.$emit('getInput', personalInfo, true);
                } else {
                    eventBus.$emit('getInput', false, false);
                }
            });
        }
    }
};

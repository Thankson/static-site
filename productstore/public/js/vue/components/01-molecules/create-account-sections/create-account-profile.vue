<template>
    <div class="m-createAccountSection">
        <h2 class="m-createAccountSection__title">{{ title }}</h2>

        <div class="m-createAccountSection__row">
            <!-- First Name -->
            <div class="m-createAccountSection__col -firstName m-formField -text">
                <label
                    class="m-formField__label uppercase"
                    :for="firstName.id"
                    v-html="firstName.label">
                </label>
                <v-input
                    :id="firstName.id"
                    ref="firstName"
                    v-model="firstNameValue"
                    auto-complete="off"
                    :name="firstName.name"
                    :max-length="firstName.maxLength"
                    :min-length="firstName.minLength"
                    :placeholder="firstName.placeholder"
                    :tailwind-mods="$v.firstNameValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue('ContactInfo.FirstName', 'firstName')"
                    @input="updateModel('firstNameValue')"
                    @blur="handleBlur('firstNameValue')">
                </v-input>

                <div v-if="$v.firstNameValue.$error" :id="`${firstName.id}-error`" class="e-formError">
                    <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(firstName.labelKey)"></p>
                </div>
            </div>

            <!-- Last Name -->
            <div class="m-createAccountSection__col -lastName m-formField -text">
                <label
                    class="m-formField__label uppercase"
                    :for="lastName.id"
                    v-html="lastName.label">
                </label>
                <v-input
                    :id="lastName.id"
                    ref="lastName"
                    v-model="lastNameValue"
                    auto-complete="off"
                    :name="lastName.name"
                    :max-length="lastName.maxLength"
                    :min-length="lastName.minLength"
                    :placeholder="lastName.placeholder"
                    :tailwind-mods="$v.lastNameValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue('ContactInfo.LastName', 'lastName')"
                    @input="updateModel('lastNameValue')"
                    @blur="handleBlur('lastNameValue')">
                </v-input>

                <div v-if="$v.lastNameValue.$error" :id="`${lastName.id}-error`" class="e-formError">
                    <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(lastName.labelKey)"></p>
                </div>
            </div>

            <!-- Last Name 2 - MX only -->
            <div v-if="isMX" class="m-createAccountSection__col -lastName m-formField -text" :class="{'-isMX': isMX}">
                <label
                    class="m-formField__label uppercase"
                    :for="lastName2.id"
                    v-html="lastName2.label">
                </label>
                <v-input
                    :id="lastName2.id"
                    ref="lastName2"
                    v-model="lastName2Value"
                    auto-complete="off"
                    :name="lastName2.name"
                    :max-length="lastName2.maxLength"
                    :min-length="lastName2.minLength"
                    :placeholder="lastName2.placeholder"
                    :tailwind-mods="$v.lastName2Value.$error ? '-isInvalid' : null"
                    :value="getInitialValue('ContactInfo.LastName2', 'lastName2')"
                    @input="updateModel('lastName2Value')"
                    @blur="handleBlur('lastName2Value')">
                </v-input>

                <div v-if="$v.lastName2Value.$error" :id="`${lastName2.id}-error`" class="e-formError">
                    <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(lastName2.labelKey)"></p>
                </div>
            </div>

            <!-- E-mail -->
            <div class="m-createAccountSection__col -email m-formField -text" :class="{'-isMX': isMX}">
                <label
                    class="m-formField__label uppercase"
                    :for="email.id"
                    v-html="email.label">
                </label>
                <v-input
                    :id="email.id"
                    ref="email"
                    v-model="emailValue"
                    auto-complete="off"
                    :name="email.name"
                    :max-length="email.maxLength"
                    :min-length="email.minLength"
                    :placeholder="email.placeholder"
                    :tailwind-mods="$v.emailValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue('ContactInfo.Email.Value', 'email')"
                    @input="updateModel('emailValue')"
                    @blur="[handleBlur('emailValue'), handleUsername()]">
                </v-input>

                <div v-if="$v.emailValue.$error" :id="`${email.id}-error`" class="e-formError">
                    <p class="e-formError__item pb-0 block" role="alert" v-html="getFieldError(email.labelKey)"></p>
                </div>
            </div>

            <!-- Phone -->
            <div class="m-createAccountSection__col -phone m-formField -text" :class="{'-isMX': isMX}">
                <label
                    class="m-formField__label uppercase"
                    :for="phone.id"
                    v-html="phone.label">
                </label>
                <v-input
                    :id="phone.id"
                    ref="phone"
                    v-model="phoneValue"
                    auto-complete="off"
                    :name="phone.name"
                    :max-length="phone.maxLength"
                    :min-length="phone.minLength"
                    :placeholder="phone.placeholder"
                    :tailwind-mods="$v.phoneValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue('ContactInfo.PhoneNumber.Value', 'phone')"
                    @input="updateModel('phoneValue')"
                    @blur="handleBlur('phoneValue')">
                </v-input>

                <div v-if="$v.phoneValue.$error" :id="`${phone.id}-error`" class="e-formError">
                    <p class="e-formError__item pb-0 block" role="alert" v-html="getFieldError(phone.labelKey)"></p>
                </div>
            </div>
        </div>

        <div v-if="hasUsername" class="m-createAccountSection__row">
            <!-- Username -->
            <div class="m-createAccountSection__col md:w-1_2 m-formField -text">
                <label
                    class="m-formField__label uppercase"
                    :for="username.id"
                    v-html="username.label">
                </label>
                <v-input
                    :id="username.id"
                    ref="username"
                    v-model="usernameValue"
                    auto-complete="off"
                    :name="username.name"
                    :max-length="username.maxLength"
                    :min-length="username.minLength"
                    :placeholder="username.placeholder"
                    :tailwind-mods="$v.usernameValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue('ContactInfo.Email.Value', 'username')"
                    @input="updateModel('usernameValue')"
                    @blur="handleBlur('usernameValue')">
                </v-input>

                <div v-if="$v.usernameValue.$error" :id="`${username.id}-error`" class="e-formError">
                    <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(username.labelKey)"></p>
                </div>
            </div>

            <!-- Password / Password Confirmation -->
            <div class="m-createAccountSection__col w-full md:w-1_2 pr-0">
                <!-- Password -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label uppercase"
                        :for="password.id"
                        v-html="password.label">
                    </label>
                    <a-input-glimpse
                        ref="password"
                        :attributes="{
                            'Id': password.id,
                            'Name': password.name,
                            'MinLength': password.minLength,
                            'MaxLength': password.maxLength,
                            'Placeholder': password.placeholder,
                            'Criteria': passwordCriteria
                        }"
                        :init-hidden="true"
                        :show-label="getLabels(localization, 'Labels.ProfileSection.ShowPassword')"
                        :hide-label="getLabels(localization, 'Labels.ProfileSection.HidePassword')"
                        autocomplete="off"
                        :input-classname="$v.passwordValue.$error ? '-isInvalid a-input -text text-sm' : 'a-input -text text-sm'"
                        :has-criteria="true"
                        @passCriteria="handlePasswordCriteria"
                        @input="(value) => updateModel({
                            model: 'passwordValue',
                            value: value,
                            validate: true
                        })"
                        @blur="handleBlur('passwordValue')">
                    </a-input-glimpse>
                    <div v-if="$v.passwordValue.$error" :id="`${password.id}-error`" class="e-formError">
                        <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(password.labelKey)"></p>
                    </div>
                </div>

                <!-- Confirm Password -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label uppercase"
                        :for="confirmPassword.id"
                        v-html="confirmPassword.label">
                    </label>
                    <a-input-glimpse
                        ref="confirmPassword"
                        :attributes="{
                            'Id': confirmPassword.id,
                            'Name': confirmPassword.name,
                            'MinLength': confirmPassword.minLength,
                            'MaxLength': confirmPassword.maxLength,
                            'Placeholder': confirmPassword.placeholder
                        }"
                        :init-hidden="true"
                        :show-label="getLabels(localization, 'Labels.ProfileSection.ShowPassword')"
                        :hide-label="getLabels(localization, 'Labels.ProfileSection.HidePassword')"
                        autocomplete="off"
                        :input-classname="$v.confirmPasswordValue.$error ? '-isInvalid a-input -text text-sm' : 'a-input -text text-sm'"
                        @input="(value) => updateModel({
                            model: 'confirmPasswordValue',
                            value: value,
                            validate: true
                        })"
                        @blur="handleBlur('confirmPasswordValue')">
                    </a-input-glimpse>
                    <div v-if="$v.confirmPasswordValue.$error" :id="`${confirmPassword.id}-error`" class="e-formError">
                        <p class="e-formError__item pb-0" role="alert" v-html="getFieldError(confirmPassword.labelKey)"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import createAccountMixin from '../../../mixins/create-account';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';

    export default {
        name: 'MCreateAccountProfile',
        components: {
            vInput
        },
        mixins: [ labels, createAccountMixin, validationMixin ],
        validations() {
            return {
                // First Name Validation Settings
                firstNameValue: {
                    required,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.firstName.minLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.firstName.maxLength;
                    }
                },

                // Last Name Validation Settings
                lastNameValue: {
                    required,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.lastName.minLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.lastName.maxLength;
                    }
                },

                // Last Name 2 Validation Settings
                lastName2Value: {
                    required,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.lastName2.minLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.lastName2.maxLength;
                    }
                },

                // Email Validation Settings
                emailValue: {
                    required,
                    email: value => {
                        if(value === null) return false;
                        return this.isValidEmail(value);
                    },
                    alreadyexists: value => {
                        if(value && this.storedGuestUserValidation && this.storedGuestUserValidate) {
                            return this.storedGuestUserValidation.EmailValid === true;
                        } else {
                            return true;
                        }
                    }
                },

                // Phone Validation Settings
                phoneValue: {
                    required,
                    phone: value => {
                        if(value === null) return false;
                        return this.isValidPhoneNumber(value);
                    },
                    alreadyexists: value => {
                        if(value && this.storedGuestUserValidation && this.storedGuestUserValidate) {
                            return this.storedGuestUserValidation.PhoneValid === true;
                        } else {
                            return true;
                        }
                    }
                },

                // Username Validation Settings
                usernameValue: {
                    required,
                    username: value => {
                        if(value === null) return false;
                        // Accepts email or mobile number without mask
                        return this.isValidEmail(value) || (this.isValidPhoneNumber(value) && this.isInt(value));
                    }
                },

                // Password Validation Settings
                passwordValue: {
                    required,
                    password: value => {
                        if(value === null) return false;
                        return this.password.passedCriteria;
                    }
                },

                // ConfirmPassword Validation Settings
                confirmPasswordValue: {
                    required,
                    match: value => {
                        if(value === null) return false;
                        return value === this.passwordValue;
                    }
                }
            };
        },
        props: {
            title: {
                type: String,
                default: null
            },
            hasUsername: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                sectionName: 'profile',

                // First Name Field
                firstName: {
                    id: 'firstname',
                    name: 'firstname',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.FirstName', 'FirstName'),
                    labelKey: 'FirstName'
                },
                firstNameValue: '',

                // Last Name Field
                lastName: {
                    id: 'lastname',
                    name: 'lastname',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.LastName', 'LastName'),
                    labelKey: 'LastName'
                },
                lastNameValue: '',

                // Last Name 2 Field
                lastName2: {
                    id: 'lastname2',
                    name: 'lastname2',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.LastName2', 'LastName2'),
                    labelKey: 'LastName2'
                },
                lastName2Value: '',

                // Email Field
                email: {
                    id: 'email',
                    name: 'email',
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.Email', 'Email'),
                    labelKey: 'Email'
                },
                emailValue: '',

                // Phone Field
                phone: {
                    id: 'phone',
                    name: 'phone',
                    placeholder: null,
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.Phone', 'Phone'),
                    labelKey: 'Phone'
                },
                phoneValue: '',

                // Username Field
                username: {
                    id: 'username',
                    name: 'username',
                    placeholder: this.getLabels(this.localization, 'Labels.ProfileSection.UsernamePlaceholder'),
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.Username', 'Username'),
                    labelKey: 'Username'
                },
                usernameValue: '',

                // Password Field
                password: {
                    id: 'password',
                    name: 'password',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: this.getLabels(this.localization, 'Labels.ProfileSection.PasswordPlaceholder'),
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.Password', 'Password'),
                    labelKey: 'Password',
                    passedCriteria: false
                },
                passwordValue: '',

                // Confirm Password Field
                confirmPassword: {
                    id: 'confirmPassword',
                    name: 'confirmPassword',
                    minLength: 1,
                    maxLength: 100,
                    placeholder: this.getLabels(this.localization, 'Labels.ProfileSection.ConfirmPasswordPlaceholder'),
                    label: this.getLabels(this.localization, 'Labels.ProfileSection.ConfirmPassword', 'ConfirmPassword'),
                    labelKey: 'ConfirmPassword'
                },
                confirmPasswordValue: ''
            };
        },
        computed: {
            ...mapState('guest', ['storedGuestUserValidation', 'storedGuestUserValidate']),

            passwordCriteria() {
                return {
                    case: this.getLabels(this.localization, 'Labels.ProfileSection.PasswordCriteria.Case', 'Case'),
                    number: this.getLabels(this.localization, 'Labels.ProfileSection.PasswordCriteria.Number', 'Number'),
                    qtityChar: this.getLabels(this.localization, 'Labels.ProfileSection.PasswordCriteria.QtityChar', 'QtityChar'),
                    title: this.getLabels(this.localization, 'Labels.ProfileSection.PasswordCriteria.Title', 'Title')
                };
            }
        },
        methods: {
            handlePasswordCriteria(isValid) {
                this.password.passedCriteria = isValid;

                this.applyValidation('passwordValue');

                if(this.confirmPasswordValue) {
                    this.applyValidation('confirmPasswordValue');
                }
            },
            handleUsername() {
                // If the email is valid and there's no username, then fills the username with the email
                if(this.emailValue && !this.$v.emailValue.$error && !this.usernameValue) {
                    this.usernameValue = this.emailValue;
                    this.updateModel('usernameValue');
                }
            }
        }
    };
</script>

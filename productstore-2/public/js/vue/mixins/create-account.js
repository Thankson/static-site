import { mapState } from 'vuex';
import replaceToken from '@common/source/js/vue/utils/replace-token';
import regexParser from 'regex-parser';
import { get } from 'lodash';

export default {
    computed: {
        ...mapState('guest', ['storedGuestFEError', 'storedGuestApiError', 'storedGuestApiLoading', 'storedGuest']),

        allowedKeys() {
            return [8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46, 91, 92, 93, 144, 182, 183];
        },
        errorMessages() {
            return this.localization?.Labels?.ErrorMessages || {};
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
        lang() {
            const langCode = this.localization?.Data?.Culture;
            let language = 'en-US';

            if(langCode) {
                language = langCode;

                if(!['en-us', 'es-us', 'en-ca', 'fr-ca', 'es-mx'].includes(language.toLowerCase())) {
                    language = 'en-US';
                }
            }

            return language;
        },
        feListError() {
            return this.storedGuestFEError;
        },
        listError() {
            let errors = [];

            if(this.storedGuestApiError?.length) {
                errors = errors.concat(this.storedGuestApiError);
            }

            if(this.feListError?.length) {
                errors = errors.concat(this.feListError);
            }

            return errors;
        }
    },
    methods: {
        getInitialValue(storePath, data) {
            const model = `${data}Value`;
            const current = this[model];
            const stored = get(this.storedGuest, storePath, current);

            // If there's some value in the store, but there's no value in the model, then fills with store value
            if(stored && !current && this[data] && !this[data].storeChecked) {
                this[data].storeChecked = true;
                this[model] = stored;
            }

            return this[model];
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
        applyValidation(model) {
            if(typeof this[model] !== 'undefined') {
                if(this.$v[model]) {
                    // Apply validation
                    this.$v[model].$touch();

                    // Display error messages
                    this.handleValidationError(model, this.$v[model]);
                }
            }
        },
        handleBlur(model) {
            this.applyValidation(model);
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
        handleValidationError(input, validation, section) {
            try {
                let arrTypes = [];
                let activeInput = null;
                let model = null;
                let field = null;

                if(!section) {
                    section = this.sectionName;
                }

                if(validation) {
                    // Define input model
                    model = input.replace('Value', '');

                    // Get input object
                    field = this[model] ? this[model] : null;

                    // If the input object is null, then use $refs
                    if(!field && this.$refs[section]) {
                        field = this.$refs[section][model] || null;
                    }

                    // Define input validations type
                    arrTypes = Object.keys(validation);
                    arrTypes = arrTypes.filter(key => key.indexOf('$') === -1);

                    // Define final input object
                    activeInput = {
                        input: model,
                        label: field?.label || 'error',
                        labelKey: field?.labelKey || 'error',
                        validate: arrTypes
                    };

                    let errorObj = this.errorMessages[activeInput.labelKey] || null;
                    let msg = null;
                    let isRequired = activeInput.validate.includes('required');
                    let error = 0;
                    let key = null;

                    activeInput.validate.map(type => {
                        msg = null;

                        // Test "required" requirement first
                        if(type === 'required') {
                            // If the "required" requirement is NOT completed
                            msg = errorObj?.Required || this.replaceToken(this.errorMessages.Required, activeInput.label);

                        // If the "required" requirement is completed, then test other requirements
                        } else if(validation.required || !isRequired) {
                            // Set expected error message
                            switch (type) {
                                case 'min':
                                    key = 'MinLength';
                                    break;
                                case 'max':
                                    key = 'MaxLength';
                                    break;
                                case 'integer':
                                    key = 'Integer';
                                    break;
                                case 'alreadyexists':
                                    key = 'AlreadyExists';
                                    break;
                                default:
                                    key = 'Invalid';
                            }

                            msg = errorObj && errorObj[key] ? errorObj[key] : this.replaceToken(this.errorMessages[key], activeInput.label);
                        }

                        // If the requirement is completed, then remove the error message from Vuex Store
                        if(validation[type] !== false && msg) {
                            this.resetListErrors(msg, activeInput.labelKey);
                        } else {
                            // If the requirement is NOT completed, then add the error message to Vuex Store
                            if(msg) {
                                this.$store.commit('guest/SET_FE_ERROR', {
                                    error: msg,
                                    field: activeInput.labelKey
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
                console.log('[CreateAccountMixin] HandleValidationError - Exception:');
                console.log(e);
            }
        },
        isInt(value) {
            var er = /^-?[0-9]+$/;
            return er.test(value);
        },
        isValidEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },
        isValidPhoneNumber(phoneNumber) {
            // validate phone number
            const phoneUsCan = '/^([2-9]{1})([0-9]{2})([\\s.-]?)([2-9]{1})([0-9]{2})([\\s.-]?)([0-9]{4})$/gm';
            const phoneMx = '/^([0-9]{2,3})([\\s.-]?)([0-9]{3,4})([\\s.-]?)([0-9]{4})$/';
            const phoneCn = '/^((13[0-9])|(14[5-9])|(15([0-3]|[5-9]))|(16[6-7])|(17[1-8])|(18[0-9])|(19[1|3])|(19[5|6])|(19[8|9]))\\d{8}$/';
            const phoneLength = $.trim(phoneNumber.replace(/[\s.-.()-]?/g, '')).length;
            let chosenRegex = null;
            // Set chosen regex by country
            if(this.isCn) {
                chosenRegex = phoneCn;
            } else if(this.country === 'us' || this.country === 'ca') {
                chosenRegex = phoneUsCan;
            } else {
                chosenRegex = phoneMx;
            }
            if((!this.isCn && phoneLength !== 10) || (this.isCn && phoneLength !== 11) || !regexParser(chosenRegex).test($.trim(phoneNumber.replace(/[\s.-.()-]?/g, '')))) {
                return false;
            }
            return true;
        },
        resetListErrors(msg, field) {
            if(!msg) {
                // Clear error messages from Vuex Store
                this.$store.commit('guest/SET_FE_ERROR', {reset: true});
            } else {
                // Clear a specific error message from Vuex Store
                this.$store.commit('guest/SET_FE_ERROR', {reset: true, error: msg, field: field});
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
        updateModel(payload) {
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
                if(this.$v[model] && validate) {
                    // Apply validation
                    this.$v[model].$touch();

                    // Display error messages
                    this.handleValidationError(model, this.$v[model]);
                }

                this.$emit('update-info', {
                    model: model,
                    value: this[model]
                });
            }
        },
        sectionIsValid(section, reset = true) {
            try {
                let input = null;
                let error = false;
                let fields = [];
                let validation = null;

                if(this.$refs[section] && this.$refs[section].$refs) {
                    // Define fields for section
                    fields = Object.keys(this.$refs[section].$refs);
                }

                if(reset) {
                    // Clear FE errors
                    this.resetListErrors();
                }

                // Loop to re-check if there is some validation error in the fields
                for (let i = 0; i < fields.length; i++) {
                    // Set input ref
                    input = fields[i];

                    // Get validation variable related to input
                    validation = this.$refs[section].$refs[input].$parent.$v[input + 'Value'];

                    if(validation) {
                        // Apply validation
                        validation.$touch();

                        // Check if the field is invalid
                        if(validation.$invalid) {
                            if('required' in validation) {
                                error = true;
                                this.handleValidationError(input, validation, section);
                            } else {
                                validation.$reset();
                            }
                        }
                    }
                }

                return !error;
            } catch (e) {
                console.log('[SectionIsValidMixin] HandleSubmit - Exception:');
                console.log(e);
            }
        },
        replaceToken
    }
};

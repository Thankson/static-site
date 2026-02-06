import formHelper from '@common/source/js/vue/utils/form-helper';
import replaceToken from '@common/source/js/vue/utils/replace-token';
import experianMixin from '@common/source/js/vue/mixins/experian';
import { validationMixin } from 'vuelidate';
import { requiredIf} from 'vuelidate/lib/validators';

const EXPERIAN_DEBOUNCE_TIME = 300;

export default {
    mixins: [ experianMixin, validationMixin],
    validations() {
        return {
            address_1Data: {
                required: requiredIf(() => (this.isImea && this.labels?.Address_1?.Required) ||
                !this.optionalFields.includes('address_1')),
                characterLimit: (val) => {
                    if(!val) return true;
                    return val.length <= this.getMaxLength('address_1');
                },
                supportedCharacter: (val) => {
                    if(!val) return true;
                    return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                }
            },
            address_2Data: {
                required: requiredIf(() => (this.isImea && this.labels?.Address_2?.Required) ||
                !this.optionalFields.includes('address_2')),
                characterLimit: (val) => {
                    if(!val) return true;
                    return val.length <= this.getMaxLength('address_2');
                },
                supportedCharacter: (val) => {
                    if(!val) return true;
                    return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                }
            },
            cityData: {
                required: requiredIf(() => (this.isImea && this.labels?.City?.Required) ||
                !this.optionalFields.includes('city')),
                characterLimit: (val) => {
                    if(!val) return true;
                    return val.length <= this.getMaxLength('city');
                },
                supportedCharacter: (val) => {
                    if(!val) return true;
                    return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                }
            },
            deliveryInstructionsData: {
                required: requiredIf(() => (this.isImea && this.labels?.DeliveryInstructions?.Required) ||
                !this.optionalFields.includes('deliveryInstructions')),
                characterLimit: (val) => {
                    if(!val) return true;
                    return val.length <= this.getMaxLength('deliveryInstructions');
                },
                supportedCharacter: (val) => {
                    if(!val) return true;
                    return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                }
            },
            ...(!this.isImea && {
                nameData: {
                    required: requiredIf(() => !this.optionalFields.includes('name')),
                    supportedCharacter: (val) => {
                        if(!val) return true;
                        return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                    },
                    characterLimit: (val) => {
                        if(!val) return true;
                        return val.length <= this.getMaxLength('name');
                    }
                }
            }),
            ...(!this.isImea && {
                phoneNumberData: {
                    required: requiredIf(() => !this.optionalFields.includes('phoneNumber')),
                    characterLimit: (val) => {
                        if(!val) return true;
                        return val.length <= this.getMaxLength('phoneNumber');
                    },
                    phoneNumber: (value) => formHelper.isValidOptionalPhoneNumber(value, 'mx')
                }
            }),
            postalCodeData: {
                required: requiredIf(() => (this.isImea && this.labels?.PostalCode?.Required) ||
                !this.optionalFields.includes('postalCode')),
                characterLimit: (val) => {
                    if(!val) return true;
                    return val.length <= this.getMaxLength('postalCode');
                },
                postalCode: (val) => {
                    if(!val) return true;
                    return formHelper.isValidPostalCode(val, 'mx');
                }
            },
            stateMxData: {
                required: requiredIf(() => (this.isImea && this.labels?.State?.Required) ||
                !this.optionalFields.includes('state')),
                allowed: (value) => value !== this.stateMx[0]
            },
            suburbData: {
                required: requiredIf(() => (this.isImea && this.labels?.Suburb?.Required) ||
                !this.optionalFields.includes('suburb')),
                allowed: (value) => {
                    const hasOptions = Array.isArray(this.suburbList) && this.suburbList.length > 1;
                    if(hasOptions) {
                        const isSetToDefault = value !== this.suburbList[0];
                        return isSetToDefault;
                    }
                    return true;
                },
                characterLimit: (val) => {
                    if(!val) return true;
                    return val.length <= this.getMaxLength('suburb');
                },
                supportedCharacter: (val) => {
                    if(!val) return true;
                    return formHelper.isValidTextInputWithSpecialChar(val, 'mx');
                }
            }
        };
    },

    data() {
        return {
            addressSelectedFromModal: false,
            address_1Data: null,
            address_1DataError: null,
            address_1DataErrorMsg: null,
            address_2Data: null,
            address_2DataError: null,
            address_2DataErrorMsg: null,
            cityData: null,
            cityDataError: null,
            cityDataErrorMsg: null,
            deliveryInstructionsData: null,
            deliveryInstructionsDataError: null,
            deliveryInstructionsDataErrorMsg: null,
            experianDebounceTimer: null,
            nameData: null,
            nameDataError: null,
            nameDataErrorMsg: null,
            phoneNumberData: null,
            phoneNumberDataError: null,
            phoneNumberDataErrorMsg: null,
            postalCodeData: null,
            postalCodeDataError: null,
            postalCodeDataErrorMsg: null,
            stateMxData: null,
            stateMxDataError: null,
            stateMxDataErrorMsg: null,
            suburbData: '',
            suburbDataError: null,
            suburbDataErrorMsg: null,
            suburbList: [],
            suggestionPick: false,
            isDefaultShip: false,
            userFinalizedAddress: false, // Controls visibility of address suggestion modal
            useTabThroughSuggestions: false
        };
    },
    computed: {
        additionalDetailsForDelivery() {
            return this.labels.DeliveryInstructions?.AdditionalText;
        },
        optionalFields() {
            return ['address_2', 'address_3', 'companyName', 'deliveryInstructions'];
        },
        updatedAddress() {
            return {
                address_1Data: this.address_1Data,
                address_2Data: this.address_2Data,
                cityData: this.cityData,
                deliveryInstructionsData: this.deliveryInstructionsData,
                isDefaultShip: this.isDefaultShip,
                nameData: this.nameData,
                phoneNumberData: this.phoneNumberData,
                postalCodeData: this.postalCodeData,
                stateMxData: this.stateMxData,
                suburbData: this.suburbData
            };
        }
    },
    watch: {
        $v: {
            deep: true,
            handler() {
                const allValidatedFields = this.$v.$params;
                for (let key of Object.keys(allValidatedFields)) {
                    if(this.$v[key]) {
                        this[`${key}Error`] = this.$v[key].$error;
                    }

                    if(this[`${key}Error`]) {
                        let errorMsg;

                        if(this.$v[key].supportedCharacter === false) {
                            const inValidCharacters = formHelper.getUnsupportedCharacter(this.$v[key].$model, 'mx');
                            errorMsg = this.labels?.SpecialCharactersError?.replace('{0}', inValidCharacters);
                        } else if(this.$v[key].characterLimit === false) {
                            errorMsg = this.labels?.AllowedCharacterLengthExceeded;
                        } else if(this.$v[key].required === false || this.$v[key].allowed === false) {
                            let fieldName = this.isImea ? key.replace('Data', '') : key.replace('Data', '').replace('_', '');
                            // handle property name exceptions
                            switch (true) {
                                case fieldName.includes('state'):
                                    fieldName = 'state';
                                    break;
                            }
                            const fieldNameCapitalized =
                                fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                            // Handle both IMEA and non-IMEA error message formats
                            errorMsg = this.isImea
                                ? this.labels[fieldNameCapitalized]?.RequiredErrorMessage
                                : this.labels[`${fieldNameCapitalized}Error`];
                        } else if(this.$v[key].postalCode === false) {
                            errorMsg = this.isImea
                                ? this.labels.PostalCode?.InvalidErrorMessage
                                : this.labels.PostalCodeError;
                        } else if(this.$v['phoneNumberData'].$error) {
                            errorMsg = this.labels?.PhoneNumberError;
                        }

                        this[`${key}ErrorMsg`] = errorMsg;
                    }
                }
            }
        }
    },

    methods: {
        checkOverTheLimitValidation(field) {
            return this.$v[field]?.characterLimit;
        },
        async chosenUserEnteredAddress() {
            this.suggestionPick = false;
            await this.handleAddressSelection(this.userEnteredAddressFromInternalDataset);
        },
        async chosenValidatedAddress(addressChose) {
            this.suggestionPick = true;
            const addressData = this.validatedAddressFromInternalDataset[addressChose];
            await this.handleAddressSelection(addressData);
        },
        formatLabel(localProp, localizationProp) {
            if(this.optionalFields.includes(localProp)) {
                return replaceToken(this.labels?.Optional, localizationProp);
            }

            return localizationProp;
        },
        getLabel(fieldName) {
            return `${this.labels[fieldName]?.Text}${this.labels[fieldName]?.Required ? '*' : ''}`;
        },
        getMaxLength(field) {
            return formHelper.maxChar.mxImprovedUx[field] || 100;
        },
        handleInputChange(event = false) {
            // Reset when user types in any field after selecting from modal
            if(this.isImea && this.userFinalizedAddress) this.userFinalizedAddress = false;
            const id = event.target?.id;
            const key = event.key;

            // handle all other inputs
            if(id) this[`${id}Data`] = event.target?.value;

            if(
                id !== 'address_1' &&
                    this.showAddressList &&
                    (key === 'Escape' || key === 'Tab')
            ) this.closeSuggestionList();

            if(id === 'address_1' && this.address_1Data.length > 3) {
                if(key === 'Escape' || key === 'Tab') {
                    this.showAddressList = false;
                    return;
                }
                if(key === 'ArrowDown' && this.$refs['suggestion'][0]) {
                    event.preventDefault();
                    this.showAddressList = true;
                    this.$refs['suggestion'][0].focus();
                    this.addressFocusIndex = 0;
                } else if(key !== 'Tab') {
                    // Debounce the API call to prevent multiple rapid requests
                    clearTimeout(this.experianDebounceTimer);
                    this.experianDebounceTimer = setTimeout(() => {
                        // Build the search query with street address and location context
                        // Include postal code, city, and state to help Experian narrow down results
                        let dataEntered = this.address_1Data;

                        // Add postal code for geographic context
                        if(this.postalCodeData) {
                            dataEntered += ' ' + this.postalCodeData;
                        }

                        // Add city if available
                        if(this.cityData) {
                            dataEntered += ' ' + this.cityData;
                        }

                        // Add state if available
                        if(this.stateMxData) {
                            dataEntered += ' ' + this.stateMxData;
                        }

                        this.getAddressApi(
                            dataEntered,
                            'mexico',
                            false,
                            false,
                            this.data?.AddressSuggestionMaxCount
                        );
                    }, EXPERIAN_DEBOUNCE_TIME); // 300ms debounce delay
                } else this.closeSuggestionList();
            }
        },
        populateFields(response) {
            this.closeSuggestionList();
            const {components = []} = response || {};
            try {
                const addressObject = components?.reduce((acc, el) => {
                    const [key] = Object.keys(el);
                    return {
                        ...acc,
                        [key]: el[key]
                    };
                }, {});
                const addressParts = [
                    addressObject?.street1,
                    addressObject?.streetNumber1
                ].filter(Boolean); // filtering out any undefined, empty or null values
                this.address_1Data = addressParts.join(' ');
            } catch (error) {
                console.error('Error processing address:', error);
            } finally {
                this.$nextTick(() => {
                    this.suggestionPick = true;
                });
            }
        },
        async updateFields(addressData) {
            const existingAddress2 = this.address_2Data || '';
            const existingDeliveryInstructions = this.deliveryInstructionsData || '';
            this.address_1Data = addressData.AddressLine1 || '';
            this.cityData = addressData.City || '';
            this.postalCodeData = addressData.PostalCode || '';
            this.stateMxData = addressData.Province || '';
            this.suburbData = addressData.Suburb || '';
            const address2 = addressData.AddressLine2;
            const deliveryInstructions = addressData.DeliveryInstructions;
            this.address_2Data = !address2
                ? existingAddress2
                : address2;
            this.deliveryInstructionsData = !deliveryInstructions
                ? existingDeliveryInstructions
                : deliveryInstructions;
            // Ensure Vue has processed all updates (no stale value) before sending for save
            await this.$nextTick();
        }
    }
};

import apiValidateAddress from '@api/routes/address/validate';
import * as addressTypes from '../utils/address-types';
import searchAddressService from '@api/routes/address/searchaddress';
import replaceToken from '@common/source/js/vue/utils/replace-token';
import eventBus from './event-bus';

const ALLOWED_KEYS = [
    'Backspace',
    'Tab',
    'Enter',
    'Escape',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'Delete'
];
const ALLOWED_SHORTCUTS = ['c', 'v', 'a', 'x'];
const POSTAL_CODE_ERROR_TYPES = {
    CITY: 'city',
    STATE: 'state',
    SUBURB: 'suburb'
};

export default {
    data() {
        return {
            enableSecondaryFields: false, // address1, address2, delivery instructions
            enableCityField: false,
            enableStateField: false,
            enableSuburbField: false,
            hasPostalCodeMatches: false,
            hasValidatedEditFlow: false,
            imeaFullName: '',
            initialLoad: false,
            formattedSuggestedAddressListForModal: [],
            formattedUserEnteredAddressForModal: '',
            hasMoreAvailableSuggestions: false,
            addressFromInternalDataset: false,
            isEditAddressFlow: false,
            loadingInternalApi: false,
            postalCodeAndCityMismatchErrorMsg: '',
            postalCodeAndCityMismatchError: null,
            postalCodeAndStateMismatchErrorMsg: '',
            postalCodeAndStateMismatchError: null,
            postalCodeAndSuburbMismatchErrorMsg: '',
            postalCodeAndSuburbMismatchError: null,
            postalCodeApiValidationError: null,
            postalCodeApiValidationErrorMsg: '',
            showValidatedAddressPickerModal: false,
            userEnteredAddressFromInternalDataset: {},
            validatedAddressFromInternalDataset: []
        };
    },
    computed: {
        initialStateValue() {
            const normalizedStateData = this.normalizeString(this.stateMxData);
            const matchingState = this.stateMx.find(state =>
                this.normalizeString(state) === normalizedStateData
            );
            return matchingState || this.stateMx[0];
        },
        hasListOfSuburbs() {
            return this.suburbList.length && this.suburbList.length > 1;
        },
        hasPostalCodeValidationErrors() {
            return (
                this.postalCodeApiValidationError ||
                this.postalCodeAndCityMismatchError ||
                this.postalCodeAndStateMismatchError ||
                this.postalCodeAndSuburbMismatchError
            );
        },
        isAddressFormInValid() {
            return this.$v.$error || this.hasPostalCodeValidationErrors;
        },
        labelsForPostalCodeErrors() {
            // Use localization prop if available, otherwise fallback to labels
            // this.getLocalizationProp exists only for checkout-add-address flow
            return (typeof this.getLocalizationProp === 'function' ? this.getLocalizationProp('Labels.ShippingSection') : null) || this.labels;
        },
        selectedCountryForSearch() {
            // Returns the logged-in user's country for cross-country address validation
            return this.$env?.Country;
        },
        showLoading() {
            return this.loadingInternalApi || !this.initialLoad;
        },
        userEnteredAddress() {
            return {
                'AddressLine1': this.address_1Data,
                'AddressLine2': this.address_2Data,
                'AddressType': this.isBusiness ? addressTypes.business : addressTypes.shipping,
                'City': this.cityData,
                'Country': 'Mexico',
                'DeliveryInstructions': this.deliveryInstructionsData,
                // Name on the IMEA for a first time OLE user is passed from the name on the top of the form to
                // satisfy the internal services address validation via validateAddressWithInternalDataset() below
                // See: http://tfs.melaleuca.net:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/295296
                'NameOnAddress': this.isImea ? this.imeaFullName : this.nameData,
                'PhoneNumber': this.phoneNumberData,
                'PostalCode': this.postalCodeData,
                'Province': this.stateMxData,
                'Suburb': this.suburbData
            };
        }
    },
    watch: {
        //  Keep suburb field enabled only if city is not empty
        cityData() {
            if(this.cityData === '') {
                this.enableSuburbField = false;
                this.suburbData = '';
            } else if(this.cityData !== '' && this.enableCityField === true) {
                this.enableSuburbField = true;
            }
        },
        stateMxData(newVal) {
            //  Keep city/suburb field enabled only if state is not empty
            if(this.enableStateField && newVal && newVal !== this.stateMx[0]) {
                this.enableCityField = true;
            } else if(newVal === this.stateMx[0]) {
                this.enableCityField = false;
                this.enableSuburbField = false;
                this.cityData = '';
                this.suburbData = '';
            }
        }
    },
    created() {
        eventBus.$on('updateFullName', (isSelfForm, fullName) => {
            if(isSelfForm && fullName) this.imeaFullName = fullName;
        });
    },
    beforeDestroy() {
        eventBus.$off('updateFullName');
    },
    mounted() {
        this.initialLoad = true;
    },
    methods: {
        cleanNumericField(field, newVal) {
            if(newVal) {
                // Clean any non-numeric characters after paste
                const numericOnly = newVal.replace(/[^0-9]/g, '');
                if(numericOnly !== newVal) {
                    this.$nextTick(() => {
                        this[field] = numericOnly;
                    });
                }
            }
        },
        async handleInternalPostalCodeSearch() {
            this.resetPostalCodeValidationErrors();
            this.$v.$reset();
            this.loadingInternalApi = true;

            const queryParams = { postalcode: this.postalCodeData };
            if(this.selectedCountryForSearch) {
                queryParams.country = this.selectedCountryForSearch;
            }

            const { success, error, data } = await searchAddressService.query(queryParams);
            if(success && data.Success) {
                const addressList = data.Data?.AddressList || [];

                if(addressList && addressList.length) {
                    let firstMatch = {};
                    const matchesForPostalCode = addressList.filter(address =>
                        address.PostalCode === this.postalCodeData
                    );
                    if(matchesForPostalCode.length) {
                        this.enableStateField = false;
                        this.enableCityField = false;
                        this.enableSuburbField = false;
                        const uniqueSuburbs = [...new Set(matchesForPostalCode.map(match => match.SuburbName))];
                        this.suburbList = uniqueSuburbs;

                        // Ensure placeholder is first for multi-suburb lists,
                        // but do NOT add placeholder during the first edit-flow validation
                        if(this.suburbList.length > 1) {
                            const isFirstEditFlowValidation = this.isEditAddressFlow && !this.hasValidatedEditFlow;
                            const placeholder = this.getSuburbPlaceholder();
                            if(!isFirstEditFlowValidation) {
                                if(this.suburbList[0] !== placeholder) {
                                    this.suburbList.unshift(placeholder);
                                }
                                // Only default selection to placeholder when NOT the first edit-flow validation
                                this.suburbData = this.suburbList[0];
                            }
                        }

                        firstMatch = matchesForPostalCode[0];
                        if(this.isEditAddressFlow && !this.hasValidatedEditFlow) {
                            this.validateEditFlowMatcher(firstMatch);
                            this.$v.$touch();
                        } else {
                            this.updateAddressFields(firstMatch);
                        }
                    }
                } else if(!addressList || addressList.length === 0 || data.Data === null) {
                    if(this.isEditAddressFlow && !this.hasValidatedEditFlow) {
                        this.postalCodeApiValidationError = true;
                        this.postalCodeApiValidationErrorMsg = this.labelsForPostalCodeErrors?.PostalCodeValidationError;
                        this.handlePostalCodeValidationError(POSTAL_CODE_ERROR_TYPES.CITY, this.postalCodeData);
                        this.handlePostalCodeValidationError(POSTAL_CODE_ERROR_TYPES.STATE, this.postalCodeData);
                        this.handlePostalCodeValidationError(POSTAL_CODE_ERROR_TYPES.SUBURB, this.postalCodeData);
                        this.$v.$touch();
                        this.hasValidatedEditFlow = true;
                    } else {
                        this.$modal.show({ id: 'invalid-postal-code-modal' });
                    }
                }
            } else if(error) {
                console.log('Service Error:', error);
            }
            this.enableSecondaryFields = true;
            this.loadingInternalApi = false;
        },
        handleNonNumericValue(event) {
            // Handle copy/paste shortcuts
            if((event.ctrlKey || event.metaKey) && ALLOWED_SHORTCUTS.includes(event.key.toLowerCase())) {
                // Handle paste event
                if(event.key.toLowerCase() === 'v') {
                    navigator.clipboard.readText().then(text => {
                        // Only allow if pasted content is numeric
                        if(!/^\d+$/.test(text)) {
                            event.preventDefault();
                        }
                    }).catch(() => {
                        // If can't read clipboard, handle copy/paste thru watcher
                    });
                    return;
                }
                return; // Allow other shortcuts (copy, cut, select all)
            }

            // Allow navigation keys
            if(ALLOWED_KEYS.includes(event.key)) {
                return;
            }

            // Block non-numeric input
            if(!/^\d$/.test(event.key)) {
                event.preventDefault();
            }
        },
        handlePostalCodeDataUpdate() {
            this.cleanNumericField('postalCodeData', this.postalCodeData);
            if(this.postalCodeData.length >= 5) {
                this.handleInternalPostalCodeSearch();
            } else if(this.postalCodeData.length === 0) {
                this.resetPostalCodeValidationErrors();
            }
        },
        handlePostalCodeValidationError(type, postalCode) {
            const errorConfig = {
                [POSTAL_CODE_ERROR_TYPES.CITY]: {
                    msg: 'PostalCodeCityError',
                    field: 'postalCodeAndCityMismatchError',
                    msgField: 'postalCodeAndCityMismatchErrorMsg'
                },
                [POSTAL_CODE_ERROR_TYPES.STATE]: {
                    msg: 'PostalCodeStateError',
                    field: 'postalCodeAndStateMismatchError',
                    msgField: 'postalCodeAndStateMismatchErrorMsg'
                },
                [POSTAL_CODE_ERROR_TYPES.SUBURB]: {
                    msg: 'PostalCodeColonyError',
                    field: 'postalCodeAndSuburbMismatchError',
                    msgField: 'postalCodeAndSuburbMismatchErrorMsg'
                }
            };

            const config = errorConfig[type];
            if(config) {
                this[config.msgField] = replaceToken(this.labelsForPostalCodeErrors?.[config.msg], postalCode);
                this[config.field] = true;
            }
        },
        handleInvalidPostalCode() {
            this.enableStateField = true;
            if(this.stateMxData && this.stateMxData !== this.stateMx[0] && this.enableStateField) {
                this.enableCityField = true;
                this.enableSuburbField = true;
                this.suburbList = [this.suburbData];
            }
            this.$modal.hide();
        },
        handleSelect(event, field) {
            this[field] = event.value;
        },
        getLockedFieldsPlaceholder(label) {
            return this.enableSecondaryFields ? label : '';
        },
        getSuburbPlaceholder() {
            // Returns the placeholder text used at the top of the suburb list
            if(this.labels?.Suburb?.Placeholder) {
                return this.labels.Suburb.Placeholder;
            }
            if(this.labels?.Suburb) {
                return this.labels.Suburb;
            }
            if(typeof this.getLocalizationProp === 'function') {
                return this.getLocalizationProp('Labels.ShippingSection.SuburbPlaceholder');
            }
            return '';
        },
        // MX addresses have diacritical marks that need to be removed for comparison
        normalizeString(str) {
            return str
                ? str.toLowerCase()
                    .normalize('NFD') // Normalize to NFD form
                    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
                : '';
        },
        resetPostalCodeValidationErrors() {
            this.postalCodeApiValidationError = false;
            this.postalCodeApiValidationErrorMsg = null;
            this.postalCodeAndCityMismatchErrorMsg = null;
            this.postalCodeAndCityMismatchError = false;
            this.postalCodeAndStateMismatchErrorMsg = null;
            this.postalCodeAndStateMismatchError = false;
            this.postalCodeAndSuburbMismatchErrorMsg = null;
            this.postalCodeAndSuburbMismatchError = false;
        },
        updateAddressFields(match) {
            this.cityData = match?.CityName || '';
            this.stateMxData = match?.StateLongName || '';

            if(this.suburbList.length === 1) {
                this.suburbData = this.suburbList[0];
            }
        },

        async validateAddressWithInternalDataset() {
            this.loadingInternalApi = true;

            const response = await apiValidateAddress.post(this.userEnteredAddress);

            try {
                if(!response.success || response.data?.Success === false) {
                    this.addressSelectedFromModal = false; // Reset incase /validate API fails
                    return {
                        isValid: false,
                        hasSuggestions: false,
                        errors: response.data?.ErrorMessages || ['Validation service unavailable']
                    };
                }

                const { Data } = response.data;

                if(Data.IsValid) {
                    return { isValid: true };
                }

                const userAddr = Data?.UserEnteredAddress || {};
                this.userEnteredAddressFromInternalDataset = userAddr;
                this.formattedUserEnteredAddressForModal = userAddr?.FormattedAddress || '';

                const suggestions = Array.isArray(Data?.SuggestedPickListAddress)
                    ? Data.SuggestedPickListAddress
                    : [];

                this.hasMoreAvailableSuggestions = suggestions.length > 0;

                if(this.hasMoreAvailableSuggestions) {
                    this.validatedAddressFromInternalDataset = suggestions;
                    this.formattedSuggestedAddressListForModal = suggestions.map(a => a.FormattedAddress);
                } else {
                    this.validatedAddressFromInternalDataset = [];
                    this.formattedSuggestedAddressListForModal = [];
                }

                this.showValidatedAddressPickerModal = true;

                return { isValid: false, hasSuggestions: this.hasMoreAvailableSuggestions };
            } finally {
                this.loadingInternalApi = false;
            }
        },
        validateEditFlowMatcher(firstMatch) {
            if(this.cityData && this.normalizeString(this.cityData) !== this.normalizeString(firstMatch?.CityName)) {
                this.handlePostalCodeValidationError(POSTAL_CODE_ERROR_TYPES.CITY, this.postalCodeData);
            }
            if(this.stateMxData && this.normalizeString(this.stateMxData) !== this.normalizeString(firstMatch?.StateLongName)) {
                this.handlePostalCodeValidationError(POSTAL_CODE_ERROR_TYPES.STATE, this.postalCodeData);
            }
            if(this.suburbData) {
                const suburbData = this.normalizeString(this.suburbData);
                const suburbMatch = this.suburbList.find(suburb => this.normalizeString(suburb) === suburbData);
                if(suburbMatch) {
                    // Move matched suburb to beginning of list
                    this.suburbList = [suburbMatch, ...this.suburbList.filter(suburb => suburb !== suburbMatch)];
                } else {
                    this.handlePostalCodeValidationError(POSTAL_CODE_ERROR_TYPES.SUBURB, this.postalCodeData);
                }
            }
            this.hasValidatedEditFlow = true;
        }
    }
};

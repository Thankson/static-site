<template>
    <div class="o-customerManagementAgreementAddressFormAuNz max-w-contain mx-auto mt-20 py-20 px-10 md:px-40 text-gray-150 text-sm bg-white border-gray-50 border-1">
        <h2 class="mb-20 text-lg font-medium leading-base">
            {{ labels.ShippingAddressText }}
        </h2>
        <div class="text-base lg:flex">
            <div class="md:flex lg:w-1_2">
                <div
                    ref="address1"
                    v-click-outside="closeSuggestionList"
                    class="relative mb-20 md:flex-1 md:mr-15"
                >
                    <label
                        class="text-sm font-medium uppercase" for="address1"
                        v-html="getLabel('Address1')"
                    />
                    <input-basic
                        id="address1"
                        ref="address1input"
                        name="address1"
                        auto-complete="off"
                        :class="{ '-isInvalid': address1DataError }"
                        :placeholder="labels.Address1 && labels.Address1.Placeholder"
                        :value="address1Data"
                        aria-describedby="address1ErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="address1ErrorMsg"
                        :is-visible="address1DataError"
                        :msg="address1DataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                    <div
                        v-if="loadingExp"
                        class="a-loadingSpinner__input absolute right-10"
                        style="top: 23px"
                    >
                        <a-loading-spinner :visible="loadingExp" size="sm" />
                    </div>
                    <div v-if="showAddressList && addressList.length > 0">
                        <perfect-scrollbar class="o-addressForm__list -suggest">
                            <ul ref="addressList">
                                <li
                                    v-for="address in addressList"
                                    :key="address.format"
                                    class="o-addressForm__listItem -suggest"
                                    @keyup.enter="chosenAddress(address, false, true)"
                                    @keyup.prevent="handleSuggestionKeyup($event)"
                                    @touchstart="chosenAddress(address, false, true)"
                                >
                                    <button
                                        ref="suggestion"
                                        class="o-addressForm__btn -suggest"
                                        tabindex="-1"
                                        @click.prevent="chosenAddress(address, false, true)"
                                    >
                                        {{ address.suggestion }}
                                    </button>
                                </li>
                            </ul>
                        </perfect-scrollbar>
                    </div>
                </div>
                <div class="mb-20 md:flex-1 md:ml-15 lg:mx-15">
                    <label
                        class="text-sm font-medium uppercase" for="address2"
                        v-html="getLabel('Address2')"
                    />
                    <input-basic
                        id="address2"
                        name="address2"
                        :class="{ '-isInvalid': address2DataError }"
                        :placeholder="labels.Address2 && labels.Address2.Placeholder"
                        :value="address2Data"
                        aria-describedby="address2ErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="address2ErrorMsg"
                        :is-visible="address2DataError"
                        :msg="address2DataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <div class="md:flex lg:w-1_2">
                <div class="mb-20 md:flex-1 md:mr-15 lg:mx-15">
                    <label
                        class="text-sm font-medium uppercase" for="suburb"
                        v-html="getLabel('Suburb')"
                    />
                    <input-basic
                        id="suburb"
                        name="suburb"
                        :class="{ '-isInvalid': suburbDataError }"
                        :placeholder="labels.Suburb && labels.Suburb.Placeholder"
                        :value="suburbData"
                        aria-describedby="suburbErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="suburbErrorMsg"
                        :is-visible="suburbDataError"
                        :msg="suburbDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div v-if="isAu" class="mb-20 md:flex-1 md:ml-15">
                    <label
                        class="text-sm font-medium uppercase" for="state"
                        v-html="getLabel('State')"
                    />
                    <v-select
                        id="state"
                        name="state"
                        vmodel="state"
                        :class="{ '-error': stateDataError }"
                        :initial="!stateData ? states[0] : stateData"
                        :options="states"
                        :values="states"
                        select-mod="-sm-md -padding-md"
                        arrow-other-mods="absolute -filled right-15 top-16 pointer-events-none"
                        aria-describedby="stateErrorMsg"
                        @change="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="stateErrorMsg"
                        :is-visible="stateDataError"
                        :msg="stateDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div v-if="isNz" class="mb-20 md:flex-1 md:ml-15">
                    <label
                        class="text-sm font-medium uppercase" for="city"
                        v-html="getLabel('City')"
                    />
                    <input-basic
                        id="city"
                        name="city"
                        :class="{ '-isInvalid': cityDataError }"
                        :placeholder="labels.City && labels.City.Placeholder"
                        :value="cityData"
                        aria-describedby="cityErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="cityErrorMsg"
                        :is-visible="cityDataError"
                        :msg="cityDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
        </div>
        <div class="md:flex">
            <div class="mb-20 md:flex-1 md:mr-15">
                <label
                    class="text-sm font-medium uppercase" for="postalCode"
                    v-html="getLabel('PostalCode')"
                />
                <input-basic
                    id="postalCode"
                    name="postalCode"
                    :class="{ '-isInvalid': postalCodeDataError }"
                    :placeholder="labels.PostalCode && labels.PostalCode.Placeholder"
                    :value="postalCodeData"
                    aria-describedby="postalCodeErrorMsg"
                    @keyup="handleInputChange($event)"
                />
                <FormFieldErrorMessage
                    id="postalCodeErrorMsg"
                    :is-visible="postalCodeDataError"
                    :msg="postalCodeDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>
            <div class="m-imeaAddressFormCa__deliveryInstructionsContainer mb-2 md:ml-15">
                <label
                    class="text-sm font-medium uppercase" for="deliveryInstructions"
                    v-html="getLabel('DeliveryInstructions')"
                />
                <input-basic
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    :class="{ '-isInvalid': deliveryInstructionsDataError }"
                    :placeholder="labels.DeliveryInstructions && labels.DeliveryInstructions.Placeholder"
                    :value="deliveryInstructionsData"
                    :max-length="deliveryInstructionsMaxLength"
                    aria-describedby="deliveryInstructionsErrorMsg"
                    @keyup="handleInputChange($event)"
                />
                <FormFieldErrorMessage
                    id="deliveryInstructionsErrorMsg"
                    :is-visible="deliveryInstructionsDataError"
                    :msg="deliveryInstructionsDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>
        </div>
        <m-experian-modal
            :address-entered="addressEntered"
            :address-entered-formatted="addressEnteredFormatted"
            :address-entered-label="labels.AddressEntered"
            :address-list="addressList"
            :address-not-in-system-label="labels.AddressNotOnSystem"
            :back-label="labels.Back"
            :problem-with-address-label="labels.ProblemWithAddress"
            :show-modal="showExperianModal"
            :suggested-label="labels.Suggested"
            :use-this-address-label="labels.UseThisAddress"
            :verify-address-label="labels.VerifyAddressModalTitle"
            @chose-address="handleChoseAddress"
            @chose-entered-address="handleChoseEnteredAddress"
            @close="showExperianModal = false"
        />
    </div>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import experianMixin from '@common/source/js/vue/mixins/experian';
    import { validationMixin } from 'vuelidate';
    import { maxLength, requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'OCustomerManagementAgreementAddressFormAuNz',
        components: { FormFieldErrorMessage },
        mixins: [ validationMixin, experianMixin ],
        validations() {
            return {
                address1Data: {
                    required: requiredIf(() => this.labels?.Address1?.Required),
                    maxLength: maxLength(formHelper.maxChar[`${this.countryCode}`].address_1)
                },
                address2Data: {
                    required: requiredIf(() => this.labels?.Address2?.Required),
                    maxLength: maxLength(formHelper.maxChar[`${this.countryCode}`].address_2)
                },
                cityData: {
                    required: requiredIf(() => this.isNz && this.labels?.City?.Required),
                    maxLength: maxLength(formHelper.maxChar.nz.city)
                },
                deliveryInstructionsData: {
                    required: requiredIf(() => this.labels?.DeliveryInstructions?.Required),
                    maxLength: maxLength(formHelper.maxChar[`${this.countryCode}`].deliveryInstructions)
                },
                postalCodeData: {
                    required: requiredIf(() => this.labels?.PostalCode?.Required),
                    postalCode: (val) => {
                        if(!val) return true;
                        return formHelper.isValidPostalCode(val, this.countryCode);
                    }
                },
                stateData: {
                    required: requiredIf(() => this.isAu && this.labels?.State?.Required)
                },
                suburbData: {
                    required: requiredIf(() => this.isAu && this.labels?.Suburb?.Required),
                    maxLength: maxLength(formHelper.maxChar[`${this.countryCode}`].suburb)
                }
            };
        },
        props: {
            addressSuggestionMaxCount: {
                type: Number,
                default: undefined
            },
            country: {
                type: String,
                default: ''
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            isAu: {
                type: Boolean,
                required: true
            },
            isNz: {
                type: Boolean,
                required: true
            },
            statesData: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                address1Data: null,
                address1DataError: null,
                address1DataErrorMsg: null,
                address2Data: null,
                address2DataError: null,
                address2DataErrorMsg: null,
                cityData: null,
                cityDataError: null,
                cityDataErrorMsg: null,
                deliveryInstructionsData: null,
                deliveryInstructionsDataError: null,
                deliveryInstructionsDataErrorMsg: null,
                hasUserChosenCustomAddress: false,
                postalCodeData: null,
                postalCodeDataError: null,
                postalCodeDataErrorMsg: null,
                showExperianModal: false,
                stateData: null,
                stateDataError: null,
                stateDataErrorMsg: null,
                states: [],
                suburbData: null,
                suburbDataError: null,
                suburbDataErrorMsg: null,
                suggestionPick: false,
                useTabThroughSuggestions: false
            };
        },
        computed: {
            addressEntered() {
                // Experian mixin requires use of 'zipCode'
                return {
                    address1: this.address1Data,
                    address2: this.address2Data,
                    city: this.cityData,
                    state: this.stateData,
                    suburb: this.suburbData,
                    zipCode: this.postalCodeData,
                    country: this.isAu ? 'Australia' : 'New Zealand'
                };
            },
            addressEnteredFormatted() {
                const lineBreak = '<br />';
                const address1 = this.addressEntered.address1 ? this.addressEntered.address1 + lineBreak : '';
                const address2 = this.addressEntered.address2 ? this.addressEntered?.address2 + lineBreak : '';
                const city = this.addressEntered.city ? this.addressEntered.city + ' ' : '';
                const state = this.addressEntered.state ? this.addressEntered.state + ' ' : '';
                const postalCode = this.addressEntered.zipCode || '';

                let suburb;
                if(this.isAu) suburb = this.addressEntered.suburb ? this.addressEntered.suburb + ' ' : '';
                else suburb = this.addressEntered.suburb ? this.addressEntered.suburb + lineBreak : '';

                return address1 + address2 + suburb + city + state + postalCode;
            },
            countryCode() {
                return getCountryCode(this.country).toLowerCase() || '';
            },
            // Limit user input to 35 characters
            // See: http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/280520
            deliveryInstructionsMaxLength() {
                return formHelper?.maxChar?.default?.shortDeliveryInstructions;
            },
            experianAddressFields() {
                return this.isAu
                    ? [ 'address1Data', 'suburbData', 'stateData', 'postalCodeData']
                    : [ 'address1Data', 'suburbData', 'cityData', 'postalCodeData'];
            },
            statePlaceholder() {
                return this.labels?.State?.Placeholder || '';
            },
            statesShortNamesRaw() {
                return this.statesData?.map(state => state.ProvinceValue) || [];
            }
        },
        watch: {
            addressEntered() {
                this.suggestionPick = false;
                this.hasUserChosenCustomAddress = false;
            },
            $v: {
                deep: true,
                handler() {
                    const allValidatedFields = this.$v.$params;
                    for (let key of Object.keys(allValidatedFields)) {
                        if(this.$v[key]) this[`${key}Error`] = this.$v[key].$error;

                        if(this[`${key}Error`]) {
                            let errorMsg;

                            if(this.$v[key].maxLength === false) {
                                const userInputDataLength = this[key] ? this[key].length : 0;
                                const inputDataMaxLength =
                                    this.$v[key].$params?.maxLength?.max ?? '';
                                errorMsg =
                                    this.labels?.MaxCharacterLengthExceedError
                                        .replace('{0}', inputDataMaxLength)
                                        .replace('{1}', userInputDataLength - inputDataMaxLength);
                            } else if(this.$v[key].required === false) {
                                const fieldName = key.replace('Data', '');
                                const fieldNameCapitalized =
                                    fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                                errorMsg = this.labels[`${fieldNameCapitalized}`]?.RequiredErrorMessage;
                            } else if(this.$v[key].postalCode === false) {
                                errorMsg = this.labels?.PostalCode.InvalidErrorMessage;
                            }

                            this[`${key}ErrorMsg`] = errorMsg;
                        }
                    }
                }
            }
        },
        created() {
            this.setFormValidations();
        },
        mounted() {
            if(this.isAu) {
                this.$nextTick(() => {
                    this.setStateOptions();
                });
            }
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            checkAddressAgainstExperianSuggestionList() {
                eventBus.$emit('getInput', {}, false);
                const userDataFormatted = this.isAu
                    ? `${this.address1Data} ${this.suburbData}  ${this.stateData} ${this.postalCodeData}`
                    : `${this.address1Data} ${this.suburbData}${this.suburbData ? ' ' : ''}${this.cityData} ${this.postalCodeData}`;

                if(this.addressList && userDataFormatted) {
                    const userDataInSuggestions = this.addressList.find(address => {
                        const doesAddressMatch = address?.suggestion?.replaceAll(',', '').toLowerCase() === userDataFormatted.toLowerCase();

                        return doesAddressMatch;
                    });
                    if(userDataInSuggestions) this.submitAddress();
                    else this.showExperianModal = true;
                }
            },
            getLabel(fieldName) {
                return `${this.labels[fieldName]?.Text}${this.labels[fieldName]?.Required ? '*' : ''}`;
            },
            async handleChoseAddress(addressUserChose) {
                const response = await this.chosenAddress(addressUserChose, false, true);
                if(response) this.submitAddress();
            },
            handleChoseEnteredAddress() {
                // User chose the radio associated with their custom address in the Experian modal
                this.hasUserChosenCustomAddress = true;
            },
            handleInputChange(event) {
                const id = event.target?.id;
                const model = event.model;
                const key = event.key;

                let dataEntered = '';

                // Handle AU state select input
                if(model && model === 'state') {
                    if(event.value === this.statePlaceholder) this.stateData = null;
                    else this.stateData = event.value;
                }

                // Handle all other inputs
                if(id) this[`${id}Data`] = event.target?.value;

                // Gets data from specified fields, and if they aren't null,
                // puts them in a comma/space separated string to pass to Experian.
                this.experianAddressFields.forEach(field => {
                    if(this[field]) dataEntered += this[field] + ', ';
                });

                if(
                    id !== 'address1' &&
                    this.showAddressList &&
                    (key === 'Escape' || key === 'Tab')
                ) this.closeSuggestionList();

                if(id === 'address1' && this.address1Data.length > 3) {
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
                        this.getAddressApi(
                            dataEntered,
                            this.country.toLowerCase(),
                            false,
                            false,
                            this.addressSuggestionMaxCount
                        );
                    } else this.closeSuggestionList();
                }
            },
            handleSuggestionKeyup(event) {
                event.preventDefault();
                event.stopPropagation();

                if(event.key === 'Escape') {
                    this.showAddressList = false;
                    this.$refs['address1input'].$el.focus();
                }

                let addressButtons = this.$refs['suggestion'];

                if(this.showAddressList && addressButtons.length > 0) {
                    if(event.key === 'ArrowDown') {
                        this.addressFocusIndex =
                            this.addressFocusIndex + 1 >= addressButtons.length
                                ? this.addressFocusIndex
                                : this.addressFocusIndex + 1;
                    } else if(event.key === 'ArrowUp') {
                        this.addressFocusIndex =
                            this.addressFocusIndex - 1 < -1
                                ? this.addressFocusIndex
                                : this.addressFocusIndex - 1;
                    }
                    if(this.addressFocusIndex === -1) {
                        this.$refs['address1input'].$el.focus();
                        this.showAddressList = true;
                    } else {
                        addressButtons[this.addressFocusIndex].focus();
                    }
                }
            },
            populateFields(response) {
                this.closeSuggestionList();
                const addressResponseObject = response;

                let addressObject = {};
                addressResponseObject.address.map(el => {
                    addressObject[Object.keys(el)] = Object.values(el)[0];
                });

                this.address1Data = addressObject.addressLine1;
                this.address2Data = addressObject.addressLine2;
                this.suburbData = addressObject.locality;
                this.postalCodeData = addressObject.postalCode;

                this.stateData = this.isAu ? addressObject.province : null;
                this.cityData = this.isNz ? addressObject.province : null;

                this.$nextTick(() => {
                    this.suggestionPick = true;
                });
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    if(!this.$v.$invalid) {
                        if(this.suggestionPick || this.hasUserChosenCustomAddress) {
                            this.submitAddress();
                        } else this.checkAddressAgainstExperianSuggestionList();
                    } else eventBus.$emit('getInput', {}, false);
                });
            },
            setStateOptions() {
                const statesShortNamesSorted = this.statesShortNamesRaw.sort();
                statesShortNamesSorted.unshift(this.statePlaceholder);
                this.states = statesShortNamesSorted;
            },
            submitAddress() {
                const formData = {
                    AddressLine1: this.address1Data,
                    AddressLine2: this.address2Data,
                    DeliveryInstructions: this.deliveryInstructionsData,
                    // Services is expecting the suburb data to be passed as City for AU
                    City: this.isAu ? this.suburbData : this.cityData,
                    Country: this.country,
                    PostalCode: this.postalCodeData,
                    Province: this.stateData,
                    State: this.stateData,
                    Suburb: this.suburbData
                };
                eventBus.$emit('getInput', formData, true);
            }
        }
    };
</script>

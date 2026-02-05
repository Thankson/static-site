<template>
    <div class="m-imeaAddressFormMx">
        <div class="lg:flex">
            <div class="lg:flex lg:w-1_2">
                <div
                    ref="address_1"
                    v-click-outside="closeSuggestionList"
                    class="relative mb-20 lg:flex-1 lg:mr-15"
                >
                    <label
                        class="text-sm font-medium uppercase" for="address_1"
                        v-html="getLabel('Address_1')"
                    />
                    <input-basic
                        id="address_1"
                        ref="address_1input"
                        name="address_1"
                        auto-complete="off"
                        :class="{ '-isInvalid': address_1DataError }"
                        :placeholder="labels.Address_1 && labels.Address_1.Placeholder"
                        :value="address_1Data"
                        aria-describedby="address_1ErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="address_1ErrorMsg"
                        :is-visible="address_1DataError"
                        :msg="address_1DataErrorMsg"
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
                <div class="mb-20 lg:flex-1 lg:mx-15">
                    <label
                        class="text-sm font-medium uppercase" for="address_2"
                        v-html="getLabel('Address_2')"
                    />
                    <input-basic
                        id="address_2"
                        name="address_2"
                        :class="{ '-isInvalid': address_2DataError }"
                        :placeholder="labels.Address_2 && labels.Address_2.Placeholder"
                        :value="address_2Data"
                        aria-describedby="address_2ErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="address_2ErrorMsg"
                        :is-visible="address_2DataError"
                        :msg="address_2DataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <div class="lg:flex lg:w-1_2">
                <div class="mb-20 lg:flex-1 lg:mx-15">
                    <label
                        class="text-sm font-medium uppercase" for="address_3"
                        v-html="getLabel('Address_3')"
                    />
                    <input-basic
                        id="address_3"
                        name="address_3"
                        :class="{ '-isInvalid': address_3DataError }"
                        :placeholder="labels.Address_3 && labels.Address_3.Placeholder"
                        :value="address_3Data"
                        aria-describedby="address_3ErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="address_3ErrorMsg"
                        :is-visible="address_3DataError"
                        :msg="address_3DataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div class="mb-20 lg:flex-1 lg:ml-15">
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
        <div class="lg:flex">
            <div class="lg:flex lg:w-1_2">
                <div class="mb-20 lg:flex-1 lg:mr-15">
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
                <div class="mb-20 lg:flex-1 lg:mx-15">
                    <label
                        class="text-sm font-medium uppercase" for="state"
                        v-html="getLabel('State')"
                    />
                    <v-select
                        id="state"
                        name="state"
                        vmodel="state"
                        :class="{ '-error': stateDataError }"
                        :initial="!stateData ? statesShortNames[0] : stateData"
                        :options="statesShortNames"
                        :values="statesShortNames"
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
            </div>
            <div class="mb-20 lg:w-1_4 lg:pr-20 lg:ml-15">
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
        </div>
        <m-experian-modal
            :address-entered="addressEntered"
            :address-entered-formatted="addressEnteredFormatted"
            :address-entered-label="labels.AddressEntered"
            :address-list="addressList"
            :address-not-in-system-label="labels.AddressNotOnSystem"
            :back-label="labels.Back"
            :problem-with-address-label="labels.ProblemWithAddress"
            :show-modal="isExperianModalVisible"
            :suggested-label="labels.Suggested"
            :use-this-address-label="labels.UseThisAddress"
            :verify-address-label="labels.VerifyAddressModalTitle"
            @chose-address="handleChoseAddress"
            @chose-entered-address="handleChoseEnteredAddress"
            @close="setIsExperianModalVisible(false)"
        />
    </div>
</template>

<script>
    import eventBus from '../../../../mixins/event-bus';
    import experianMixin from '@common/source/js/vue/mixins/experian';
    import imeaAddressFormMixin from '../../../../mixins/imea-address-form';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import { validationMixin } from 'vuelidate';
    import { maxLength, requiredIf} from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    const experianAddressFields =
        [ 'address_1Data', 'cityData', 'postalCodeData', 'stateData', 'suburbData' ];

    export default {
        name: 'MImeaAddressFormMx',
        components: { FormFieldErrorMessage },
        mixins: [validationMixin, experianMixin, imeaAddressFormMixin],
        validations() {
            return {
                address_1Data: {
                    required: requiredIf(() => this.labels?.Address_1?.Required),
                    maxLength: maxLength(formHelper.maxChar.mx.address_1),
                    noSpaces: formHelper.noSpaces
                },
                address_2Data: {
                    required: requiredIf(() => this.labels?.Address_2?.Required),
                    maxLength: maxLength(formHelper.maxChar.mx.address_2)
                },
                address_3Data: {
                    required: requiredIf(() => this.labels?.Address_3?.Required),
                    maxLength: maxLength(formHelper.maxChar.mx.address_3)
                },
                cityData: {
                    required: requiredIf(() => this.labels?.City?.Required),
                    maxLength: maxLength(formHelper.maxChar.default.city),
                    noSpaces: formHelper.noSpaces
                },
                suburbData: {
                    required: requiredIf(() => this.labels?.Suburb?.Required),
                    maxLength: maxLength(formHelper.maxChar.default.suburb),
                    noSpaces: formHelper.noSpaces
                },
                stateData: {
                    required: requiredIf(() => this.labels?.State?.Required)
                },
                postalCodeData: {
                    required: requiredIf(() => this.labels?.PostalCode?.Required),
                    postalCode: (val) => {
                        if(!val) return true;
                        return formHelper.isValidPostalCode(val, 'mx');
                    }
                }
            };
        },
        data() {
            return {
                address_1Data: null,
                address_1DataError: null,
                address_1DataErrorMsg: null,
                address_2Data: null,
                address_2DataError: null,
                address_2DataErrorMsg: null,
                address_3Data: null,
                address_3DataError: null,
                address_3DataErrorMsg: null,
                cityData: null,
                cityDataError: null,
                cityDataErrorMsg: null,
                hasUserChosenCustomAddress: false,
                postalCodeData: null,
                postalCodeDataError: null,
                postalCodeDataErrorMsg: null,
                stateData: null,
                stateDataError: null,
                stateDataErrorMsg: null,
                suburbData: null,
                suburbDataError: null,
                suburbDataErrorMsg: null,
                statesLongNames: [],
                statesShortNames: [],
                suggestionPick: false,
                useTabThroughSuggestions: false
            };
        },
        computed: {
            addressEntered() {
                // Experian mixin requires use of 'zipCode'
                return {
                    address1: this.address_1Data,
                    address2: this.address_2Data,
                    address3: this.address_3Data,
                    city: this.cityData,
                    suburb: this.suburbData,
                    state: this.stateData,
                    zipCode: this.postalCodeData,
                    country: 'Mexico'
                };
            },
            addressEnteredFormatted() {
                const lineBreak = '<br />';
                const address1 =
                    this.addressEntered.address1 ? this.addressEntered.address1 + lineBreak : '';
                const address2 =
                    this.addressEntered.address2 ? this.addressEntered?.address2 + lineBreak : '';
                const address3 =
                    this.addressEntered.address3 ? this.addressEntered?.address3 + lineBreak : '';
                const suburb =
                    this.addressEntered.suburb ? this.addressEntered?.suburb + lineBreak : '';
                const city =
                    this.addressEntered.city ? this.addressEntered.city + ', ' : '';
                const state =
                    this.addressEntered.state ? this.addressEntered.state + ' ' : '';
                const postalCode =
                    this.addressEntered.zipCode ? this.addressEntered.zipCode + ' ' : '';

                return address1 + address2 + address3 + suburb + city + state + postalCode;
            },
            statePlaceholder() {
                return this.labels?.State?.Placeholder || '';
            }
        },
        watch: {
            addressEntered() {
                this.suggestionPick = false;
                this.hasUserChosenCustomAddress = false;
            },
            isCollapseOpen(val) {
                if(val === false) {
                    this.$v.$reset();
                    this.address_1Data = null;
                    this.address_2Data = null;
                    this.address_3Data = null;
                    this.cityData = null;
                    this.suburbData = null;
                    this.stateData = null;
                    this.postalCodeData = null;
                }
            },
            isChevronFocused(val) {
                if(val && this.showAddressList) this.closeSuggestionList();
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.setStatesLists();
            });
        },
        methods: {
            checkAddressAgainstExperianSuggestionList() {
                const userDataFormatted = `${this.address_1Data} ${this.postalCodeData} ${this.cityData} ${this.statesLongNames[this.statesShortNames.findIndex(val => val === this.stateData)]}`;

                if(this.addressList && userDataFormatted) {
                    const userDataInSuggestions = this.addressList.find(address => {
                        const doesAddressMatch = address?.suggestion?.replaceAll(',', '').toLowerCase() === userDataFormatted.toLowerCase();

                        return doesAddressMatch;
                    });
                    if(userDataInSuggestions) this.submitAddress();
                    else this.setIsExperianModalVisible(true);
                }
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

                // handle state input
                if(model && model === 'state') {
                    if(event.value === this.statePlaceholder) this.stateData = null;
                    else this.stateData = event.value;
                }

                // handle all other inputs
                if(id) this[`${id}Data`] = event.target?.value;

                // Gets data from specified fields, and if they aren't null,
                // puts them in a comma/space separated string to pass to Experian.
                experianAddressFields.forEach(field => {
                    if(this[field]) dataEntered += this[field] + ', ';
                });

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
                        this.getAddressApi(
                            dataEntered,
                            'mexico',
                            false,
                            false,
                            this.data?.AddressSuggestionMaxCount
                        );
                    } else this.closeSuggestionList();
                }
            },
            populateFields(response) {
                this.closeSuggestionList();

                const addressResponseObject = response;
                let addressObject = {};

                addressResponseObject.components.map(el => {
                    addressObject[Object.keys(el)] = Object.values(el)[0];
                });

                const address1 = `${addressObject.street1 ? addressObject.street1 : ''} ${addressObject.streetNumber1 ? addressObject.streetNumber1 : ''}`;
                this.address_1Data = address1.trim();
                this.cityData = addressObject.locality1;
                this.suburbData = addressObject.locality2;
                this.postalCodeData = addressObject.postalCode1;

                const stateStringNormalizedLowerCase =
                    addressObject.province1.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase();

                const stateIndex = this.statesLongNames.findIndex(state => {
                    const stateLowerCase = state.toLowerCase();
                    return stateLowerCase === stateStringNormalizedLowerCase;
                });

                if(stateIndex) this.stateData = this.statesShortNames[stateIndex];

                this.$nextTick(() => {
                    this.suggestionPick = true;
                });
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    if(this.isCollapseOpen) {
                        this.$v.$touch();
                        if(!this.$v.$invalid) {
                            if(this.suggestionPick || this.hasUserChosenCustomAddress) {
                                this.submitAddress();
                            } else {
                                this.checkAddressAgainstExperianSuggestionList();
                            }
                        } else eventBus.$emit('getInput', false, false);
                    } else eventBus.$emit('getInput', false, true);
                });
            },
            setStatesLists() {
                const statesListOfObjectsSorted =
                    this.labels?.State?.States?.sort(
                        (a, b) => a.StateShortName.localeCompare(b.StateShortName)
                    );

                const statesShortNamesList = statesListOfObjectsSorted.map(
                    state => state.StateShortName
                );
                statesShortNamesList.unshift(this.statePlaceholder);

                this.statesShortNames = statesShortNamesList;

                const statesLongNamesList = statesListOfObjectsSorted.map(
                    state => state.StateLongName
                );
                statesLongNamesList.unshift(this.statePlaceholder);

                this.statesLongNames = statesLongNamesList;
            },
            submitAddress() {
                const formData = {
                    AddressLine1: this.address_1Data,
                    AddressLine2: this.address_2Data,
                    AddressLine3: this.address_3Data,
                    City: this.cityData,
                    Suburb: this.suburbData,
                    State: this.stateData,
                    Province: this.stateData,
                    PostalCode: this.postalCodeData,
                    Country: 'Mexico'
                };
                eventBus.$emit('getInput', formData, true);
            }
        }
    };
</script>

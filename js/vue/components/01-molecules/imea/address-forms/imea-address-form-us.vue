<template>
    <div class="m-imeaAddressFormUs">
        <div class="md:flex">
            <div
                ref="address_1"
                v-click-outside="closeSuggestionList"
                class="relative mb-20 md:flex-1 md:mr-15"
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
                                    {{ address.text }}
                                </button>
                            </li>
                        </ul>
                    </perfect-scrollbar>
                </div>
            </div>
            <div class="mb-20 md:flex-1 md:ml-15">
                <label
                    class="text-sm font-medium uppercase" for="address_2"
                    v-html="getLabel('Address_2')"
                />
                <input-basic
                    id="address_2"
                    name="address_2"
                    :class="{ '-isInvalid': address_2DataError }"
                    :placeholder="labels.Address_2 && labels.Address_2.Placeholder"
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
        <div class="md:flex">
            <div class="flex mb-20 md:w-1_2">
                <div class="flex-1 pr-5 md:pr-0 md:mr-15">
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
                <div class="flex-1 pl-5 md:pl-0 md:mx-15">
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
            </div>
            <div class="mb-20 w-1_2 pr-5 md:w-1_4 md:pr-20 md:ml-15">
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
    import { maxLength, requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    const experianAddressFields = [ 'address_1Data', 'cityData', 'postalCodeData', 'stateData' ];

    export default {
        name: 'MImeaAddressFormUs',
        components: { FormFieldErrorMessage },
        mixins: [validationMixin, experianMixin, imeaAddressFormMixin],
        validations() {
            return {
                address_1Data: {
                    required: requiredIf(() => this.labels?.Address_1?.Required),
                    maxLength: maxLength(formHelper.maxChar.default.address_1),
                    noSpaces: formHelper.noSpaces
                },
                address_2Data: {
                    required: requiredIf(() => this.labels?.Address_2?.Required),
                    maxLength: maxLength(formHelper.maxChar.default.address_2)
                },
                cityData: {
                    required: requiredIf(() => this.labels?.City?.Required),
                    maxLength: maxLength(formHelper.maxChar.default.city),
                    noSpaces: formHelper.noSpaces
                },
                postalCodeData: {
                    required: requiredIf(() => this.labels?.PostalCode?.Required),
                    postalCode: (val) => {
                        if(!val) return true;
                        return formHelper.isValidPostalCode(val, 'us');
                    }
                },
                stateData: {
                    required: requiredIf(() => this.labels?.State?.Required)
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
                states: [],
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
                    city: this.cityData,
                    state: this.stateData,
                    zipCode: this.postalCodeData,
                    country: 'United States'
                };
            },
            addressEnteredFormatted() {
                const lineBreak = '<br />';
                const address1 =
                    this.addressEntered.address1 ? this.addressEntered.address1 + lineBreak : '';
                const address2 =
                    this.addressEntered.address2 ? this.addressEntered?.address2 + lineBreak : '';
                const city =
                    this.addressEntered.city ? this.addressEntered.city + ', ' : '';
                const state =
                    this.addressEntered.state ? this.addressEntered.state + ' ' : '';
                const postalCode =
                    this.addressEntered.zipCode ? this.addressEntered.zipCode + ' ' : '';

                return address1 + address2 + city + state + postalCode;
            },
            statePlaceholder() {
                return this.labels?.State?.Placeholder || '';
            },
            statesShortNamesRaw() {
                return this.labels?.State?.States?.map(state => state.StateShortName) || [];
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
                    this.cityData = null;
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
                this.setStateOptions();
            });
        },
        methods: {
            checkAddressAgainstExperianSuggestionList() {
                const userDataFormatted = `${this.address_1Data} ${this.cityData} ${this.stateData} ${this.postalCodeData}`;

                if(this.addressList && userDataFormatted) {
                    const userDataInSuggestions = this.addressList.find(address => {
                        const doesAddressMatch = address?.textFormatted?.replaceAll(',', '').toLowerCase() === userDataFormatted.toLowerCase();

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
                            'unitedstates',
                            false,
                            false,
                            this.data?.AddressSuggestionMaxCount
                        );
                    } else this.closeSuggestionList();
                }
            },
            populateFields(response) {
                this.closeSuggestionList();

                const addressResponseObject = response.result.address;

                this.address_1Data = addressResponseObject.address_line_1;
                this.cityData = addressResponseObject.locality;
                this.stateData = addressResponseObject.region;
                this.postalCodeData = addressResponseObject.postal_code;

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
            setStateOptions() {
                const statesShortNamesSorted = this.statesShortNamesRaw.sort();
                statesShortNamesSorted.unshift(this.statePlaceholder);
                this.states = statesShortNamesSorted;
            },
            submitAddress() {
                const formData = {
                    AddressLine1: this.address_1Data,
                    AddressLine2: this.address_2Data,
                    City: this.cityData,
                    State: this.stateData,
                    Province: this.stateData,
                    PostalCode: this.postalCodeData,
                    Country: 'UnitedStates'
                };
                eventBus.$emit('getInput', formData, true);
            }
        }
    };
</script>

<template>
    <form id="add-address" action="" method="post" class="o-igForm">
        <div class="o-igForm__row">
            <!-- First Name -->
            <div class="o-igForm__field -w-half -left">
                <label
                    class="o-igForm__label m-formField__label uppercase pb-4"
                    :for="firstName.id"
                    v-html="`${firstName.label}${firstName.required && requiredSpan}`">
                </label>
                <input-basic
                    :id="firstName.id"
                    ref="firstName"
                    v-model="firstNameValue"
                    auto-complete="off"
                    :name="firstName.name"
                    :max-length="firstName.maxLength"
                    :min-length="firstName.minLength"
                    :placeholder="firstName.placeholder"
                    @blur="updateValue('firstName', 'firstNameValue')">
                </input-basic>
                <div v-if="$v.firstNameValue.$error" :id="`${firstName.id}-error`" class="e-formError">
                    <span v-if="!$v.firstNameValue.required" class="e-formError__item pb-0" role="alert">
                        {{ firstName.error }}
                    </span>
                    <span v-if="!$v.firstNameValue.fitPatterns && $v.firstNameValue.required" class="e-formError__item pb-0" role="alert">
                        {{ firstName.error2 }}
                    </span>
                </div>
            </div>

            <!-- Last Name -->
            <div class="o-igForm__field -w-half">
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="lastName.id"
                    v-html="`${lastName.label}${lastName.required && requiredSpan}`">
                </label>
                <input-basic
                    :id="lastName.id"
                    ref="lastName"
                    v-model="lastNameValue"
                    auto-complete="off"
                    :name="lastName.name"
                    :max-length="lastName.maxLength"
                    :min-length="lastName.minLength"
                    :placeholder="lastName.placeholder"
                    @blur="updateValue('lastName', 'lastNameValue')">
                </input-basic>

                <div v-if="$v.lastNameValue.$error" :id="`${lastName.id}-error`" class="e-formError">
                    <span v-if="!$v.lastNameValue.required" class="e-formError__item pb-0" role="alert">
                        {{ lastName.error }}
                    </span>
                    <span v-if="!$v.lastNameValue.fitPatterns && $v.lastNameValue.required" class="e-formError__item pb-0" role="alert">
                        {{ lastName.error2 }}
                    </span>
                </div>
            </div>
        </div>
        <div class="o-igForm__row">
            <!-- Phone -->
            <div class="o-igForm__field -w-half -left">
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="phone.id"
                    v-html="`${phone.label}${phone.required && requiredSpan}`">
                </label>
                <input-basic
                    :id="phone.id"
                    ref="phone"
                    v-model="phoneValue"
                    auto-complete="off"
                    :name="phone.name"
                    :max-length="phone.maxLength"
                    :min-length="phone.minLength"
                    :placeholder="phone.placeholder"
                    @blur="updateValue('phone', 'phoneValue')">
                </input-basic>

                <div v-if="$v.phoneValue.$error" :id="`${phone.id}-error`" class="e-formError">
                    <span class="e-formError__item pb-0" role="alert">
                        {{ phone.error }}
                    </span>
                </div>
            </div>

            <!-- E-mail -->
            <div class="o-igForm__field -w-half">
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="email.id"
                    v-html="`${email.label}${email.required && requiredSpan}`">
                </label>
                <input-basic
                    :id="email.id"
                    ref="email"
                    v-model="emailValue"
                    auto-complete="off"
                    :name="email.name"
                    :max-length="email.maxLength"
                    :min-length="email.minLength"
                    :placeholder="email.placeholder"
                    @blur="updateValue('email', 'emailValue')">
                </input-basic>

                <div v-if="$v.emailValue.$error" :id="`${email.id}-error`" class="e-formError">
                    <span class="e-formError__item pb-0" role="alert">
                        {{ email.error }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Address -->
        <div class="o-igForm__row">
            <div
                v-clickoutside="closeSuggestionList"
                class="o-igForm__field -address1 w-full"
            >
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="address1.id"
                    v-html="`${address1.label}${address1.required && requiredSpan} ${address1.description}`">
                </label>
                <input-basic
                    :id="address1.id"
                    ref="address1"
                    v-model="address1Value"
                    auto-complete="off"
                    :name="address1.name"
                    :max-length="address1.maxLength"
                    :min-length="address1.minLength"
                    :placeholder="address1.placeholder"
                    @keyup="updateValue('address1', 'address1Value')"
                    @change="updateValue('address1', 'address1Value')">
                </input-basic>

                <div v-if="$v.address1Value.$error" :id="`${address1.id}-error`" class="e-formError">
                    <span class="e-formError__item pb-0" role="alert">
                        {{ address1.error }}
                    </span>
                </div>

                <div v-if="loadingExp" class="a-loadingSpinner__input absolute right-10" style="top:64px">
                    <a-loading-spinner :visible="loadingExp" size="sm" />
                </div>

                <div v-if="showAddressList" class="relative">
                    <perfect-scrollbar class="o-igForm__list -suggest">
                        <ul ref="addressList">
                            <li
                                v-for="(item, index) in addressList"
                                :key="item.format"
                                :ref="`sugg-${index}`"
                                class="o-igForm__listItem -suggest"
                                @keyup.prevent="suggestionList">
                                <button ref="suggestion" class="o-igForm__btn -suggest" tabindex="-1" @click.prevent="suggestionSelected(item)">
                                    {{ (!item.text) ? item.suggestion : item.text }}
                                </button>
                            </li>
                        </ul>
                    </perfect-scrollbar>
                    <p class="sr-only" role="alert">{{ addressList.length }} {{ getLocalizationProp('Labels.ShippingSection.SuggestionsInTotal', 'Suggestions in total') }}</p>
                </div>
            </div>
        </div>

        <!-- Address Line 2 -->
        <div class="o-igForm__row">
            <div class="o-igForm__field w-full">
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="address2.id"
                    v-html="`${address2.label}${address2.required ? requiredSpan : ''}`">
                </label>
                <input-basic
                    :id="address2.id"
                    ref="address2"
                    v-model="address2Value"
                    auto-complete="off"
                    :name="address2.name"
                    :max-length="address2.maxLength"
                    :min-length="address2.minLength"
                    :placeholder="address2.placeholder"
                    @blur="updateValue('address2', 'address2Value')">
                </input-basic>

                <div v-if="$v.address2Value.$error" :id="`${address2.id}-error`" class="e-formError">
                    <span class="e-formError__item pb-0" role="alert">
                        {{ address2.error }}
                    </span>
                </div>
            </div>
        </div>

        <div class="o-igForm__row">
            <!-- City -->
            <div class="o-igForm__field -city">
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="city.id"
                    v-html="`${city.label}${city.required && requiredSpan}`">
                </label>
                <input-basic
                    :id="city.id"
                    ref="city"
                    v-model="cityValue"
                    auto-complete="off"
                    :name="city.name"
                    :max-length="city.maxLength"
                    :min-length="city.minLength"
                    :placeholder="city.placeholder"
                    @blur="updateValue('city', 'cityValue')">
                </input-basic>

                <div v-if="$v.cityValue.$error" :id="`${city.id}-error`" class="e-formError">
                    <span class="e-formError__item pb-0" role="alert">
                        {{ city.error }}
                    </span>
                </div>
            </div>

            <!-- State -->
            <div
                v-if="state.options"
                class="o-igForm__field -state">
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="state.id"
                    v-html="`${state.label}${state.required && requiredSpan}`">
                </label>
                <v-select
                    :id="state.id"
                    ref="state"
                    v-model="stateValue"
                    :options="state.options"
                    :initial="stateValue"
                    arrow-other-mods="-filled w-0 h-0 absolute right-18 top-16 pointer-events-none"
                    @change="changeState"
                    @blur="updateValue('state', 'stateValue')">
                </v-select>

                <div v-if="$v.stateValue.$error" :id="`${state.id}-error`" class="e-formError">
                    <span class="e-formError__item pb-0" role="alert">
                        {{ state.error }}
                    </span>
                </div>
            </div>

            <!-- Zip Code -->
            <div class="o-igForm__field -zipCode">
                <label
                    class="o-igForm__label m-formField__label uppercase"
                    :for="zipCode.id"
                    v-html="`${zipCode.label}${zipCode.required && requiredSpan}`">
                </label>
                <input-basic
                    :id="zipCode.id"
                    ref="zipCode"
                    v-model="zipCodeValue"
                    auto-complete="off"
                    :name="zipCode.name"
                    :max-length="zipCode.maxLength"
                    :min-length="zipCode.minLength"
                    :placeholder="zipCode.placeholder"
                    @blur="updateValue('zipCode', 'zipCodeValue')">
                </input-basic>

                <div v-if="$v.zipCodeValue.$error" :id="`${zipCode.id}-error`" class="e-formError">
                    <span class="e-formError__item pb-0" role="alert">
                        {{ zipCode.error }}
                    </span>
                </div>
            </div>
        </div>

        <!-- actions: -->
        <slot name="actions" :submit-form="submitForm">
            <div class="o-igForm__actions">
                <a-enroll-controls
                    prev class="a-button -mkt -outline px-18 xs:mr-5 flex flex-grow xs:inline-flex grow justify-center"
                >{{ getLocalizationProp('Labels.Back') }}</a-enroll-controls>
                <button
                    class="a-button -mkt px-18 flex xs:inline-flex flex-grow justify-center" type="submit" @click.prevent="submitForm"
                >{{ getLocalizationProp('Labels.SaveContinue') }}</button>
            </div>
        </slot>

        <div class="w-full">
            <div data-loading="address__loading" class="hidden">
                <span class="w-10 block">loading</span>
            </div>
            <div data-answer="address__answer" class="hidden"></div>
            <div data-target-error="add-address"></div>
        </div>

        <!-- Modal -->
        <m-experian-modal
            :address-entered="addressEntered"
            :address-entered-formatted="addressEnteredFormatted"
            :address-entered-label="getLocalizationProp('Labels.AddressEntered', 'Address You Entered:')"
            :address-list="addressList"
            :address-not-in-system-label="getLocalizationProp('Labels.AddressNotOnSystem', 'This address is not currently in our system. Please review the address and make sure it is correct before continuing.')"
            :back-label="getLocalizationProp('Labels.Back', 'Back')"
            :is-marketplace="true"
            :problem-with-address-label="getLocalizationProp('Labels.ProblemWithAddress', 'There was a problem with the address you entered. Please select from the list of SUggested Addresses, or try again. For further assistance, please contact Customer Service at 1 (800) 282-3000.')"
            :show-modal="showModal"
            :suggested-label="getLocalizationProp('Labels.Suggested', 'Suggested:')"
            :use-this-address-label="getLocalizationProp('Labels.UseThisAddress', 'Use this address')"
            :verify-address-label="getLocalizationProp('Labels.VerifyAddressModalTitle', 'Verify Address')"
            @chose-address="choseAddress"
            @chose-entered-address="choseEnteredAddress"
            @close="closeModal"
        ></m-experian-modal>
    </form>
</template>

<script>
    import {validationMixin} from 'vuelidate';
    import { required, minLength, maxLength } from 'vuelidate/lib/validators';
    import api from '@api/routes/marketplace/user/info';
    import createAccountMixin from '../../../mixins/create-account';
    import {mapActions, mapMutations, mapState} from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import experian from '@common/source/js/vue/mixins/experian';

    const UNITED_STATES = 'unitedstates';

    export default {
        name: 'OMktIgForm',
        directives: {
            clickoutside: {
                bind: function(el, binding, vnode, oldVnode) {
                    el.clickOutsideEvent = function(event) {
                        // Click outside the el and his childrens
                        if(!(el === event.target || el.contains(event.target))) {
                            // Call method provided in attribute value
                            vnode.context[binding.expression](event);
                        }
                    };
                    document.body.addEventListener('click', el.clickOutsideEvent);
                    document.body.addEventListener('touchstart', el.clickOutsideEvent);
                },
                unbind: function(el) {
                    document.body.removeEventListener('click', el.clickOutsideEvent);
                    document.body.removeEventListener('touchstart', el.clickOutsideEvent);
                },
                stopProp(event) {
                    event.stopPropagation();
                }
            }
        },
        mixins: [ experian, validationMixin, createAccountMixin, localizationMixin ],
        validations() {
            return {
                // First Name Validation Settings
                firstNameValue: {
                    required,
                    fitPatterns: value => {
                        if(value === null) return false;
                        const hasPattern = /^[a-zA-Z0-9-'\s]+$/gm.test(value);
                        return hasPattern;
                    },
                    minLength: minLength(this.firstName.minLength),
                    maxLength: maxLength(this.firstName.maxLength)
                },

                // Last Name Validation Settings
                lastNameValue: {
                    required,
                    fitPatterns: value => {
                        if(value === null) return false;
                        const hasPattern = /^[a-zA-Z0-9-'\s]+$/gm.test(value);
                        return hasPattern;
                    },
                    minLength: minLength(this.lastName.minLength),
                    maxLength: maxLength(this.lastName.maxLength)
                },

                // Phone Validation Settings
                phoneValue: {
                    required,
                    phone: value => {
                        if(value === null) return false;
                        return this.isValidPhoneNumber(value);
                    }
                },

                // Email Validation Settings
                emailValue: {
                    required,
                    email: value => {
                        if(value === null) return false;
                        return this.isValidEmail(value);
                    }
                },

                // Address Validation Settings
                address1Value: {
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

                // Address 2 Validation Settings
                address2Value: {},

                // City Validation Settings
                cityValue: {
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

                // State Validation Settings
                stateValue: {
                    required,
                    allowed: value => {
                        return value !== this.stateAbbrev[0];
                    }
                },

                // Zip Code Validation Settings
                zipCodeValue: {
                    required,
                    fitPatterns: value => {
                        if(value) {
                            let hasPattern;
                            let customerCulture = window.dataLayer ? window.dataLayer[0]?.customerCulture?.toLowerCase() : '';
                            if(customerCulture === 'en-ca' || customerCulture === 'fr-ca') {
                                hasPattern = /^[a-vxyA-VXY][0-9][a-zA-Z] [0-9][a-zA-Z][0-9]$/.exec(value);
                            } else {
                                hasPattern = /^[0-9]{5}(?:-[0-9]{4})?$/.exec(value);
                            }
                            return Boolean(hasPattern);
                        }
                        return false;
                    },
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.zipCode.minLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.zipCode.maxLength;
                    }
                }
            };
        },
        props: {
            clearForm: {
                type: Boolean,
                default: false
            },
            localizationLocal: {
                type: Object,
                default: () => {}
            },
            member: {
                type: Object,
                default: () => {}
            },
            onFlow: {
                type: Boolean,
                default: false
            },
            // if type is "members-list", then the component instance was used on one of the members-list components (e.g. ig-dashboard-members-list.vue):
            type: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                thisStep: null,
                sectionName: 'profile',
                firstNameValue: '',
                lastNameValue: '',
                phoneValue: '',
                emailValue: '',
                address1Value: '',
                address2Value: '',
                cityValue: '',
                stateValue: '',
                zipCodeValue: '',
                isFormValid: false,
                countryValue: '',
                suggestionPick: false,
                mainExperianFields: {
                    inputId: 'address1',
                    resultsCtaClass: '.o-igForm__btn',
                    wrapper: '.o-igForm__field.-address1'
                },
                showModal: false,
                addressShipping: {},
                settingInitialData: false,
                hasProps: false,
                intervalId: null
            };
        },
        computed: {
            ...mapState('enrollInfoguard', ['formData', 'stateAbbrev', 'stateNames']),
            ...mapState('enroll', ['stepIndex']),

            addressSuggestionMaxCount() {
                return this.localization?.Data?.addressSuggestionMaxCount || undefined;
            },
            firstName() {
                return {
                    id: 'firstname',
                    name: 'firstname',
                    error: this.localization?.Labels?.ErrorMessages?.FirstName,
                    error2: this.localization?.Labels?.ErrorMessages?.SpecialCharacters,
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.localization?.Labels?.FirstName || 'first name',
                    labelKey: 'FirstName',
                    required: true
                };
            },
            lastName() {
                return {
                    id: 'lastname',
                    name: 'lastname',
                    error: this.localization?.Labels?.ErrorMessages?.LastName,
                    error2: this.localization?.Labels?.ErrorMessages?.SpecialCharacters,
                    minLength: 1,
                    maxLength: 100,
                    placeholder: null,
                    label: this.localization?.Labels?.LastName || 'last name',
                    labelKey: 'LastName',
                    required: true
                };
            },
            phone() {
                return {
                    id: 'phone',
                    name: 'phone',
                    error: `${this.localization?.Labels?.PhoneNumber} ${this.localization?.Labels?.Required}`,
                    placeholder: this.localization?.Labels?.PhoneNumberPlaceHolder,
                    label: this.localization?.Labels?.PhoneNumber,
                    labelKey: 'Phone',
                    required: true
                };
            },
            email() {
                return {
                    id: 'email',
                    name: 'email',
                    error: `${this.localization?.Labels?.EmailAddress} ${this.localization?.Labels?.Required}`,
                    placeholder: null,
                    label: this.localization?.Labels?.EmailAddress,
                    labelKey: 'Email',
                    required: true
                };
            },
            address1() {
                return {
                    id: 'address1',
                    description: `<span class="lowercase font-normal">${this.localization?.Labels?.AddressDescription}</span>`,
                    name: 'address1',
                    error: `${this.localization?.Labels?.Address} ${this.localization?.Labels?.Required}`,
                    minLength: 1,
                    maxLength: 100,
                    placeholder: this.localization?.Labels?.AddressPlaceholder,
                    label: this.localization?.Labels?.Address,
                    labelKey: 'address1',
                    required: true
                };
            },
            address2() {
                return {
                    id: 'address2',
                    name: 'address2',
                    error: `${this.localization?.Labels?.AddressTwo} ${this.localization?.Labels?.Required}`,
                    minLength: 1,
                    maxLength: 100,
                    placeholder: this.localization?.Labels?.AddressTwoPlaceholder,
                    label: `${this.localization?.Labels?.AddressTwo} ${this.localization?.Labels?.Optional}`,
                    labelKey: 'address2',
                    required: false
                };
            },
            city() {
                return {
                    id: 'city',
                    name: 'city',
                    error: `${this.localization?.Labels?.City} ${this.localization?.Labels?.Required}`,
                    minLength: 1,
                    maxLength: 100,
                    placeholder: this.localization?.Labels?.CityPlaceholder,
                    label: this.localization?.Labels?.City,
                    labelKey: 'city',
                    required: true
                };
            },
            state() {
                return {
                    id: 'state',
                    name: 'state',
                    error: `${this.localization?.Labels?.State} ${this.localization?.Labels?.Required}`,
                    minLength: 1,
                    maxLength: 100,
                    label: this.localization?.Labels?.State,
                    labelKey: 'state',
                    options: this.stateAbbrev?.join(','),
                    required: true,
                    values: this.stateNames
                };
            },
            zipCode() {
                return {
                    id: 'zipcode',
                    name: 'zipcode',
                    error: `${this.localization?.Labels?.ZipCode} ${this.localization?.Labels?.Required}`,
                    minLength: 5,
                    maxLength: 10,
                    placeholder: null,
                    label: this.localization?.Labels?.ZipCode,
                    labelKey: 'zipcode',
                    required: true
                };
            },
            requiredSpan() {
                return `<span aria-label="${this.localization?.Labels?.Required}" class="text-red">*</span>`;
            },
            addressEntered() {
                // if any of these fields change, there is a watch function to set the variable isFormValid to false
                return {
                    address1: this.address1Value,
                    address2: this.address2Value,
                    city: this.cityValue,
                    state: this.stateValue,
                    zipCode: this.zipCodeValue,
                    country: 'United States'
                };
            },
            addressEnteredFormatted() {
                return `${this.addressEntered?.address1} <br />
                     ${(this.addressEntered?.address2) ? this.addressEntered?.address2 + '<br>' : ''}
                     ${(this.addressEntered?.city) ? (this.addressEntered?.city + ',') : ''}
                     ${(this.addressEntered?.state) ? (this.addressEntered?.state) : ''}
                     ${(this.addressEntered?.zipCode) ? this.addressEntered?.zipCode : ''}`;
            }
        },
        watch: {
            addressEntered() {
                // Reset if change any field
                this.isFormValid = false;
            },
            clearForm(newVal) {
                if(sessionStorage.getItem('enrollInfoguard')) {
                    this.getDataFromSessionStorage();
                } else if(newVal) {
                    this.getInitialValue();
                }
            },
            stepIndex() {
                // we need to pre-fill the form every time user goes to members-list step:
                if(this.onFlow && this.stepIndex === 1) {
                    this.getDataFromSessionStorage();
                }
            }
        },
        async mounted() {
            this.settingInitialData = true;

            // Localization
            if(this.localizationLocal && Object.keys(this.localizationLocal)) this.localization = this.localizationLocal;

            if(this.onFlow) {
                await this.getDataFromSessionStorage();
            } else {
                await this.getInitialValue();
            }

            // start experian services only in this step
            this.watchActiveStep();
            this.finalDataKeys();

            this.$nextTick(() => {
                this.settingInitialData = false;
            });
            this.finalDataKeys();
        },
        methods: {
            ...mapMutations('enrollInfoguard', ['UPDATE_SUBSCRIBERS', 'SET_STATE_ABBREV', 'SET_STATE_NAMES']),
            ...mapActions('enrollInfoguard', ['setUserInfo']),
            ...mapActions('enroll', ['nextStep', 'goToStep']),

            // Set initial value in fields; if we already have member we use that, otherwise get from the marketplace/user/info api:
            async getInitialValue() {
                const response = await api.get();

                if(response.success && response.data.Success) {
                    const data = response.data.Data;

                    this.setStateNameAndAbbrev(data);

                    if(this.member && Object.keys(this.member).length) {
                        this.firstNameValue = this.member.FirstName;
                        this.lastNameValue = this.member.LastName;
                        this.phoneValue = this.member.PhoneNumber;
                        this.emailValue = this.member.Email;
                        this.address1Value = this.member.Address1;
                        this.address2Value = this.member.Address2;
                        this.cityValue = this.member.City;
                        this.zipCodeValue = this.member.ZipCode;
                        this.stateValue = this.member.State;
                        this.countryValue = this.member.Country?.toLowerCase().trim();
                    } else {
                        this.firstNameValue = data?.ContactInfo?.FirstName;
                        this.lastNameValue = data?.ContactInfo?.LastName;
                        this.phoneValue = data?.ContactInfo?.PhoneNumber?.phoneNumber;
                        this.emailValue = data?.ContactInfo?.Email.Value;
                        this.address1Value = data?.DefaultAddress?.AddressLine1;
                        this.address2Value = data?.DefaultAddress?.AddressLine2;
                        this.cityValue = data?.DefaultAddress?.City;
                        this.zipCodeValue = data?.DefaultAddress?.PostalCode;
                        this.countryValue = data?.DefaultAddress?.Country?.toLowerCase().trim() || data?.CustomerCountry?.toLowerCase().trim();
                        this.stateValue = data?.DefaultAddress?.ProvinceShortName;
                    }
                    this.hasProps = true;
                }
            },

            callModal() {
                this.showModal = true;
            },

            changeState(newVal) {
                if(newVal.value && !this.settingInitialData) {
                    this.stateValue = newVal.value;
                    this.addressList = [];
                    this.getAddressApi(
                        `${this.address1Value}, ${newVal.value}`,
                        this.countryValue,
                        true,
                        true,
                        this.addressSuggestionMaxCount
                    );
                }
            },

            checkFinalAddress() {
                // All the values from Experian
                const chosenAddress = this.addressShipping;
                const address1 = chosenAddress.address1;
                const city = chosenAddress.city; // city
                const region = chosenAddress.state || chosenAddress.province; // state/province
                const postalCode = chosenAddress.zipCode || chosenAddress.postalCode;

                // Get results from the chosen country
                const resultsChosen = [address1, city, postalCode, region];

                let addressFields = ['address1Value', 'cityValue', 'zipCodeValue', 'stateValue'];

                // Check each required field
                for (let i = 0; i < addressFields.length; i++) {
                    const inputVal = this[addressFields[i]];
                    // Any result as undefined - call modal
                    if(resultsChosen[i] === undefined) {
                        this.callModal();
                        return false;
                    }

                    if(inputVal && inputVal.toLowerCase() !== resultsChosen[i].toLowerCase()) {
                        // Not in the system - call modal
                        this.callModal();
                        break;
                    } else {
                        if(i === (addressFields.length - 1)) {
                            // All good - send the form
                            this.isFormValid = true;
                            this.submitForm();
                        }
                    }
                }
            },

            async choseAddress(addressUserChose) {
                this.isFormValid = true;
                const response = await this.chosenAddress(addressUserChose, false, true);
                if(response) {
                    this.submitForm();
                }
            },

            choseEnteredAddress() {
                this.suggestionPick = true;
                this.isFormValid = true;
                this.submitForm();
            },

            closeModal() {
                this.showModal = false;
            },

            finalDataKeys() {
                let finalObj = {
                    address1: this.address1Value,
                    address2: this.address2Value,
                    city: this.cityValue,
                    state: this.stateValue?.toUpperCase(),
                    suburb: this.suburbData,
                    zipCode: this.zipCodeValue || this.postalCodeData
                };
                if(this.countryValue === UNITED_STATES) {
                    finalObj.country = 'UnitedStates';
                } else {
                    finalObj.country = 'Canada';
                }
                this.addressShipping = finalObj;
            },

            getDataFromStore() {
                this.firstNameValue = this.formData?.firstName;
                this.lastNameValue = this.formData?.lastName;
                this.phoneValue = this.formData?.phoneNumber;
                this.emailValue = this.formData?.email;
                this.address1Value = this.formData?.address?.address1;
                this.address2Value = this.formData?.address?.address2;
                this.cityValue = this.formData?.address?.city;
                this.zipCodeValue = this.formData?.address?.zipCode;
                this.stateValue = this.formData?.address?.state;
                this.countryValue = this.formData?.address?.country?.toLowerCase().trim();
                this.hasProps = true;
            },

            async getDataFromSessionStorage() {
                if(sessionStorage.getItem('enrollInfoguard')) {
                    const sessionFormData = JSON.parse(sessionStorage.getItem('enrollInfoguard')).FormData;
                    const response = await api.get();

                    if(response.success && response.data.Success) {
                        const data = response.data.Data;

                        this.setStateNameAndAbbrev(data);

                        if(sessionFormData.address && Object.keys(sessionFormData.address).length !== 0) {
                            this.firstNameValue = sessionFormData?.firstName;
                            this.lastNameValue = sessionFormData?.lastName;
                            this.phoneValue = sessionFormData?.phoneNumber;
                            this.emailValue = sessionFormData?.email;
                            this.address1Value = sessionFormData?.address?.address1;
                            this.address2Value = sessionFormData?.address?.address2;
                            this.cityValue = sessionFormData?.address?.city;
                            this.zipCodeValue = sessionFormData?.address?.zipCode;
                            this.stateValue = sessionFormData?.address?.state;
                            this.countryValue = sessionFormData?.address?.country?.toLowerCase().trim();
                        } else {
                            this.firstNameValue = data?.ContactInfo?.FirstName;
                            this.lastNameValue = data?.ContactInfo?.LastName;
                            this.phoneValue = data?.ContactInfo?.PhoneNumber?.phoneNumber;
                            this.emailValue = data?.ContactInfo?.Email.Value;
                            this.address1Value = data?.DefaultAddress?.AddressLine1;
                            this.address2Value = data?.DefaultAddress?.AddressLine2;
                            this.cityValue = data?.DefaultAddress?.City;
                            this.zipCodeValue = data?.DefaultAddress?.PostalCode;
                            this.countryValue = data?.DefaultAddress?.Country?.toLowerCase().trim() || data?.CustomerCountry?.toLowerCase().trim();
                            this.stateValue = data?.DefaultAddress?.ProvinceShortName;
                        }
                        this.hasProps = true;
                    }
                } else if(this.formData.address && Object.keys(this.formData.address).length !== 0) {
                    this.getDataFromStore();
                }
            },

            // need to get populate options/values for dropdown:
            setStateNameAndAbbrev(data) {
                // n.b. we need to set the default "Select" option since it doesn't come from the back-end:
                let abbrevatedStates = ['Select'];
                let stateNames = ['Select'];
                data.Provinces.forEach((abbrev) => {
                    abbrevatedStates.push(abbrev.ProvinceValue);
                    stateNames.push(abbrev.ProvinceName);
                });
                this.SET_STATE_ABBREV(abbrevatedStates);
                this.SET_STATE_NAMES(stateNames);
            },

            populateFields(val) {
                this.closeSuggestionList();

                const objectValue = (val.result) ? val.result : val;

                // Fields
                let address1 = null;
                let locality = null;
                let region = null;
                let postalCode = null;
                let address = {};

                if(!val.result) {
                    objectValue.address.forEach(el => {
                        address[Object.keys(el)] = Object.values(el)[0];
                    });
                }

                // Results variables
                // USA and CAN
                address1 = objectValue.address.address_line_1 || address.addressLine1;
                locality = objectValue.address.locality || address.locality; // city
                region = objectValue.address.region || address.province; // state/province
                postalCode = objectValue.address.postal_code || address.postalCode;

                // Populating fields - USA
                let resultsAddressFields = [address1, locality, postalCode, region];
                let addressFields = ['address1Value', 'cityValue', 'zipCodeValue', 'stateValue'];

                addressFields.forEach((element, index) => {
                    this[element] = resultsAddressFields[index];
                });

                this.finalDataKeys();
            },

            // used in infoguard members-list:
            updateSubscribers(subscriberIndex) {
                const formFields = {
                    UserName: `${this.firstNameValue} ${this.lastNameValue}`,
                    FirstName: this.firstNameValue,
                    LastName: this.lastNameValue,
                    Email: this.emailValue,
                    PhoneNumber: this.phoneValue
                };

                // additional fields since user is primary user:
                Object.assign(formFields, {
                    Address1: this.address1Value,
                    Address2: this.address2Value,
                    Address3: `${this.cityValue}, ${this.stateValue} ${this.zipCodeValue}`,
                    City: this.cityValue,
                    State: this.stateValue,
                    ZipCode: this.zipCodeValue
                });

                if(this.onFlow) {
                    this.UPDATE_SUBSCRIBERS({
                        index: subscriberIndex,
                        subscriber: formFields
                    });
                }

                return formFields;
            },

            // Saves data from fields to the store
            setData() {
                const updatedFormData = {
                    firstName: this.firstNameValue,
                    lastName: this.lastNameValue,
                    phoneNumber: this.phoneValue,
                    email: this.emailValue,
                    address: {
                        address1: this.address1Value,
                        address2: this.address2Value,
                        city: this.cityValue,
                        state: this.stateValue,
                        zipCode: this.zipCodeValue,
                        country: this.countryValue === UNITED_STATES ? 'UnitedStates' : 'Canada'
                    }
                };

                this.setUserInfo(updatedFormData);
                this.$emit('update-form-data', updatedFormData);
            },

            async submitForm(e, subscriberIndex) {
                if(this.type === 'members-list' && isNaN(subscriberIndex)) {
                    return;
                }

                this.$v.$touch();
                if(this.$v.$invalid) return;

                // Set data after the primary button on the Experian modal is clicked
                const modalCta = document.getElementsByClassName('m-modal__btn -primary')[0];
                if(modalCta) {
                    modalCta.onclick = () => {
                        this.setData();
                        if(this.type === 'members-list') {
                            this.updateSubscribers(subscriberIndex);
                        }
                    };
                }

                if(!this.isFormValid) {
                    this.checkFinalAddress();
                }

                this.$nextTick(() => {
                    if(this.isFormValid) {
                        this.setData();
                        if(this.type === 'members-list') {
                            const formFields = this.updateSubscribers(0);
                            this.$emit('update-subscribers', {fields: formFields, shouldAdd: false});
                        } else {
                            this.updateSubscribers(0);
                            this.$emit('goToSummary');
                        }
                    }

                    this.isFormValid = false;
                });
            },

            suggestionSelected(address) {
                this.chosenAddress(address, false, true);
            },

            updateValue(ref, field) {
                this.handleBlur(field);

                if(this.$refs[ref].$el.value) {
                    this[field] = this.$refs[ref].$el.value;

                    if(field === 'address1Value') {
                        clearTimeout(this.intervalId);
                        this.intervalId = setTimeout(() => {
                            this.getAddressApi(
                                this.address1Value,
                                this.countryValue,
                                false,
                                true,
                                this.addressSuggestionMaxCount
                            );
                        }, 300);
                    }
                }
            },

            watchActiveStep() {
                const thisStep = document.querySelectorAll('.o-enroll__step.step-2')[0];
                const loadingSpinnerWrapper = document.querySelectorAll('.o-igForm__field.w-full')[0];

                if(thisStep) {
                    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
                    const observer = new MutationObserver((mutations, observer) => {
                        mutations.forEach((mutation) => {
                            if(mutation.attributeName === 'style') {
                                if(thisStep.style.display !== 'block') {
                                    // Call Experian service only on step 2
                                    setTimeout(() => {
                                        this.getAddressApi(
                                            `${this.address1Value}, ${this.stateValue}`,
                                            this.countryValue,
                                            true,
                                            true,
                                            this.addressSuggestionMaxCount
                                        );
                                        this.showAddressList = false;
                                    }, 300);
                                }
                            }
                            if(mutation.type && mutation.type.toLowerCase() === 'childlist') {
                                // Spinner
                                const loadingSpinner = loadingSpinnerWrapper.querySelectorAll('.a-loadingSpinner__inner');
                                loadingSpinner.forEach((el) => {
                                    if(el && el.style.display !== 'block') {
                                        el.style.bottom = '25px';
                                        el.style.top = 'initial';
                                    }
                                });
                            }
                        });
                    });

                    observer.observe(thisStep, {
                        attributes: true,
                        attributeFilter: ['style']
                    });

                    observer.observe(loadingSpinnerWrapper, {
                        attributes: true,
                        childList: true
                    });
                }
            }
        }
    };
</script>

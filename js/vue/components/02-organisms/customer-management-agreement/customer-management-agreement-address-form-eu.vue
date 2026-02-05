<template>
    <div class="o-customerManagementAgreementAddressFormUk max-w-contain mx-auto mt-20 py-20 px-10 md:px-40 text-gray-150 text-sm bg-white border-gray-50 border-1">
        <h2 class="mb-20 text-lg font-medium leading-base">
            {{ labels.ShippingAddressText }}
        </h2>
        <div class="text-base lg:flex">
            <div class="md:flex lg:w-1_2">
                <div
                    ref="address1"
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
                <div class="mb-20 md:flex-1 md:ml-15">
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
    </div>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import { validationMixin } from 'vuelidate';
    import { maxLength, requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'OCustomerManagementAgreementAddressFormUk',
        components: { FormFieldErrorMessage },
        mixins: [ validationMixin ],
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
                    required: requiredIf(() => this.labels?.City?.Required),
                    maxLength: maxLength(formHelper.maxChar[this.countryCode].city)
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
                }
            };
        },
        props: {
            country: {
                type: String,
                default: ''
            },
            labels: {
                type: Object,
                default: () => ({})
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
                postalCodeData: null,
                postalCodeDataError: null,
                postalCodeDataErrorMsg: null
            };
        },
        computed: {
            countryCode() {
                return getCountryCode(this.country).toLowerCase() || '';
            }
        },
        watch: {
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
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            getLabel(fieldName) {
                return `${this.labels[fieldName]?.Text}${this.labels[fieldName]?.Required ? '*' : ''}`;
            },
            handleInputChange(event) {
                const id = event.target?.id;
                // Handle all other inputs
                if(id) this[`${id}Data`] = event.target?.value;
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    if(!this.$v.$invalid) {
                        this.submitAddress();
                    } else eventBus.$emit('getInput', {}, false);
                });
            },
            submitAddress() {
                const formData = {
                    AddressLine1: this.address1Data,
                    AddressLine2: this.address2Data,
                    DeliveryInstructions: this.deliveryInstructionsData,
                    City: this.cityData,
                    Country: this.country,
                    PostalCode: this.postalCodeData
                };
                eventBus.$emit('getInput', formData, true);
            }
        }
    };
</script>

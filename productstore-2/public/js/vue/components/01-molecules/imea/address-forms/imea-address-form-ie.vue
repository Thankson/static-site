<template>
    <div class="m-imeaAddressFormIe">
        <div class="md:flex">
            <div
                ref="address_1"
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
            <div class="md:flex md:w-1_2">
                <div class="md:flex-1 mb-20 md:mr-15">
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
                <div class="md:flex-1 mb-20 md:mx-15">
                    <label
                        class="text-sm font-medium uppercase" for="county"
                        v-html="getLabel('County')"
                    />
                    <input-basic
                        id="county"
                        name="county"
                        :class="{ '-isInvalid': countyDataError }"
                        :placeholder="labels.County && labels.County.Placeholder"
                        :value="countyData"
                        aria-describedby="countyErrorMsg"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="countyErrorMsg"
                        :is-visible="countyDataError"
                        :msg="countyDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <div class="max-w-144 md:max-w-full mb-20 md: md:ml-15 md:pr-20 md:pr-5 md:w-1_4 w-1_2">
                <label
                    class="text-sm font-medium uppercase whitespace-no-wrap" for="postalCode"
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
    </div>
</template>

<script>
    import eventBus from '../../../../mixins/event-bus';
    import imeaAddressFormMixin from '../../../../mixins/imea-address-form';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import { validationMixin } from 'vuelidate';
    import { maxLength, requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'MImeaAddressFormIe',
        components: { FormFieldErrorMessage },
        mixins: [validationMixin, imeaAddressFormMixin],
        validations() {
            return {
                address_1Data: {
                    required: requiredIf(() => this.labels?.Address_1?.Required),
                    maxLength: maxLength(formHelper.maxChar.ie.address_1)
                },
                address_2Data: {
                    required: requiredIf(() => this.labels?.Address_2?.Required),
                    maxLength: maxLength(formHelper.maxChar.ie.address_2)
                },
                cityData: {
                    required: requiredIf(() => this.labels?.City?.Required),
                    maxLength: maxLength(formHelper.maxChar.ie.city)
                },
                postalCodeData: {
                    required: requiredIf(() => this.labels?.PostalCode?.Required),
                    postalCode: (val) => {
                        if(!val) return true;
                        return formHelper.isValidPostalCode(val, 'ie');
                    }
                },
                countyData: {
                    required: requiredIf(() => this.labels?.County?.Required),
                    maxLength: maxLength(formHelper.maxChar.ie.county)
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
                countyData: null,
                countyDataError: null,
                countyDataErrorMsg: null
            };
        },
        watch: {
            isCollapseOpen(val) {
                if(val === false) {
                    this.$v.$reset();
                    this.address_1Data = null;
                    this.address_2Data = null;
                    this.cityData = null;
                    this.countyData = null;
                    this.postalCodeData = null;
                }
            }
        },
        methods: {
            handleInputChange(event) {
                const id = event.target?.id;
                // handle all other inputs
                if(id) this[`${id}Data`] = event.target?.value;
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    if(this.isCollapseOpen) {
                        this.$v.$touch();
                        if(!this.$v.$invalid) {
                            this.submitAddress();
                        } else eventBus.$emit('getInput', false, false);
                    } else eventBus.$emit('getInput', false, true);
                });
            },
            submitAddress() {
                const formData = {
                    AddressLine1: this.address_1Data,
                    AddressLine2: this.address_2Data,
                    City: this.cityData,
                    County: this.countyData,
                    PostalCode: this.postalCodeData,
                    Country: 'Ireland'
                };
                eventBus.$emit('getInput', formData, true);
            }
        }
    };
</script>

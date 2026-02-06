<template>
    <div class="o-customerManagementAgreementAddressFormJp max-w-contain mx-auto mt-20 py-20 px-10 md:px-40 text-gray-150 text-sm bg-white border-gray-50 border-1">
        <h2 class="mb-20 text-lg font-medium leading-base">
            {{ labels.ShippingAddressText }}
        </h2>
        <div class="md:flex">
            <div class="flex mb-20 md:w-1_3">
                <div class="o-addressForm__field -text">
                    <button
                        class="o-addressForm__button -search"
                        type="button"
                        @click="$modal.show({ id: 'modal-jp-address-search' })">
                        <a-icon size="sm" class="mr-10">search</a-icon>
                        {{ labels.AddressSearchButtonText }}
                    </button>
                </div>
            </div>
        </div>
        <div class="md:flex">
            <div
                ref="postalcode"
                class="mb-20 md:flex-1 md:mr-15"
            >
                <label
                    class="text-sm font-medium" for="postalCode"
                    v-html="getLabel('PostalCode')"
                />
                <input-basic
                    id="postalCode"
                    name="postalCode"
                    :class="{ '-isInvalid': postalCodeDataError }"
                    :placeholder="labels.PostalCode && labels.PostalCode.Placeholder"
                    :value="postalCodeData"
                    aria-describedby="postalCodeErrorMsg"
                    readonly="readonly"
                    @keyup="handleInputChange($event)"
                />
                <FormFieldErrorMessage
                    id="postalCodeErrorMsg"
                    :is-visible="postalCodeDataError"
                    :msg="postalCodeDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>
            <div class="md:flex md:w-1_2 md:mt-20">
                <div class="mb-20 md:flex-1 md:ml-15">
                    <label
                        class="text-sm font-medium uppercase" for="province"
                        v-html="getLabel('Province')"
                    />
                    <input-basic
                        id="province"
                        name="province"
                        :class="{ '-isInvalid': provinceDataError }"
                        :placeholder="labels.Province && labels.Province.Placeholder"
                        :value="provinceData"
                        aria-describedby="provinceErrorMsg"
                        readonly="readonly"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="provinceErrorMsg"
                        :is-visible="provinceDataError"
                        :msg="provinceDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
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
                        readonly="readonly"
                        @keyup="handleInputChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="cityErrorMsg"
                        :is-visible="cityDataError"
                        :msg="cityDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div class="mb-20 md:flex-1 md:ml-15">
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
            </div>
        </div>
        <div class="md:flex">
            <div class="mb-20 md:w-1_2 md:mr-15">
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
            <div class="mb-20 md:w-1_2 md:ml-15 self-end">
                <div v-html="labels.DisclaimerDetails"></div>
            </div>
        </div>
        <!-- Modal: Japan Zip Code Search -->
        <modal id="modal-jp-address-search" size="lg">
            <template #content>
                <o-address-search
                    class="mx-15 md:mx-0"
                    :address-not-selected-label="'Select Address'"
                    :cancel-label="labels.AddressSearch.Cancel"
                    :confirm-label="labels.AddressSearch.Confirm"
                    heading-id="global-modal-heading"
                    :heading-label="labels.AddressSearch.FindZipCode"
                    :input-placeholder="labels.AddressSearch.SearchPlaceholder"
                    :no-entry-error="labels.AddressSearch.NoEntryError"
                    :no-results-error="labels.AddressSearch.NoResultsError"
                    :search-label="labels.AddressSearch.Search"
                    :subheading-label="labels.AddressSearch.SearchInstructions"
                    :zip-code-label="getLabel('PostalCode')"
                    @closeModal="hideModal"
                    @confirm="onAddressSearchConfirm"
                />
            </template>
        </modal>
    </div>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import { validationMixin } from 'vuelidate';
    import { maxLength, requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import AddressSearch from '../my-account/address-search.vue';

    export default {
        name: 'OCustomerManagementAgreementAddressFormJp',
        components: { FormFieldErrorMessage, [AddressSearch.name]: AddressSearch },
        mixins: [ validationMixin ],
        validations() {
            return {
                address1Data: {
                    required: requiredIf(() => this.labels?.Address1?.Required),
                    maxLength: maxLength(formHelper.maxChar.jp.address_1)
                },
                cityData: {
                    required: requiredIf(() => this.labels?.City?.Required),
                    maxLength: maxLength(formHelper.maxChar.jp.city)
                },
                provinceData: {
                    required: requiredIf(() => this.labels?.Province?.Required),
                    maxLength: maxLength(formHelper.maxChar.jp.province)
                },
                suburbData: {
                    required: requiredIf(() => this.labels?.Suburb?.Required),
                    maxLength: maxLength(formHelper.maxChar.jp.suburb)
                },
                postalCodeData: {
                    required: requiredIf(() => this.labels?.PostalCode?.Required),
                    postalCode: (val) => {
                        if(!val) return true;
                        return formHelper.isValidPostalCode(val, 'jp');
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
                postalCodeData: null,
                postalCodeDataError: null,
                postalCodeDataErrorMsg: null,
                provinceData: null,
                provinceDataError: null,
                provinceDataErrorMsg: null,
                cityData: null,
                cityDataError: null,
                cityDataErrorMsg: null,
                suburbData: null,
                suburbDataError: null,
                suburbDataErrorMsg: null
            };
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
            hideModal() {
                this.$modal.hide({
                    id: 'modal-jp-address-search'
                });
            },
            onAddressSearchConfirm(address) {
                this.$modal.hide();
                this.cityData = address.city;
                this.provinceData = address.state;
                this.suburbData = address.suburb;
                this.postalCodeData = address.postalCode;
            },
            getLabel(fieldName) {
                return `${this.labels[fieldName]?.Text}${this.labels[fieldName]?.Required ? '*' : ''}`;
            },
            handleInputChange(event) {
                const id = event.target?.id;
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
                    Suburb: this.suburbData,
                    Province: this.provinceData,
                    City: this.cityData,
                    PostalCode: this.postalCodeData,
                    Country: 'Japan'
                };
                eventBus.$emit('getInput', formData, true);
            }
        }
    };
</script>

<template>
    <div class="m-imeaAddressFormJp">
        <div class="md:flex">
            <div class="flex mb-20 md:w-1_3 md:ml-20">
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
                class="pr-5 md:w-1_2 md:ml-15"
            >
                <label
                    class="text-sm font-medium" for="postalcode"
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
            <div class="mb-20 md:flex-1 md:ml-15 mt-25">
                <label
                    class="text-sm font-medium uppercase" for="province"
                    v-html="getLabel('Province')"
                />
                <input-basic
                    id="province"
                    name="province"
                    :class="{ '-isInvalid': provinceDataError }"
                    :placeholder="labels.State && labels.State.Placeholder"
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
            <div class="mb-20 md:flex-1 md:mr-15 lg:mx-15 mt-25">
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
            <div class="mb-20 md:flex-1 md:ml-15 mt-25">
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
        <div class="md:flex">
            <div class="mb-20 pr-5 md:w-1_2 md:ml-15">
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
        </div>
        <!-- Modal: Japan Zip Code Search -->
        <modal id="modal-jp-address-search" size="lg">
            <template #content>
                <o-address-search
                    class="mx-15 md:mx-0"
                    :address-not-selected-label="'Select Address'"
                    :cancel-label="labels.AddressSearch.PostCodeSearchModal.CancelButtonText"
                    :confirm-label="labels.AddressSearch.PostCodeSearchModal.ConfirmButtonText"
                    heading-id="global-modal-heading"
                    :heading-label="labels.AddressSearch.PostCodeSearchModal.Title"
                    :input-placeholder="labels.AddressSearch.PostCodeSearchModal.Placeholder"
                    :no-entry-error="labels.AddressSearch.PostCodeSearchModal.InvalidErrorMessage"
                    :no-results-error="labels.AddressSearch.PostCodeSearchModal.InvalidErrorMessage"
                    :search-label="labels.AddressSearch.PostCodeSearchModal.SearchButtonText"
                    :subheading-label="labels.AddressSearch.PostCodeSearchModal.Description"
                    :zip-code-label="getLabel('PostalCode')"
                    @closeModal="hideModal"
                    @confirm="onAddressSearchConfirm"
                />
            </template>
        </modal>
    </div>
</template>

<script>
    import eventBus from '../../../../mixins/event-bus';
    import imeaAddressFormMixin from '../../../../mixins/imea-address-form';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import { validationMixin } from 'vuelidate';
    import { maxLength, requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import AddressSearch from '../../../02-organisms/my-account/address-search.vue';

    export default {
        name: 'MImeaAddressFormJp',
        components: { FormFieldErrorMessage, [AddressSearch.name]: AddressSearch },
        mixins: [validationMixin, imeaAddressFormMixin],
        validations() {
            return {
                address_1Data: {
                    required: requiredIf(() => this.labels?.Address_1?.Required),
                    maxLength: maxLength(formHelper.maxChar.jp.address_1)
                },
                postalCodeData: {
                    required: requiredIf(() => this.labels?.PostalCode?.Required),
                    postalCode: (val) => {
                        if(!val) return true;
                        return formHelper.isValidPostalCode(val, 'jp');
                    }
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
                }
            };
        },
        data() {
            return {
                address_1Data: null,
                address_1DataError: null,
                address_1DataErrorMsg: null,
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
            isCollapseOpen(val) {
                if(val === false) {
                    this.$v.$reset();
                    this.address_1Data = null;
                    this.suburbData = null;
                    this.provinceData = null;
                    this.cityData = null;
                    this.postalCodeData = null;
                }
            },
            isChevronFocused(val) {
                if(val && this.showAddressList) this.closeSuggestionList();
            }
        },
        methods: {
            handleInputChange(event) {
                const id = event.target?.id;
                if(id) this[`${id}Data`] = event.target?.value;
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    if(this.isCollapseOpen) {
                        this.$v.$touch();
                        if(!this.$v.$invalid) {
                            this.submitAddress();
                        } else eventBus.$emit('getInput', {}, false);
                    } else eventBus.$emit('getInput', false, true);
                });
            },
            submitAddress() {
                const formData = {
                    AddressLine1: this.address_1Data,
                    Suburb: this.suburbData,
                    Province: this.provinceData,
                    City: this.cityData,
                    PostalCode: this.postalCodeData,
                    Country: 'Japan'
                };
                eventBus.$emit('getInput', formData, true);
            },
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
                this.zipCodeData = address.postalCode;
                this.postalCodeData = address.postalCode;
            }
        }
    };
</script>

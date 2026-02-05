<template>
    <div class="o-addressFormMx">
        <!-- Show spinner while /searchAddress API is being loaded -->
        <div
            v-if="showLoading || isLoadingSubmitForm"
            class="absolute flex top-0 bottom-0 left-0 right-0 justify-center items-center z-1 opacity-50 bg-white">
            <a-loading-spinner
                :visible="true"
                aria-hidden="true">
            </a-loading-spinner>
        </div>
        <div class="w-full flex flex-col lg:flex-row">
            <div class="w-full lg:w-1_2 pr-0 lg:pr-20">
                <div class="flex flex-col md:flex-row">
                    <!-- Recipient Name -->
                    <div class="flex-1 mr-16 mt-0 pb-20 w-full md:w-auto">
                        <div class="flex items-end justify-between">
                            <label
                                class="m-formField__label"
                                for="recipientName"
                                v-html="formatLabel('name', labels.Name)"
                            />
                            <InputCharacterCounter
                                :value="nameData"
                                :max-length="getMaxLength('name')"
                                :is-over-the-character-limit="!checkOverTheLimitValidation('nameData')"
                                modifier-classes="pb-5"
                            />
                        </div>
                        <input-basic
                            id="recipientName"
                            v-model="nameData"
                            name="name"
                            data-testid="input-name"
                            :max-length="getMaxLength('name')"
                            :class="{ '-isInvalid': nameDataError }"
                            :placeholder="labels.NamePlaceholder"
                            aria-describedby="nameErrorMsg"
                        />
                        <FormFieldErrorMessage
                            id="nameErrorMsg"
                            data-testid="paragraph-nameErrorMsg"
                            :is-visible="nameDataError"
                            :msg="nameDataErrorMsg"
                            modifier-classes="-no-icon"
                        />
                    </div>

                    <!-- Phone Number -->
                    <!-- Phone Number field to be pre-filled in both ADD/EDIT flow -->
                    <div class="w-full md:w-200 pb-20">
                        <div class="flex items-end justify-between">
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', labels.PhoneNumber)"
                            />
                            <InputCharacterCounter
                                :value="phoneNumberData"
                                :max-length="getMaxLength('phoneNumber')"
                                :is-over-the-character-limit="!checkOverTheLimitValidation('phoneNumberData')"
                                modifier-classes="pb-5"
                            />
                        </div>
                        <input-basic
                            id="phoneNumber"
                            v-model="phoneNumberData"
                            name="phoneNumber"
                            data-testid="input-phoneNumber"
                            :max-length="getMaxLength('phoneNumber')"
                            type="tel"
                            :class="{ '-isInvalid': phoneNumberDataError }"
                            :placeholder="labels.PhoneNumberPlaceholder"
                            aria-describedby="phoneErrorMsg"
                            @keydown="handleNonNumericValue"
                        />
                        <FormFieldErrorMessage
                            id="phoneErrorMsg"
                            data-testid="paragraph-phoneErrorMsg"
                            :is-visible="phoneNumberDataError"
                            :msg="phoneNumberDataErrorMsg"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>

                <!-- Postal Code and State -->
                <div class="flex flex-col md:flex-row">
                    <div class="w-full mr-16 md:w-150 pb-20">
                        <div class="flex items-end justify-between">
                            <label
                                class="m-formField__label"
                                for="postalCode"
                                v-html="formatLabel('postalCode', labels.PostalCode)"
                            />
                            <InputCharacterCounter
                                :value="postalCodeData"
                                :max-length="getMaxLength('postalCode')"
                                modifier-classes="pb-5"
                            />
                        </div>
                        <input-basic
                            id="postalCode"
                            v-model="postalCodeData"
                            name="postalCode"
                            data-testid="input-postalCode"
                            :max-length="getMaxLength('postalCode')"
                            :class="{ '-isInvalid': postalCodeDataError || postalCodeApiValidationError }"
                            :placeholder="labels.PostalCodePlaceholder"
                            aria-describedby="postalCodeErrorMsg"
                            @keydown="handleNonNumericValue"
                        />
                        <FormFieldErrorMessage
                            id="postalCodeErrorMsg"
                            data-testid="paragraph-postalCodeErrorMsg"
                            :is-visible="postalCodeApiValidationError || postalCodeDataError"
                            :msg="postalCodeApiValidationError ? postalCodeApiValidationErrorMsg : postalCodeDataErrorMsg"
                            modifier-classes="-no-icon"
                        />
                    </div>

                    <div class="flex-1 pb-20 w-full md:w-auto">
                        <div class="flex items-end justify-between">
                            <label
                                class="m-formField__label"
                                for="stateMx"
                                v-html="formatLabel('state', labels.State)" />
                        </div>
                        <v-select
                            v-if="enableStateField && stateMx && stateMx.length"
                            id="stateMx"
                            :options="stateMx.toString()"
                            :values="stateMx"
                            :initial="initialStateValue"
                            :class="{ '-error': stateMxDataError }"
                            select-mod="-sm-md -padding-md"
                            arrow-other-mods="absolute -filled right-15 top-16 pointer-events-none"
                            aria-describedby="stateMxErrorMsg"
                            data-testid="select-stateMx"
                            @change="handleSelect($event, 'stateMxData')"
                        />
                        <input-basic
                            v-else
                            id="stateMx"
                            v-model="stateMxData"
                            name="state"
                            :class="{ '-isInvalid': stateMxDataError }"
                            data-testid="input-state"
                            :disabled="true"
                            aria-describedby="stateErrorMsg"
                        />
                        <FormFieldErrorMessage
                            id="stateErrorMsg"
                            data-testid="paragraph-stateErrorMsg"
                            :is-visible="postalCodeAndStateMismatchError || stateMxDataError"
                            :msg="postalCodeAndStateMismatchError ? postalCodeAndStateMismatchErrorMsg : stateMxDataErrorMsg"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>

                <!-- Municipality/City -->
                <div class="flex flex-col pb-20">
                    <div class="flex items-end justify-between">
                        <label
                            class="m-formField__label"
                            for="city"
                            v-html="formatLabel('city', labels.City)"
                        />
                        <InputCharacterCounter
                            v-if="enableCityField"
                            :value="cityData"
                            :max-length="getMaxLength('city')"
                            modifier-classes="pb-5"
                        />
                    </div>
                    <input-basic
                        id="city"
                        v-model="cityData"
                        name="city"
                        data-testid="input-city"
                        :max-length="getMaxLength('city')"
                        :class="{ '-isInvalid': cityDataError }"
                        aria-describedby="cityErrorMsg"
                        :disabled="!enableCityField"
                    />
                    <FormFieldErrorMessage
                        id="cityErrorMsg"
                        data-testid="paragraph-cityErrorMsg"
                        :is-visible="postalCodeAndCityMismatchError || cityDataError"
                        :msg="postalCodeAndCityMismatchError ? postalCodeAndCityMismatchErrorMsg : cityDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>

                <!-- Colonia -->
                <div class="flex flex-col pb-20">
                    <div class="flex items-end justify-between">
                        <label
                            class="m-formField__label"
                            for="suburb"
                            v-html="formatLabel('suburb',labels.Suburb)"
                        />
                        <InputCharacterCounter
                            v-if="enableSuburbField"
                            :value="suburbData"
                            :max-length="getMaxLength('suburb')"
                            modifier-classes="pb-5"
                        />
                    </div>
                    <v-select
                        v-if="hasListOfSuburbs"
                        id="suburb"
                        data-testid="select-suburb"
                        :values="suburbList"
                        :options="suburbList"
                        :initial="suburbList[0]"
                        :class="{ '-isInvalid': suburbDataError }"
                        select-mod="-sm-md -padding-md"
                        arrow-other-mods="absolute -filled right-15 top-16 pointer-events-none"
                        aria-describedby="suburbErrorMsg"
                        @change="handleSelect($event, 'suburbData')"
                    />
                    <input-basic
                        v-else
                        id="suburb"
                        v-model="suburbData"
                        data-testid="input-suburb"
                        name="suburb"
                        :max-length="getMaxLength('suburb')"
                        :class="{ '-isInvalid': suburbDataError }"
                        aria-describedby="suburbErrorMsg"
                        :disabled="!enableSuburbField"
                    />
                    <FormFieldErrorMessage
                        id="suburbErrorMsg"
                        data-testid="paragraph-suburbErrorMsg"
                        :is-visible="postalCodeAndSuburbMismatchError|| suburbDataError"
                        :msg="postalCodeAndSuburbMismatchError ? postalCodeAndSuburbMismatchErrorMsg : suburbDataErrorMsg"
                        modifier-classes="-no-icon"
                    />
                </div>

                <!-- Address Fields Row -->
                <div class="flex flex-col md:flex-row">
                    <!-- Street and External Number -->
                    <div
                        v-click-outside="closeSuggestionList"
                        class="flex-1 mr-16 pb-20 w-full md:w-auto relative"
                    >
                        <div class="o-addressFormMx__addressFieldLabel flex items-end justify-between">
                            <div class="flex flex-col">
                                <div class="flex">
                                    <label
                                        class="m-formField__label"
                                        for="address_1"
                                        v-html="formatLabel('address_1', labels.Address1)"
                                    />
                                    <div v-if="labels.Tooltip && labels.Tooltip.ExteriorNumber" class="ml-5">
                                        <m-tooltip class="mb-5" tooltip-icon="info">
                                            <div v-html="labels.Tooltip.ExteriorNumber"></div>
                                        </m-tooltip>
                                    </div>
                                </div>
                            </div>
                            <InputCharacterCounter
                                :value="address_1Data"
                                :max-length="getMaxLength('address_1')"
                                :is-over-the-character-limit="!checkOverTheLimitValidation('address_1Data')"
                                modifier-classes="pb-5"
                            />
                        </div>
                        <input-basic
                            id="address_1"
                            v-model="address_1Data"
                            name="address_1"
                            data-testid="input-address1"
                            auto-complete="off"
                            :max-length="getMaxLength('address_1')"
                            :class="{ '-isInvalid': address_1DataError }"
                            :disabled="!enableSecondaryFields"
                            :placeholder="getLockedFieldsPlaceholder(labels.Address1Placeholder)"
                            aria-describedby="address_1ErrorMsg"
                            @keyup="handleInputChange($event)"
                        />
                        <FormFieldErrorMessage
                            id="address_1ErrorMsg"
                            data-testid="paragraph-address_1ErrorMsg"
                            :is-visible="address_1DataError"
                            :msg="address_1DataErrorMsg"
                            modifier-classes="-no-icon"
                        />
                        <div v-if="loadingExp" class="a-loadingSpinner__input absolute right-10 top-25">
                            <a-loading-spinner :visible="true" size="sm" />
                        </div>
                        <div v-if="showAddressList && addressList.length > 0">
                            <perfect-scrollbar class="o-addressForm__list -suggest">
                                <ul ref="addressList" data-testid="listItem-experianSuggestionList">
                                    <li
                                        v-for="address in addressList"
                                        :key="address.format"
                                        class="o-addressForm__listItem -suggest"
                                        data-testid="listItem-experianSuggestion"
                                        @keyup.enter="chosenAddress(address, false, true)"
                                        @keyup.prevent="suggestionList"
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

                    <!-- Interior Number -->
                    <div class="w-full md:w-200 pb-20">
                        <div class="o-addressFormMx__addressFieldLabel flex items-end justify-between">
                            <div class="flex flex-col">
                                <div class="flex">
                                    <label
                                        class="m-formField__label"
                                        for="address_2"
                                        v-html="formatLabel('address_2', labels.Address2)"
                                    />
                                    <div v-if="labels.Tooltip && labels.Tooltip.InteriorNumber" class="md:ml-0 ml-5">
                                        <m-tooltip class="mb-5" tooltip-icon="info">
                                            <div v-html="labels.Tooltip.InteriorNumber"></div>
                                        </m-tooltip>
                                    </div>
                                </div>
                            </div>
                            <InputCharacterCounter
                                :value="address_2Data"
                                :max-length="getMaxLength('address_2')"
                                :is-over-the-character-limit="!checkOverTheLimitValidation('address_2Data')"
                                modifier-classes="pb-5"
                            />
                        </div>
                        <input-basic
                            id="address_2"
                            v-model="address_2Data"
                            name="address_2"
                            data-testid="input-address2"
                            :max-length="getMaxLength('address_2')"
                            :class="{ '-isInvalid': address_2DataError }"
                            :disabled="!enableSecondaryFields"
                            :placeholder="getLockedFieldsPlaceholder(labels.Address2Placeholder)"
                            aria-describedby="address_2ErrorMsg"
                        />
                        <FormFieldErrorMessage
                            id="address_2ErrorMsg"
                            data-testid="paragraph-address_2ErrorMsg"
                            :is-visible="address_2DataError"
                            :msg="address_2DataErrorMsg"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>
            </div>

            <div class="flex flex-col w-full lg:w-1_2 lg:pb-20 lg:pl-20 pt-40 lg:pt-0 justify-end">
                <!-- Additional Address Information -->
                <div class="text-2xl-2">{{ labels.DeliveryInstructionsHeader }}</div>
                <div class="flex items-end justify-between pb-0 mt-20 md:pt-0">
                    <div class="flex flex-col pb-5">
                        <div class="flex">
                            <label class="font-medium text-sm" for="deliveryInstructions" v-html="formatLabel('deliveryInstructions', labels.DeliveryInstructions)" />
                            <m-tooltip v-if="labels.Tooltip && labels.Tooltip.AdditionalInfo" tooltip-icon="info" class="ml-5">
                                <div v-html="labels.Tooltip.AdditionalInfo"></div>
                            </m-tooltip>
                        </div>
                        <span class="text-xs font-normal" for="deliveryInstructions">{{ labels.DeliveryInstructionsSubHeader }}</span>
                    </div>
                    <InputCharacterCounter
                        :value="deliveryInstructionsData"
                        :max-length="getMaxLength('deliveryInstructions')"
                        :is-over-the-character-limit="!checkOverTheLimitValidation('deliveryInstructionsData')"
                        modifier-classes="pb-5"
                    />
                </div>
                <textarea
                    id="deliveryInstructions"
                    v-model="deliveryInstructionsData"
                    class="a-textarea pt-10 pl-10 placeholder-gray-100 border-gray-50 border-1 min-h-90"
                    data-testid="textarea-deliveryInstructions"
                    :maxlength="getMaxLength('deliveryInstructions')"
                    :class="{ '-isInvalid': deliveryInstructionsDataError }"
                    :disabled="!enableSecondaryFields"
                    :placeholder="getLockedFieldsPlaceholder(labels.DeliveryInstructionsPlaceholder)"
                    rows="2"
                    aria-describedby="deliveryInstructionsErrorMsg"
                />
                <FormFieldErrorMessage
                    id="deliveryInstructionsErrorMsg"
                    data-testid="paragraph-deliveryInstructionsErrorMsg"
                    :is-visible="deliveryInstructionsDataError"
                    :msg="deliveryInstructionsDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>
        </div>
        <!-- CheckBox-->
        <div v-if="!isBusiness" class="flex pt-40 md:pt-20">
            <m-checkbox
                v-model="isDefaultShip"
                class="-center -padding-xs"
                name="defaultShip"
                :label="labels.DefaultShipping"
            />
        </div>

        <!-- Action Buttons -->
        <div class="flex pt-40">
            <button
                class="a-button px-50 text-base -white mr-30 md:mr-40"
                type="button"
                data-testid="button-addAddressForm_cancel"
                @click="$emit('cancel')">
                {{ cancelLabel }}
            </button>
            <button
                class="a-button px-50 text-base"
                type="button"
                data-testid="button-addAddressForm_save"
                @click="handleSave">
                {{ saveLabel }}
            </button>
        </div>
        <div v-if="isAddressFormInValid && !hasAddUpdateAddressApiError" class="text-sm text-red mt-4">{{ labels.CorrectFormError }}</div>

        <!-- Invalid postal code -->
        <modal
            id="invalid-postal-code-modal"
            heading-class="font-bold text-2xl leading-initial"
        >
            <template v-slot:heading>
                <span>{{ labels.InvalidPostalCodeModal.Title }}</span>
            </template>

            <template v-slot:body>
                <p class="text-gray-120 text-sm">
                    {{ labels.InvalidPostalCodeModal.Description }}
                </p>
            </template>

            <template v-slot:footer>
                <div>
                    <v-button
                        class="mb-20 py-12 px-24 block -white"
                        data-testid="button-invalidPostalCodeContinue"
                        @click="handleInvalidPostalCode">
                        {{ labels.InvalidPostalCodeModal.Continue }}
                    </v-button>
                    <v-button
                        v-modal-hide
                        class="py-12 px-24 -green"
                        data-testid="button-invalidPostalCodeCancel">
                        {{ labels.InvalidPostalCodeModal.Cancel }}
                    </v-button>
                </div>
            </template>
        </modal>
        <ValidatedAddressPickerModal
            :delivery-instructions-data="deliveryInstructionsData"
            :formatted-user-entered-address-for-modal="formattedUserEnteredAddressForModal"
            :formatted-suggested-address-list-for-modal="formattedSuggestedAddressListForModal"
            :has-more-available-suggestions="hasMoreAvailableSuggestions"
            :labels="validatedAddressPickerModal"
            :show-modal="showValidatedAddressPickerModal"
            @close="showValidatedAddressPickerModal = false"
            @choseValidatedAddress="chosenValidatedAddress"
            @choseUserEnteredAddress="chosenUserEnteredAddress"
        />
    </div>
</template>

<script>
    import addressFormMx from '../../../mixins/address-form-mx';
    import searchAddressMx from '../../../mixins/search-address-mx';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import InputCharacterCounter from '../../01-molecules/input-character-counter/input-character-counter.vue';
    import ValidatedAddressPickerModal from '../../01-molecules/modal/validated-address-picker-modal.vue';

    export default {
        name: 'OAddressFormMx',
        components: {
            FormFieldErrorMessage,
            InputCharacterCounter,
            ValidatedAddressPickerModal
        },
        mixins: [ addressFormMx, searchAddressMx ],
        props: {
            addressEntryEnhancementEnabled: {
                type: Boolean,
                default: false
            },
            cancelLabel: {
                type: String,
                default: 'Cancel'
            },
            correctFormErrorLabel: {
                type: String,
                default: ''
            },
            defaultShip: {
                type: Boolean,
                default: false
            },
            isBusiness: {
                type: Boolean,
                default: false
            },
            hasAddUpdateAddressApiError: {
                type: Boolean,
                default: false
            },
            isLoadingSubmitForm: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            prefilledFormValues: {
                type: Object,
                default: () => ({})
            },
            saveLabel: {
                type: String,
                default: 'Save'
            },
            stateMx: {
                type: Array,
                default: () => []
            },
            validatedAddressPickerModal: {
                type: Object,
                default: () => ({})
            }
        },
        emits: ['save', 'cancel', 'updateDefaultShip', 'validationApiError'],
        watch: {
            hasAddUpdateAddressApiError() { // let user hit postal code search again after API error
                this.addressSelectedFromModal = false;
            },
            isDefaultShip(newValue) {
                this.$emit('updateDefaultShip', newValue);
            },
            phoneNumberData(newVal) {
                this.cleanNumericField('phoneNumberData', newVal);
            },
            postalCodeData() {
                if(!this.addressSelectedFromModal) this.handlePostalCodeDataUpdate();
            },
            suggestionPick(newVal) {
                this.$emit('updateSuggestionPick', newVal);
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.setPrefilledData(this.prefilledFormValues);
                this.$nextTick(() => {
                    // Trigger postal code search for edit-address flow if postalCode value exists
                    this.isEditAddressFlow = Boolean(this.prefilledFormValues?.PostalCodeValue !== null);
                });
            });
        },
        methods: {
            async handleAddressSelection(addressData) {
                this.addressSelectedFromModal = true;
                await this.$nextTick();
                await this.updateFields(addressData);

                // Bug 299867: Validate before submitting
                await this.$nextTick();
                this.$v.$touch();

                if(this.$v.$invalid) {
                    this.addressSelectedFromModal = false;
                    return;
                }

                this.$emit('save', this.updatedAddress);
            },
            async handleSave() {
                this.$v.$touch();
                if(this.$v.$invalid || this.postalCodeApiValidationError) return;

                this.$emit('validationApiError', { clear: true });

                const result = await this.validateAddressWithInternalDataset(); // modal opens inside the mixin when invalid

                if(result?.isValid) {
                    this.$emit('save', this.updatedAddress);
                    return;
                }

                if(result?.errors?.length) {
                    this.$emit('validationApiError', { error: result.errors, clear: false });
                }
            },
            setPrefilledData() {
                this.nameData = this.prefilledFormValues?.NameValue || '';
                this.phoneNumberData = this.prefilledFormValues?.PhoneNumberValue || '';
                this.postalCodeData = this.prefilledFormValues?.PostalCodeValue || '';
                this.stateMxData = this.prefilledFormValues?.StateFullName || '';
                this.cityData = this.prefilledFormValues?.CityValue || '';
                this.suburbData = this.prefilledFormValues?.SuburbValue || '';
                this.address_1Data = this.prefilledFormValues?.Address_1Value || '';
                this.address_2Data = this.prefilledFormValues?.Address_2Value || '';
                this.deliveryInstructionsData = this.prefilledFormValues?.DeliveryInstructionsValue || '';
                this.isDefaultShip = this.prefilledFormValues?.IsDefault || false;
            }
        }

    };
</script>

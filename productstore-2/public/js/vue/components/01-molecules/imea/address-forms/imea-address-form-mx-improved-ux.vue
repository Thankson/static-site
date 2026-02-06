<template>
    <div class="m-imeaAddressFormMxImprovedUX relative">
        <!-- Show spinner while /searchAddress API is being loaded -->
        <div
            v-if="showLoading"
            class="absolute flex top-0 bottom-0 left-0 right-0 justify-center items-center z-1 opacity-50 bg-white">
            <a-loading-spinner
                :visible="true"
                aria-hidden="true">
            </a-loading-spinner>
        </div>
        <div class="flex flex-col md:flex-row justify-between">
            <!-- Postal Code -->
            <div class="flex-1 md:mr-15 my-10">
                <div class="flex items-end justify-between">
                    <label
                        class="text-sm font-medium uppercase"
                        for="postalCode"
                        v-html="getLabel('PostalCode')"
                    />
                    <InputCharacterCounter
                        :value="postalCodeData"
                        :max-length="getMaxLength('postalCode')"
                    />
                </div>
                <input-basic
                    id="postalCode"
                    v-model="postalCodeData"
                    data-testid="input-postalCode"
                    name="postalCode"
                    auto-complete="off"
                    :max-length="getMaxLength('postalCode')"
                    :class="{ '-isInvalid': postalCodeDataError }"
                    aria-describedby="postalCodeErrorMsg"
                    :placeholder="labels.PostalCode && labels.PostalCode.Placeholder"
                    @keyup="handleInputChange($event)"
                    @keydown="handleNonNumericValue"
                />
                <FormFieldErrorMessage
                    id="postalCodeErrorMsg"
                    data-testid="paragraph-postalCodeErrorMsg"
                    :is-visible="postalCodeDataError"
                    :msg="postalCodeDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>

            <!-- State -->
            <div class="flex-1 md:ml-15 py-10">
                <div class="flex items-end justify-between">
                    <label
                        class="text-sm font-medium uppercase"
                        for="stateMx"
                        v-html="getLabel('State')"
                    />
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
                    @blur="handleInputChange()"
                />
                <input-basic
                    v-else
                    id="stateMx"
                    v-model="stateMxData"
                    data-testid="input-state"
                    name="state"
                    auto-complete="off"
                    :class="{ '-isInvalid': stateMxDataError }"
                    :disabled="true"
                    aria-describedby="stateErrorMsg"
                />
                <FormFieldErrorMessage
                    id="stateErrorMsg"
                    data-testid="paragraph-stateErrorMsg"
                    :is-visible="stateMxDataError"
                    :msg="stateMxDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>
        </div>

        <div class="flex flex-col md:flex-row justify-between">
            <!-- Municipality/City -->
            <div class="flex-1 md:mr-15 my-10">
                <div class="flex items-end justify-between">
                    <label
                        class="text-sm font-medium uppercase"
                        for="city"
                        v-html="getLabel('City')"
                    />
                    <InputCharacterCounter
                        v-if="enableCityField"
                        :value="cityData"
                        :max-length="getMaxLength('city')"
                    />
                </div>
                <input-basic
                    id="city"
                    v-model="cityData"
                    name="city"
                    auto-complete="off"
                    data-testid="input-city"
                    :max-length="getMaxLength('city')"
                    :class="{ '-isInvalid': cityDataError }"
                    aria-describedby="cityDataErrorMsg"
                    :disabled="!enableCityField"
                    @keyup="handleInputChange($event)"

                />
                <FormFieldErrorMessage
                    id="cityDataErrorMsg"
                    data-testid="paragraph-cityDataErrorMsg"
                    :is-visible="cityDataError"
                    :msg="cityDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>

            <!-- Colony -->
            <div class="flex-1 md:ml-15 py-10">
                <div class="flex items-end justify-between">
                    <label
                        class="text-sm font-medium uppercase"
                        for="suburb"
                        v-html="getLabel('Suburb')"
                    />
                    <InputCharacterCounter
                        v-if="enableSuburbField"
                        :value="suburbData"
                        :max-length="getMaxLength('suburb')"
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
                    @blur="handleInputChange()"
                />
                <input-basic
                    v-else
                    id="suburb"
                    v-model="suburbData"
                    name="suburb"
                    auto-complete="off"
                    data-testid="input-suburb"
                    :max-length="getMaxLength('suburb')"
                    :class="{ '-isInvalid': suburbDataError }"
                    aria-describedby="suburbDataErrorMsg"
                    :disabled="!enableSuburbField"
                    @keyup="handleInputChange($event)"
                />
                <FormFieldErrorMessage
                    id="suburbDataErrorMsg"
                    data-testid="paragraph-suburbDataErrorMsg"
                    :is-visible="suburbDataError"
                    :msg="suburbDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>
        </div>

        <div class="flex flex-col md:flex-row justify-between">
            <!-- Street and External Number -->
            <div
                v-click-outside="closeSuggestionList"
                class="flex-1 md:mr-15 my-10 relative"
            >
                <div class="flex items-end justify-between">
                    <div class="flex mb-5">
                        <label
                            class="text-sm font-medium uppercase"
                            for="address_1"
                            v-html="getLabel('Address_1')"
                        />
                        <m-tooltip v-if="labels.Tooltip && labels.Tooltip.ExteriorNumber" class="ml-5" tooltip-icon="info" :is-within-form="true">
                            <div v-html="labels.Tooltip.ExteriorNumber"></div>
                        </m-tooltip>
                    </div>
                    <InputCharacterCounter
                        :value="address_1Data"
                        :max-length="getMaxLength('address_1')"
                    />
                </div>
                <input-basic
                    id="address_1"
                    v-model="address_1Data"
                    name="address_1"
                    auto-complete="off"
                    data-testid="input-address1"
                    :max-length="getMaxLength('address_1')"
                    :class="{ '-isInvalid': address_1DataError }"
                    :disabled="!enableSecondaryFields"
                    aria-describedby="address_1ErrorMsg"
                    :placeholder="getLockedFieldsPlaceholder(labels.Address_1.Placeholder)"
                    @keyup="handleInputChange($event)"
                />
                <FormFieldErrorMessage
                    id="address_1ErrorMsg"
                    data-testid="paragraph-address_1ErrorMsg"
                    :is-visible="address_1DataError"
                    :msg="address_1DataErrorMsg"
                    modifier-classes="-no-icon"
                />
                <div v-if="loadingExp" class="a-loadingSpinner__input absolute right-10 top-30">
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
            <div class="flex-1 md:ml-15 py-10">
                <div class="flex items-end justify-between">
                    <div class="flex mb-5">
                        <label
                            class="text-sm font-medium uppercase"
                            for="address_2"
                            v-html="getLabel('Address_2')"
                        />
                        <m-tooltip v-if="labels.Tooltip && labels.Tooltip.InteriorNumber" class="ml-5" tooltip-icon="info" :is-within-form="true">
                            <div v-html="labels.Tooltip.InteriorNumber"></div>
                        </m-tooltip>
                    </div>
                    <InputCharacterCounter
                        :value="address_2Data"
                        :max-length="getMaxLength('address_2')"
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
                    aria-describedby="address_2ErrorMsg"
                    :placeholder="getLockedFieldsPlaceholder(labels.Address_2.Placeholder)"
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

        <div class="flex flex-col md:flex-row justify-between">
            <!-- Additional Address Information -->
            <div class="md:w-1_2 md:pr-15 py-10">
                <div class="flex">
                    <label
                        class="text-sm font-medium uppercase"
                        for="deliveryInstructions"
                        v-html="getLabel('DeliveryInstructions')"
                    />
                    <m-tooltip v-if="labels.Tooltip && labels.Tooltip.AdditionalInfo" class="ml-5" tooltip-icon="info" :is-within-form="true">
                        <div v-html="labels.Tooltip.AdditionalInfo"></div>
                    </m-tooltip>
                </div>
                <div class="flex items-end justify-between">
                    <p class="text-xs w-2_3">{{ additionalDetailsForDelivery }}</p>
                    <InputCharacterCounter
                        :value="deliveryInstructionsData"
                        :max-length="getMaxLength('deliveryInstructions')"
                    />
                </div>
                <textarea
                    id="deliveryInstructions"
                    v-model="deliveryInstructionsData"
                    class="a-textarea p-15 border-1 placeholder-gray min-h-90"
                    name="deliveryInstructions"
                    data-testid="textarea-deliveryInstructions"
                    :maxlength="getMaxLength('deliveryInstructions')"
                    :class="{ '-isInvalid': deliveryInstructionsDataError }"
                    :disabled="!enableSecondaryFields"
                    aria-describedby="deliveryInstructionsDataErrorMsg"
                    :placeholder="getLockedFieldsPlaceholder(labels.DeliveryInstructions.Placeholder)"
                />
                <FormFieldErrorMessage
                    id="deliveryInstructionsDataErrorMsg"
                    data-testid="paragraph-deliveryInstructionsDataErrorMsg"
                    :is-visible="deliveryInstructionsDataError"
                    :msg="deliveryInstructionsDataErrorMsg"
                    modifier-classes="-no-icon"
                />
            </div>
        </div>
        <div v-if="!!validationApiError" class="text-red text-sm">
            <p>{{ validationApiError }}</p>
        </div>
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
        <!-- Validated Address Picker Modal -->
        <ValidatedAddressPickerModal
            :delivery-instructions-data="deliveryInstructionsData"
            :formatted-user-entered-address-for-modal="formattedUserEnteredAddressForModal"
            :formatted-suggested-address-list-for-modal="formattedSuggestedAddressListForModal"
            :has-more-available-suggestions="hasMoreAvailableSuggestions"
            :labels="labels.ValidatedAddressPickerModal"
            :show-modal="showValidatedAddressPickerModal"
            @close="setHasMxAddressValidated(false)"
            @choseValidatedAddress="chosenValidatedAddress"
            @choseUserEnteredAddress="chosenUserEnteredAddress"
        />
    </div>
</template>

<script>
    import addressFormMx from '../../../../mixins/address-form-mx';
    import searchAddressMx from '../../../../mixins/search-address-mx';
    import eventBus from '../../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../form-field-error-message/FormFieldErrorMessage.vue';
    import InputCharacterCounter from '../../input-character-counter/input-character-counter.vue';
    import MTooltip from '@productstore/source/js/vue/components/01-molecules/tooltip/tooltip.vue';
    import ValidatedAddressPickerModal from '../../../01-molecules/modal/validated-address-picker-modal.vue';

    export default {
        name: 'MImeaAddressFormMxImprovedUx',
        components: {
            MTooltip,
            FormFieldErrorMessage,
            InputCharacterCounter,
            ValidatedAddressPickerModal
        },
        mixins: [ addressFormMx, searchAddressMx],
        props: {
            addressEntryEnhancementEnabled: {
                type: Boolean,
                default: false
            },
            isCollapseOpen: {
                type: Boolean,
                required: true
            },
            isImea: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                validationApiError: ''
            };
        },
        computed: {
            stateMx() {
                const states = this.labels?.State?.States;
                const stateList = states
                    .sort((a, b) => a.StateLongName.localeCompare(b.StateLongName))
                    .map(state => state.StateLongName);
                stateList.unshift(this.statePlaceholder);
                return stateList;
            },
            statePlaceholder() {
                return this.labels?.State?.Placeholder || '';
            }
        },
        watch: {
            postalCodeData() {
                if(!this.userFinalizedAddress || !this.addressSelectedFromModal) this.handlePostalCodeDataUpdate();
            }
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            async handleAddressSelection(addressData) {
                this.addressSelectedFromModal = true;
                this.userFinalizedAddress = true;
                await this.$nextTick();
                await this.updateFields(addressData);

                // Validate before submitting
                await this.$nextTick();
                this.$v.$touch();

                if(this.$v.$invalid) {
                    this.addressSelectedFromModal = false;
                    this.userFinalizedAddress = false;
                    eventBus.$emit('setIsMxAddressValidationPending', false);
                    return;
                }

                eventBus.$emit('setIsMxAddressValidationPending', false);
                this.submitAddress();
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    if(this.isCollapseOpen) {
                        this.$v.$touch();
                        if(!this.$v.$invalid) {
                            if(!this.userFinalizedAddress) {
                                eventBus.$emit('setIsMxAddressValidationPending', true);
                                this.validateWithInternalDataset();
                            }
                        } else eventBus.$emit('getInput', false, false);
                    } else eventBus.$emit('getInput', false, true);
                });
            },
            setHasMxAddressValidated(val) {
                this.showValidatedAddressPickerModal = false;
            },
            submitAddress() {
                const formData = {
                    AddressLine1: this.address_1Data,
                    AddressLine2: this.address_2Data,
                    City: this.cityData,
                    DeliveryInstructions: this.deliveryInstructionsData,
                    Suburb: this.suburbData,
                    State: this.stateMxData,
                    Province: this.stateMxData,
                    PostalCode: this.postalCodeData,
                    Country: 'Mexico',
                    IsUserOverride: !this.suggestionPick // Post false when user chooses invalid address
                };
                eventBus.$emit('getInput', formData, true);
            },
            async validateWithInternalDataset() {
                this.validationApiError = '';
                const validationResult = await this.validateAddressWithInternalDataset();
                if(validationResult.isValid) {
                    this.userFinalizedAddress = true;
                    eventBus.$emit('setIsMxAddressValidationPending', false);
                    this.submitAddress();
                }
                if(validationResult.hasSuggestions) {
                    // Modal will be shown by validateAddressWithInternalDataset
                    return;
                }
                if(validationResult.errors) {
                    this.validationApiError = validationResult.errors[0].Translation;
                }
            }
        }
    };
</script>

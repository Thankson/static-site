<template>
    <div class="o-checkoutAddAddressEurope o-checkoutAddAddress pt-40" data-testid="container-checkoutAddAddress">
        <form @submit.prevent>
            <div class="o-checkoutAddAddress__grid">
                <div class="o-checkoutAddAddress__field">
                    <div class="m-formField -select">
                        <label class="m-formField__label" for="countrySelected">
                            {{ getLocalizationProp('Labels.ShippingSection.Country') }}
                        </label>
                        <v-select
                            v-if="countriesLabels && countriesLabels.length"
                            id="countrySelected"
                            :options="countriesLabels.toString()"
                            :values="countriesValues"
                            :initial="initialCountry"
                            arrow-tailwind-color="gray-120"
                            arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                            :aria-label="getLocalizationProp('Labels.ShippingSection.Country')"
                            select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                            @change="selectedCountry"
                        />
                    </div>
                </div>
                <div class="o-checkoutAddAddress__field">
                    <div class="o-addressForm__field">
                        <label class="m-formField__label" for="name">
                            {{ getLocalizationProp('Labels.ShippingSection.Name') }}
                        </label>
                        <input-basic
                            id="name"
                            name="name"
                            :class="{ '-isInvalid': nameDataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.NamePlaceholder')"
                            :value="nameData"
                            aria-describedby="nameErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="nameDataError"
                            id="nameErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ nameDataErrorMsg }}
                        </div>
                    </div>
                </div>
                <div
                    v-if="isHungary"
                    class="o-checkoutAddAddress__field"
                >
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="city"
                            v-html="formatLabel('city', 'Labels.ShippingSection.City')"
                        />
                        <input-basic
                            id="city"
                            name="city"
                            :class="{ '-isInvalid': cityDataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.CityPlaceholder')"
                            :value="cityData"
                            aria-describedby="cityErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="cityDataError"
                            id="cityErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ cityDataErrorMsg }}
                        </div>
                    </div>
                </div>
                <div class="o-checkoutAddAddress__field">
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="address_1"
                            v-html="formatLabel('address1', 'Labels.ShippingSection.Address1')"
                        />
                        <input-basic
                            id="address_1"
                            name="address_1"
                            :class="{ '-isInvalid': address_1DataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.Address1Placeholder')"
                            :value="address_1Data"
                            aria-describedby="address_1ErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="address_1DataError"
                            id="address_1ErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ address_1DataErrorMsg }}
                        </div>
                    </div>
                </div>
                <div class="o-checkoutAddAddress__field">
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="address_2"
                            v-html="formatLabel('address2', 'Labels.ShippingSection.Address2')"
                        />
                        <input-basic
                            id="address_2"
                            name="address_2"
                            :class="{ '-isInvalid': address_2DataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.Address2Placeholder')"
                            :value="address_2Data"
                            aria-describedby="address_2ErrorMsg"
                            @keyup="setInput"

                        />
                        <div
                            v-if="address_2DataError"
                            id="address_2ErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ address_2DataErrorMsg }}
                        </div>
                    </div>
                </div>
                <div
                    v-if="isAustriaGermanyLithuaniaLatviaNetherlandsOrPoland || isIreland || isUnitedKingdom"
                    class="o-checkoutAddAddress__field"
                >
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="city"
                            v-html="formatLabel('city', 'Labels.ShippingSection.City')"
                        />
                        <input-basic
                            id="city"
                            name="city"
                            :class="{ '-isInvalid': cityDataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.CityPlaceholder')"
                            :value="cityData"
                            aria-describedby="cityErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="cityDataError"
                            id="cityErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ cityDataErrorMsg }}
                        </div>
                    </div>
                </div>
                <div
                    v-if="isIreland"
                    class="o-checkoutAddAddress__field"
                >
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="county"
                            v-html="formatLabel('county', 'Labels.ShippingSection.County')"
                        />
                        <input-basic
                            id="county"
                            name="county"
                            :class="{ '-isInvalid': countyDataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.CountyPlaceholder')"
                            :value="countyData"
                            aria-describedby="countyErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="countyDataError"
                            id="countyErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ countyDataErrorMsg }}
                        </div>
                    </div>
                </div>
                <div class="o-checkoutAddAddress__field">
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="postalCode"
                            v-html="formatLabel('postalCode', 'Labels.ShippingSection.PostalCode')"
                        />
                        <input-basic
                            id="postalCode"
                            name="postalCode"
                            :class="{ '-isInvalid': postalCodeDataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.PostalCodePlaceholder')"
                            :value="postalCodeData"
                            aria-describedby="postalCodeErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="postalCodeDataError"
                            id="postalCodeErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            <span v-if="$v.postalCodeData.required === false">
                                {{ getLocalizationProp('Labels.ShippingSection.PostalCodeError') }}
                            </span>
                            <span v-else-if="$v.postalCodeData.postalCode === false">
                                {{ getLocalizationProp('Labels.ShippingSection.PostalCodeInvalidError') }}
                            </span>
                        </div>
                    </div>
                </div>
                <div
                    v-if="isFinlandLuxembourgBelgiumEstoniaSpainItaly"
                    class="o-checkoutAddAddress__field"
                >
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="city"
                            v-html="formatLabel('city', 'Labels.ShippingSection.City')"
                        />
                        <input-basic
                            id="city"
                            name="city"
                            :class="{ '-isInvalid': cityDataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.CityPlaceholder')"
                            :value="cityData"
                            aria-describedby="cityErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="cityDataError"
                            id="cityErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ cityDataErrorMsg }}
                        </div>
                    </div>
                </div>
                <div
                    v-if="isIreland || isUnitedKingdom"
                    class="o-checkoutAddAddress__field"
                >
                    <div class="o-addressForm__field">
                        <label
                            class="m-formField__label"
                            for="phoneNumber"
                            v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber')"
                        />
                        <input-basic
                            id="phoneNumber"
                            name="phoneNumber"
                            :class="{ '-isInvalid': phoneNumberDataError }"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.PhoneNumberPlaceholder')"
                            :value="phoneNumberData"
                            aria-describedby="phoneNumberErrorMsg"
                            @keyup="setInput"
                        />
                        <div
                            v-if="phoneNumberDataError"
                            id="phoneNumberErrorMsg"
                            class="o-checkoutAddAddress__fieldError"
                            data-testid="container-checkoutAddAddress_fieldError"
                        >
                            {{ phoneNumberDataErrorMsg }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="m-formField">
                <label
                    class="m-formField__label"
                    for="deliveryInstructions"
                    v-html="formatLabel('deliveryInstructions', 'Labels.ShippingSection.DeliveryInstructions')"
                />
                <textarea
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    class="m-formField__textArea -addressForm -checkoutAddressFormHu"
                    :class="{ '-isInvalid': deliveryInstructionsDataError }"
                    :placeholder="getLocalizationProp('Labels.ShippingSection.DeliveryInstructionsPlaceholder')"
                    :value="deliveryInstructionsData"
                    aria-describedby="deliveryInstructionsErrorMsg"
                    @keyup="setInput"
                />
                <div
                    v-if="deliveryInstructionsDataError"
                    id="deliveryInstructionsErrorMsg"
                    class="o-checkoutAddAddress__fieldError"
                    data-testid="container-checkoutAddAddress_fieldError"
                >
                    {{ deliveryInstructionsDataErrorMsg }}
                </div>
            </div>
            <div v-if="isAddNewAddressForm" class="o-checkoutAddAddress__field -checkbox">
                <m-checkbox
                    v-model="defaultShip"
                    name="defaultShip"
                    class="o-checkoutAddAddress__checkbox"
                    label-mods="text-base font-normal"
                    data-testid="input-checkoutAddAddress_checkbox"
                    :label="getLocalizationProp('Labels.ShippingSection.DefaultShipping')"
                />
            </div>
            <div class="o-checkoutAddAddress__field -actions">
                <div class="o-checkoutAddAddress__action -continue">
                    <button
                        class="o-addressForm__button -save"
                        :disabled="isLoadingSubmitForm"
                        data-testid="button-addNewAddressSaveBtn"
                        @click="[checkSave($event), gtmTrackAction({id: 452, text: getButtonText}, $event)]"
                    >
                        {{ getButtonText }}
                    </button>
                </div>
                <div
                    v-if="(isAddNewAddressForm || isAddressEditMode) && showCancelButton" class="o-checkoutAddAddress__action -cancel"
                >
                    <button
                        class="o-addressForm__button a-authorBtn bg-white rounded"
                        @click="closeThisNewAddForm"
                    >
                        {{ getLocalizationProp('Labels.CTA.Cancel') }}
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import addressFormLogic from '../../../mixins/address-form';
    import checkoutAddressFormLogic from '../../../mixins/checkout-address-form';

    export default {
        name: 'OCheckoutAddAddressEurope',
        mixins: [ addressFormLogic, checkoutAddressFormLogic ],
        computed: {
            isAustriaGermanyLithuaniaLatviaNetherlandsOrPoland() {
                return this.isAustria || this.isGermany || this.isLithuania || this.isLatvia || this.isNetherlands || this.isPoland;
            },
            isFinlandLuxembourgBelgiumEstoniaSpainItaly() {
                return this.isFinland || this.isLuxembourg || this.isBelgium || this.isEstonia || this.isSpain || this.isItaly;
            }
        }
    };
</script>

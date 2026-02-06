<template>
    <div class="o-checkoutAddAddressTaiwan o-checkoutAddAddress" data-testid="container-checkoutAddAddress">
        <div v-if="heading" class="o-checkoutAddAddress__heading" :class="showBusinessAddForm ? 'pt-40' : ''">
            {{ heading }}
        </div>

        <!-- #region address-form-->
        <form class="o-checkoutAddAddress__grid relative" @submit.prevent>
            <!-- Full Name -->
            <div class="o-checkoutAddAddress__field">
                <div class="o-addressForm__field">
                    <label
                        class="m-formField__label"
                        for="name"
                        v-html="getLocalizationProp('Labels.ShippingSection.FullName', 'RECIPIENT NAME')"
                    >
                    </label>
                    <input-basic
                        id="name"
                        v-model="nameData"
                        vmodel="nameData"
                        name="name"
                        :class="{ '-isInvalid': nameDataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.NamePlaceholder', 'Name is required')"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="nameDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ nameDataErrorMsg }}
                    </div>
                </div>
            </div>

            <!-- City -->
            <div class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -city -taiwan"
                    :class="{'-hasErrorMsg': cityDataError}"
                >
                    <label class="m-formField__label" for="city">
                        {{ getLocalizationProp('Labels.ShippingSection.City') }}
                    </label>
                    <v-select
                        id="city"
                        vmodel="cityData"
                        name="city"
                        :options="city"
                        :values="city"
                        :initial="!cityData ? city[0] : cityData"
                        :class="{ '-error': cityDataError }"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        arrow-tailwind-color="gray-120"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        aria-describedby="cityErrorMsg"
                        :aria-label="getLocalizationProp('Labels.ShippingSection.City', 'City')"
                        @change="handleTwCitySelectChange($event)"
                    />
                    <div v-if="cityDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ cityDataErrorMsg }}
                    </div>
                </div>
            </div>

            <!-- Suburb -->
            <div class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -suburb -taiwan"
                    :class="{'-hasErrorMsg': suburbDataError}"
                >
                    <label class="m-formField__label" for="suburb">
                        {{ getLocalizationProp('Labels.ShippingSection.Suburb') }}
                    </label>
                    <v-select
                        id="suburb"
                        vmodel="suburbData"
                        name="suburb"
                        :options="suburb"
                        :values="suburb"
                        :initial="!suburbData ? suburb[0] : suburbData"
                        :class="{ '-error': suburbDataError }"
                        :readonly="isTwSuburbSelectReadOnly"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        arrow-tailwind-color="gray-120"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        aria-describedby="suburbErrorMsg"
                        :aria-label="getLocalizationProp('Labels.ShippingSection.Suburb', 'Suburb')"
                        @change="handleTwSuburbSelectChange($event)"
                    />
                    <div v-if="suburbDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ suburbDataErrorMsg }}
                    </div>
                </div>
            </div>

            <!-- Postal Code -->
            <div class="o-checkoutAddAddress__field">
                <div class="o-addressForm__field -postalCode">
                    <label
                        class="m-formField__label"
                        for="postalCode"
                        v-html="formatLabel('postalCode', 'Labels.ShippingSection.PostalCode', 'POSTAL CODE')"
                    >
                    </label>
                    <input-basic
                        id="postalCode"
                        name="postalCode"
                        vmodel="postalCodeData"
                        :value="postalCodeData"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.PostalCodePlaceholder', '')"
                        :class="{ '-isInvalid': postalCodeDataError }"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="postalCodeDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="$v.postalCodeData.required === false">{{ getLocalizationProp('Labels.ShippingSection.PostalCodeError') }}</span>
                        <span v-else-if="$v.postalCodeData.postalCode === false">{{ getLocalizationProp('Labels.ShippingSection.PostalCodeInvalidError') }}</span>
                    </div>
                </div>
            </div>

            <!-- Address_1 -->
            <div class="o-checkoutAddAddress__field">
                <div
                    ref="address_1"
                    class="o-addressForm__field -address1"
                    auto-complete="off"
                >
                    <label
                        class="m-formField__label"
                        for="address_1"
                    >
                        {{ getLocalizationProp('Labels.ShippingSection.Address1', 'ADDRESS 1') }}
                    </label>
                    <input-basic
                        id="address_1"
                        ref="address_1input"
                        v-model.trim="address_1Data"
                        vmodel="address_1Data"
                        name="address_1"
                        auto-complete="off"
                        :class="{ '-isInvalid': address_1DataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address1Placeholder', 'Street Address')"
                        @keyup="setInput"
                        @change="setInput"
                        @keydown="validateAddress"

                    />
                    <div v-if="address_1DataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="$v.address_1Data.maxLength === false">{{ getFormattedMaxLengthError('address_1Data') }}</span>
                        <span v-else-if="$v.address_1Data.required === false">{{ getLocalizationProp('Labels.ShippingSection.Address1Required', 'Address1 Required') }}</span>
                    </div>

                </div>
            </div>

            <!-- Address_2 -->
            <div class="o-checkoutAddAddress__field">
                <div class="o-addressForm__field -address2">
                    <label
                        class="m-formField__label"
                        for="address_2"
                        v-html="formatLabel('address2', 'Labels.ShippingSection.Address2', 'ADDRESS 2')"
                    >
                    </label>
                    <input-basic
                        id="address_2"
                        vmodel="address_2Data"
                        name="address_2"
                        :class="{ '-isInvalid': address_2DataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address2Placeholder', 'Apt / PO Box / Suite / Building / Etc')"
                        :value="address_2Data"
                        @keyup="setInput"
                        @change="setInput"
                        @keydown="validateAddress"
                    />
                    <div v-if="address_2DataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="$v.address_2Data.maxLength === false">{{ getFormattedMaxLengthError('address_2Data') }}</span>
                    </div>
                </div>
            </div>

            <!-- Phone Number -->
            <div class="o-checkoutAddAddress__field">
                <div class="o-addressForm__field -phonenumber">
                    <label
                        class="m-formField__label"
                        for="phoneNumber"
                        v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', 'Phone Number')"
                    >
                    </label>
                    <input-basic
                        id="phoneNumber"
                        vmodel="phoneNumberData"
                        name="phoneNumber"
                        :class="{ '-isInvalid': phoneNumberDataError }"
                        :value="phoneNumberData"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.PhoneNumberPlaceholder')"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="phoneNumberDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="$v.phoneNumberData.phoneNumber === false">{{ getLocalizationProp('Labels.ShippingSection.PhoneNumberError', 'Phone Number invalid') }}</span>
                    </div>
                </div>
            </div>

            <!-- Delivery Instructions -->
            <div class="o-checkoutAddAddress__field">
                <div class="m-formField -textArea">
                    <label
                        class="m-formField__label"
                        for="delivery"
                        v-html="formatLabel('deliveryInstructions', 'Labels.ShippingSection.DeliveryInstructions', 'DELIVERY INSTRUCTIONS')"></label>
                    <input-basic
                        id="deliveryInstructions"
                        :class="{ '-isInvalid': deliveryInstructionsDataError }"
                        vmodel="deliveryInstructionsData"
                        :value="deliveryInstructionsData"
                        name="deliveryInstructions"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.DeliveryInstructionsPlaceholder', 'Special instructions for carrier')"
                        :max-length="deliveryInstructionsMaxLength"
                        @keyup="setInput"
                        @change="setInput">
                    </input-basic>
                </div>
            </div>

            <!-- Make-default Address checkbox -->
            <div v-if="isAddNewAddressForm" class="o-checkoutAddAddress__field -checkbox -makeDefault">
                <m-checkbox
                    v-model="defaultShip"
                    label-mods="text-base font-normal"
                    class="o-checkoutAddAddress__checkbox"
                    name="defaultShip"
                    data-testid="input-checkoutAddAddress_checkbox"
                    :label="getLocalizationProp('Labels.ShippingSection.DefaultShipping', 'Make this my Default Shipping Address')"
                >
                </m-checkbox>
            </div>

            <div class="o-checkoutAddAddress__field -actions">
                <!-- Continue -->
                <div class="o-checkoutAddAddress__action -continue">
                    <button class="o-addressForm__button -save" :disabled="isLoadingSubmitForm" data-testid="button-addNewAddressSaveBtn" @click="[checkSave($event), gtmTrackAction({id: 452, text: getButtonText}, $event)]">
                        {{ getButtonText }}
                    </button>
                </div>

                <!-- Cancel -->
                <div v-if="(isAddNewAddressForm || isAddressEditMode) && showCancelButton" class="o-checkoutAddAddress__action -cancel">
                    <button class="o-addressForm__button a-authorBtn bg-white rounded" @click="closeThisNewAddForm">
                        {{ getLocalizationProp('Labels.CTA.Cancel', 'Cancel') }}
                    </button>
                </div>
            </div>
        </form>
        <!-- #endregion address-form-->

        <div>
            <div data-loading="address__loading" class="w-40">
                <a-loading-spinner :visible="isLoadingSubmitForm" />
            </div>
            <p
                v-for="(error, index) in listError"
                :key="uniqid(index)"
                class="text-error">
                {{ error.Translation }}
            </p>
        </div>
    </div>
</template>
<script>
    import addressFormLogic from '../../../mixins/address-form';
    import checkoutAddressFormLogic from '../../../mixins/checkout-address-form';

    export default {
        name: 'OCheckoutAddAddress',
        mixins: [ addressFormLogic, checkoutAddressFormLogic ]
    };
</script>

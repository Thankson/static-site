<template>
    <div class="o-checkoutAddAddress" data-testid="container-checkoutAddAddress">
        <div v-if="heading" class="o-checkoutAddAddress__heading" :class="showBusinessAddForm ? 'pt-40' : ''">
            {{ heading }}
        </div>

        <!-- #region address-form-->
        <form class="o-checkoutAddAddress__grid relative" @submit.prevent>
            <!-- Show spinner while /searchAddress API is being loaded -->
            <div
                v-if="showLoading && showMxAddressEntryEnhancementFields"
                class="absolute flex top-0 bottom-0 left-0 right-0 justify-center items-center z-1 opacity-50 bg-white">
                <a-loading-spinner
                    :visible="true"
                    aria-hidden="true">
                </a-loading-spinner>
            </div>
            <!-- Full Name -->
            <div v-if="!showBusinessAddForm && !showMxAddressEntryEnhancementFields" class="o-checkoutAddAddress__field" :class="{'-fullWidth' : isRiverbendSubscription}">
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
                        {{ getLocalizationProp('Labels.ShippingSection.FullNameError', 'error') }}
                    </div>
                </div>
            </div>

            <!-- Full Name -->
            <div v-else-if="!showBusinessAddForm && showMxAddressEntryEnhancementFields" class="o-checkoutAddAddress__field">
                <div class="o-addressForm__field">
                    <div class="flex items-end justify-between">
                        <label
                            class="m-formField__label"
                            for="name"
                            v-html="getLocalizationProp('Labels.ShippingSection.FullName')"
                        />
                        <InputCharacterCounter
                            :value="nameData"
                            :max-length="getMaxLength('name')"
                            :is-over-the-character-limit="!checkOverTheLimitValidation('nameData')"
                            modifier-classes="pb-5"
                        />
                    </div>
                    <input-basic
                        id="name"
                        name="name"
                        data-testid="input-name"
                        :max-length="getMaxLength('name')"
                        :class="{ '-isInvalid': nameDataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.NamePlaceholder')"
                        :value="nameData"
                        aria-describedby="nameErrorMsg"
                        @keyup="setInput"
                    />
                    <div
                        v-if="nameDataError"
                        id="nameErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError"
                    >
                        {{ nameDataErrorMsg }}
                    </div>
                </div>
            </div>
            <!-- Phone Number - Prepend -->
            <div
                v-if="showMxAddressEntryEnhancementFields"
                class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -phonenumber">
                    <div class="flex items-end justify-between">
                        <label
                            class="m-formField__label"
                            for="phoneNumber"
                            v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber')"
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
                        name="phoneNumber"
                        data-testid="input-phoneNumber"
                        :max-length="getMaxLength('phoneNumber')"
                        :class="{ '-isInvalid': phoneNumberDataError }"
                        :value="phoneNumberData"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.PhoneNumberPlaceholder')"
                        aria-describedby="phoneNumberErrorMsg"
                        @keyup="setInput"
                        @keydown="handleNonNumericValue"
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

            <!-- Country -->
            <div v-if="!isRiverbendSubscription && showFields.includes('country')" class="o-checkoutAddAddress__field" :class="countryBusinessClass">
                <div class="m-formField -select">
                    <label
                        class="m-formField__label"
                        for="countrySelected"
                    >
                        {{ getLocalizationProp('Labels.ShippingSection.Country', 'COUNTRY') }}
                    </label>
                    <v-select
                        v-if="countriesLabels && countriesLabels.length"
                        id="countrySelected"
                        :options="countriesLabels.toString()"
                        :values="countriesValues"
                        vmodel="chosenCountry"
                        :initial="initialCountry"
                        arrow-tailwind-color="gray-120"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        :aria-label="getLocalizationProp('Labels.ShippingSection.Country', 'Country')"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        @change="selectedCountry"
                    >
                    </v-select>
                </div>
            </div>

            <!-- Phone Number - China -->
            <div
                v-if="isChina && showFields.includes('phoneNumber')"
                class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -phonenumber">
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
                        <span v-if="$v.phoneNumberData.required === false || $v.phoneNumberData.phoneNumber === false">{{ getLocalizationProp('Labels.ShippingSection.PhoneNumberError', 'Phone Number invalid') }}</span>
                    </div>
                </div>
            </div>

            <!-- Area - For CN -->
            <div
                v-if="showAreaCn"
                class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -areaCn">
                    <label
                        class="m-formField__label"
                        for="areaCn"
                    >
                        {{ getLocalizationProp('Labels.ShippingSection.Area') }}
                    </label>
                    <m-area-select
                        id="areaCn"
                        ref="areaCnRef"
                        class="relative"
                        name="areaCn"
                        :script-id="scriptId"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.AreaPlaceholder')"
                        :use-in-vue-component="true"
                        :address-id="addressId"
                        :is-field-error="provinceDataError || cityDataError || suburbDataError"
                        :save-province.sync="provinceData"
                        :save-city.sync="cityData"
                        :save-region.sync="suburbData"
                    ></m-area-select>
                    <div v-if="provinceDataError || cityDataError || suburbDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="[$v.provinceData.required, $v.cityData.required, $v.suburbData.required].every(i => i === false)">{{ getLocalizationProp('Labels.ShippingSection.AreaRequired') }}</span>
                        <span v-else-if="[$v.provinceData.isValidCnAreaName, $v.cityData.isValidCnAreaName, $v.suburbData.isValidCnAreaName].includes(false)">{{ getLocalizationProp('Labels.ShippingSection.AreaInvalidFormat') }}</span>
                    </div>
                </div>
            </div>

            <div v-if="showMxAddressEntryEnhancementFields" class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -postalCode">
                    <div class="flex items-end justify-between">
                        <label
                            class="m-formField__label"
                            for="postalCode"
                            v-html="formatLabel('postalCode', 'Labels.ShippingSection.PostalCode')"
                        />
                        <InputCharacterCounter
                            :value="postalCodeData"
                            :max-length="getMaxLength('postalCode')"
                            modifier-classes="pb-5"
                        />
                    </div>
                    <input-basic
                        id="postalCode"
                        name="postalCode"
                        data-testid="input-postalCode"
                        :max-length="getMaxLength('postalCode')"
                        :value="postalCodeData"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.PostalCodePlaceholder')"
                        :class="{ '-isInvalid': postalCodeDataError || postalCodeApiValidationError}"
                        aria-describedby="postalCodeErrorMsg"
                        @keyup="setInput"
                        @keydown="handleNonNumericValue"
                    />
                    <div
                        v-if="postalCodeApiValidationError || postalCodeDataError"
                        id="postalCodeErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError"
                        v-html="postalCodeApiValidationErrorMsg ? postalCodeApiValidationErrorMsg : postalCodeDataErrorMsg"
                    />
                </div>
            </div>

            <!-- State MX (Estado) -->
            <div v-if="showMxAddressEntryEnhancementFields" class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -stateMx">
                    <label
                        class="m-formField__label"
                        for="stateMx"
                        v-html="formatLabel('stateMx', 'Labels.ShippingSection.State')"
                    >
                    </label>
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
                        data-testid="input-stateMx"
                        :disabled="true"
                        aria-describedby="stateErrorMsg"
                    />
                    <div
                        v-if="postalCodeAndStateMismatchError || stateMxDataError"
                        id="stateErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError">
                        {{ postalCodeAndStateMismatchError ? postalCodeAndStateMismatchErrorMsg : stateMxDataErrorMsg }}
                    </div>
                </div>
            </div>

            <!-- City MX -->
            <div
                v-if="showMxAddressEntryEnhancementFields"
                class="o-checkoutAddAddress__field">
                <div class="o-addressForm__field -city">
                    <div class="flex items-end justify-between">
                        <label
                            class="m-formField__label"
                            for="city"
                            v-html="formatLabel('city', 'Labels.ShippingSection.City')"
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
                        name="city"
                        data-testid="input-city"
                        :max-length="getMaxLength('city')"
                        :placeholder="enableCityField && getLocalizationProp('Labels.ShippingSection.CityPlaceholder')"
                        :class="{ '-isInvalid': cityDataError }"
                        :value="cityData"
                        aria-describedby="cityErrorMsg"
                        :disabled="!enableCityField"
                        @keyup="setInput"
                    />
                    <div
                        v-if="postalCodeAndCityMismatchError || cityDataError"
                        id="cityErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError"
                        v-html="postalCodeAndCityMismatchErrorMsg ? postalCodeAndCityMismatchErrorMsg : cityDataErrorMsg"
                    />
                </div>
            </div>

            <!-- Suburb / Colonia - Mx -->
            <div
                v-if="showMxAddressEntryEnhancementFields"
                class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -suburb">
                    <div class="flex items-end justify-between">
                        <label
                            class="m-formField__label"
                            for="suburb"
                            v-html="formatLabel('suburb', 'Labels.ShippingSection.Suburb')"
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
                        data-testid="input-suburb"
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
                        name="suburb"
                        data-testid="input-suburb"
                        :max-length="getMaxLength('suburb')"
                        :placeholder="enableSuburbField && getLocalizationProp('Labels.ShippingSection.SuburbPlaceholder')"
                        :value="suburbData"
                        :disabled="!enableSuburbField"
                        :class="{ '-isInvalid': suburbDataError }"
                        aria-describedby="suburbErrorMsg"
                        @keyup="setInput"
                    />
                    <div
                        v-if="postalCodeAndSuburbMismatchError || suburbDataError"
                        id="suburbErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError"
                        v-html="postalCodeAndSuburbMismatchErrorMsg ? postalCodeAndSuburbMismatchErrorMsg : suburbDataErrorMsg"
                    />
                </div>
            </div>

            <!-- Address_1 -->
            <!-- Mexico address entry enhancement is enabled  -->
            <div
                v-if="showMxAddressEntryEnhancementFields"
                class="o-checkoutAddAddress__field"
            >
                <div
                    ref="address_1"
                    v-clickoutside="closeSuggestionList"
                    class="o-addressForm__field -address1"
                    auto-complete="off"
                    @blur="showAddressList = false"
                >
                    <div class="flex items-end justify-between">
                        <div class="flex">
                            <label
                                class="m-formField__label"
                                for="address_1"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.Address1') }}
                            </label>
                            <div class="ml-5">
                                <m-tooltip class="mb-5" tooltip-icon="info">
                                    <div v-html="getLocalizationProp('Labels.ShippingSection.Tooltip.ExteriorNumber')"></div>
                                </m-tooltip>
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
                        name="address_1"
                        data-testid="input-address1"
                        :max-length="getMaxLength('address_1')"
                        auto-complete="off"
                        :class="{ '-isInvalid': address_1DataError }"
                        :disabled="!enableSecondaryFields"
                        :placeholder="getLockedFieldsPlaceholder(getLocalizationProp('Labels.ShippingSection.Address1Placeholder'))"
                        :value="address_1Data"
                        aria-describedby="address_1ErrorMsg"
                        @keyup="setInput"
                    />
                    <div v-if="loadingExp && !loadingInternalApi" class="o-checkoutAddAddress__loading">
                        <a-loading-spinner :visible="loadingExp" size="sm" />
                    </div>
                    <div v-if="showAddressList && addressList.length > 0 && !loadingInternalApi">
                        <perfect-scrollbar class="o-addressForm__list -suggest">
                            <ul ref="addressList" data-testid="listItem-experianSuggestionList">
                                <li
                                    v-for="(item, index) in addressList"
                                    :key="item.format"
                                    :ref="`sugg-${index}`"
                                    data-testid="listItem-experianSuggestion"
                                    class="o-addressForm__listItem -suggest"
                                    @keyup.prevent="suggestionList">
                                    <button ref="suggestion" class="o-addressForm__btn -suggest" tabindex="-1" @click.prevent="suggestionSelected(item)">
                                        {{ (!item.text) ? item.suggestion : item.text }}
                                    </button>
                                </li>
                            </ul>
                        </perfect-scrollbar>
                        <p class="sr-only" role="alert">
                            {{ addressList.length }} {{ getLocalizationProp('Labels.ShippingSection.SuggestionsInTotal') }}
                        </p>
                    </div>
                    <div
                        v-if="address_1DataError"
                        id="address_1ErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError"
                    >
                        {{ address_1DataErrorMsg }}
                    </div>
                </div>
            </div>
            <template v-else>
                <div
                    v-show="showFields.includes('address_1')"
                    class="o-checkoutAddAddress__field"
                    @copy="preventCopyPaste('address_1Data', $event)"
                    @paste="preventCopyPaste('address_1Data', $event)">
                    <div
                        ref="address_1"
                        v-clickoutside="closeSuggestionList"
                        class="o-addressForm__field -address1"
                        auto-complete="off"
                        @blur="showAddressList = false"
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
                            :readonly="address1Readonly"
                            @keyup="setInput"
                            @change="setInput"
                            @keydown="validateAddress"

                        />
                        <div v-if="loadingExp" class="o-checkoutAddAddress__loading">
                            <a-loading-spinner :visible="loadingExp" size="sm" />
                        </div>

                        <div v-if="showAddressList && addressList.length > 0">
                            <perfect-scrollbar class="o-addressForm__list -suggest">
                                <ul ref="addressList">
                                    <li
                                        v-for="(item, index) in addressList"
                                        :key="item.format"
                                        :ref="`sugg-${index}`"
                                        class="o-addressForm__listItem -suggest"
                                        @keyup.prevent="suggestionList">
                                        <button ref="suggestion" class="o-addressForm__btn -suggest" tabindex="-1" @click.prevent="suggestionSelected(item)">
                                            {{ (!item.text) ? item.suggestion : item.text }}
                                        </button>
                                    </li>
                                </ul>
                            </perfect-scrollbar>
                            <p class="sr-only" role="alert">
                                {{ addressList.length }} {{ getLocalizationProp('Labels.ShippingSection.SuggestionsInTotal', 'Suggestions in total') }}
                            </p>
                        </div>

                        <div v-if="address_1DataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                            <span v-if="copyPasteError && preventCopyPasteFeature">{{ getLocalizationProp('Labels.ShippingSection.CopyPasteError', 'Copy and Paste Not Allowed') }}</span>
                            <span v-if="specialCharsError && validateAddressFeature">{{ getLocalizationProp('Labels.ShippingSection.SpecialCharsError', 'No Special Characters Allowed') }}</span>
                            <span v-if="$v.address_1Data.pobox && !specialCharsError && !copyPasteError && $v.address_1Data.maxLength.$invalid">{{ getLocalizationProp('Labels.ShippingSection.Address1Error', 'error') }}</span>
                            <span v-if="$v.address_1Data.pobox === false">{{ getLocalizationProp('Labels.ShippingSection.POBoxError', 'no PO Box') }}</span>
                            <span v-if="$v.address_1Data.maxLength === false">{{ getFormattedMaxLengthError('address_1Data') }}</span>
                            <span v-else-if="$v.address_1Data.required === false">{{ getLocalizationProp('Labels.ShippingSection.Address1Required', 'Address1 Required') }}</span>
                            <span v-else-if="$v.address_1Data.isValidCnAddress === false">{{ getLocalizationProp('Labels.ShippingSection.Address1Error', 'Address1 Error') }}</span>
                        </div>

                    </div>
                </div>
            </template>

            <!-- Address_2 -->
            <div
                v-if="showMxAddressEntryEnhancementFields"
                class="o-checkoutAddAddress__field"
            >
                <!-- MX- Interior Number -->
                <div
                    v-if="showMxAddressEntryEnhancementFields"
                    class="o-addressForm__field -address2">
                    <div class="flex items-end justify-between">
                        <div class="flex">
                            <label
                                class="m-formField__label"
                                for="address_2"
                                v-html="formatLabel('address2', 'Labels.ShippingSection.Address2', 'ADDRESS 2')"
                            />
                            <div class="ml-5">
                                <m-tooltip class="mb-5" tooltip-icon="info">
                                    <div v-html="getLocalizationProp('Labels.ShippingSection.Tooltip.InteriorNumber')"></div>
                                </m-tooltip>
                            </div>
                        </div>
                        <InputCharacterCounter
                            :value="address_2Data"
                            :is-over-the-character-limit="!checkOverTheLimitValidation('address_2Data')"
                            :max-length="getMaxLength('address_2')"
                            modifier-classes="pb-5"
                        />
                    </div>
                    <input-basic
                        id="address_2"
                        name="address_2"
                        data-testid="input-address2"
                        :max-length="getMaxLength('address_2')"
                        :class="{ '-isInvalid': address_2DataError }"
                        :disabled="!enableSecondaryFields"
                        :placeholder="getLockedFieldsPlaceholder(getLocalizationProp('Labels.ShippingSection.Address2Placeholder'))"
                        :value="address_2Data"
                        @keyup="setInput"
                    />
                    <div
                        v-if="address_2DataError"
                        id="address_2ErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError"
                    >
                        {{ address_2DataErrorMsg }}
                    </div>
                </div>
            </div>
            <template v-else>
                <div
                    v-show="showFields.includes('address_2')"
                    class="o-checkoutAddAddress__field"
                    @copy="preventCopyPaste('address_2Data', $event)"
                    @paste="preventCopyPaste('address_2Data', $event)">
                    <div
                        class="o-addressForm__field -address2">
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
                            <span v-if="copyPasteError && preventCopyPasteFeature">{{ getLocalizationProp('Labels.ShippingSection.CopyPasteError', 'Copy and Paste Not Allowed') }}</span>
                            <span v-if="specialCharsError && validateAddressFeature">{{ getLocalizationProp('Labels.ShippingSection.SpecialCharsError', 'No Special Characters Allowed') }}</span>
                            <span v-if="!$v.address_2Data.pobox && !specialCharsError && !copyPasteError && $v.address_1Data.maxLength">{{ getLocalizationProp('Labels.ShippingSection.Address2Error', 'error') }}</span>
                            <span v-if="$v.address_2Data.pobox">{{ getLocalizationProp('Labels.ShippingSection.POBoxError', 'no PO Box') }}</span>
                            <span v-if="$v.address_2Data.maxLength === false">{{ getFormattedMaxLengthError('address_2Data') }}</span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Address 3 / Referencia-->
            <div
                v-if="!showMxAddressEntryEnhancementFields"
                v-show="showFields.includes('address_3')"
                class="o-checkoutAddAddress__field"
                @copy="preventCopyPaste('address_3Data', $event)"
                @paste="preventCopyPaste('address_3Data', $event)">
                <div
                    class="o-addressForm__field -address3">
                    <label
                        class="m-formField__label"
                        for="address_3"
                        v-html="formatLabel('address3', 'Labels.ShippingSection.Address3', 'ADDRESS 3')"
                    >
                    </label>
                    <input-basic
                        id="address_3"
                        name="address_3"
                        :class="{ '-isInvalid': address_3DataError }"
                        :value="address_3Data"
                        @keyup="setInput"
                        @change="setInput"
                        @keydown="validateAddress"

                    />
                    <div v-if="address_3DataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="copyPasteError && preventCopyPasteFeature">{{ getLocalizationProp('Labels.ShippingSection.CopyPasteError', 'Copy and Paste Not Allowed') }}</span>
                        <span v-if="specialCharsError && validateAddressFeature">{{ getLocalizationProp('Labels.ShippingSection.SpecialCharsError', 'No Special Characters Allowed') }}</span>
                        <span v-if="$v.address_3Data.maxLength === false">{{ getFormattedMaxLengthError('address_3Data') }}</span>
                    </div>
                </div>
            </div>

            <!-- Suburb / Colonia - suburbBefore -->
            <div
                v-if="showFields.includes('suburb') && suburbBefore && !showMxAddressEntryEnhancementFields"
                class="o-checkoutAddAddress__field">
                <div

                    class="o-addressForm__field -suburb">
                    <label
                        class="m-formField__label"
                        for="suburb"
                        v-html="formatLabel('suburb', 'Labels.ShippingSection.Suburb', 'SUBURB')"
                    >
                    </label>
                    <input-basic
                        id="suburb"
                        name="suburb"
                        vmodel="suburbData"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.SuburbPlaceholder', '')"
                        :value="suburbData"
                        :class="{ '-isInvalid': suburbDataError }"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="suburbDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ suburbDataErrorMsg }}
                    </div>
                </div>
            </div>

            <!-- City -->
            <div
                v-if="!showMxAddressEntryEnhancementFields"
                v-show="showFields.includes('city')"
                class="o-checkoutAddAddress__field">
                <div class="o-addressForm__field -city">
                    <label
                        class="m-formField__label"
                        for="city"
                        v-html="formatLabel('city', 'Labels.ShippingSection.City', 'CITY')"
                    >
                    </label>
                    <input-basic
                        id="city"
                        vmodel="cityData"
                        name="city"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.CityPlaceholder', 'City Name')"
                        :class="{ '-isInvalid': cityDataError }"
                        :value="cityData"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="cityDataError && !isRiverbend" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ cityDataErrorMsg }}
                    </div>
                    <div v-else-if="cityDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="$v.cityData.fpoApo">{{ getLocalizationProp('Labels.ShippingSection.CityError', 'error') }}</span>
                        <span v-if="!$v.cityData.fpoApo">{{ getLocalizationProp('Labels.ShippingSection.POBoxError', 'no APO address') }}</span>
                    </div>
                </div>
            </div>

            <!-- Suburb / Colonia - suburbAfter -->
            <div
                v-if="showFields.includes('suburb') && suburbAfter && !showMxAddressEntryEnhancementFields"
                class="o-checkoutAddAddress__field">
                <div
                    class="o-addressForm__field -suburb">
                    <label
                        class="m-formField__label"
                        for="suburb"
                        v-html="formatLabel('suburb', 'Labels.ShippingSection.Suburb', 'SUBURB')"
                    >
                    </label>
                    <input-basic
                        id="suburb"
                        name="suburb"
                        vmodel="suburbData"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.SuburbPlaceholder', '')"
                        :value="suburbData"
                        :class="{ '-isInvalid': suburbDataError }"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="suburbDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ suburbDataErrorMsg }}
                    </div>
                </div>
            </div>

            <!-- State or Province -->
            <div v-show="showState || showProvince || showStateMx" class="o-checkoutAddAddress__field">
                <!-- State -->
                <div
                    v-show="showState"
                    class="o-addressForm__field -state"
                >
                    <label
                        class="m-formField__label"
                        for="state"
                        v-html="formatLabel('state', 'Labels.ShippingSection.State', 'STATE')"
                    >
                    </label>
                    <v-select
                        v-if="state && state.length"
                        id="state"
                        vmodel="stateData"
                        :options="state.toString()"
                        :values="state"
                        :initial="(!stateData) ? state[0] : stateData"
                        :class="{ '-error': stateDataError }"
                        :aria-label="getLocalizationProp('Labels.ShippingSection.State', 'STATE')"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        arrow-tailwind-color="gray-120"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        @change="setInput($event)"
                    >
                    </v-select>
                    <div v-if="stateDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ getLocalizationProp('Labels.ShippingSection.StateError', 'error') }}
                    </div>
                </div>

                <!-- Province -->
                <div
                    v-show="showProvince"
                    class="o-addressForm__field -province">
                    <label
                        class="m-formField__label"
                        for="province"
                        v-html="formatLabel('province', 'Labels.ShippingSection.Province', 'PROVINCE')"
                    >
                    </label>
                    <v-select
                        v-if="province && province.length"
                        id="provinceCa"
                        vmodel="provinceData"
                        :options="province.toString()"
                        :values="province"
                        :initial="(!provinceData) ? province[0] : provinceData"
                        :class="{ '-error': provinceDataError }"
                        :aria-label="getLocalizationProp('Labels.ShippingSection.Province', 'PROVINCE')"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        arrow-tailwind-color="gray-120"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        @change="setInput($event)"
                    >
                    </v-select>
                    <div v-if="provinceDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ getLocalizationProp('Labels.ShippingSection.ProvinceError', 'error') }}
                    </div>
                </div>

                <!-- State MX (Estado) -->
                <div
                    v-show="showStateMx && !showMxAddressEntryEnhancementFields"
                    class="o-addressForm__field -stateMx">
                    <label
                        class="m-formField__label"
                        for="stateMx"
                        v-html="formatLabel('stateMx', 'Labels.ShippingSection.State', 'STATE')"
                    >
                    </label>
                    <v-select
                        v-if="stateMx && stateMx.length"
                        id="stateMx"
                        ref="stateMx"
                        vmodel="stateMxData"
                        :options="stateMx.toString()"
                        :values="stateMx"
                        :initial="(!stateMxData) ? stateMx[0] : stateMxData"
                        :aria-label="getLocalizationProp('Labels.ShippingSection.State', 'State')"
                        :class="{ '-error': stateMxDataError }"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        arrow-tailwind-color="gray-120"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        @change="setInput($event)"
                    >
                    </v-select>
                    <div v-if="stateMxDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        {{ getLocalizationProp('Labels.ShippingSection.StateError', 'error') }}
                    </div>
                </div>
            </div>

            <!-- Zip Code or Postal Code -->
            <div v-if="!showMxAddressEntryEnhancementFields" class="o-checkoutAddAddress__field">
                <!-- Zip Code -->
                <div
                    v-show="showFields.includes('zipCode')"
                    class="m-formField -text">
                    <label
                        class="m-formField__label"
                        for="zipCode"
                        v-html="formatLabel('zipCode', 'Labels.ShippingSection.ZipCode', 'ZIP CODE')"
                    >
                    </label>
                    <input-basic
                        id="zipCode"
                        ref="zipCode"
                        name="zipCode"
                        vmodel="zipCodeData"
                        :value="zipCodeData"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.ZipCodePlaceholder', '')"
                        :class="{ '-isInvalid': zipCodeDataError }"
                        :auto-complete="zipCodeReadonly ? 'off' : null"
                        :readonly="zipCodeReadonly"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="zipCodeDataError" class="o-checkoutAddAddress__fieldError" data-testid="container-checkoutAddAddress_fieldError">
                        <span v-if="$v.zipCodeData.required === false">{{ getLocalizationProp('Labels.ShippingSection.ZipCodeError') }}</span>
                        <span v-else-if="$v.zipCodeData.postalCode === false">{{ getLocalizationProp('Labels.ShippingSection.ZipCodeInvalidError') }}</span>
                    </div>
                </div>

                <!-- Postal code -->
                <div
                    v-show="showFields.includes('postalCode')"
                    class="o-addressForm__field -postalCode">
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

            <!-- Delivery Instructions -->
            <div
                v-if="!showBusinessAddForm && !showMxAddressEntryEnhancementFields"
                v-show="showFields.includes('deliveryInstructions')"
                class="o-checkoutAddAddress__field">
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

            <!-- Additional Address Information -->
            <div v-if="showMxAddressEntryEnhancementFields" class="o-checkoutAddAddress__field -additionalAddress">
                <fieldset class="m-formField">
                    <legend
                        class="m-formField__label pb-0 text-xl mt-20 font-bold"
                        v-html="formatLabel('additionalAddressInformation', 'Labels.ShippingSection.AdditionalAddressInformation')"
                    />
                    <div class="flex items-baseline">
                        <label
                            class="m-formField__label font-medium text-sm pb-0 pt-20"
                            for="delivery"
                            v-html="formatLabel('deliveryInstructions', 'Labels.ShippingSection.AdditionalAddressInformationHeader', 'DELIVERY INSTRUCTIONS')"></label>
                        <div class="ml-5">
                            <m-tooltip class="mb-5" tooltip-icon="info">
                                <div v-html="getLocalizationProp('Labels.ShippingSection.Tooltip.AdditionalInfo')"></div>
                            </m-tooltip>
                        </div>
                    </div>
                    <div class="flex items-end justify-between">
                        <p id="additionalAddressInformationSubHeader" class="m-formField__label text-xs font-normal pb-5 w-3_4">
                            {{ getLocalizationProp('Labels.ShippingSection.AdditionalAddressInformationSubHeader') }}
                        </p>
                        <InputCharacterCounter
                            :value="deliveryInstructionsData"
                            :max-length="getMaxLength('deliveryInstructions')"
                            :is-over-the-character-limit="!checkOverTheLimitValidation('deliveryInstructionsData')"
                            modifier-classes="pb-5"
                        />
                    </div>
                    <textarea
                        id="additionalAddressInformation"
                        v-model="deliveryInstructionsData"
                        data-testid="textarea-additionalAddressInformation"
                        name="additionalAddressInformation"
                        :maxlength="getMaxLength('deliveryInstructions')"
                        class="a-textarea p-15 border-1 placeholder-gray min-h-90"
                        :class="{ '-isInvalid': deliveryInstructionsDataError }"
                        :disabled="!enableSecondaryFields"
                        :placeholder="getLockedFieldsPlaceholder(getLocalizationProp('Labels.ShippingSection.AdditionalAddressInformationPlaceholder'))"
                        aria-describedby="additionalAddressErrorMsg"
                        :aria-invalid="deliveryInstructionsDataError"
                    />
                    <p
                        v-show="deliveryInstructionsDataError"
                        id="additionalAddressErrorMsg"
                        class="o-checkoutAddAddress__fieldError normal-case"
                        data-testid="container-checkoutAddAddress_fieldError"
                    >
                        {{ deliveryInstructionsDataErrorMsg }}
                    </p>
                </fieldset>
            </div>
            <!-- Business Address checkbox -->
            <div v-if="hasBusinessAddressCheckboxOnOle && showShippingAddForm" class="o-checkoutAddAddress__field -checkbox">
                <m-checkbox
                    ref="businessAddCheckBox"
                    v-model="sameBusinessShippingAddress"
                    label-mods="text-base font-normal"
                    class="o-checkoutAddAddress__checkbox"
                    name="sameBusinessShippingAddress"
                    :label="getLocalizationProp('Labels.ShippingSection.BusinessAddressCheckbox', 'Use this Shipping Address as my Business/Permanent Address.')"
                    data-testid="input-checkoutAddAddress_checkbox"
                    @input="gtmTrackAction({id: 451, text: getLocalizationProp('Labels.ShippingSection.BusinessAddressCheckbox')}, $event)"
                >
                </m-checkbox>
                <div class="o-checkoutAddAddress__disclaimer">{{ getLocalizationProp('Labels.ShippingSection.BusinessAddressCheckboxDisclaimer', 'Your business address will be used to send commission checks, awards, and invitations to events.') }}</div>
            </div>

            <!-- Make-default Address checkbox -->
            <div v-if="isAddNewAddressForm && !isRiverbendSubscription && !isRiverbend" class="o-checkoutAddAddress__field -checkbox">
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

        <!-- Form validation error specific to MX address entry enhancement -->
        <div
            v-if="mxAddressEntryEnhancementEnabled && isAddressFormInValid"
            class="text-sm text-red mt-4">
            {{ getLocalizationProp('Labels.ShippingSection.CorrectFormError') }}
        </div>

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
        <!-- Cross country address modal -->
        <modal id="modal-cross-country-address" width="630px">
            <template #content>
                <div class="px-30 md:px-0">
                    <div
                        class="m-rte"
                        v-html="crossCountryModalRTE">
                    </div>
                    <div class="flex flex-col md:flex-row mt-30">
                        <button
                            v-modal-hide
                            type="button"
                            class="a-button -white justify-center text-base text-center font-medium mr-10 py-12 px-60 mb-20 md:mb-0">
                            {{ getLocalizationProp('Data.CrossCountryModal.Cancel', 'Cancel') }}
                        </button>

                        <button
                            type="button"
                            class="a-button -green justify-center text-base text-center font-medium py-12 px-15 mr-10"
                            @click="continueCrossCountryAddress">
                            {{ crossCountryModalContinue }}
                        </button>

                        <a-loading-spinner v-if="crossCountryAddressLoading" :visible="crossCountryAddressLoading" size="sm" />
                    </div>
                </div>
            </template>
        </modal>
        <!-- Second confirmation address modal -->
        <modal id="modal-second-confirmation-address" heading-class="m-experianModal__heading" width="460px">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.ShippingSection.VerifyAddressModalTitle', 'Verify Address') }}
            </template>

            <template v-slot:body>
                <div class="m-experianModal__body">
                    <span
                        class="m-experianModal__title -system">
                        {{ getLocalizationProp('Labels.ShippingSection.AddressEntered', 'Address You Entered:') }}
                    </span>
                    <div
                        class="m-experianModal__system">
                        <span v-html="addressEnteredFormatted" />

                        <p
                            class="m-experianModal__desc -system">
                            {{ getLocalizationProp('Labels.ShippingSection.ConfirmAddressNotice') }}
                        </p>
                    </div>
                </div>
            </template>

            <template v-slot:footer>
                <div class="m-experianModal__footer">
                    <v-button
                        class="m-experianModal__btn -secondary -white"
                        @click="closeSecondConfirmAddressModal">
                        {{ getLocalizationProp('Labels.ShippingSection.Back', 'Back') }}
                    </v-button>

                    <v-button
                        class="m-experianModal__btn -primary -green"
                        @click="handleSecondConfirmAddress">
                        {{ getLocalizationProp('Labels.ShippingSection.UseThisAddress', 'Use this address') }}
                    </v-button>
                </div>
            </template>
        </modal>
        <!-- Modal -->
        <m-experian-modal
            :address-entered="addressEntered"
            :address-entered-formatted="addressEnteredFormatted"
            :address-entered-label="getLocalizationProp('Labels.ShippingSection.AddressEntered', 'Address You Entered:')"
            :address-list="addressList"
            :address-not-in-system-label="getLocalizationProp('Labels.ShippingSection.AddressNotOnSystem', 'This address is not currently in our system. Please review the address and make sure it is correct before continuing.')"
            :back-label="getLocalizationProp('Labels.ShippingSection.Back', 'Back')"
            :problem-with-address-label="getLocalizationProp('Labels.ShippingSection.ProblemWithAddress', 'There was a problem with the address you entered. Please select from the list of SUggested Addresses, or try again. For further assistance, please contact Customer Service at 1 (800) 282-3000.')"
            :show-modal="showModal"
            :suggested-label="getLocalizationProp('Labels.ShippingSection.Suggested', 'Suggested:')"
            :use-this-address-label="getLocalizationProp('Labels.ShippingSection.UseThisAddress', 'Use this address')"
            :verify-address-label="getLocalizationProp('Labels.ShippingSection.VerifyAddressModalTitle', 'Verify Address')"
            @chose-address="choseAddress"
            @chose-entered-address="choseEnteredAddress"
            @close="closeModal"
        ></m-experian-modal>
        <!-- Invalid postal code -->
        <modal
            id="invalid-postal-code-modal"
            heading-class="font-bold text-2xl leading-initial"
        >
            <template v-slot:heading>
                <span>{{ getLocalizationProp('Labels.ShippingSection.InvalidPostalCodeModal.Title') }}</span>
            </template>

            <template v-slot:body>
                <p class="text-gray-120 text-sm">
                    {{ getLocalizationProp('Labels.ShippingSection.InvalidPostalCodeModal.Description') }}
                </p>
            </template>

            <template v-slot:footer>
                <div>
                    <v-button
                        class="mb-20 py-12 px-24 block -white"
                        data-testid="button-invalidPostalCodeContinue"
                        @click="handleInvalidPostalCode">
                        {{ getLocalizationProp('Labels.ShippingSection.InvalidPostalCodeModal.Continue') }}
                    </v-button>
                    <v-button
                        v-modal-hide
                        class="py-12 px-24 -green"
                        data-testid="button-invalidPostalCodeCancel">
                        {{ getLocalizationProp('Labels.ShippingSection.InvalidPostalCodeModal.Cancel') }}
                    </v-button>
                </div>
            </template>
        </modal>
        <ValidatedAddressPickerModal
            :delivery-instructions-data="deliveryInstructionsData"
            :formatted-user-entered-address-for-modal="formattedUserEnteredAddressForModal"
            :formatted-suggested-address-list-for-modal="formattedSuggestedAddressListForModal"
            :has-more-available-suggestions="hasMoreAvailableSuggestions"
            :labels="getLocalizationProp('Labels.ShippingSection.ValidatedAddressPickerModal', {})"
            :show-modal="showValidatedAddressPickerModal"
            @close="showValidatedAddressPickerModal = false"
            @choseValidatedAddress="chosenValidatedAddress"
            @choseUserEnteredAddress="chosenUserEnteredAddress"
        />
    </div>
</template>
<script>
    import addressFormLogic from '../../../mixins/address-form';
    import searchAddressMx from '../../../mixins/search-address-mx';
    import checkoutAddressFormLogic from '../../../mixins/checkout-address-form';
    import InputCharacterCounter from '../../01-molecules/input-character-counter/input-character-counter.vue';
    import ValidatedAddressPickerModal from '../../01-molecules/modal/validated-address-picker-modal.vue';

    export default {
        name: 'OCheckoutAddAddress',
        components: {
            InputCharacterCounter,
            ValidatedAddressPickerModal
        },
        mixins: [ addressFormLogic, checkoutAddressFormLogic, searchAddressMx ],
        data() {
            return {
                // addressSelectedFromModal - Only applicable to MX address entry enhancement,
                // restricts call to /searchAddress API when address is picked up from modal
                addressSelectedFromModal: false
            };
        },
        watch: {
            isAddressEditMode: {
                handler(newValue) {
                    if(newValue) {
                        // Only applicable to MX address entry enhancement
                        // Controls /searchAddress API call behavior
                        this.isEditAddressFlow = newValue;
                    }
                },
                immediate: true
            },
            postalCodeData() {
                if(!this.addressSelectedFromModal && this.showMxAddressEntryEnhancementFields) {
                    this.handlePostalCodeDataUpdate();
                }
            },
            address_1Data(newVal) {
                // Trigger Experian address suggestions for MX when user types in street address
                if(this.showMxAddressEntryEnhancementFields && newVal && newVal.length > 3 && this.enableSecondaryFields) {
                    // Build search query with street address and location context
                    let dataEntered = newVal;
                    if(this.postalCodeData) dataEntered += ' ' + this.postalCodeData;
                    if(this.cityData) dataEntered += ' ' + this.cityData;
                    if(this.stateMxData) dataEntered += ' ' + this.stateMxData;

                    this.getAddressApi(
                        dataEntered,
                        'mexico',
                        false,
                        false,
                        25
                    );
                }
            }
        }
    };
</script>

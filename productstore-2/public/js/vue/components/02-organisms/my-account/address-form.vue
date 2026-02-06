<template>
    <form
        id="address-form-vue"
        class="o-addressForm"
        :class="'-' + chosenCountry"
        @submit.prevent="checkSave($event)"
        @submit.enter.prevent
        @keyup.enter.prevent
        @keydown.enter.prevent>

        <!-- Country -->
        <div v-if="!isBusiness && showFields.includes('country')" class="w-full lg:w-1_2 lg:pb-7 lg:pr-20">
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

        <OAddressFormMx
            v-if="isMexico && showMxAddressForm"
            :labels="getLocalizationProp('Labels.ShippingSection')"
            :address-entry-enhancement-enabled="true"
            :cancel-label="getLocalizationProp('Labels.CTA.Cancel')"
            :save-label="getLocalizationProp('Labels.CTA.Save')"
            :validated-address-picker-modal="getLocalizationProp('Labels.ShippingSection.ValidatedAddressPickerModal')"
            :default-ship="defaultShip"
            :prefilled-form-values="prefilledFormValues"
            :is-business="isBusiness"
            :is-loading-submit-form="isLoadingSubmitForm"
            :state-mx="stateMx"
            :has-add-update-address-api-error="hasAddUpdateAddressApiError"
            @cancel="nextPage"
            @updateDefaultShip="updateDefaultShipFromMxAddressForm"
            @updateSuggestionPick="updateSuggestionPickFromMxAddressForm"
            @save="checkSave($event)"
            @validationApiError="handleMxValidationApiError"
        />

        <div v-else class="w-full flex flex-col lg:flex-row">
            <!-- #region BEGIN: Col Left -->
            <div class="w-full lg:w-1_2 lg:pr-20">
                <!-- Name -->
                <div class="o-addressForm__field" :class="{ '-hasErrorMsg': nameDataError && renderValidationsBelowInputs }">
                    <label
                        class="m-formField__label"
                        for="name"
                        v-html="getLocalizationProp('Labels.ShippingSection.Name', 'RECIPIENT NAME')"
                    >
                    </label>
                    <input-basic
                        id="name"
                        vmodel="nameData"
                        name="name"
                        :class="{ '-isInvalid': nameDataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.NamePlaceholder')"
                        :value="nameData"
                        aria-describedby="nameErrorMsg"
                        @composition-end="setInput"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <FormFieldErrorMessage
                        id="nameErrorMsg"
                        :is-visible="nameDataError && renderValidationsBelowInputs"
                        :msg="nameDataErrorMsg"
                    />
                </div>

                <!-- Company Name for the business page OR Ship To field for Singapore -->
                <div
                    v-show="(isBusiness || isSingapore) && showFields.includes('companyName')"
                    class="o-addressForm__field"
                    :class="{ '-hasErrorMsg': companyNameDataError && renderValidationsBelowInputs }"
                >
                    <label
                        class="m-formField__label"
                        for="companyName"
                        v-html="formatLabel('companyName', 'Labels.ShippingSection.CompanyName', 'COMPANY NAME / ATTENTION')"
                    >
                    </label>
                    <input-basic
                        id="companyName"
                        vmodel="companyNameData"
                        name="companyName"
                        :class="{ '-isInvalid': companyNameDataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.CompanyNamePlaceholder')"
                        :value="companyNameData"
                        aria-describedby="companyNameErrorMsg"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <FormFieldErrorMessage
                        id="companyNameErrorMsg"
                        :is-visible="companyNameDataError && renderValidationsBelowInputs"
                        :msg="companyNameDataErrorMsg"
                    />
                </div>

                <template v-if="showAddressSearch">
                    <template v-if="isKorea">

                        <!-- Zip code -->
                        <div
                            v-if="showFields.includes('zipCode')"
                            class="m-formField -text"
                            :class="{ 'pb-6': zipCodeDataError && renderValidationsBelowInputs }"
                        >
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
                                :placeholder="getLocalizationProp('Labels.ShippingSection.ZipCodePlaceholder')"
                                :class="{ '-isInvalid': zipCodeDataError }"
                                :auto-complete="zipCodeReadonly ? 'off': null"
                                :readonly="zipCodeReadonly"
                                aria-describedby="zipCodeErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="zipCodeErrorMsg"
                                :is-visible="zipCodeDataError && renderValidationsBelowInputs"
                                :msg="zipCodeDataErrorMsg"
                            />
                        </div>

                        <div class="m-formField -text">
                            <button
                                class="a-authorBtn -default flex items-center justify-center bg-white text-green rounded w-full text-center px-10 md:px-50"
                                type="button"
                                @click="$modal.show({ id: 'modal-kr-address-search' })">

                                <a-icon size="sm" class="mr-10">search</a-icon>

                                {{ getLocalizationProp('Labels.CTA.Search', 'Search') }}
                            </button>
                        </div>
                    </template>

                    <template v-else-if="isJapan">
                        <div class="o-addressForm__field -text">
                            <button
                                class="o-addressForm__button -search"
                                type="button"
                                @click="$modal.show({ id: 'modal-kr-address-search' })">
                                <a-icon size="sm" class="mr-10">search</a-icon>
                                {{ getLocalizationProp('Labels.CTA.Search', 'Search') }}
                            </button>
                        </div>

                        <!-- Postal code -->
                        <div
                            class="o-addressForm__field -text"
                            :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="postalCode"
                                v-html="formatLabel('postalCode', 'Labels.ShippingSection.PostalCode', 'POSTAL CODE')"
                            />
                            <input-basic
                                v-show="showFields.includes('postalCode')"
                                id="postalCode"
                                name="postalCode"
                                vmodel="postalCodeData"
                                :value="postalCodeData"
                                :placeholder="postalCodePlaceholder"
                                :class="{ '-isInvalid': postalCodeDataError }"
                                :readonly="postalCodeReadonly"
                                aria-describedby="postalCodeErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="postalCodeErrorMsg"
                                :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                :msg="postalCodeDataErrorMsg"
                            />
                        </div>
                    </template>

                    <!-- Province / Prefectures -->
                    <div
                        v-show="showFields.includes('province')"
                        class="o-addressForm__field -text"
                        :class="{ '-hasErrorMsg': provinceDataError && renderValidationsBelowInputs }"
                    >
                        <label
                            class="m-formField__label"
                            for="province"
                            v-html="formatLabel('province', 'Labels.ShippingSection.Province', 'PROVINCE')"
                        >
                        </label>
                        <input-basic
                            id="province"
                            name="province"
                            vmodel="provinceData"
                            :value="provinceData"
                            :placeholder="provincePlaceholder"
                            :class="{ '-isInvalid': provinceDataError }"
                            aria-describedby="provinceErrorMsg"
                            :readonly="provinceReadonly"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            id="provinceErrorMsg"
                            :is-visible="provinceDataError && renderValidationsBelowInputs"
                            :msg="provinceDataErrorMsg"
                        />
                    </div>
                </template>
                <!-- #region BEGIN: Hongkong & Taiwan -->
                <template v-if="isTaiwan || isHongkong">
                    <!-- Hongkong City -->
                    <div
                        v-if="isHongkong"
                        class="o-addressForm__field -postalCode -hongkong"
                        :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
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
                            @change="handleHkCitySelectChange($event)"
                        />
                        <FormFieldErrorMessage
                            id="cityErrorMsg"
                            :is-visible="cityDataError && renderValidationsBelowInputs"
                            :msg="cityDataErrorMsg"
                        />
                    </div>
                    <div class="o-addressForm__addressContainer">
                        <!-- Hongkong Area -->
                        <div
                            v-if="isHongkong"
                            class="o-addressForm__field -city -hongkong"
                            :class="{'-hasErrorMsg': cityDataError && renderValidationsBelowInputs}"
                        >
                            <label class="m-formField__label" for="area">
                                {{ getLocalizationProp('Labels.ShippingSection.Area') }}
                            </label>
                            <v-select
                                id="area"
                                vmodel="areaData"
                                name="area"
                                :options="area"
                                :values="area"
                                :initial="!areaData ? area[0] : areaData"
                                :class="{ '-error': areaDataError }"
                                :readonly="isHkAreaSelectReadOnly"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                arrow-tailwind-color="gray-120"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                aria-describedby="cityErrorMsg"
                                :aria-label="getLocalizationProp('Labels.ShippingSection.Area', 'Area')"
                                @change="handleHkAreaSelectChange($event)"
                            />
                            <FormFieldErrorMessage
                                id="cityErrorMsg"
                                :is-visible="cityDataError && renderValidationsBelowInputs"
                                :msg="cityDataErrorMsg"
                            />
                        </div>
                        <!-- Taiwan City -->
                        <div
                            v-if="isTaiwan"
                            class="o-addressForm__field -city -taiwan"
                            :class="{'-hasErrorMsg': cityDataError && renderValidationsBelowInputs}"
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
                            <FormFieldErrorMessage
                                id="cityErrorMsg"
                                :is-visible="cityDataError && renderValidationsBelowInputs"
                                :msg="cityDataErrorMsg"
                            />
                        </div>
                        <!-- Hongkong Suburb -->
                        <div
                            v-if="isHongkong && isHkSuburbSelectRequired"
                            class="o-addressForm__field -suburb -hongkong"
                            :class="{
                                '-hasErrorMsg': suburbDataError && renderValidationsBelowInputs
                            }"
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
                                :disables="suburbDisables"
                                :initial="!suburbData ? suburb[0] : suburbData"
                                :class="{ '-error': suburbDataError }"
                                :readonly="isHkSuburbSelectReadOnly"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                arrow-tailwind-color="gray-120"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                aria-describedby="suburbErrorMsg"
                                :aria-label="getLocalizationProp('Labels.ShippingSection.Suburb', 'Suburb')"
                                @change="handleHkSuburbSelectChange($event)"
                            />
                            <FormFieldErrorMessage
                                id="suburbErrorMsg"
                                :is-visible="suburbDataError && renderValidationsBelowInputs"
                                :msg="suburbDataErrorMsg"
                            />
                        </div>
                        <!-- Taiwan Suburb -->
                        <div
                            v-if="isTaiwan"
                            class="o-addressForm__field -suburb -taiwan"
                            :class="{
                                '-hasErrorMsg': suburbDataError && renderValidationsBelowInputs
                            }"
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
                            <FormFieldErrorMessage
                                id="suburbErrorMsg"
                                :is-visible="suburbDataError && renderValidationsBelowInputs"
                                :msg="suburbDataErrorMsg"
                            />
                        </div>
                    </div>
                    <!-- Taiwan Postal Code Read Only -->
                    <div
                        v-if="isTaiwan"
                        class="o-addressForm__field -postalCode -taiwan"
                        :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                    >
                        <label class="m-formField__label" for="postalCode">
                            {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                        </label>
                        <input-basic
                            id="postalCode"
                            name="postalCode"
                            :value="postalCodeData"
                            :placeholder="postalCodePlaceholder"
                            :class="{ '-isInvalid': postalCodeDataError }"
                            :readonly="true"
                            :disabled="true"
                            aria-describedby="postalCodeErrorMsg"
                            aria-disabled="true"
                        />
                        <FormFieldErrorMessage
                            id="postalCodeErrorMsg"
                            :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                            :msg="postalCodeDataErrorMsg"
                        />
                    </div>
                </template>
                <!-- #endregion END: Hongkong & Taiwan -->
                <!-- #region BEGIN: Hungary City -->
                <div v-if="isHungary">
                    <div
                        class="o-addressForm__field"
                        :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                    >
                        <label
                            class="m-formField__label"
                            for="city"
                        >
                            {{ getLocalizationProp('Labels.ShippingSection.City') }}
                        </label>
                        <input-basic
                            id="city"
                            vmodel="cityData"
                            name="city"
                            :placeholder="cityPlaceholder"
                            :class="{ '-isInvalid': cityDataError }"
                            :value="cityData"
                            aria-describedby="cityErrorMsg"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            id="cityErrorMsg"
                            :is-visible="cityDataError && renderValidationsBelowInputs"
                            :msg="cityDataErrorMsg"
                        />
                    </div>
                </div>
                <!-- #endregion END: Hungary City -->
                <!-- Address_1 -->
                <div
                    v-show="!isJapan && showFields.includes('address_1')"
                    ref="address_1"
                    v-clickoutside="closeSuggestionList"
                    class="o-addressForm__field -address1"
                    :class="{ '-hasErrorMsg': address_1DataError && renderValidationsBelowInputs }"
                    auto-complete="off"
                    @blur="showAddressList = false"
                    @copy="preventCopyPaste('address_1Data', $event)"
                    @paste="preventCopyPaste('address_1Data', $event)">
                    <label
                        class="m-formField__label"
                        for="address_1"
                    >
                        {{ getLocalizationProp('Labels.ShippingSection.Address1', 'ADDRESS 1') }}
                    </label>
                    <input-basic
                        id="address_1"
                        ref="address_1input"
                        vmodel="address_1Data"
                        name="address_1"
                        auto-complete="off"
                        :class="{ '-isInvalid': address_1DataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address1Placeholder')"
                        :value="address_1Data"
                        :readonly="address1Readonly"
                        aria-describedby="address_1ErrorMsg"
                        @composition-end="setInput"
                        @keyup="setInput"
                        @change="setInput"
                        @keydown="validateAddress"
                    />

                    <!--  copy/paste error message below input field  -->
                    <FormFieldErrorMessage
                        id="copyPasteError"
                        :is-visible="copyPasteError && renderValidationsBelowInputs"
                        :msg="copyPasteError"
                    />

                    <FormFieldErrorMessage
                        id="address_1ErrorMsg"
                        :is-visible="address_1DataError && renderValidationsBelowInputs"
                        :msg="address_1DataErrorMsg"
                    />
                    <div v-if="loadingExp" class="a-loadingSpinner__input absolute right-10" style="top: 23px">
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
                                    @keyup.enter="suggestionSelected(item)"
                                    @keyup.prevent="suggestionList"
                                    @touchstart="suggestionSelected(item)">
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
                </div>

                <!-- Address_2 -->
                <div
                    v-show="showFields.includes('address_2')"
                    class="o-addressForm__field -address2"
                    :class="{ '-hasErrorMsg':address_2DataError && renderValidationsBelowInputs }"
                    @copy="preventCopyPaste('address_2Data', $event)"
                    @paste="preventCopyPaste('address_2Data', $event)"
                >
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
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address2Placeholder')"
                        :value="address_2Data"
                        aria-describedby="address_2ErrorMsg"
                        @composition-end="setInput"
                        @keyup="setInput"
                        @change="setInput"
                        @keydown="validateAddress"
                    />

                    <!--  copy/paste error message below input field  -->
                    <FormFieldErrorMessage
                        id="copyPasteError"
                        :is-visible="copyPasteError && renderValidationsBelowInputs"
                        :msg="copyPasteError"
                    />

                    <!-- Error on special characters below input field -->
                    <FormFieldErrorMessage
                        id="address_2ErrorMsg"
                        :is-visible="address_2DataError && renderValidationsBelowInputs"
                        :msg="address_2DataErrorMsg"
                    />
                </div>

                <!-- Address 3 / Referencia-->
                <div
                    v-show="showFields.includes('address_3')"
                    class="o-addressForm__field -address3"
                    :class="{ '-hasErrorMsg': address_3DataError && renderValidationsBelowInputs }"
                    @copy="preventCopyPaste('address_3Data', $event)"
                    @paste="preventCopyPaste('address_3Data', $event)"
                >
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
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address3Placeholder')"
                        :value="address_3Data"
                        aria-describedby="address_3ErrorMsg"
                        @keyup="setInput"
                        @change="setInput"
                        @keydown="validateAddress"
                    />

                    <!--  copy/paste error message below input field  -->
                    <FormFieldErrorMessage
                        id="copyPasteError"
                        :is-visible="copyPasteError && renderValidationsBelowInputs"
                        :msg="copyPasteError"
                    />

                    <FormFieldErrorMessage
                        id="address_3ErrorMsg"
                        :is-visible="address_3DataError && renderValidationsBelowInputs"
                        :msg="address_3DataErrorMsg"
                    />
                </div>

                <div v-show="!isPhilippines && !isTaiwan && !isHongkong && !isEurope" class="o-addressForm__fieldContainer -suburb">
                    <!-- Suburb / Colonia -->
                    <div
                        v-if="showFields.includes('suburb') && suburbBefore"
                        class="o-addressForm__field -suburb"
                        :class="{ '-hasErrorMsg': suburbDataError && renderValidationsBelowInputs }"
                    >
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
                            :placeholder="suburbPlaceholder"
                            :value="suburbData"
                            :class="{ '-isInvalid': suburbDataError }"
                            aria-describedby="suburbErrorMsg"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            id="suburbErrorMsg"
                            :is-visible="suburbDataError && renderValidationsBelowInputs"
                            :msg="suburbDataErrorMsg"
                        />
                    </div>

                    <!-- City -->
                    <div
                        v-show="!isMalaysia && !isSingapore && !isTaiwan && showFields.includes('city')"
                        class="o-addressForm__field -city"
                        :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                    >
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
                            :placeholder="cityPlaceholder"
                            :class="{ '-isInvalid': cityDataError }"
                            :value="cityData"
                            :readonly="cityReadonly"
                            aria-describedby="cityErrorMsg"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            id="cityErrorMsg"
                            :is-visible="cityDataError && renderValidationsBelowInputs"
                            :msg="cityDataErrorMsg"
                        />
                    </div>

                    <!-- Suburb / Colonia / JP Town -->
                    <div
                        v-if="showFields.includes('suburb') && suburbAfter"
                        class="o-addressForm__field -suburb"
                        :class="{ '-hasErrorMsg': suburbDataError && renderValidationsBelowInputs }"
                    >
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
                            :placeholder="suburbPlaceholder"
                            :value="suburbData"
                            :class="{ '-isInvalid': suburbDataError }"
                            aria-describedby="suburbErrorMsg"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            id="suburbErrorMsg"
                            :is-visible="suburbDataError && renderValidationsBelowInputs"
                            :msg="suburbDataErrorMsg"
                        />
                    </div>
                </div>

                <!-- Address_1 (at bottom in Japan) -->
                <div
                    v-show="isJapan && showFields.includes('address_1')"
                    ref="address_1"
                    v-clickoutside="closeSuggestionList"
                    class="o-addressForm__field -address1"
                    :class="{ '-hasErrorMsg': address_1DataError && renderValidationsBelowInputs }"
                    auto-complete="off"
                    @blur="showAddressList = false">
                    <label
                        class="m-formField__label"
                        for="address_1"
                    >
                        {{ getLocalizationProp('Labels.ShippingSection.Address1', 'ADDRESS 1') }}
                    </label>
                    <input-basic
                        id="address_1"
                        ref="address_1input"
                        vmodel="address_1Data"
                        name="address_1"
                        auto-complete="off"
                        :class="{ '-isInvalid': address_1DataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address1Placeholder')"
                        :value="address_1Data"
                        :readonly="address1Readonly"
                        aria-describedby="address_1ErrorMsg"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <FormFieldErrorMessage
                        id="address_1ErrorMsg"
                        :is-visible="address_1DataError && renderValidationsBelowInputs"
                        :msg="address_1DataErrorMsg"
                    />
                    <div v-if="loadingExp" class="a-loadingSpinner__input absolute right-10" style="top: 23px">
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
                                    @keyup.enter="suggestionSelected(item)"
                                    @keyup.prevent="suggestionList"
                                    @touchstart="suggestionSelected(item)">
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
                </div>

                <div v-if="!isKorea && !isJapan && !isMalaysia && !isSingapore && !isPhilippines &&!isEurope" class="md:pb-20">
                    <div class="o-addressForm__addressContainer" :class="{'-statePostalRow': isMexico}">
                        <div
                            v-show="showFields.includes('state')"
                            class="o-addressForm__field -state"
                            :class="{ '-hasErrorMsg': stateDataError && renderValidationsBelowInputs }"
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
                                aria-describedby="stateErrorMsg"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                @change="setInput($event)"
                            >
                            </v-select>
                            <FormFieldErrorMessage
                                id="stateErrorMsg"
                                :is-visible="stateDataError && renderValidationsBelowInputs"
                                :msg="stateDataErrorMsg"
                            />
                        </div>

                        <!-- Province -->
                        <div
                            v-show="showFields.includes('province')"
                            class="o-addressForm__field -province"
                            :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                        >
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
                                aria-describedby="provinceErrorMsg"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                @change="setInput($event)"
                            />
                            <FormFieldErrorMessage
                                id="provinceErrorMsg"
                                :is-visible="provinceDataError && renderValidationsBelowInputs"
                                :msg="provinceDataErrorMsg"
                            />
                        </div>

                        <!-- State MX (Estado) -->
                        <div
                            v-show="showFields.includes('stateMx')"
                            class="o-addressForm__field -stateMx"
                            :class="{ '-hasErrorMsg': stateMxDataError && renderValidationsBelowInputs }"
                        >
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
                                :initial="(!stateMxData || stateMxData === '') ? stateMx[0] : stateMxData"
                                :aria-label="getLocalizationProp('Labels.ShippingSection.State', 'State')"
                                aria-describedby="stateMxErrorMsg"
                                :class="{ '-error': stateMxDataError }"
                                select-mod="-rounded -padding-md -bg-transparent w-full"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                @change="setInput($event)"
                            />
                            <FormFieldErrorMessage
                                id="stateMxErrorMsg"
                                :is-visible="stateMxDataError && renderValidationsBelowInputs"
                                :msg="stateMxDataErrorMsg"
                            />
                        </div>

                        <!-- Zip code -->
                        <div
                            v-show="showFields.includes('zipCode')"
                            class="o-addressForm__field -zipCode"
                            :class="{ '-hasErrorMsg': zipCodeDataError && renderValidationsBelowInputs }"
                        >
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
                                :placeholder="getLocalizationProp('Labels.ShippingSection.ZipCodePlaceholder')"
                                :class="{ '-isInvalid': zipCodeDataError }"
                                :auto-complete="zipCodeReadonly ? 'off' : null"
                                :readonly="zipCodeReadonly"
                                aria-describedby="zipCodeErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="zipCodeErrorMsg"
                                :is-visible="zipCodeDataError && renderValidationsBelowInputs"
                                :msg="zipCodeDataErrorMsg"
                            />
                        </div>

                        <!-- Postal code -->
                        <div
                            v-show="showFields.includes('postalCode') && !isTaiwan && !isHongkong"
                            class="o-addressForm__field -postalCode"
                            :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs, '-statePostalRow': isMexico }"
                        >
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
                                :placeholder="postalCodePlaceholder"
                                :class="{ '-isInvalid': postalCodeDataError }"
                                aria-describedby="postalCodeErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="postalCodeErrorMsg"
                                :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                :msg="postalCodeDataErrorMsg"
                            />
                        </div>

                        <!-- Phone Number -->
                        <div
                            v-show="!isMalaysia && showFields.includes('phoneNumber')" class="o-addressForm__field -phoneNumber"
                            :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs, '-taiwan': isTaiwan, '-hongkong': isHongkong }"

                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', 'PHONE NUMBER')"
                            >
                            </label>
                            <input-basic
                                id="phoneNumber"
                                name="phoneNumber"
                                vmodel="phoneNumberData"
                                :value="phoneNumberData"
                                :placeholder="phoneNumberPlaceholder"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                </div>

                <!-- #region BEGIN: Singapore & Malaysia Postal Code, City, State, Phone Number -->
                <template v-if="isMalaysia || isSingapore">
                    <div class="o-addressForm__addressContainer" :class="isSingapore ? '-singapore' : ''">
                        <!-- City -->
                        <div
                            v-show="showFields.includes('city')"
                            class="o-addressForm__field -city"
                            :class="{
                                '-malaysia' : isMalaysia,
                                '-singapore' : isSingapore,
                                '-hasErrorMsg': cityDataError && renderValidationsBelowInputs
                            }"
                        >
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
                                :placeholder="cityPlaceholder"
                                :class="{ '-isInvalid': cityDataError }"
                                :value="cityData"
                                :readonly="cityReadonly"
                                aria-describedby="cityErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="cityErrorMsg"
                                :is-visible="cityDataError && renderValidationsBelowInputs"
                                :msg="cityDataErrorMsg"
                            />
                        </div>

                        <!-- State -->
                        <div
                            v-show="isSingapore && showFields.includes('state')"
                            class="o-addressForm__field -state -singapore"
                            :class="{ '-hasErrorMsg': stateDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label sr-only"
                                for="city"
                                v-html="formatLabel('state', 'Labels.ShippingSection.State', '')"
                            >
                            </label>
                            <input-basic
                                id="state"
                                vmodel="stateData"
                                name="state"
                                :placeholder="statePlaceholder"
                                :class="{ '-isInvalid': stateDataError }"
                                :value="stateData"
                                :readonly="stateReadonly"
                                aria-describedby="stateErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="stateErrorMsg"
                                :is-visible="stateDataError && renderValidationsBelowInputs"
                                :msg="stateDataErrorMsg"
                            />
                        </div>

                        <!-- Postal code -->
                        <div
                            v-show="isMalaysia && showFields.includes('postalCode')"
                            class="o-addressForm__field -postalCode -malaysia"
                            :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                        >
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
                                :placeholder="postalCodePlaceholder"
                                :class="{ '-isInvalid': postalCodeDataError }"
                                aria-describedby="postalCodeErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="postalCodeErrorMsg"
                                :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                :msg="postalCodeDataErrorMsg"
                            />
                        </div>
                    </div>

                    <div class="o-addressForm__addressContainer items-end">
                        <!-- State -->
                        <div
                            v-show="isMalaysia && showFields.includes('state')"
                            class="o-addressForm__field -state -malaysia"
                            :class="{ '-hasErrorMsg': stateDataError && renderValidationsBelowInputs }"
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
                                :options="stateLongNames.toString()"
                                :values="state"
                                :initial="(!stateData) ? state[0] : stateData"
                                :class="{ '-error': stateDataError }"
                                :aria-label="getLocalizationProp('Labels.ShippingSection.State', 'STATE')"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                aria-describedby="stateErrorMsg"
                                @change="setInput($event)"
                            >
                            </v-select>
                            <FormFieldErrorMessage
                                id="stateErrorMsg"
                                :is-visible="stateDataError && renderValidationsBelowInputs"
                                :msg="stateDataErrorMsg"
                            />
                        </div>

                        <!-- Postal code -->
                        <div
                            v-show="isSingapore && showFields.includes('postalCode')"
                            class="o-addressForm__field -postalCode -singapore"
                            :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                        >
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
                                :placeholder="postalCodePlaceholder"
                                :class="{ '-isInvalid': postalCodeDataError }"
                                aria-describedby="postalCodeErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="postalCodeErrorMsg"
                                :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                :msg="postalCodeDataErrorMsg"
                            />
                        </div>

                        <!-- Phone Number -->
                        <div
                            v-show="showFields.includes('phoneNumber')"
                            class="o-addressForm__field -phoneNumber"
                            :class="{
                                '-malaysia' : isMalaysia,
                                '-singapore' : isSingapore,
                                '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs,
                                '-mexico': isMexico
                            }"
                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', 'PHONE NUMBER')"
                            >
                            </label>
                            <input-basic
                                id="phoneNumber"
                                name="phoneNumber"
                                vmodel="phoneNumberData"
                                :value="phoneNumberData"
                                :placeholder="phoneNumberPlaceholder"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                </template>
                <!-- #endregion END: Singapore & Malaysia Postal Code, City, State, Phone Number -->
                <!-- #region BEGIN: Philippines Province, City, Suburb / Barangay, Phone Number -->
                <template v-if="isPhilippines">
                    <div class="o-addressForm__addressContainer">
                        <div
                            class="o-addressForm__field -province"
                            :class="{'-hasErrorMsg': provinceDataError && renderValidationsBelowInputs}"
                        >
                            <label class="m-formField__label" for="province">
                                {{ getLocalizationProp('Labels.ShippingSection.Province') }}
                            </label>
                            <v-select
                                id="province"
                                vmodel="provinceData"
                                name="province"
                                :options="provinceLongNames.toString()"
                                :values="province"
                                :initial="!provinceData ? province[0] : provinceData"
                                :class="{ '-error': provinceDataError }"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                arrow-tailwind-color="gray-120"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                aria-describedby="provinceErrorMsg"
                                :aria-label="
                                    getLocalizationProp(
                                        'Labels.ShippingSection.Province', 'Province'
                                    )
                                "
                                @change="handlePhProvinceSelectChange($event)"
                            />
                            <FormFieldErrorMessage
                                id="provinceErrorMsg"
                                :is-visible="provinceDataError && renderValidationsBelowInputs"
                                :msg="provinceDataErrorMsg"
                            />
                        </div>
                        <div
                            class="o-addressForm__field -city"
                            :class="{'-hasErrorMsg': cityDataError && renderValidationsBelowInputs}"
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
                                :aria-label="
                                    getLocalizationProp('Labels.ShippingSection.City', 'City')
                                "
                                :readonly="isPhCitySelectReadOnly"
                                @change="handlePhCitySelectChange($event)"
                            />
                            <FormFieldErrorMessage
                                id="cityErrorMsg"
                                :is-visible="cityDataError && renderValidationsBelowInputs"
                                :msg="cityDataErrorMsg"
                            />
                        </div>
                    </div>
                    <div class="o-addressForm__addressContainer">
                        <div
                            class="o-addressForm__field -suburb"
                            :class="{'-hasErrorMsg': suburbDataError && renderValidationsBelowInputs}"
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
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                arrow-tailwind-color="gray-120"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                aria-describedby="suburbErrorMsg"
                                :aria-label="getLocalizationProp('Labels.ShippingSection.Suburb', 'Suburb')"
                                :readonly="isPhSuburbSelectReadOnly"
                                @change="handlePhSuburbSelectChange($event)"
                            />
                            <FormFieldErrorMessage
                                id="suburbErrorMsg"
                                :is-visible="suburbDataError && renderValidationsBelowInputs"
                                :msg="suburbDataErrorMsg"
                            />
                        </div>
                        <div
                            class="o-addressForm__field -phoneNumber"
                            :class="{
                                '-hasErrorMsg':
                                    phoneNumberDataError && renderValidationsBelowInputs
                            }"
                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel(
                                    'phoneNumber', 'Labels.ShippingSection.PhoneNumber', ''
                                )"
                            >
                            </label>
                            <input-basic
                                id="phoneNumber"
                                name="phoneNumber"
                                :value="phoneNumberData"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                :placeholder="phoneNumberPlaceholder"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                </template>
                <!-- #endregion END: Philippines Province, City, Suburb / Barangay, Phone Number -->
                <!-- #region BEGIN: Europe Col Left Bottom Section -->
                <div v-if="isEurope">
                    <!-- #region BEGIN: United Kingdom Suburb, City, Postal Code, Phone Number -->
                    <div v-if="isUnitedKingdom">
                        <div class="block lg:flex">
                            <div
                                class="o-addressForm__field mr-0 lg:mr-12"
                                :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="city"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.City') }}
                                </label>
                                <input-basic
                                    id="city"
                                    vmodel="cityData"
                                    name="city"
                                    :placeholder="cityPlaceholder"
                                    :class="{ '-isInvalid': cityDataError }"
                                    :value="cityData"
                                    aria-describedby="cityErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="cityErrorMsg"
                                    :is-visible="cityDataError && renderValidationsBelowInputs"
                                    :msg="cityDataErrorMsg"
                                />
                            </div>
                            <div
                                class="o-addressForm__field"
                                :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="postalCode"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                                </label>
                                <input-basic
                                    id="postalCode"
                                    name="postalCode"
                                    vmodel="postalCodeData"
                                    :value="postalCodeData"
                                    :placeholder="postalCodePlaceholder"
                                    :class="{ '-isInvalid': postalCodeDataError }"
                                    aria-describedby="postalCodeErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="postalCodeErrorMsg"
                                    :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                    :msg="postalCodeDataErrorMsg"
                                />
                            </div>
                        </div>
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', '')"
                            />
                            <input-basic
                                id="phoneNumber"
                                vmodel="phoneNumberData"
                                name="phoneNumber"
                                :placeholder="phoneNumberPlaceholder"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                :value="phoneNumberData"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                    <!--  #endregion END: United Kingdom Suburb, City, Postal Code, Phone Number -->
                    <!-- #region BEGIN: Austria/Germany/Poland/Netherlands City, Postal Code, Phone Number -->
                    <div v-if="isAustria || isGermany || isPoland || isNetherlands">
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="city"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.City') }}
                            </label>
                            <input-basic
                                id="city"
                                vmodel="cityData"
                                name="city"
                                :placeholder="cityPlaceholder"
                                :class="{ '-isInvalid': cityDataError }"
                                :value="cityData"
                                aria-describedby="cityErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="cityErrorMsg"
                                :is-visible="cityDataError && renderValidationsBelowInputs"
                                :msg="cityDataErrorMsg"
                            />
                        </div>
                        <div class="block lg:flex">
                            <div
                                class="o-addressForm__field mr-0 lg:mr-12"
                                :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="postalCode"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                                </label>
                                <input-basic
                                    id="postalCode"
                                    name="postalCode"
                                    vmodel="postalCodeData"
                                    :value="postalCodeData"
                                    :placeholder="postalCodePlaceholder"
                                    :class="{ '-isInvalid': postalCodeDataError }"
                                    aria-describedby="postalCodeErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="postalCodeErrorMsg"
                                    :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                    :msg="postalCodeDataErrorMsg"
                                />
                            </div>
                            <div
                                class="o-addressForm__field"
                                :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="phoneNumber"
                                    v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', '')"
                                />
                                <input-basic
                                    id="phoneNumber"
                                    vmodel="phoneNumberData"
                                    name="phoneNumber"
                                    :placeholder="phoneNumberPlaceholder"
                                    :class="{ '-isInvalid': phoneNumberDataError }"
                                    :value="phoneNumberData"
                                    aria-describedby="phoneNumberErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="phoneNumberErrorMsg"
                                    :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                    :msg="phoneNumberDataErrorMsg"
                                />
                            </div>
                        </div>
                    </div>
                    <!-- #endregion END: Austria/Germany/Poland/Netherlands City, Postal Code, Phone Number -->
                    <!-- #region BEGIN: Ireland City, County, Postal Code, Phone Number -->
                    <div v-if="isIreland">
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="city"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.City') }}
                            </label>
                            <input-basic
                                id="city"
                                vmodel="cityData"
                                name="city"
                                :placeholder="cityPlaceholder"
                                :class="{ '-isInvalid': cityDataError }"
                                :value="cityData"
                                aria-describedby="cityErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="cityErrorMsg"
                                :is-visible="cityDataError && renderValidationsBelowInputs"
                                :msg="cityDataErrorMsg"
                            />
                        </div>

                        <div class="block lg:flex">
                            <div
                                class="o-addressForm__field mr-0 lg:mr-12"
                                :class="{ '-hasErrorMsg': countyDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="county"
                                    v-html="formatLabel('county', 'Labels.ShippingSection.County', '')"
                                />
                                <input-basic
                                    id="county"
                                    name="county"
                                    vmodel="countyData"
                                    :placeholder="countyPlaceholder"
                                    :value="countyData"
                                    :class="{ '-isInvalid': countyDataError }"
                                    aria-describedby="countyErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="countyErrorMsg"
                                    :is-visible="countyDataError && renderValidationsBelowInputs"
                                    :msg="countyDataErrorMsg"
                                />
                            </div>
                            <div
                                class="o-addressForm__field mr-0 lg:mr-12"
                                :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="postalCode"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                                </label>
                                <input-basic
                                    id="postalCode"
                                    name="postalCode"
                                    vmodel="postalCodeData"
                                    :value="postalCodeData"
                                    :placeholder="postalCodePlaceholder"
                                    :class="{ '-isInvalid': postalCodeDataError }"
                                    aria-describedby="postalCodeErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="postalCodeErrorMsg"
                                    :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                    :msg="postalCodeDataErrorMsg"
                                />
                            </div>

                        </div>
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', '')"
                            />
                            <input-basic
                                id="phoneNumber"
                                vmodel="phoneNumberData"
                                name="phoneNumber"
                                :placeholder="phoneNumberPlaceholder"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                :value="phoneNumberData"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                    <!--  #endregion END: Ireland City, Postal Code, Phone Number -->
                    <!-- #region BEGIN: Lithuania City, Postal Code, Phone Number -->
                    <div v-if="isLithuania">
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="city"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.City') }}
                            </label>
                            <input-basic
                                id="city"
                                vmodel="cityData"
                                name="city"
                                :placeholder="cityPlaceholder"
                                :class="{ '-isInvalid': cityDataError }"
                                :value="cityData"
                                aria-describedby="cityErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="cityErrorMsg"
                                :is-visible="cityDataError && renderValidationsBelowInputs"
                                :msg="cityDataErrorMsg"
                            />
                        </div>
                        <div class="block lg:flex">
                            <div
                                class="o-addressForm__field mr-0 lg:mr-12"
                                :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="postalCode"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                                </label>
                                <input-basic
                                    id="postalCode"
                                    name="postalCode"
                                    vmodel="postalCodeData"
                                    :value="postalCodeData"
                                    :placeholder="postalCodePlaceholder"
                                    :class="{ '-isInvalid': postalCodeDataError }"
                                    aria-describedby="postalCodeErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="postalCodeErrorMsg"
                                    :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                    :msg="postalCodeDataErrorMsg"
                                />
                            </div>
                            <div
                                class="o-addressForm__field"
                                :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="phoneNumber"
                                    v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', '')"
                                />
                                <input-basic
                                    id="phoneNumber"
                                    vmodel="phoneNumberData"
                                    name="phoneNumber"
                                    :placeholder="phoneNumberPlaceholder"
                                    :class="{ '-isInvalid': phoneNumberDataError }"
                                    :value="phoneNumberData"
                                    aria-describedby="phoneNumberErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="phoneNumberErrorMsg"
                                    :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                    :msg="phoneNumberDataErrorMsg"
                                />
                            </div>
                        </div>
                    </div>
                    <!--  #endregion END: Lithuania Province, Postal Code, Phone Number -->
                    <!-- #region BEGIN: Spain/Estonia/Italy/Belgium/Luxembourg/Finland Postal Code, City, Phone Number -->
                    <div
                        v-if="isSpain ||
                            isEstonia ||
                            isItaly ||
                            isBelgium ||
                            isLuxembourg ||
                            isFinland"
                    >
                        <div class="block lg:flex">
                            <div
                                class="o-addressForm__field mr-0 lg:mr-12"
                                :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="postalCode"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                                </label>
                                <input-basic
                                    id="postalCode"
                                    name="postalCode"
                                    vmodel="postalCodeData"
                                    :value="postalCodeData"
                                    :placeholder="postalCodePlaceholder"
                                    :class="{ '-isInvalid': postalCodeDataError }"
                                    aria-describedby="postalCodeErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="postalCodeErrorMsg"
                                    :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                    :msg="postalCodeDataErrorMsg"
                                />
                            </div>
                            <div
                                class="o-addressForm__field"
                                :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="city"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.City') }}
                                </label>
                                <input-basic
                                    id="city"
                                    vmodel="cityData"
                                    name="city"
                                    :placeholder="cityPlaceholder"
                                    :class="{ '-isInvalid': cityDataError }"
                                    :value="cityData"
                                    aria-describedby="cityErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="cityErrorMsg"
                                    :is-visible="cityDataError && renderValidationsBelowInputs"
                                    :msg="cityDataErrorMsg"
                                />
                            </div>
                        </div>
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', '')"
                            />
                            <input-basic
                                id="phoneNumber"
                                vmodel="phoneNumberData"
                                name="phoneNumber"
                                :placeholder="phoneNumberPlaceholder"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                :value="phoneNumberData"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                    <!--  #endregion END: Spain/Estonia/Italy/Belgium/Luxembourg/Finland Postal Code, City, Phone Number -->
                    <!--  #region BEGIN: Hungary Postal Code & Phone Number -->
                    <div v-if="isHungary">
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="postalCode"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                            </label>
                            <input-basic
                                id="postalCode"
                                name="postalCode"
                                vmodel="postalCodeData"
                                :value="postalCodeData"
                                :placeholder="postalCodePlaceholder"
                                :class="{ '-isInvalid': postalCodeDataError }"
                                aria-describedby="postalCodeErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="postalCodeErrorMsg"
                                :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                :msg="postalCodeDataErrorMsg"
                            />
                        </div>
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', '')"
                            />
                            <input-basic
                                id="phoneNumber"
                                vmodel="phoneNumberData"
                                name="phoneNumber"
                                :placeholder="phoneNumberPlaceholder"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                :value="phoneNumberData"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                    <!--  #endregion END: Hungary Postal Code & Phone Number -->
                    <!--  #region BEGIN: Latvia City, Postal Code, Phone Number -->
                    <div v-if="isLatvia">
                        <div class="block lg:flex">
                            <div
                                class="o-addressForm__field  mr-0 lg:mr-12"
                                :class="{ '-hasErrorMsg': cityDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="city"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.City') }}
                                </label>
                                <input-basic
                                    id="city"
                                    vmodel="cityData"
                                    name="city"
                                    :placeholder="cityPlaceholder"
                                    :class="{ '-isInvalid': cityDataError }"
                                    :value="cityData"
                                    aria-describedby="cityErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="cityErrorMsg"
                                    :is-visible="cityDataError && renderValidationsBelowInputs"
                                    :msg="cityDataErrorMsg"
                                />
                            </div>
                            <div
                                class="o-addressForm__field"
                                :class="{ '-hasErrorMsg': postalCodeDataError && renderValidationsBelowInputs }"
                            >
                                <label
                                    class="m-formField__label"
                                    for="postalCode"
                                >
                                    {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                                </label>
                                <input-basic
                                    id="postalCode"
                                    name="postalCode"
                                    vmodel="postalCodeData"
                                    :value="postalCodeData"
                                    :placeholder="postalCodePlaceholder"
                                    :class="{ '-isInvalid': postalCodeDataError }"
                                    aria-describedby="postalCodeErrorMsg"
                                    @keyup="setInput"
                                    @change="setInput"
                                />
                                <FormFieldErrorMessage
                                    id="postalCodeErrorMsg"
                                    :is-visible="postalCodeDataError && renderValidationsBelowInputs"
                                    :msg="postalCodeDataErrorMsg"
                                />
                            </div>
                        </div>
                        <div
                            class="o-addressForm__field"
                            :class="{ '-hasErrorMsg': phoneNumberDataError && renderValidationsBelowInputs }"
                        >
                            <label
                                class="m-formField__label"
                                for="phoneNumber"
                                v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', '')"
                            />
                            <input-basic
                                id="phoneNumber"
                                vmodel="phoneNumberData"
                                name="phoneNumber"
                                :placeholder="phoneNumberPlaceholder"
                                :class="{ '-isInvalid': phoneNumberDataError }"
                                :value="phoneNumberData"
                                aria-describedby="phoneNumberErrorMsg"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <FormFieldErrorMessage
                                id="phoneNumberErrorMsg"
                                :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                                :msg="phoneNumberDataErrorMsg"
                            />
                        </div>
                    </div>
                    <!--  #endregion END: Latvia City, Postal Code, Phone Number -->
                </div>
                <!-- #endregion END: Europe Col Left Bottom Section -->
            </div>
            <!-- #endregion END: Col Left -->
            <!-- #region BEGIN: Col Right -->
            <div v-if="!isBusiness" class="w-full lg:w-1_2 lg:pl-20">
                <div
                    v-show="!isSingapore && showFields.includes('companyName')"
                    class="m-formField -text"
                    :class="{ 'pb-6': companyNameDataError && renderValidationsBelowInputs }"
                >
                    <label
                        class="m-formField__label"
                        for="companyName"
                        v-html="formatLabel('companyName', 'Labels.ShippingSection.CompanyName', 'COMPANY NAME / ATTENTION')"
                    >
                    </label>
                    <input-basic
                        id="companyName"
                        vmodel="companyNameData"
                        name="companyName"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.CompanyNamePlaceholder')"
                        :class="{ '-isInvalid': companyNameDataError }"
                        :value="companyNameData"
                        aria-describedby="companyNameErrorMsg"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <FormFieldErrorMessage
                        id="companyNameErrorMsg"
                        :is-visible="companyNameDataError && renderValidationsBelowInputs"
                        :msg="companyNameDataErrorMsg"
                    />
                </div>

                <div class="lg:pb-7">
                    <div
                        v-show="showFields.includes('deliveryInstructions')"
                        class="o-addressForm__field"
                        :class="{ '-hasErrorMsg': deliveryInstructionsDataError && renderValidationsBelowInputs }"
                    >
                        <label
                            class="m-formField__label"
                            for="deliveryInstructions"
                            v-html="formatLabel('deliveryInstructions', 'Labels.ShippingSection.DeliveryInstructions', 'DELIVERY INSTRUCTIONS')"></label>
                        <textarea
                            id="deliveryInstructions"
                            class="m-formField__textArea -addressForm"
                            :class="{ '-isInvalid': deliveryInstructionsDataError }"
                            vmodel="deliveryInstructionsData"
                            :value="deliveryInstructionsData"
                            name="deliveryInstructions"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.DeliveryInstructionsPlaceholder')"
                            aria-describedby="deliveryInstructionsErrorMsg"
                            @composition-end="setInput"
                            @keyup="setInput"
                            @change="setInput">
                        </textarea>
                        <FormFieldErrorMessage
                            id="deliveryInstructionsErrorMsg"
                            :is-visible="deliveryInstructionsDataError && renderValidationsBelowInputs"
                            :msg="deliveryInstructionsDataErrorMsg"
                        />
                    </div>

                    <!-- JP & KR Phone Number -->
                    <div
                        v-if="(isKorea || isJapan) && showFields.includes('phoneNumber')" class="m-formField -text"
                        :class="{ 'pb-6': phoneNumberDataError && renderValidationsBelowInputs }"
                    >
                        <label
                            class="m-formField__label"
                            for="phoneNumber"
                            v-html="formatLabel('phoneNumber', 'Labels.ShippingSection.PhoneNumber', 'PHONE NUMBER')"
                        >
                        </label>
                        <input-basic
                            id="phoneNumber"
                            name="phoneNumber"
                            vmodel="phoneNumberData"
                            :value="phoneNumberData"
                            :placeholder="phoneNumberPlaceholder"
                            :class="{ '-isInvalid': phoneNumberDataError }"
                            aria-describedby="phoneNumberErrorMsg"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <FormFieldErrorMessage
                            id="phoneNumberErrorMsg"
                            :is-visible="phoneNumberDataError && renderValidationsBelowInputs"
                            :msg="phoneNumberDataErrorMsg"
                        />
                    </div>

                    <div
                        v-if="getLocalizationProp('Labels.ShippingSection.DisclaimerDetails', null)"
                        class="m-formField -text">

                        <div class="o-addressForm__disclaimer mt-25">

                            <div v-html="getLocalizationProp('Labels.ShippingSection.DisclaimerDetails')" />
                        </div>
                    </div>
                </div>
            </div>
            <!-- #endregion END: Col Right -->
        </div>

        <div v-if="!(isMexico && showMxAddressForm)" class="w-full">
            <div v-if="!isBusiness" class="pb-24">
                <m-checkbox
                    v-model="defaultShip"
                    class="-center -padding-xs"
                    :class="{ '-isInvalid': defaultShipError }"
                    name="defaultShip"
                    :label="getLocalizationProp('Labels.ShippingSection.DefaultShipping', 'Make this my Default Shipping Address')"
                />
                <FormFieldErrorMessage
                    id="defaultShipErrorMsg"
                    :is-visible="defaultShipErrorMsg && renderValidationsBelowInputs"
                    :msg="defaultShipErrorMsg"
                />
                <div v-if="isValidatedByServicesApi === false">
                    <m-checkbox
                        v-model="isAddressVerifiedByUserCheckbox"
                        class="-center -padding-xs"
                        name="isAddressVerifiedByUser"
                        :label="getLocalizationProp('Labels.ShippingSection.VerifyAddressText', 'I have verified this address is correct')"
                    />
                </div>
            </div>
            <div class="flex pb-30 to-xs:justify-between">
                <!-- Cancel -->
                <div class="xs:mr-30 text-center to-xs:w-1_2 mr-10">
                    <button class="a-authorBtn -default block bg-white text-green rounded px-10 md:px-50 w-full text-center mr-8 md:w-auto" @click.stop.prevent="nextPage">
                        {{ getLocalizationProp('Labels.ShippingSection.Cancel', 'Cancel') }}
                    </button>
                </div>
                <!-- Next/Continue -->
                <div class="text-center to-xs:w-1_2">
                    <button class="o-addressForm__button -save" type="submit" data-testid="button-addNewAddressSaveBtn">
                        {{ getLocalizationProp('Labels.CTA.Save', 'Save') }}
                    </button>
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
            </div>
        </div>

        <div class="">
            <div data-loading="address__loading" class="w-40">
                <a-loading-spinner :visible="isLoadingSubmitForm" />
            </div>
            <p
                v-for="(error, index) in listError"
                :key="uniqid(index)"
                class="text-error">
                {{ error.Translation }}
            </p>
            <!-- copy/paste error below buttons -->
            <p v-if="copyPasteError" class="e-formError__item">{{ copyPasteError }}</p>

        </div>

        <ul v-if="errorsMsgs.length && !renderValidationsBelowInputs" class="e-formError__list">
            <li
                v-for="(msg, index) in errorsMsgs"
                :key="index"
                class="e-formError__item">
                {{ msg }}
            </li>
        </ul>

        <!-- Modal: Korean Zip Code Search -->
        <modal id="modal-kr-address-search" size="lg">
            <template #content>
                <o-address-search
                    class="-mx-15 md:mx-0"
                    :address-not-selected-label="getLocalizationProp('Labels.AddressSearch.PleaseSelectError', 'Please Select Address')"
                    :cancel-label="getLocalizationProp('Labels.AddressSearch.Cancel', 'Cancel')"
                    :confirm-label="getLocalizationProp('Labels.AddressSearch.Confirm', 'Confirm')"
                    heading-id="global-modal-heading"
                    :heading-label="getLocalizationProp('Labels.AddressSearch.FindZipCode', 'Find Your Zip Code')"
                    :input-placeholder="getLocalizationProp('Labels.AddressSearch.SearchPlaceholder', 'Enter your zip code')"
                    :no-entry-error="getLocalizationProp('Labels.AddressSearch.NoEntryError', '<p>Please enter a zip code to search.</p>')"
                    :no-results-error="getLocalizationProp('Labels.AddressSearch.NoResultsError', '<p>No results found</p>')"
                    :search-label="getLocalizationProp('Labels.AddressSearch.Search', 'Search')"
                    :subheading-label="getLocalizationProp('Labels.AddressSearch.SearchInstructions', '')"
                    :zip-code-label="getLocalizationProp('Labels.ShippingSection.ZipCode', 'Zip Code')"
                    @closeModal="hideModal"
                    @confirm="onAddressSearchConfirm"
                />
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

        <OAddressPaymethodPrompt
            ref="addressPrompt"
            :cancel-label="addressPromptCancel"
            :confirm-label="addressPromptConfirm"
            :desc-label="addressPromptText"
            :is-prompt-enabled="isDefaultPaymethodAddressPromptEnabled"
            :ok-label="addressPromptOk"
            :title-label="addressPromptTitle"
            :updated-label="addressPromptUpdated"
            @onComplete="completeRedirect"
        />
    </form>
</template>

<script>
    import addressFormLogic from '../../../mixins/address-form';
    import AddressSearch from './address-search.vue';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import OAddressPaymethodPrompt from '@productstore/source/js/vue/components/02-organisms/modals/address-paymethod-prompt.vue';
    import OAddressFormMx from './address-form-mx.vue';

    export default {
        name: 'OAddressForm',
        components: {
            [AddressSearch.name]: AddressSearch,
            FormFieldErrorMessage,
            OAddressPaymethodPrompt,
            OAddressFormMx
        },
        mixins: [addressFormLogic],
        props: {
            showMxAddressForm: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            addressPromptCancel() {
                return this.localization?.Labels?.AddressPromptModel?.ChangeOne;
            },
            addressPromptConfirm() {
                return this.localization?.Labels?.AddressPromptModel?.ChangeBoth;
            },
            addressPromptOk() {
                return this.localization?.Labels?.Continue || 'Ok';
            },
            addressPromptText() {
                return this.localization?.Labels?.AddressPromptModel?.Description;
            },
            addressPromptTitle() {
                return this.localization?.Labels?.AddressPromptModel?.Title;
            },
            addressPromptUpdated() {
                return this.localization?.Labels?.AddressPromptModel?.Updated;
            },
            isDefaultPaymethodAddressPromptEnabled() {
                return this.getLocalizationProp('Data.FeatureFlag.PaymethodAddressPrompt') || this.getLocalizationProp('Data.RiverbendPaymethodAddressPrompt');
            }
        },
        methods: {
            completeRedirect() {
                this.nextPage(this.addressId);
            },
            handleMxValidationApiError(payload) {
                // MX address enhancement - reset API errors with every new call
                payload.clear ? this.listError = [] : this.listError.push(payload.error[0]);
            },
            hideModal() {
                this.$modal.hide({
                    id: 'modal-kr-address-search'
                });
            },
            updateDefaultShipFromMxAddressForm(value) {
                this.defaultShip = value;
            },
            updateSuggestionPickFromMxAddressForm(value) {
                this.suggestionPick = value;
            }
        }
    };

</script>

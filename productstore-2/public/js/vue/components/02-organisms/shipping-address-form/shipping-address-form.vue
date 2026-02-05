<template>
    <component
        :is="isForm ? 'form': 'div'"
        id="shippAddressForm"
        action="shippAddress"
        method="post"
        class="o-shippAddressForm"
        :class="{'-isForm': isForm}"
    >
        <!-- Country -->
        <div class="o-shippAddressForm__field -country">
            <label
                class="o-shippAddressForm__label"
                for="countrySelected"
            >
                {{ getLocalizationProp('Labels.ShippingSection.Country') }}
            </label>
            <v-select
                v-if="countriesLabels.length"
                id="countrySelected"
                :options="countriesLabels.toString()"
                :values="countriesValues"
                vmodel="chosenCountry"
                :initial="(!chosenCountry) ? countriesValues[0].replaceAll(' ', '').toLowerCase() : chosenCountry"
                arrow-tailwind-color="gray-120"
                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                :aria-label="getLocalizationProp('Labels.ShippingSection.Country')"
                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                @change="selectedCountry"
            >
            </v-select>
        </div>

        <div class="o-shippAddressForm__inner">

            <!-- Col Left -->
            <div class="o-shippAddressForm__col">

                <!-- Address_1 -->
                <div
                    ref="address_1"
                    v-clickoutside="closeSuggestionList"
                    class="o-shippAddressForm__field -address1"
                    @keyup.esc="showAddressList = false"
                >
                    <label
                        class="o-shippAddressForm__label"
                        for="address_1"
                    >
                        {{ getLocalizationProp('Labels.ShippingSection.Address1') }}
                    </label>
                    <input-basic
                        id="address_1"
                        ref="address_1input"
                        vmodel="address_1Data"
                        name="address_1"
                        :class="{ '-isInvalid': address_1DataError }"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address1Placeholder')"
                        :value="address_1Data"
                        @keyup="setInput"
                        @change="setInput"
                        @focus="checkListFocus"
                    />
                    <div v-if="loadingExp" class="o-shippAddressForm__loading">
                        <a-loading-spinner :visible="loadingExp" size="sm" />
                    </div>

                    <ul v-if="addressList.length && showAddressList" class="o-shippAddressForm__list">
                        <li
                            v-for="(item, index) in addressList"
                            :key="item.format"
                            :ref="`sugg-${index}`"
                            class="o-shippAddressForm__item">
                            <button class="o-shippAddressForm__cta" @click.prevent="chosenAddress(item, false, true)">
                                {{ (!item.text) ? item.suggestion : item.text }}
                            </button>
                        </li>
                    </ul>
                    <div v-if="$v.address_1Data && $v.address_1Data.$error" class="e-formError">
                        <p class="e-formError__item pb-0" role="alert">
                            {{ getLocalizationProp('Labels.ShippingSection.Address1Error') }}
                        </p>
                    </div>
                </div>

                <!-- Address_2 -->
                <div class="o-shippAddressForm__field">
                    <label
                        class="o-shippAddressForm__label"
                        for="address_2"
                        v-html="getLocalizationProp('Labels.ShippingSection.Address2')"
                    >
                    </label>
                    <input-basic
                        id="address_2"
                        vmodel="address_2Data"
                        name="address_2"
                        :placeholder="getLocalizationProp('Labels.ShippingSection.Address2Placeholder')"
                        :value="address_2Data"
                        @keyup="setInput"
                        @change="setInput"
                    />
                </div>

                <!-- Address 3 / Referencia-->
                <div
                    v-if="chosenCountry === 'mexico'"
                    class="o-shippAddressForm__field">
                    <label
                        class="o-shippAddressForm__label"
                        for="address_3"
                        v-html="getLocalizationProp('Labels.ShippingSection.Address3')"
                    >
                    </label>
                    <input-basic
                        id="address_3"
                        name="address_3"
                        :value="address_3Data"
                        @keyup="setInput"
                        @change="setInput"
                    />
                </div>

                <div class="o-shippAddressForm__inner -top">

                    <!-- City -->
                    <div
                        v-if="chosenCountry === 'unitedstates' || chosenCountry === 'canada'"
                        class="o-shippAddressForm__field -city">
                        <label
                            class="o-shippAddressForm__label"
                            for="city"
                        >
                            {{ getLocalizationProp('Labels.ShippingSection.City') }}
                        </label>
                        <input-basic
                            id="city"
                            vmodel="cityData"
                            name="city"
                            :placeholder="getLocalizationProp('Labels.ShippingSection.CityPlaceholder')"
                            :class="{ '-isInvalid': cityDataError }"
                            :value="cityData"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <div v-if="$v.cityData && $v.cityData.$error" class="e-formError">
                            <p class="e-formError__item pb-0" role="alert">
                                {{ getLocalizationProp('Labels.ShippingSection.CityError') }}
                            </p>
                        </div>
                    </div>

                    <div class="o-shippAddressForm__inner -bottom">

                        <!-- State -->
                        <div
                            v-show="chosenCountry === 'unitedstates'"
                            class="o-shippAddressForm__field -state">
                            <label
                                class="o-shippAddressForm__label"
                                for="stateUs"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.State') }}
                            </label>
                            <v-select
                                v-if="stateUs.length"
                                id="stateUs"
                                vmodel="stateUsData"
                                :options="stateUs.toString()"
                                :values="stateUs"
                                :initial="(!stateUsData) ? stateUs[0] : stateUsData"
                                :class="{ '-error': stateUsDataError }"
                                :aria-label="getLocalizationProp('Labels.ShippingSection.State')"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                @change="setInput"
                            >
                            </v-select>
                            <div v-if="$v.stateUsData && $v.stateUsData.$error" class="e-formError">
                                <p class="e-formError__item pb-0" role="alert">
                                    {{ getLocalizationProp('Labels.ShippingSection.StateError') }}
                                </p>
                            </div>
                        </div>

                        <!-- Province -->
                        <div
                            v-show="chosenCountry === 'canada'"
                            class="o-shippAddressForm__field -province">
                            <label
                                class="o-shippAddressForm__label"
                                for="province"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.Province') }}
                            </label>
                            <v-select
                                v-if="province.length"
                                id="province"
                                vmodel="provinceData"
                                :options="province.toString()"
                                :values="province"
                                :initial="(!provinceData) ? province[0] : provinceData"
                                :class="{ '-error': provinceDataError }"
                                :aria-label="getLocalizationProp('Labels.ShippingSection.Province')"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                @change="setInput"
                            >
                            </v-select>
                            <div v-if="$v.provinceData && $v.provinceData.$error" class="e-formError">
                                <p class="e-formError__item pb-0" role="alert">
                                    {{ getLocalizationProp('Labels.ShippingSection.ProvinceError') }}
                                </p>
                            </div>
                        </div>

                        <!-- Zip code -->
                        <div
                            v-if="chosenCountry === 'unitedstates'"
                            class="o-shippAddressForm__field -zip">
                            <label
                                class="o-shippAddressForm__label"
                                for="zipCode"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.ZipCode') }}
                            </label>
                            <input-basic
                                id="zipCode"
                                ref="zipCode"
                                name="zipCode"
                                vmodel="zipCodeData"
                                :value="zipCodeData"
                                :class="{ '-isInvalid': zipCodeDataError }"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <div v-if="$v.zipCodeData && $v.zipCodeData.$error" class="e-formError">
                                <p class="e-formError__item pb-0" role="alert">
                                    {{ getLocalizationProp('Labels.ShippingSection.ZipCodeError') }}
                                </p>
                            </div>
                        </div>

                        <!-- Postal code -->
                        <div
                            v-if="chosenCountry === 'canada'"
                            class="o-shippAddressForm__field -postalCode">
                            <label
                                class="o-shippAddressForm__label"
                                for="postalCode"
                            >
                                {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                            </label>
                            <input-basic
                                id="postalCode"
                                name="postalCode"
                                vmodel="postalCodeData"
                                :value="postalCodeData"
                                :class="{ '-isInvalid': postalCodeDataError }"
                                @keyup="setInput"
                                @change="setInput"
                            />
                            <div v-if="$v.postalCodeData && $v.postalCodeData.$error" class="e-formError">
                                <p class="e-formError__item pb-0" role="alert">
                                    {{ getLocalizationProp('Labels.ShippingSection.PostalCodeError') }}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Col Right -->
            <div class="o-shippAddressForm__col -right">

                <!-- Delegacion / Municipio (City) -->
                <div
                    v-if="chosenCountry === 'mexico'"
                    class="o-shippAddressForm__field">
                    <label
                        class="o-shippAddressForm__label"
                        for="city"
                        v-html="getLocalizationProp('Labels.ShippingSection.City')"
                    >
                    </label>
                    <input-basic
                        id="city"
                        vmodel="cityData"
                        name="city"
                        :value="cityData"
                        :class="{ '-isInvalid': cityDataError }"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="$v.cityData && $v.cityData.$error" class="e-formError">
                        <p class="e-formError__item pb-0" role="alert">
                            {{ getLocalizationProp('Labels.ShippingSection.CityError') }}
                        </p>
                    </div>
                </div>

                <div class="o-shippAddressForm__inner -bottom">

                    <!-- Postal Code / Codigo postal -->
                    <div
                        v-if="chosenCountry === 'mexico'"
                        class="o-shippAddressForm__field -codigoPostal">
                        <label
                            class="o-shippAddressForm__label"
                            for="postalCode"
                        >
                            {{ getLocalizationProp('Labels.ShippingSection.PostalCode') }}
                        </label>
                        <input-basic
                            id="postalCode"
                            name="postalCode"
                            vmodel="postalCodeData"
                            :value="postalCodeData"
                            :class="{ '-isInvalid': postalCodeDataError }"
                            @keyup="setInput"
                            @change="setInput"
                        />
                        <div v-if="$v.postalCodeData && $v.postalCodeData.$error" class="e-formError">
                            <p class="e-formError__item pb-0" role="alert">
                                {{ getLocalizationProp('Labels.ShippingSection.PostalCodeError') }}
                            </p>
                        </div>
                    </div>

                    <!-- State MX (Estado) -->
                    <div
                        v-if="chosenCountry === 'mexico'"
                        class="o-shippAddressForm__field -stateMx">
                        <label
                            class="o-shippAddressForm__label"
                            for="stateMx"
                        >
                            {{ getLocalizationProp('Labels.ShippingSection.State') }}
                        </label>
                        <v-select
                            v-if="statesMexValues.length"
                            id="stateMx"
                            ref="stateMx"
                            vmodel="stateMxData"
                            :options="statesMexLabels.toString()"
                            :values="statesMexValues"
                            :initial="(!stateMxData) ? statesMexValues[0] : stateMxData"
                            :aria-label="getLocalizationProp('Labels.ShippingSection.State')"
                            :class="{ '-error': stateMxDataError }"
                            select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                            arrow-tailwind-color="gray-120"
                            arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                            @change="setInput"
                        >
                        </v-select>
                        <div v-if="$v.stateMxData && $v.stateMxData.$error" class="e-formError">
                            <p class="e-formError__item pb-0" role="alert">
                                {{ getLocalizationProp('Labels.ShippingSection.StateError') }}
                            </p>
                        </div>
                    </div>

                </div>

                <!-- Suburb / Colonia -->
                <div
                    v-if="chosenCountry === 'mexico'"
                    class="o-shippAddressForm__field -suburb">
                    <label
                        class="o-shippAddressForm__label"
                        for="suburb"
                    >
                        {{ getLocalizationProp('Labels.ShippingSection.Suburb') }}
                    </label>
                    <input-basic
                        id="suburb"
                        name="suburb"
                        vmodel="suburbData"
                        :value="suburbData"
                        :class="{ '-isInvalid': suburbDataError }"
                        @keyup="setInput"
                        @change="setInput"
                    />
                    <div v-if="$v.suburbData && $v.suburbData.$error" class="e-formError">
                        <p class="e-formError__item pb-0" role="alert">
                            {{ getLocalizationProp('Labels.ShippingSection.SuburbError') }}
                        </p>
                    </div>
                </div>

                <!-- CTA -->
                <div class="o-shippAddressForm__actions">
                    <!-- Cancel -->
                    <a
                        v-if="hasCancelCta"
                        class="a-authorBtn -default block bg-white text-green rounded px-50 w-full text-center mr-8 md:w-auto"
                        :href="getLocalizationProp('Data.ShippingSection.CancelCta.Url')"
                    >
                        {{ getLocalizationProp('Data.ShippingSection.CancelCta.Text') }}
                    </a>

                    <!-- Next/Continue -->
                    <button
                        class="a-authorBtn -default block bg-green text-center rounded px-50 w-full md:w-auto"
                        @click.stop.prevent="submit()"
                    >
                        {{ getLocalizationProp('Labels.CTA.Continue') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Errors -->
        <div v-if="errorsMsgs.length" class="o-shippAddressForm__errors">
            <ul class="e-formError__list">
                <li
                    v-for="(msg, index) in errorsMsgs"
                    :key="index"
                    class="e-formError__item">
                    {{ msg }}
                </li>
            </ul>
        </div>

        <!-- Modal | Verify Address -->
        <modal id="o-shippAddressForm__modal" heading-class="o-shippAddressForm__modalHeading">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.ShippingSection.VerifyAddressModalTitle', 'Verify Address') }}
            </template>

            <template v-slot:body>
                <div class="o-shippAddressForm__modalBody">
                    <span
                        class="o-shippAddressForm__modalTitle"
                        :class="{'-system': !hasAddressSuggestionList}">
                        {{ getLocalizationProp('Labels.ShippingSection.AddressEntered', 'Address You Entered:') }}
                    </span>

                    <div
                        v-if="hasAddressSuggestionList"
                        class="o-shippAddressForm__modalSuggestions">

                        <!-- Address entered -->
                        <m-radio
                            v-model="radioSelectedIndex"
                            name="verifyAddress"
                            class="o-shippAddressForm__radio"
                            label-mods="-top"
                            :input-value="0"
                            mods="w-auto flex-1"
                        >

                            <span v-html="addressEnteredFormatted" />
                        </m-radio>

                        <span
                            class="o-shippAddressForm__modalTitle -suggested"
                            :class="{'-system': !hasAddressSuggestionList}">
                            {{ getLocalizationProp('Labels.ShippingSection.Suggested', 'Suggested:') }}
                        </span>

                        <!-- Suggestions -->
                        <m-radio
                            v-for="(item, index) in addressList.slice(0, 3)"
                            :key="index"
                            v-model="radioSelectedIndex"
                            name="verifyAddress"
                            :input-value="index + 1"
                            label-mods="-top pb-30"
                            mods="w-auto flex-1"
                        >

                            <span v-html="formatedAddress(item.text || item.suggestion)" />
                        </m-radio>
                    </div>
                    <div
                        v-else
                        class="o-shippAddressForm__modalSystem">

                        <span v-html="addressEnteredFormatted" />

                        <p
                            class="o-shippAddressForm__modalDesc"
                            :class="{'-system': !hasAddressSuggestionList}">
                            {{ getLocalizationProp('Labels.ShippingSection.AddressNotOnSystem', 'This address is not currently in our system. Please review the address and make sure it is correct before continuing.') }}
                        </p>
                    </div>
                </div>
            </template>

            <template v-slot:footer>
                <div class="o-shippAddressForm__modalFooter">
                    <v-button
                        class="o-shippAddressForm__modalBtn -secondary -white"
                        @click="closeModal">
                        {{ getLocalizationProp('Labels.ShippingSection.Back', 'Back') }}
                    </v-button>

                    <v-button
                        class="o-shippAddressForm__modalBtn -primary -green"
                        @click="getChoosedAddress">
                        {{ getLocalizationProp('Labels.ShippingSection.UseThisAddress', 'Use this address') }}
                    </v-button>
                </div>
            </template>
        </modal>
    </component>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import { required, helpers } from 'vuelidate/lib/validators';
    import experian from '@common/source/js/vue/mixins/experian';
    const zipCheck = helpers.regex('alpha', /^[0-9]{5}(?:-[0-9]{4})?$/);
    const zipCheckCa = helpers.regex('alpha', /^[a-vxyA-VXY][0-9][a-zA-Z] [0-9][a-zA-Z][0-9]$/);

    export default {
        name: 'OShippAddressForm',
        directives: {
            clickoutside: {
                bind: function(el, binding, vnode, oldVnode) {
                    el.clickOutsideEvent = function(event) {
                        // Click outside the el and his childrens
                        if(!(el === event.target || el.contains(event.target))) {
                            // Call method provided in attribute value
                            vnode.context[binding.expression](event);
                        }
                    };
                    document.body.addEventListener('click', el.clickOutsideEvent);
                    document.body.addEventListener('touchstart', el.clickOutsideEvent);
                },
                unbind: function(el) {
                    document.body.removeEventListener('click', el.clickOutsideEvent);
                    document.body.removeEventListener('touchstart', el.clickOutsideEvent);
                },
                stopProp(event) {
                    event.stopPropagation();
                }
            }
        },
        mixins: [ experian, localizationMixin, validationMixin ],
        props: {
            isForm: {
                type: Boolean,
                default: true
            },
            localizationShipping: {
                type: Object,
                default: () => {}
            },
            address1Prop: {
                type: String,
                default: ''
            },
            address2Prop: {
                type: String,
                default: ''
            },
            address3Prop: {
                type: String,
                default: ''
            },
            cityProp: {
                type: String,
                default: ''
            },
            countryProp: {
                type: String,
                default: 'unitedstates'
            },
            postalCodeProp: {
                type: String,
                default: ''
            },
            provinceProp: {
                type: String,
                default: ''
            },
            stateMxProp: {
                type: String,
                default: ''
            },
            stateUsProp: {
                type: String,
                default: ''
            },
            suburbProp: {
                type: String,
                default: ''
            },
            zipCodeProp: {
                type: String,
                default: ''
            }
        },
        validations() {
            if(this.chosenCountry === 'unitedstates') {
                return {
                    // Address 1
                    address_1Data: {
                        required
                    },
                    // City
                    cityData: {
                        required
                    },
                    // State US
                    stateUsData: {
                        required,
                        allowed: value => {
                            return value !== this.getLocalizationProp('Labels.Select');
                        }
                    },
                    // Zip
                    zipCodeData: {
                        required,
                        zipCheck
                    }
                };
            } else if(this.chosenCountry === 'canada') {
                return {
                    // Address 1
                    address_1Data: {
                        required
                    },
                    // City
                    cityData: {
                        required
                    },
                    // Province
                    provinceData: {
                        required,
                        allowed: value => {
                            return value !== this.getLocalizationProp('Labels.Select');
                        }
                    },
                    // Postal Code
                    postalCodeData: {
                        required,
                        zipCheckCa
                    }
                };
            } else {
                // Mexico
                return {
                    // Address 1
                    address_1Data: {
                        required
                    },
                    // Delegacion / City
                    cityData: {
                        required
                    },
                    // Codigo Postal
                    postalCodeData: {
                        required
                    },
                    // Estado
                    stateMxData: {
                        required,
                        allowed: value => {
                            return value !== this.getLocalizationProp('Labels.Select');
                        }
                    },
                    // Suburb / Colonia
                    suburbData: {
                        required
                    }
                };
            }
        },
        data() {
            return {
                address_1Data: null,
                address_1DataError: null,
                address_2Data: null,
                address_3Data: null,
                addressShipping: {}, // Final object with data
                countriesLabels: [],
                countriesValues: [],
                countryValue: null,
                chosenCountry: 'unitedstates',
                cityData: null,
                cityDataError: null,
                errorsMsgs: [],
                hasProp: false,
                intervalId: null,
                init: true, // init component
                isFormValid: false,
                mainExperianFields: {
                    inputId: 'address_1',
                    resultsCtaClass: '.o-shippAddressForm__cta',
                    wrapper: '.o-shippAddressForm__field.-address1'
                },
                postalCodeData: null,
                postalCodeDataError: null,
                provinceData: null,
                provinceDataError: null,
                radioSelectedIndex: 1,
                stateMxLabel: null,
                stateMxData: null,
                stateMxDataError: null,
                stateUsData: null,
                stateUsDataError: null,
                stateUs: [],
                statesMexLabels: [],
                statesMexValues: [],
                province: [],
                suburbData: null,
                suburbDataError: null,
                suggestionPick: false,
                zipCodeData: null,
                zipCodeDataError: null
            };
        },
        computed: {
            addressEntered() {
                let fieldsCountry = null;

                switch (this.chosenCountry) {
                    case 'canada':
                        fieldsCountry = {
                            'country': 'Canada',
                            'address1': this.address_1Data,
                            'address2': this.address_2Data,
                            'city': this.cityData,
                            'state': this.provinceData?.toUpperCase(),
                            'zipCode': this.postalCodeData
                        };
                        break;
                    case 'mexico':
                        fieldsCountry = {
                            'country': 'Mexico',
                            'address1': this.address_1Data,
                            'address2': this.address_2Data,
                            'address3': this.address_3Data,
                            'city': this.cityData,
                            'state': this.stateMxData?.toUpperCase(),
                            'zipCode': this.postalCodeData,
                            'suburb': this.suburbData
                        };
                        break;
                    case 'unitedstates':
                        fieldsCountry = {
                            'country': 'United States',
                            'address1': this.address_1Data,
                            'address2': this.address_2Data,
                            'city': this.cityData,
                            'state': this.stateUsData?.toUpperCase(),
                            'zipCode': this.zipCodeData
                        };
                        break;
                }

                // current input values
                return fieldsCountry;
            },
            addressEnteredFormatted() {
                const addressFormatted =
                    `${this.addressEntered.address1} <br />
                     ${(this.addressEntered.address2) ? this.addressEntered.address2 + '<br>' : ''}
                     ${(this.addressEntered.city) ? this.addressEntered.city : ''},
                     ${(this.addressEntered.state) ? (this.addressEntered.state) : ''} 
                     ${(this.addressEntered.zipCode) ? this.addressEntered.zipCode : ''}`;

                return addressFormatted;
            },
            hasAddressSuggestionList() {
                return this.addressList?.length > 0;
            },
            hasCancelCta() {
                const cancelCta = this.getLocalizationProp('Data.ShippingSection.CancelCta');
                return cancelCta?.Url?.length > 0 && cancelCta?.Text?.length > 0;
            },
            stateMxLocalization() {
                const chosenState = this.getLocalizationProp('Data.ShippingSection.StateMxValue');
                if(chosenState) {
                    const mxIndex = this.statesMexLabels.findIndex(state => state === chosenState);
                    if(mxIndex) return this.statesMexValues[mxIndex];
                }
                return '';
            }
        },
        watch: {
            $v: {
                deep: true,
                handler() {
                    // All required fields
                    const requiredFields = this.$v.$params;
                    this.errorsMsgs = [];

                    for (let key of Object.keys(requiredFields)) {
                        // Passing boolean errors for each field
                        if(this.$v[key]) this[`${key}Error`] = this.$v[key].$error;

                        // Errors Messages
                        if(this[`${key}Error`]) {
                            let keyError = key.replace('Data', '').replace('_', '');
                            if(keyError.includes('state')) keyError = 'state';
                            const keyErrorCapitalized = keyError.charAt(0).toUpperCase() + keyError.slice(1);
                            const labelError = `Labels.ShippingSection.${keyErrorCapitalized}Error`;
                            this.errorsMsgs.push(this.getLocalizationProp(labelError));
                        }
                    }
                }
            },
            addressEntered() {
                // Reset if change any field
                this.isFormValid = false;
            },
            chosenCountry(newVal, oldVal) {
                // Reset if none
                if(!newVal) this.chosenCountry = 'unitedstates';
            }
        },
        mounted() {
            if(Object.keys(this.localization).length === 0) this.localization = this.localizationShipping;

            // Get all info about the countries, states
            const countries = this.getLocalizationProp('Data.ShippingSection.Provinces') || 'unitedstates';
            const selectLabel = this.getLocalizationProp('Labels.Select');
            if(countries) {
                countries.map(country => {
                    // countries
                    this.countriesLabels.push(country.RegionName);
                    this.countriesValues.push(country.ServiceName.toLowerCase().replace(' ', ''));
                });

                // US states
                const usData = countries.find((name) => name.ServiceName.toLowerCase().replace(' ', '') === 'unitedstates');
                const usStates = usData.Provinces;
                if(usStates.length) {
                    const statesUsRaw = [];
                    usStates.map(state => {
                        statesUsRaw.push(state.ProvinceValue);
                    });

                    statesUsRaw.sort().unshift(selectLabel);
                    this.stateUs = statesUsRaw;
                }

                // CAN provinces
                const canData = countries.find((name) => name.ServiceName.toLowerCase() === 'canada');
                const canProvinces = canData.Provinces;
                if(canProvinces.length) {
                    const provincesCaRaw = [];
                    canProvinces.map(state => {
                        provincesCaRaw.push(state.ProvinceValue);
                    });

                    provincesCaRaw.sort().unshift(selectLabel);
                    this.province = provincesCaRaw;
                }

                // MEX provinces
                const mexData = countries.find((name) => name.ServiceName.toLowerCase() === 'mexico');
                const mexStates = mexData.Provinces;
                mexStates.sort((a, b) => a.ProvinceName.localeCompare(b.ProvinceName));
                if(mexStates.length) {
                    const stateLabelMXRaw = [];
                    const stateValueMXRaw = [];
                    mexStates.map(state => {
                        stateLabelMXRaw.push(state.ProvinceValue);
                        stateValueMXRaw.push(state.ServiceName);
                    });

                    stateLabelMXRaw.unshift(selectLabel);
                    stateValueMXRaw.unshift(selectLabel);
                    this.statesMexLabels = stateLabelMXRaw;
                    this.statesMexValues = stateValueMXRaw;
                }
            }

            // Getting all values and pass to data
            const localizationProps = ['Address_1', 'Address_2', 'Address_3', 'City', 'Country', 'Suburb', 'PostalCode', 'Province', 'StateMx', 'StateUs', 'ZipCode'];
            const localProps = ['address1Prop', 'address2Prop', 'address3Prop', 'cityProp', 'countryProp', 'suburbProp', 'postalCodeProp', 'provinceProp', 'stateMxProp', 'stateUsProp', 'zipCodeProp'];
            let hasAnyPropArr = [];
            this.$nextTick(() => {
                localizationProps.map((prop, index) => {
                    // Logic for Localization
                    const localValue = [`${prop}Value`];
                    const localData = `${prop[0].toLowerCase()}${prop.slice(1)}Data` || `${prop.toLowerCase()}${prop.slice(1)}Data`;

                    if(this.getLocalizationProp(`Data.ShippingSection.${localValue}`)) {
                        const valueField = this.getLocalizationProp(`Data.ShippingSection.${localValue}`);

                        if(localValue[0] === 'CountryValue') {
                            this.chosenCountry = valueField.toLowerCase().replaceAll(' ', '');
                        }
                        this[localData] = valueField;
                    }

                    // Logic for Prop
                    if(localData === 'countryData') {
                        this.chosenCountry = this[localProps[index]].toLowerCase().replaceAll(' ', '');
                    }
                    this[localData] = this[localProps[index]];
                    hasAnyPropArr.push(this[localData]);
                });
                // hasProp
                (hasAnyPropArr.some(item => item !== '')) ? this.hasProp = true : this.hasProp = false;

                // Store results
                this.$nextTick(() => {
                    this.finalDataKeys();
                });
            });
        },
        methods: {
            callModal() {
                this.$modal.show({
                    id: 'o-shippAddressForm__modal',
                    width: '460px'
                });
                // Reset radio selected
                this.radioSelectedIndex = 1;
            },
            checkFinalAddress() {
                // All the values from Experian
                const chosenAddress = this.addressShipping;
                const address1 = chosenAddress.address1;
                const city = chosenAddress.city; // city
                const region = chosenAddress.state || chosenAddress.province; // state/province
                const postalCode = chosenAddress.zipCode || chosenAddress.postalCode;
                const suburb = chosenAddress.suburb;

                // Get results from the chosen country
                let resultsChosen = null;
                const resultsUsaCan = [address1, city, postalCode, region];
                const resultsMex = [address1, city, postalCode, region, suburb];

                // Get all required fields from the chosen country
                let fieldsChosen = null;
                // USA
                const fieldsUsa = ['address_1Data', 'cityData', 'zipCodeData', 'stateUsData'];
                // CAN
                const fieldsCan = ['address_1Data', 'cityData', 'postalCodeData', 'provinceData'];
                // MEX
                const fieldsMex = ['address_1Data', 'cityData', 'postalCodeData', 'stateMxData', 'suburbData'];

                switch (this.chosenCountry) {
                    case 'canada':
                        fieldsChosen = fieldsCan;
                        resultsChosen = resultsUsaCan;
                        break;
                    case 'mexico':
                        fieldsChosen = fieldsMex;
                        resultsChosen = resultsMex;
                        break;
                    case 'unitedstates':
                        fieldsChosen = fieldsUsa;
                        resultsChosen = resultsUsaCan;
                        break;
                    default:
                        fieldsChosen = fieldsUsa;
                }

                // Check each required field
                for (let i = 0; i < fieldsChosen.length; i++) {
                    const inputVal = this[fieldsChosen[i]];

                    // Any result as undefined - call modal
                    if(resultsChosen[i] === undefined) {
                        this.callModal();
                        return false;
                    }

                    if(inputVal.toLowerCase() !== resultsChosen[i].toLowerCase()) {
                        // Not in the system - call modal
                        this.callModal();
                        break;
                    } else {
                        if(i === (fieldsChosen.length - 1)) {
                            // All good - send the form
                            this.isFormValid = true;
                            this.emitResult();
                        }
                    }
                }
            },

            checkListFocus() {
                if(this.addressList.length) this.showAddressList = true;
            },

            closeModal() {
                this.$modal.hide({ id: 'o-shippAddressForm__modal' });
            },

            emitResult() {
                this.$emit('shippingAddressValid', this.addressEntered);
            },

            finalDataKeys() {
                let finalObj = {};
                if(this.chosenCountry === 'unitedstates') {
                    finalObj = {
                        country: 'United States',
                        address1: this.address_1Data,
                        address2: this.address_2Data,
                        city: this.cityData,
                        state: this.stateUsData.toUpperCase(),
                        zipCode: this.zipCodeData
                    };
                    this.addressShipping = finalObj;
                } else if(this.chosenCountry === 'canada') {
                    finalObj = {
                        country: 'Canada',
                        address1: this.address_1Data,
                        address2: this.address_2Data,
                        city: this.cityData,
                        province: this.provinceData.toUpperCase(),
                        postalCode: this.postalCodeData
                    };
                    this.addressShipping = finalObj;
                } else {
                    // Mexico
                    finalObj = {
                        country: 'Mexico',
                        address1: this.address_1Data,
                        address2: this.address_2Data,
                        address3: this.address_3Data,
                        city: this.cityData,
                        postalCode: this.postalCodeData,
                        state: this.stateMxData,
                        suburb: this.suburbData
                    };
                    this.addressShipping = finalObj;
                }
            },

            formatedAddress(address) {
                return address.indexOf(',') > -1 ? address.replace(',', '<br>') : address;
            },

            async getChoosedAddress() {
                if(this.hasAddressSuggestionList) {
                    const addressChoosed = this.radioSelectedIndex - 1;
                    if(addressChoosed >= 0) {
                        const response = await this.chosenAddress(this.addressList[addressChoosed]);
                        if(response) {
                            this.emitResult();
                            this.closeModal();
                        }
                    }
                }
            },

            populateFields(val) {
                this.closeSuggestionList();

                const objectValue = (val.result) ? val.result : val;

                // Fields
                let address1 = null;
                let locality = null;
                let region = null;
                let postalCode = null;
                let suburb = null;

                // Results variables
                if(val.result) {
                    // USA and CAN
                    address1 = objectValue.address.address_line_1;
                    locality = objectValue.address.locality; // city
                    region = objectValue.address.region; // state/province
                    postalCode = objectValue.address.postal_code;
                } else {
                    // MEX
                    let mexAddress = {};
                    objectValue.components.map(el => {
                        mexAddress[Object.keys(el)] = Object.values(el)[0];
                    });

                    address1 = `${(mexAddress.street1) ? mexAddress.street1 : ''} ${(mexAddress.streetNumber1 ? mexAddress.streetNumber1 : '')}`;
                    locality = mexAddress.locality1; // city
                    region = mexAddress.province1; // state/province
                    postalCode = mexAddress.postalCode1;
                    suburb = mexAddress.locality2;
                }

                // Populating fields - USA
                if(this.chosenCountry === 'unitedstates') {
                    const resultsUsa = [address1, locality, region, postalCode];
                    const fieldsUsa = ['address_1Data', 'cityData', 'stateUsData', 'zipCodeData'];
                    fieldsUsa.map((element, index) => {
                        this[element] = resultsUsa[index];
                    });
                }

                // Populating fields - Canada
                if(this.chosenCountry === 'canada') {
                    const resultsCanada = [address1, locality, region, postalCode];
                    const fieldsCanada = ['address_1Data', 'cityData', 'provinceData', 'postalCodeData'];
                    fieldsCanada.map((element, index) => {
                        this[element] = resultsCanada[index];
                    });
                }

                // Populating fields - Mexico
                if(this.chosenCountry === 'mexico') {
                    const resultsMexico = [address1, locality, region, postalCode, suburb];
                    const fieldsMexico = ['address_1Data', 'cityData', 'stateMxData', 'postalCodeData', 'suburbData'];

                    fieldsMexico.map((element, index) => {
                        let value = resultsMexico[index];
                        this[element] = value;

                        // State
                        if(fieldsMexico[index] === 'stateMxData') {
                            // Removing accents
                            value = resultsMexico[index].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                            const mxIndex = this.statesMexValues.findIndex(state => {
                                const stateLowerCase = state.toLowerCase();
                                return stateLowerCase === value;
                            });

                            if(mxIndex) this.stateMxData = this.statesMexLabels[mxIndex];
                            this.$refs.stateMx.selectedVal = this.statesMexValues[mxIndex] || this.getLocalizationProp('Labels.Select');
                        }
                    });
                }

                // Store results
                this.finalDataKeys();
            },

            selectedCountry(payload) {
                this.chosenCountry = payload.value.toLowerCase();
                if(!this.init) {
                    // Reset errors
                    this.$v.$reset();

                    // Reset address suggestion list
                    this.addressList = [];

                    // Reseting State/Province and zip/postal as asked in the US 12926
                    this.stateUsData = '';
                    this.provinceData = '';
                    this.stateMxData = '';
                    this.postalCodeData = '';
                    this.zipCodeData = '';
                }

                // Call API if there is data in address field and do not show the suggestion list
                if(this.address_1Data?.length > 3) {
                    this.getAddressApi(this.address_1Data, this.chosenCountry, this.init ?? false);
                    // Reset init
                    this.init = false;
                }
            },

            setInput(val) {
                const id = val.target?.id;
                const model = val.model;

                if(id) this[`${id}Data`] = val.target?.value;
                if(model && this.chosenCountry !== 'mexico') {
                    const chosenProp = model.replace('Data', '');
                    (val.value === this[chosenProp][0]) ? this[model] = '' : this[model] = val.value;
                }

                // Mexico state only
                if(this.chosenCountry === 'mexico' && val.model === 'stateMxData') {
                    const mxIndex = this.statesMexValues.findIndex(state => state === val.value);
                    this.stateMxData = (mxIndex) ? this.statesMexValues[mxIndex] : '';
                }

                // Address 1 - Experian integration
                if(id === 'address_1' && this.address_1Data.length > 3) {
                    // Close on Esc key or call the API
                    if(val.key === 'Escape') {
                        this.closeSuggestionList();
                        return;
                    }
                    if(val.key !== 'Tab') {
                        // Add some debounce
                        clearInterval(this.intervalId);
                        this.intervalId = setTimeout(() => {
                            this.getAddressApi(this.address_1Data, this.chosenCountry, false);
                        }, 300);
                    }
                } else if(this.address_1Data?.length > 3 && !this.suggestionPick && (val?.model === 'stateUsData' || val?.model === 'provinceData' || val?.model === 'stateMxData')) {
                    // Adding the State to refine the match in the search
                    if(val?.value) {
                        // Add some debounce
                        clearInterval(this.intervalId);
                        this.intervalId = setTimeout(() => {
                            // getAddressApi(value, closeSuggestion, not populate fields)
                            this.getAddressApi(`${this.address_1Data}, ${val.value}`, this.chosenCountry, true, true);
                        }, 300);
                    }
                } else {
                    this.closeSuggestionList();
                }
            },

            submit() {
                this.$v.$touch();

                if(!this.$v.$invalid) {
                    // Create final data
                    (this.isFormValid) ? this.emitResult() : this.checkFinalAddress();
                }
            }
        }
    };
</script>

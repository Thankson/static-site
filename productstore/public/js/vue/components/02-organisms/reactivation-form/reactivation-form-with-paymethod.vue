<template>
    <!-- Reactivation form and modal with paymethod currently only for KR -->
    <div class="o-reactivationForm">
        <h1 class="o-reactivationForm__title">
            {{ getLocalizationProp('Title', 'Reactivate Your Account') }}
        </h1>

        <p class="o-reactivationForm__text">
            {{ getLocalizationProp('Text', 'Enjoy all the benefits of a Melaleuca Preferred Member.') }}
        </p>

        <form class="o-reactivationForm__form" method="POST">
            <h2 class="o-reactivationForm__title -section">
                {{ getLocalizationProp('SectionTitle', 'Account Information') }}
            </h2>

            <div class="o-reactivationForm__col">
                <p class="o-reactivationForm__label">
                    {{ getLocalizationProp('Labels.name', 'Name') }}
                </p>

                <p class="o-reactivationForm__name">{{ userInfo.Name }}</p>

                <div class="o-reactivationForm__address">
                    <h3 class="o-reactivationForm__label">
                        {{ getLocalizationProp('Labels.address', 'Address') }}
                    </h3>

                    <template v-if="userInfo.Address">
                        <div
                            v-if="userInfo && userInfo.Address && userInfo.Address.FormattedAddress"
                            class="o-reactivationForm__addressLine"
                            v-html="userInfo.Address.FormattedAddress">
                        </div>
                        <div v-else class="o-reactivationForm__addressLine">
                            <p>{{ userInfo.Address.AddressLine1 }}</p>
                            <p v-if="userInfo.Address.AddressLine2">{{ userInfo.Address.AddressLine2 }}</p>
                            <p>{{ userInfo.Address.City }}, {{ userInfo.Address.Province }} {{ userInfo.Address.PostalCode }}</p>
                        </div>
                    </template>

                    <a
                        v-if="localization.Address"
                        class="o-reactivationForm__link"
                        :href="getLocalizationProp('Address.CTALink', '#')"
                        @click="gtmTrackAction({id: 204}, $event)">

                        <img
                            v-if="getLocalizationProp('Address.IconUrl')"
                            class="o-reactivationForm__icon"
                            :src="getLocalizationProp('Address.IconUrl')"
                            :alt="getLocalizationProp('Address.IconAlt')"
                            aria-hidden="true"
                        />

                        <span>{{ getLocalizationProp('Address.CTAText') }}</span>
                    </a>
                </div>
            </div>

            <div class="o-reactivationForm__col">
                <UpdateEmail
                    v-if="userInfo.Email"
                    :email="userInfo.Email"
                    :labels="emailLabels"
                    @error="(hasError) => emailError = hasError"
                />

                <UpdatePhoneNumbers
                    v-if="userInfo"
                    :add-phone-available="false"
                    :show-default="false"
                    :country="countryCode"
                    :phones="userInfo.Phone"
                    :labels="phoneLabels"
                    :phones-type="getLocalizationProp('Types', [])"
                    :phones-type-values="getLocalizationProp('TypesValues', [])"
                    :is-cn="false"
                    select-mods="mb-30 relative w-full lg:mb-0 lg:w-1_4"
                    input-mods="relative w-full lg:w-3_4 lg:pl-8"
                    @error="(hasError) => phoneError = hasError"
                />
            </div>

            <div>
                <fieldset
                    v-if="!hidePayMethod"
                    class="mb-25">
                    <legend v-if="showLegend" class="m-formField__label">
                        {{ getLocalizationProp('PaymentMethodType', 'Payment Method Type') }}
                    </legend>
                    <div class="o-reactivationModal__row">
                        <div v-if="showCardOnfile" class="reactivationModal__radio">
                            <input
                                id="defaultcreditcard"
                                v-model="paymentMethodType"
                                type="radio"
                                name="paymentMethodType"
                                class="a-input -radio"
                                :value="creditCardValue">
                            <label for="defaultcreditcard" class="m-formField__label -radio o-commPrefs__label">
                                <span v-if="defaultCreditCard.CreditCardDescription" class="tracking-tight">{{ defaultCreditCard.CreditCardDescription }} </span>
                                <span v-else-if="defaultCreditCard.AccountNickName" class="tracking-tight">{{ defaultCreditCard.AccountNickName }}</span>
                                <span v-if="defaultCreditCard.LastFourDigitsOfAccount && defaultCreditCard.AccountNickName" v-html="defaultCreditCard.MaskingCondensed"></span>&nbsp;
                                <span v-if="!defaultCreditCard.AccountNickName" v-html="defaultCreditCard.Masking"></span>
                                <span class="tracking-tight">{{ defaultCreditCard.LastFourDigitsOfAccount }}</span>
                            </label>
                        </div>
                        <div v-else class="reactivationModal__radio">
                            <input
                                id="creditcard"
                                v-model="paymentMethodType"
                                type="radio"
                                name="paymentMethodType"
                                class="a-input -radio"
                                :value="creditCardValue"
                            >
                            <label for="creditcard" class="m-formField__label -radio o-commPrefs__label">{{ getLocalizationProp('DebitCreditCard') }}</label>
                        </div>
                        <div v-if="showVirtualOption" class="reactivationModal__radio">
                            <input
                                id="virtualaccount"
                                v-model="paymentMethodType"
                                type="radio"
                                name="paymentMethodType"
                                class="a-input -radio"
                                :value="virtualAccountValue"
                            >
                            <label for="virtualaccount" class="m-formField__label -radio o-commPrefs__label">{{ virtualAccountLabel }}</label>
                        </div>
                    </div>
                </fieldset>
                <div
                    v-if="!hidePayMethod && !defaultCreditCard && !hideCcFields" class="mb-25">

                    <label
                        class="m-formField__label"
                        :for="ccNameId">

                        {{ getLocalizationProp('CardholderName', 'Cardholder Name') }}
                    </label>

                    <v-select
                        :id="ccNameId"
                        :options="ccNames.join(',')"
                        :values="ccNames"
                        :initial="ccNames.length && ccNames[0]"
                        arrow-tailwind-color="gray-120"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        @change="({ value }) => ccName = value"
                    />
                </div>

                <template v-if="!hideCcFields">
                    <div class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="ccNumberId"
                            v-html="getLocalizationProp('CardNumber', 'Card Number')"
                        />

                        <input-card-number
                            :id="ccNumberId"
                            v-model="ccNumber"
                            auto-complete="off"
                            name="CardNumber"
                            :tailwind-mods="$v.$dirty && $v.ccNumber.$invalid ? '-isInvalid' : ''"
                            value=""
                            :card-options="cardOptions"
                            :max-length="cardMaxLength"
                            :min-length="cardMinLength"
                            :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                            @card-number-error="onCardNumberError"
                        />
                    </div>

                    <div class="flex mb-25">
                        <fieldset class="flex md:w-5_12">
                            <legend class="m-formField__label">
                                {{ getLocalizationProp('Expiration', 'Expiration') }}
                            </legend>

                            <v-select
                                :options="selectOptionsLabels(expirationMonths)"
                                :values="selectOptionsValues(expirationMonths)"
                                :initial="null"
                                :is-disabled="true"
                                :aria-label="getLocalizationProp('Month', 'Month')"
                                :class="{ '-isInvalid': $v.$dirty && $v.expirationMonth.$invalid}"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                :select-mod="`-sm-md -rounded -padding-md -bg-transparent w-full mr-5 ${$v.$dirty && $v.expirationMonth.$invalid? '-error' : ''}`"
                                @change="({ value }) => expirationMonth = value"
                            />

                            <v-select
                                :options="selectOptionsLabels(expirationYears)"
                                :values="selectOptionsValues(expirationYears)"
                                :initial="null"
                                :is-disabled="true"
                                :aria-label="getLocalizationProp('Year', 'Year')"
                                :class="{ '-isInvalid': $v.$dirty && $v.expirationYear.$invalid}"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                :select-mod="`-sm-md -rounded -padding-md -bg-transparent w-full ml-5 ${$v.$dirty && $v.expirationYear.$invalid? '-error' : ''}`"
                                @change="({ value }) => expirationYear = value"
                            />
                        </fieldset>

                        <div v-if="isJP" class="md:w-1_6 md:ml-10">
                            <label
                                class="m-formField__label"
                                :for="ccCvvId"
                                v-html="getLocalizationProp('CvvLabel', 'CVV')"
                            />

                            <input-basic
                                :id="ccCvvId"
                                ref="ccCvv"
                                v-model="ccCvv"
                                auto-complete="off"
                                name="CVV"
                                :max-length="cvvMaxLength"
                                :min-length="cvvMinLength"
                                :tailwind-mods="$v.ccCvv && $v.ccCvv.$error ? '-isInvalid' : null"
                            />
                        </div>
                    </div>
                </template>

                <CheckboxGroup
                    v-if="!isJP"
                    class="mb-25"
                    category-label-mods="text-sm font-medium mb-5"
                    category-mods="o-reactivationModal__checkbox"
                    category-wrapper-mods="ml-40"
                    :checkbox-categories="childCheckboxes"
                    checkbox-error-mods="-error"
                    checkbox-mods="-reactivation"
                    checkbox-wrapper-mods="mb-15"
                    :legend-label="getLocalizationProp('AgreementTitle', 'Customer Agreements')"
                    legend-mods="o-reactivationModal__heading -consent"
                    :parent-label="getLocalizationProp('ConsentMessage', '')"
                    parent-inner-mods="o-reactivationModal__description -consent"
                    parent-mods="-reactivation mr-0 mb-15"
                    :show-errors="$v.$dirty && $v.isConsent && $v.isConsent.$invalid"
                    @change="onCheckboxGroupChange"
                />

                <CheckboxList
                    v-if="isJP"
                    :checkboxes="checkboxes"
                    checkbox-error-mods="-error"
                    checkbox-mods="-top text-sm font-normal mb-5"
                    :show-errors="$v.$dirty && $v.isConsent && $v.isConsent.$invalid"
                    @change="onCheckboxListChange"
                />

                <v-button
                    class="o-reactivationForm__button -cancelFull"
                    type="button"
                    @click="[ cancel(), gtmTrackAction({ id: 407 }, $event)]">

                    {{ getLocalizationProp('CancelText', 'Not now') }}
                </v-button>

                <v-button
                    type="button"
                    class="o-reactivationForm__button  -reactivation md:ml-30"
                    :class="hasAccountError ? '-disabled' : ''"
                    :aria-disabled="hasAccountError || null"
                    v-on="!hasAccountError ? {
                        click: ($event) => {
                            submit();
                            gtmTrackAction({id: 407}, $event);
                        }
                    } : null">

                    {{ getLocalizationProp('CTAText', 'Reactivate') }}
                </v-button>

                <ul
                    v-if="($v.$dirty && $v.$invalid) || error"
                    class="e-formError__list mt-15"
                    role="alert"
                    aria-live="assertive">

                    <li
                        v-if="error" class="e-formError__item mt-0"
                        v-html="error">

                    </li>

                    <li
                        v-if="$v.ccNumber && $v.ccNumber.$invalid && (!hideCcFields && !hidePayMethod)"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('CardNumberError', 'Card Number field is required') }}
                    </li>

                    <li
                        v-if="$v.expirationMonth && $v.expirationMonth.$invalid && (!hideCcFields && !hidePayMethod)"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.ExpirationMonthError', 'Expiration Month field is required') }}
                    </li>

                    <li
                        v-if="$v.expirationYear && $v.expirationYear.$invalid && (!hideCcFields && !hidePayMethod)"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('ExpirationYearError', 'Expiration Year field is required') }}
                    </li>

                    <li
                        v-if="$v.ccCvv && $v.ccCvv.$invalid"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('CvvRequired', 'CVV field is required') }}
                    </li>

                    <li
                        v-if="$v.isConsent && $v.isConsent.$invalid"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.error.requiredCheckbox', 'You need to agree to our terms of service before reactivating your account') }}
                    </li>
                </ul>

                <a-loading-spinner :visible="loading" size="sm" />
            </div>
        </form>
    </div>
</template>

<script>
    import api from '@api/routes/customeraccount/reactivate';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import UpdateEmail from '../../01-molecules/my-account/update-email.vue';
    import UpdatePhoneNumbers from '../../01-molecules/my-account/update-phone-numbers.vue';
    import reactivationFormWithPaymethodMixin from '../../../mixins/reactivation-form-with-paymethod';

    export default {
        name: 'OReactivationFormWithPaymethod',
        components: {
            UpdateEmail,
            UpdatePhoneNumbers
        },
        mixins: [ reactivationFormWithPaymethodMixin ],
        data() {
            return {
                emailError: false,
                phoneError: false,
                userInfo: {},

                // todo: move to another component
                checkboxValues: {}
            };
        },
        computed: {
            cardMaxLength() {
                return this.getLocalizationProp('CardNumberMaxValue', 16);
            },
            cardMinLength() {
                return this.getLocalizationProp('CardNumberMinValue', 1);
            },
            ccNames() {
                return this.getLocalizationProp('CardholderNameValues', []);
            },
            checkboxes() {
                const checkboxes = this.getLocalizationProp('Checkboxes', []);
                return !this.isJP ? checkboxes : checkboxes?.map(this.serializeCheckbox);
            },
            country() {
                return this.getLocalizationProp('Country', this.$env.Country);
            },
            countryCode() {
                return getCountryCode(this.country);
            },
            defaultCreditCard() {
                return this.getLocalizationProp('DefaultCreditCard');
            },
            emailLabels() {
                return {
                    ...this.getLocalizationProp('Labels.email', {}),
                    phoneUserName: {
                        alertModal: {
                            title: this.getLocalizationProp('PhoneUsername.EmailModal.Title'),
                            description: this.getLocalizationProp('PhoneUsername.EmailModal.Description'),
                            cancel: this.getLocalizationProp('Labels.email.cancel', 'Cancel'),
                            edit: this.getLocalizationProp('PhoneUsername.EmailModal.EditPhoneNumber')
                        },
                        warning: this.getLocalizationProp('PhoneUsername.EditMobileMessage'),
                        agreement: {
                            checkboxLabel: this.getLocalizationProp('PhoneUsername.EmailAgreement.CheckboxLabel'),
                            title: this.getLocalizationProp('PhoneUsername.EmailAgreement.Title'),
                            message: this.getLocalizationProp('PhoneUsername.EmailAgreement.AgreementMessagingEmail')
                        }
                    },
                    termsModal: {
                        title: this.getLocalizationProp('TermsTitle', ''),
                        rte: this.getLocalizationProp('TermsDescription', '')
                    },
                    privacyModal: {
                        title: this.getLocalizationProp('PrivacyTitle', ''),
                        rte: this.getLocalizationProp('PrivacyDescription', '')
                    }
                };
            },
            hasAccountError() {
                return this.emailError || this.phoneError;
            },
            monthLabel() {
                return this.getLocalizationProp('Month', 'Month');
            },
            phoneLabels() {
                return {
                    ...this.getLocalizationProp('Labels.phone', {}),
                    phoneUserName: {
                        alertModal: {
                            title: this.getLocalizationProp('PhoneUsername.PhoneModal.Title'),
                            description: this.getLocalizationProp('PhoneUsername.PhoneModal.Description'),
                            cancel: this.getLocalizationProp('Labels.phone.cancel'),
                            edit: this.getLocalizationProp('PhoneUsername.PhoneModal.EditPhoneNumber')
                        },
                        warning: this.getLocalizationProp('PhoneUsername.EditMobileMessage'),
                        agreement: {
                            checkboxLabel: this.getLocalizationProp('PhoneUsername.PhoneAgreement.CheckboxLabel'),
                            title: this.getLocalizationProp('PhoneUsername.PhoneAgreement.Title'),
                            message: this.getLocalizationProp('PhoneUsername.PhoneAgreement.AgreementMessagingPhone')
                        }
                    }
                };
            },
            // If RemoveValidationFromCC is true, the user was enrolled prior to the set enrollment date. If false, they enrolled on or after the enrollment date.
            removeValidationFromCCNumber() {
                return this.getLocalizationProp('RemoveValidationFromCC', false);
            },
            showImprovedCTACheckout() {
                return this.getLocalizationProp('ShowImprovedCTACheckout', false);
            },
            yearLabel() {
                return this.getLocalizationProp('Year', 'Year');
            }
        },
        created() {
            this.getUserInfo();
        },
        methods: {
            cancel() {
                history.go(-1);
                return false;
            },
            async getUserInfo() {
                const response = await api.get();
                if(response.success) {
                    this.userInfo = response.data;
                } else {
                    console.error(response.error || `An error occurred at "${api.route}"`);
                }
            }
        }
    };
</script>

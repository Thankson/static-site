<template>
    <form class="o-reactivationForm" :class="{'-isCnReactivationForm' : isCn}">
        <h3 class="o-reactivationForm__title">{{ data.Title }}</h3>
        <div v-if="$slots['ad']" class="pb-40 pt-20">
            <slot name="ad"></slot>
        </div>
        <p v-else class="o-reactivationForm__text">{{ data.Text }}</p>
        <div class="o-reactivationForm__form">
            <h4 class="o-reactivationForm__title -section">{{ data.SectionTitle }}</h4>
            <div class="o-reactivationForm__col">
                <p v-if="data.Labels" class="o-reactivationForm__label">
                    {{ data.Labels.name }}
                </p>
                <p class="o-reactivationForm__name">{{ userInfo.Name }}</p>
                <div class="o-reactivationForm__address">
                    <h4 v-if="data.Labels" class="o-reactivationForm__label">{{ data.Labels.address }}</h4>
                    <template v-if="userInfo.Address">
                        <div
                            v-if="userInfo && userInfo.Address && userInfo.Address.FormattedAddress"
                            class="o-reactivationForm__addressLine"
                            v-html="userInfo.Address.FormattedAddress">
                        </div>
                        <div v-else class="o-reactivationForm__addressLine">
                            <p>{{ userInfo.Address.AddressLine1 }}</p>
                            <p v-if="userInfo.Address.AddressLine2">{{ userInfo.Address.AddressLine2 }}</p>
                            <p>{{ userInfo.Address.City }}, {{ province }} {{ userInfo.Address.PostalCode }}</p>
                        </div>
                    </template>
                    <a v-if="ctaLink" class="o-reactivationForm__link" :href="ctaLink" @click="gtmTrackAction({id: 204}, $event)">
                        <img
                            class="o-reactivationForm__icon"
                            :src="data.Address.IconUrl"
                            :alt="data.Address.IconAlt"
                            aria-hidden="true"
                        />
                        <span>{{ data.Address.CTAText }}</span>
                    </a>
                </div>
            </div>

            <div class="o-reactivationForm__col">
                <UpdateEmail
                    v-if="userInfo.Email && data.Labels && !isCn"
                    :email="userInfo.Email"
                    :labels="updateEmailLabels"
                    @error="updateInputError('email', $event)"
                />

                <UpdatePhoneNumbers
                    v-if="userInfo && data.Labels"
                    :add-phone-available="false"
                    :show-default="false"
                    :country="isCn ? 'CN' : getCountryCode($env.Country) || 'US'"
                    :phones="userInfo.Phone"
                    :labels="data.Labels.phone"
                    :phones-type="data.Types || []"
                    :phones-type-values="data.TypesValues || []"
                    :is-cn="isCn"
                    select-mods="mb-30 relative w-full lg:mb-0 lg:w-1_4"
                    :input-mods="isCn ? 'relative w-full text-gray-120' : 'relative w-full lg:w-3_4 lg:pl-8'"
                    @error="updateInputError('phone', $event)"
                />

                <UpdateEmail
                    v-if="userInfo.Email && data.Labels && isCn"
                    :email="userInfo.Email"
                    :is-cn="isCn"
                    :input-mods="isCn ? 'text-gray-120 relative w-full' : 'relative w-full'"
                    :labels="updateEmailLabels"
                    @error="updateInputError('email', $event)"
                />
            </div>

            <div
                v-if="!hidePayMethod"
                class="o-reactivationForm__col -payment">

                <fieldset class="mb-25">
                    <legend class="m-formField__label">
                        {{ data.Labels && data.Labels.PaymentMethodType }}
                    </legend>

                    <div class="o-reactivationModal__radio">
                        <m-radio
                            v-model="paymentMethodType"
                            name="PaymentMethodType"
                            :label="data.Labels && data.Labels.DebitCreditCard"
                            input-value="Credit/Debit Card"
                            value="Credit/Debit Card" />

                        <m-radio
                            v-if="showSepaDirectDebit"
                            v-model="paymentMethodType"
                            name="PaymentMethodType"
                            :label="data.Labels && data.Labels.SepaDirectDebit"
                            input-value="SepaDirectDebit"
                            value="SepaDirectDebit" />
                    </div>

                </fieldset>

                <!-- #region Credit/Debit Form -->
                <template v-if="isReactivateWithCreditDebit">
                    <div v-if="!hideCcForm" class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="ccName.Id">

                            {{ data.Labels && data.Labels.CardholderName }}
                        </label>

                        <!-- <v-input
                        v-if="!isJp"
                        :id="ccNameId"
                        v-model="ccName"
                        auto-complete="off"
                        arrow-tailwind-color="gray-120"
                        arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                        select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                        :tailwind-mods="$v.$dirty && $v.ccNumber.$invalid ? '-isInvalid' : ''"
                        class="md:text-sm"
                        @input="updateModel('ccName')"
                        @blur="handleBlur('ccName')">
                    </v-input> -->

                        <input-basic
                            v-if="!isJP"
                            :id="ccName.Id"
                            ref="ccName"
                            v-model="ccNameValue"
                            auto-complete="off"
                            :name="ccName.Name"
                            :max-length="ccName.MaxLength"
                            :min-length="ccName.MinLength"
                            :placeholder="cardHolderNamePlaceholder"
                            :tailwind-mods="$v.ccNameValue.$error ? '-isInvalid' : null"
                            :aria-describedby="$v.ccNameValue.$error ? 'cardholdername-error' : false"
                            :value="getInitialValue(ccName, 'CardHolderName', ccNameValue)"
                            class="to-md:text-sm"
                            @input="updateModel('ccNameValue', enableNameValidateFlag)"
                            @blur="handleBlur('ccNameValue')">
                        </input-basic>

                        <v-select
                            v-else
                            :id="ccName.id"
                            ref="ccName"
                            vmodel="ccNameValue"
                            :options="selectOptionsLabels(cardHolderNameOptions)"
                            :values="selectOptionsValues(cardHolderNameOptions)"
                            :initial="getInitialValue(ccName, 'CardHolderName', ccNameValue) || selectOptionsValues(cardHolderNameOptions)[0] || ''"
                            :name="ccName.Name"
                            :aria-label="getLabels('Labels.Card.CardholderName', ccName.Label)"
                            :select-mod="ccName.SelectMod"
                            select-element-mod="py-10 px-15"
                            :arrow-direction="ccName.Arrow.Direction || null"
                            :arrow-size="ccName.Arrow.Size || null"
                            :arrow-tailwind-color="ccName.Arrow.TailwindColor || null"
                            :arrow-other-mods="ccName.Arrow.OtherMods || null"
                            @change="updateModel"
                            @blur="handleBlur('ccNameValue')"
                        />
                    </div>

                    <div v-if="!hideCcForm" class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="ccNumberId"
                            v-html="data.Labels && data.Labels.CardNumber" />

                        <input-card-number
                            :id="ccNumberId"
                            v-model="ccNumber"
                            auto-complete="off"
                            name="ccNumber"
                            :tailwind-mods="$v.$dirty && $v.ccNumber.$invalid ? '-isInvalid' : ''"
                            value=""
                            :card-options="cardOptions"
                            :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                            :max-length="cardMaxLength"
                            :min-length="cardMinLength"
                            @card-number-error="onCardNumberError" />
                    </div>

                    <!-- Expiration -->
                    <div v-if="!hideCcForm" class="mb-25 flex">
                        <fieldset class="flex md:w-5_12">
                            <legend class="m-formField__label">
                                {{ data.Labels && data.Labels.Expiration }}
                            </legend>

                            <v-select
                                :options="selectOptionsLabels(expirationMonths)"
                                :values="selectOptionsValues(expirationMonths)"
                                :initial="null"
                                :is-disabled="true"
                                :aria-label="data.Labels && data.Labels.Month"
                                :class="{ '-isInvalid': $v.$dirty && $v.expirationMonth.$invalid }"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                :select-mod="`-sm-md -rounded -padding-md -bg-transparent w-full mr-5 ${$v.$dirty && $v.expirationMonth.$invalid ? '-error' : ''}`"
                                @change="({ value }) => expirationMonth = value" />

                            <v-select
                                :options="selectOptionsLabels(expirationYears)"
                                :values="selectOptionsValues(expirationYears)"
                                :initial="null"
                                :is-disabled="true"
                                :aria-label="data.Labels && data.Labels.Year"
                                :class="{ '-isInvalid': $v.$dirty && $v.expirationYear.$invalid }"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                :select-mod="`-sm-md -rounded -padding-md -bg-transparent w-full ml-5 ${$v.$dirty && $v.expirationYear.$invalid ? '-error' : ''}`"
                                @change="({ value }) => expirationYear = value" />
                        </fieldset>

                        <!-- CVV Field -->
                        <div v-if="useCvv && !hideCcForm" class="m-formField -text w-100 pt-5 lg:w-1_4 pl-20 lg:pr-20 lg:pl-20 lg:pt-0">
                            <label
                                class="m-formField__label"
                                :for="cvvId"
                                v-html="data.Labels && data.Labels.CvvLabel">
                            </label>
                            <input-basic
                                :id="cvvId"
                                ref="cvv"
                                v-model="cvvValue"
                                auto-complete="off"
                                :max-length="cvv.MaxLength"
                                :min-length="cvv.MinLength"
                                model-name="cvvValue"
                                :placeholder="cvv.Placeholder"
                                :tailwind-mods="$v.$dirty && $v.cvvValue.$invalid ? '-isInvalid' : ''"
                                :value="cvvValue"
                                @input="updateModel('cvvValue')"
                                @blur="handleBlur('cvvValue')"
                                @keydown="handleInteger">
                            </input-basic>
                        </div>
                    </div>
                </template>

                <!-- #region Directdebit SEPA Form-->
                <template v-if="isReactivateWithSepa">
                    <div class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="ccName.Id">
                            {{ data.Labels && data.Labels.CardholderName }}
                        </label>
                        <input-basic
                            :id="ccName.Id"
                            ref="ccName"
                            v-model="ccNameValue"
                            auto-complete="off"
                            :name="ccName.Name"
                            :max-length="ccName.MaxLength"
                            :min-length="ccName.MinLength"
                            :placeholder="ccName.Placeholder"
                            :tailwind-mods="$v.ccNameValue.$error ? '-isInvalid' : null"
                            :aria-describedby="$v.ccNameValue.$error ? 'cardholdername-error' : false"
                            :value="getInitialValue(ccName, 'CardHolderName', ccNameValue)"
                            class="to-md:text-sm"
                            @input="updateModel('ccNameValue')"
                            @blur="handleBlur('ccNameValue')">
                        </input-basic>
                    </div>
                    <!-- SWIFT/BIC Field -->
                    <div class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="routingNumber.Id"
                            v-html="data.Labels && data.Labels.RoutingNumber">
                        </label>
                        <input-basic
                            :id="routingNumber.Id"
                            ref="routingNumber"
                            v-model="routingNumberValue"
                            auto-complete="off"
                            :max-length="routingNumber.MaxLength"
                            :min-length="routingNumber.MinLength"
                            model-name="routingNumberValue"
                            :placeholder="routingNumber.Placeholder"
                            :tailwind-mods="$v.$dirty && $v.routingNumberValue.$invalid ? '-isInvalid' : null"
                            :value="routingNumberValue"
                            @input="updateModel('routingNumberValue')"
                            @blur="handleBlur('routingNumberValue')"
                        >
                        </input-basic>
                    </div>
                    <!-- Account number Field -->
                    <div class="mb-25">
                        <label
                            class="m-formField__label"
                            :for="accountNumber.Id"
                            v-html="data.Labels && data.Labels.AccountNumber">
                        </label>
                        <input-basic
                            :id="accountNumber.Id"
                            ref="accountNumber"
                            v-model="accountNumberValue"
                            auto-complete="off"
                            :max-length="accountNumber.MaxLength"
                            :min-length="accountNumber.MinLength"
                            model-name="accountNumberValue"
                            :placeholder="accountNumber.Placeholder"
                            :tailwind-mods="$v.$dirty && $v.accountNumberValue.$invalid ? '-isInvalid' : null"
                            :value="accountNumberValue"
                            @input="updateModel('accountNumberValue')"
                            @blur="handleBlur('accountNumberValue')"
                        >
                        </input-basic>
                    </div>
                </template>
                <!-- #endregion Directdebit SEPA Form-->
            </div>

            <div class="o-reactivationForm__checkboxes">
                <div
                    v-for="(checkbox, index) in checkboxes"
                    :key="index"
                    class="o-reactivationForm__checkbox">

                    <template v-if="showAcknowledgementOnForm(checkbox)">
                        <m-checkbox
                            :class="['-alignTop', (checkbox.Required && error && !checkbox.Checked ? '-error' : '')]"
                            :label="checkbox.Text"
                            :label-mods="checkbox.Required && error && !checkbox.Checked ? '-error font-normal' : 'font-normal'"
                            :aria-required="checkbox.Required"
                            :aria-invalid="checkbox.Required && error && !checkbox.Checked"
                            :value="checkbox.Checked"
                            @input="updateChecked(checkbox), gtmTrackAction({id: 205, text: gtmText[index]}, $event)"
                        />

                        <em
                            v-if="isCn && error && !checkbox.Checked"
                            class="o-reactivationForm__error"
                            role="alert">

                            {{ error }}
                        </em>
                    </template>
                </div>
            </div>
            <p v-if="data.ShowBuo" class="o-reactivationForm__buo" v-html="data.Labels.BuoMessage">
            </p>

            <v-button
                :disabled="hasInputError"
                class="o-reactivationForm__button -reactivation md:ml-30"
                :class="{'-disabled' : hasInputError , 'text-xs md:text-sm' : isCn}"
                :aria-label="data.CTAAriaLabel"
                :cta="data.CTAText"
                @click="reactivateAccount(), gtmTrackAction({id: 204}, $event)"
            />

            <v-button
                class="o-reactivationForm__button -cancelFull"
                :class="{'text-xs md:text-sm' : isCn}"
                :aria-label="data.CancelAriaLabel"
                :cta="data.CancelText"
                @click="cancelReactivation(), gtmTrackAction({id: 204}, $event)"
            />

            <!-- Errors specific to each field -->
            <ul
                v-if="($v.$dirty && $v.$invalid) || error"
                class="o-reactivationForm__error mt-15"
                role="alert"
                aria-live="assertive">

                <li
                    v-if="!isCn && error"
                    class="e-formError__item mt-0 block"
                    v-html="error">
                </li>

                <li
                    v-if="$v.ccName.$invalid || $v.ccNameValue.$invalid"
                    class="e-formError__item mt-0">
                    <template v-if="!$v.ccNameValue.isValidEnNameValue">
                        {{ data.Labels && data.Labels.CardholderNameInvalid }}
                    </template>
                    <template v-else>
                        {{ data.Labels && data.Labels.CardholderNameRequired }}
                    </template>
                </li>

                <li
                    v-if="$v.ccNumber.$invalid"
                    class="e-formError__item mt-0">

                    {{ data.Labels && data.Labels.CardNumberError }}
                </li>

                <li
                    v-if="$v.expirationMonth.$invalid"
                    class="e-formError__item mt-0">

                    {{ data.Labels && data.Labels.ExpirationMonthError }}
                </li>

                <li
                    v-if="$v.expirationYear.$invalid"
                    class="e-formError__item mt-0">

                    {{ data.Labels && data.Labels.ExpirationYearError }}
                </li>

                <li
                    v-if="$v.cvvValue.$invalid"
                    class="e-formError__item mt-0">
                    {{ data.Labels && data.Labels.CvvRequired }}
                </li>

                <li
                    v-if="$v.routingNumberValue.$invalid"
                    class="e-formError__item mt-0">
                    {{ data.Labels && data.Labels.RoutingNumberRequired }}
                </li>

                <li
                    v-if="$v.accountNumberValue.$invalid"
                    class="e-formError__item mt-0">
                    {{ data.Labels && data.Labels.AccountNumberRequired }}
                </li>
            </ul>

            <div class="o-reactivationForm__loading">
                <a-loading-spinner :visible="loading" size="sm" />
            </div>
        </div>
    </form>
</template>

<script>
    import UpdateEmail from '../../01-molecules/my-account/update-email.vue';
    import UpdatePhoneNumbers from '../../01-molecules/my-account/update-phone-numbers.vue';
    import api from '@api/routes/customeraccount/reactivate';
    import cardNumber from '@common/source/js/vue/utils/card-number';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import paymentFormMixin from '../../../mixins/payment-form';
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required, requiredIf, minLength, maxLength } from 'vuelidate/lib/validators';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import { mapGetters, mapActions } from 'vuex';
    import regexParser from 'regex-parser';

    export default {
        name: 'MReactivationForm',
        components: {
            UpdateEmail,
            UpdatePhoneNumbers
        },
        mixins: [ localizationMixin, paymentFormMixin, safeIdMixin, validationMixin ],
        safeIds: [
            'ccNameId',
            'ccNumberId',
            'cvvId'
        ],
        validations() {
            const validations = {};
            validations.accountNumberValue = {};
            validations.ccName = {};
            validations.ccNameValue = {};
            validations.ccNumber = {};
            validations.cvvValue = {};
            validations.expirationMonth = {};
            validations.expirationYear = {};
            validations.routingNumberValue = {};

            // Set validations for forms
            if(!this.hidePayMethod && !this.hideCcForm) {
                validations.ccName = {
                    required
                };
                validations.ccNameValue = {
                    required,
                    minLength: minLength(this.ccName.MinLength),
                    maxLength: maxLength(this.ccName.MaxLength),
                    ...(this.enableNameValidateFlag && {
                        isValidEnNameValue: value => {
                            if(!value || !this.enableNameValidateFlag) return true;
                            const patternStr = regexParser(this.cardHolderNamePattern);
                            return patternStr.test(value);
                        }
                    })
                };
                // #region -- Validations specific to SEPA form
                if(this.isReactivateWithSepa) {
                    validations.accountNumberValue = {
                        required,
                        minLength: minLength(this.accountNumber.MinLength),
                        maxLength: maxLength(this.accountNumber.MaxLength)
                    };

                    validations.routingNumberValue = {
                        required,
                        minLength: minLength(this.routingNumber.MinLength),
                        maxLength: maxLength(this.routingNumber.MaxLength)
                    };
                }
                // #endregion -- Validations specific to SEPA form

                // #region -- Validations specific to Credit/Debit Form
                if(this.isReactivateWithCreditDebit) {
                    validations.ccNumber = {
                        required,
                        ...(!this.showImprovedCTACheckout && {
                            maxLength: maxLength(this.cardMaxLength),
                            minLength: minLength(this.cardMinLength)
                        }),
                        // Trim whitespace before checking length
                        ...(this.showImprovedCTACheckout && {
                            maxLength: value => {
                                return value.replace(/\s/g, '').length >= this.cardMaxLength;
                            },
                            minLength: value => {
                                return value.replace(/\s/g, '').length >= this.cardMinLength;
                            }
                        })

                    };
                    validations.cvvValue = {
                        required: requiredIf(() => this.useCvv)
                    };
                    validations.expirationMonth = {
                        required
                    };
                    validations.expirationYear = {
                        required
                    };
                }
            }
            // #endregion -- Validations On Credit/Debit Form

            return validations;
        },
        props: {
            ccName: {
                type: Object,
                default: function() {
                    return {
                        Id: 'cardholder',
                        Name: 'cardholder',
                        MinLength: 1,
                        MaxLength: 100,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm-md w-full',
                        Label: 'CARDHOLDER NAME',
                        Arrow: {
                            Direction: '-down',
                            Size: '-sm',
                            OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-15 pointer-events-none',
                            TailwindColor: 'gray'
                        }
                    };
                }
            },
            data: {
                type: Object,
                required: true
            },
            accountNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'accountnum',
                        Name: 'accountnum',
                        MinLength: 1,
                        MaxLength: 35,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'ACCOUNT NUMBER'
                    };
                }
            },
            routingNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'routingnum',
                        Name: 'routingnum',
                        MinLength: 1,
                        MaxLength: 11,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'SWIFT/BIC code'
                    };
                }
            },
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                accountNumberValue: '',
                cardHolderNameOptions: [],
                ccNameValue: '',
                ccType: '',
                ccNameId: '',
                ccNumber: '',
                ccNumberId: '',
                creditDebitCardValue: 'Credit/Debit Card',
                expirationMonth: '',
                expirationMonths: [],
                expirationYear: '',
                expirationYears: [],
                cvvId: '',
                cvv: {
                    Name: 'cvv',
                    MinLength: cardNumber.cardCvvCharLimitsByCountry.default.min,
                    MaxLength: cardNumber.cardCvvCharLimitsByCountry.default.max,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'CVC/CVV'
                },
                cvvValue: '',

                checkboxes: this.data.Checkboxes,
                inputErrors: {
                    email: false,
                    phone: false
                },
                loading: false,
                userInfo: {},
                error: '',
                gtmText: [
                    'terms-of-use-privacy-policy',
                    'customer-agreement-statement-of-policies',
                    'mandate-sepa-direct-debit'
                ],
                paymentMethodType: 'Credit/Debit Card', // override from mixin
                routingNumberValue: ''
            };
        },
        computed: {
            ...mapGetters('paymentMethod', ['cardOptions']),

            cardHolderNamePattern() {
                return this.data?.Labels?.CardholderNamePattern || '';
            },
            cardHolderNamePlaceholder() {
                return this.enableNameValidateFlag ? (this.data?.Labels && this.data?.Labels?.CardholderNamePlaceholder) : this.ccName?.Placeholder;
            },
            cardMaxLength() {
                return this.data?.Labels?.CardNumberMaxValue || 16;
            },
            cardMinLength() {
                return this.data?.Labels?.CardNumberMinValue || 14;
            },
            ctaLink() {
                return this.data?.Address?.CTALink;
            },
            enableNameValidateFlag() {
                return this.data?.Data?.EnableCardholderNameValidation || false;
            },
            hasInputError() {
                return this.inputErrors.email || this.inputErrors.phone;
            },
            hidePayMethod() {
                return typeof this.data.HidePayMethod === 'boolean' ? this.data.HidePayMethod : true;
            },
            isMobileApp() {
                const params = new URLSearchParams(document.location.search);
                return params.get('isAPP');
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isJP() {
                return this.$env?.Country === 'Japan' || false;
            },
            isPH() {
                return this.$env?.Country === 'Philippines' || false;
            },
            isReactivateWithCreditDebit() {
                return (!this.hidePayMethod && this.paymentMethodType === this.creditDebitCardValue) || false;
            },
            monthLabel() {
                return this.data?.Labels?.Month;
            },
            province() {
                return this.$env.Country !== 'NewZealand' ? this.userInfo.Address.Province : '';
            },
            updateEmailLabels() {
                let labels = {
                    title: this.getLocalizationProp('Labels.Email.Title'),
                    confirmTitle: this.getLocalizationProp('Labels.Email.ConfirmTitle'),
                    editAriaLabel: this.getLocalizationProp('Labels.Email.EditAriaLabel'),
                    cancelAriaLabel: this.getLocalizationProp('Labels.Email.CancelAriaLabel'),
                    saveAriaLabel: this.getLocalizationProp('Labels.Email.SaveAriaLabel'),
                    updatedSuccess: this.getLocalizationProp('Labels.Email.UpdatedSuccess'),
                    warningUserName: this.getLocalizationProp('Labels.Email.WarningUserName'),
                    warning: this.getLocalizationProp('Labels.Email.Warning'),
                    makeDefaultContactMethod: this.getLocalizationProp('Labels.Email.MakeDefaultContactMethod'),
                    agreementName: {
                        confirm: this.getLocalizationProp('Labels.Email.AgreementName'),
                        terms: this.getLocalizationProp('Labels.Email.AgreementTerms'),
                        privacy: this.getLocalizationProp('Labels.Email.AgreementPolicy')
                    },
                    makeUserNameDefaultLabel: this.getLocalizationProp('Labels.Email.MakeUserNameDefaultLabel'),
                    phoneUserName: {
                        alertModal: {
                            title: this.getLocalizationProp('Labels.PhoneUsername.EmailModal.Title'),
                            description: this.getLocalizationProp('Labels.PhoneUsername.EmailModal.Description'),
                            cancel: this.getLocalizationProp('Labels.Common.Cancel'),
                            edit: this.getLocalizationProp('Labels.PhoneUsername.EmailModal.EditPhoneNumber')
                        },
                        warning: this.getLocalizationProp('Labels.PhoneUsername.EditMobileMessage'),
                        agreement: {
                            checkboxLabel: this.getLocalizationProp('Labels.PhoneUsername.EmailAgreement.CheckboxLabel'),
                            title: this.getLocalizationProp('Labels.PhoneUsername.EmailAgreement.Title'),
                            message: this.getLocalizationProp('Labels.PhoneUsername.EmailAgreement.AgreementMessagingEmail')
                        }
                    },
                    errors: {
                        format: this.getLocalizationProp('Labels.Email.Errors.Format'),
                        confirm: this.getLocalizationProp('Labels.Email.Errors.Confirm'),
                        agreement: this.getLocalizationProp('Labels.Email.WarningAgreement')
                    },
                    save: this.getLocalizationProp('Labels.Common.Save'),
                    cancel: this.getLocalizationProp('Labels.Common.Cancel'),
                    edit: this.getLocalizationProp('Labels.Common.Edit'),
                    termsModal: {
                        title: this.getLocalizationProp('Labels.Common.TermsTitle'),
                        rte: this.getLocalizationProp('Labels.Common.TermsDescription', '')
                    },
                    privacyModal: {
                        title: this.getLocalizationProp('Labels.Common.PrivacyTitle', ''),
                        rte: this.getLocalizationProp('Labels.Common.PrivacyDescription', '')
                    }
                };

                return {...labels, ...this.data.Labels.email};
            },
            showImprovedCTACheckout() {
                return this.data?.ShowImprovedCTACheckout;
            },
            showSepaDirectDebit() {
                return this.data.ShowSepaDirectDebit || false;
            },
            useCvv() {
                return typeof this.data.Labels?.ShowCvv === 'boolean' ? this.data.Labels?.ShowCvv : false;
            },
            yearLabel() {
                return this.data?.Labels?.Year;
            }
        },
        watch: {
            // reset errors on switching between payMethodTypes
            paymentMethodType() {
                this.error = '';
                this.$v.$reset();
            }
        },
        async created() {
            this.getUserInfo();
            if(!this.hidePayMethod) {
                this.getCountryInfo({
                    country: this.$env?.Country
                });
            }
        },
        mounted() {
            this.expirationMonths = cardNumber.getCardMonth(this.monthLabel);
            this.expirationYears = cardNumber.getCardYear(this.yearLabel);
            this.setCardHolderNameOptions();
        },
        methods: {
            ...mapActions('paymentMethod', ['getCountryInfo']),

            getCountryCode,
            cancelReactivation() {
                if(this.isMobileApp) {
                    window.location.pathname = '/my-account';
                    return false;
                }
                history.go(-1);
                return false;
            },
            async getUserInfo() {
                const response = await api.get();
                if(response.success) {
                    this.userInfo = response.data;
                    // Show empty phone field if user has no phone number for all cultures except KR
                    const addEmptyPhone = (this.userInfo['Phone'].length === 0 && !this.isKR);
                    this.userInfo.Phone = addEmptyPhone ? [{}] : this.userInfo['Phone'];
                }
            },
            onCardNumberError({ brand }) {
                this.ccType = brand;
            },
            async reactivateAccount() {
                this.$v.$touch();

                if(this.loading || this.$v.$invalid) {
                    return;
                }

                this.loading = true;
                this.error = '';

                if(!this.validateCheckboxes()) {
                    this.error = this.data?.Labels?.error?.requiredCheckbox;
                    this.loading = false;
                    return;
                }

                const sendSms = this.checkboxes?.find(item => item.Name === 'SendSms');
                const terms = this.checkboxes?.find(item => item.Name === 'Terms');

                const paymentDetails = this.isReactivateWithSepa
                    ? {
                        PayMethodType: 'DirectDebit',
                        AccountNumber: this.accountNumberValue,
                        RoutingNumber: this.routingNumberValue
                    }
                    : {
                        CardNumber: this.ccNumber.replace(/\s/g, ''),
                        ExpirationMonth: this.expirationMonth,
                        ExpirationYear: this.expirationYear,
                        PayMethodType: this.ccType,
                        CvvCode: this.cvvValue
                    };

                const payload = {
                    Name: this.enableNameValidateFlag ? this.ccNameValue.toUpperCase().trim() : this.ccNameValue,
                    ...paymentDetails,
                    HasAcceptedCustomerAgreement: terms ? terms.Checked : false,
                    SendSms: sendSms ? sendSms.Checked : false
                };

                const response = await api.post(payload);
                if(response.success && response.data?.Success) {
                    window.location.href = this.data.RedirectUrl;
                } else {
                    this.error = response.data?.ErrorMessage || response.error || 'There was an issue with your request. Please try again.';
                }

                this.loading = false;
            },
            // For choosing name or spouse name
            selectOptionsValues(selectOptions) {
                let values = [];

                if(selectOptions) {
                    selectOptions.map(option => {
                        values.push(option.Value);
                    });
                }

                return values;
            },
            setCardHolderNameOptions() {
                // Note difference of 'CardHoldersNames' and 'CardHolderNames'
                const cardHolderNames =
                    this.data.CardHoldersNames?.split(',')
                        .map((name) => name.trim())
                        .filter((name) => name);

                this.cardHolderNameOptions = cardHolderNames?.map((name) => ({
                    Label: name,
                    Value: name
                })) || [];
            },
            showAcknowledgementOnForm(checkbox) {
                // show mandate checkbox on SEPA form only
                if(!this.isReactivateWithSepa && checkbox.Name === 'SepaMandate') return false;
                return true;
            },
            updateInputError(item, value) {
                this.inputErrors[item] = value;
            },
            updateChecked(checkbox) {
                checkbox.Checked = !checkbox.Checked;
                if(this.validateCheckboxes()) {
                    this.error = '';
                }
            },
            validateCheckboxes() {
                // validate mandate checkbox for SEPA paymethod only
                return this.checkboxes
                    .filter((checkbox) => {
                        return checkbox.Required && !(!this.isReactivateWithSepa && checkbox?.Name === 'SepaMandate');
                    })
                    .every(item => item.Checked);
            }
        }
    };
</script>

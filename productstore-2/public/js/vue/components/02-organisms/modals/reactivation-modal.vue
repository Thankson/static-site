<template>
    <modal-content
        class="o-reactivationModal"
        :class="{'-isCn': isCn, 'pb-90': productImageOffset}"
        :prevent-click-outside-close="true"
        width="630px"
        heading-class="o-reactivationModal__heading">

        <template v-slot:before>
            <!-- Desktop-only free product image -->
            <div v-if="showFreeProductImage && productImageOffset" class="hidden md:block absolute right-10 -z-1 max-w-200" :style="productImageOffset">
                <img :alt="getLocalizationProp('Data.ReactivateIncentivePromo.ProductImage.Alt')" :src="getLocalizationProp('Data.ReactivateIncentivePromo.ProductImage.Url')" />
            </div>
            <!-- Other image if no free product -->
            <img v-else class="absolute bottom-0 right-0 -z-1" :alt="getLocalizationProp('Data.Image.Alt')" :src="getLocalizationProp('Data.Image.Url')" />
        </template>

        <template v-slot:heading>
            <!-- No element tag because the <modal>/<modal-content> components render an <h2>. Class is defined on a prop -->
            {{ getLocalizationProp('Labels.Heading') }}
        </template>

        <template v-slot:body>
            <p
                ref="description"
                class="o-reactivationModal__description"
                :class="getWidthWithProductImage"
                v-html="getDescription">
            </p>
            <!-- Mobile-only free product image -->
            <div v-if="showFreeProductImage" class="md:hidden m-auto mt-20 max-w-200">
                <img :alt="getLocalizationProp('Data.ReactivateIncentivePromo.ProductImage.Alt')" :src="getLocalizationProp('Data.ReactivateIncentivePromo.ProductImage.Url')" />
            </div>

            <div v-if="formVisible" class="o-reactivationModal__form mt-15" :class="getWidthWithProductImage">
                <fieldset
                    v-if="!hidePayMethod"
                    class="mb-25">

                    <legend class="m-formField__label">
                        {{ getLocalizationProp('Labels.PaymentMethodType', 'Payment Method Type') }}
                    </legend>
                    <div class="o-reactivationModal__radio">
                        <m-radio v-if="defaultCreditCard" input-value="CreditCard" value="CreditCard">
                            <div class="flex font-bold">
                                <span v-if="defaultCreditCard.CreditCardDescription" class="tracking-tight">{{ defaultCreditCard.CreditCardDescription }} </span>
                                <span v-else-if="defaultCreditCard.AccountNickName" class="tracking-tight">{{ defaultCreditCard.AccountNickName }}</span>
                                <span v-if="defaultCreditCard.LastFourDigitsOfAccount && defaultCreditCard.AccountNickName" v-html="defaultCreditCard.MaskingCondensed"></span>&nbsp;
                                <span v-if="!defaultCreditCard.AccountNickName" v-html="defaultCreditCard.Masking"></span>
                                <span class="tracking-tight">{{ defaultCreditCard.LastFourDigitsOfAccount }}</span>
                            </div>
                        </m-radio>

                        <m-radio
                            v-else
                            v-model="paymentMethodType"
                            name="PaymentMethodType"
                            :label="getLocalizationProp('Labels.DebitCreditCard', 'Debit/Credit Card')"
                            input-value="Credit/Debit Card"
                            value="Credit/Debit Card" />

                        <!-- SEPA-payment option-For EU markets -->
                        <m-radio
                            v-if="showSepaDirectDebit"
                            v-model="paymentMethodType"
                            name="PaymentMethodType"
                            :label="getLocalizationProp('Labels.SepaDirectDebit', '')"
                            input-value="SepaDirectDebit"
                            value="SepaDirectDebit" />
                    </div>
                </fieldset>
                <div v-if="!hidePayMethod && !defaultCreditCard && !hideCcForm">
                    <!-- #region Credit/Debit Form -->
                    <template v-if="isReactivateWithCreditDebit">
                        <div class="mb-25">
                            <label
                                class="m-formField__label"
                                :for="ccName.Id">

                                {{ getLocalizationProp('Labels.CardholderName', 'Cardholder Name') }}
                            </label>

                            <v-input
                                v-if="!isJP"
                                :id="ccName.Id"
                                v-model="ccNameValue"
                                :placeholder="cardHolderNamePlaceholder"
                                auto-complete="off"
                                arrow-tailwind-color="gray-120"
                                arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                select-mod="-sm-md -rounded -padding-md -bg-transparent w-full"
                                :tailwind-mods="$v.$dirty && $v.ccNameValue.$invalid ? '-isInvalid' : ''"
                                class="md:text-sm"
                                @input="updateModel(enableNameValidateFlag ? 'ccNameValue' : 'ccName', enableNameValidateFlag )"
                                @blur="handleBlur(enableNameValidateFlag ? 'ccNameValue' : 'ccName')">
                            </v-input>
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

                        <div class="mb-25">
                            <label
                                class="m-formField__label"
                                :for="ccNumberId"
                                v-html="getLocalizationProp('Labels.CardNumber', 'Card Number')" />

                            <input-card-number
                                :id="ccNumberId"
                                v-model="ccNumber"
                                auto-complete="off"
                                name="ccNumber"
                                :tailwind-mods="$v.$dirty && $v.ccNumber.$invalid ? '-isInvalid' : ''"
                                value=""
                                :card-options="cardOptions"
                                :max-length="cardMaxLength"
                                :min-length="cardMinLength"
                                :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                                @card-number-error="onCardNumberError" />
                        </div>

                        <!-- Expiration -->
                        <div class="mb-25 flex">
                            <fieldset class="flex md:w-5_12">
                                <legend class="m-formField__label">
                                    {{ getLocalizationProp('Labels.Expiration', 'Expiration') }}
                                </legend>

                                <v-select
                                    :options="selectOptionsLabels(expirationMonths)"
                                    :values="selectOptionsValues(expirationMonths)"
                                    :initial="null"
                                    :is-disabled="true"
                                    :aria-label="getLocalizationProp('Labels.Month', 'Month')"
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
                                    :aria-label="getLocalizationProp('Labels.Year', 'Year')"
                                    :class="{ '-isInvalid': $v.$dirty && $v.expirationYear.$invalid }"
                                    arrow-tailwind-color="gray-120"
                                    arrow-other-mods="-filled w-0 h-0 absolute right-15 top-16 pointer-events-none md:top-15"
                                    :select-mod="`-sm-md -rounded -padding-md -bg-transparent w-full ml-5 ${$v.$dirty && $v.expirationYear.$invalid ? '-error' : ''}`"
                                    @change="({ value }) => expirationYear = value" />
                            </fieldset>

                            <!-- CVV Field -->
                            <div v-if="useCvv" class="m-formField -text w-5_12 pl-20 lg:pr-20 lg:pl-20 pt-0">
                                <label
                                    class="m-formField__label"
                                    :for="cvv.Id"
                                    v-html="getLocalizationProp('Labels.CvvLabel')">
                                </label>
                                <v-input
                                    :id="cvv.Id"
                                    ref="cvv"
                                    v-model="cvvValue"
                                    auto-complete="off"
                                    :max-length="cvv.MaxLength"
                                    :min-length="cvv.MinLength"
                                    :placeholder="cvv.Placeholder"
                                    :tailwind-mods="$v.$dirty && $v.cvvValue.$invalid ? '-isInvalid' : ''"
                                    :value="cvvValue"
                                    @input="updateModel('cvvValue')"
                                    @blur="handleBlur('cvvValue')"
                                    @keydown="handleInteger">
                                </v-input>
                            </div>
                        </div>
                    </template>
                    <!-- #endregion Credit/Debit Form-->

                    <!-- #region Directdebit SEPA Form-->
                    <template v-if="isReactivateWithSepa">
                        <div class="mb-25">
                            <label
                                class="m-formField__label"
                                :for="ccName.Id"
                                v-html="getLocalizationProp('Labels.CardholderName', '')">
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
                                v-html="getLocalizationProp('Labels.RoutingNumber', '')">
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
                                v-html="getLocalizationProp('Labels.AccountNumber', '')">
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

            </div>
            <div v-if="formVisible" class="o-reactivationModal__form mt-15" :class="getWidthWithProductImage">
                <div v-for="(checkbox, index) in getLocalizationProp('Checkboxes')" :key="index" class="o-reactivationModal__checkbox">
                    <template v-if="checkbox.Text">
                        <m-checkbox
                            v-if="showAcknowledgementOnForm(checkbox)"
                            :label="checkbox.Text"
                            :name="checkbox.Name"
                            class="-alignTop"
                            :aria-required="checkbox.Required"
                            :aria-invalid="checkbox.Required && error && !checkbox.Checked"
                            :label-mods="checkbox.Required && error && !checkbox.Checked ? '-error font-normal' : 'font-normal'"
                            :value="checkbox.Checked"
                            @input="[updateChecked(checkbox), gtmTrackAction({id: 205, text: gtmText[index]}, $event)]"
                        />
                    </template>
                </div>
                <p v-if="getLocalizationProp('Data.ShowBuo', false)" class="pt-10 pb-16 text-sm pl-44" v-html="getLocalizationProp('Labels.BuoMessage')">
                </p>
            </div>
        </template>

        <template v-slot:footer>
            <v-button
                v-if="!formVisible && !isCn"
                class="o-reactivationModal__button -reactivation"
                type="button"
                @click="formVisible = true; gtmTrackAction({id: 407}, $event)">
                {{ getLocalizationProp('Labels.ReactivateAccountLabel') }}
            </v-button>
            <!-- GA Tagging only updated to GA4 for non-CN -->
            <v-button
                v-if="!formVisible && isCn"
                :is-anchor="true"
                :cta="getLocalizationProp('Labels.ReactivateAccountLabel')"
                class="o-reactivationModal__button  -reactivation"
                type="button"
                :href="getLocalizationProp('Data.ReactivateAccountButton')">
            </v-button>
            <div v-if="formVisible" class="o-reactivationModal__wrapper">
                <!-- v-modal-hide will add a default listener to hide the modal on click -->
                <v-button
                    v-modal-hide
                    class="o-reactivationModal__button -cancelModal md:ml-10"
                    @click="gtmTrackAction({id: 407}, $event)"
                >
                    {{ getLocalizationProp('Labels.NotNowLabel') }}
                </v-button>

                <v-button
                    class="o-reactivationModal__button -reactivation"
                    @click="submit(), gtmTrackAction({id: 407}, $event)"
                >

                    {{ getLocalizationProp('Labels.ReactivateAccountLabel') }}
                </v-button>

                <!-- Errors specific to each field -->
                <ul
                    v-if="($v.$dirty && $v.$invalid) || error"
                    class="e-formError__list mt-15"
                    role="alert"
                    aria-live="assertive">

                    <li
                        v-if="error"
                        class="e-formError__item mt-0 block md:mr-1_4"
                        v-html="error">
                    </li>

                    <li
                        v-if="$v.ccNameValue.$invalid"
                        class="e-formError__item mt-0">
                        <template v-if="!$v.ccNameValue.isValidEnNameValue">
                            {{ getLocalizationProp('Labels.CardholderNameInvalid', 'Card name is invalid') }}
                        </template>
                        <template v-else>
                            {{ getLocalizationProp('Labels.CardholderNameRequired', 'Card name field is required') }}
                        </template>
                    </li>
                    <li
                        v-if="$v.ccNumber.$invalid"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.CardNumberError', 'Card Number field is required') }}
                    </li>

                    <li
                        v-if="$v.expirationMonth.$invalid"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.ExpirationMonthError', 'Expiration Month field is required') }}
                    </li>

                    <li
                        v-if="$v.expirationYear.$invalid"
                        class="e-formError__item mt-0">

                        {{ getLocalizationProp('Labels.ExpirationYearError', 'Expiration Year field is required') }}
                    </li>

                    <li
                        v-if="$v.cvvValue.$invalid"
                        class="e-formError__item mt-0">
                        {{ getLocalizationProp('Labels.CvvRequired', 'CVV field is required') }}
                    </li>

                    <li
                        v-if="$v.routingNumberValue.$invalid"
                        class="e-formError__item mt-0">
                        {{ getLocalizationProp('Labels.RoutingNumberRequired', '') }}
                    </li>

                    <li
                        v-if="$v.accountNumberValue.$invalid"
                        class="e-formError__item mt-0">
                        {{ getLocalizationProp('Labels.AccountNumberRequired', '') }}
                    </li>
                </ul>

                <a-loading-spinner :visible="loading" size="sm" />
            </div>
        </template>
    </modal-content>
</template>

<script>
    import api from '@api/routes/customeraccount/reactivate';

    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import paymentFormMixin from '../../../mixins/payment-form';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import cardNumber from '@common/source/js/vue/utils/card-number';

    import { validationMixin } from 'vuelidate';
    import { integer, required, requiredIf, minLength, maxLength } from 'vuelidate/lib/validators';
    import { mapGetters, mapActions } from 'vuex';
    import regexParser from 'regex-parser';

    export default {
        name: 'OReactivationModal',
        components: {
            vInput
        },
        mixins: [ localizationMixin, validationMixin, paymentFormMixin ],
        props: {
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
            }
        },
        data() {
            return {
                accountNumberValue: '',
                cardHolderNameOptions: [],
                ccNameValue: '',
                ccType: '',
                ccNumber: '',
                ccNumberId: '',
                expirationMonth: '',
                expirationMonths: [],
                expirationYear: '',
                expirationYears: [],
                creditDebitCardValue: 'Credit/Debit Card',
                cvv: {
                    Id: 'cvv',
                    Name: 'cvv',
                    MinLength: cardNumber.cardCvvCharLimitsByCountry.default.min,
                    MaxLength: cardNumber.cardCvvCharLimitsByCountry.default.max,
                    Placeholder: null,
                    Value: null,
                    ValidationAlert: 'This field is required.',
                    Label: 'CVC/CVV'
                },
                cvvValue: '',

                formVisible: false,
                loading: false,
                error: '',
                gtmText: [
                    'terms-of-use-privacy-policy',
                    'customer-agreement-statement-of-policies',
                    'mandate-sepa-direct-debit'
                ],
                productImageOffset: '',
                paymentMethodType: 'Credit/Debit Card', // override from mixin
                routingNumberValue: ''
            };
        },
        safeIds: [
            'ccNumberId'
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
                            const patternStr = regexParser(this.cardholderNamePattern);
                            return patternStr.test(value);
                        }
                    })
                };
                // #region -- Validations specific to SEPA form
                if(this.isReactivateWithSepa) {
                    validations.accountNumberValue = {
                        required: required,
                        minLength: minLength(this.accountNumber.MinLength),
                        maxLength: maxLength(this.accountNumber.MaxLength)
                    };

                    validations.routingNumberValue = {
                        required: required,
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
                        required: requiredIf(() => this.useCvv),
                        integer,
                        min: () => {
                            if(!this.useCvv) return true;
                            return minLength(this.cvv.MinLength);
                        },
                        max: () => {
                            if(!this.useCvv) return true;
                            return maxLength(this.cvv.MaxLength);
                        }
                    };
                    validations.expirationMonth = {
                        required
                    };
                    validations.expirationYear = {
                        required
                    };
                }
                // #endregion -- Validations specific to Credit/Debit Form
            }
            return validations;
        },
        computed: {
            ...mapGetters('paymentMethod', ['cardOptions']),
            cardholderNamePattern() {
                return this.getLocalizationProp('Labels.CardholderNamePattern', '');
            },
            cardHolderNamePlaceholder() {
                return this.enableNameValidateFlag ? this.getLocalizationProp('Labels.CardholderNamePlaceholder') : '';
            },
            cardMaxLength() {
                return this.getLocalizationProp('Labels.CardNumberMaxValue', 16);
            },
            cardMinLength() {
                return this.getLocalizationProp('Labels.CardNumberMinValue', 14);
            },
            defaultCreditCard() {
                return this.getLocalizationProp('Data.DefaultCreditCard');
            },
            enableNameValidateFlag() {
                return this.getLocalizationProp('Data.EnableCardholderNameValidation', false);
            },
            getDescription() {
                return this.getLocalizationProp('Data.ReactivateIncentivePromo.Description') || this.getLocalizationProp('Labels.Description');
            },
            getWidthWithProductImage() {
                return this.showFreeProductImage ? 'md:w-3_5' : '';
            },
            gtmData() {
                return {
                    'event': 'userEvent',
                    'eC': 'Modal',
                    'eA': 'View',
                    'eL': this.getDescription
                };
            },
            hidePayMethod() {
                return this.getLocalizationProp('HidePayMethod');
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isJP() {
                return this.$env?.Country === 'Japan' || false;
            },
            isKR() {
                return this.country === 'Korea';
            },
            isReactivateWithCreditDebit() {
                return !this.hidePayMethod &&
                    this.paymentMethodType === this.creditDebitCardValue;
            },
            monthLabel() {
                return this.getLocalizationProp('Labels.Month', 'Month');
            },
            showFreeProductImage() {
                return this.getLocalizationProp('Data.ReactivateIncentivePromo.Sku') && this.getLocalizationProp('Data.ReactivateIncentivePromo.ProductImage');
            },
            showSepaDirectDebit() {
                return this.getLocalizationProp('ShowSepaDirectDebit', false);
            },
            showImprovedCTACheckout() {
                return this.getLocalizationProp('Data.ShowImprovedCTACheckout', false);
            },
            useCvv() {
                return this.getLocalizationProp('Data.ShowCvv', false);
            },
            yearLabel() {
                return this.getLocalizationProp('Labels.Year', 'Year');
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
            if(this.showImprovedCTACheckout && !this.hidePayMethod) {
                this.getCountryInfo({
                    country: this.$env?.Country
                });
            }
        },
        mounted() {
            this.expirationMonths = cardNumber.getCardMonth(this.monthLabel);
            this.expirationYears = cardNumber.getCardYear(this.yearLabel);
            this.setCardHolderNameOptions();
            if(this.showFreeProductImage) this.computeImagePosition();
            this.gtmTrackActionData(this.gtmData);
        },
        methods: {
            ...mapActions('paymentMethod', ['getCountryInfo']),

            computeImagePosition() {
                setTimeout(() => {
                    const offset = this.$refs['description'].offsetTop;
                    this.productImageOffset = `top:${offset}px`;
                }, 100);
            },
            async submit() {
                this.$v.$touch();

                if(this.loading || this.$v.$invalid) {
                    return;
                }
                this.error = '';
                this.loading = true;

                // Checkboxes
                if(!this.validateCheckboxes()) {
                    this.error = this.getLocalizationProp('Labels.Error');
                    this.loading = false;
                    return;
                }
                const sendSms = this.getLocalizationProp('Checkboxes').find(item => item.Name === 'SendSms');
                const terms = this.getLocalizationProp('Checkboxes').find(item => item.Name === 'Terms');

                // Checks for useCvv which currenlty applies to Korea only
                if(this.useCvv && this.isKr) {
                    this.ccType = 'CreditCard';
                }

                let payload = {
                    Name: this.enableNameValidateFlag ? this.ccNameValue.toUpperCase().trim() : this.ccNameValue,
                    HasAcceptedCustomerAgreement: terms ? terms.Checked : false,
                    SendSms: sendSms ? sendSms.Checked : false
                };
                if(this.isReactivateWithSepa) {
                    payload = {
                        ...payload,
                        PayMethodType: 'DirectDebit',
                        AccountNumber: this.accountNumberValue,
                        RoutingNumber: this.routingNumberValue
                    };
                }

                if(this.ccNumber) {
                    payload = {
                        ...payload,
                        CardNumber: this.ccNumber.replace(/\s/g, ''),
                        ExpirationMonth: this.expirationMonth,
                        ExpirationYear: this.expirationYear,
                        PayMethodType: this.ccType,
                        CvvCode: this.cvvValue
                    };
                }

                const response = await api.post(payload);
                if(response.success && response.data?.Success) {
                    // set this so the component a-cust-name-status knows to check
                    // the api until the order has been made and payed for so
                    // the updated status can be displayed instead of the stored
                    // status in sessionStorage
                    sessionStorage.setItem('reactivationInProgress', true);

                    this.$modal.hide();
                    window.location.href = response.data.redirectUrl;
                } else {
                    this.error = response.data?.ErrorMessage || response.error || '';
                }

                this.loading = false;
            },
            onCardNumberError({ brand }) {
                if(brand && brand !== null) {
                    this.ccType = brand;
                }
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
                // Note difference of 'CardHoldersNames' in data vs 'CardHolderNames' in component
                const cardHolderNames =
                    this.getLocalizationProp('Data.CardHoldersNames').split(',')
                        .map((name) => name.trim())
                        .filter((name) => name);

                this.cardHolderNameOptions = cardHolderNames?.map((name) => ({
                    Label: name,
                    Value: name
                })) || [];
            },
            showAcknowledgementOnForm(checkbox) {
                // show mandate checkbox on SEPA form only
                if(!this.isReactivateWithSepa && checkbox?.Name === 'SepaMandate') return false;
                return true;
            },
            trackModal(modalText) {
                window.dataLayer && window.dataLayer.push({
                    'event': 'userEvent',
                    'eC': 'Modal',
                    'eA': 'Modal',
                    'eL': modalText
                });
            },
            updateChecked: function(checkbox) {
                checkbox.Checked = !checkbox.Checked;
                if(this.validateCheckboxes()) {
                    this.error = '';
                }
            },
            validateCheckboxes: function () {
                // validate mandate checkbox for SEPA paymethod only
                return this.getLocalizationProp('Checkboxes')
                    .filter((checkbox) => {
                        return checkbox.Required && !(!this.isReactivateWithSepa && checkbox?.Name === 'SepaMandate');
                    })
                    .every(item => item.Checked);
            }
        }
    };
</script>

<template>
    <div class="m-payForm">
        <!-- Card Brands (only for add mode) -->
        <div v-if="showCardBrands && cardOptions && cardOptions.length" class="m-payForm__cards flex-wrap pb-20">
            <p class="m-payForm__title to-md:w-full text-gray-160 pb-0" v-html="getLabels('Labels.Card.Accepts', cardTitle)"></p>
            <ul class="m-payForm__list to-md:w-full to-md:ml-0 md:ml-10">
                <li v-for="(card, index) in cardOptions" :key="index" class="m-payForm__item">
                    <img
                        :alt="card.Alt ? card.Alt : null"
                        :src="card.Src ? card.Src : null"
                        class="mr-10 w-36 h-auto inline-block align-top self-start">
                </li>
            </ul>
        </div>

        <div class="m-payForm__rowGroup -gap">
            <!-- Cardholder Field (only for add mode) -->
            <div v-if="showCardHolderName && !isEditing" class="m-formField -text" :class="isMX ? 'm-payForm__halfForm' : 'md:flex-1'">
                <label
                    class="m-formField__label uppercase leading-tight"
                    :for="cardHolder.Id"
                    v-html="getLabels('Labels.Card.CardholderName', cardHolder.Label)">
                </label>

                <v-input
                    v-if="!isKR && !isJP"
                    :id="cardHolder.Id"
                    ref="cardHolder"
                    v-model="cardHolderValue"
                    auto-complete="off"
                    :name="cardHolder.Name"
                    :max-length="cardHolder.MaxLength"
                    :min-length="cardHolder.MinLength"
                    :placeholder="getLabels('Labels.Card.CardholderName', cardHolder.Placeholder)"
                    :tailwind-mods="$v.cardHolderValue && $v.cardHolderValue.$error ? '-isInvalid' : null"
                    :aria-invalid="$v.cardHolderValue && $v.cardHolderValue.$error"
                    :aria-describedby="$v.cardHolderValue && $v.cardHolderValue.$error ? cardHolderErrorId : false"
                    :value="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue)"
                    class="to-md:text-sm"
                    @input="updateModel('cardHolderValue')"
                    @blur="handleBlur('cardHolderValue')">
                </v-input>

                <v-select
                    v-else
                    :id="cardHolder.id"
                    ref="cardHolder"
                    vmodel="cardHolderValue"
                    :options="selectOptionsLabels(cardHolderNameOptions)"
                    :values="selectOptionsValues(cardHolderNameOptions)"
                    :initial="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue) || selectOptionsValues(cardHolderNameOptions)[0] || ''"
                    :name="cardHolder.Name"
                    :aria-label="getLabels('Labels.Card.CardholderName', cardHolder.Label)"
                    :select-mod="cardHolder.SelectMod"
                    select-element-mod="py-10 px-15"
                    :arrow-direction="cardHolder.Arrow.Direction || null"
                    arrow-size="-md"
                    :arrow-tailwind-color="cardHolder.Arrow.TailwindColor || null"
                    arrow-other-mods="absolute right-15 top-15 pointer-events-none"
                    :aria-invalid="$v.cardHolderValue && $v.cardHolderValue.$error"
                    :aria-describedby="$v.cardHolderValue && $v.cardHolderValue.$error ? cardHolderErrorId : false"
                    @change="updateModel"
                    @blur="handleBlur('cardHolderValue')"
                />

                <div
                    v-if="$v.$dirty && $v.cardHolderValue && $v.cardHolderValue.$invalid"
                    :id="cardHolderErrorId"
                    class="text-sm text-red leading-tight mt-5"
                    v-html="cardHolderError"
                />
            </div>
            <div v-if="isMX && !isEditing" class="m-formField m-payForm__halfForm -text pt-10 sm:pt-0">
                <label
                    class="m-formField__label uppercase leading-tight"
                    :for="cardHolderLast.Id"
                    v-html="getLabels('Labels.Card.LastName', '')">
                </label>

                <v-input
                    :id="cardHolderLast.Id"
                    ref="cardHolderLast"
                    v-model="cardHolderLastValue"
                    auto-complete="off"
                    :name="cardHolderLast.Name"
                    :max-length="cardHolderLast.MaxLength"
                    :min-length="cardHolderLast.MinLength"
                    :placeholder="getLabels('Labels.Card.LastName', cardHolderLast.Placeholder)"
                    :tailwind-mods="$v.cardHolderLastValue && $v.cardHolderLastValue.$error ? '-isInvalid' : null"
                    :aria-describedby="$v.cardHolderLastValue && $v.cardHolderLastValue.$error ? 'cardholderlastname-error' : false"
                    :value="getInitialValue(cardHolderLast, 'CardHolderLastName', cardHolderLastValue)"
                    class="text-sm md:text-base"
                    @input="updateModel('cardHolderLastValue')"
                    @blur="handleBlur('cardHolderLastValue')">
                </v-input>
                <div
                    v-if="$v.cardHolderLastValue && $v.cardHolderLastValue.$error" class="e-formError__item"
                    :class="{ '-rbAddress': isRiverbendSubscription }">
                    <p v-if="!$v.cardHolderLastValue.required">
                        {{ getLabels('Labels.ErrorMessages.LastName.Required', '') }}
                    </p>
                    <p v-if="!$v.cardHolderLastValue.allowed">
                        {{ getLabels('Labels.ErrorMessages.LastName.Invalid', 'Card Holder is Invalid') }}
                    </p>
                    <p v-else-if="!$v.cardHolderLastValue.max">
                        {{ getLabels('Labels.ErrorMessages.LastName.MaxLength', '') }}
                    </p>
                </div>
            </div>

            <!-- Cardnumber Field (only for add mode) -->
            <div v-if="cardOptions && cardOptions.length" class="m-formField -text" :class="isMX ? 'm-payForm__halfForm' : 'md:flex-1'">
                <template v-if="!isEditing">
                    <label
                        class="m-formField__label uppercase leading-tight"
                        :for="cardNumber.Id"
                        v-html="getLabels('Labels.Card.CardNumber', cardNumber.Label)">
                    </label>

                    <input-card-number
                        :id="cardNumber.Id"
                        ref="cardNumber"
                        v-model="cardNumberValue"
                        auto-complete="off"
                        :name="cardNumber.Name"
                        mask="creditcardnumber"
                        mask-char="•"
                        :mask-on-blur="maskCardNumber"
                        :unmask-on-focus="maskCardNumber"
                        :max-length="cardNumber.MaxLength"
                        :min-length="cardNumber.MinLength"
                        :placeholder="getLabels('Labels.Card.CardNumber', cardNumber.Placeholder)"
                        :show-improved-c-t-a-checkout="showImprovedCTACheckout"
                        :tailwind-mods="hasCardError ? '-isInvalid' : null"
                        :aria-invalid="hasCardError"
                        :aria-describedby="hasCardError ? cardNumberErrorId : false"
                        :value="getInitialValue(cardNumber, 'CardNumber', cardNumberValue)"
                        :card-options="cardOptions"
                        class="to-md:text-sm"
                        @input="updateModel('cardNumberValue')"
                        @blur="handleBlur('cardNumberValue')"
                        @card-number-error="handleCardNumber">
                    </input-card-number>

                    <div
                        v-if="hasCardError"
                        :id="cardNumberErrorId"
                        class="text-sm text-red leading-tight mt-5"
                        v-html="cardNumberError"
                    />
                </template>

                <a-pay-label
                    v-else
                    class="-payForm"
                    :account-number-preview="storedPayMethod.LastFourDigitsOfAccount"
                    :display-name="storedPayMethod.PaymethodNameDisplay"
                    :name-on-account="storedPayMethod.NameOnAccount"
                    :card-brand-name="storedPayMethod.PayMethodType"
                    :expiration-date="storedPayMethod.ExpirationDisplay"
                    :expires-soon="false"
                    :is-expired="false"
                    :image="storedPayMethod.PayMethodImage"
                    :type="storedPayMethod.PayMethodType"
                    :card-masking="storedPayMethod.MaskingCondensed"
                    :is-cn="$env.IsCn"
                    :show-expired-date="false"
                />
            </div>
            <div v-if="useZipcode && !isEditing && isMX" class="m-formField -text pb-0 m-payForm__halfForm">
                <label
                    class="m-formField__label uppercase leading-tight"
                    :for="zip.Id"
                    v-html="getLabels('Labels.Card.BillingZipCode', zip.Label)">
                </label>

                <v-input
                    :id="zip.Id"
                    ref="zip"
                    v-model="zipValue"
                    auto-complete="off"
                    :name="zip.Name"
                    :max-length="zip.MaxLength"
                    :min-length="zip.MinLength"
                    model-name="zipValue"
                    :placeholder="getLabels('Labels.Card.BillingZipCode', zip.Placeholder)"
                    :tailwind-mods="$v.zipValue && $v.zipValue.$error ? '-isInvalid' : null"
                    :aria-invalid="$v.zipValue && $v.zipValue.$error"
                    :aria-describedby="$v.zipValue && $v.zipValue.$error ? zipErrorId : false"
                    :value="getInitialValue(zip, 'BillingZipCode', zipValue)"
                    @input="updateModel('zipValue')"
                    @blur="handleBlur('zipValue')">
                </v-input>
                <div
                    v-if="(useZipcode && !isEditing) && $v.$dirty && $v.zipValue && $v.zipValue.$invalid"
                    :id="zipErrorId"
                    v-html="zipError"
                />
            </div>

        </div>

        <div v-if="showFormFields" class="m-payForm__grid mb-20">
            <!-- Expiration Month Field -->
            <div
                class="m-payForm__gridItem">
                <div class="m-formField -text pb-0">
                    <label
                        class="m-formField__label uppercase leading-tight"
                        :for="expMonth.Id"
                        v-html="getLabels('Labels.Card.Expiration', expMonth.Label)">
                    </label>

                    <v-select
                        v-if="localization && localization.Labels"
                        :id="expMonth.Id"
                        ref="expMonth"
                        vmodel="expMonthValue"
                        :options="selectOptionsLabels(expMonthOptions)"
                        :aria-invalid="$v.expMonthValue.$error"
                        :aria-describedby="$v.expMonthValue.$error ? expMonthErrorId : false"
                        :values="selectOptionsValues(expMonthOptions)"
                        :aria-label="expMonthLabel"
                        :select-mod="expMonth.SelectMod"
                        :select-element-mod="`py-10 px-15 ${$v.expMonthValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('ExpirationDate')) ? '-error' : ''}`"
                        :initial="getInitialValue(expMonth, 'ExpMonth', expMonthValue)"
                        :name="expMonth.Name"
                        :arrow-direction="expMonth.Arrow.Direction || null"
                        arrow-size="-md"
                        :arrow-tailwind-color="expMonth.Arrow.TailwindColor || null"
                        arrow-other-mods="absolute right-15 top-15 pointer-events-none"
                        :readonly="isReadonlyExpiration"
                        @change="updateModel"
                        @blur="handleBlur('expMonthValue')">
                    </v-select>
                </div>
            </div>

            <div class="m-payForm__gridError -month" data-testid="container-addNewPaymentFieldErrorMonth">
                <div
                    v-if="$v.$dirty && $v.expMonthValue.$invalid"
                    :id="expMonthErrorId"
                    v-html="getLabels('Labels.ErrorMessages.ExpirationMonth.Required', expMonth.ValidationAlert)"
                />
            </div>

            <!-- Expiration Year Field -->
            <div
                class="m-payForm__gridItem"
            >
                <div class="m-formField -text pb-0">
                    <label
                        class="m-formField__label uppercase leading-tight -hidden"
                        :for="expYear.Id"
                        v-html="getLabels('Labels.Card.Expiration', expYear.Label)">
                    </label>

                    <v-select
                        v-if="localization && localization.Labels"
                        :id="expYear.Id"
                        ref="expYear"
                        vmodel="expYearValue"
                        :options="selectOptionsLabels(expYearOptions)"
                        :aria-invalid="$v.expYearValue.$error"
                        :aria-describedby="$v.expYearValue.$error ? expYearErrorId : false"
                        :values="selectOptionsValues(expYearOptions)"
                        :aria-label="expYearLabel"
                        :select-mod="expYear.SelectMod"
                        :select-element-mod="`py-10 px-15 ${$v.expYearValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('ExpirationDate')) ? '-error' : null}`"
                        :initial="getInitialValue(expYear, 'ExpYear', expYearValue)"
                        :name="expYear.Name"
                        :arrow-direction="expYear.Arrow.Direction || null"
                        arrow-size="-md"
                        :arrow-tailwind-color="expYear.Arrow.TailwindColor || null"
                        arrow-other-mods="absolute right-15 top-15 pointer-events-none"
                        :readonly="isReadonlyExpiration"
                        @change="updateModel"
                        @blur="handleBlur('expYearValue')">
                    </v-select>
                </div>
            </div>

            <div class="m-payForm__gridError -year" data-testid="container-addNewPaymentFieldErrorYear">
                <div
                    v-if="($v.$dirty && $v.expYearValue.$invalid) || isCardExpired"
                    :id="expYearErrorId"
                    v-html="expiredCardErrorMessage"
                />
            </div>

            <div class="m-payForm__gridItem pt-20 md:pt-0">
                <!-- CVV Field -->
                <div v-if="useCvv && (!isEditing || isJP)" class="m-formField -text pb-0">
                    <div class="flex items-end">
                        <div class="flex-1">
                            <label
                                class="m-formField__label uppercase leading-tight"
                                :for="cvv.Id"
                                v-html="getLabels('Labels.Card.Cvc', cvv.Label)">
                            </label>

                            <v-input
                                :id="cvv.Id"
                                ref="cvv"
                                v-model="cvvValue"
                                auto-complete="off"
                                :name="cvv.Name"
                                :max-length="cvvMax"
                                :min-length="cvvMin"
                                model-name="cvvValue"
                                :placeholder="getLabels('Labels.Card.Cvc', cvv.Placeholder)"
                                :tailwind-mods="($v.cvvValue && $v.cvvValue.$error) || (storedApiErrorFields && storedApiErrorFields.includes('CVVCode')) ? '-isInvalid' : null"
                                :aria-invalid="$v.cvvValue && $v.cvvValue.$error"
                                :aria-describedby="$v.cvvValue && $v.cvvValue.$error ? cvvErrorId : false"
                                :value="getInitialValue(cvv, 'CVV', cvvValue)"
                                @input="updateModel('cvvValue')"
                                @blur="handleBlur('cvvValue')"
                                @keydown="handleInteger">
                            </v-input>
                        </div>

                        <div class="m-formField__cvvIcon mb-0 flex-shrink-0" aria-hidden="true">
                            <img src="https://cdnsc1.melaleuca.com/global/images/cvv-icon.svg" alt="">
                        </div>
                    </div>

                </div>
            </div>

            <div class="m-payForm__gridError -cvv" data-testid="container-addNewPaymentFieldErrorCvc">
                <div
                    v-if="(useCvv && (!isEditing || isJP)) && $v.$dirty && $v.cvvValue && $v.cvvValue.$invalid"
                    :id="cvvErrorId"
                    v-html="cvvError"
                />
            </div>

            <div v-if="!isMX" class="m-payForm__gridItem pt-20 md:pt-0">
                <div v-if="useZipcode && !isEditing" class="m-formField -text pb-0">
                    <label
                        class="m-formField__label uppercase leading-tight"
                        :for="zip.Id"
                        v-html="getLabels('Labels.Card.BillingZipCode', zip.Label)">
                    </label>

                    <v-input
                        :id="zip.Id"
                        ref="zip"
                        v-model="zipValue"
                        auto-complete="off"
                        :name="zip.Name"
                        :max-length="zip.MaxLength"
                        :min-length="zip.MinLength"
                        model-name="zipValue"
                        :placeholder="getLabels('Labels.Card.BillingZipCode', zip.Placeholder)"
                        :tailwind-mods="$v.zipValue && $v.zipValue.$error ? '-isInvalid' : null"
                        :aria-invalid="$v.zipValue && $v.zipValue.$error"
                        :aria-describedby="$v.zipValue && $v.zipValue.$error ? zipErrorId : false"
                        :value="getInitialValue(zip, 'BillingZipCode', zipValue)"
                        @input="updateModel('zipValue')"
                        @blur="handleBlur('zipValue')">
                    </v-input>
                </div>
            </div>

            <div class="m-payForm__gridError -zip" data-testid="container-addNewPaymentFieldErrorZip">
                <div
                    v-if="(useZipcode && !isEditing) && $v.$dirty && $v.zipValue && $v.zipValue.$invalid"
                    :id="zipErrorId"
                    v-html="zipError"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';
    import paymentFormCreditMixin from '../../../mixins/payment-form-credit';
    import * as paymentFormErrors from '../../../utils/payment-form-errors';

    export default {
        name: 'CheckoutPaymentFormCredit',
        mixins: [ paymentFormCreditMixin, safeIdMixin ],
        safeIds: [
            'cardHolderErrorId',
            'cardNumberErrorId',
            'cvvErrorId',
            'expMonthErrorId',
            'expYearErrorId',
            'zipErrorId'
        ],
        props: {
            currentPaymentMethod: {
                type: String,
                default: ''
            },
            dirty: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                cardHolderErrorId: '',
                cardNumberErrorId: '',
                cvvErrorId: '',
                expMonthErrorId: '',
                expYearErrorId: '',
                zipErrorId: ''
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedApiErrorTypes']),

            cardHolderError() {
                switch (false) {
                    case this.$v.cardHolderValue.required:
                        return this.getLabels('Labels.ErrorMessages.CardholderName.Required', this.cardHolder.ValidationAlert);
                    case this.$v.cardHolderValue.allowed:
                        return this.getLabels('Labels.ErrorMessages.CardholderName.Invalid', this.cardHolder.ValidationAlert);
                    default:
                        return this.cardHolder.ValidationAlert;
                }
            },

            cardNumberError() {
                if(this.isPrePaidError) {
                    return this.prePaidCardError;
                }

                switch (false) {
                    case this.$v.cardNumberValue.required:
                        return this.getLabels('Labels.ErrorMessages.CardNumber.Required', this.cardNumber.ValidationAlert);
                    case this.$v.cardNumberValue.min:
                        return this.getLabels('Labels.ErrorMessages.CardNumber.MinLength', this.cardNumber.ValidationAlert);
                    case this.$v.cardNumberValue.allowed:
                        return this.getLabels('Labels.ErrorMessages.CardNumber.Invalid', this.cardNumber.ValidationAlert);
                    default:
                        return this.cardNumber.ValidationAlert;
                }
            },
            cvvError() {
                switch (false) {
                    case this.$v.cvvValue.required:
                        return this.getLabels('Labels.ErrorMessages.CVV.Required', this.cvv.ValidationAlert);
                    case this.$v.cvvValue.max:
                        return this.getLabels('Labels.ErrorMessages.CVV.MaxLength', this.cvv.ValidationAlert);
                    case this.$v.cvvValue.min:
                        return this.getLabels('Labels.ErrorMessages.CVV.MinLength', this.cvv.ValidationAlert);
                    default:
                        return this.cvv.ValidationAlert;
                }
            },
            hasCardError() {
                return (this.$v.cardNumberValue && this.$v.cardNumberValue.$error) || this.isPrePaidError;
            },
            // When PayPal, do not show expiration fields
            showFormFields() {
                return this.currentPaymentMethod.toLowerCase() !== 'paypal';
            },
            isCardExpired() {
                if(!this.$v.$dirty) {
                    return false;
                }
                return this.storedApiErrorTypes?.includes(paymentFormErrors.cardExpiredDate);
            },
            isPrePaidError() {
                if(!this.$v.$dirty) {
                    return false;
                }

                return this.storedApiErrorTypes?.includes(paymentFormErrors.prePaidCard);
            },
            prePaidCardError() {
                return this.getLabels('Labels.ServerErrorTranslation', [])?.find(({ Error }) => Error === paymentFormErrors.prePaidCard)?.Translation || '';
            },
            expiredCardErrorMessage() {
                if(this.isCardExpired) {
                    return this.getLabels('Labels.ErrorMessages.ExpirationYear.Invalid', this.expYear.ValidationAlert);
                }
                return this.getLabels('Labels.ErrorMessages.ExpirationYear.Required', this.expYear.ValidationAlert);
            },
            zipError() {
                switch (false) {
                    case this.$v.zipValue.required:
                        return this.getLabels('Labels.ErrorMessages.BillingZipCode.Required', this.zip.ValidationAlert);
                    case this.$v.zipValue.min:
                        return this.getLabels('Labels.ErrorMessages.BillingZipCode.MinLength', this.zip.ValidationAlert);
                    case this.$v.zipValue.fitPatterns:
                        return this.getLabels('Labels.ErrorMessages.BillingZipCode.Invalid', this.zip.ValidationAlert);
                    default:
                        return this.zip.ValidationAlert;
                }
            }
        },
        watch: {
            $v: {
                deep: true,
                handler() {
                    this.emitValidate();
                }
            },
            dirty() {
                if(this.dirty) {
                    this.$v.$touch();
                } else {
                    this.$v.$reset();
                }
            }
        },
        mounted() {
            this.emitValidate();
        },
        methods: {
            emitValidate() {
                this.$emit('validate', this.$v.$invalid);
            }
        }
    };
</script>

<template>
    <div class="m-payForm">
        <div class="m-payForm__row">
            <!-- Cardholder Field (only for add mode) -->
            <div class="m-formField -text" :class="{'m-payForm__field': isEditing}">
                <label
                    class="m-formField__label"
                    :for="cardHolder.Id"
                    v-html="getLabels('Labels.Card.CardholderName', cardHolder.Label)">
                </label>
                <v-input
                    v-if="!isEditing"
                    :id="cardHolder.Id"
                    ref="cardHolder"
                    v-model="cardHolderValue"
                    auto-complete="off"
                    :disabled="getLocalizationProp('Data.EnablePreAuth')"
                    :name="cardHolder.Name"
                    :max-length="cardHolder.MaxLength"
                    :min-length="cardHolder.MinLength"
                    :placeholder="cardHolder.Placeholder"
                    :tailwind-mods="$v.cardHolderValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue)"
                    @input="updateModel('cardHolderValue')"
                    @blur="handleBlur('cardHolderValue')">
                </v-input>
                <input-basic-pseudo
                    v-else
                    :value="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue)">
                </input-basic-pseudo>
                <div v-if="$v.cardHolderValue.$error" :id="`${cardHolder.Id}-error`" class="e-formError">
                    <p class="e-formError__item" role="alert" v-html="getFieldError('CardholderName')"></p>
                </div>
            </div>
        </div>

        <div v-if="cardOptions && cardOptions.length && isEditing" class="m-payForm__row">
            <div class="m-formField -text" :class="{'m-payForm__field': isEditing}">
                <h2
                    class="m-formField__label"
                    :for="cardType.Id"
                    v-html="getLabels('Labels.Header.PayMethodType', cardType.Label)">
                </h2>
                <input-basic-pseudo
                    :value="getLabels('Labels.Header.Credit', cardType.Value)">
                </input-basic-pseudo>
            </div>
        </div>

        <div v-if="cardOptions && cardOptions.length" class="m-payForm__row">
            <!-- Cardnumber Field (only for add mode) -->
            <div v-if="!isEditing" class="m-formField -text">
                <label
                    class="m-formField__label"
                    :for="cardNumber.Id"
                    v-html="getLabels('Labels.Card.CardNumber', cardNumber.Label)">
                </label>
                <input-card-number
                    :id="cardNumber.Id"
                    ref="cardNumber"
                    v-model="cardNumberValue"
                    auto-complete="off"
                    :name="cardNumber.Name"
                    :is-cn="true"
                    mask="creditcardnumber"
                    :mask-on-blur="true"
                    :unmask-on-focus="true"
                    :max-length="cardNumber.MaxLength"
                    :min-length="cardNumber.MinLength"
                    :placeholder="cardNumber.Placeholder"
                    :tailwind-mods="$v.cardNumberValue.$error ? '-isInvalid' : null"
                    :value="getInitialValue(cardNumber, 'CardNumber', cardNumberValue)"
                    :card-options="cardOptions"
                    @input="updateModel('cardNumberValue')"
                    @blur="handleBlur('cardNumberValue')"
                    @card-number-error="handleCardNumber">
                </input-card-number>
                <div v-if="$v.cardNumberValue.$error" :id="`${cardNumber.Id}-error`" class="e-formError">
                    <p class="e-formError__item" role="alert" v-html="getFieldError('CardNumber')"></p>
                </div>
            </div>
            <div v-else class="m-formField -text" :class="{'m-payForm__field': isEditing}">
                <h2
                    class="m-formField__label"
                    :for="cardNumber.Id"
                    v-html="getLabels('Labels.Card.CardNumber', cardNumber.Label)">
                </h2>
                <input-card-number-pseudo
                    :is-cn="true"
                    :card-options="cardOptions"
                    :value="getInitialValue(cardNumber, 'CardNumber', cardNumberValue)"
                    :brand-static="brandStatic">
                </input-card-number-pseudo>
            </div>
        </div>

        <!-- Melaleuca accepts text: -->
        <div class="m-payForm__cards -isCn">{{ getLabels('Labels.Card.CreditAccepts', cardTitle) }}</div>

        <div class="m-payForm__rowGroup">
            <div class="m-payForm__row flex to-xl:w-full">
                <div class="m-payForm__col -isCn pr-10 to-xl:w-1_2">
                    <!-- Expiration Month Field -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label"
                            :for="expMonth.Id"
                            v-html="getLabels('Labels.Card.Expiration', expMonth.Label)">
                        </label>
                        <v-select
                            v-if="localization && localization.Labels"
                            :id="expMonth.Id"
                            ref="expMonth"
                            class="w-full"
                            vmodel="expMonthValue"
                            :options="selectOptionsLabels(expMonthOptions)"
                            :values="selectOptionsValues(expMonthOptions)"
                            :aria-label="expMonthLabel"
                            :select-mod="expMonth.SelectMod"
                            :select-element-mod="$v.expMonthValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('ExpirationDate')) ? '-error' : null"
                            :initial="getInitialValue(expMonth, 'ExpMonth', expMonthValue)"
                            :name="expMonth.Name"
                            :arrow-direction="expMonth.Arrow.Direction || null"
                            :arrow-size="expMonth.Arrow.Size || null"
                            :arrow-tailwind-color="expMonth.Arrow.TailwindColor || null"
                            :arrow-other-mods="expMonth.Arrow.OtherMods || null"
                            @change="updateModel"
                            @blur="[handleBlur('expMonthValue')]">
                        </v-select>
                        <div v-if="$v.expMonthValue.$error" :id="`${expMonth.Id}-error`" class="e-formError">
                            <p v-if="getFieldError('ExpirationMonth')" class="e-formError__item" :class="!$v.expMonthValue.allowed ? '-keepAll' : ''" role="alert" v-html="getFieldError('ExpirationMonth')"></p>
                        </div>
                    </div>
                </div>

                <div class="m-payForm__col -isCn pt-25 mt-1 to-xl:w-1_2 to-xl:pr-0">
                    <!-- Expiration Year Field -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label -hidden"
                            :for="expYear.Id"
                            v-html="getLabels('Labels.Card.Expiration', expYear.Label)">
                        </label>
                        <v-select
                            v-if="localization && localization.Labels"
                            :id="expYear.Id"
                            ref="expYear"
                            class="w-full"
                            vmodel="expYearValue"
                            :options="selectOptionsLabels(expYearOptions)"
                            :values="selectOptionsValues(expYearOptions)"
                            :aria-label="expYearLabel"
                            :select-mod="expYear.SelectMod"
                            :select-element-mod="$v.expYearValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('ExpirationDate')) ? '-error' : null"
                            :initial="getInitialValue(expYear, 'ExpYear', expYearValue)"
                            :name="expYear.Name"
                            :arrow-direction="expYear.Arrow.Direction || null"
                            :arrow-size="expYear.Arrow.Size || null"
                            :arrow-tailwind-color="expYear.Arrow.TailwindColor || null"
                            :arrow-other-mods="expYear.Arrow.OtherMods || null"
                            @change="updateModel"
                            @blur="[handleBlur('expMonthValue'), handleBlur('expYearValue')]">
                        </v-select>
                        <div v-if="$v.expYearValue.$error && !$v.expYearValue.required" :id="`${expYear.Id}-error`" class="e-formError">
                            <p v-if="getFieldError('ExpirationYear')" class="e-formError__item" role="alert" v-html="getFieldError('ExpirationYear')"></p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters } from 'vuex';
    import cardNumber from '@common/source/js/vue/utils/card-number';
    import eventBus from '../../../mixins/event-bus';
    import paymentFormMixin from '../../../mixins/payment-form';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import { validationMixin } from 'vuelidate';
    import { integer, required } from 'vuelidate/lib/validators';

    export default {
        name: 'PaymentFormCreditCn',
        components: {
            vInput
        },
        mixins: [ paymentFormMixin, validationMixin ],
        validations() {
            return {
                // Cardholder Validation Settings
                cardHolderValue: {
                    required,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.cardHolder.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.cardHolder.MaxLength;
                    }
                },

                // CardNumber Validation Settings
                cardNumberValue: {
                    required,
                    integer,
                    allowed: value => {
                        return !this.cardNumberNotAllowed;
                    },
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.cardNumber.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.cardNumber.MaxLength;
                    }
                },

                // ExpMonth Validation Settings
                expMonthValue: {
                    required,
                    allowed: value => {
                        if(value === null) return false;
                        if(this.expYearValue !== null && this.expYearValue <= this.currentYearValue) return value >= this.currentMonthValue;
                        return value !== null;
                    }
                },

                // ExpYear Validation Settings
                expYearValue: {
                    required,
                    allowed: value => {
                        if(value === null) return false;
                        if(this.expMonthValue !== null && value <= this.currentYearValue) return this.expMonthValue >= this.currentMonthValue;
                        return value !== null;
                    }
                }
            };
        },
        props: {
            cardTitle: {
                type: String,
                default: 'Melaleuca Accepts:'
            },
            cardHolder: {
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
                        Label: 'CARDHOLDER NAME'
                    };
                }
            },
            cardNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'ccn',
                        Name: 'ccn',
                        MinLength: 14,
                        MaxLength: 19,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'CARD NUMBER'
                    };
                }
            },
            expMonth: {
                type: Object,
                default: function() {
                    return {
                        Id: 'select-expmonth',
                        Name: 'expmonth',
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm to-xl:w-full',
                        Label: 'EXPIRATION',
                        Arrow: {
                            Direction: '-down',
                            Size: '-sm',
                            OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-10 pointer-events-none',
                            TailwindColor: 'gray'
                        }
                    };
                }
            },
            expYear: {
                type: Object,
                default: function() {
                    return {
                        Id: 'select-expyear',
                        Name: 'expyear',
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm to-xl:w-full',
                        Label: 'Expiration year',
                        Arrow: {
                            Direction: '-down',
                            Size: '-sm',
                            OtherMods: '-filled -shadow w-0 h-0 absolute right-15 top-10 pointer-events-none',
                            TailwindColor: 'gray'
                        }
                    };
                }
            }
        },
        data() {
            return {
                cardNumberNotAllowed: false,
                cardHolderValue: '',
                cardNumberValue: null,
                cardNumberType: null,
                expMonthValue: null,
                expYearValue: null,
                cardType: {
                    type: Object,
                    default: function() {
                        return {
                            Id: 'cardtype',
                            Name: 'cardtype',
                            Placeholder: null,
                            Value: 'UnionPayCard',
                            Label: 'CARDTYPE NAME'
                        };
                    }
                },
                currentMonthValue: null,
                currentYearValue: null
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedPayMethod', 'storedCountryInfo', 'storedDefaultAddress']),
            ...mapGetters('paymentMethod', ['cardOptions']),

            expMonthOptions() {
                const placeholder = this.getLabels('Labels.Card.Month', 'Month');
                return cardNumber.getCardMonth(placeholder);
            },
            expYearOptions() {
                const placeholder = this.getLabels('Labels.Card.Year', 'Year');
                return cardNumber.getCardYear(placeholder);
            },
            expMonthLabel() {
                const expiration = this.getLabels('Labels.Card.Expiration', 'Expiration');
                const month = this.getLabels('Labels.Card.Month', 'Month');
                return `${expiration} ${month}`;
            },
            expYearLabel() {
                const expiration = this.getLabels('Labels.Card.Expiration', 'Expiration');
                const year = this.getLabels('Labels.Card.Year', 'Year');
                return `${expiration} ${year}`;
            }
        },
        watch: {
            storedPayMethod: {
                deep: true,
                handler() {
                    // Get values from Store
                    if(this.storedPayMethod && this.storedPayMethod.PayMethodId) {
                        const expirationDate = this.storedPayMethod.ExpirationDate.substring(0, 10).split('-');

                        this.cardHolderValue = this.storedPayMethod.NameOnAccount;
                        this.cardNumberValue = '000000000000' + this.storedPayMethod.LastFourDigitsOfAccount;
                        this.expMonthValue = expirationDate[1];
                        this.handleExpMonth();
                        this.expYearValue = expirationDate[0];
                        this.handleExpYear();
                        this.brandStatic = this.cardOptions.find(card => card.Name === this.storedPayMethod.PayMethodType);
                        this.cardNumberType = this.storedPayMethod.PayMethodType;
                        this.handleCardNumber({
                            error: false,
                            brand: this.storedPayMethod.PayMethodType
                        });
                    }
                }
            }
        },
        mounted() {
            this.currentMonthValue = new Date().getMonth() + 1;
            this.currentYearValue = new Date().getFullYear();
            this.$nextTick(() => {
                this.setDefaultAddress();
                this.setDefaultCustomerName();
            });
        },
        methods: {
            ...mapActions('paymentMethod', ['getDefaultAddress']),

            getInitialValue(prop, store, current) {
                if(prop.Value) {
                    return prop.Value;
                }

                return this.isEditing && this.storedPayMethod ? current : null;
            },
            handleCardNumber(payload) {
                this.cardNumberNotAllowed = payload.error;
                this.cardNumberType = payload.brand;

                eventBus.$emit('update-payment-form', {
                    model: 'cardNumberType',
                    value: this.cardNumberType
                });
            },
            handleExpMonth() {
                eventBus.$emit('update-payment-form', {
                    model: 'expMonthValue',
                    value: this.expMonthValue
                });
            },
            handleExpYear() {
                eventBus.$emit('update-payment-form', {
                    model: 'expYearValue',
                    value: this.expYearValue
                });
            },
            async setDefaultAddress() {
                // If it's adding a new pay method and it's not MX
                if(!this.isEditing && !this.paymentId && !this.isMX) {
                    // Get default shipping address
                    await this.getDefaultAddress();
                }
            },
            setDefaultCustomerName() {
                // If it's adding a new pay method
                if(!this.isEditing && !this.paymentId && !this.cardHolderValue) {
                    this.cardHolderValue = this.defaultCustomerName;
                }
            }
        }
    };
</script>

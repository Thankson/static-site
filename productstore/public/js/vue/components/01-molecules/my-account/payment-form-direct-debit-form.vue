<template>
    <div class="m-directDebitForm">
        <!-- Card Holder Field -->
        <div class="m-formField -text">
            <label
                class="m-formField__label text-xs md:text-sm"
                :for="cardHolder.Id"
                v-html="getLabels('Labels.Card.CardholderName')">
            </label>
            <v-input
                :id="cardHolder.Id"
                ref="cardHolder"
                v-model="cardHolderValue"
                auto-complete="off"
                :name="cardHolder.Name"
                :max-length="cardHolder.MaxLength"
                :min-length="cardHolder.MinLength"
                :tailwind-mods="$v.cardHolderValue.$error ? '-isInvalid' : null"
                :aria-describedby="$v.cardHolderValue.$error ? 'cardholdername-error' : null"
                :value="getInitialValue(cardHolder, 'CardHolderName', cardHolderValue)"
                class="text-sm md:text-base"
                @input="updateModel('cardHolderValue')"
                @blur="handleBlur('cardHolderValue')">
            </v-input>

            <div v-if="$v.cardHolderValue.$error" class="e-formError__item" aria-live="assertive">
                <p v-if="!$v.cardHolderValue.required">
                    {{ getLabels('Labels.ErrorMessages.NameOnAccount.Required', '') }}
                </p>
                <p v-else-if="!$v.cardHolderValue.allowed">
                    {{ getLabels('Labels.ErrorMessages.NameOnAccount.Invalid', 'Name on Account is Invalid') }}
                </p>
                <p v-else-if="!$v.cardHolderValue.min">
                    {{ getLabels('Labels.ErrorMessages.NameOnAccount.MinLength', '') }}
                </p>
                <p v-else-if="!$v.cardHolderValue.max">
                    {{ getLabels('Labels.ErrorMessages.NameOnAccount.MaxLength', '') }}
                </p>
            </div>
        </div>

        <!-- Routing Number or (SWIFT/BIC code for SEPA-Europe countries)-->
        <div v-if="isSepa" class="m-formField -text">
            <label
                class="m-formField__label text-xs md:text-sm"
                :for="routingNumber.Id"
                v-html="getLabels('Labels.DirectDebit.RoutingNumber')">
            </label>
            <v-input
                :id="routingNumber.Id"
                ref="routingNumber"
                v-model="routingNumberValue"
                auto-complete="off"
                :name="routingNumber.Name"
                :max-length="routingNumber.MaxLength"
                :min-length="routingNumber.MinLength"
                model-name="routingNumberValue"
                :tailwind-mods="$v.routingNumberValue.$error ? '-isInvalid' : null"
                :aria-describedby="$v.routingNumberValue.$error ? 'routingNumberValue-error' : null"
                :value="getInitialValue(routingNumber, 'routingNumber', 'routingNumberValue', routingNumberValue)"
                class="text-sm md:text-base"
                @input="updateModel('routingNumberValue')"
                @blur="handleBlur('routingNumberValue')"
            >
            </v-input>
            <div v-if="$v.routingNumberValue.$error" class="e-formError__item" aria-live="assertive">
                <p v-if="!$v.routingNumberValue.required">
                    {{ getLabels('Labels.ErrorMessages.RoutingNumber.Required', '') }}
                </p>
                <p v-else-if="!$v.routingNumberValue.min">
                    {{ getLabels('Labels.ErrorMessages.RoutingNumber.MinLength', '') }}
                </p>
                <p v-else-if="!$v.routingNumberValue.max">
                    {{ getLabels('Labels.ErrorMessages.RoutingNumber.MaxLength', '') }}
                </p>
            </div>
        </div>

        <!-- Bank Field - currently for MX only -->
        <div v-else class="m-formField">
            <label
                class="m-formField__label uppercase"
                :for="bank.Id"
                v-html="getLabels('Labels.DirectDebit.Bank', bank.Label)">
            </label>

            <v-select
                :id="bank.Id"
                ref="bank"
                vmodel="bankValue"
                :options="bankLabels"
                :aria-invalid="$v.bankValue.$error"
                :values="bankValues"
                :aria-label="bank.Label"
                :select-mod="bank.SelectMod"
                :select-element-mod="`py-10 px-15 ${$v.bankValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('ExpirationDate')) ? '-error' : ''}`"
                :initial="bankValue"
                :name="bank.Name"
                :arrow-direction="bank.Arrow.Direction || null"
                :arrow-size="bank.Arrow.Size || null"
                :arrow-tailwind-color="bank.Arrow.TailwindColor || null"
                :arrow-other-mods="bank.Arrow.OtherMods || null"
                @change="updateModel"
                @blur="handleBlur('bankValue')">
            </v-select>

            <div v-if="$v.bankValue.$error" class="e-formError__item" aria-live="assertive">
                <p v-if="!$v.bankValue.required">
                    {{ getLabels('Labels.ErrorMessages.Bank.Required', '') }}
                </p>
            </div>

        </div>

        <!-- Account Number Field -->
        <div class="m-formField -text">
            <label
                class="m-formField__label text-xs md:text-sm"
                :for="accountNumber.Id"
                v-html="getLabels('Labels.DirectDebit.AccountNumber')">
            </label>
            <v-input
                :id="accountNumber.Id"
                ref="accountNumber"
                v-model="accountNumberValue"
                auto-complete="off"
                model-name="accountNumberValue"
                :max-length="accountNumber.MaxLength"
                :min-length="accountNumber.MinLength"
                :tailwind-mods="$v.accountNumberValue.$error ? '-isInvalid' : null"
                :aria-describedby="$v.accountNumberValue.$error ? 'accountnumber-error' : false"
                :value="getInitialValue(accountNumber, 'AccountNumber', 'accountNumberValue', accountNumberValue)"
                class="text-sm md:text-base"
                @input="updateModel('accountNumberValue')"
                @blur="handleBlur('accountNumberValue')"
            >
            </v-input>
            <div v-if="$v.accountNumberValue.$error" class="e-formError__item" aria-live="assertive">
                <p v-if="!$v.accountNumberValue.required">
                    {{ getLabels('Labels.ErrorMessages.AccountNumber.Required', '') }}
                </p>
                <p v-else-if="!$v.accountNumberValue.integer">
                    {{ getLabels('Labels.ErrorMessages.AccountNumber.Integer', '') }}
                </p>
                <p v-else-if="!$v.accountNumberValue.min">
                    {{ getLabels('Labels.ErrorMessages.AccountNumber.MinLength', '') }}
                </p>
                <p v-else-if="!$v.accountNumberValue.max">
                    {{ getLabels('Labels.ErrorMessages.AccountNumber.MaxLength', '') }}
                </p>
            </div>
        </div>
        <p
            v-if="formAccess"
            class="text-gray-160 mb-15"
            v-html="formAccess"
        />
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import paymentFormMixin from '../../../mixins/payment-form';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import { validationMixin } from 'vuelidate';
    import { integer, required } from 'vuelidate/lib/validators';

    export default {
        name: 'PaymentFormDirectDebitForm',
        components: {
            vInput
        },
        mixins: [paymentFormMixin, validationMixin ],
        validations() {
            return {
                // Account Number Validation Settings
                accountNumberValue: {
                    required,
                    ...(!this.isSepa && { integer }),
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.accountNumber.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.accountNumber.MaxLength;
                    }
                },

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

                // Bank Validation Settings - currently only for MX
                ...(!this.isSepa && {
                    bankValue: {
                        required,
                        integer
                    }
                }),
                // Rounting Number Validation Settings - for SEPA
                ...(this.isSepa && {
                    routingNumberValue: {
                        required,
                        min: value => {
                            if(value === null) return false;
                            return value.length >= this.routingNumber.MinLength;
                        },
                        max: value => {
                            if(value === null) return false;
                            return value.length <= this.routingNumber.MaxLength;
                        }
                    }
                })
            };
        },

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
            bank: {
                type: Object,
                default() {
                    return {
                        Id: 'bank',
                        Name: 'bank',
                        Value: null,
                        ValidationAlert: 'Required',
                        SelectMod: '-bg-transparent -sm-md w-full',
                        Label: 'Bank',
                        Arrow: {
                            Direction: '-down',
                            Size: '-md',
                            OtherMods: 'absolute right-15 top-15 pointer-events-none',
                            TailwindColor: 'gray'
                        }
                    };
                }
            },
            cardHolder: {
                type: Object,
                default: function() {
                    return {
                        Id: 'cardholder',
                        Name: 'cardholder',
                        MinLength: 1,
                        MaxLength: 100,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm-md w-full',
                        Label: 'CARDHOLDER NAME'
                    };
                }
            },
            isSepa: {
                type: Boolean,
                default: false
            },
            routingNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'routingnum',
                        Name: 'routingnum',
                        MinLength: 8,
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
                bankValue: null,
                cardHolderValue: '',
                routingNumberValue: ''
            };
        },
        computed: {
            ...mapState('paymentMethod', ['storedApiLoading', 'storedBanks']),

            bankLabels() {
                return [
                    this.getLabels('Labels.DirectDebit.Bank', 'Bank'),
                    ...this.storedBanks.map(({ Name }) => Name)
                ];
            },
            bankValues() {
                return [
                    null,
                    ...this.storedBanks.map(({ Id }) => Id)
                ];
            },
            formAccess() {
                return this.getLabels('Data.DirectDebit.FormAccess', '');
            }
        },
        mounted() {
            if(!this.storedBanks.length) {
                this.getBanks(this.$env.Country);
            }
            this.$nextTick(() => {
                this.cardHolderValue = this.defaultCustomerName;
            });
        },
        methods: {
            ...mapActions('paymentMethod', ['getBanks'])

        }
    };
</script>

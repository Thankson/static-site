<template>
    <!-- Checkout - Direct debit- Form-Submit view -->
    <div class="m-payForm">
        <div class="m-payForm__rowGroup">
            <div class="m-formField -text">
                <label
                    class="m-formField__label uppercase"
                    :for="nameOnAccount.Id"
                    v-html="getLabels('Labels.DirectDebit.NameOnAccount', nameOnAccount.Label)">
                </label>

                <input-basic
                    :id="nameOnAccount.Id"
                    ref="nameOnAccount"
                    v-model="nameOnAccountValue"
                    auto-complete="off"
                    :name="nameOnAccount.Name"
                    :max-length="nameOnAccount.MaxLength"
                    :min-length="nameOnAccount.MinLength"
                    :placeholder="getLabels('Labels.DirectDebit.NameOnAccount', nameOnAccount.Placeholder)"
                    :tailwind-mods="$v.nameOnAccountValue.$error ? '-isInvalid' : null"
                    :aria-invalid="$v.nameOnAccountValue.$error"
                    :aria-describedby="$v.nameOnAccountValue.$error ? nameOnAccountErrorId : false"
                    class="to-md:text-sm"
                    @input="updateModel('nameOnAccountValue')"
                    @blur="handleBlur('nameOnAccountValue')"
                />

                <div
                    v-if="$v.$dirty && $v.nameOnAccountValue.$invalid"
                    :id="nameOnAccountErrorId"
                    class="text-sm text-red mt-5">
                    <span
                        v-if="!$v.nameOnAccountValue.required"
                        v-html="getLabels('Labels.ErrorMessages.NameOnAccount.Required', nameOnAccount.ValidationAlert)"
                    />

                    <span
                        v-else-if="!$v.nameOnAccountValue.allowed"
                        v-html="getLabels('Labels.ErrorMessages.NameOnAccount.Invalid', nameOnAccount.ValidationAlert)"
                    />
                </div>
            </div>
        </div>

        <div class="m-payForm__rowGroup -half">
            <div class="m-formField -text md:max-w-1_2 md:pr-15">
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
                    :aria-describedby="$v.bankValue.$error ? bankErrorId : false"
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

                <div
                    v-if="$v.$dirty && $v.bankValue.$invalid"
                    :id="bankErrorId"
                    class="text-sm text-red mt-5"
                    v-html="getLabels('Labels.ErrorMessages.Bank.Required', bank.ValidationAlert)"
                />
            </div>

            <div class="m-formField -text md:max-w-1_2 md:pl-15">
                <label
                    class="m-formField__label uppercase"
                    :for="accountNumber.Id"
                    v-html="getLabels('Labels.DirectDebit.AccountNumber', accountNumber.Label)">
                </label>

                <input-basic
                    :id="accountNumber.Id"
                    ref="accountNumber"
                    v-model="accountNumberValue"
                    auto-complete="off"
                    :name="accountNumber.Name"
                    :max-length="accountNumber.MaxLength"
                    :min-length="accountNumber.MinLength"
                    model-name="accountNumberValue"
                    :placeholder="getLabels('Labels.DirectDebit.AccountNumber', accountNumber.Placeholder)"
                    :tailwind-mods="$v.accountNumberValue.$error ? '-isInvalid' : null"
                    :aria-invalid="$v.accountNumberValue.$error"
                    :aria-describedby="$v.accountNumberValue.$error ? accountNumberErrorId : false"
                    :value="accountNumber.Value"
                    class="to-md:text-sm"
                    @input="updateModel('accountNumberValue')"
                    @blur="handleBlur('accountNumberValue')"
                    @keydown="handleInteger"
                />

                <div
                    v-if="$v.$dirty && $v.accountNumberValue.$invalid"
                    :id="accountNumberErrorId"
                    class="text-sm text-red mt-5">

                    <span
                        v-if="!$v.accountNumberValue.required"
                        v-html="getLabels('Labels.ErrorMessages.AccountNumber.Required', accountNumber.ValidationAlert)"
                    />

                    <span
                        v-else-if="!$v.accountNumberValue.integer"
                        v-html="getLabels('Labels.ErrorMessages.AccountNumber.Integer', accountNumber.ValidationAlert)"
                    />

                    <span
                        v-else-if="!$v.accountNumberValue.min"
                        v-html="getLabels('Labels.ErrorMessages.AccountNumber.MinLength', accountNumber.ValidationAlert)"
                    />
                </div>
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
    import { validationMixin } from 'vuelidate';
    import { integer, maxLength, minLength, required } from 'vuelidate/lib/validators';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';
    import paymentFormMixin from '../../../mixins/payment-form';
    import formHelper from '@common/source/js/vue/utils/form-helper';

    export default {
        name: 'CheckoutPaymentFormDirectDebit',
        mixins: [ localizationMixin, paymentFormMixin, safeIdMixin, validationMixin ],
        safeIds: [
            'accountNumberErrorId',
            'bankErrorId',
            'nameOnAccountErrorId'
        ],
        validations() {
            return {
                accountNumberValue: {
                    required,
                    integer,
                    max: maxLength(this.accountNumber.MaxLength),
                    min: minLength(this.accountNumber.MinLength)
                },
                bankValue: {
                    required
                },
                nameOnAccountValue: {
                    required,
                    allowed: value => formHelper.isValidTextInput(value),
                    max: maxLength(this.nameOnAccount.MaxLength),
                    min: minLength(this.nameOnAccount.MinLength)
                }
            };
        },
        props: {
            dirty: {
                type: Boolean,
                default: false
            },

            // payment form fields
            accountNumber: {
                type: Object,
                default() {
                    return {
                        Id: 'accountNumber',
                        Name: 'accountNumber',
                        MinLength: 16,
                        MaxLength: 18,
                        Placeholder: 'Account Number',
                        Value: null,
                        ValidationAlert: 'Required',
                        Label: 'Account Number'
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
            nameOnAccount: {
                type: Object,
                default() {
                    return {
                        Id: 'nameOnAccount',
                        Name: 'nameOnAccount',
                        MinLength: 1,
                        MaxLength: 100,
                        Placeholder: 'Name on Account',
                        Value: null,
                        ValidationAlert: 'Required',
                        Label: 'Name on Account'
                    };
                }
            }
        },
        data() {
            return {
                accountNumberValue: null,
                bankValue: null,
                nameOnAccountValue: null,

                // safe ids
                accountNumberErrorId: '',
                bankErrorId: '',
                nameOnAccountErrorId: ''
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

            if(!this.storedBanks.length) {
                this.getBanks(this.$env.Country);
            }

            this.$nextTick(() => {
                this.nameOnAccountValue = this.defaultCustomerName;
            });
        },
        methods: {
            ...mapActions('paymentMethod', ['getBanks']),

            emitValidate() {
                this.$emit('validate', this.$v.$invalid);
            }
        }
    };
</script>

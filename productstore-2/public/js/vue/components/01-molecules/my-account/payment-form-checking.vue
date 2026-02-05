<template>
    <div class="m-payForm">
        <div :class="{ 'm-payForm__rowGroup -half': isRiverbendSubscription }">
            <div class="m-payForm__row">
                <!-- Account Holder Field -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label to-md:text-xs"
                        :for="accountHolder.Id"
                        v-html="getLabels('Labels.Checking.NameOnAccount', accountHolder.Label)">
                    </label>
                    <v-input
                        :id="accountHolder.Id"
                        ref="accountHolder"
                        v-model="accountHolderValue"
                        auto-complete="off"
                        :name="accountHolder.Name"
                        :max-length="accountHolder.MaxLength"
                        :min-length="accountHolder.MinLength"
                        :placeholder="accountHolder.Placeholder"
                        :tailwind-mods="$v.accountHolderValue.$error ? '-isInvalid' : null"
                        :aria-describedby="$v.accountHolderValue.$error ? 'nameonaccount-error' : false"
                        :value="getInitialValue(accountHolder, 'NameOnAccount', 'accountHolderValue', accountHolderValue)"
                        class="to-md:text-sm"
                        @input="updateModel('accountHolderValue')"
                        @blur="handleBlur('accountHolderValue')">
                    </v-input>
                    <div
                        v-if="$v.accountHolderValue.$error" class="e-formError__item"
                        :class="{ '-rbAddress': isRiverbendSubscription }"
                        data-testid="container-addNewPaymentFieldErrorChecking"
                    >
                        <p v-if="!$v.accountHolderValue.required">
                            {{ getLabels('Labels.ErrorMessages.NameOnAccount.Required', '') }}
                        </p>
                        <p v-else-if="!$v.accountHolderValue.allowed">
                            {{ getLabels('Labels.ErrorMessages.NameOnAccount.Invalid', 'Name on Account is Invalid') }}
                        </p>
                        <p v-else-if="!$v.accountHolderValue.min">
                            {{ getLabels('Labels.ErrorMessages.NameOnAccount.MinLength', '') }}
                        </p>
                        <p v-else-if="!$v.accountHolderValue.max">
                            {{ getLabels('Labels.ErrorMessages.NameOnAccount.MaxLength', '') }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="m-payForm__row">
                <!-- Account Type Field -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label to-md:text-xs"
                        :for="accountType.Id"
                        v-html="getLabels('Labels.Checking.AccountType', accountType.Label)">
                    </label>
                    <v-select
                        v-if="localization && localization.Labels"
                        :id="accountType.Id"
                        ref="accountType"
                        vmodel="accountTypeValue"
                        :options="selectOptionsLabels(accountOptions)"
                        :aria-describedby="$v.accountTypeValue.$error ? 'accounttype-error' : false"
                        :values="selectOptionsValues(accountOptions)"
                        :aria-label="getLabels('Labels.Checking.AccountType', accountType.Label)"
                        :select-mod="accountType.SelectMod"
                        :select-element-mod="`py-10 px-15 ${$v.accountTypeValue.$error ? '-error' : ''}`"
                        :initial="getInitialValue(accountType, 'AccountType', 'accountTypeValue', accountTypeValue)"
                        :name="accountType.Name"
                        :arrow-direction="accountType.Arrow.Direction || null"
                        :arrow-size="accountType.Arrow.Size || null"
                        :arrow-tailwind-color="accountType.Arrow.TailwindColor || null"
                        :arrow-other-mods="accountType.Arrow.OtherMods || null"
                        @change="updateModel"
                        @blur="handleBlur('accountTypeValue')">
                    </v-select>
                    <div
                        v-if="$v.accountTypeValue.$error" class="e-formError__item"
                        :class="{ '-rbAddress': isRiverbendSubscription }"
                        data-testid="container-addNewPaymentFieldErrorChecking"
                    >
                        <p v-if="!$v.accountTypeValue.required">
                            {{ getLabels('Labels.ErrorMessages.AccountType.Required', '') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div :class="{ 'm-payForm__rowGroup -half': isRiverbendSubscription }">
            <div class="m-payForm__row">
                <!-- Routing Number Field -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label to-md:text-xs"
                        :for="routingNumber.Id"
                        v-html="getLabels('Labels.Checking.RoutingNumber', routingNumber.Label)">
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
                        :placeholder="routingNumber.Placeholder"
                        :tailwind-mods="$v.routingNumberValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('InvalidRoutingNumber')) ? '-isInvalid' : null"
                        :aria-describedby="$v.routingNumberValue.$error ? 'routingnumber-error' : false"
                        :value="getInitialValue(routingNumber, 'RoutingNumber', 'routingNumberValue', routingNumberValue)"
                        class="to-md:text-sm"
                        @input="updateModel('routingNumberValue')"
                        @blur="handleBlur('routingNumberValue')"
                        @keydown="handleInteger">
                    </v-input>
                    <div
                        v-if="$v.routingNumberValue.$error" class="e-formError__item"
                        :class="{ '-rbAddress': isRiverbendSubscription }"
                        data-testid="container-addNewPaymentFieldErrorChecking"
                    >
                        <p v-if="!$v.routingNumberValue.required">
                            {{ getLabels('Labels.ErrorMessages.RoutingNumber.Required', '') }}
                        </p>
                        <p v-else-if="!$v.routingNumberValue.integer">
                            {{ getLabels('Labels.ErrorMessages.RoutingNumber.Integer', '') }}
                        </p>
                        <p v-else-if="!$v.routingNumberValue.min">
                            {{ getLabels('Labels.ErrorMessages.RoutingNumber.MinLength', '') }}
                        </p>
                        <p v-else-if="!$v.routingNumberValue.max">
                            {{ getLabels('Labels.ErrorMessages.RoutingNumber.MaxLength', '') }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="m-payForm__row">
                <!-- Account Number Field -->
                <div class="m-formField -text">
                    <label
                        class="m-formField__label to-md:text-xs"
                        :for="accountNumber.Id"
                        v-html="getLabels('Labels.Checking.AccountNumber', accountNumber.Label)">
                    </label>
                    <v-input
                        :id="accountNumber.Id"
                        ref="accountNumber"
                        v-model="accountNumberValue"
                        auto-complete="off"
                        :name="accountNumber.Name"
                        :max-length="accountNumber.MaxLength"
                        :min-length="accountNumber.MinLength"
                        model-name="accountNumberValue"
                        :placeholder="accountNumber.Placeholder"
                        :tailwind-mods="$v.accountNumberValue.$error ? '-isInvalid' : null"
                        :aria-describedby="$v.accountNumberValue.$error ? 'accountnumber-error' : false"
                        :value="getInitialValue(accountNumber, 'AccountNumber', 'accountNumberValue', accountNumberValue)"
                        class="to-md:text-sm"
                        @input="updateModel('accountNumberValue')"
                        @blur="handleBlur('accountNumberValue')"
                        @keydown="handleInteger">
                    </v-input>
                    <div
                        v-if="$v.accountNumberValue.$error" class="e-formError__item"
                        :class="{ '-rbAddress': isRiverbendSubscription }"
                        data-testid="container-addNewPaymentFieldErrorChecking"
                    >
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
            </div>
        </div>

        <ExampleCheck v-if="isRiverbendSubscription" />
    </div>
</template>

<script>
    import paymentFormMixin from '../../../mixins/payment-form';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import ExampleCheck from '../example-check/example-check.vue';
    import { validationMixin } from 'vuelidate';
    import { integer, required } from 'vuelidate/lib/validators';
    import { mapState } from 'vuex';
    import formHelper from '@common/source/js/vue/utils/form-helper';

    export default {
        name: 'PaymentFormChecking',
        components: {
            ExampleCheck,
            vInput
        },
        mixins: [ paymentFormMixin, validationMixin ],
        validations() {
            return {
                // Account Holder Validation Settings
                accountHolderValue: {
                    required,
                    allowed: value => {
                        return formHelper.isValidTextInput(value);
                    },
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.accountHolder.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.accountHolder.MaxLength;
                    }
                },

                // Account Type Validation Settings
                accountTypeValue: {
                    required
                },

                // Rounting Number Validation Settings
                routingNumberValue: {
                    required,
                    integer,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.routingNumber.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.routingNumber.MaxLength;
                    }
                },

                // Account Number Validation Settings
                accountNumberValue: {
                    required,
                    integer,
                    min: value => {
                        if(value === null) return false;
                        return value.length >= this.accountNumber.MinLength;
                    },
                    max: value => {
                        if(value === null) return false;
                        return value.length <= this.accountNumber.MaxLength;
                    }
                }
            };
        },
        props: {
            accountHolder: {
                type: Object,
                default: function() {
                    return {
                        Id: 'accountholder',
                        Name: 'accountholder',
                        MinLength: 1,
                        MaxLength: 100,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'NAME ON ACCOUNT'
                    };
                }
            },
            accountType: {
                type: Object,
                default: function() {
                    return {
                        Id: 'select-accounttype',
                        Name: 'accounttype',
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        SelectMod: '-bg-transparent -sm-md w-full',
                        Label: 'ACCOUNT TYPE',
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
                        MinLength: this.$env.Country === 'Canada' ? 8 : 9,
                        MaxLength: 9,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'ROUTING NUMBER'
                    };
                }
            },
            accountNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'accountnum',
                        Name: 'accountnum',
                        MinLength: 4,
                        MaxLength: 17,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'ACCOUNT NUMBER'
                    };
                }
            },
            isEnrollment: {
                type: Boolean,
                default: false
            },
            isGuestCheckout: {
                type: Boolean,
                default: false
            },
            rbIsEditing: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                accountHolderValue: '',
                accountTypeValue: null,
                routingNumberValue: '',
                accountNumberValue: '',
                paymentMethod: null
            };
        },
        computed: {
            ...mapState('riverbendSubscription', ['isRiverbendSubscription']),
            accountOptions() {
                let accountOptions = [];

                if(this.accountType.Options && this.accountType.Options.length) {
                    accountOptions = this.accountType.Options;
                }

                accountOptions = [
                    {
                        Label: this.getLabels('Labels.Checking.AccountTypes.Select', 'Select'),
                        Value: null
                    },
                    {
                        Label: this.getLabels('Labels.Checking.AccountTypes.Checking', 'Checking'),
                        Value: 'ACHChecking'
                    },
                    {
                        Label: this.getLabels('Labels.Checking.AccountTypes.Savings', 'Savings'),
                        Value: 'ACHSavings'
                    }
                ];

                return accountOptions;
            },
            isGuestOrEnrollment() {
                return this.isGuestCheckout || this.isEnrollment;
            }
        },
        watch: {
            paymentMethod: {
                deep: true,
                handler() {
                    if(this.isEditing && this.paymentMethod.PayMethodId) {
                        this.accountHolderValue = this.paymentMethod.NameOnAccount;
                        this.accountTypeValue = this.paymentMethod.PayMethodType;
                        this.routingNumberValue = this.paymentMethod.RoutingNumber;
                        this.accountNumberValue = this.paymentMethod.LastFourDigitsOfAccount; // TODO
                    }
                }
            }
        },
        mounted() {
            this.paymentMethod = this.storedPayMethod;

            this.$nextTick(() => {
                this.setDefaultCustomerName();
            });
        },
        methods: {
            getInitialValue(prop, store, model, current) {
                if(prop.Value) {
                    return prop.Value;
                }

                let value = null;

                if((this.isEditing && this.storedPayMethod) || this.rbIsEditing) {
                    this[model] = current;
                    value = current;
                }

                return value;
            },
            setDefaultCustomerName() {
                // If it's adding a new pay method
                if(!this.isEditing && !this.paymentId && !this.accountHolderValue) {
                    this.accountHolderValue = this.defaultCustomerName;
                }
            },
            setValues({ accountHolder, accountType, routingNumber, accountNumber }) {
                this.accountHolderValue = accountHolder;
                this.accountTypeValue = accountType;
                this.routingNumberValue = routingNumber;
                this.accountNumberValue = accountNumber;
            }
        }
    };
</script>

<template>
    <div class="m-payForm">
        <div class="m-payForm__rowGroup">
            <!-- Account Holder Field -->
            <div class="m-formField -text md:max-w-1_2 md:pr-15">
                <label
                    class="m-formField__label uppercase"
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
                    :placeholder="getLabels('Labels.Checking.NameOnAccount', accountHolder.Placeholder)"
                    :tailwind-mods="$v.accountHolderValue.$error ? '-isInvalid' : null"
                    :aria-invalid="$v.accountHolderValue.$error"
                    :aria-describedby="$v.accountHolderValue.$error ? accountHolderErrorId : false"
                    :value="getInitialValue(accountHolder, 'NameOnAccount', 'accountHolderValue', accountHolderValue)"
                    class="to-md:text-sm"
                    @input="updateModel('accountHolderValue')"
                    @blur="handleBlur('accountHolderValue')">
                </v-input>

                <div
                    v-if="$v.$dirty && $v.accountHolderValue.$invalid"
                    :id="accountHolderErrorId"
                    class="text-sm text-red mt-5">
                    <span
                        v-if="!$v.accountHolderValue.required"
                        v-html="getLabels('Labels.ErrorMessages.NameOnAccount.Required', accountHolder.ValidationAlert)"
                    />

                    <span
                        v-else-if="!$v.accountHolderValue.allowed"
                        v-html="getLabels('Labels.ErrorMessages.NameOnAccount.Invalid', accountHolder.ValidationAlert)"
                    />
                </div>
            </div>

            <!-- Account Type Field -->
            <div class="m-formField -text md:max-w-1_2 md:pl-15">
                <label
                    class="m-formField__label uppercase"
                    :for="accountType.Id"
                    v-html="getLabels('Labels.Checking.AccountType', accountType.Label)">
                </label>
                <v-select
                    v-if="localization && localization.Labels"
                    :id="accountType.Id"
                    ref="accountType"
                    vmodel="accountTypeValue"
                    :options="selectOptionsLabels(accountOptions)"
                    :aria-invalid="$v.accountTypeValue.$error"
                    :aria-describedby="$v.accountTypeValue.$error ? accountTypeErrorId : false"
                    :values="selectOptionsValues(accountOptions)"
                    :aria-label="getLabels('Labels.Checking.AccountType', accountType.Label)"
                    :select-mod="accountType.SelectMod"
                    :select-element-mod="`py-10 px-15 ${$v.accountTypeValue.$error ? '-error' : ''}`"
                    :initial="getInitialValue(accountType, 'AccountType', 'accountTypeValue', accountTypeValue)"
                    :name="accountType.Name"
                    :arrow-direction="accountType.Arrow.Direction || null"
                    arrow-size="-md"
                    :arrow-tailwind-color="accountType.Arrow.TailwindColor || null"
                    arrow-other-mods="absolute right-15 top-15 pointer-events-none"
                    @change="updateModel"
                    @blur="handleBlur('accountTypeValue')">
                </v-select>

                <div
                    v-if="$v.$dirty && $v.accountTypeValue.$invalid"
                    :id="accountTypeErrorId"
                    class="text-sm text-red mt-5"
                    v-html="getLabels('Labels.ErrorMessages.AccountType.Required', accountType.ValidationAlert)"
                />
            </div>
        </div>

        <div class="m-payForm__rowGroup">
            <!-- Routing Number Field -->
            <div class="m-formField -text md:max-w-1_2 md:pr-15">
                <label
                    class="m-formField__label uppercase"
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
                    :placeholder="getLabels('Labels.Checking.RoutingNumber', routingNumber.Placeholder)"
                    :tailwind-mods="$v.routingNumberValue.$error || (storedApiErrorFields && storedApiErrorFields.includes('InvalidRoutingNumber')) ? '-isInvalid' : null"
                    :aria-invalid="$v.routingNumberValue.$error"
                    :aria-describedby="$v.routingNumberValue.$error ? routingNumberErrorId : false"
                    :value="getInitialValue(routingNumber, 'RoutingNumber', 'routingNumberValue', routingNumberValue)"
                    class="to-md:text-sm"
                    @input="updateModel('routingNumberValue')"
                    @blur="handleBlur('routingNumberValue')"
                    @keydown="handleInteger">
                </v-input>

                <div
                    v-if="$v.$dirty && $v.routingNumberValue.$invalid"
                    :id="routingNumberErrorId"
                    class="text-sm text-red mt-5">

                    <span
                        v-if="!$v.routingNumberValue.required"
                        v-html="getLabels('Labels.ErrorMessages.RoutingNumber.Required', routingNumber.ValidationAlert)"
                    />

                    <span
                        v-else-if="!$v.routingNumberValue.min"
                        v-html="getLabels('Labels.ErrorMessages.RoutingNumber.MinLength', routingNumber.ValidationAlert)"
                    />
                </div>
            </div>

            <!-- Account Number Field -->
            <div class="m-formField -text md:max-w-1_2 md:pl-15">
                <label
                    class="m-formField__label uppercase"
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
                    :placeholder="getLabels('Labels.Checking.AccountNumber', accountNumber.Placeholder)"
                    :tailwind-mods="$v.accountNumberValue.$error ? '-isInvalid' : null"
                    :aria-invalid="$v.accountNumberValue.$error"
                    :aria-describedby="$v.accountNumberValue.$error ? accountNumberErrorId : false"
                    :value="getInitialValue(accountNumber, 'AccountNumber', 'accountNumberValue', accountNumberValue)"
                    class="to-md:text-sm"
                    @input="updateModel('accountNumberValue')"
                    @blur="handleBlur('accountNumberValue')"
                    @keydown="handleInteger">
                </v-input>

                <div
                    v-if="$v.$dirty && $v.accountNumberValue.$invalid"
                    :id="accountNumberErrorId"
                    class="text-sm text-red mt-5">

                    <span
                        v-if="!$v.accountNumberValue.required"
                        v-html="getLabels('Labels.ErrorMessages.AccountNumber.Required', accountNumber.ValidationAlert)"
                    />

                    <span
                        v-else-if="!$v.accountNumberValue.min"
                        v-html="getLabels('Labels.ErrorMessages.AccountNumber.MinLength', accountNumber.ValidationAlert)"
                    />
                </div>
            </div>
        </div>

        <ExampleCheck />
    </div>
</template>

<script>
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';
    import paymentFormCheckingMixin from '../../../mixins/payment-form-checking';

    export default {
        name: 'CheckoutPaymentFormChecking',
        mixins: [ paymentFormCheckingMixin, safeIdMixin ],
        safeIds: [
            'accountHolderErrorId',
            'accountNumberErrorId',
            'accountTypeErrorId',
            'routingNumberErrorId'
        ],
        props: {
            dirty: {
                type: Boolean,
                default: false
            },
            routingNumber: {
                type: Object,
                default: function() {
                    return {
                        Id: 'routingnum',
                        Name: 'routingnum',
                        MinLength: this.$env.Country === 'Canada' ? 8 : 9,
                        MaxLength: this.$env.Country === 'Canada' ? 8 : 9,
                        Placeholder: null,
                        Value: null,
                        ValidationAlert: 'This field is required.',
                        Label: 'ROUTING NUMBER'
                    };
                }
            }
        },
        data() {
            return {
                accountHolderErrorId: '',
                accountNumberErrorId: '',
                accountTypeErrorId: '',
                routingNumberErrorId: ''
            };
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

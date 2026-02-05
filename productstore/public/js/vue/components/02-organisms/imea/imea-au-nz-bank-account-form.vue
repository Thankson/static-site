<template>
    <div class="o-imeaAuNzBankAccountForm text-base">
        <p>{{ labels.ReportingText }}</p>
        <div v-if="hasPrefilledData" class="my-30 leading-base">
            <p>
                <span class="uppercase font-bold text-sm pr-4">
                    {{ labels.NameOnBankAccount && labels.NameOnBankAccount.Text }}:
                </span>
                <span class="inline-block">
                    {{ data.PreFilledData && data.PreFilledData.AccountHolderName }}
                </span>
            </p>
            <p v-if="isAu" class="mt-10">
                <span class="uppercase font-bold text-sm pr-4">
                    {{ labels.BSB && labels.BSB.Text }}:
                </span>
                <span class="inline-block">
                    {{ data.PreFilledData && data.PreFilledData.RoutingNumber }}
                </span>
            </p>
            <p class="mt-10">
                <span class="uppercase font-bold text-sm pr-4">
                    {{ labels.BankAccount && labels.BankAccount.Text }}:
                </span>
                <span class="inline-block">
                    {{ data.PreFilledData && data.PreFilledData.AccountNumber }}
                </span>
            </p>
        </div>
        <div
            v-if="!hasPrefilledData"
            :class="['mt-20 mb-40 lg:flex', !isAu && 'lg:w-1_2 lg:pr-15']"
        >
            <div :class="['lg:flex-1 lg:mr-15', isAu && 'lg:flex']">
                <div :class="[isAu && 'lg:flex-1 lg:mr-15']">
                    <label
                        class="uppercase text-sm font-medium"
                        for="nameOnBankAccount"
                        v-html="getLabel('NameOnBankAccount')"
                    />
                    <input-basic
                        id="nameOnBankAccount"
                        v-model="nameOnBankAccount"
                        name="nameOnBankAccount"
                        :class="{ '-isInvalid': $v.nameOnBankAccount.$error }"
                        :placeholder="labels.NameOnBankAccount && labels.NameOnBankAccount.Placeholder"
                        aria-describedby="nameOnBankAccountErrorMsg"
                    />
                    <FormFieldErrorMessage
                        id="nameOnBankAccountErrorMsg"
                        :is-visible="$v.nameOnBankAccount.$error"
                        :msg="labels.NameOnBankAccount && labels.NameOnBankAccount.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div
                    v-if="isAu"
                    class="mt-15 lg:flex-1 lg:mt-0 lg:ml-15"
                >
                    <label
                        class="uppercase text-sm font-medium"
                        for="bsbNumber"
                        v-html="getLabel('BSB')"
                    />
                    <m-tooltip
                        v-if="labels.BSB && labels.BSB.Tooltip"
                        :is-within-form="true"
                        :popper-offset-x-mobile="labels.BSB.Tooltip.OffsetHorizontalMobile"
                        :popper-offset-y="12"
                        :placement="isDesktop ? 'right' : 'bottom'"
                        :tooltip-aria-label="labels.BSB.Tooltip.AriaLabel"
                        tooltip-icon-size="xs"
                        tooltip-id="bsb"
                        :tooltip-popup-mod="isDesktop ? '-lg p-10' : '-md p-10'"
                        :tooltip-rte="labels.BSB.Tooltip.Rte"
                    />
                    <input-basic
                        id="bsbNumber"
                        v-model="bsbNumber"
                        name="bsbNumber"
                        :class="{ '-isInvalid': $v.bsbNumber.$error }"
                        :placeholder="labels.BSB && labels.BSB.Placeholder"
                        aria-describedby="bsbNumberErrorMsg"
                        @input="resetBSBNumberError()"
                    />
                    <FormFieldErrorMessage
                        id="bsbNumberErrorMsg"
                        :is-visible="$v.bsbNumber.$error || hasBackendBSBNumberError"
                        :msg="determineBsbNumberErrorMsg()"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <div class="mt-15 lg:flex-1 lg:mt-0 lg:ml-15">
                <div :class="[isAu && 'lg:w-1_2 lg:pr-15']">
                    <label
                        class="uppercase text-sm font-medium"
                        for="bankAccountNumber"
                        v-html="getLabel('BankAccount')"
                    />
                    <m-tooltip
                        v-if="labels.BankAccount && labels.BankAccount.Tooltip"
                        :is-within-form="true"
                        :popper-offset-x-mobile="labels.BankAccount.Tooltip.OffsetHorizontalMobile"
                        :popper-offset-y="12"
                        :placement="isDesktop ? 'right' : 'bottom'"
                        :tooltip-aria-label="labels.BankAccount.Tooltip.AriaLabel"
                        tooltip-icon-size="xs"
                        tooltip-id="bankAccount"
                        :tooltip-popup-mod="isDesktop ? '-lg p-10' : '-md p-10'"
                        :tooltip-rte="labels.BankAccount.Tooltip.Rte"
                    />
                    <input-basic
                        id="bankAccountNumber"
                        v-model="bankAccountNumber"
                        name="bankAccountNumber"
                        :class="{ '-isInvalid': $v.bankAccountNumber.$error || hasBackendBankAccountError}"
                        :placeholder="labels.BankAccount && labels.BankAccount.Placeholder"
                        aria-describedby="bankAccountNumberErrorMsg"
                        @input="resetBackendBankAccountError()"
                    />
                    <FormFieldErrorMessage
                        id="bankAccountNumberErrorMsg"
                        :is-visible="$v.bankAccountNumber.$error || hasBackendBankAccountError || hasNzBankingNumberError"
                        :msg="determineBankAccountNumberErrorMsg()"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import { validationMixin } from 'vuelidate';
    import { requiredIf } from 'vuelidate/lib/validators';
    import {
        isValidAuBankAccountNumber,
        isValidNzBankAccountNumber,
        isValidBsbNumber,
        prependAuBankAccountNumberWithZeros
    } from '@productstore/source/js/vue/utils/au-nz-form-helper';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'OImeaAuNzBankAccountForm',
        components: {
            FormFieldErrorMessage
        },
        mixins: [ isDesktop, validationMixin ],
        validations() {
            if(!this.hasPrefilledData) {
                return {
                    bankAccountNumber: {
                        required: requiredIf(() => this.labels?.BankAccount?.Required),
                        valid: val => {
                            if(!val) return true;
                            if(this.isAu) return isValidAuBankAccountNumber(val);
                            else return isValidNzBankAccountNumber(val);
                        }
                    },
                    bsbNumber: {
                        required: requiredIf(() => this.isAu && this.labels?.BSB?.Required),
                        valid: val => {
                            if(!val) return true;
                            return isValidBsbNumber(val);
                        }
                    },
                    nameOnBankAccount: {
                        required: requiredIf(() => this.labels?.NameOnBankAccount?.Required)
                    }
                };
            }
        },
        props: {
            data: {
                type: Object,
                default: () => ({})
            },
            isAu: {
                type: Boolean,
                required: true
            },
            isNz: {
                type: Boolean,
                required: true
            },
            labels: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                bankAccountNumber: null,
                bsbNumber: null,
                hasBackendBankAccountError: false,
                hasBackendBSBNumberError: false,
                hasPrefilledData: false,
                nameOnBankAccount: null
            };
        },
        computed: {
            hasNzBankingNumberError() {
                return this.isNz && this.hasBackendBSBNumberError;
            }
        },
        mounted() {
            eventBus.$on('setBankAccountInvalid', () => {
                this.hasBackendBankAccountError = true;
            });
            eventBus.$on('setBSBNumberInvalid', () => {
                this.hasBackendBSBNumberError = true;
            });
            this.$nextTick(() => {
                if(this.isAu) {
                    this.hasPrefilledData =
                        this.data?.PreFilledData?.AccountHolderName &&
                        this.data?.PreFilledData?.AccountNumber &&
                        this.data?.PreFilledData?.RoutingNumber;
                } else {
                    this.hasPrefilledData =
                        this.data?.PreFilledData?.AccountHolderName &&
                        this.data?.PreFilledData?.AccountNumber;
                }
            });
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            determineBankAccountNumberErrorMsg() {
                if(this.$v.bankAccountNumber.required === false) return this.labels?.BankAccount?.RequiredErrorMessage;
                else if(this.$v.bankAccountNumber.valid === false || this.hasBackendBankAccountError || this.hasNzBankingNumberError) return this.labels?.BankAccount?.InvalidErrorMessage;
            },
            determineBsbNumberErrorMsg() {
                if(this.$v.bsbNumber.required === false) return this.labels?.BSB?.RequiredErrorMessage;
                else if(this.$v.bsbNumber.valid === false || this.hasBackendBSBNumberError) return this.labels?.BSB?.InvalidErrorMessage;
            },
            getLabel(fieldName) {
                return `${this.labels[fieldName]?.Text}${this.labels[fieldName]?.Required ? '*' : ''}`;
            },
            resetBSBNumberError() {
                this.hasBackendBSBNumberError = false;
            },
            resetBackendBankAccountError() {
                this.hasBackendBankAccountError = false;
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    if(!this.$v.$invalid) {
                        const bankAccountNumber =
                            this.isAu
                                ? prependAuBankAccountNumberWithZeros(this.bankAccountNumber)
                                : this.bankAccountNumber;
                        if(!this.hasPrefilledData) {
                            const servicesPayload = {
                                payMethodDefaults: [],
                                country: this.$env?.Country,
                                oneTimeUse: false,
                                isActive: true,
                                payType: 'DirectDeposit',
                                nameOnAccount: this.nameOnBankAccount,
                                accountNumber: bankAccountNumber,
                                routingNumber: this.bsbNumber,
                                payMethodDirection: 'Outbound',
                                applicationId: 1
                            };
                            eventBus.$emit('getCommissionDepositData', servicesPayload);
                        }
                        const formData = {
                            NameOnBankAccount: this.nameOnBankAccount,
                            BSB: this.bsbNumber,
                            AccountNumber: bankAccountNumber
                        };
                        eventBus.$emit('getInput', formData, true);
                    } else eventBus.$emit('getInput', {}, false);
                });
            }
        }
    };
</script>

<template>
    <div class="o-imeaPlBankAccountForm mb-40 text-base">
        <div class="o-imeaPlBankAccountForm__maxWidthContainer mb-20">
            <label
                class="uppercase text-sm font-medium"
                for="taxIdNumber"
                v-html="getLabel('TaxIdNumber')"
            />
            <a-input-glimpse
                id="taxIdNumber"
                v-model="taxIdNumber"
                aria-describedby="taxIdNumberErrorMsg"
                :input-classname="`a-input -text text-base ${$v.taxIdNumber.$error && '-isInvalid'}`"
                :has-criteria="false"
                :attributes="taxIdNumberInputAttributes"
                :show-label="labels.TaxIdNumber && labels.TaxIdNumber.Show"
                :hide-label="labels.TaxIdNumber && labels.TaxIdNumber.Hide"
            />
            <FormFieldErrorMessage
                id="taxIdNumberErrorMsg"
                :is-visible="$v.taxIdNumber.$error"
                :msg="determineTaxIdNumberErrorMsg()"
                modifier-classes="-no-icon"
            />
        </div>
        <p class="leading-tight mb-18">{{ labels.ReportingText }}</p>
        <div
            v-if="hasPrefilledData"
            class="my-30 leading-base"
        >
            <p>
                <span class="uppercase font-bold text-sm pr-4">
                    {{ labels.AccountHolderName && labels.AccountHolderName.Text }}:
                </span>
                <span class="inline-block">
                    {{ data.PreFilledData && data.PreFilledData.AccountHolderName }}
                </span>
            </p>
            <p class="mt-10">
                <span class="uppercase font-bold text-sm pr-4">
                    {{ labels.BIC && labels.BIC.Text }}:
                </span>
                <span class="inline-block">
                    {{ data.PreFilledData && data.PreFilledData.RoutingNumber }}
                </span>
            </p>
            <p class="mt-10">
                <span class="uppercase font-bold text-sm pr-4">
                    {{ labels.BankName && labels.BankName.Text }}:
                </span>
                <span class="inline-block">
                    {{ data.PreFilledData && data.PreFilledData.BankName }}
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
            v-else
            class="o-imeaPlBankAccountForm__maxWidthContainer"
        >
            <div class="md:flex">
                <div class="mb-20 md:w-1_2 md:mr-15">
                    <label
                        class="uppercase text-sm font-medium"
                        for="accountHolderName"
                        v-html="getLabel('AccountHolderName')"
                    />
                    <input-basic
                        id="accountHolderName"
                        v-model="accountHolderName"
                        :class="[$v.accountHolderName.$error && '-isInvalid']"
                        :placeholder="labels.AccountHolderName && labels.AccountHolderName.Placeholder"
                        aria-describedby="accountHolderNameErrorMsg"
                    />
                    <FormFieldErrorMessage
                        id="accountHolderNameErrorMsg"
                        :is-visible="$v.accountHolderName.$error"
                        :msg="labels.AccountHolderName && labels.AccountHolderName.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div class="mb-20 md:w-1_2 md:ml-15">
                    <label
                        class="uppercase text-sm font-medium"
                        for="bicNumber"
                        v-html="getLabel('BIC')"
                    />
                    <input-basic
                        id="bicNumber"
                        v-model="bicNumber"
                        :class="[$v.bicNumber.$error && '-isInvalid']"
                        :placeholder="labels.BIC && labels.BIC.Placeholder"
                        aria-describedby="bicNumberErrorMsg"
                    />
                    <FormFieldErrorMessage
                        id="bicNumberErrorMsg"
                        :is-visible="$v.bicNumber.$error"
                        :msg="labels.BIC && labels.BIC.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <div class="md:flex">
                <div class="mb-20 md:w-1_2 md:mb-0 md:mr-15">
                    <label
                        class="uppercase text-sm font-medium"
                        for="bank"
                        v-html="getLabel('BankName')"
                    />
                    <v-select
                        id="bank"
                        :class="[$v.bank.$error && '-error']"
                        :options="bankNamesList"
                        :values="bankIdsList"
                        :initial="bankIdsList[0]"
                        select-mod="-sm-md -padding-md"
                        arrow-other-mods="absolute -filled right-15 top-16 pointer-events-none"
                        aria-describedby="bankErrorMsg"
                        @change="handleBankSelectChange($event)"
                    />
                    <FormFieldErrorMessage
                        id="bankErrorMsg"
                        :is-visible="$v.bank.$error"
                        :msg="labels.BankName && labels.BankName.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div class="md:w-1_2 md:ml-15">
                    <label
                        class="uppercase text-sm font-medium"
                        for="ibanNumber"
                        v-html="getLabel('BankAccount')"
                    />
                    <input-basic
                        id="ibanNumber"
                        v-model="ibanNumber"
                        :class="[$v.ibanNumber.$error && '-isInvalid']"
                        :placeholder="labels.BankAccount && labels.BankAccount.Placeholder"
                        aria-describedby="ibanNumberErrorMsg"
                    />
                    <FormFieldErrorMessage
                        id="ibanNumberErrorMsg"
                        :is-visible="$v.ibanNumber.$error"
                        :msg="labels.BankAccount && labels.BankAccount.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import apiGetBanks from '@api/routes/customeraccount/paymethods/banks';
    import eventBus from '../../../mixins/event-bus';
    import { validationMixin } from 'vuelidate';
    import { requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'OImeaPlBankAccountForm',
        components: { FormFieldErrorMessage },
        mixins: [ validationMixin ],
        validations() {
            return {
                accountHolderName: {
                    required: requiredIf(() => this.labels?.AccountHolderName?.Required)
                },
                bank: {
                    required: requiredIf(() => this.labels?.BankName?.Required && this.selectedBankId === null)
                },
                bicNumber: {
                    required: requiredIf(() => this.labels?.BIC?.Required)
                },
                ibanNumber: {
                    required: requiredIf(() => this.labels?.BankAccount?.Required)
                },
                taxIdNumber: {
                    required: requiredIf(() => this.labels?.TaxIdNumber?.Required),
                    valid: val => {
                        if(!val) return true;
                        const regex = /^[0-9]{10}$/;
                        return regex.test(val.replace(/[\s-]?/g, ''));
                    }
                }
            };
        },
        props: {
            data: {
                type: Object,
                default: () => ({})
            },
            labels: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                accountHolderName: null,
                banksData: [],
                bicNumber: null,
                ibanNumber: null,
                hasPrefilledData: false,
                selectedBankId: null,
                taxIdNumber: null
            };
        },
        computed: {
            bankIdsList() {
                return [null, ...this.banksData.map(bank => bank?.Id)];
            },
            bankNamesList() {
                return [this.labels?.BankName?.Placeholder, ...this.banksData.map(bank => bank?.Name)];
            },
            taxIdNumberInputAttributes() {
                return {
                    'aria-describedby': 'taxIdNumberErrorMsg',
                    'aria-invalid': this.$v.taxIdNumber.$error,
                    placeholder: this.labels?.TaxIdNumber?.Placeholder
                };
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.hasPrefilledData = !!(
                    this.data?.PreFilledData?.AccountHolderName &&
                    this.data?.PreFilledData?.AccountNumber &&
                    this.data?.PreFilledData?.RoutingNumber &&
                    this.data?.PreFilledData?.BankName
                );
                if(!this.hasPrefilledData) this.getBankData();
            });
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            async getBankData() {
                const response = await apiGetBanks.query({ country: this.$env?.Country });
                if(response?.success && response.data?.Success) {
                    this.banksData = response.data.Data;
                } else console.log('error in fetching banks', response?.data?.ErrorMessages);
            },
            determineTaxIdNumberErrorMsg() {
                if(this.$v.taxIdNumber.required === false) return this.labels?.TaxIdNumber?.RequiredErrorMessage;
                else if(this.$v.taxIdNumber.valid === false) return this.labels?.TaxIdNumber?.InvalidErrorMessage;
            },
            getLabel(fieldName) {
                return `${this.labels[fieldName]?.Text}${this.labels[fieldName]?.Required ? '*' : ''}`;
            },
            handleBankSelectChange(event) {
                this.selectedBankId = event.value;
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    if(!this.$v.$invalid) {
                        if(!this.hasPrefilledData) {
                            const selectedBankObj = this.banksData.find(bank => bank.Id === this.selectedBankId);
                            const servicesPayload = {
                                payMethodDefaults: [],
                                country: this.$env.Country,
                                oneTimeUse: false,
                                isActive: true,
                                payType: 'DirectDeposit',
                                nameOnAccount: this.accountHolderName,
                                accountNumber: this.ibanNumber,
                                bankName: selectedBankObj?.Name,
                                payMethodDirection: 'Outbound',
                                applicationId: 1,
                                routingNumber: this.bicNumber,
                                postalCode: '',
                                accountNickName: ''
                            };
                            eventBus.$emit('getCommissionDepositData', servicesPayload);
                        }
                        const backendPayload = {
                            // Aliasing the tax id number as SocialSecurityNumber for BE payload
                            SocialSecurityNumber: this.taxIdNumber?.replace(/[\s-]?/g, '')
                        };
                        eventBus.$emit('getInput', backendPayload, true);
                    } else eventBus.$emit('getInput', {}, false);
                });
            }
        }
    };
</script>

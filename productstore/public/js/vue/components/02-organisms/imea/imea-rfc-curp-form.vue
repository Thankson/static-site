<template>
    <div class="o-imeaRfcCurpForm text-base">
        <!-- BEGIN LEGACY TOP SECTION -->
        <template v-if="!isCfdiEnhancementEnabled">
            <p>{{ labels.ReportingText }}</p>
            <div
                v-if="hasPrefilledData"
                class="mt-20 leading-tight"
            >
                <p class="font-bold">{{ labels.CommissionDepositDescription }}</p>
                <p>{{ data.PreFilledData && data.PreFilledData.BankName }}</p>
                <p>{{ data.PreFilledData && data.PreFilledData.AccountHolderName }}</p>
                <p>{{ data.PreFilledData && data.PreFilledData.AccountNumber }}</p>
            </div>
        </template>
        <!-- END LEGACY TOP SECTION -->
        <template v-if="isCfdiEnhancementEnabled">
            <div class="pb-40">
                <div v-if="hasPrefilledData">
                    <p>{{ data.PreFilledData && data.PreFilledData.BankName }}</p>
                    <p>{{ data.PreFilledData && data.PreFilledData.AccountHolderName }}</p>
                    <p>{{ data.PreFilledData && data.PreFilledData.AccountNumber }}</p>
                </div>
                <div v-if="!hasPrefilledData" class="md:flex">
                    <div v-if="labels.AccountHolderName" class="mb-20 md:flex-1 md:mr-15">
                        <label
                            class="uppercase text-sm"
                            for="accountHolderName"
                            v-html="`${labels.AccountHolderName.Text}${labels.AccountHolderName.Required ? requiredSpan : ''}`"
                        />
                        <v-input
                            id="accountHolderName"
                            v-model="accountHolderName"
                            model-name="inputValue"
                            :tailwind-mods="$v.accountHolderName.$error ? '-isInvalid' : null"
                            name="accountHolderName"
                            :placeholder="labels.AccountHolderName.Placeholder"
                            aria-required="true"
                            :aria-invalid="$v.accountHolderName.$error"
                            :aria-describedby="$v.accountHolderName.$error ? 'accountHolderNameError' : false"
                            data-testid="input-accountHolderName"
                        />
                        <FormFieldErrorMessage
                            id="accountHolderNameError"
                            :is-visible="$v.accountHolderName.$error"
                            :msg="labels.AccountHolderName.RequiredErrorMessage"
                            modifier-classes="-no-icon"
                        />
                    </div>
                    <div v-if="labels.BankName" class="mb-20 md:flex-1 md:ml-15">
                        <label
                            class="uppercase text-sm"
                            for="bankName"
                            v-html="`${labels.BankName.Text}${labels.BankName.Required ? requiredSpan : ''}`"
                        />
                        <v-select
                            id="bankName"
                            ref="bankName"
                            :options="bankLabels"
                            :values="bankValues"
                            :initial="bankValues[0]"
                            :aria-label="labels.BankName.Text"
                            select-mod="-sm-md -padding-md"
                            :select-element-mod="`${$v.bankName.$error ? '-error' : ''}`"
                            arrow-other-mods="absolute -filled right-15 top-16 pointer-events-none"
                            data-testid="select-bankName"
                        />
                        <FormFieldErrorMessage
                            id="bankNameError"
                            :is-visible="$v.bankName.$error"
                            :msg="labels.BankName.RequiredErrorMessage"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>
                <div v-if="labels.CardNumber" class="md:w-1_2 md:pr-15">
                    <label
                        class="uppercase text-sm"
                        for="clabeCardNumber"
                        v-html="`${labels.CardNumber.Text}${labels.CardNumber.Required ? requiredSpan : ''}`"
                    />
                    <v-input
                        id="clabeCardNumber"
                        v-model="clabeCardNumber"
                        model-name="inputValue"
                        :tailwind-mods="$v.clabeCardNumber.$error ? '-isInvalid' : null"
                        name="clabeCardNumber"
                        :placeholder="labels.CardNumber.Placeholder"
                        aria-required="true"
                        :aria-invalid="$v.clabeCardNumber.$error"
                        :aria-describedby="$v.clabeCardNumber.$error ? 'clabeCardNumberError' : false"
                        data-testid="input-clabeCardNumber"
                    />
                    <FormFieldErrorMessage
                        id="clabeCardNumberError"
                        :is-visible="$v.clabeCardNumber.$error"
                        :msg="determineClabeCardNumberErrorMsg()"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
        </template>
        <!-- BEGIN LEGACY BOTTOM SECTION -->
        <template v-if="!isCfdiEnhancementEnabled">
            <div :class="[!hasPrefilledData ? 'py-10' : 'py-20 md:flex']">
                <div :class="[!hasPrefilledData ? 'flex flex-col md:flex-row' : 'md:w-1_2 md:mr-15']">
                    <div :class="[!hasPrefilledData && 'flex-1 md:flex md:mr-15']">
                        <!-- Bank Name -->
                        <div v-if="labels.BankName && !hasPrefilledData" class="flex-1 md:mr-15 py-10">
                            <label
                                class="uppercase text-sm"
                                for="bankName"
                                v-html="
                                    `${labels.BankName.Text}${
                                        labels.BankName.Required
                                            ? requiredSpan
                                            : ''
                                    }`
                                "
                            />
                            <v-select
                                id="bankName"
                                ref="bankName"
                                :options="bankLabels"
                                :values="bankValues"
                                :initial="bankValues[0]"
                                :aria-label="labels.BankName.Text"
                                select-mod="-sm-md -padding-md"
                                :select-element-mod="
                                    `${$v.bankName.$error ? '-error' : ''}`
                                "
                                arrow-other-mods="
                                absolute -filled right-15 top-16 pointer-events-none
                            "
                            />
                            <FormFieldErrorMessage
                                id="bankNameError"
                                :is-visible="$v.bankName.$error"
                                :msg="labels.BankName.RequiredErrorMessage"
                                modifier-classes="-no-icon"
                            />
                        </div>
                        <!-- RFC Number -->
                        <div
                            v-if="labels.RFC"
                            :class="[!hasPrefilledData ? 'flex-1 py-10 md:ml-15' : 'pb-10 md:pb-0']"
                        >
                            <label
                                class="uppercase text-sm"
                                for="rfcNumber"
                                v-html="
                                    `${labels.RFC.Text}${
                                        labels.RFC.Required ? requiredSpan : ''
                                    }`
                                "
                            />
                            <v-input
                                id="rfcNumber"
                                v-model="rfcNumber"
                                model-name="inputValue"
                                :tailwind-mods="
                                    $v.rfcNumber.$error ? '-isInvalid' : null
                                "
                                name="rfcNumber"
                                :placeholder="labels.RFC.Placeholder"
                                aria-required="true"
                                :aria-invalid="$v.rfcNumber.$error"
                                :aria-describedby="
                                    $v.rfcNumber.$error
                                        ? 'rfcNumberError'
                                        : false
                                "
                            />
                            <FormFieldErrorMessage
                                id="rfcNumberError"
                                :is-visible="$v.rfcNumber.$error"
                                :msg="determineRfcNumberErrorMsg()"
                                modifier-classes="-no-icon"
                            />
                        </div>
                    </div>
                    <!-- Account Holder Name -->
                    <div
                        v-if="labels.AccountHolderName && !hasPrefilledData"
                        class="flex-1 md:ml-15 py-10"
                    >
                        <label
                            class="uppercase text-sm"
                            for="accountHolderName"
                            v-html="
                                `${labels.AccountHolderName.Text}${
                                    labels.AccountHolderName.Required
                                        ? requiredSpan
                                        : ''
                                }`
                            "
                        />
                        <v-input
                            id="accountHolderName"
                            v-model="accountHolderName"
                            model-name="inputValue"
                            :tailwind-mods="
                                $v.accountHolderName.$error
                                    ? '-isInvalid'
                                    : null
                            "
                            name="accountHolderName"
                            :placeholder="labels.AccountHolderName.Placeholder"
                            aria-required="true"
                            :aria-invalid="$v.accountHolderName.$error"
                            :aria-describedby="
                                $v.accountHolderName.$error
                                    ? 'accountHolderNameError'
                                    : false
                            "
                        />
                        <FormFieldErrorMessage
                            id="accountHolderNameError"
                            :is-visible="$v.accountHolderName.$error"
                            :msg="labels.AccountHolderName.RequiredErrorMessage"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>
                <div
                    class="md:w-1_2"
                    :class="[!hasPrefilledData ? 'flex flex-col md:flex-row' : 'md:ml-15']"
                >
                    <!-- CURP Number -->
                    <div
                        v-if="labels.CURP"
                        :class="[!hasPrefilledData && 'flex-1 py-10 md:mr-15']"
                    >
                        <label
                            class="uppercase text-sm"
                            for="curpNumber"
                            v-html="
                                `${labels.CURP.Text}${
                                    labels.CURP.Required ? requiredSpan : ''
                                }`
                            "
                        />
                        <v-input
                            id="curpNumber"
                            v-model="curpNumber"
                            model-name="inputValue"
                            :tailwind-mods="
                                $v.curpNumber.$error ? '-isInvalid' : null
                            "
                            name="curpNumber"
                            :placeholder="labels.CURP.Placeholder"
                            aria-required="true"
                            :aria-invalid="$v.curpNumber.$error"
                            :aria-describedby="
                                $v.curpNumber.$error ? 'curpNumberError' : false
                            "
                        />
                        <FormFieldErrorMessage
                            id="curpNumberError"
                            :is-visible="$v.curpNumber.$error"
                            :msg="determineCurpNumberErrorMsg()"
                            modifier-classes="-no-icon"
                        />
                    </div>
                    <!-- CLABE/Credit Card Number -->
                    <div v-if="labels.CardNumber && !hasPrefilledData" class="flex-1 md:mx-15 py-10">
                        <label
                            class="uppercase text-sm"
                            for="clabeCardNumber"
                            v-html="
                                `${labels.CardNumber.Text}${
                                    labels.CardNumber.Required
                                        ? requiredSpan
                                        : ''
                                }`
                            "
                        />
                        <v-input
                            id="clabeCardNumber"
                            v-model="clabeCardNumber"
                            model-name="inputValue"
                            :tailwind-mods="
                                $v.clabeCardNumber.$error ? '-isInvalid' : null
                            "
                            name="clabeCardNumber"
                            :placeholder="labels.CardNumber.Placeholder"
                            aria-required="true"
                            :aria-invalid="$v.clabeCardNumber.$error"
                            :aria-describedby="
                                $v.clabeCardNumber.$error
                                    ? 'clabeCardNumberError'
                                    : false
                            "
                        />
                        <FormFieldErrorMessage
                            id="clabeCardNumberError"
                            :is-visible="$v.clabeCardNumber.$error"
                            :msg="determineClabeCardNumberErrorMsg()"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>
            </div>
        </template>
        <!-- END LEGACY BOTTOM SECTION -->
    </div>
</template>
<script>
    import apiGetBanks from '@api/routes/customeraccount/paymethods/banks';
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import { isValidClabeCardNumber, isValidCurpNumber, isValidRfcNumber } from '@productstore/source/js/vue/utils/mx-form-helper';
    import { validationMixin } from 'vuelidate';
    import { requiredIf } from 'vuelidate/lib/validators';

    export default {
        name: 'OImeaRfcCurpForm',
        components: {
            FormFieldErrorMessage,
            vInput
        },
        mixins: [validationMixin],
        validations() {
            return {
                accountHolderName: {
                    required: requiredIf(() => !this.hasPrefilledData && this.labels?.AccountHolderName?.Required)
                },
                bankName: {
                    required: requiredIf(() =>
                        !this.hasPrefilledData &&
                        this.$refs.bankName?.selectedVal === this.bankValues[0] &&
                        this.labels?.BankName?.Required
                    )
                },
                clabeCardNumber: {
                    required: requiredIf(() => !this.hasPrefilledData && this.labels?.CardNumber?.Required),
                    valid: val => {
                        if(!val) return true;
                        return isValidClabeCardNumber(val);
                    }
                },
                curpNumber: {
                    required: requiredIf(() => this.labels?.CURP?.Required),
                    valid: val => {
                        if(!val) return true;
                        return isValidCurpNumber(val);
                    }
                },
                rfcNumber: {
                    required: requiredIf(() => this.labels?.RFC?.Required),
                    valid: val => {
                        if(!val) return true;
                        return isValidRfcNumber(val);
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
                accountHolderName: '',
                banks: [],
                bankName: '',
                clabeCardNumber: '',
                curpNumber: '',
                hasPrefilledData: false,
                rfcNumber: '',
                selectedBank: {}
            };
        },
        computed: {
            bankLabels() {
                return [
                    this.labels?.BankName?.Text,
                    ...this.banks.map(({ Name }) => Name)
                ];
            },
            bankValues() {
                return [null, ...this.banks.map(({ Id }) => Id)];
            },
            // TODO: Remove CFDI Feature Flag
            // See: http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/282687
            isCfdiEnhancementEnabled() {
                return this.data?.EnableCfdiEnhancement || false;
            },
            requiredSpan() {
                return `<span>*</span>`;
            }
        },
        mounted() {
            this.getBankNames();
            this.$nextTick(() => {
                this.setHasPrefilledData();
            });
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            determineClabeCardNumberErrorMsg() {
                if(this.$v.clabeCardNumber.required === false) return this.labels?.CardNumber?.RequiredErrorMessage;
                else if(this.$v.clabeCardNumber.valid === false) return this.labels?.CardNumber?.InvalidErrorMessage;
            },
            determineCurpNumberErrorMsg() {
                if(this.$v.curpNumber.required === false) return this.labels?.CURP?.RequiredErrorMessage;
                else if(this.$v.curpNumber.valid === false) return this.labels?.CURP?.InvalidErrorMessage;
            },
            determineRfcNumberErrorMsg() {
                if(this.$v.rfcNumber.required === false) return this.labels?.RFC?.RequiredErrorMessage;
                else if(this.$v.rfcNumber.valid === false) return this.labels?.RFC?.InvalidErrorMessage;
            },
            async getBankNames() {
                const response = await apiGetBanks.query({
                    country: this.$env?.Country
                });
                if(response?.success && response.data?.Success) {
                    this.banks = response.data.Data;
                } else {
                    console.log(
                        'error in fetching banks',
                        response?.data?.ErrorMessages
                    );
                }
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    this.selectedBank = this.banks.find(
                        selectedBank =>
                            selectedBank.Id === this.$refs.bankName?.selectedVal
                    );
                    if(!this.$v.$invalid) {
                        if(!this.hasPrefilledData) {
                            const servicesPayload = {
                                payMethodDefaults: [],
                                country: this.$env.Country,
                                oneTimeUse: false,
                                isActive: true,
                                payType: 'DirectDeposit',
                                nameOnAccount: this.accountHolderName,
                                accountNumber: this.clabeCardNumber,
                                bankName: this.selectedBank?.Name,
                                payMethodDirection: 'Outbound',
                                applicationId: 1,
                                routingNumber: this.selectedBank?.RoutingNumber,
                                postalCode: '',
                                accountNickName: ''
                            };
                            eventBus.$emit('getCommissionDepositData', servicesPayload);
                        }
                        const backendPayload = {
                            CURP: this.curpNumber,
                            RFC: this.rfcNumber
                        };
                        eventBus.$emit('getInput', backendPayload, true);
                    } else eventBus.$emit('getInput', {}, false);
                });
            },
            setHasPrefilledData() {
                this.hasPrefilledData = (
                    this.data?.PreFilledData?.AccountHolderName &&
                    this.data?.PreFilledData?.AccountNumber &&
                    this.data?.PreFilledData?.BankName
                ) && true;
            }
        }
    };
</script>

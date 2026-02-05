<template>
    <!-- Form -->
    <form class="o-CfdiProductInvoiceForm text-base relative" @submit.prevent>
        <div
            v-if="loadingPrefilledTaxData || isSubmitting"
            class="absolute flex top-0 bottom-0 left-0 right-0 justify-center items-center z-1 opacity-50 bg-white"
        >
            <a-loading-spinner :visible="true" aria-hidden="true" />
        </div>
        <div>
            <p v-if="hasMappedErrors" class="text-xl font-medium mb-20">
                {{ labels.PreviousRequestFailed }}
            </p>
            <div
                class=" px-16 py-10 text-sm flex items-start mb-40 w-full o-CfdiProductInvoiceForm__disclaimer"
            >
                <span
                    class="text-xl mr-10 text-gray-150 material-icons"
                    aria-hidden="true"
                >
                    info
                </span>
                <p v-html="labels.DisclaimerText"></p>
            </div>
            <!-- Tax Type Radios -->
            <div class="flex flex-row mb-20">
                <m-radio
                    v-model="taxEntityType"
                    class="w-auto mr-30 md:mr-40"
                    name="taxEntityName"
                    :label="labels.TaxEntityIndividual"
                    input-value="individual"
                    data-testid="radio-taxEntityIndividual"
                />
                <m-radio
                    v-model="taxEntityType"
                    class="w-auto"
                    name="taxEntityName"
                    :label="labels.TaxEntityBusiness"
                    input-value="business"
                    data-testid="radio-taxEntityBusiness"
                />
            </div>
            <div
                class="o-CfdiProductInvoiceForm__formGroup grid grid-cols-1 md:grid-cols-2"
            >
                <!-- Order # -->
                <div class="flex flex-col">
                    <label for="orderNumber" class="text-sm font-medium mb-5">
                        {{ labels.OrderNumber }}
                    </label>
                    <input-basic
                        id="orderNumber"
                        :value="orderNumber"
                        name="orderNumber"
                        disabled
                        class="-disabled"
                        data-testid="input-orderNumber"
                    />
                </div>

                <!-- RFC -->
                <div class="flex flex-col">
                    <label for="rfc" class="text-sm font-medium mb-5">
                        {{ labels.Rfc }}
                    </label>
                    <!-- RFC Persona Fisica -->
                    <template v-if="isIndividual">
                        <input-basic
                            id="rfc"
                            v-model="rfcDisplayIndividual"
                            name="rfc"
                            :max-length="rfcDisplayMaxLength"
                            :placeholder="rfcPlaceholder"
                            :class="{
                                '-isInvalid':
                                    hasRfcErrorIndividual
                            }"
                            data-testid="input-rfc"
                            aria-describedby="rfcErrorMsg"
                            @keydown="handleRfcInteraction('individual')"
                            @blur="$v.rfcIndividual.$touch()"
                        />
                        <FormFieldErrorMessage
                            id="rfcErrorMsg"
                            :is-visible="
                                hasRfcErrorIndividual
                            "
                            :msg="rfcErrorMessageIndividual"
                            modifier-classes="-no-icon"
                        />
                    </template>
                    <!-- RFC Persona Moral -->
                    <template v-else>
                        <input-basic
                            id="rfc"
                            v-model="rfcDisplayBusiness"
                            name="rfc"
                            :max-length="rfcDisplayMaxLength"
                            :placeholder="rfcPlaceholder"
                            :class="{
                                '-isInvalid':
                                    hasRfcErrorBusiness
                            }"
                            data-testid="input-rfc"
                            aria-describedby="rfcErrorMsg"
                            @keydown="handleRfcInteraction('business')"
                            @blur="$v.rfcBusiness.$touch()"
                        />
                        <FormFieldErrorMessage
                            id="rfcErrorMsg"
                            :is-visible="
                                hasRfcErrorBusiness
                            "
                            :msg="rfcErrorMessageBusiness"
                            modifier-classes="-no-icon"
                        />
                    </template>
                </div>

                <!-- Razon Social -->
                <div v-if="isBusiness" class="flex flex-col md:col-span-2">
                    <label for="razonSocial" class="text-sm font-medium mb-5">
                        {{ labels.RazonSocial }}
                    </label>
                    <input-basic
                        id="razonSocial"
                        v-model="razonSocial"
                        name="razonSocial"
                        :max-length="getMaxLength()"
                        :placeholder="labels.RazonSocial"
                        :class="{
                            '-isInvalid':
                                hasRazonSocialApiError ||
                                $v.razonSocial.$error
                        }"
                        data-testid="input-razonSocial"
                        aria-describedby="razonSocialErrorMsg"
                        @keydown="clearApiError('hasRazonSocialApiError')"
                        @blur="$v.razonSocial.$touch()"
                    />
                    <FormFieldErrorMessage
                        id="razonSocialErrorMsg"
                        :is-visible="
                            hasRazonSocialApiError ||
                                $v.razonSocial.$error
                        "
                        :msg="
                            hasRazonSocialApiError
                                ? getApiError('razonsocial')
                                : labels.RazonSocialErrorMessage
                        "
                        modifier-classes="-no-icon"
                    />
                </div>

                <!-- Persona Fisica -->
                <template v-if="isIndividual">
                    <div class="flex flex-col">
                        <label for="name" class="text-sm font-medium mb-5">
                            {{ labels.Name }}
                        </label>
                        <input-basic
                            id="name"
                            v-model="customerName"
                            name="customerName"
                            :max-length="getMaxLength()"
                            :placeholder="labels.Name"
                            :class="{
                                '-isInvalid':
                                    hasCustomerNameApiError ||
                                    $v.customerName.$error
                            }"
                            data-testid="input-name"
                            aria-describedby="nameErrorMsg"
                            @keydown="clearApiError('hasCustomerNameApiError')"
                            @blur="$v.customerName.$touch()"
                        />
                        <FormFieldErrorMessage
                            id="nameErrorMsg"
                            :is-visible="
                                hasCustomerNameApiError ||
                                    $v.customerName.$error
                            "
                            :msg="
                                hasCustomerNameApiError
                                    ? getApiError('customername')
                                    : labels.NameErrorMessage
                            "
                            modifier-classes="-no-icon"
                        />
                    </div>

                    <div class="flex flex-col">
                        <label
                            for="paternalSurname"
                            class="text-sm font-medium mb-5"
                        >
                            {{ labels.PaternalName }}
                        </label>
                        <input-basic
                            id="paternalSurname"
                            v-model="customerPaternalSurname"
                            name="customerPaternalSurname"
                            :max-length="getMaxLength()"
                            :placeholder="labels.PaternalName"
                            :class="{
                                '-isInvalid':
                                    hasCustomerPaternalSurnameApiError ||
                                    $v.customerPaternalSurname.$error
                            }"
                            data-testid="input-paternalSurname"
                            aria-describedby="paternalSurnameErrorMsg"
                            @keydown="clearApiError('hasCustomerPaternalSurnameApiError')"
                            @blur="$v.customerPaternalSurname.$touch()"
                        />
                        <FormFieldErrorMessage
                            id="paternalSurnameErrorMsg"
                            :is-visible="
                                hasCustomerPaternalSurnameApiError ||
                                    $v.customerPaternalSurname.$error
                            "
                            :msg="
                                hasCustomerPaternalSurnameApiError
                                    ? getApiError('customerpaternalsurname')
                                    : labels.PaternalNameErrorMessage
                            "
                            modifier-classes="-no-icon"
                        />
                    </div>

                    <div class="flex flex-col">
                        <label
                            for="maternalSurname"
                            class="text-sm font-medium mb-5"
                        >
                            {{ labels.MaternalName }}
                        </label>
                        <input-basic
                            id="maternalSurname"
                            v-model="customerMaternalSurname"
                            name="customerMaternalSurname"
                            :max-length="getMaxLength()"
                            :placeholder="labels.MaternalName"
                            :class="{
                                '-isInvalid':
                                    hasCustomerMaternalSurnameApiError ||
                                    $v.customerMaternalSurname.$error
                            }"
                            data-testid="input-maternalSurname"
                            aria-describedby="maternalSurnameErrorMsg"
                            @keydown="clearApiError('hasCustomerMaternalSurnameApiError')"
                            @blur="$v.customerMaternalSurname.$touch()"
                        />
                        <FormFieldErrorMessage
                            id="maternalSurnameErrorMsg"
                            :is-visible="
                                hasCustomerMaternalSurnameApiError ||
                                    $v.customerMaternalSurname.$error
                            "
                            :msg="
                                hasCustomerMaternalSurnameApiError
                                    ? getApiError('customermaternalsurname')
                                    : labels.MaternalNameErrorMessage
                            "
                            modifier-classes="-no-icon"
                        />
                    </div>
                </template>

                <!-- Fiscal Regimen -->
                <div class="flex flex-col">
                    <label for="fiscalRegimen" class="text-sm font-medium mb-5">
                        {{ labels.FiscalRegimen }}
                    </label>
                    <!-- Persona Fisica  -->
                    <template v-if="isIndividual">
                        <drop-down
                            id="fiscalRegimen"
                            :key="taxEntityType"
                            :aria-labelledby="fiscalRegimenAriaLabel"
                            :aria-label="labels.FiscalRegimen"
                            :disable-search="true"
                            :is-filter-enabled="false"
                            :is-invalid="hasTaxRegimeErrorIndividual"
                            :items="fiscalRegimenOptionsIndividual"
                            :value="selectedFiscalRegimenOptionIndividual"
                            class="relative"
                            option-modifier="py-5 text-base text-gray-150 leading-initial"
                            data-testid="select-fiscalRegimen"
                            aria-describedby="fiscalRegimenErrorMsg"
                            @input="updateFiscalRegimen('selectedFiscalRegimenOptionIndividual', $event)"
                        />
                        <FormFieldErrorMessage
                            id="fiscalRegimenErrorMsg"
                            :is-visible="
                                hasTaxRegimeErrorIndividual
                            "
                            :msg="
                                hasTaxRegimeTypeIDApiError && !!fiscalRegimenIndividual
                                    ? getApiError('taxregimetypeid')
                                    : labels.FiscalRegimenErrorMessage
                            "
                            modifier-classes="-no-icon"
                        />
                    </template>
                    <!-- Persona Moral -->
                    <template v-else>
                        <drop-down
                            id="fiscalRegimen"
                            :key="taxEntityType"
                            :aria-labelledby="fiscalRegimenAriaLabel"
                            :aria-label="labels.FiscalRegimen"
                            :disable-search="true"
                            :is-filter-enabled="false"
                            :is-invalid="hasTaxRegimeErrorBusiness"
                            :items="fiscalRegimenOptionsBusiness"
                            :value="selectedFiscalRegimenOptionBusiness"
                            class="relative"
                            option-modifier="py-5 text-base text-gray-150 leading-initial"
                            data-testid="select-fiscalRegimen"
                            aria-describedby="fiscalRegimenErrorMsg"
                            @input="updateFiscalRegimen('selectedFiscalRegimenOptionBusiness', $event)"
                        />
                        <FormFieldErrorMessage
                            id="fiscalRegimenErrorMsg"
                            :is-visible="
                                hasTaxRegimeErrorBusiness
                            "
                            :msg="
                                hasTaxRegimeTypeIDApiError && !!fiscalRegimenBusiness
                                    ? getApiError('taxregimetypeid')
                                    : labels.FiscalRegimenErrorMessage
                            "
                            modifier-classes="-no-icon"
                        />
                    </template>
                </div>

                <!-- USO CFDI -->
                <div class="flex flex-col">
                    <label for="useCfdi" class="text-sm font-medium mb-5">
                        {{ labels.UseCfdi }}
                    </label>
                    <input-basic
                        id="useCfdi"
                        :value="cfdiUseValue"
                        disabled
                        class="-disabled"
                        data-testid="input-useCfdi"
                    />
                </div>

                <!-- Pay Method -->
                <div class="flex flex-col">
                    <label for="payMethod" class="text-sm font-medium mb-5">
                        {{ labels.PayMethod }}
                    </label>
                    <input-basic
                        id="payMethod"
                        :value="payMethodDisplayLabel"
                        disabled
                        class="-disabled"
                        data-testid="input-payMethod"
                    />
                </div>

                <!-- Email -->
                <div class="flex flex-col">
                    <label for="email" class="text-sm font-medium mb-5">
                        {{ labels.EmailAddress }}
                    </label>
                    <input-basic
                        id="email"
                        v-model="emailValue"
                        type="email"
                        name="email"
                        :placeholder="labels.EmailPlaceholder"
                        :class="{ '-isInvalid': $v.emailValue.$error }"
                        :max-length="getMaxLength()"
                        data-testid="input-email"
                        aria-describedby="emailErrorMsg"
                        @blur="$v.emailValue.$touch()"
                    />
                    <FormFieldErrorMessage
                        id="emailErrorMsg"
                        :is-visible="$v.emailValue.$error"
                        :msg="labels.EmailAddressErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>

                <!-- Postal Code -->
                <div class="flex flex-col">
                    <label for="postalCode" class="text-sm font-medium mb-5">
                        {{ labels.PostalCode }}
                    </label>
                    <input-basic
                        id="postalCode"
                        v-model="postalCodeValue"
                        name="postalCode"
                        :max-length="getMaxLength('postalCode')"
                        :placeholder="labels.PostalCodePlaceholder"
                        :class="{
                            '-isInvalid':
                                hasPostalCodeApiError ||
                                $v.postalCodeValue.$error
                        }"
                        data-testid="input-postalCode"
                        aria-describedby="postalCodeErrorMsg"
                        @blur="$v.postalCodeValue.$touch()"
                        @keydown="[clearApiError('hasPostalCodeApiError'), formatPostalCode]"
                    />
                    <FormFieldErrorMessage
                        id="postalCodeErrorMsg"
                        :is-visible="
                            hasPostalCodeApiError ||
                                $v.postalCodeValue.$error
                        "
                        :msg="
                            hasPostalCodeApiError
                                ? getApiError('postalcode')
                                : labels.PostalCodeErrorMessage
                        "
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <!-- Submit -->
            <div class="mt-30">
                <v-button
                    type="button"
                    class="-medium"
                    data-testid="button-submit"
                    :aria-label="submitLabel"
                    :cta="submitLabel"
                    :class="`${isDisabled ? '-disabled -cursor-pointer' : ''}`"
                    @click="handleSubmit"
                />
            </div>
        </div>
    </form>
</template>

<script>
    import apiCfdiPrefilledTaxData from '@api/routes/cfdi/prefilledTaxData';
    import formHelper from '@common/source/js/vue/utils/form-helper.js';
    import { validationMixin } from 'vuelidate';
    import { required, requiredIf } from 'vuelidate/lib/validators';
    import FormFieldErrorMessage from '@productstore/source/js/vue/components/01-molecules/form-field-error-message/FormFieldErrorMessage.vue';

    const TaxEntity = {
        INDIVIDUAL: 'individual',
        BUSINESS: 'business'
    };

    export default {
        name: 'CfdiProductInvoiceForm',
        components: {
            FormFieldErrorMessage
        },
        mixins: [validationMixin],
        props: {
            cfdiApiErrorMessages: {
                type: Array,
                default: () => []
            },
            cfdiUseValue: {
                type: String,
                default: ''
            },
            hasMultiplePayMethods: {
                type: Boolean,
                default: false
            },
            isSubmitting: {
                type: Boolean,
                default: false
            },
            isUserErrors: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            orderNumber: {
                type: String,
                default: ''
            },
            payMethod: {
                type: String,
                default: ''
            },
            postalCode: {
                type: String,
                default: ''
            }
        },
        validations() {
            const RFC_PATTERNS = {
                [TaxEntity.INDIVIDUAL]: /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/,
                [TaxEntity.BUSINESS]: /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/
            };

            const rfcFormat = (value, entityType) => {
                if(!value) return true;
                const raw = value.toUpperCase();
                const pattern = entityType === TaxEntity.BUSINESS
                    ? RFC_PATTERNS[TaxEntity.BUSINESS]
                    : RFC_PATTERNS[TaxEntity.INDIVIDUAL];
                return pattern.test(raw);
            };

            return {
                emailValue: {
                    required,
                    isValidEmail: v => formHelper.isValidEmail(v)
                },
                fiscalRegimenBusiness: {
                    required: v => {
                        if(!this.isBusiness) return true;
                        return !!v && v !== this.fiscalRegimenValuesBusiness?.[0];
                    }
                },
                fiscalRegimenIndividual: {
                    required: v => {
                        if(!this.isIndividual) return true;
                        return !!v && v !== this.fiscalRegimenValuesIndividual?.[0];
                    }
                },
                rfcBusiness: {
                    required: requiredIf(() => this.isBusiness),
                    rfcFormat: value => {
                        if(!this.isBusiness) return true;
                        return rfcFormat(value, TaxEntity.BUSINESS);
                    }
                },
                rfcIndividual: {
                    required: requiredIf(() => this.isIndividual),
                    rfcFormat: value => {
                        if(!this.isIndividual) return true;
                        return rfcFormat(value, TaxEntity.INDIVIDUAL);
                    }
                },
                razonSocial: {
                    required: requiredIf(() => this.isBusiness)
                },
                customerName: { required: requiredIf(() => !this.isBusiness) },
                customerPaternalSurname: { required: requiredIf(() => !this.isBusiness) },
                customerMaternalSurname: { required: requiredIf(() => !this.isBusiness) },
                postalCodeValue: {
                    required,
                    isValidPostalCode: v => formHelper.isValidPostalCode(v, 'mx')
                }
            };
        },
        data() {
            return {
                apiErrorsByField: {}, // Map raw API errors by field
                customerMaternalSurname: '',
                customerName: '',
                customerPaternalSurname: '',
                emailValue: '',
                firstName: '',
                fiscalRegimenBusiness: '',
                fiscalRegimenIndividual: '',
                hasCustomerMaternalSurnameApiError: false,
                hasCustomerNameApiError: false,
                hasCustomerPaternalSurnameApiError: false,
                hasInteractedFiscalRegimenBusiness: false,
                hasInteractedFiscalRegimenIndividual: false,
                hasInteractedRfcBusiness: false,
                hasInteractedRfcIndividual: false,
                hasTaxRegimeTypeIDApiError: false,
                hasPostalCodeApiError: false,
                hasRazonSocialApiError: false,
                hasRfcConHomoclaveApiError: false,
                hasRfcNumberApiError: false,
                initialPersonaType: '',
                loadingPrefilledTaxData: false,
                loading: false,
                maternalSurname: '',
                paternalSurname: '',
                postalCodeValue: '',
                prefilledData: {},
                razonSocial: '',
                rfcBusiness: '',
                rfcIndividual: '',
                selectedFiscalRegimenOptionBusiness: '',
                selectedFiscalRegimenOptionIndividual: '',
                taxEntityType: ''
            };
        },
        computed: {
            fiscalRegimenOptionsBusiness() {
                return this.mapRegimenOptions(this.labels.FiscalRegimenOptionsMoral);
            },
            fiscalRegimenOptionsIndividual() {
                return this.mapRegimenOptions(this.labels.FiscalRegimenOptionsFisica);
            },
            fiscalRegimenValuesBusiness() {
                return this.labels.FiscalRegimenOptionsMoral.map(i => i.value) || [];
            },
            fiscalRegimenValuesIndividual() {
                return this.labels.FiscalRegimenOptionsFisica.map(i => i.value) || [];
            },
            fiscalRegimenAriaLabel() {
                const source = this.isBusiness
                    ? this.labels?.FiscalRegimenOptionsMoral
                    : this.labels?.FiscalRegimenOptionsFisica;
                const selectedValue = this.isBusiness
                    ? this.fiscalRegimenBusiness
                    : this.fiscalRegimenIndividual;
                const match = source.find(option => String(option?.value || '') === String(selectedValue));
                return match?.label || '';
            },
            hasRfcErrorBusiness() {
                return this.shouldShowRfcApiErrorBusiness || this.$v.rfcBusiness.$error;
            },
            hasRfcErrorIndividual() {
                return this.shouldShowRfcApiErrorIndividual || this.$v.rfcIndividual.$error;
            },
            hasTaxRegimeErrorBusiness() {
                return (this.initialPersonaType === TaxEntity.BUSINESS && this.hasTaxRegimeTypeIDApiError) ||
                    this.$v.fiscalRegimenBusiness.$error;
            },
            hasTaxRegimeErrorIndividual() {
                return (this.initialPersonaType === TaxEntity.INDIVIDUAL && this.hasTaxRegimeTypeIDApiError) ||
                    this.$v.fiscalRegimenIndividual.$error;
            },
            hasMappedErrors() {
                return (
                    this.isUserErrors &&
                    this.cfdiApiErrorMessages &&
                    this.cfdiApiErrorMessages.length > 0
                );
            },
            isBusiness() {
                return this.taxEntityTypeNormalized === TaxEntity.BUSINESS;
            },
            isDisabled() {
                return this.$v.$invalid || this.isSubmitting;
            },
            isIndividual() {
                return this.taxEntityTypeNormalized === TaxEntity.INDIVIDUAL;
            },
            maxNameLength() {
                return formHelper.maxChar.default.name;
            },
            payMethodDisplayLabel() {
                return this.hasMultiplePayMethods ? this.labels.MultiplePayMethods : this.payMethodLabel;
            },
            payMethodInfo() {
                return (
                    this.payMethodMap[this.payMethodNormalized] || {
                        label: this.payMethod,
                        value: this.payMethod
                    }
                );
            },
            payMethodLabel() {
                return this.payMethodInfo.label;
            },
            payMethodMap() {
                const list = this.labels?.PayMethodOptions || [];
                return list.reduce((acc, item) => {
                    if(item?.value) acc[item.value.toLowerCase()] = item;
                    return acc;
                }, {});
            },
            rfcErrorMessageBusiness() {
                return this.shouldShowRfcApiErrorBusiness
                    ? this.getApiError('rfcnumber')
                    : this.labels.RfcErrorMessage;
            },
            rfcErrorMessageIndividual() {
                return this.shouldShowRfcApiErrorIndividual
                    ? this.getApiError('rfcnumber')
                    : this.labels.RfcErrorMessage;
            },
            shouldShowRfcApiErrorBusiness() {
                return !this.hasInteractedRfcBusiness &&
                    this.initialPersonaType === TaxEntity.BUSINESS &&
                    this.hasRfcNumberApiError;
            },
            shouldShowRfcApiErrorIndividual() {
                return !this.hasInteractedRfcIndividual &&
                    this.initialPersonaType === TaxEntity.INDIVIDUAL &&
                    this.hasRfcNumberApiError;
            },
            payMethodNormalized() {
                return (this.payMethod || '').toLowerCase();
            },
            payMethodType() {
                return this.payMethodInfo.value;
            },
            rawRfcMaxLength() {
                // Length without hyphens
                return this.isBusiness ? 12 : 13;
            },
            rfcDisplayMaxLength() {
                // Raw + 2 hyphens
                return this.rawRfcMaxLength + 2;
            },
            rfcDisplayBusiness: {
                get() {
                    return this.formatRfcDisplay(this.rfcBusiness, 'business');
                },
                set(value) {
                    this.rfcBusiness = this.normalizeRfcInput(value, 'business');
                }
            },
            rfcDisplayIndividual: {
                get() {
                    return this.formatRfcDisplay(this.rfcIndividual, 'individual');
                },
                set(value) {
                    this.rfcIndividual = this.normalizeRfcInput(value, 'individual');
                }
            },
            rfcPlaceholder() {
                return this.isBusiness ? this.labels.RfcBusinessPlaceholder : this.labels.RfcPersonalPlaceholder;
            },
            submitLabel() {
                return this.hasMappedErrors
                    ? this.labels.ResubmitInvoiceRequest
                    : this.labels.RequestInvoiceButton;
            },
            taxEntityTypeNormalized() {
                return (this.taxEntityType || '').toString().toLowerCase();
            }
        },
        watch: {
            postalCodeValue(newVal) {
                if(newVal) {
                    // Clean any non-numeric characters after paste
                    const numericOnly = newVal.replace(/[^0-9]/g, '');
                    if(numericOnly !== newVal) {
                        this.$nextTick(() => {
                            this.postalCodeValue = numericOnly;
                        });
                    }
                }
            },
            taxEntityType() {
                // Reset unless drop down actually interacted
                this.hasInteractedFiscalRegimenBusiness = false;
                this.hasInteractedFiscalRegimenIndividual = false;
                this.hasInteractedRfcBusiness = false;
                this.hasInteractedRfcIndividual = false;
                this.$emit('taxEntityUpdated');
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.postalCodeValue = this.postalCode || '';
                this.getPrefilledTaxData();
                if(this.hasMappedErrors) {
                    this.buildMappedErrorObject();
                    this.cfdiApiErrorMessages.forEach(err => {
                        this[`has${err.ErrorField}ApiError`] = true;
                    });
                }
            });
        },
        methods: {
            applyPrefilledRegimensAndRfc() {
                // Find matching index and set initialFiscalRegimen as returned from API
                // or default to first option
                const fiscalRegimenValues = this.isBusiness
                    ? this.fiscalRegimenValuesBusiness
                    : this.fiscalRegimenValuesIndividual;
                const fiscalRegimenOptions = this.isBusiness
                    ? this.fiscalRegimenOptionsBusiness
                    : this.fiscalRegimenOptionsIndividual;
                let selectedFiscalRegimenOption = '';
                let fiscalRegimen = '';
                const matchingIndex = fiscalRegimenValues && fiscalRegimenValues.length > 0
                    ? fiscalRegimenValues.findIndex(
                        i => {
                            return i === this.prefilledData?.TaxRegimeTypeID?.toString();
                        }
                    )
                    : -1;
                if(fiscalRegimenValues && fiscalRegimenValues.length > 0 && matchingIndex > -1) {
                    selectedFiscalRegimenOption = fiscalRegimenOptions[matchingIndex];
                    fiscalRegimen = fiscalRegimenValues[matchingIndex];
                } else if(fiscalRegimenOptions && fiscalRegimenOptions.length > 0) {
                    selectedFiscalRegimenOption = fiscalRegimenOptions[0];
                    fiscalRegimen = fiscalRegimenValues[0];
                } else {
                    selectedFiscalRegimenOption = '';
                    fiscalRegimen = '';
                }
                this.selectedFiscalRegimenOptionBusiness = this.isBusiness ? selectedFiscalRegimenOption : this.fiscalRegimenOptionsBusiness[0] || '';
                this.selectedFiscalRegimenOptionIndividual = this.isIndividual ? selectedFiscalRegimenOption : this.fiscalRegimenOptionsIndividual[0] || '';

                this.fiscalRegimenIndividual = this.isIndividual ? fiscalRegimen : '';
                this.fiscalRegimenBusiness = this.isBusiness ? fiscalRegimen : '';

                this.rfcIndividual = this.isIndividual ? this.prefilledData?.RfcNumber || '' : '';
                this.rfcBusiness = this.isBusiness ? this.prefilledData?.RfcNumber || '' : '';
            },
            // Map API errors by field for easy lookup
            buildMappedErrorObject() {
                this.apiErrorsByField = (this.cfdiApiErrorMessages || []).reduce(
                    (acc, error) => {
                        const rawKey = error?.ErrorField;
                        if(!rawKey) return acc;
                        const key = String(rawKey).toLowerCase();
                        const msg =
                            error?.ErrorMessage || '';
                        if(msg) acc[key] = msg;
                        return acc;
                    },
                    {}
                );
            },
            clearApiError(field) {
                this[field] = false;
            },
            formatPostalCode(e) {
                formHelper.handleNonNumericValue(e);
            },
            formatRfcDisplay(raw, entityKey) {
                if(!raw) return '';
                const upper = raw.toUpperCase();
                const parts = entityKey === 'business'
                    ? [upper.slice(0, 3), upper.slice(3, 9), upper.slice(9, 12)]
                    : [upper.slice(0, 4), upper.slice(4, 10), upper.slice(10, 13)];
                return parts.filter(Boolean).join('-');
            },
            normalizeRfcInput(value, entityKey) {
                const max = entityKey === 'business' ? 12 : 13;
                return (value || '')
                    .replace(/[^0-9A-Za-zÑñ&]/g, '')
                    .toUpperCase()
                    .slice(0, max);
            },
            getApiError(field) {
                return this.apiErrorsByField[field] || '';
            },
            async getPrefilledTaxData() {
                try {
                    this.loadingPrefilledTaxData = true;
                    const response = await apiCfdiPrefilledTaxData.get(this.cfdiApiErrorMessages.length > 0 ? `?OrderNumber=${this.orderNumber}` : '');
                    if(response.success && response.data?.Success) {
                        this.prefilledData = response.data?.Data || {};
                        this.customerMaternalSurname = this.prefilledData?.CustomerMaternalSurname || '';
                        this.customerName = this.prefilledData?.CustomerName || '';
                        this.customerPaternalSurname = this.prefilledData?.CustomerPaternalSurname || '';
                        this.emailValue = this.prefilledData?.EmailAddress || '';
                        this.postalCodeValue = this.prefilledData?.PostalCode || '';
                        this.razonSocial = this.prefilledData?.RazonSocial || '';
                        this.taxEntityType =
                            (this.prefilledData?.PersonaType || '').toLowerCase() === 'persona moral'
                                ? TaxEntity.BUSINESS
                                : TaxEntity.INDIVIDUAL;
                        this.initialPersonaType = this.taxEntityType;
                        this.applyPrefilledRegimensAndRfc();
                    } else {
                        console.error('There was an issue with the request:', response.data?.ErrorMessages || '');
                    }
                } catch (error) {
                    console.error('Some Network issue:', error);
                } finally {
                    this.loadingPrefilledTaxData = false;
                }
            },
            getMaxLength(field) {
                return field && field === 'postalCode'
                    ? formHelper.maxChar.mxImprovedUx.postalCode
                    : 100;
            },
            handleSubmit() {
                if(this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }
                // Prepare payload for parent
                let payload = {
                    EmailAddress: this.emailValue,
                    OrderNumber: this.orderNumber,
                    PersonaType: this.isBusiness ? 'Persona Moral' : 'Persona Fisica',
                    PostalCode: this.postalCodeValue,
                    RfcNumber: this.isBusiness ? this.rfcBusiness : this.rfcIndividual,
                    TaxRegimeTypeID: Number(this.isBusiness ? this.fiscalRegimenBusiness : this.fiscalRegimenIndividual),
                    UsoDeCfdi: this.cfdiUseValue
                };
                if(this.isIndividual) {
                    Object.assign(payload, {
                        CustomerName: this.customerName,
                        CustomerPaternalSurname: this.customerPaternalSurname,
                        CustomerMaternalSurname: this.customerMaternalSurname
                    });
                } else {
                    payload.RazonSocial = this.razonSocial;
                }
                this.$emit('submit', payload);
            },
            mapRegimenOptions(list) {
                if(!Array.isArray(list)) return [];
                return list.map(item =>
                    !item?.value
                        ? item?.label || ''
                        : `<span class='font-medium text-black'>${item.value}</span><span> - </span>${item.label}`
                );
            },
            updateFiscalRegimen(field, option) {
                // Looks up the proper options/values array for either the business or individual list,
                // falls back to each list’s default when needed,
                // and stores both the display option and numeric value on the correct state fields.
                const isBusinessField = field === 'selectedFiscalRegimenOptionBusiness';
                const options = isBusinessField
                    ? this.fiscalRegimenOptionsBusiness
                    : this.fiscalRegimenOptionsIndividual;
                const values = isBusinessField
                    ? this.fiscalRegimenValuesBusiness
                    : this.fiscalRegimenValuesIndividual;
                const defaultOption = options[0] || '';
                const defaultValue = values[0] || '';
                const index = options.indexOf(option);
                const resolvedOption = index !== -1 ? options[index] : defaultOption;
                const resolvedValue = index !== -1 ? values[index] : defaultValue;

                if(isBusinessField) {
                    this.hasInteractedFiscalRegimenBusiness = true;
                } else {
                    this.hasInteractedFiscalRegimenIndividual = true;
                }

                this[field] = resolvedOption;
                if(isBusinessField) {
                    this.fiscalRegimenBusiness = resolvedValue;
                } else {
                    this.fiscalRegimenIndividual = resolvedValue;
                }

                const matchesInitialPersona = isBusinessField
                    ? this.initialPersonaType === 'business'
                    : this.initialPersonaType === 'individual';
                const hasInteracted = isBusinessField
                    ? this.hasInteractedFiscalRegimenBusiness
                    : this.hasInteractedFiscalRegimenIndividual;

                if(hasInteracted && matchesInitialPersona && this.hasTaxRegimeTypeIDApiError) {
                    this.clearApiError('hasTaxRegimeTypeIDApiError');
                }
            },
            handleRfcInteraction(entityKey) {
                const isBusiness = entityKey === TaxEntity.BUSINESS || entityKey === 'business';
                if(isBusiness) {
                    this.hasInteractedRfcBusiness = true;
                } else {
                    this.hasInteractedRfcIndividual = true;
                }

                const matchesInitialPersona = isBusiness
                    ? this.initialPersonaType === TaxEntity.BUSINESS
                    : this.initialPersonaType === TaxEntity.INDIVIDUAL;
                const hasInteracted = isBusiness
                    ? this.hasInteractedRfcBusiness
                    : this.hasInteractedRfcIndividual;

                if(matchesInitialPersona && hasInteracted && this.hasRfcNumberApiError) {
                    this.clearApiError('hasRfcNumberApiError');
                }
            }
        }
    };
</script>

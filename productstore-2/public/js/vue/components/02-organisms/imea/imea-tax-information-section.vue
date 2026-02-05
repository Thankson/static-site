<template>
    <div class="o-imeaTaxInformationSection">
        <hr class="pt-20" />
        <h2 class="o-imeaTaxInformationSection__heading">
            {{ componentLabels?.Heading }}
        </h2>
        <p class="o-imeaTaxInformationSection__description" v-html="componentLabels?.SubHeading"></p>

        <div class="o-imeaTaxInformationSection__form">
            <div class="o-imeaTaxInformationSection__row -details">
                <div
                    class="o-imeaTaxInformationSection__inputField"
                >
                    <label class="text-sm font-medium uppercase" for="name">
                        {{ componentLabels?.Name?.Text }}

                    </label>
                    <input-basic
                        id="name"
                        v-model="name"
                        :tailwind-mods="
                            $v.name.$error ? '-isInvalid' : null
                        "
                        max-length="100"
                        min-length="10"
                        :placeholder="componentLabels?.Name?.Placeholder"
                        auto-complete="off"
                        @blur="validateField('name')"
                    />

                    <FormFieldErrorMessage
                        id="nameError"
                        :is-visible="$v.name.$error"
                        :msg="componentLabels?.Name?.RequiredErrorMessage" />

                </div>
                <div
                    class="o-imeaTaxInformationSection__inputField"
                >
                    <label class="text-sm font-medium uppercase" for="paternalSurname">
                        {{ componentLabels?.PaternalSurname?.Text }}

                    </label>
                    <input-basic
                        id="paternalSurname"
                        v-model="paternalSurname"
                        class=""
                        max-length="100"
                        min-length="10"
                        :tailwind-mods="
                            $v.paternalSurname.$error ? '-isInvalid' : null
                        "
                        :placeholder="componentLabels?.PaternalSurname?.Placeholder"
                        auto-complete="off"
                        @blur="validateField('paternalSurname')"
                    />

                    <FormFieldErrorMessage
                        id="paternalSurnameError"
                        :is-visible="$v.paternalSurname.$error"
                        :msg="componentLabels?.PaternalSurname?.RequiredErrorMessage" />

                </div>
            </div>

            <div class="o-imeaTaxInformationSection__row -details">
                <div
                    class="o-imeaTaxInformationSection__inputField"
                >
                    <label class="text-sm font-medium uppercase" for="maternalSurname">
                        {{ componentLabels?.MaternalSurname?.Text }}

                    </label>
                    <input-basic
                        id="maternalSurname"
                        v-model="maternalSurname"
                        :tailwind-mods="
                            $v.maternalSurname.$error ? '-isInvalid' : null
                        "
                        max-length="100"
                        min-length="10"
                        :placeholder="componentLabels?.MaternalSurname?.Placeholder"
                        auto-complete="off"
                        @blur="validateField('maternalSurname')"
                    />

                    <FormFieldErrorMessage
                        id="maternalSurnameError"
                        :is-visible="$v.maternalSurname.$error"
                        :msg="componentLabels?.MaternalSurname?.RequiredErrorMessage" />

                </div>

                <div class="o-imeaTaxInformationSection__inputFields">

                    <div
                        class="o-imeaTaxInformationSection__inputField grid"
                    >
                        <label class="text-sm font-medium uppercase" for="entityType">
                            {{ componentLabels?.EntityType?.Text }}
                        </label>

                        <v-select
                            id="entityType"
                            ref="entityType"
                            v-model="entityType"
                            :initial="entityTypeOptions[0]"
                            aria-label="Select Region and Language"
                            :is-required="componentLabels?.EntityType?.Required"
                            select-mod="-sm-md -padding-md"
                            data-testid="entityTypeSelect"
                            validation-alert="Select one of the options."
                            :placeholder="componentLabels?.EntityType?.Placeholder"
                            :options="entityTypeOptions"
                            :select-element-mod="`${$v.entityType.$error ? '-error' : ''}`"
                            :arrow-other-mods="'absolute -filled right-15 top-16 pointer-events-none'"
                            @change="onEntityTypeChange"
                        >
                        </v-select>
                        <FormFieldErrorMessage
                            id="entityTypeError"
                            :is-visible="$v.entityType.$error"
                            :msg="componentLabels?.EntityType?.RequiredErrorMessage"
                            modifier-classes="-no-icon"
                        />

                    </div>

                    <div
                        class="o-imeaTaxInformationSection__inputField"
                    >
                        <label class="text-sm font-medium uppercase" for="rfcField">
                            {{ componentLabels?.Rfc?.Text }}
                        </label>

                        <v-input
                            id="rfcField"
                            v-model="rfcDisplay"
                            model-name="inputValue"
                            :tailwind-mods="
                                $v.rfcNumber.$error ? '-isInvalid' : null
                            "
                            name="rfcNumber"
                            :max-length="rfcDisplayMaxLength"
                            :placeholder="componentLabels?.Rfc?.Placeholder"
                            aria-required="true"
                            :aria-invalid="$v.rfcNumber.$error"
                            :aria-describedby="
                                $v.rfcNumber.$error
                                    ? 'rfcNumberError'
                                    : false
                            "
                            @blur="validateField('rfcNumber')"
                        />
                        <FormFieldErrorMessage
                            id="rfcNumberError"
                            :is-visible="$v.rfcNumber.$error"
                            :msg="determineRfcNumberErrorMsg()"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>

            </div>

            <div class="o-imeaTaxInformationSection__row" :class="showCurpNumberField ? '-curpNumber' : '-addressDetails'">
                <div
                    v-if="showCurpNumberField"
                    class="o-imeaTaxInformationSection__inputField"
                >
                    <label class="text-sm font-medium uppercase" for="curpNumberField">
                        {{ componentLabels?.CurpNumber?.Text }}
                    </label>

                    <v-input
                        id="curpNumberField"
                        v-model="curpNumber"
                        class="uppercase"
                        model-name="inputValue"
                        :tailwind-mods="
                            $v.curpNumber.$error ? '-isInvalid' : null
                        "
                        name="curpNumber"
                        :placeholder="componentLabels?.CurpNumber?.Placeholder"
                        aria-required="true"
                        :aria-invalid="$v.curpNumber.$error"
                        :aria-describedby="
                            $v.curpNumber.$error ? 'curpNumberError' : false
                        "
                        @blur="validateField('curpNumber')"
                    />
                    <FormFieldErrorMessage
                        id="curpNumberError"
                        :is-visible="$v.curpNumber.$error"
                        :msg="determineCurpNumberErrorMsg()"
                        modifier-classes="-no-icon"
                    />
                </div>
                <div :class="[{'-grid':showCurpNumberField }]">
                    <div
                        class="o-imeaTaxInformationSection__inputField"
                    >
                        <label class="text-sm font-medium uppercase" for="postalCodeField">
                            {{ componentLabels?.PostalCode?.Text }}
                        </label>

                        <input-basic
                            id="postalCodeField"
                            v-model="postalCode"
                            :tailwind-mods="
                                $v.postalCode.$error ? '-isInvalid' : null
                            "
                            max-length="5"
                            :placeholder="componentLabels?.PostalCode?.Placeholder"
                            auto-complete="off"
                            @blur="validateField('postalCode')"
                        />
                        <FormFieldErrorMessage
                            id="postalCodeError"
                            :is-visible="$v.postalCode.$error"
                            :msg="determinePostalCodeError" />
                    </div>
                </div>

            </div>

            <div v-if="showAcknowledgement" class="o-imeaTaxInformationSection__row -acknowledgement">
                <div
                    class="o-imeaTaxInformationSection__inputField"
                >
                    <m-checkbox
                        v-model="acknowledgement"
                        class="acknowledgement__checkbox"
                        :name="showAcknowledgementLabel"
                        :label="showAcknowledgementLabel"
                        :label-mods="`${hasCheckboxError ? '-error' : ''} -items-start`"
                        :aria-required="componentLabels?.LegalAcknowledgment?.Required || false"
                        :required="componentLabels?.LegalAcknowledgment?.Required"
                    >
                    </m-checkbox>

                    <FormFieldErrorMessage
                        id="acknowledgementError"
                        :is-visible="hasCheckboxError"
                        :msg="componentLabels?.LegalAcknowledgment?.RequiredErrorMessage" />

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { validationMixin } from 'vuelidate';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import { requiredIf } from 'vuelidate/lib/validators';
    import { isValidCurpNumber } from '@productstore/source/js/vue/utils/mx-form-helper';
    import eventBus from '../../../mixins/event-bus';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';
    import formHelper from '../../../../../../../_common/source/js/vue/utils/form-helper';
    import isEmpty from 'lodash/isEmpty';

    const RFC_PATTERNS = {
        FISICA: /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/, // 13 chars
        MORAL: /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/ // 12 chars
    };

    // --- Utility functions ---
    function formatRfc(raw) {
        if(!raw) return '';
        const clean = raw.replace(/[^A-Z0-9Ñ&]/gi, '').toUpperCase();
        if(clean.length === 13) return `${clean.slice(0, 4)}-${clean.slice(4, 10)}-${clean.slice(10)}`;
        if(clean.length === 12) return `${clean.slice(0, 3)}-${clean.slice(3, 9)}-${clean.slice(9)}`;
        return clean;
    }

    function cleanRfc(value) {
        return value ? value.replace(/[^A-Z0-9Ñ&]/gi, '').toUpperCase().slice(0, 13) : '';
    }

    function isValidRfc(value) {
        if(!value) return false;
        const clean = cleanRfc(value);
        if(clean.length < 12) return false;
        return clean.length === 12
            ? RFC_PATTERNS.MORAL.test(clean)
            : RFC_PATTERNS.FISICA.test(clean);
    }

    export default {
        name: 'OImeaTaxInformationSection',
        components: {
            FormFieldErrorMessage,
            vInput
        },
        mixins: [localizationMixin, validationMixin],
        validations() {
            return {
                name: {
                    required: requiredIf(() => this.componentLabels?.Name?.Required)
                },
                maternalSurname: {
                    required: requiredIf(() => this.componentLabels?.MaternalSurname?.Required)
                },
                paternalSurname: {
                    required: requiredIf(() => this.componentLabels?.PaternalSurname?.Required)
                },
                postalCode: {
                    required: requiredIf(() => this.componentLabels?.PostalCode?.Required),
                    isLengthValid: v => {
                        const MEXICO_POSTAL_CODE_LENGTH = 5;
                        if(this.isMx && v?.length > 0) {
                            return v?.length === MEXICO_POSTAL_CODE_LENGTH;
                        } else {
                            return true;
                        }
                    },
                    isValidPostalCode: v => formHelper.isValidPostalCode(v, 'mx')
                },
                entityType: {
                    required: requiredIf(() => this.componentLabels?.EntityType?.Required)
                },
                rfcNumber: {
                    required: requiredIf(() => this.componentLabels?.Rfc?.Required),
                    validFormat: (value) => isValidRfc(value)
                },
                curpNumber: {
                    required: requiredIf(() => this.componentLabels?.CurpNumber?.Required && this.entityType === 'individual'),
                    valid: val => {
                        if(!val) return true;
                        return isValidCurpNumber(val);
                    }
                },
                acknowledgement: {
                    required: requiredIf(() => {
                        return (
                            this.componentLabels?.LegalAcknowledgment?.Required &&
                            ['entrepreneur', 'resico'].includes(this.entityType)
                        );
                    }),
                    checked(value) {
                        const required =
                            this.componentLabels?.LegalAcknowledgment?.Required &&
                            ['entrepreneur', 'resico'].includes(this.entityType);
                        return !required || value === true;
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
                name: '',
                curpNumber: '',
                maternalSurname: '',
                rfcNumber: '',
                paternalSurname: '',
                postalCode: '',
                acknowledgement: false,
                entityType: ''
            };
        },
        computed: {
            country() {
                return this.$env?.Country;
            },
            componentLabels() {
                return isEmpty(this.labels) ? (this.localization?.Labels ?? {}) : this.labels;
            },
            determinePostalCodeError() {
                if(this.$v.postalCode.isLengthValid === false) return this.componentLabels?.PostalCode?.LengthErrorMessage;
                else return this.componentLabels?.PostalCode?.RequiredErrorMessage;
            },
            entityTypes() {
                return this.componentLabels?.EntityType?.Options || [];
            },
            entityTypeOptions() {
                if(!this.entityTypes) return [];
                return this.entityTypes.map((entity) => entity.Text);
            },
            isMx() {
                return this.$env?.Country === 'Mexico' || false;
            },
            showCurpNumberField() {
                return this.entityType === 'individual';
            },
            showAcknowledgement() {
                return ['individual', 'resico', 'entrepreneur'].includes(this.entityType);
            },
            showAcknowledgementLabel() {
                const resicoAcknowledgementLabel = this.componentLabels?.LegalAcknowledgment?.ResicoAcknowledgementLabel;
                const entrepreneurAcknowledgementLabel = this.componentLabels?.LegalAcknowledgment?.EntrepreneurAcknowledgementLabel;

                if(this.entityType === 'entrepreneur') return entrepreneurAcknowledgementLabel;
                else if(['resico', 'individual'].includes(this.entityType)) {
                    return `<span> ${entrepreneurAcknowledgementLabel} </span> <br /> <span>${resicoAcknowledgementLabel}</span>`;
                }
                return '';
            },
            rfcDisplayMaxLength() {
                return 15;
            },
            rfcDisplay: {
                get() {
                    return formatRfc(this.rfcNumber);
                },
                set(value) {
                    this.rfcNumber = cleanRfc(value);
                }
            },
            hasCheckboxError() {
                const v = this.$v.acknowledgement;
                return v && v.$dirty && !v.checked;
            }
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            dataLayerPush(fieldName) {
                const labelText = this.getLabelText(fieldName);
                window.dataLayer && window.dataLayer.push({
                    event: 'userEvent',
                    eC: 'CFDIFieldValidation',
                    eA: 'BlankFieldValidationError',
                    eL: 'Please enter ' + labelText
                });
            },
            determineCurpNumberErrorMsg() {
                if(this.$v.curpNumber.required === false) return this.componentLabels?.CurpNumber?.RequiredErrorMessage;
                else if(this.$v.curpNumber.valid === false) {
                    return this.componentLabels?.CurpNumber?.InvalidErrorMessage || 'Invalid CURP format.';
                }
            },
            determineRfcNumberErrorMsg() {
                if(this.$v.rfcNumber.required === false) return this.componentLabels?.Rfc?.RequiredErrorMessage;
                else if(this.$v.rfcNumber.validFormat === false) {
                    return this.componentLabels?.Rfc?.InvalidErrorMessage || 'Invalid RFC format.';
                }
            },
            getLabelKey(fieldName) {
                const map = {
                    name: 'Name',
                    paternalSurname: 'PaternalSurname',
                    maternalSurname: 'MaternalSurname',
                    rfcNumber: 'Rfc',
                    postalCode: 'PostalCode',
                    entityType: 'EntityType',
                    curpNumber: 'CurpNumber'
                };
                return map[fieldName] || fieldName;
            },
            getLabelText(fieldName) {
                const key = this.getLabelKey(fieldName);
                return this.componentLabels?.[key]?.Text || fieldName;
            },
            getTaxInformationData() {
                const payload = {
                    name: this.name,
                    paternalSurname: this.paternalSurname,
                    maternalSurname: this.maternalSurname,
                    rfc: this.rfcNumber,
                    postalCode: this.postalCode,
                    entityType: this.entityType,
                    acknowledgement: this.acknowledgement
                };
                if(this.entityType === 'individual') payload.curpNumber = this.curpNumber?.toUpperCase();
                return { TaxInformation: payload };
            },
            onEntityTypeChange({ value } = {}) {
                if(!value) return;
                const selectedOption = this.entityTypes.find((entity) => entity.Text === value);
                if(selectedOption) {
                    this.entityType = selectedOption.Value;
                }
            },
            setFormValidations() {
                eventBus.$on('validate', () => {
                    this.$v.$touch();
                    const valid = !this.$v.$invalid;
                    eventBus.$emit('getInput', valid ? this.getTaxInformationData() : {}, valid);
                    this.submitTaxInfoGTM();
                });
            },
            submitTaxInfoGTM() {
                const baseFields = [
                    'name',
                    'paternalSurname',
                    'maternalSurname',
                    'entityType',
                    'rfcNumber',
                    'postalCode'
                ];
                const taxInfoFields = this.entityType === 'individual'
                    ? [...baseFields, 'curpNumber']
                    : baseFields;

                taxInfoFields.forEach(taxInfoField => {
                    const v = this.$v && this.$v[taxInfoField];
                    if(!v) return;
                    if(v.$dirty && v.required === false) this.dataLayerPush(taxInfoField);
                });

                if(this.$v.curpNumber.valid === false) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'CFDIFieldValidation',
                        eA: 'CurpFormatValidationError',
                        eL: 'Incorrect Format. Please check for errors.'
                    });
                }
                if(this.$v.rfcNumber.required === true && this.$v.rfcNumber.validFormat === false) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'CFDIFieldValidation',
                        eA: 'RFCFormatValidationError',
                        eL: 'Incorrect Format. Please check for errors.'
                    });
                }
                if(this.$v.postalCode?.isLengthValid === false) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'CFDIFieldValidation',
                        eA: 'PostalCodeLengthValidationError',
                        eL: 'Postal Code must be five numbers.'
                    });
                }
            },
            validateField(fieldName) {
                this.$v[fieldName].$touch();
            }
        }
    };
</script>

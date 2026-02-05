<template>
    <div class="m-birthDateSelector">
        <fieldset>
            <legend :id="`${formId}-birthdate-legend`" class="uppercase font-medium text-sm">
                {{ fieldLabels.Text }} <span v-if="isRequired">*</span>
            </legend>
            <div class="flex">
                <v-select
                    :id="`${formId}-birthMonth`"
                    :class="{ '-error': isInvalid }"
                    select-mod="flex-1 -sm-md -padding-md"
                    arrow-other-mods="absolute -filled right-15 top-16 pointer-events-none"
                    :values="monthOptions"
                    :options="monthOptions"
                    :initial="prefilledDobData && prefilledDobData.Month ? prefilledDobData.Month : monthOptions[0]"
                    :aria-label="placeholders.Month"
                    :aria-labelledby="`${formId}-birthdate-legend`"
                    data-testid="birthDateSelectorMonth"
                    @change="handleChange('birthMonth', $event.value)"
                />
                <v-select
                    :id="`${formId}-birthDay`"
                    :class="{ '-error': isInvalid }"
                    select-mod="flex-1 mx-10 md:mx-30 -sm-md -padding-md"
                    arrow-other-mods="absolute -filled right-15 top-16 pointer-events-none"
                    :values="dayOptions"
                    :options="dayOptions"
                    :initial="prefilledDobData && prefilledDobData.Day ? getDayValue(prefilledDobData.Day) : dayOptions[0]"
                    :aria-label="placeholders.Day"
                    data-testid="birthDateSelectorDay"
                    @change="handleChange('birthDay', $event.value)"
                />
                <div class="flex flex-1 flex-col">
                    <v-select
                        :id="`${formId}-birthYear`"
                        :class="{ '-error': isIneligible || isInvalid }"
                        select-mod="-sm-md -padding-md"
                        :arrow-other-mods="'absolute -filled right-15 top-16 pointer-events-none'"
                        :values="yearOptions"
                        :options="yearOptions"
                        :initial="prefilledDobData && prefilledDobData.Year ? prefilledDobData.Year : yearOptions[0]"
                        :aria-label="placeholders.Year"
                        data-testid="birthDateSelectorYear"
                        @change="handleChange('birthYear', $event.value)"
                    />
                    <FormFieldErrorMessage
                        :id="`${formId}-ageErrorMsg`"
                        :is-visible="isIneligible"
                        :msg="fieldLabels.EighteenUnderAgeError || fieldLabels.UnderAgeError"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <FormFieldErrorMessage
                :id="`${formId}-invalidDateErrorMsg`"
                :is-visible="isInvalid"
                :msg="invalidOrRequiredErrorMsg"
                modifier-classes="-no-icon"
            />
        </fieldset>
    </div>
</template>
<script>
    import FormFieldErrorMessage from '../form-field-error-message/FormFieldErrorMessage.vue';

    export default {
        name: 'MBirthDateSelector',
        components: {
            FormFieldErrorMessage
        },
        props: {
            fieldLabels: {
                type: Object,
                default: () => ({})
            },
            formId: {
                type: String,
                default: 'Self'
            },
            hasValidationBeenTriggered: {
                type: Boolean,
                default: false
            },
            isMinimumAgeValidated: {
                type: Boolean,
                default: false
            },
            isRequired: {
                type: Boolean,
                default: false
            },
            months: {
                type: Array,
                default: () => []
            },
            placeholders: {
                type: Object,
                default: () => ({})
            },
            prefilledDobData: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                birthDay: '',
                birthMonth: '',
                birthYear: '',
                invalidOrRequiredErrorMsg: '',
                isIneligible: false,
                isInvalid: false
            };
        },
        computed: {
            birthDate() {
                return this.isDateSetToAllPlaceholders ||
                    this.isDateSetToAtLeastOnePlaceholder
                    ? null
                    : `${this.birthYear}-${this.monthOptions.indexOf(
                        this.birthMonth
                    )}-${this.birthDay}`;
            },
            dayOptions() {
                let daysInMonth;
                if(this.birthMonth) {
                    if(this.birthMonth === this.monthOptions[2]) {
                        // Check if it's a leap year
                        daysInMonth =
                            (this.birthYear % 4 === 0 &&
                                this.birthYear % 100 !== 0) ||
                            this.birthYear % 400 === 0
                                ? 29
                                : 28;
                    } else {
                        // Months with 31 days
                        const monthsWith31Days = [
                            this.monthOptions[1],
                            this.monthOptions[3],
                            this.monthOptions[5],
                            this.monthOptions[7],
                            this.monthOptions[8],
                            this.monthOptions[10],
                            this.monthOptions[12]
                        ];
                        daysInMonth = monthsWith31Days.includes(this.birthMonth)
                            ? 31
                            : 30;
                    }
                }
                return [
                    this.placeholders?.Day,
                    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
                ];
            },
            isDateNotSetToAnyPlaceholders() {
                return (
                    this.birthDay !== this.dayOptions[0] &&
                    this.birthMonth !== this.monthOptions[0] &&
                    this.birthYear !== this.yearOptions[0]
                );
            },
            isDateSetToAllPlaceholders() {
                return (
                    this.birthDay === this.dayOptions[0] &&
                    this.birthMonth === this.monthOptions[0] &&
                    this.birthYear === this.yearOptions[0]
                );
            },
            isDateSetToAtLeastOnePlaceholder() {
                return (
                    this.birthDay === this.dayOptions[0] ||
                    this.birthMonth === this.monthOptions[0] ||
                    this.birthYear === this.yearOptions[0]
                );
            },
            monthOptions() {
                return (
                    this.months && [
                        this.placeholders?.Month,
                        ...this.months
                    ]
                );
            },
            yearOptions() {
                return [
                    this.placeholders?.Year,
                    ...Array.from(
                        { length: 119 },
                        (_, i) => new Date().getFullYear() - i
                    )
                ];
            }
        },
        methods: {
            evaluateAge() {
                const today = new Date();
                const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                const birthDate = new Date(this.birthDate);
                this.isIneligible = birthDate > eighteenYearsAgo;
            },
            getDayValue(day) {
                if(day.length > 1 && day.charAt(0) === '0') {
                    return day[1];
                }
                return day;
            },
            handleChange(item, value) {
                this[item] = value;
                if(this.hasValidationBeenTriggered) this.validateBirthDate();
            },
            validateBirthDate() {
                if(!this.isRequired && this.isDateSetToAllPlaceholders) {
                    this.isInvalid = false;
                    this.$emit('setBirthDate', this.birthDate, this.isInvalid);
                    return;
                }
                if(this.isDateSetToAtLeastOnePlaceholder) {
                    this.invalidOrRequiredErrorMsg =
                        this.isRequired
                            ? this.fieldLabels?.RequiredErrorMessage
                            : this.fieldLabels?.InvalidDateOfBirthError;
                    this.isInvalid = true;
                    this.isIneligible = false;
                    this.$emit('setBirthDate', this.birthDate, this.isInvalid);
                    return;
                }
                if(this.isDateNotSetToAnyPlaceholders) {
                    this.isInvalid = false;
                    if(this.isMinimumAgeValidated) this.evaluateAge();
                    this.$emit('setBirthDate', this.birthDate, this.isIneligible);
                }
            }
        }
    };
</script>

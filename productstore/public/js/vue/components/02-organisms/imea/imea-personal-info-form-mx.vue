<template>
    <!-- Personal Info Form-->
    <div
        class="o-imeaPersonalInfoForm flex flex-col text-base mt-10"
        :class="{ 'mb-10': formForSelfInfo }"
    >
        <div class="flex flex-col md:flex-row justify-between">
            <!-- First Name -->
            <div v-if="labels.FirstName" class="flex-1 md:mr-15 py-10">
                <label
                    class="uppercase font-medium text-sm"
                    :for="`${formId}-firstName`"
                    v-html="
                        `${labels.FirstName.Text}${
                            labels.FirstName.Required ? requiredSpan : ''
                        }`
                    "
                ></label>
                <v-input
                    :id="`${formId}-firstName`"
                    v-model="firstName"
                    model-name="inputValue"
                    :tailwind-mods="$v.firstName.$error ? '-isInvalid' : null"
                    name="firstName"
                    :placeholder="labels.FirstName.Placeholder"
                    max-length="100"
                    aria-required="true"
                    :aria-invalid="$v.firstName.$error"
                    :aria-describedby="
                        $v.firstName.$error ? 'firstNameErrorMsg' : false
                    "
                    @blur="updateFullName"
                />
                <FormFieldErrorMessage
                    :id="`${formId}-firstNameErrorMsg`"
                    :is-visible="$v.firstName.$error"
                    :msg="labels.FirstName.RequiredErrorMessage"
                    modifier-classes="-no-icon"
                />
            </div>
            <!-- Last Name -->
            <div v-if="labels.LastName" class="flex-1 md:ml-15 py-10">
                <label
                    class="uppercase font-medium text-sm"
                    :for="`${formId}-lastName`"
                    v-html="
                        `${labels.LastName.Text}${
                            labels.LastName.Required ? requiredSpan : ''
                        }`
                    "
                ></label>
                <v-input
                    :id="`${formId}-lastName`"
                    v-model="lastName"
                    model-name="inputValue"
                    :tailwind-mods="$v.lastName.$error ? '-isInvalid' : null"
                    name="lastName"
                    :placeholder="labels.LastName.Placeholder"
                    max-length="100"
                    aria-required="true"
                    :aria-invalid="$v.lastName.$error"
                    :aria-describedby="
                        $v.lastName.$error ? 'lastNameErrorMsg' : false
                    "
                    @blur="updateFullName"
                />
                <FormFieldErrorMessage
                    :id="`${formId}-lastNameErrorMsg`"
                    :is-visible="$v.lastName.$error"
                    :msg="labels.LastName.RequiredErrorMessage"
                    modifier-classes="-no-icon"
                />
            </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between">
            <!-- Second Last Name -->
            <div v-if="labels.MaternalSurname" class="flex-1 md:mr-15 py-10">
                <label
                    class="uppercase font-medium text-sm"
                    :for="`${formId}-secondLastName`"
                    v-html="labels.MaternalSurname.Text"
                ></label>
                <v-input
                    :id="`${formId}-secondLastName`"
                    v-model="secondLastName"
                    model-name="inputValue"
                    name="secondLastName"
                    :placeholder="labels.MaternalSurname.Placeholder"
                    max-length="100"
                    aria-required="false"
                    @blur="updateFullName"
                />
            </div>
            <!-- Phone Fields -->
            <div v-if="labels.Phone" class="flex flex-1 md:ml-15 py-10">
                <!-- PhoneType -->
                <div class="flex-1 mr-5 md:mr-15">
                    <label
                        class="uppercase font-medium text-sm"
                        :for="`${formId}-phonetype`"
                        v-html="
                            `${labels.Phone.TextPhoneType}${
                                labels.Phone.Required ? requiredSpan : ''
                            }`
                        "
                    />
                    <v-select
                        :id="`${formId}-phonetype`"
                        :ref="`${formId}-phonetype`"
                        :options="transformedPhoneTypeOptions"
                        :values="transformedPhoneTypeValues"
                        :initial="getInitialPhoneType"
                        :aria-label="labels.Phone.TextPhoneType"
                        select-mod="-sm-md -padding-md"
                        arrow-other-mods="
                                absolute -filled right-15 top-16 pointer-events-none
                            "
                    />
                </div>
                <!-- phone value -->
                <div class="flex-1 ml-5 md:ml-15">
                    <label
                        class="uppercase font-medium text-sm"
                        :for="`${formId}-phone`"
                        v-html="
                            `${labels.Phone.Text}${
                                labels.Phone.Required ? requiredSpan : ''
                            }`
                        "
                    />
                    <input-basic
                        :id="`${formId}-phone`"
                        v-model="phoneNumber"
                        name="phone"
                        :class="{ '-isInvalid': phoneNumberErrorVisible }"
                        :placeholder="labels.Phone.Placeholder"
                        aria-required="true"
                        :aria-invalid="phoneNumberErrorVisible"
                        :aria-describedby="phoneNumberAriaDescribedby"
                        @change="validatePhoneNumber(phoneNumber)" />
                    <!-- Only show one error message at a time -->
                    <FormFieldErrorMessage
                        id="phoneNumberErrorMsg"
                        :is-visible="phoneNumberErrorVisible"
                        :msg="phoneNumberErrorMessage"
                        modifier-classes="-no-icon" />
                </div>
            </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between">
            <!-- Email Input -->
            <div
                v-if="labels.Email"
                class="md:w-1_2 md:mr-15 py-10"
                :class="{ 'md:pr-15': !formForSelfInfo }"
            >
                <label
                    class="uppercase font-medium text-sm"
                    :for="`${formId}-emailId`"
                    v-html="
                        `${labels.Email.Text}${
                            labels.Email.Required ? requiredSpan : ''
                        }`
                    "
                />
                <v-input
                    :id="`${formId}-emailId`"
                    v-model="emailValue"
                    auto-complete="off"
                    :class="{ '-isInvalid': $v.emailValue.$error || isDuplicateEmail }"
                    :name="email.name"
                    :placeholder="labels.Email.Placeholder"
                    aria-required="true"
                    :aria-invalid="$v.emailValue.$error || isDuplicateEmail"
                    :aria-describedby="emailAriaDescribedby"
                    @change="validateEmail(emailValue)"
                />
                <FormFieldErrorMessage
                    :id="`${formId}-emailErrorMsg`"
                    :is-visible="$v.emailValue.$error"
                    :msg="determineEmailErrorMsg()"
                    modifier-classes="-no-icon"
                />
                <FormFieldErrorMessage
                    :id="`${formId}-duplicateEmailErrorMsg`"
                    :is-visible="isDuplicateEmail"
                    :msg="labels.Email.DuplicateErrorMessage"
                    modifier-classes="-no-icon"
                />
            </div>
            <!-- Birth Date -->
            <div
                v-if="formForSelfInfo"
                class="md:w-1_2 md:ml-15 py-10"
            >
                <BirthDateSelector
                    ref="birthDateSelector"
                    :form-id="formId"
                    :field-labels="labels.BirthDate"
                    :has-validation-been-triggered="hasValidationBeenTriggered"
                    :is-minimum-age-validated="true"
                    :is-required="isBirthDateRequired"
                    :placeholders="labels.DOBFields"
                    :months="labels.MonthOptions"
                    :prefilled-dob-data="preFilledData.DOB"
                    @setBirthDate="setBirthDate"
                />
            </div>
        </div>
    </div>
</template>
<script>
    import BirthDateSelector from '../../01-molecules/birth-date-selector/BirthDateSelector.vue';
    import personalInfoForm from '../../../mixins/imea-personal-info-form';
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';

    export default {
        name: 'OImeaPersonalInfoFormMx',
        components: {
            BirthDateSelector,
            FormFieldErrorMessage,
            vInput
        },
        mixins: [personalInfoForm],
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        }
    };
</script>

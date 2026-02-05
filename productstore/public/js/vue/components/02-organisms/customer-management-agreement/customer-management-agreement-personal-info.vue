<template>
    <div
        v-if="labels"
        class="o-customerManagementAgreementPersonalInfo max-w-contain mx-auto py-20 px-10 md:px-40 text-gray-150 text-sm bg-white border-gray-50 border-1"
    >
        <h2 class="text-xl font-medium mb-10">
            {{ labels.Title }}
        </h2>
        <!-- Personal Info Form-->
        <div class="flex flex-col text-base">
            <div class="flex flex-col md:flex-row justify-between">
                <!-- Region -->
                <div
                    v-if="labels.ValidRegions"
                    class="flex flex-1 flex-col md:mr-15 py-10"
                >
                    <span
                        id="preferredRegion"
                        class="uppercase text-sm font-medium"
                        v-html="
                            `${labels.Region.Text}${
                                labels.Region.Required ? requiredSpan : ''
                            }`
                        "
                    />
                    <CultureSelector
                        aria-labelledby="preferredRegion"
                        :cultures-data-array="culturesDataArray"
                        :initial-culture="getInitialCulture"
                        @change="setSelectedCulture"
                    />
                </div>
                <!-- Email/Username Input -->
                <div
                    v-if="labels.Username"
                    class="flex flex-1 flex-col md:ml-15 py-10"
                >
                    <label
                        class="uppercase text-sm font-medium"
                        for="username"
                        v-html="
                            `${labels.Username.Text}${
                                labels.Username.Required ? requiredSpan : ''
                            }`
                        "
                    />
                    <v-input
                        id="username"
                        ref="username"
                        v-model="username"
                        auto-complete="off"
                        :class="{ '-isInvalid': isUsernameInvalid }"
                        name="username"
                        :placeholder="labels.Username.Placeholder"
                        max-length="100"
                        aria-required="true"
                        :aria-invalid="isUsernameInvalid"
                        :aria-describedby="usernameAriaDescribedby"
                        @input="setValue('username', $event)"
                        @change="validateAndUpdateUserName(username)"
                    />
                    <FormFieldErrorMessage
                        id="usernameErrorMsg"
                        :is-visible="$v.username.$error"
                        :msg="labels.Username.RequiredErrorMessage"
                        modifier-classes="-no-icon"
                    />
                    <FormFieldErrorMessage
                        id="duplicateUsernamePhoneNumberErrorMsg"
                        :is-visible="defaultUsername === 'phone' && isInputDuplicatePhone(username)"
                        :msg="labels.Phone.DuplicateErrorMessage"
                        modifier-classes="-no-icon"
                    />
                    <FormFieldErrorMessage
                        id="duplicateUsernameEmailErrorMsg"
                        :is-visible="defaultUsername === 'email' && isInputDuplicateEmail(username)"
                        :msg="labels.Email.DuplicateErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <!-- Password/confirmation password -->
            <div class="flex flex-col md:flex-row justify-between">
                <div class="flex flex-col md:flex-row md:w-1_2 py-10">
                    <!-- Password -->
                    <div v-if="labels.Password" class="flex-1 md:mr-15">
                        <label
                            class="uppercase text-sm font-medium"
                            for="password"
                            v-html="
                                `${labels.Password.Text}${
                                    labels.Password.Required ? requiredSpan : ''
                                }`
                            "
                        />
                        <div>
                            <a-input-glimpse
                                id="password"
                                ref="password"
                                :input-classname="
                                    $v.passwordValue.$error
                                        ? '-isInvalid a-input -text text-base'
                                        : 'a-input -text text-base'
                                "
                                :has-criteria="true"
                                :has-error="$v.passwordValue.$error"
                                :extend-criteria="true"
                                :error-message="
                                    labels.Password.RequiredErrorMessage
                                "
                                :attributes="passwordAttributes"
                                :show-error-below-input="true"
                                :show-label="labels.ShowPassword"
                                :hide-label="labels.HidePassword"
                                :placeholder="labels.Password.Placeholder"
                                @input="setValue('passwordValue', $event)"
                                @passCriteria="handlePasswordCriteria"
                            />
                        </div>
                    </div>
                    <!-- Confirm Password -->
                    <div
                        v-if="labels.ConfirmPassword"
                        class="flex-1 md:mx-15 pt-10 md:pt-0"
                    >
                        <label
                            class="uppercase text-sm font-medium"
                            for="confirmPassword"
                            v-html="
                                `${labels.ConfirmPassword.Text}${
                                    labels.ConfirmPassword.Required
                                        ? requiredSpan
                                        : ''
                                }`
                            "
                        />
                        <div>
                            <a-input-glimpse
                                id="confirmPassword"
                                ref="confirmPassword"
                                :input-classname="
                                    $v.confirmPasswordValue.$error
                                        ? '-isInvalid a-input -text text-base'
                                        : 'a-input -text text-base'
                                "
                                :has-criteria="false"
                                :attributes="confirmPasswordAttributes"
                                :show-label="labels.ShowPassword"
                                :hide-label="labels.HidePassword"
                                :placeholder="
                                    labels.ConfirmPassword.Placeholder
                                "
                                @input="
                                    setValue('confirmPasswordValue', $event)
                                "
                            />
                            <FormFieldErrorMessage
                                id="confirmPasswordErrorMsg"
                                :is-visible="$v.confirmPasswordValue.$error"
                                :msg="
                                    labels.ConfirmPassword.RequiredErrorMessage
                                "
                                modifier-classes="-no-icon"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col md:flex-row justify-between">
                <div class="flex flex-1 py-10">
                    <!-- First Name -->
                    <div v-if="labels.FirstName" class="flex-1 mr-5 md:mr-15">
                        <label
                            class="uppercase text-sm font-medium"
                            for="firstName"
                            v-html="
                                `${labels.FirstName.Text}${
                                    labels.FirstName.Required
                                        ? requiredSpan
                                        : ''
                                }`
                            "
                        />
                        <v-input
                            id="firstName"
                            ref="firstName"
                            model-name="inputValue"
                            :tailwind-mods="
                                $v.firstName.$error ? '-isInvalid' : null
                            "
                            name="firstName"
                            :value="prospectiveCustomerData.FirstName"
                            :placeholder="labels.FirstName.Placeholder"
                            max-length="100"
                            aria-required="true"
                            :aria-invalid="$v.firstName.$error"
                            :aria-describedby="
                                $v.firstName.$error
                                    ? 'firstNameErrorMsg'
                                    : false
                            "
                            @input="setValue('firstName', $event)"
                        />
                        <FormFieldErrorMessage
                            id="firstNameErrorMsg"
                            :is-visible="$v.firstName.$error"
                            :msg="labels.FirstName.RequiredErrorMessage"
                            modifier-classes="-no-icon"
                        />
                    </div>
                    <!-- Initial-->
                    <div v-if="labels.Initial" class="flex-1 ml-5 md:mx-15">
                        <label
                            class="uppercase text-sm font-medium"
                            for="initial"
                            v-html="labels.Initial.Text"
                        />
                        <v-input
                            id="initial"
                            ref="initial"
                            model-name="inputValue"
                            name="initial"
                            :value="initial"
                            :placeholder="labels.Initial.Placeholder"
                            aria-required="false"
                            max-length="1"
                            @input="setValue('initial', $event)"
                        />
                    </div>
                </div>

                <div class="flex flex-1 py-10">
                    <!--Last Name -->
                    <div v-if="labels.LastName" class="flex-1 md:ml-15">
                        <label
                            class="uppercase text-sm font-medium"
                            for="lastName"
                            v-html="
                                `${labels.LastName.Text}${
                                    labels.LastName.Required ? requiredSpan : ''
                                }`
                            "
                        />
                        <v-input
                            id="lastName"
                            ref="lastName"
                            model-name="inputValue"
                            :tailwind-mods="
                                $v.lastName.$error ? '-isInvalid' : null
                            "
                            name="lastName"
                            :value="prospectiveCustomerData.LastName"
                            :placeholder="labels.LastName.Placeholder"
                            max-length="100"
                            aria-required="true"
                            :aria-invalid="$v.firstName.$error"
                            :aria-describedby="
                                $v.lastName.$error ? 'lastNameErrorMsg' : false
                            "
                            @input="setValue('lastName', $event)"
                        />
                        <FormFieldErrorMessage
                            id="lastNameErrorMsg"
                            :is-visible="$v.lastName.$error"
                            :msg="labels.LastName.RequiredErrorMessage"
                            modifier-classes="-no-icon"
                        />
                    </div>
                </div>
            </div>
            <div class="flex flex-col md:flex-row justify-between">
                <!-- Phone Fields -->
                <div v-if="labels.Phone" class="flex md:w-1_2 py-10">
                    <!-- PhoneType -->
                    <div class="flex-1 mr-5 md:mr-15">
                        <label
                            class="uppercase text-sm font-medium"
                            for="phonetype"
                            v-html="
                                `${labels.Phone.TextPhoneType}${
                                    labels.Phone.Required ? requiredSpan : ''
                                }`
                            "
                        />
                        <v-select
                            id="phonetype"
                            ref="phoneType"
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
                    <div class="flex-1 ml-5 md:mx-15">
                        <label
                            class="uppercase text-sm font-medium"
                            for="phone"
                            v-html="
                                `${labels.Phone.Text}${
                                    labels.Phone.Required ? requiredSpan : ''
                                }`
                            " />
                        <!-- Phone Input -->
                        <input-basic
                            id="phone"
                            ref="Phone"
                            v-model="phoneNumber"
                            name="phone"
                            :class="{ '-isInvalid': phoneNumberErrorVisible }"
                            :placeholder="labels.Phone.Placeholder"
                            aria-required="true"
                            :aria-invalid="phoneNumberErrorVisible"
                            :aria-describedby="phoneNumberAriaDescribedby"
                            @input="updatePhoneNumberInput($event)"
                            @change="validatePhoneNumber(phoneNumber)" />
                        <!-- Only show one error message at a time -->
                        <FormFieldErrorMessage
                            id="phoneNumberErrorMsg"
                            :is-visible="phoneNumberErrorVisible"
                            :msg="phoneNumberErrorMessage"
                            modifier-classes="-no-icon" />
                    </div>
                </div>
                <!-- Email Input -->
                <div v-if="labels.Email" class="flex-1 md:ml-15 py-10">
                    <label
                        class="uppercase text-sm font-medium"
                        :for="email.id"
                        v-html="
                            `${labels.Email.Text}${
                                labels.Email.Required ? requiredSpan : ''
                            }`
                        "
                    />
                    <v-input
                        :id="email.id"
                        ref="email"
                        v-model="emailValue"
                        auto-complete="off"
                        :class="{'-isInvalid': $v.emailValue.$error || isDuplicateEmail}"
                        :name="email.name"
                        :placeholder="labels.Email.Placeholder"
                        aria-required="true"
                        :aria-invalid="$v.emailValue.$error || isDuplicateEmail"
                        :aria-describedby="emailAriaDescribedby"
                        @input="setValue('emailValue', $event)"
                        @change="validateEmail(emailValue)"
                    />
                    <FormFieldErrorMessage
                        id="emailErrorMsg"
                        :is-visible="$v.emailValue.$error"
                        :msg="determineEmailErrorMsg()"
                        modifier-classes="-no-icon"
                    />
                    <FormFieldErrorMessage
                        id="duplicateEmailErrorMsg"
                        :is-visible="isDuplicateEmail"
                        :msg="labels.Email.DuplicateErrorMessage"
                        modifier-classes="-no-icon"
                    />
                </div>
            </div>
            <div class="flex flex-col md:flex-row justify-between">
                <!-- Customer Type -->
                <div
                    v-if="labels.ValidCustomerTypes"
                    class="flex-1 flex-col md:mr-15 py-10"
                >
                    <label
                        class="uppercase text-sm font-medium"
                        for="customerType"
                        v-html="
                            `${labels.CustomerType.Text}${
                                labels.CustomerType.Required ? requiredSpan : ''
                            }`
                        "
                    />
                    <v-select
                        id="customerType"
                        ref="customerType"
                        select-mod="-sm-md -padding-md"
                        :options="transformedCustomerTypeOptions"
                        :initial="getInitialCustomerType"
                        :values="transformedCustomerTypeValues"
                        :aria-label="labels.CustomerType.Text"
                        arrow-other-mods="
                            absolute -filled right-15 top-16 pointer-events-none
                        "
                        @change="setCustomerType"
                    />
                </div>
                <!-- Birth Date -->
                <div class="flex-1 md:ml-15 py-10">
                    <BirthDateSelector
                        ref="birthDateSelector"
                        form-id="self"
                        :field-labels="labels.BirthDate"
                        :has-validation-been-triggered="hasValidationBeenTriggered"
                        :is-minimum-age-validated="true"
                        :is-required="isBirthDateRequired"
                        :months="labels.MonthOptions"
                        :placeholders="labels.DOBFields"
                        @setBirthDate="setBirthDate"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import AInputGlimpse from '../../../../../../../_common/source/js/vue/components/00-atoms/fields/a-input-glimpse.vue';
    import BirthDateSelector from '../../01-molecules/birth-date-selector/BirthDateSelector.vue';
    import CultureSelector from '../../01-molecules/culture-selector/CultureSelector.vue';
    import eventBus from '../../../mixins/event-bus';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import personalInfoForm from '../../../mixins/cma-personal-info-form';
    import vInput from '@common/source/js/vue/components/00-atoms/fields/input-basic.vue';

    export default {
        name: 'OCustomerManagementAgreementPersonalInfo',
        components: {
            BirthDateSelector,
            CultureSelector,
            FormFieldErrorMessage,
            vInput,
            AInputGlimpse
        },
        mixins: [personalInfoForm],
        computed: {
            isUsernameInvalid() {
                return (
                    this.$v.username.$error ||
                    (this.defaultUsername === 'phone' && this.isDuplicatePhone) ||
                    (this.defaultUsername === 'email' && this.isDuplicateEmail)
                );
            }
        },
        created() {
            this.setFormValidations();
        },
        beforeDestroy() {
            eventBus.$off('validate');
        },
        methods: {
            updatePhoneNumberInput(event) {
                this.setValue('phoneNumber', event);
                this.resetDuplicatePhoneFlag();
            }
        }
    };
</script>

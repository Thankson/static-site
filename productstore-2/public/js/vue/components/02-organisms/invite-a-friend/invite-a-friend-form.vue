<!-- Form goes here -->
<template>
    <form
        novalidate
        class="o-inviteAFriendForm flex-col"
        @submit.prevent="handleSubmit"
        @submit.enter.prevent
        @keyup.enter.prevent
        @keydown.enter.prevent
    >
        <div v-if="inviteFriendFormTitle" class="font-bold text-xl mb-20">{{ inviteFriendFormTitle }}</div>
        <div class="flex flex-col mb-20">
            <div
                class="flex flex-col mb-20 md:flex-row md:space-x-12"
            >
                <!-- First Name -->
                <div class="md:w-1_2 mb-20 md:mb-0">
                    <div class="flex justify-between">
                        <label
                            class="m-formField__label uppercase"
                            for="firstName"
                            v-html="getFieldLabel('FirstName')"
                        >
                        </label>
                        <div class="flex items-center justify-between">
                            <InputCharacterCounter
                                :value="firstName"
                                :max-length="charMax.firstNameLimit"
                                :is-over-the-character-limit="
                                    isOverLimit(firstName, charMax.firstNameLimit)
                                "
                                modifier-classes="text-xs text-gray text-right"
                            />
                        </div>
                    </div>
                    <input-basic
                        id="firstName"
                        v-model="firstName"
                        name="firstName"
                        data-testid="input-firstName"
                        :tailwind-mods="invalidMods($v && $v.firstName)"
                    />
                    <FormFieldErrorMessage
                        :is-visible="fieldErrorVisible($v && $v.firstName)"
                        :msg="firstNameError"
                        modifier-classes="mt-4"
                    />
                </div>
                <!-- Last Name -->
                <div class="md:w-1_2">
                    <div class="flex justify-between">
                        <label
                            class="m-formField__label uppercase"
                            for="lastName"
                            v-html="getFieldLabel('LastName')"
                        >
                        </label>
                        <div class="flex items-center justify-between">
                            <InputCharacterCounter
                                :value="lastName"
                                :max-length="charMax.lastNameLimit"
                                :is-over-the-character-limit="
                                    isOverLimit(lastName, charMax.lastNameLimit)
                                "
                                modifier-classes="text-xs text-gray text-right"
                            />
                        </div>
                    </div>
                    <input-basic
                        id="lastName"
                        v-model="lastName"
                        name="lastName"
                        data-testid="input-lastName"
                        :tailwind-mods="invalidMods($v && $v.lastName)"
                    />
                    <FormFieldErrorMessage
                        :is-visible="fieldErrorVisible($v && $v.lastName)"
                        :msg="lastNameError"
                        modifier-classes="mt-4"
                    />
                </div>
            </div>
            <!-- Country and Language -->
            <div>
                <div class="m-formField -select">
                    <label
                        class="m-formField__label uppercase"
                        for="countrySelected"
                    >
                        {{ getFieldLabel("Country") }}
                    </label>
                    <v-select
                        v-if="countriesLabels && countriesLabels.length"
                        id="countrySelected"
                        :options="countriesLabels"
                        :values="countriesValues"
                        :initial="initialCountry"
                        arrow-tailwind-color="gray-120"
                        arrow-other-mods="w-0 absolute right-15 pointer-events-none top-15"
                        select-mod="-sm-md -padding-md"
                        data-testid="select-country"
                        @change="handleCountryChange"
                    >
                    </v-select>
                </div>
            </div>
            <!-- Mobile Phone & Email radio buttons -->
            <div>
                <div class="space-y-10 mb-20">
                    <m-radio
                        v-for="option in contactMethodOptions()"
                        :key="option.Value"
                        v-model="preferredContact"
                        name="inviteContact"
                        :input-value="option.Value"
                        :label="option.Text"
                        data-testid="radio-contactMethod"
                    />
                </div>
            </div>

            <!-- Mobile Number & Email fields -->
            <div v-if="prefersMobile" class="mb-20">
                <div class="flex items-center justify-between">
                    <label
                        for="inviteMobile"
                        class="o-inviteAFriend__label uppercase text-xs font-semibold tracking-wide text-dark"
                    >
                        {{ getFieldLabel("MobileNumber") }}
                    </label>
                    <InputCharacterCounter
                        :value="mobileNumber"
                        :max-length="charMax.mobileLimit"
                        :is-over-the-character-limit="
                            isOverLimit(mobileNumber, charMax.mobileLimit)
                        "
                        modifier-classes="text-xs text-gray text-right"
                    />
                </div>
                <input-basic
                    id="inviteMobile"
                    v-model="mobileNumber"
                    input-type="tel"
                    auto-complete="tel"
                    class="py-10"
                    data-testid="input-mobileNumber"
                    :tailwind-mods="invalidMods($v && $v.mobileNumber)"
                />
                <FormFieldErrorMessage
                    :is-visible="!!mobileNumberError"
                    :msg="mobileNumberError"
                    modifier-classes="mt-4"
                />
            </div>
            <div v-else class="mb-20">
                <div class="flex items-center justify-between">
                    <label
                        for="inviteEmail"
                        class="o-inviteAFriend__label uppercase text-xs font-semibold tracking-wide text-dark"
                    >
                        {{ getFieldLabel("EmailAddress") }}
                    </label>
                    <InputCharacterCounter
                        :value="emailAddress"
                        :max-length="charMax.emailLimit"
                        :is-over-the-character-limit="
                            isOverLimit(emailAddress, charMax.emailLimit)
                        "
                        modifier-classes="text-xs text-gray text-right"
                    />
                </div>
                <input-basic
                    id="inviteEmail"
                    v-model="emailAddress"
                    input-type="email"
                    auto-complete="email"
                    class="py-10"
                    data-testid="input-emailAddress"
                    :tailwind-mods="invalidMods($v && $v.emailAddress)"
                />
                <FormFieldErrorMessage
                    :is-visible="!!emailAddressError"
                    :msg="emailAddressError"
                    modifier-classes="mt-4"
                />
            </div>
            <!-- Message -->
            <div class="mb-18">
                <div class="flex justify-between">
                    <label
                        for="inviteMessage"
                        class="o-inviteAFriend__label uppercase text-xs font-semibold tracking-wide"
                    >
                        {{ getFieldLabel("Message") }}
                    </label>
                    <InputCharacterCounter
                        :value="message"
                        :max-length="charMax.messageLimit"
                        :is-over-the-character-limit="
                            isOverLimit(message, charMax.messageLimit)
                        "
                        modifier-classes="text-xs text-gray text-right"
                    />
                </div>
                <textarea
                    id="inviteMessage"
                    v-model="message"
                    class="w-full rounded-md border border-gray-50 p-15 leading-tight"
                    rows="4"
                    data-testid="textarea-message"
                    @input="handleMessageInput($event.target.value)"
                ></textarea>
                <FormFieldErrorMessage
                    :is-visible="!!messageError"
                    :msg="messageError"
                    modifier-classes="mt-4"
                />
            </div>
            <!-- Acknowledgement Checkbox -->
            <div v-if="checkboxList.length">
                <div v-for="(checkbox, idx) in checkboxList" :key="`${checkbox.Name}-${idx}`" class="mb-20">
                    <m-checkbox
                        v-model="checkboxesState[checkbox.Name]"
                        :name="checkbox.Name"
                        label-mods="font-normal leading-tight"
                        :label="checkbox.Text"
                        :data-testid="`checkbox-consent-${checkbox.Name}`"
                    />
                    <FormFieldErrorMessage
                        :is-visible="hasCheckboxError(checkbox.Name)"
                        :msg="checkbox.RequiredErrorMessage"
                        modifier-classes="mt-8"
                    />
                </div>
            </div>
            <!-- CTAs -->
            <div>
                <div class="flex space-x-12">
                    <v-button
                        class="font-medium tracking-wide py-15 px-25"
                        type="submit"
                        data-testid="button-sendInvitation"
                    >
                        {{ getButtonText("Submit") }}
                    </v-button>
                    <v-button
                        class="-white font-medium tracking-wide py-15 px-25"
                        type="button"
                        data-testid="button-cancelInvitation"
                        @click="closeShelf"
                    >
                        {{ getButtonText("Cancel") }}
                    </v-button>
                </div>
                <div>
                    <FormFieldErrorMessage
                        :is-visible="!!apiSubmitError"
                        :msg="apiSubmitError"
                        modifier-classes="mt-8"
                    />
                </div>
            </div>
            <!-- Footnote -->
            <p class="text-sm mt-20">
                {{ limitAvailableMessage }}
            </p>
        </div>
    </form>
</template>
<script>
    import { mapActions, mapState } from 'vuex';
    import emailsDuplicateApi from '@api/routes/account/identifications/isDuplicateEmail';
    import FormFieldErrorMessage from '../../01-molecules/form-field-error-message/FormFieldErrorMessage.vue';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import InputCharacterCounter from '../../01-molecules/input-character-counter/input-character-counter.vue';
    import inviteFriendApi from '@api/routes/customer/inviteFriendForm';
    import { validationMixin } from 'vuelidate';
    import { required, requiredIf } from 'vuelidate/lib/validators';

    const FORM_STORAGE_KEY = 'inviteAFriendForm';
    const CHAR_MAX = {
        emailLimit: 50,
        firstNameLimit: 50,
        lastNameLimit: 50,
        messageLimit: 145,
        mobileLimit: 10
    };
    const NAME_REGEX = /^[\p{L}\p{M}' -]+$/u;
    export default {
        name: 'OInviteAFriendForm',
        components: {
            InputCharacterCounter,
            FormFieldErrorMessage
        },
        mixins: [validationMixin],
        validations() {
            const v = {
                emailAddress: {
                    required: requiredIf(() => this.preferredContact === 'email'),
                    characterLimit: val =>
                        this.preferredContact !== 'email' || !val || val.length <= CHAR_MAX.emailLimit,
                    email: value =>
                        this.preferredContact !== 'email' || (value !== null && formHelper.isValidEmail(value))
                },
                firstName: {
                    required,
                    characterLimit: val => !val || val.length <= CHAR_MAX.firstNameLimit,
                    nameFormat: val => !val || NAME_REGEX.test(val)
                },
                lastName: {
                    required,
                    characterLimit: val => !val || val.length <= CHAR_MAX.lastNameLimit,
                    nameFormat: val => !val || NAME_REGEX.test(val)
                },
                message: {
                    characterLimit: val => !val || val.length <= CHAR_MAX.messageLimit
                },
                mobileNumber: {
                    required: requiredIf(() => this.preferredContact === 'mobile'),
                    characterLimit: val =>
                        this.preferredContact !== 'mobile' || !val || val.length <= CHAR_MAX.mobileLimit,
                    phoneNumber: value => {
                        if(this.preferredContact !== 'mobile') return true;
                        const region = (this.countryCode || '').split('-').pop(); // e.g., "en-us" -> "us"
                        if(!region) return true;
                        if(value === null) return false;
                        return formHelper.isValidPhoneNumber((value || '').trim(), region);
                    }
                },
                checkboxesState: {}
            };
            this.checkboxList.forEach(box => {
                if(box.Required) {
                    v.checkboxesState[box.Name] = { checked: val => !!val };
                }
            });
            return v;
        },
        props: {
            apiLocalization: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                apiSubmitError: '',
                chosenCountry: '',
                checkboxesState: {},
                countriesLabels: [],
                countriesValues: [],
                emailAddress: '',
                firstName: '',
                initialCountry: '',
                isDuplicatePhone: false,
                isDuplicateEmail: false,
                isMessageManuallyEdited: false,
                lastName: '',
                lastPersonalizedFirstName: '%first_name%',
                message: '',
                messageTemplate: '%first_name%',
                mobileNumber: '',
                preferredContact: 'mobile' // default to mobile
            };
        },
        computed: {
            ...mapState('email', ['isItDuplicateEmail']),
            charMax() {
                return CHAR_MAX;
            },
            checkboxList() {
                return (
                    (this.apiLocalization?.Labels?.FormFields?.Fields || []).find(
                        field => field.Type === 'Checkbox'
                    )?.Checkboxes || []
                );
            },
            countryCode() {
                // Prefer the currently chosen country, fall back to the API culture
                return this.chosenCountry || this.apiLocalization?.Culture;
            },
            emailAddressError() {
                const v = this.$v && this.$v.emailAddress;
                if(!v || !v.$dirty) return '';
                if(!v.required) return this.getFieldByType('EmailAddress')?.Required;
                if(!v.characterLimit) return this.characterLimitError('EmailAddress', this.emailAddress, CHAR_MAX.emailLimit);
                if(!v.email) return this.getFieldByType('EmailAddress')?.InvalidError;
                return '';
            },
            firstNameError() {
                const v = this.$v && this.$v.firstName;
                if(!v || !v.$dirty) return '';
                if(!v.required) return this.getFieldByType('FirstName')?.Required;
                if(!v.characterLimit) return this.characterLimitError('FirstName', this.firstName, CHAR_MAX.firstNameLimit);
                if(!v.nameFormat) return this.getFieldByType('FirstName')?.InvalidError;
                return '';
            },
            hasCheckboxes() {
                return !!this.labels?.Checkboxes?.length;
            },
            inviteFriendFormTitle() {
                return this.apiLocalization?.Labels?.Title || '';
            },
            lastNameError() {
                const v = this.$v && this.$v.lastName;
                if(!v || !v.$dirty) return '';
                if(!v.required) return this.getFieldByType('LastName')?.Required;
                if(!v.characterLimit) return this.characterLimitError('LastName', this.lastName, CHAR_MAX.lastNameLimit);
                if(!v.nameFormat) return this.getFieldByType('LastName')?.InvalidError;
                return '';
            },
            limitAvailableMessage() {
                const message = this.apiLocalization?.Labels?.LimitAvailableMessage;
                const limit = this.apiLocalization?.LimitAvailable;

                if(typeof message !== 'string') return '';
                return message.replace(/\{0\}/g, limit ?? '');
            },
            mobileNumberError() {
                const v = this.$v && this.$v.mobileNumber;
                if(!v || !v.$dirty) return ''; // so that the error does not show on load but instead after send invitation is clicked
                if(!v.required) return this.getFieldByType('MobileNumber')?.Required;
                if(!v.characterLimit) return this.characterLimitError('MobileNumber', this.mobileNumber, CHAR_MAX.mobileLimit);
                if(!v.phoneNumber) return this.getFieldByType('MobileNumber')?.InvalidError;
                return '';
            },
            messageError() {
                const v = this.$v && this.$v.message;
                if(!v || !v.$dirty) return '';
                if(!v.characterLimit) return this.characterLimitError('Message', this.message, CHAR_MAX.messageLimit);
                return '';
            },
            prefersMobile() {
                return this.preferredContact === 'mobile';
            }
        },
        watch: {
            apiLocalization: {
                handler() {
                    this.applyMessageTemplateFromApi();
                    this.setCountryOptionsFromApi();
                    const hasSavedState = Object.keys(this.checkboxesState || {}).length > 0;
                    if(!hasSavedState) {
                        this.checkboxesState = {};
                        this.checkboxList.forEach(box => {
                            this.$set(this.checkboxesState, box.Name, !!box.Checked);
                        });
                    }
                    this.$nextTick(() => this.$v && this.$v.$reset && this.$v.$reset());
                }
            },
            checkboxesState: {
                handler() {
                    this.persistForm();
                },
                deep: true
            },
            chosenCountry() {
                this.persistForm();
            },
            emailAddress() {
                this.persistForm();
                this.isDuplicateEmail = false;
                this.apiSubmitError = '';
            },
            firstName(newFirstName) {
                const oldToken = this.lastPersonalizedFirstName || '%first_name%';
                const newToken = newFirstName?.trim() || oldToken;

                if(this.isMessageManuallyEdited) {
                    const pattern = new RegExp(
                        oldToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                        'g'
                    );
                    this.message = this.message.replace(pattern, newToken);
                } else {
                    this.message = this.personalizeMessage(newToken);
                    this.isMessageManuallyEdited = false;
                }

                this.lastPersonalizedFirstName = newToken;
                this.persistForm();
            },
            lastName() {
                this.persistForm();
            },
            message() {
                this.persistForm();
            },
            mobileNumber() {
                this.persistForm();
                this.isDuplicatePhone = false;
                this.apiSubmitError = '';
            },
            preferredContact(newVal, oldVal) {
                if(newVal === oldVal) return;
                if(newVal === 'mobile') {
                    this.emailAddress = '';
                } else {
                    this.mobileNumber = '';
                }
                this.persistForm();
            }
        },
        mounted() {
            this.applyMessageTemplateFromApi(); // seeds messageTemplate and message from API data
            this.setCountryOptionsFromApi();
            const saved = sessionStorage.getItem(FORM_STORAGE_KEY);
            if(saved) {
                Object.assign(this.$data, JSON.parse(saved));
            }

            // initialize checkbox state from API if none was restored
            if(!Object.keys(this.checkboxesState || {}).length) {
                this.checkboxesState = {};
                this.checkboxList.forEach(box => {
                    this.$set(this.checkboxesState, box.Name, !!box.Checked);
                });
            }
            this.$nextTick(() => this.$v && this.$v.$reset && this.$v.$reset());

            this.lastPersonalizedFirstName = this.firstName || '%first_name%';
            this.message = this.personalizeMessage(this.lastPersonalizedFirstName);
        },
        methods: {
            ...mapActions('email', ['getEmailIsDuplicate']),
            ...mapActions('phoneNumber', ['getPhoneIsDuplicate']),

            applyMessageTemplateFromApi() {
                const messageField = this.getFieldByType('Message');
                if(messageField?.PrepopulatedValue) {
                    this.messageTemplate = messageField.PrepopulatedValue;
                    if(!this.isMessageManuallyEdited) {
                        this.message = this.personalizeMessage(this.firstName);
                    }
                }
            },
            characterLimitError(type, value, limit) {
                const over = (value || '').length - limit;
                const errorMessage = this.apiLocalization?.Labels?.CharacterLimitError;
                return errorMessage ? errorMessage.replace('{0}', limit).replace('{1}', over) : '';
            },
            closeShelf() {
                this.$shelf.hide();
            },
            contactMethodOptions() {
                const field = this.getFieldByType('ContactMethod') || {};
                return Array.isArray(field.Options) ? field.Options : [];
            },
            fieldErrorVisible(field) {
                return !!(field && field.$dirty && field.$error);
            },
            getButtonByType(type) {
                const buttons = this.apiLocalization?.Labels?.FormFields?.Buttons;
                return Array.isArray(buttons)
                    ? buttons.find(btn => btn.Type === type) || null
                    : null;
            },
            getButtonText(type) {
                const btn = this.getButtonByType(type);
                return btn ? btn.ButtonText : '';
            },
            getCountryOptions() {
                const fields =
                    this.apiLocalization?.Labels?.FormFields?.Fields || [];
                const countryField = fields.find(field => field.Type === 'Country');
                return Array.isArray(countryField?.Options)
                    ? countryField.Options
                    : [];
            },
            getFieldByType(type) {
                const fields =
                    this.apiLocalization?.Labels?.FormFields?.Fields || [];
                return fields.find(field => field.Type === type);
            },
            getFieldLabel(type) {
                const fields = this.apiLocalization?.Labels?.FormFields?.Fields;
                if(!Array.isArray(fields)) return '';
                const field = fields.find(f => f.Type === type);
                return field ? field.Label : '';
            },
            handleCountryChange({ value }) {
                if(value === this.chosenCountry) return;
                this.chosenCountry = value;
                this.persistForm();
            },
            handleMessageInput(value) {
                this.message = value;
                this.isMessageManuallyEdited = true;
                this.persistForm(); // ensures the latest message body—whether edited or not—is saved to sessionStorage along with the rest of the form
            },
            async handleSubmit() {
                this.apiSubmitError = '';
                this.$v?.checkboxesState?.$touch();
                this.$v?.$touch();
                if(this.$v.$invalid) return;
                this.isDuplicatePhone = false;
                this.isDuplicateEmail = false;

                const duplicateBlocked = await this.validateDuplicateContact();
                if(duplicateBlocked) return;

                const payload = {
                    firstName: (this.firstName || '').trim(),
                    lastName: (this.lastName || '').trim(),
                    cultureName: this.apiLocalization?.Culture || '',
                    emailAddress: this.prefersMobile ? '' : (this.emailAddress || '').trim(),
                    mobilePhone: this.prefersMobile ? (this.mobileNumber || '').trim() : '',
                    messageType: this.prefersMobile ? 'Phone' : 'Email'
                };
                const { success, data } = await this.sendInvitation(payload);
                if(!success || !data?.Success) {
                    const msg = data?.ErrorMessages?.[0]?.Translation;
                    this.apiSubmitError = msg || '';
                    return; // block submit
                }
                this.invitationSent = true;
                this.$emit('invitationSent');
                // TODO: Add code to show confirmation UI on successful POST
                // See https://dev.azure.com/MelaleucaPlatform/Melaleuca/_workitems/edit/290946
            },
            hasCheckboxError(name) {
                const v = this.$v?.checkboxesState?.[name];
                return !!(v && v.$dirty && !v.checked);
            },
            invalidMods(field) {
                return field?.$dirty && field?.$error ? '-isInvalid' : null;
            },
            isOverLimit(value, limit) {
                return (value || '').length > (limit || 0);
            },
            persistForm() {
                const snapshot = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    chosenCountry: this.chosenCountry,
                    preferredContact: this.preferredContact,
                    mobileNumber: this.mobileNumber,
                    emailAddress: this.emailAddress,
                    message: this.message,
                    checkboxesState: this.checkboxesState
                };
                sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(snapshot));
            },
            personalizeMessage(name) {
                const tokenValue = name || '%first_name%';
                return this.messageTemplate.replace(/%first_name%/gi, tokenValue);
            },
            async sendInvitation(payload) {
                const { success, data } = await inviteFriendApi.post(payload);
                return { success, data };
            },
            setCountryOptionsFromApi() {
                const options = this.getCountryOptions();
                this.countriesLabels = options.map(
                    option => option.Text || option.Label
                );
                this.countriesValues = options.map(
                    option => option?.Value || option?.Text || option?.Label || ''
                );
                const culture = (this.apiLocalization?.Culture || '').toLowerCase();
                const matchIndex = this.countriesValues.findIndex(
                    value => value?.toLowerCase() === culture
                );
                this.initialCountry =
                    matchIndex >= 0
                        ? this.countriesValues[matchIndex]
                        : this.countriesValues[0] || '';
                if(!this.chosenCountry) this.chosenCountry = this.initialCountry;
            },
            async validateDuplicateContact() {
                if(this.prefersMobile) {
                    const phone = (this.mobileNumber || '').trim();
                    const { success, data } = await this.getPhoneIsDuplicate(phone);
                    const isDup = success && data?.Success && data?.Data;
                    this.isDuplicatePhone = !!isDup;
                    if(isDup) {
                        this.apiSubmitError = data?.ErrorMessages?.[0]?.Translation || '';
                        return true;
                    }
                } else {
                    const email = (this.emailAddress || '').trim();
                    const { success, data } = await emailsDuplicateApi.query({ email }); // call API directly
                    const isDup = success && data?.Success && data?.Data;
                    this.isDuplicateEmail = !!isDup;
                    if(isDup) {
                        this.apiSubmitError = data?.ErrorMessages?.[0]?.Translation || '';
                        return true;
                    }
                }
                this.apiSubmitError = '';
                return false;
            }
        }
    };
</script>

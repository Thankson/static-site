<template>
    <div class="text-sm md:text-base">
        <h2 class="font-global-sans leading-tight text-2xl text-gray-150 mb-15">
            {{ getLocalizationProp('Data.Title', 'Instructions on Collecting, Using and Providing Social Security Number') }}
        </h2>

        <div
            class="mb-20"
            v-html="getLocalizationProp('Data.Description', '')" />

        <form
            class="md:w-11_12 md:mt-75 lg:w-3_4 xl:w-7_12"
            method="POST"
            novalidate
            @submit.prevent="onSubmit">

            <p class="mb-20 md:mb-30">
                <span class="m-formField__label">
                    {{ getLocalizationProp('Labels.Name', 'Name') }}
                </span>
                {{ name }}
            </p>

            <label
                :id="ssnLabelId"
                class="m-formField__label"
                :for="ssnId">

                {{ getLocalizationProp('Labels.Ssn', 'Social Security Number (RRN)') }}
            </label>

            <div class="flex flex-wrap mb-30">
                <div class="pr-5 w-1_2">
                    <input-basic
                        id="dateOfBirth"
                        name="DateOfBirth"
                        auto-complete="off"
                        :aria-labeledby="ssnLabelId"
                        :value="dateOfBirth"
                        :readonly="true"
                    />
                </div>

                <div class="pl-5 w-1_2">
                    <input-basic
                        :id="ssnId"
                        v-model="ssn"
                        name="ssn"
                        auto-complete="off"
                        :aria-required="true"
                        :required="true"
                        :class="{ '-isInvalid': $v.$dirty && $v.ssn.$invalid }"
                        :aria-invalid="$v.$dirty && $v.ssn.$invalid || null"
                        :aria-describedby="$v.$dirty && $v.ssn.$invalid ? ssnErrorId : null"
                        :placeholder="getLocalizationProp('Labels.SsnPlaceholder', 'Back 7 Digits')"
                    />
                </div>

                <div class="hidden md:block md:w-1_2" />

                <p
                    v-if="$v.$dirty && $v.ssn.$invalid"
                    :id="ssnErrorId"
                    class="e-formError__item flex justify-end w-full pb-0 md:w-1_2 md:justify-start md:pl-5">

                    {{ getLocalizationProp('Labels.SsnError', 'Social Security Number is invalid') }}
                </p>
            </div>

            <div class="mb-30">
                <m-checkbox-rte-modal
                    class="-greenCta"
                    my-name="ViewConsentModal"
                    :value="consent"
                    :hide-footer="true"
                    :size="800"
                    :label-mods="checkboxLabelClasses"
                    :modal-data="consentModalData"
                    :required="true"
                    :aria-required="true"
                    :aria-describedby="$v.$dirty && $v.consent.$invalid ? consentErrorId : null"
                    :aria-invalid="$v.$dirty && $v.consent.$invalid || null"
                    @update="({ value }) => consent = value" />

                <p
                    v-if="$v.$dirty && $v.consent.$invalid"
                    :id="consentErrorId"
                    class="e-formError__item flex justify-end w-full pb-0 md:w-1_2 md:justify-start md:pl-5">

                    {{ getLocalizationProp('Labels.ConsentError', 'Please check the consent message') }}
                </p>
            </div>

            <div class="md:flex">
                <v-button
                    class="justify-center leading-base text-center w-full px-50 py-18 md:w-auto md:py-16"
                    type="submit">

                    {{ getLocalizationProp('Labels.SocialSecuritySave', 'Save') }}
                </v-button>

                <div class="md:ml-20">
                    <a-loading-spinner
                        :visible="loading"
                        size="sm" />
                </div>
            </div>

            <ul
                v-if="($v.$dirty && $v.$invalid) || serviceError"
                class="e-formError__list mt-15"
                role="alert"
                aria-live="assertive">

                <li
                    v-if="serviceError"
                    class="e-formError__item mt-0">

                    {{ serviceError }}
                </li>

                <li
                    v-if="$v.ssn.$invalid"
                    class="e-formError__item mt-0">

                    {{ getLocalizationProp('Labels.SsnError', 'Social Security Number is invalid') }}
                </li>

                <li
                    v-if="$v.consent.$invalid"
                    class="e-formError__item mt-0">

                    {{ getLocalizationProp('Labels.ConsentError', 'Please check the consent message') }}
                </li>
            </ul>
        </form>
    </div>
</template>

<script>
    import api from '@api/routes/customeraccount/savegovernmentid';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { minLength, maxLength, required } from 'vuelidate/lib/validators';

    export default {
        name: 'ORegisterSsn',
        mixins: [ localizationMixin, safeId, validationMixin ],
        safeIds: [
            'consentModalId',
            'consentErrorId',
            'ssnId',
            'ssnErrorId',
            'ssnLabelId'
        ],
        validations() {
            return {
                consent: {
                    required: (value) => value
                },
                ssn: {
                    required,
                    maxLength: maxLength(this.maxLength),
                    minLength: minLength(this.minLength),
                    regex: (value) => {
                        if(!this.regexStr) return true;

                        return new RegExp(this.regexStr).test(value);
                    }
                }
            };
        },
        data() {
            return {
                consent: false,
                consentErrorId: '',
                consentModalId: '',
                consentVisible: true,
                dateOfBirth: '',
                dateOfBirthVisible: true,
                loading: false,
                maxLength: 7,
                minLength: 1,
                name: '',
                regexStr: '',
                serviceError: '',
                ssn: '',
                ssnId: '',
                ssnErrorId: '',
                ssnLabelId: ''
            };
        },
        computed: {
            checkboxLabelClasses() {
                const classes = [
                    '-items-start',
                    'font-normal',
                    this.$v.$dirty && this.$v.consent.$invalid ? '-error' : ''
                ];

                return classes.join(' ');
            },
            consentShortDescription() {
                return this.getLocalizationProp('Labels.ConsentShortDescription', 'I agree to the collection, use and provision social security number.')
                    .replace(
                        '<a>',
                        `<a class="font-medium" role="button" tabindex="0" data-modal-id="${this.consentModalId}">`
                    );
            },
            consentModalData() {
                const modalBody = this.getLocalizationProp('Data.ConsentLongDescription');
                return {
                    Title: this.consentShortDescription,
                    Modals: [{
                        Id: this.consentModalId,
                        Title: '<span class="sr-only">Consent Form</span>',
                        Body: modalBody ? `<div class="text-sm">${modalBody}</div>` : ''
                    }]
                };
            }
        },
        mounted() {
            this.consentVisible = this.getLocalizationProp('Data.ConsentVisible', true);
            this.dateOfBirth = this.getLocalizationProp('Data.DobValue', '');
            this.dateOfBirthVisible = this.getLocalizationProp('Data.DobVisible', true);
            this.maxLength = this.getLocalizationProp('Data.MaxLength', 7);
            this.minLength = this.getLocalizationProp('Data.MinLength', 1);
            this.name = this.getLocalizationProp('Data.NameValue', '');
            this.regexStr = this.getLocalizationProp('Data.RegexValidation', null);
        },
        methods: {
            async onSubmit() {
                this.serviceError = '';

                this.$v.$touch();

                if(!this.$v.$invalid) {
                    this.loading = true;

                    const { success, error, data } = await api.post({
                        ssn: this.dateOfBirth + this.ssn
                    });

                    if(success && data.Success) {
                        window.location.href = this.localization.Data.RedirectUrl.Url;
                    } else {
                        if(data.ErrorMessages && data.ErrorMessages.length) {
                            this.serviceError = data.ErrorMessages[0].Translation;
                        } else if(error) {
                            this.serviceError = error;
                        }

                        this.loading = false;
                    }
                }
            }
        }
    };
</script>

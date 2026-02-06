<template>
    <div>
        <h1 class="font-global-sans font-medium tracking-tight text-2xl text-gray-150 md:text-3xl to-md:px-10 to-md:pt-20"> {{ getLocalizationProp('Labels.SocialSecurityNumber', 'Social Security Number') }}</h1>

        <form
            id="ssnForm" method="post" name="ssnForm"
            :inputId="inputId"
        >
            <div class="flex flex-col flex-wrap md:max-w-md">
                <p class="mb-20 pr-30 text-sm text-gray-120 leading-tight md:mb-30 md:text-xl lg:pr-80">{{ getLocalizationProp('Labels.Description', 'Because you will be earning commissions & bonuses, we are required to collect your Social Security Number for tax reporting purposes.') }}</p>

                <label class="m-formField__label" :for="inputId">{{ getLocalizationProp('Labels.SocialSecurityNumber', 'Social Security Number') }}</label>
                <div class="items-start md:flex md:flex-row">
                    <div class="w-full md:max-w-290 md:mr-15">
                        <div class="m-formField -text">
                            <a-input-glimpse
                                :attributes="computedInputAttributes"
                                :init-hidden="true"
                                :show-label="getLocalizationProp('Labels.ShowSSN', 'Show social security number')"
                                :hide-label="getLocalizationProp('Labels.HideSSN', 'Hide social security number')"
                                autocomplete="off"
                                :input-classname="hasError ? '-isInvalid' : ''"
                                @input="setInput"
                                @keydown="handleValidation"
                                @blur="handleValidation">
                            </a-input-glimpse>

                            <em v-if="hasError" :id="errorId" class="formError -noIcon opacity-0" :class="hasError ? 'opacity-100' : ''">{{ ErrorMessage }}</em>
                        </div>
                    </div>
                    <div class="w-full md:max-w-120">
                        <button class="a-button justify-center leading-base to-md:py-18 md:py-16 text-center w-full" type="button" v-on:click.prevent="submit" @click="gtmTrackAction({id: 245}, $event)">{{ getLocalizationProp('Labels.SocialSecuritySave', 'Save') }}</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import api from '@api/routes/customeraccount/savegovernmentid';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required, minLength, maxLength } from 'vuelidate/lib/validators';

    export default {
        name: 'OSsnForm',
        mixins: [ safeId, validationMixin, localizationMixin ],
        safeIds: [
            'inputId',
            'errorId'
        ],
        validations() {
            return {
                input: {
                    required,
                    minLength: minLength(this?.min || 0),
                    maxLength: maxLength(this?.max || 0),
                    digitsOnly: value => {
                        if(this.digitsOnly) {
                            const regexDigits = new RegExp(`^\\d{${this.min},${this.max}}$`);
                            return Boolean(regexDigits.exec(value));
                        }
                        return true;
                    }
                }
            };
        },
        props: {
            error: {
                type: Boolean,
                default: false
            },
            inputAttributes: {
                type: Object,
                default: () => {}
            },
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                input: '',
                inputId: '',
                digitsOnly: false,
                errorId: '',
                hasError: false,
                ErrorMessage: '',
                min: 9,
                max: 20
            };
        },
        computed: {
            computedInputAttributes() {
                return {
                    ...this.inputAttributes,
                    id: this.inputId,
                    'aria-required': true,
                    'aria-invalid': this.$v.$error,
                    'aria-describedby': this.$v.$error ? this.errorId : false
                };
            }
        },
        mounted() {
            if(this.localization?.Data?.Country?.toLowerCase() === 'aus') {
                this.min = 11;
                this.max = 11;
                this.digitsOnly = true;
            }
            if(this.error) {
                this.$v.$touch();
            }
        },
        methods: {
            handleValidation() {
                this.$v.$touch();

                if(this.$v.$invalid) {
                    this.hasError = true;
                    this.setErrorMessage();
                } else {
                    this.hasError = false;
                    this.ErrorMessage = '';
                }
            },
            setInput(val) {
                this.input = val;
            },
            async saveSsn() {
                const response = await api.post({ ssn: this.input });
                if(response.data.Success) {
                    window.location.href = this.localization.Data.RedirectUrl;
                } else {
                    this.hasError = true;
                    this.ErrorMessage = response.data.ErrorMessages[0].Translation;
                }
            },
            setErrorMessage() {
                let message;

                if(!this.$v.input.minLength) {
                    message = this.localization.Labels.MinLength;
                } else if(!this.$v.input.maxLength) {
                    message = this.localization.Labels.MaxLength;
                } else if(!this.$v.input.required) {
                    message = this.localization.Labels.RequiredField;
                } else if(!this.$v.input.digitsOnly) {
                    message = this.localization.Labels.Numeric;
                }

                this.ErrorMessage = message;
            },
            submit() {
                this.$v.$touch();
                if(!this.$v.$invalid) {
                    this.hasError = false;
                    this.ErrorMessage = '';
                    this.saveSsn();
                } else {
                    this.hasError = true;
                    const input = document.getElementById(this.inputId);

                    this.setErrorMessage();

                    if(input) {
                        input.focus();
                    }
                }
            }
        }
    };
</script>

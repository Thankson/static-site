<template>
    <div class="m-accessStep">
        <div class="m-accessStep__content">
            <h2 class="m-accessStep__heading">
                <slot name="heading" />
            </h2>

            <div v-if="$slots['description']" class="m-accessStep__desc">
                <slot name="description" />
            </div>

            <form
                class="m-accessStep__form"
                :class="{'-isCn': isCn}"
                method="POST"
                @submit.prevent.once="$v.$touch"
                @submit.prevent="submit">

                <input class="hidden" type="submit" />

                <div class="m-accessStep__fields">
                    <div class="m-accessStep__field">
                        <label
                            :for="newPasswordInputId"
                            class="m-accessStep__label pb-5">

                            <slot name="new-password-label">
                                NEW PASSWORD
                            </slot>
                        </label>

                        <div class="relative">
                            <a-input-glimpse
                                ref="new-password"
                                :is-cn="isCn"
                                :input-classname="$v.newPassword.$error ? '-isInvalid' : ''"
                                :attributes="newPasswordAttributes"
                                :show-label="newPasswordViewButtonAria"
                                :hide-label="newPasswordHideButtonAria"
                                :has-criteria="true"
                                :mods="isCn ? 'text-xl' : ''"
                                @input="setNewPassword" />

                            <a-icon v-if="$v.newPassword.$error" size="inherit" class="absolute text-red top-15 right-40" role="alert">
                                {{ errorIcon }}
                            </a-icon>
                        </div>
                    </div>

                    <div class="m-accessStep__field">
                        <label
                            :for="confirmPasswordInputId"
                            class="m-accessStep__label pb-5">

                            <slot name="confirm-password-label">
                                CONFIRM PASSWORD
                            </slot>
                        </label>

                        <div class="relative">
                            <a-input-glimpse
                                ref="confirm-password"
                                :mods="isCn ? 'text-xl' : ''"
                                :is-cn="isCn"
                                :input-classname="$v.confirmPassword.$error ? '-isInvalid' : ''"
                                :attributes="confirmPasswordAttributes"
                                :show-label="confirmPasswordViewButtonAria"
                                :hide-label="confirmPasswordHideButtonAria"
                                @input="setConfirmPassword" />

                            <a-icon v-if="$v.confirmPassword.$error" size="inherit" class="absolute text-red top-15 right-40" role="alert">
                                {{ errorIcon }}
                            </a-icon>
                        </div>
                    </div>
                </div>

                <div class="m-accessStep__submit" aria-live="polite">
                    <div class="flex-none">
                        <button
                            class="a-accountButton self-start flex-shrink-0"
                            :class="{'text-sm px-60' : isCn}"
                            type="button"
                            @click.once="$v.$touch"
                            @click="submit($event)">

                            <slot name="button-label">
                                UPDATE PASSWORD
                            </slot>
                        </button>
                    </div>

                    <div
                        v-if="apiError || (!$v.newPassword.criteria && $v.$dirty) || (!$v.confirmPassword.match && $v.$dirty)"
                        :id="errorId"
                        class="m-accessStep__error"
                        aria-live="assertive">

                        <div class="m-accessStep__icon">
                            <a-icon color="red" size="inherit">
                                {{ errorIcon }}
                            </a-icon>
                        </div>

                        <span v-if="!$v.newPassword.criteria">
                            <slot name="criteria-error">
                                Your new password does not<br class="hidden md:block" /> meet the necessary criteria.<br /> Please try again.
                            </slot>
                        </span>

                        <span v-else-if="!$v.confirmPassword.match">
                            <slot name="match-error">
                                Your passwords do not match.
                            </slot>
                        </span>

                        <span v-else role="alert">
                            <slot name="api-error">
                                Something unexpected happened with your request. Please try again.
                            </slot>
                        </span>
                    </div>
                </div>
            </form>

            <div v-if="$slots['note']" class="m-accessStep__desc -note">
                <slot name="note" />
            </div>

            <div v-if="$slots['skip-text']" class="flex items-center mt-30">
                <span :id="skipId" class="m-accessStep__skip">
                    <slot name="skip-text" />
                </span>

                <m-tooltip v-if="$slots['skip-tooltip']" :tooltip-aria-labelledby="skipId">
                    <slot name="skip-tooltip" />
                </m-tooltip>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import regexParser from 'regex-parser';

    export default {
        name: 'MAccessPassword',
        mixins: [ safeId, validationMixin ],
        safeIds: [
            'newPasswordDescId',
            'newPasswordInputId',
            'confirmPasswordDescId',
            'confirmPasswordInputId',
            'errorId',
            'skipId'
        ],
        validations() {
            return {
                confirmPassword: {
                    required,
                    match: value => value === this.newPassword
                },
                newPassword: {
                    required,
                    criteria: value => this.criteria.test(value)
                }
            };
        },
        props: {
            confirmPasswordName: {
                type: String,
                default: 'ConfirmPassword'
            },
            confirmPasswordPlaceholder: {
                type: String,
                default: ''
            },
            confirmPasswordViewButtonAria: {
                type: String,
                default: 'Show field input'
            },
            confirmPasswordHideButtonAria: {
                type: String,
                default: 'Hide field input'
            },
            createAccount: {
                type: Boolean,
                default: false
            },
            criteriaRegExp: {
                type: String,
                default: '/^(?=.{8,}$)(?=.*[A-Z])(?=.*[0-9]).*$/'
            },
            gtmId: {
                type: Number,
                default: 0
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            passwordCriteria: {
                type: Object,
                default: () => ({})
            },
            newPasswordPlaceholder: {
                type: String,
                default: ''
            },
            newPasswordName: {
                type: String,
                default: 'NewPassword'
            },
            newPasswordViewButtonAria: {
                type: String,
                default: 'Show field input'
            },
            newPasswordHideButtonAria: {
                type: String,
                default: 'Hide field input'
            },
            customerIdName: {
                type: String,
                default: 'CustomerId'
            },
            identificationPinName: {
                type: String,
                default: 'IdentificationPin'
            },
            identificationName: {
                type: String,
                default: 'Identification'
            },
            errorIcon: {
                type: String,
                default: 'error_outline'
            },
            handler: {
                type: Function,
                required: true
            },
            loading: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                apiError: false,
                confirmPassword: '',
                newPassword: '',

                // unique Ids for aria mapping
                newPasswordDescId: '',
                newPasswordInputId: '',
                confirmPasswordDescId: '',
                confirmPasswordInputId: '',
                errorId: '',
                skipId: ''
            };
        },
        computed: {
            ...mapState('access', ['identification', 'melaleucaId', 'customerId', 'pin']),
            criteria() {
                return regexParser(this.criteriaRegExp);
            },
            data() {
                if(this.createAccount) {
                    return {
                        IdentificationPin: this.pin || '',
                        Password: this.newPassword,
                        ConfirmPassword: this.confirmPassword,
                        CustomerIdentification: {
                            Identification: this.identification || '',
                            MelaleucaNumber: this.melaleucaId || '',
                            CountryCode: null
                        }
                    };
                }
                let data = {};
                data[this.confirmPasswordName] = this.confirmPassword;
                data[this.newPasswordName] = this.newPassword;
                data[this.customerIdName] = this.customerId;
                data[this.identificationPinName] = this.pin;
                data[this.identificationName] = this.identification;

                return data;
            },
            confirmPasswordAttributes() {
                return {
                    'id': this.confirmPasswordInputId,
                    'name': this.confirmPasswordName,
                    'placeholder': this.confirmPasswordPlaceholder ? this.confirmPasswordPlaceholder : null,
                    'aria-required': 'true',
                    'aria-invalid': this.$v.confirmPassword.$error,
                    'aria-describedby': this.$v.confirmPassword.$error ? this.errorId : null
                };
            },
            newPasswordAttributes() {
                return {
                    'Criteria': {
                        'case': this.passwordCriteria?.Case,
                        'number': this.passwordCriteria?.Number,
                        'qtityChar': this.passwordCriteria?.QtityChar,
                        'title': this.passwordCriteria?.Title
                    },
                    'id': this.newPasswordInputId,
                    'name': this.newPasswordName,
                    'placeholder': this.newPasswordPlaceholder ? this.newPasswordPlaceholder : null,
                    'aria-required': 'true',
                    'aria-invalid': this.$v.newPassword.$error,
                    'aria-describedby': this.$v.newPassword.$error ? this.errorId : null
                };
            },
            isCn() {
                // CN behavior for the a-input-glimpse icon 's size.
                return this.$env?.IsCn || false;
            }
        },
        methods: {
            setConfirmPassword(value) {
                this.confirmPassword = value;
            },
            setNewPassword(value) {
                this.newPassword = value;
            },
            async submit($e) {
                if(!this.loading) {
                    this.apiError = false;

                    if(!this.$v.$invalid) {
                        const response = await this.handler(this.data);
                        this.gtmTrackAction({id: this.gtmId}, $e);
                        if(!response) {
                            this.apiError = true;
                        }
                    } else {
                        if(this.$v.newPassword.$error) {
                            this.$refs['new-password'].$emit('focus');
                        } else if(this.$v.confirmPassword.$error) {
                            this.$refs['confirm-password'].$emit('focus');
                        }
                    }
                }
            }
        }
    };
</script>

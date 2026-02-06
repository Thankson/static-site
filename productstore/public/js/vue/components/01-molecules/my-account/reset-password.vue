<template>
    <div class="m-resetPassword">
        <h2 v-if="isCn && isProfile" class="m-resetPassword__title">
            {{ getLocalizationProp('Labels.SubTitle') }}
        </h2>
        <div class="m-resetPassword__content">
            <component
                :is="isFormEl ? 'form' : 'div'"
                class="m-resetPassword__form"
                :method="isFormEl ? 'POST' : null">

                <input class="hidden" type="submit" />

                <div class="m-resetPassword__fields">
                    <div v-if="oldPasswordRequired" class="m-resetPassword__field">
                        <label
                            :for="oldPasswordInputId"
                            class="m-resetPassword__label pb-5">
                            {{ oldPasswordLabel }}
                        </label>
                        <a-input-glimpse
                            ref="old-password"
                            :input-classname="($v.oldPassword.$error || errorCurrent !== '') ? '-isInvalid' : ''"
                            :attributes="oldPasswordAttributes"
                            @input="setOldPassword" />
                        <p v-if="(isProfile || isCnReset) && !$v.oldPassword.required && $v.$dirty" class="e-formError__item text-left w-full not-italic">{{ oldPassordCriteriaLabel }}</p>
                        <p v-if="errorCurrent !== ''" class="e-formError__item text-left w-full not-italic" role="alert">{{ errorCurrent }}</p>
                    </div>
                    <div class="m-resetPassword__field">
                        <label
                            :for="newPasswordInputId"
                            class="m-resetPassword__label pb-5"
                        >
                            {{ isNewPassword ? createPasswordLabel : newPasswordLabel }}
                        </label>

                        <a-input-glimpse
                            ref="new-password"
                            :input-classname="$v.newPassword.$error ? '-isInvalid' : ''"
                            :attributes="newPasswordAttributes"
                            :has-criteria="true"
                            :is-cn="isCn"
                            :value="newPassword"
                            @input="setNewPassword" />
                        <p v-if="isCn && (isProfile || isCnReset) && !$v.newPassword.match && $v.$dirty" class="e-formError__item text-left w-full not-italic">{{ matchNewPasswordLabel }}</p>
                    </div>

                    <div class="m-resetPassword__field">
                        <label
                            :for="confirmPasswordInputId"
                            class="m-resetPassword__label pb-5"
                        >
                            {{ confirmPasswordLabel }}
                        </label>

                        <a-input-glimpse
                            ref="confirm-password"
                            :input-classname="$v.confirmPassword.$error ? '-isInvalid' : ''"
                            :attributes="confirmPasswordAttributes"
                            :value="confirmPassword"
                            @input="setConfirmPassword" />
                        <p v-if="isCn && (isProfile || isCnReset) && !$v.confirmPassword.match && $v.$dirty" class="e-formError__item text-left w-full not-italic">{{ matchLabel }}</p>
                    </div>
                </div>

                <div class="m-resetPassword__submit" aria-live="polite">
                    <slot
                        name="actions"
                        v-bind="slotProps">

                        <div class="m-resetPassword__btn">
                            <a
                                v-if="isCn && isProfile"
                                class="a-button m-resetPassword__cancel"
                                :href="getLocalizationProp('Labels.CancelButton.Url')"
                            >
                                {{ getLocalizationProp('Labels.CancelButton.Text') }}
                            </a>
                            <button
                                class="a-accountButton self-start flex-shrink-0"
                                :class="(isCn && isProfile) ? 'w-auto' : ''"
                                type="button"
                                @click="submit"
                            >
                                {{ updateLabel }}
                            </button>

                            <div class="m-resetPassword__loading">
                                <a-loading-spinner :visible="loading" size="sm" />
                            </div>

                        </div>
                    </slot>

                    <div
                        v-if="errorVisible && showError"
                        :id="errorId"
                        class="m-resetPassword__error"
                        aria-live="assertive">

                        <div class="m-resetPassword__icon">
                            <a-icon color="red" size="inherit">
                                {{ errorIcon }}
                            </a-icon>
                        </div>

                        {{ errorMessage }}
                    </div>
                </div>
            </component>

            <div v-if="!preventSave" class="hidden">
                <o-sign-in-card
                    ref="sign-in-form"
                    :action="action"
                    :redirect-url="redirectUrl"
                    :username="username"
                    :password="passwordString"
                    :stay-signed-in="staySignedIn" />
            </div>

            <modal v-if="isCn" id="updateSuccess">
                <template v-slot:heading>
                    <span class="text-3xl block to-sm:text-2xl-2" role="text">
                        {{ getLocalizationProp('Labels.Modal.Title', 'Success!') }}
                    </span>
                </template>

                <template v-slot:body>
                    <p class="text-sm text-gray-120 pr-0 md:pr-15">
                        {{ getLocalizationProp('Labels.Modal.Description', 'Success!') }}
                    </p>
                </template>

                <template v-slot:footer>
                    <button
                        class="a-button -white mr-20 inline-block px-40 py-12 mb-20"
                        @click="closeModal('updateSuccess')">
                        {{ getLocalizationProp('Labels.Modal.Cancel', 'Cancel') }}
                    </button>
                    <a
                        class="a-button -green inline-block px-40 py-12"
                        :href="getLocalizationProp('Labels.CancelButton.Url')">
                        {{ getLocalizationProp('Labels.Modal.Continue', 'Continue') }}
                    </a>
                </template>
            </modal>
        </div>
    </div>
</template>

<script>
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import regexParser from 'regex-parser';
    import updatePasswordApi from '@api/routes/customeraccount/forgotpassword/updatepassword';
    import updatePasswordApiCN from '@api/routes/customeraccount/forgotpassword/updatepasswordCN';
    import createAccountApi from '@api/routes/customeraccount/createaccount';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MResetPassword',
        mixins: [ safeId, validationMixin, localizationMixin ],
        safeIds: [
            'oldPasswordDescId',
            'oldPasswordInputId',
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
                    match: value => value === this.newPassword && this.criteria.test(value)
                },
                newPassword: {
                    required,
                    criteria: value => this.criteria.test(value),
                    match: (this.isCn) ? value => (value !== this.oldPassword) : false
                },

                ...(this.oldPasswordRequired ? {
                    oldPassword: {
                        required
                    }
                } : {})
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
            confirmPasswordValue: {
                type: String,
                default: ''
            },
            criteriaRegExp: {
                type: String,
                default: '/^(?=.{8,}$)(?=.*[A-Z])(?=.*[0-9]).*$/'
            },
            labels: {
                type: Object,
                default() {
                    return {};
                }
            },
            newPasswordPlaceholder: {
                type: String,
                default: ''
            },
            newPasswordName: {
                type: String,
                default: 'NewPassword'
            },
            newPasswordValue: {
                type: String,
                default: ''
            },
            errorIcon: {
                type: String,
                default: 'error_outline'
            },
            errorVisible: {
                type: Boolean,
                default: true
            },
            isFormEl: {
                type: Boolean,
                default: true
            },
            oldPasswordName: {
                type: String,
                default: 'CurrentPassword'
            },
            oldPasswordPlaceholder: {
                type: String,
                default: ''
            },
            preventSave: {
                type: Boolean,
                default: false
            },
            customerId: {
                type: [String, Number],
                default: ''
            },
            email: {
                type: String,
                default: ''
            },
            scriptId: {
                type: String,
                required: true
            },
            validationAccessCode: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                apiError: false,
                apiErrorMessage: '',
                confirmPassword: '',
                isNewPassword: false,
                isProfile: false,
                isCnReset: false,
                loading: false,
                ready: false,
                oldPassword: '',
                newPassword: '',

                // unique Ids for aria mapping
                oldPasswordDescId: '',
                oldPasswordInputId: '',
                newPasswordDescId: '',
                newPasswordInputId: '',
                confirmPasswordDescId: '',
                confirmPasswordInputId: '',
                errorId: '',
                errorCurrent: '',
                skipId: '',

                // invisible sign in form bindings
                action: '',
                redirectUrl: '',
                username: '',
                passwordString: '',
                staySignedIn: false,

                // labels:
                newPasswordLabel: '',
                oldPasswordLabel: '',
                confirmPasswordLabel: '',
                createPasswordLabel: '',
                updateLabel: '',
                oldPassordCriteriaLabel: '',
                criteriaLabel: '',
                matchLabel: '',
                matchNewPasswordLabel: '',
                apiLabel: '',
                placeholderConfirm: '',
                placeholderNew: '',
                placeholderOld: '',
                criteriaCaseLabel: '',
                criteriaNumberLabel: '',
                criteriaQtyCharLabel: '',
                criteriaTitleLabel: ''
            };
        },
        computed: {
            customerIdField() {
                // either customerId is passed in via props or user is logged in and is available globally:
                return this.customerId || window.dataLayer?.[0].customerID;
            },
            criteria() {
                return regexParser(this.criteriaRegExp);
            },
            data() {
                let data = {};
                data[this.confirmPasswordName] = this.confirmPassword;
                data[this.newPasswordName] = this.newPassword;
                if(this.isCn && this.isProfile) {
                    data[this.oldPasswordName] = this.oldPassword;
                }

                return data;
            },
            confirmPasswordAttributes() {
                return {
                    'id': this.confirmPasswordInputId,
                    'name': this.confirmPasswordName,
                    'placeholder': this.placeholderConfirm,
                    'aria-required': 'true',
                    'aria-invalid': this.$v.confirmPassword.$error,
                    'aria-describedby': this.$v.confirmPassword.$error ? this.errorId : null
                };
            },
            errorMessage() {
                switch (false) {
                    case this.$v.newPassword.criteria:
                        return this.criteriaLabel;
                    case this.$v.confirmPassword.match:
                        return this.matchLabel;
                    case !this.apiError:
                        return this.apiErrorMessage;
                    default:
                        return this.apiLabel;
                }
            },
            newPasswordAttributes() {
                return {
                    'Criteria': {
                        'case': this.criteriaCaseLabel,
                        'number': this.criteriaNumberLabel,
                        'qtityChar': this.criteriaQtyCharLabel,
                        'title': this.criteriaTitleLabel
                    },
                    'id': this.newPasswordInputId,
                    'name': this.newPasswordName,
                    'placeholder': this.placeholderNew,
                    'aria-required': 'true',
                    'aria-invalid': this.$v.newPassword.$error,
                    'aria-describedby': this.$v.newPassword.$error ? this.errorId : null
                };
            },
            oldPasswordAttributes() {
                return {
                    'id': this.oldPasswordInputId,
                    'name': this.oldPasswordName,
                    'placeholder': this.placeholderOld,
                    'aria-required': 'true',
                    'aria-invalid': this.$v.oldPassword.$error,
                    'aria-describedby': this.$v.oldPassword.$error ? this.errorId : null
                };
            },
            oldPasswordRequired() {
                return this.isCn && (this.isProfile || this.isCnReset);
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            showError() {
                if(this.isCn) return false;

                return this.apiError || this.$v.$error;
            },
            slotProps() {
                return {
                    errorId: this.errorId,
                    errorMessage: this.errorMessage,
                    loading: this.loading,
                    showError: this.showError,
                    submit: this.submit
                };
            }
        },
        watch: {
            confirmPassword() {
                this.emitInput();
            },
            confirmPasswordValue() {
                this.confirmPassword = this.confirmPasswordValue;
            },
            newPassword() {
                this.emitInput();
            },
            newPasswordValue() {
                this.newPassword = this.newPasswordValue;
            },
            oldPassword() {
                this.emitInput();
            }
        },
        mounted() {
            this.oldPasswordLabel = this.getLocalizationProp('Labels.Password.OldPassword', '');
            this.newPassword = this.newPasswordValue;
            this.newPasswordLabel = this.getLocalizationProp('Labels.Password.NewPassword');
            this.createPasswordLabel = this.getLocalizationProp('Labels.Password.CreatePassword');
            this.confirmPassword = this.confirmPasswordValue;
            this.confirmPasswordLabel = this.getLocalizationProp('Labels.Password.ConfirmPassword');
            this.updateLabel = this.getLocalizationProp('Labels.Password.Update');
            this.criteriaLabel = this.getLocalizationProp('Labels.Password.Errors.Criteria');
            this.oldPassordCriteriaLabel = this.getLocalizationProp('Labels.Password.Errors.OldPassordCriteria');
            this.matchLabel = this.getLocalizationProp('Labels.Password.Errors.Match');
            this.matchNewPasswordLabel = this.getLocalizationProp('Labels.Password.Errors.Same');
            this.apiLabel = this.getLocalizationProp('Labels.Password.Errors.Api');
            this.isNewPassword = this.getLocalizationProp('Data.IsNewPassword', false);
            this.placeholderOld = this.oldPasswordPlaceholder || this.getLocalizationProp('Labels.Password.PlaceholderOld');
            this.placeholderConfirm = this.confirmPasswordPlaceholder || this.getLocalizationProp('Labels.Password.PlaceholderConfirm');
            this.placeholderNew = this.newPasswordPlaceholder || this.getLocalizationProp('Labels.Password.PlaceholderNew');
            this.criteriaCaseLabel = this.getLocalizationProp('Labels.Password.Criteria.Case');
            this.criteriaNumberLabel = this.getLocalizationProp('Labels.Password.Criteria.Number');
            this.criteriaQtyCharLabel = this.getLocalizationProp('Labels.Password.Criteria.QtityChar');
            this.criteriaTitleLabel = this.getLocalizationProp('Labels.Password.Criteria.Title');
            this.isProfile = this.getLocalizationProp('Data.IsProfile', false);
            this.isCnReset = this.getLocalizationProp('Data.IsCnReset', false);
            this.$nextTick(() => (this.ready = true));
        },
        methods: {
            closeModal: function(id) {
                this.$modal.hide({id: id});
            },
            emitInput() {
                if(this.ready) {
                    this.$emit('input', {
                        confirmPassword: this.confirmPassword,
                        newPassword: this.newPassword,
                        oldPassword: this.oldPassword,
                        isValid: !this.$v.$invalid
                    });
                }
            },
            setConfirmPassword(value) {
                this.confirmPassword = value;
            },
            setNewPassword(value) {
                this.newPassword = value;
            },
            setOldPassword(value) {
                this.oldPassword = value;
                this.errorCurrent = '';
            },
            async savePassword() {
                this.loading = true;
                let response;

                // create new password:
                if(this.isNewPassword) {
                    response = await createAccountApi.post({
                        'Password': this.$refs['new-password'].input,
                        'ConfirmPassword': this.$refs['confirm-password'].input,
                        'UserName': this.email,
                        'IdentificationPin': this.validationAccessCode,
                        'CustomerIdentification': {
                            'Identification': this.email
                        }
                    });
                // password reset -- if the user is logged in, there will be a customerId:
                } else if(this.customerIdField) {
                    response = await updatePasswordApi.post({
                        'newPassword': this.$refs['new-password'].input,
                        'confirmPassword': this.$refs['confirm-password'].input,
                        'customerId': this.customerIdField
                    });
                // force password reset -- user is NOT logged in:
                } else {
                    response = await updatePasswordApi.post({
                        'newPassword': this.$refs['new-password'].input,
                        'confirmPassword': this.$refs['confirm-password'].input
                    });
                }

                const success = response.success && (response.data.success || response.data.Success);
                if(success) {
                    this.action = response.data.action;
                    this.redirectUrl = response.data.returnUrl;
                    this.username = response.data.username;
                    this.passwordString = this.$refs['confirm-password'].input;
                    this.staySignedIn = response.data.keepMeSignedin;
                    this.loading = false;

                    this.$nextTick(() => this.$refs['sign-in-form'].$emit('submit'));
                } else {
                    this.apiError = true;
                    this.apiErrorMessage = response.data?.ErrorMessage?.[0]?.Translation;
                }

                this.loading = false;
            },
            async savePasswordCn() {
                this.loading = true;
                let response;
                let paramCn;

                if(this.isCnReset) {
                    paramCn = {
                        'isCnReset': this.isCnReset,
                        'oldPassword': this.$refs['old-password'].input,
                        'newPassword': this.$refs['new-password'].input,
                        'confirmPassword': this.$refs['confirm-password'].input
                    };
                }
                if(this.isProfile) {
                    paramCn = {
                        'oldPassword': this.$refs['old-password'].input,
                        'newPassword': this.$refs['new-password'].input,
                        'confirmPassword': this.$refs['confirm-password'].input
                    };
                }
                response = await updatePasswordApiCN.post(paramCn);
                if(response.success && response?.data?.result.Success) {
                    if(response.data.keepMeSignedin && this.isProfile) {
                        this.username = response.data.username;
                        this.passwordString = this.$refs['confirm-password'].input;
                        this.staySignedIn = response.data.keepMeSignedin;
                        this.loading = false;
                        this.openModal('updateSuccess');
                    } else if(!response.data.keepMeSignedin && this.isProfile) {
                        window.location.href = response.data.returnUrl;
                    } else {
                        this.action = response.data.action;
                        this.redirectUrl = response.data.returnUrl;
                        this.username = response.data.username;
                        this.passwordString = this.$refs['confirm-password'].input;
                        this.staySignedIn = response.data.keepMeSignedin;
                        this.loading = false;

                        this.$nextTick(() => this.$refs['sign-in-form'].$emit('submit'));
                    }
                } else if(response.success && !response?.data?.result.Success) {
                    this.loading = false;
                    this.action = response.data.action;
                    this.errorCurrent = response.data.result.ErrorMessages[0].Translation;
                    this.$nextTick(() => this.$refs['old-password'].$emit('focus'));
                } else {
                    console.log('error!');
                }

                this.loading = false;
            },
            async submit() {
                if(this.loading) {
                    return;
                }

                this.apiError = false;
                this.apiErrorMessage = '';
                this.$v.$touch();

                // if form is valid ping API:
                if(!this.$v.$invalid) {
                    if(!this.preventSave) {
                        if(this.isCn) {
                            this.savePasswordCn();
                        } else {
                            this.savePassword();
                        }
                    }
                // if form is invalid, show and focus to errors:
                } else {
                    if(this.isCn && this.isProfile && this.$v.oldPassword.$error) {
                        this.$refs['old-password'].$emit('focus');
                    } else if(this.$v.newPassword.$error) {
                        this.$refs['new-password'].$emit('focus');
                    } else if(this.$v.confirmPassword.$error) {
                        this.$refs['confirm-password'].$emit('focus');
                    }
                }

                this.$emit('submit', {
                    confirmPassword: this.confirmPassword,
                    newPassword: this.newPassword,
                    oldPassword: this.oldPassword,
                    isValid: !this.$v.$invalid
                });
            },
            openModal: function(id) {
                this.$modal.show({id: id});
            }
        }
    };
</script>

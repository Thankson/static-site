<template>
    <div>
        <o-access
            v-show="ready"
            :complete-text="data.Completed || 'Completed:'"
            :loading="loading">

            <template v-slot:heading>
                {{ data.ForgotPasswordHeader }}
            </template>

            <template v-slot:progress-step-1>
                {{ data.NavigationStep1 }}
            </template>

            <template v-slot:step-1>
                <m-access-identify :is-cn="isCn" :loading="loading" :gtm-id="183" :forgot-password-only-verify-phone="forgotPasswordOnlyVerifyPhone" @disable-resend="setResend">
                    <template v-slot:heading>
                        <span v-html="data.Step1Title"></span>
                    </template>

                    <template v-slot:description>
                        <p v-html="data.Step1Description">
                        </p>
                    </template>

                    <template v-slot:email-phone-label>
                        <span v-html="data.Step1EmailOrPhoneLabel"></span>
                    </template>

                    <template v-slot:email-phone-error>
                        <span v-html="data.Step1IdentificationError"></span>
                    </template>

                    <template v-slot:customer-id-error>
                        <span v-html="data.Step1CustomerIdInvalid"></span>
                    </template>

                    <template v-slot:customer-id-description>
                        <p v-html="data.Step1MoreInfoRequired"></p>
                    </template>

                    <template v-slot:customer-id-label>
                        <span v-html="data.Step1CustomerIDLabel"></span>
                    </template>

                    <template v-if="data.Step1CustomerIDLabelHelp" v-slot:customer-id-tooltip>
                        <span v-html="data.Step1CustomerIDLabelHelp"></span>
                    </template>

                    <template v-slot:api-error>
                        <span v-html="data.Step1IdentificationError"></span>
                    </template>

                    <template v-slot:api-error-pin-limit-exceeded>
                        <span v-html="data.Step1PinLimitExceededError"></span>
                    </template>

                    <template v-slot:api-error-duplicate-email-phone>
                        <span v-html="data.Step1IdentificationErrorDuplicateEmailPhone"></span>
                    </template>

                    <template v-slot:button-label>
                        {{ data.Continue }}
                    </template>
                </m-access-identify>
            </template>

            <template v-slot:progress-step-2>
                {{ data.NavigationStep2 }}
            </template>

            <template v-slot:step-2>
                <m-access-verify :is-cn="isCn" :loading="loading" :is-disable-resend="canResend" :gtm-id="183">
                    <template v-slot:heading>
                        <span v-html="step2Heading"></span>
                    </template>

                    <template v-slot:description>
                        <p v-html="step2Desc"></p>
                    </template>

                    <template v-slot:field-label>
                        <span v-html="data.Step2EnterCodeLabel"></span>
                    </template>

                    <template v-slot:field-error>
                        <component :is="step2InvalidCodeError" />
                    </template>

                    <template v-slot:api-error>
                        <component :is="step2InvalidCodeError" />
                    </template>

                    <template v-slot:field-resend>
                        <span v-html="data.Step2InvalidCodeBackToIdentifyText" />
                    </template>

                    <template v-slot:field-exceed>
                        <span v-html="data.Step2TimesExceeded" />
                    </template>

                    <template v-if="data.Step2AlreadySendCode" v-slot:alert-tips>
                        <span v-html="data.Step2AlreadySendCode"></span>
                    </template>

                    <template v-slot:button-label>
                        {{ data.Step2ButtonText }}
                    </template>

                    <template v-slot:note>
                        <component :is="step2FooterText" />
                    </template>
                </m-access-verify>
            </template>

            <template v-slot:progress-step-3>
                {{ data.NavigationStep3 }}
            </template>

            <template v-slot:step-3>
                <m-access-password
                    :loading="loading"
                    :gtm-id="183"
                    :new-password-placeholder="data.Step3NewPasswordPlaceholder"
                    :confirm-password-placeholder="data.Step3ConfirmPasswordPlaceholder"
                    :new-password-view-button-aria="data.Step3NewPasswordViewButtonAria"
                    :confirm-password-view-button-aria="data.Step3ConfirmPasswordViewButtonAria"
                    :confirm-password-hide-button-aria="data.Step3ConfirmPasswordHideButtonAria"
                    :new-password-hide-button-aria="data.Step3NewPasswordHideButtonAria"
                    :password-criteria="passwordCriteria"
                    :handler="password">

                    <template v-slot:heading>
                        <span v-html="data.Step3Title"></span>
                    </template>

                    <template v-slot:new-password-label>
                        <span v-html="data.Step3NewPassword"></span>
                    </template>

                    <template v-slot:criteria-error>
                        <span v-html="data.Step3InvalidPassword"></span>
                    </template>

                    <template v-slot:confirm-password-label>
                        <span v-html="data.Step3ConfirmPassword"></span>
                    </template>

                    <template v-slot:match-error>
                        <span v-html="data.Step3PasswordsDoNotMatch"></span>
                    </template>

                    <template v-slot:api-error>
                        <span v-html="apiErrorMessage"></span>
                    </template>

                    <template v-slot:button-label>
                        {{ data.Step3ButtonText }}
                    </template>

                    <!-- DESCOPED -->
                    <!-- <template v-if="data.Step3SkipThisStep" v-slot:skip-text>
                        <a :href="data.RedirectUrl" @click="gtmTrackAction({id: 183}, $event)" v-html="data.Step3SkipThisStep"></a>
                    </template> -->
                    <!-- /DESCOPED -->

                    <template v-if="data.Step3SkipThisStepHelp" v-slot:skip-tooltip>
                        <span v-html="data.Step3SkipThisStepHelp"></span>
                    </template>
                </m-access-password>
            </template>

            <template v-slot:progress-final>
                {{ data.NavigationStep4 }}
            </template>
        </o-access>

        <div v-if="!ready" class="max-w-contain px-15 mx-auto mt-25 md:mt-50">
            <div v-if="!loading" class="text-red">
                <slot name="initialization-error" />
            </div>

            <a-loading-spinner :visible="loading" />
        </div>

        <div class="hidden">
            <o-sign-in-card
                ref="sign-in-form"
                :action="action"
                :redirect-url="redirectUrl"
                :username="username"
                :password="passwordString"
                :stay-signed-in="staySignedIn" />
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';

    // API handlers
    import localization from '@api/routes/localization/customeraccount/forgotpassword';
    import password from '@api/routes/customeraccount/forgotpassword/updatepassword';

    export default {
        name: 'OForgotPassword',
        data() {
            return {
                data: {},
                loading: true,
                ready: false,

                // invisible sign in form bindings
                action: '',
                redirectUrl: '',
                username: '',
                passwordString: '',
                staySignedIn: false,
                canResend: false,
                apiErrorMessage: 'Something unexpected happened with your request. Please try again. If the problem persist please call Customer Support at 1-800-742-2444.',
                forgotPasswordOnlyVerifyPhone: false
            };
        },
        computed: {
            ...mapState('access', ['identification']),
            passwordCriteria() {
                return {
                    Case: this.data.PasswordCriteriaCase,
                    Number: this.data.PasswordCriteriaNumber,
                    QtityChar: this.data.PasswordCriteriaQtityChar,
                    Title: this.data.PasswordCriteriaTitle
                };
            },
            step2Heading() {
                return this.data.Step2Title?.replace('{0}', `<span class="m-accountAccessStep__contact">${this.identification}</span>`);
            },
            step2Desc() {
                return this.data.Step2Description?.replace('{0}', `<span class="m-accountAccessStep__contact">${this.identification}</span>`);
            },
            step2FooterText() {
                // to properly render the <a-access-link> element, we need to dynamically generate a Vue component as a rendering wrapper
                let renderer = null;
                if(this.data.Step2FooterText) {
                    const markup = this.data.Step2FooterText.replace('{0}', `<a-access-link class="text-black" prev>${this.data.Step2FooterBackToIdentifyText}</a-access-link>`);
                    renderer = {
                        template: `<p>${markup}</p>`
                    };
                }
                return renderer;
            },
            step2InvalidCodeError() {
                // to properly render the <a-access-link> element, we need to dynamically generate a Vue component as a rendering wrapper
                let renderer = null;
                if(this.data.Step2InvalidCodeError) {
                    const markup = this.data.Step2InvalidCodeError.replace('{0}', `<a-access-link prev>${this.data.Step2InvalidCodeBackToIdentifyText}</a-access-link>`);
                    renderer = {
                        template: `<p>${markup}</p>`
                    };
                }
                return renderer;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        created() {
            this.localization();
        },
        methods: {
            ...mapActions('access', ['nextStep']),

            async localization() {
                const response = await localization.get();

                if(response.success) {
                    this.data = response.data.Labels;
                    this.ready = true;
                    this.forgotPasswordOnlyVerifyPhone = response.data.Data?.ForgotPasswordOnlyVerifyPhone;
                } else {
                    console.error('Error: ', response.error);
                }

                this.loading = false;
            },
            async password(params, skip = false) {
                this.loading = true;
                const response = await password.post(params);

                const success = response.success && (response.data.success || response.data.Success);
                if(success) {
                    this.action = response.data.action;
                    this.redirectUrl = response.data.returnUrl;
                    this.username = response.data.username;
                    this.passwordString = params.ConfirmPassword;
                    this.staySignedIn = response.data.keepMeSignedin;

                    this.$nextTick(() => this.$refs['sign-in-form'].$emit('submit'));
                } else {
                    this.apiErrorMessage = response.data?.ErrorMessage?.[0]?.Translation || (this.isCn ? this.data.ApiDefaultErrorMessage : this.apiErrorMessage);
                }

                this.loading = false;
                return success;
            },
            setResend(value) {
                this.canResend = value;
            }
        }
    };
</script>

<template>
    <div class="m-accessStep">
        <div class="m-accessStep__content">
            <div class="m-accessStep__desc">
                <slot name="description" />
            </div>

            <div class="m-accessStep__form">
                <div class="m-accessStep__field">
                    <label
                        :for="inputId"
                        class="m-accessStep__label pb-5">

                        <slot name="field-label">
                            ENTER CODE
                        </slot>
                    </label>

                    <div class="md:flex md:flex-wrap">
                        <div class="flex -mx-5">
                            <div class="md:flex-1 px-5 mb-20">
                                <input
                                    :id="inputId"
                                    ref="input"
                                    v-model="input"
                                    class="a-input -text"
                                    :class="$v.input.$error || apiError ? '-isInvalid' : ''"
                                    type="text"
                                    name="pinName"
                                    autocomplete="off"
                                    aria-required="true"
                                    :aria-invalid="$v.input.$error || apiError"
                                    :aria-describedby="$v.input.$error || apiError ? inputErrorId : null"
                                />
                            </div>

                            <div class="flex-grow-1 flex-shrink-0 text-center px-5 -isCn">
                                <button
                                    class="a-accountButton -code"
                                    :class="{'-disabled': disableResendButton, 'mb-5 text-sm': true}"
                                    type="button"
                                    :disabled="disableResendButton"
                                    :aria-disabled="disableResendButton"
                                    @click="resend"
                                >
                                    <!-- <slot name="field-resend">
                                        Resend
                                    </slot> -->
                                    <span v-html="resendText" />
                                </button>
                            </div>
                        </div>

                        <div v-if="apiLoading" class="m-accessStep__loading">
                            <a-loading-spinner :visible="apiLoading" aria-hidden="true" size="sm" />
                        </div>
                    </div>

                    <div class="block sm:inline-block -isCn">
                        <button
                            class="a-accountButton -code mb-5 text-sm"
                            :class="{'-disabled' : disabled}"
                            type="button"
                            :disabled="disabled"
                            :aria-disabled="disabled"
                            @click.once="$v.$touch"
                            @click="submit">

                            <slot name="button-label">
                                SUBMIT CODE
                            </slot>
                        </button>
                    </div>

                </div>
            </div>

            <div v-if="$slots['note']" class="m-accessStep__desc">
                <slot name="note" />
            </div>
        </div>

        <div v-show="showAlertTips" class="m-accessStep__alertTips" :class="isDesktop && '-center'">
            <p class="m-accessStep__alertContent">
                <!-- <slot name="alert-tips" /> -->
                {{ alertTips }}
            </p>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState, mapMutations } from 'vuex';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import apiConfirm from '@api/routes/preauth/confirm';
    import apiResubmit from '@api/routes/preauth/resubmit';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    const ResponseResult = {
        success: 'success',
        fail: 'fail',
        error: 'error'
    };
    export default {
        name: 'PreAuthVerify',
        mixins: [ safeId, validationMixin, localizationMixin, isDesktop ],
        safeIds: [
            'inputId',
            'inputErrorId'
        ],
        validations: {
            input: {
                required
            }
        },
        props: {
            fieldValue: {
                type: String,
                default: ''
            },
            form: {
                type: Object,
                default: () => ({})
            },
            paymethodid: {
                type: String,
                required: true
            },
            data: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                apiError: false,
                apiLoading: false,
                input: '',
                inputId: '',
                inputErrorId: '',
                isResendDisabled: false,
                alertTips: '',
                showAlertTips: false,
                disableButton: false,

                timer: null,
                timeLeft: 0
            };
        },
        computed: {
            ...mapState('access', ['identification', 'melaleucaId']),
            ...mapState('preAuth', ['validSuccessCnt']),
            disabled() {
                return this.apiLoading || this.input === '' || this.disableButton;
            },
            disableResendButton() {
                return this.isResendDisabled || this.disableButton;
            },
            resendText() {
                return this.isResendDisabled
                    ? this.getLocalizationProp('Labels.CountDown', 'Resend ({0})').replace('{0}', this.timeLeft)
                    : this.getLocalizationProp('Labels.ResendCode', '');
            }
        },
        watch: {
            input(newVAl) {
                this.input = newVAl;
            },
            validSuccessCnt(val) {
                this.disableResend();
            }
        },
        mounted() {
            this.input = this.fieldValue;
        },
        methods: {
            ...mapMutations('preAuth', ['SET_FORM_API_ERROR', 'SET_ERRORS_MSGS']),
            ...mapActions('access', ['prevStep']),
            resetForm() {
                this.input = '';
                this.$v.$reset();
                this.apiError = false;
                this.disableButton = false;
            },
            async submit() {
                if(!this.apiLoading) {
                    this.apiError = false;

                    if(!this.$v.$invalid) {
                        this.apiLoading = true;
                        const responseResult = await this.verify();
                        this.apiLoading = false;
                        if(responseResult === ResponseResult.success) {
                            this.disableButton = true;
                            this.doShowAlertTips('AuthorizeSuccessful', () => {
                                this.disableButton = false;
                                let redirectTo = this.data?.Form?.RedirectPageAfterAuthorized?.Url;
                                redirectTo = redirectTo ? (redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`) : '/';
                                window.location.href = redirectTo;
                            });
                        } else if(responseResult === ResponseResult.fail) {
                            this.apiError = true;
                            this.disableButton = true;
                            this.doShowAlertTips('AuthorizeFailed', () => {
                                this.disableButton = false;
                                this.resetForm();
                                this.prevStep();
                            });
                        }
                    }
                    this.$refs['input'].focus();
                }
            },
            async verify() {
                const {protocolreqsn, mobileNumberValue: mobilephone, bankcode } = this.form;
                const response = await apiConfirm.post({
                    paymethodid: this.paymethodid,
                    mobilephone,
                    verifycode: this.input,
                    protocolreqsn,
                    bankcode

                });
                const success = response.success && response.data?.Success && response.data.Data?.IsSuccess;
                if(success) {
                    return ResponseResult.success;
                }

                if(!response.success) {
                    console.error('Api error: ', response.error);
                    return ResponseResult.error;
                }

                if(response.data?.Success) {
                    const {PreAuthError, ...fieldsError} = response.data.Data?.ValidationInfo || {};
                    this.SET_FORM_API_ERROR(fieldsError);
                    PreAuthError && (this.SET_ERRORS_MSGS([PreAuthError]));
                } else {
                    this.SET_ERRORS_MSGS((response.data?.ErrorMessages || []).map(err => `[PreAuth] ${err.Translation}`));
                }
                return ResponseResult.fail;
            },
            async getCode() {
                // resend code
                const {protocolreqsn, bankcode } = this.form;
                const response = await apiResubmit.post({
                    paymethodid: this.paymethodid,
                    protocolreqsn,
                    bankcode
                });
                return response.success && response.data?.Success;
            },
            disableResend(resetTimer = true) {
                if(!resetTimer) return;

                const disableTime = 60 * 1000; // 60s
                this.timeLeft = Math.ceil(disableTime / 1000);
                this.isResendDisabled = true;
                const startTime = Date.now();
                clearInterval(this.timer);
                this.timer = setInterval(() => {
                    const currentTime = Date.now();
                    const leftTime = currentTime - startTime;
                    if(leftTime > disableTime) {
                        clearInterval(this.timer);
                        this.isResendDisabled = false;
                    } else {
                        this.timeLeft = Math.ceil((disableTime - leftTime) / 1000);
                    }
                }, 1000);
                this.$once('hook:beforeDestroy', () => {
                    clearInterval(this.timer);
                });
            },
            async resend() {
                if(this.apiLoading) {
                    return;
                }
                if(this.isResendDisabled) {
                    return false;
                }
                this.apiError = false;
                this.apiLoading = true;
                this.disableResend();
                const success = await this.getCode();
                this.apiLoading = false;
                if(success) {
                    this.doShowAlertTips('NewCodeSent');
                }
            },
            doShowAlertTips(content, cb, delay = 3000) {
                this.alertTips = this.getLocalizationProp(`Labels.${content}`, '');
                this.showAlertTips = true;
                setTimeout(() => {
                    this.showAlertTips = false;
                    cb && cb();
                }, delay);
            }
        }
    };
</script>

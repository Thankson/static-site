<template>
    <form id="pre-authorization-form" class="o-preAuthorization">
        <!-- Show spinner while API is being loaded submitted -->
        <div v-if="showSpinner" class="o-preAuthorization__loading">
            <a-loading-spinner
                :visible="true"
                class="o-preAuthorization__loadingIcon"
                aria-hidden="true"
            >
            </a-loading-spinner>
        </div>

        <div class="w-full lg:w-1_2 lg:pb-7 lg:pr-20">
            <div class="m-formField -text">
                <label
                    class="m-formField__label"
                    :for="cardHolderId"
                    v-html="
                        getLocalizationProp(
                            'Labels.CardHolderName',
                            'Card Holder Name'
                        )
                    "
                >
                </label>
                <input-basic
                    :id="cardHolderId"
                    ref="cardHolder"
                    v-model="form.cardHolderValue"
                    disabled
                    name="cardHolder"
                    :tailwind-mods="
                        isCardHolderError ? '-isInvalid' : null
                    "
                >
                </input-basic>
                <div
                    v-if="isCardHolderError"
                    class="e-formError"
                >
                    <p
                        class="e-formError__item"
                        role="alert"
                        v-html="cardHolderErrorText"
                    ></p>
                </div>
            </div>

            <div class="m-formField -text">
                <label
                    class="m-formField__label"
                    :for="cardNumberId"
                    v-html="
                        getLocalizationProp(
                            'Labels.CardNumber',
                            'Card Number'
                        )
                    "
                >
                </label>
                <input-basic
                    :id="cardNumberId"
                    ref="cardNumber"
                    v-model="form.cardNumberValue"
                    disabled
                    name="cardNumber"
                    :tailwind-mods="
                        isCardNumberError ? '-isInvalid' : null
                    "
                >
                </input-basic>
                <div
                    v-if="isCardNumberError"
                    class="e-formError"
                >
                    <p
                        class="e-formError__item"
                        role="alert"
                        v-html="cardNumberErrorText"
                    ></p>
                </div>
            </div>

            <div class="m-formField -text">
                <label
                    class="m-formField__label"
                    :for="mobileNumberId"
                    v-html="
                        getLocalizationProp(
                            'Labels.MobileNumberReservedInBank',
                            'Mobile Number Reserved In Bank'
                        )
                    "
                >
                </label>
                <input-basic
                    :id="mobileNumberId"
                    ref="mobileNumber"
                    v-model="form.mobileNumberValue"
                    name="mobileNumber"
                    :tailwind-mods="
                        isMobileNumberError ? '-isInvalid' : null
                    "
                    @keyup="triggerCheckField('mobileNumberValue')"
                    @blur="triggerCheckField('mobileNumberValue')"
                >
                </input-basic>
                <div
                    v-if="isMobileNumberError"
                    class="e-formError"
                >
                    <p
                        class="e-formError__item"
                        role="alert"
                        v-html="mobileNumberErrorText"
                    ></p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="block mb-40 sm:inline-block sm:mb-30">
                <button
                    class="o-preAuthorization__button -save"
                    type="submit"
                    @click="nextStepSubmit"
                >
                    {{
                        getLocalizationProp(
                            "Labels.ApplicationButtonText",
                            "next"
                        )
                    }}
                </button>
            </div>
        </div>

        <!-- Errors -->
        <div v-if="errorsMsgs.length" class="-mt-30">
            <ul class="e-formError__list">
                <li
                    v-for="(msg, index) in errorsMsgs"
                    :key="index"
                    class="e-formError__item">
                    {{ msg }}
                </li>
            </ul>
        </div>
    </form>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import apiSubmit from '@api/routes/preauth/submit';

    const fieldErrMap = {
        mobileNumberValue: 'MobileNumberError'
    };

    export default {
        name: 'PreAuthForm',
        mixins: [localizationMixin, validationMixin, safeId],
        safeIds: ['cardHolderId', 'cardNumberId', 'mobileNumberId'],
        validations() {
            return {
                form: {
                    mobileNumberValue: {
                        required,
                        phoneNumber: value =>
                            formHelper.isValidOptionalPhoneNumber(value, 'cn')
                    }
                }
            };
        },
        props: {
            value: {
                type: Object,
                default: () => ({})
            },
            paymethodid: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                cardHolderId: '',
                cardNumberId: '',
                mobileNumberId: '',

                submitApiLoading: false
            };
        },
        computed: {
            ...mapState('preAuth', ['formApiError', 'errorsMsgs']),
            showSpinner() {
                return this.submitApiLoading;
            },
            form: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            isCardHolderError() {
                return this.formApiError.CardHolderError;
            },
            cardHolderErrorText() {
                return this.formApiError.CardHolderError || '';
            },
            isCardNumberError() {
                return this.formApiError.CardNumberError;
            },
            cardNumberErrorText() {
                return this.formApiError.CardNumberError || '';
            },
            isMobileNumberError() {
                return this.$v.form.mobileNumberValue.$error || this.formApiError.MobileNumberError;
            },
            mobileNumberErrorText() {
                if(this.$v.form.mobileNumberValue.$error) {
                    return this.getLocalizationProp(
                        'Labels.InvalidPhoneNumber',
                        'mobile number error'
                    );
                }
                return this.formApiError.MobileNumberError || '';
            }
        },
        watch: {
        },
        methods: {
            ...mapMutations('preAuth', ['SET_FORM_API_ERROR', 'SET_ERRORS_MSGS', 'SET_VALID_SUCCESS_CNT']),
            ...mapActions('access', ['nextStep']),
            triggerCheckField(field) {
                this.triggerField(field);

                if(this.formApiError[fieldErrMap[field]]) {
                    this.SET_FORM_API_ERROR({
                        ...this.formApiError,
                        [fieldErrMap[field]]: ''
                    });
                    this.SET_ERRORS_MSGS([]);
                }
            },

            triggerField(field) {
                this.$v.form[field].$touch();
            },
            isValidateField(field) {
                return !!this.$v.form[field].$invalid;
            },
            doValidation(partialCheckFields) {
                partialCheckFields.forEach(this.triggerField);
                return partialCheckFields.some(this.isValidateField);
            },
            resetForm() {
                this.$v.$reset();
                this.clearFormApiError();
                this.SET_ERRORS_MSGS([]);
            },
            async nextStepSubmit(e) {
                e.preventDefault();

                const isInValidate = this.doValidation(['mobileNumberValue']);
                if(isInValidate) return;

                this.submitApiLoading = true;
                // this.clearFormApiError();
                const isApiValidate = await this.apiVerify();
                this.submitApiLoading = false;
                if(!isApiValidate) return;

                this.resetForm();
                // go to next
                this.SET_VALID_SUCCESS_CNT();
                this.nextStep();
            },
            setFormApiError(apiValidationInfo = {}) {
                this.SET_FORM_API_ERROR(apiValidationInfo);
            },
            clearFormApiError() {
                this.SET_FORM_API_ERROR({});
            },
            async apiVerify() {
                this.resetForm();
                const response = await apiSubmit.post({
                    paymethodid: this.paymethodid,
                    accountName: this.form.cardHolderValue,
                    accounttype: this.form.accounttype,
                    mobilephone: this.form.mobileNumberValue
                });
                const success = response.success && response.data?.Success && response.data.Data?.IsSuccess;
                if(success) {
                    this.form.protocolreqsn = response.data.Data?.ProtocolReqSn;
                    const bankcode = response.data.Data?.BankCode;
                    if(bankcode) {
                        this.form.bankcode = bankcode;
                    }
                    return true;
                }

                if(!response.success) {
                    this.SET_ERRORS_MSGS([response.error]);
                } else if(response.data?.Success) {
                    const {PreAuthError, ...fieldsError} = response.data.Data?.ValidationInfo || {};
                    this.setFormApiError(fieldsError);
                    PreAuthError && (this.SET_ERRORS_MSGS([PreAuthError]));
                } else {
                    this.SET_ERRORS_MSGS((response.data?.ErrorMessages || []).map(err => `[PreAuth] ${err.Translation}`));
                }
                return false;
            }
        }
    };
</script>

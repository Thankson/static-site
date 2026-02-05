<template>
    <div class="m-accessStep">
        <div class="m-accessStep__content">
            <h2 class="m-accessStep__heading">
                <slot name="heading" />
            </h2>

            <div class="m-accessStep__desc">
                <slot name="description" />
            </div>

            <form
                class="m-accessStep__form"
                method="POST"
                @submit.prevent.once="$v.$touch"
                @submit.prevent="submit">

                <input class="hidden" type="submit" />

                <div class="m-accessStep__fields" :class="{'-isCn':isCn}">
                    <div class="m-accessStep__field">
                        <label
                            :for="emailPhoneInputId"
                            class="m-accessStep__label pb-5">

                            <slot name="email-phone-label">
                                ENTER EMAIL ADDRESS OR MOBILE NUMBER
                            </slot>
                        </label>

                        <input
                            :id="emailPhoneInputId"
                            ref="email-phone"
                            v-model.trim="emailPhone"
                            class="a-input -text"
                            :class="$v.emailPhone.$error || apiError ? '-isInvalid' : ''"
                            type="text"
                            :name="emailPhoneName"
                            aria-required="true"
                            :aria-invalid="$v.emailPhone.$error || apiError"
                            :aria-describedby="$v.emailPhone.$error || apiError ? errorId : null" />
                    </div>

                    <template v-if="!isCn && infoNeeded && !errorOnAdditionalInfoRequired">
                        <div :id="infoNeededDescId" class="m-accessStep__desc mt-5">
                            <slot name="customer-id-description">
                                <p>This phone number is associated with another account. Please enter your Customer ID number or try entering it again</p>
                            </slot>
                        </div>

                        <div class="m-accessStep__field">
                            <div class="flex items-center pb-5">
                                <label
                                    :for="customerIdInputId"
                                    class="m-accessStep__label">

                                    <slot name="customer-id-label">
                                        CUSTOMER ID NUMBER
                                    </slot>
                                </label>

                                <m-tooltip v-if="$slots['customer-id-tooltip']" class="-mt-5">
                                    <slot name="customer-id-tooltip" />
                                </m-tooltip>
                            </div>

                            <div class="m-accessStep__input -customerId">
                                <input
                                    :id="customerIdInputId"
                                    ref="customer-id"
                                    v-model="customerId"
                                    class="a-input -text"
                                    :class="apiError ? '-isInvalid' : ''"
                                    type="text"
                                    :name="customerIdName"
                                    :aria-invalid="apiError"
                                    :aria-describedby="apiError ? `${errorId} ${infoNeededDescId}` : infoNeededDescId" />

                                <span
                                    v-if="errorCustomerId"
                                    :id="errorCustomerId"
                                    class="m-accessStep__error">

                                    <span class="m-accessStep__icon">
                                        <a-icon color="red" size="inherit">
                                            {{ errorIcon }}
                                        </a-icon>
                                    </span>

                                    <slot name="customer-id-error">
                                        Invalid Customer ID. Please try again.
                                    </slot>
                                </span>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="m-accessStep__submit" :class="{'-isCn':isCn}" aria-live="polite">
                    <div class="m-accessStep__actions">
                        <button
                            class="a-accountButton self-start"
                            :class="{'-disabled' : disabled, 'text-sm px-60': isCn, '-disabledOnBlocked': disableContinueUntilUserBlocked}"
                            type="button"
                            :disabled="disabled"
                            :aria-disabled="loading || apiLoading"
                            @click.once="$v.$touch"
                            @click="[submit(), gtmTrackAction({id: gtmId}, $event)]">

                            <slot name="button-label">
                                CONTINUE
                            </slot>
                        </button>
                        <div v-if="apiLoading" class="m-accessStep__loading">
                            <a-loading-spinner :visible="apiLoading" aria-hidden="true" size="sm" />
                        </div>
                    </div>

                    <span
                        v-if="$v.emailPhone.$error || apiError || (isCn && infoNeeded)
                            || errorOnAdditionalInfoRequired || errorPinTimeExceededLimitation"
                        :id="errorId"
                        class="m-accessStep__error">

                        <span class="m-accessStep__icon">
                            <a-icon color="red" size="inherit">
                                {{ errorIcon }}
                            </a-icon>
                        </span>

                        <slot v-if="isCn && infoNeeded" name="customer-id-description">
                            <p>This phone number is associated with another account. Please enter your Customer ID number or try entering it again</p>
                        </slot>
                        <slot v-else-if="!infoNeeded && !errorOnAdditionalInfoRequired && !errorPinTimeExceededLimitation" name="api-error">
                            We were unable to identify you with the information provided. Please try again. If you believe you typed in your email or mobile number correctly, please call Customer Support at 1-800-742-2444.
                        </slot>
                        <slot v-else-if="errorPinTimeExceededLimitation" name="api-error-pin-limit-exceeded">
                            <p>Pin limit is exceeded</p>
                        </slot>
                        <slot v-else name="api-error-duplicate-email-phone">
                            Your mobile phone number is tied to multiple accounts, please contact Customer Service at 021-26074000.
                        </slot>
                    </span>
                </div>
            </form>

            <div v-if="$slots['note']" class="m-accessStep__desc -note">
                <slot name="note" />
            </div>
        </div>

        <div v-if="$slots['info-link']" class="m-accessStep__infoLink">
            <div class="inline-flex items-center">
                <slot name="info-link" />

                <m-tooltip v-if="$slots['info-link-tooltip']" class="ml-5">
                    <slot name="info-link-tooltip" />
                </m-tooltip>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapMutations } from 'vuex';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import getCountryCode from '@common/source/js/utils/get-country-code';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import forgotApi from '@api/routes/customeraccount/forgotpassword/identify';
    import createApi from '@api/routes/customeraccount/createaccount/identify';

    export default {
        name: 'MAccessIdentify',
        mixins: [ safeId, validationMixin ],
        safeIds: [
            'customerIdInputId',
            'emailPhoneInputId',
            'infoNeededDescId',
            'errorId'
        ],
        validations: {
            emailPhone: {
                required
            }
        },
        props: {
            createAccount: {
                type: Boolean,
                default: false
            },
            customerIdName: {
                type: String,
                default: 'melaleucaId'
            },
            customerIdValue: {
                type: String,
                default: ''
            },
            emailPhoneName: {
                type: String,
                default: 'identificationString'
            },
            emailPhoneValue: {
                type: String,
                default: ''
            },
            errorIcon: {
                type: String,
                default: 'error_outline'
            },
            gtmId: {
                type: Number,
                default: 0
            },
            loading: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            forgotPasswordOnlyVerifyPhone: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                apiError: false,
                customerId: '',
                disableContinueUntilUserBlocked: false,
                emailPhone: '',
                infoNeeded: false,
                // this is a  feature flag for an alternate flow for duplicate
                // emails and phonenumbers
                errorOnAdditionalInfoRequired: false,
                errorPinTimeExceededLimitation: false,
                errorCustomerId: false,
                apiLoading: false,

                // unique Ids for aria mapping
                customerIdInputId: '',
                emailPhoneInputId: '',
                infoNeededDescId: '',
                errorId: ''
            };
        },
        computed: {
            data() {
                let data = {};
                data[this.emailPhoneName] = this.emailPhone;

                if(this.infoNeeded && !this.isCn) {
                    data[this.customerIdName] = this.customerId;
                }

                return data;
            },
            disabled() {
                return this.loading || this.apiLoading ||
                    (this.isCn && this.emailPhone === '') ||
                    this.disableContinueUntilUserBlocked;
            },
            isKr() {
                return this.$env.Country === 'Korea';
            }
        },
        watch: {
            emailPhone(newVal) {
                this.emailPhone = newVal;
            }
        },
        created() {
            // non-reactive email/phone cache
            this._emailPhoneCache = '';
        },
        mounted() {
            this.emailPhone = this.emailPhoneValue;
            this.customerId = this.customerIdValue;
        },
        methods: {
            ...mapActions('access', ['nextStep']),
            ...mapMutations('access', ['SET_IDENTIFICATION', 'SET_MELALEUCAID']),
            isValid() {
                if(!this.forgotPasswordOnlyVerifyPhone && this.emailPhone.includes('@') && !this.isKr) {
                    return formHelper.isValidEmail(this.emailPhone);
                }
                return this.isValidPhoneNumber(this.emailPhone);
            },
            isValidPhoneNumber(phoneNumber) {
                // validate phone number
                const countryCode = getCountryCode(this.$env.Country)?.toLowerCase() || '';
                return formHelper.isValidPhoneNumber(phoneNumber, countryCode);
            },
            async getIdentification() {
                this.SET_IDENTIFICATION(this.emailPhone);
                this.SET_MELALEUCAID(this.customerId);
                if(this.createAccount) {
                    if(this.isCn) {
                        return createApi.post({ IdentificationString: this.emailPhone, MelaleucaId: this.customerId, messageTemplateType: 'OnlinePasswordReset' });
                    }
                    return createApi.post({ IdentificationString: this.emailPhone, MelaleucaId: this.customerId });
                }
                if(this.isCn) {
                    return forgotApi.post({ IdentificationString: this.emailPhone, MelaleucaId: this.customerId, messageTemplateType: 'OnlinePasswordReset' });
                }
                return forgotApi.post({ IdentificationString: this.emailPhone, MelaleucaId: this.customerId });
            },
            async submit() {
                if(!this.loading && !this.apiLoading) {
                    this.apiLoading = true;
                    // if user has changed the emailPhone field since last submit, then the infoNeeded state may no longer be true
                    if(this._emailPhoneCache !== this.emailPhone) {
                        this.infoNeeded = false;
                    }
                    this._emailPhoneCache = this.emailPhone;
                    await this.validateEmailPhone();

                    if(this.customerId.length) {
                        this.errorCustomerId = true;
                    }
                    this.apiLoading = false;
                }
            },
            async validateEmailPhone() {
                let focusTarget = 'email-phone';

                this.apiError = false;

                if(!this.$v.$invalid && this.isValid()) {
                    this._emailPhoneCache = this.emailPhone;
                    this.apiLoading = true;
                    const response = await this.getIdentification();
                    if(response.success && response.data?.Data?.AdditionalInfoIsRequired) {
                        this.infoNeeded = true;
                        this.errorOnAdditionalInfoRequired = response.data?.Data?.ErrorOnAdditionalInfoRequired ? response.data?.Data?.ErrorOnAdditionalInfoRequired : false;
                    } else if(response.success &&
                        response.data?.ErrorMessages[0]?.ErrorData.replace(/[.\s]/g, '')
                            .toLowerCase() === 'requestverificationpintimesexceededthelimitation') {
                        this.errorPinTimeExceededLimitation = response.data?.ErrorMessages[0]?.Translation || 'Pin limit error';
                        this.disableContinueUntilUserBlocked = true;
                        // Reset 'Continue' and clear error after 10 minutes
                        setTimeout(() => {
                            this.disableContinueUntilUserBlocked = false;
                            this.errorPinTimeExceededLimitation = false;
                        }, 600000);
                    } else {
                        this.$emit('disable-resend', !response.data?.Success);
                        this.nextStep();
                    }
                    this.apiLoading = false;
                } else {
                    this.apiError = true;
                }

                if(focusTarget) {
                    this.$nextTick(() => this.$refs[focusTarget].focus());
                }
            }
        }
    };
</script>

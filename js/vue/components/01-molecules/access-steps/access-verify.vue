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
                @submit.prevent="submit($event)">

                <input class="hidden" type="submit" />

                <div class="m-accessStep__field">
                    <label
                        :for="inputId"
                        class="m-accessStep__label pb-5">

                        <slot name="field-label">
                            ENTER CODE
                        </slot>
                    </label>

                    <div :class="{'flex flex-wrap md:mb-15': !isCn, 'md:flex md:flex-wrap md:mb-15': isCn}">
                        <div class="m-accessStep__split">
                            <div :class="{'flex -mx-5': !isCn, 'md:flex md:-mx-5': isCn}">
                                <div :class="{'flex-1 px-5': !isCn, ' md:flex-1 md:px-5 mb-20': isCn}">
                                    <input
                                        :id="inputId"
                                        ref="input"
                                        v-model="input"
                                        class="a-input -text"
                                        :class="$v.input.$error || apiError ? '-isInvalid' : ''"
                                        :type="isCn ? 'tel' : 'text'"
                                        :name="fieldName"
                                        autocomplete="off"
                                        aria-required="true"
                                        :aria-invalid="$v.input.$error || apiError"
                                        :aria-describedby="$v.input.$error || apiError ? inputErrorId : null" />
                                </div>

                                <div class="flex-grow-1 flex-shrink-0 text-center" :class="{'px-0 md:px-5 -isCn': isCn, 'px-5' : !isCn}">
                                    <button
                                        class="a-accountButton -code"
                                        :class="{'-disabled' : disabled, 'mb-5 text-sm':isCn}"
                                        type="button"
                                        :disabled="disabled"
                                        :aria-disabled="disabled"
                                        @click.once="$v.$touch"
                                        @click="submit">

                                        <slot name="button-label">
                                            SUBMIT CODE
                                        </slot>
                                    </button>
                                    <span v-if="isCn" class="text-base font-normal cursor-pointer text-green-100 hidden md:inline-block" :class="{'text-gray':isDisabled}" @click="resend">
                                        <slot name="field-resend">
                                            Resend
                                        </slot>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div v-if="apiLoading" class="m-accessStep__loading">
                            <a-loading-spinner :visible="apiLoading" aria-hidden="true" size="sm" />
                        </div>

                        <div class="m-accessStep__split">
                            <div class="md:flex md:h-full" :class="isCn ? 'md:ml-40 md:items-top' : 'md:items-center'">
                                <div
                                    v-if="$v.input.$error || apiError || isDisabled"
                                    :id="inputErrorId"
                                    class="m-accessStep__error">

                                    <div v-if="isCn ? notShowErrorIcon : true" class="m-accessStep__icon">
                                        <a-icon color="red" size="inherit">
                                            {{ errorIcon }}
                                        </a-icon>
                                    </div>

                                    <div v-if="clickFlag === 0 && !isDisableResend">
                                        <span v-if="apiError">
                                            <slot name="api-error">
                                                The code is not valid, please confirm the code and re-enter
                                            </slot>
                                        </span>

                                        <span v-else>
                                            <slot name="field-error">
                                                This field is required
                                            </slot>
                                        </span>
                                    </div>
                                    <div v-else>
                                        <span v-if="showExceedTips || isDisableResend">
                                            <slot name="field-exceed">
                                                The code is not valid, please confirm the code and re-enter
                                            </slot>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="isCn" class="m-accessStep__split block md:hidden">
                            <p class="text-center text-base font-normal cursor-pointer text-green-100" :class="{'text-gray':isDisabled}" @click="resend">
                                <slot name="field-resend">
                                    Resend
                                </slot>
                            </p>
                        </div>
                    </div>

                </div>
            </form>

            <div v-if="$slots['note']" class="m-accessStep__desc" :class="{'-note':!isCn}">
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

        <div v-show="isCn && showAlertTips" class="m-accessStep__alertTips">
            <p class="m-accessStep__alertContent">
                <slot name="alert-tips" />
            </p>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState, mapMutations } from 'vuex';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import forgotApi from '@api/routes/customeraccount/forgotpassword/verify';
    import createApi from '@api/routes/customeraccount/createaccount/verify';
    import forgotIdentifyApi from '@api/routes/customeraccount/forgotpassword/identify';
    import createIdentifyApi from '@api/routes/customeraccount/createaccount/identify';
    export default {
        name: 'MAccessVerify',
        mixins: [ safeId, validationMixin ],
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
            createAccount: {
                type: Boolean,
                default: false
            },
            fieldName: {
                type: String,
                default: 'IdentificationPin'
            },
            fieldValue: {
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
            isDisableResend: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                apiError: false,
                apiLoading: false,
                input: '',
                inputId: '',
                inputErrorId: '',
                clickTime: 0,
                isDisabled: false,
                showAlertTips: false,
                clickFlag: 0
            };
        },
        computed: {
            ...mapState('access', ['identification', 'melaleucaId']),
            data() {
                let data = {
                    CustomerIdentification: {
                        Identification: this.identification || '',
                        MelaleucaNumber: this.melaleucaId || '',
                        CountryCode: null
                    }
                };
                data[this.fieldName] = this.input;

                return data;
            },
            showExceedTips() {
                return this.isCn && !this.apiError && this.clickTime > 2;
            },
            notShowErrorIcon() {
                return (!this.apiLoading && this.clickFlag === 1 && this.clickTime > 2) || this.clickFlag === 0;
            },
            disabled() {
                return this.loading || this.apiLoading || (this.isCn && this.input === '');
            }
        },
        watch: {
            deep: true,
            isDisableResend() {
                if(this.isDisableResend) {
                    this.disableResend();
                }
            },
            input(newVAl) {
                this.input = newVAl;
            }
        },
        mounted() {
            this.input = this.fieldValue;
            if(this.isDisableResend) {
                this.disableResend();
            }
        },
        methods: {
            ...mapActions('access', ['nextStep']),
            ...mapMutations('access', ['SET_CUSTOMERID', 'SET_PIN']),
            async submit($e) {
                this.clickFlag = 0;
                if(!this.loading && !this.apiLoading) {
                    this.apiError = false;

                    if(!this.$v.$invalid) {
                        this.apiLoading = true;
                        const response = await this.verify();
                        const success = response.success && response.data.Success && response.data.Data?.ValidPin;
                        if(success) {
                            this.SET_CUSTOMERID(response.data.Data.CustomerId);
                            this.SET_PIN(this.input);
                            this.nextStep();
                            this.apiLoading = false;
                            this.gtmTrackAction({id: this.gtmId}, $e);
                            return;
                        }

                        this.apiError = true;
                        this.apiLoading = false;
                        this.$refs['input'].focus();
                    } else {
                        this.$refs['input'].focus();
                    }
                    this.apiLoading = false;
                }
            },
            async verify() {
                if(this.createAccount) {
                    return createApi.post(this.data);
                }
                return forgotApi.post(this.data);
            },
            async getCode() {
                if(this.createAccount) {
                    if(this.isCn) {
                        return createIdentifyApi.post({ IdentificationString: this.identification, MelaleucaId: this.melaleucaId, messageTemplateType: 'OnlinePasswordReset' });
                    }
                    return createIdentifyApi.post({ IdentificationString: this.identification, MelaleucaId: this.melaleucaId });
                }
                if(this.isCn) {
                    return forgotIdentifyApi.post({ IdentificationString: this.identification, MelaleucaId: this.melaleucaId, messageTemplateType: 'OnlinePasswordReset' });
                }
                return forgotIdentifyApi.post({ IdentificationString: this.identification, MelaleucaId: this.melaleucaId });
            },
            async resend() {
                if(this.loading || this.apiLoading) {
                    return;
                }
                if(this.clickTime > 2) {
                    this.disableResend();
                }
                if(this.isDisabled) {
                    return false;
                }
                this.clickFlag = 1;
                this.apiError = false;
                this.apiLoading = true;
                const response = await this.getCode();
                const success = response.success && response.data.Success;
                if(success) {
                    this.apiLoading = false;
                    this.clickTime++;
                    this.showAlertTips = true;
                    setTimeout(() => {
                        this.showAlertTips = false;
                    }, 3000);
                } else {
                    this.apiLoading = false;
                    this.disableResend();
                }
            },
            disableResend() {
                this.isDisabled = true;
                this.clickTime = 3;
                if(!this.isDisableResend) {
                    setTimeout(() => {
                        this.isDisabled = false;
                        this.clickTime = 0;
                    }, 1000 * 60 * 10);
                }
            }
        }
    };
</script>

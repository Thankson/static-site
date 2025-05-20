<template>
    <div class="m-signupConfirm">
        <slot name="title"></slot>
        <div class="p-16 bg-white">
            <div class="m-signupConfirm__desc mb-16">
                <slot name="description"></slot>
            </div>
            <form
                class="m-signupConfirm__form"
                method="pOST"
                @submit.prevent.once="$v.$touch"
                @submit.prevent="submit">
                <input class="hidden" type="submit" />

                <div class="m-signupConfirm__fields mb-32">
                    <div class="m-signupConfirm__field flex">
                        <label :for="smsInputId" class="m-accessStep__label pb-5">
                            <slot name="sms-label"></slot>
                        </label>
                        <input-basic
                            :id="smsInputId"
                            ref="sms"
                            :name="sms"
                            class="a-input -text flex-1 h-40 text-sm"
                            :class="$v.sms.$error || apiError ? '-isInvalid' : ''"
                            type="text"
                            aria-required="true"
                            :aria-invalid="$v.sms.$error || apiError"
                            :aria-describedby="
                                $v.sms.$error || apiError ? errorId : null
                            "
                            :value="sms"
                            @input="setValue('sms', $event)"
                        />
                        <div>
                            <v-button v-if="!ifTimeIn" class="a-button text-sm ml-10 h-40 w-140 flex items-center justify-center bg-sky" type="button" @click="resend">
                                <slot name="resend-btn"> <span>{{ labels.Resend }}</span></slot>
                            </v-button>
                            <v-button
                                v-if="ifTimeIn"
                                class="a-button text-sm disabled ml-10 h-40 w-140 flex items-center justify-center bg-gray-50 "
                                disabled
                                type="button"
                            >
                                <slot><span>{{ labels.Resend }}({{ timeCur }}<span class="text-xxs">s</span>)</span></slot>
                            </v-button>
                        </div>
                    </div>
                </div>
                <div class="m-signupConfirm__submit">
                    <div class="m-signupConfirm__actions">
                        <button
                            class="a-button bg-sky w-full a-button text-sm font-medium py-16 px-40 inline-block -sky"
                            :class="{
                                '-disabled': disabled,
                                'text-sm px-60': isCn,
                            }"
                            type="button"
                            :disabled="disabled"
                            :aria-disabled="loading || apiLoading"
                            @click.once="$v.$touch"
                            @click="
                                [submit(), gtmTrackAction({ id: gtmId }, $event)]
                            "
                        >
                            <slot name="button-label">
                                {{ labels.Submit }}
                            </slot>
                        </button>
                        <div v-if="apiLoading" class="m-signupConfirm__loading">
                            <a-loading-spinner
                                :visible="apiLoading"
                                aria-hidden="true"
                                size="sm"
                            />
                        </div>
                    </div>
                    <div v-if="$v.sms.$error || apiError" class="e-formError">
                        <div class="e-formError__item">
                            {{ labels.ErrorCodeIncorrect || apiError }}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    import { mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    export default {
        name: 'MSignupConfirm',
        mixins: [safeId, validationMixin, localizationMixin],
        safeIds: [
            'smsInputId',
            'errorId'
        ],
        validations: {
            sms: {
                required: value => {
                    const re = /^\d{4}$/;
                    return re.test(String(value));
                }
            }
        },
        props: {
            gtmId: {
                type: Number,
                default: 0
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            loading: {
                type: Boolean,
                default: false
            },
            errorIcon: {
                type: String,
                default: 'error_outline'
            },
            smsValue: {
                type: String,
                default: ''
            },
            isCn: {
                type: Boolean,
                default: false
            },
            dsibo: {
                type: String,
                default: 'IBO'
            }
        },
        data() {
            return {
                apiError: null,
                apiLoading: false,
                sms: null,
                errorId: '',
                smsInputId: '',
                // 倒计时参数
                timeStart: 60, // 倒计时初始值
                timeCur: null, // 当前倒计时显示值
                showTimeCur: null,
                timer: null,
                ifTimeIn: false, // 是否倒计时中
                redirectTimer: null,
                phoneConfirm: false,
                cacheField: 'signup.confirm' // 前缀 prefix 后缀 suffix
            };
        },
        computed: {
            disabled() {
                return this.apiLoading;
            }
        },
        methods: {
            ...mapMutations('signup', ['UPDATE_CACHE']),
            // todo list
            /*
            this.getLsInfo(pageName);
            cacheInit() {
                let cacheResult = this.getLsInfo(this.cacheFullName); // cacheResult = {DS_CONFIRM: true}
            },
            updateCache({dsibo,fieldName}) {
                //todo list
                let cacheName = this.dsibo + '_' + this.cacheField // eg: DS_SIGNUP_CONFIRM
                let cacheName = this.cacheField
                let cache = {[cacheName]: true}
                this.UPDATE_DS_CACHE(cache)

                let cache = {key: confirm, path:'dssignup/confirm', value: true}
                this.UPDATE_CACHE(cache)
            }
            */
            updateCache() {
                // todo list
                let path = this.dsibo + '.' + this.cacheField;
                this.$store.commit('signup/UPDATE_CACHE', {
                    path: path,
                    value: true
                });
            },
            // 倒计时
            setTime() {
                let timeCur = this.timeCur - 1;
                if(timeCur < 0) {
                    clearInterval(this.timer);
                    this.ifTimeIn = false;
                    return false;
                }
                this.timeCur = timeCur;
                // this.showTimeCur = this.dataLabels.CountDown.replace('{0}', timeCur);
            },
            countDown() {
                console.log('倒计时开始');
                /* ----请求后台发送验证码成功---- */
                // 执行倒计时
                this.timeCur = this.timeStart;
                // this.showTimeCur = this.dataLabels.CountDown.replace('{0}', this.timeCur);
                this.timer = setInterval(this.setTime, 1000);
                this.ifTimeIn = true;
                /* ----请求后台发送验证码成功---- */
            },
            sendCode() {
                let params = {
                    CustomerPhoneNumber: this.phone.value
                };
                return new Promise((resolve, reject) => { return params.CustomerPhoneNumber; }); // params
            },
            async resend(text) {
                // todo: rset smsCode status
                /* this.smsCode.status = 'sucess';
                this.smsCode.showError = false;
                this.smsCode.value = '';
                this.sendBtnStatus = false;  */
                this.countDown();
                this.sendCode();
            },
            requestVerifyCode() {},
            setValue: function (data, value) {
                this[data] = value;
            },
            async submit() {
                this.updateCache();
                this.$v.$touch();
                if(!this.$v.$invalid) {
                    this.apiLoading = true;
                    this.submited = true;
                    setTimeout(() => {
                        this.apiLoading = false;
                        this.gotoNextStep();
                    }, 1000);
                    // todo: call api query phone;
                    /*
                    const success = await this.phonesmsapi({
                        payload: {
                            sms: this.sms
                        }
                    });

                    if(success) {
                        // Clear input if the form is submited and API returns success
                        this.sms = null;
                        this.$v.$reset();
                        this.$emit('save', {
                            saved: true
                        });
                    } else {
                        this.apiError = 'apierror';
                    }
                    */
                }
            },
            gotoNextStep() {
                // todolist:  updateCache();
                this.$emit('stepEvent', 2);
            }
        }
    };
</script>

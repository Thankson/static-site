<template>
    <div class="o-r3CampaignClockin">
        <template v-if="!getLocalizationProp('Data.ShowOnDevices.WebDesktop')"></template>
        <div v-else-if="clockinSuccess" v-html="getLocalizationProp('Data.SuccessMessage')"></div>
        <div v-else class="w-full lg:w-1_2 lg:mx-auto relative">
            <div v-if="showSpinner" class="o-r3CampaignClockin__loading">
                <a-loading-spinner :visible="true" aria-hidden="true">
                </a-loading-spinner>
            </div>

            <p class=" flex text-sm leading-tight text-gray my-10">
                <span
                    class="font-material text-xs mr-3 mt-2 leading-base"
                    aria-hidden="true"
                >
                    error_outline
                </span>
                <span
                    role="text"
                    v-html="getLocalizationProp( 'Labels.FormTip' )"
                >
                </span>
            </p>
            <form
                class="o-r3CampaignClockinForm"
                @submit.prevent="clockin"
                @submit.enter.prevent
                @keyup.enter.prevent
                @keydown.enter.prevent
            >
                <div>
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label"
                            :for="name"
                            v-html="
                                getLocalizationProp(
                                    'Labels.Name',
                                    'Name'
                                )
                            "
                        >
                        </label>
                        <input-basic
                            :id="name"
                            ref="nameRef"
                            v-model.trim="$v.form.name.$model"
                            name="name"
                            :tailwind-mods="
                                isFieldError($v.form, 'name') ? '-isInvalid' : null
                            "
                            :placeholder="
                                getLocalizationProp(
                                    'Labels.NamePlaceholder',
                                    'Please fill in your name'
                                )
                            "
                        >
                        </input-basic>
                        <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'name')"></m-r3-error-messages>
                    </div>

                    <!-- phoneNumber -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label"
                            :for="phoneNumber"
                            v-html="
                                getLocalizationProp(
                                    'Labels.PhoneNumber',
                                    'Phone Number'
                                )
                            "
                        >
                        </label>
                        <input-basic
                            :id="phoneNumber"
                            ref="phoneNumberRef"
                            v-model.trim="$v.form.phoneNumber.$model"
                            name="phoneNumber"
                            :tailwind-mods="
                                isFieldError($v.form, 'phoneNumber') ? '-isInvalid' : null
                            "
                            :placeholder="
                                getLocalizationProp(
                                    'Labels.PhoneNumberPlaceholder',
                                    'Please fill in your frequently used phone number'
                                )
                            "
                        >
                        </input-basic>
                        <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'phoneNumber')"></m-r3-error-messages>
                    </div>

                    <!-- weight -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label"
                            :for="weight"
                            v-html="
                                getLocalizationProp(
                                    'Labels.Weight',
                                    'Weight(KG)'
                                )
                            "
                        >
                        </label>
                        <input-basic-number
                            :id="weight"
                            ref="weightRef"
                            v-model.trim="$v.form.weight.$model"
                            name="weight"
                            :tailwind-mods="
                                isFieldError($v.form, 'weight') ? '-isInvalid' : null
                            "
                            :placeholder="
                                getLocalizationProp(
                                    'Labels.WeightPlaceholder',
                                    'Pease keep one decimal place'
                                )
                            "
                            :min="weightMin"
                            :max="weightMax"
                            :precision="weightPrecision"
                        >
                        </input-basic-number>
                        <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'weight')"></m-r3-error-messages>
                    </div>

                    <!-- postPhotoes -->
                    <div v-if="withPhotoes" class="m-formField -text">
                        <label
                            class="m-formField__label"
                            v-html="
                                getLocalizationProp(
                                    'Labels.UploadPhotos',
                                    'Upload Photos'
                                )
                            "
                        >
                        </label>
                        <m-r3-post-photoes
                            ref="postPhotoesRef"
                            v-model="$v.form.postPhotoes.$model"
                            name="postPhotoes"
                            :photo-min="photoMin"
                            :photo-max="photoMax"
                            :payload="{
                                ...form,
                                isPhoneNumberError: $v.form.phoneNumber.$error
                            }"
                        ></m-r3-post-photoes>
                        <p class=" flex text-sm leading-tight text-gray my-10">
                            <span
                                class="font-material text-xs mr-3 mt-2 leading-base"
                                aria-hidden="true"
                            >
                                error_outline
                            </span>
                            <span
                                role="text"
                                v-html="getLocalizationProp( 'Labels.UploadPhotosTip' )"
                            >
                            </span>
                        </p>
                        <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'postPhotoes')"></m-r3-error-messages>
                    </div>

                    <!-- term -->
                    <div class="m-formField -text">
                        <label
                            class="m-formField__label"
                            v-html="
                                getLocalizationProp(
                                    'Labels.PersonalInfo',
                                    'Personal information authorization'
                                )
                            "
                        >
                        </label>
                        <m-r3-term
                            v-model="$v.term.$model"
                            name="term"
                            :checkbox-label="getLocalizationProp('Labels.PersonalInfoDescription')"
                            :field-error="$v.term.$error"
                            :field-error-msg="personalInfoRequired"
                        ></m-r3-term>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="block sm:inline-block">
                    <button
                        class="o-r3CampaignClockinForm__actionButton -save"
                        type="submit"
                    >
                        {{
                            getLocalizationProp(
                                "Labels.Submit",
                                "Submit"
                            )
                        }}
                    </button>
                </div>

                <m-r3-error-messages :err-msgs="getFieldErrorMsgs($v.form, 'rest')"></m-r3-error-messages>
            </form>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import uniqid from 'uniqid';
    import apiClockin from '@api/routes/r3campaigns/clockin';

    function checkFieldNotValid(fieldInfo, field) {
        // eslint-disable-next-line no-prototype-builtins
        return fieldInfo.$dirty && fieldInfo.hasOwnProperty(field) && !fieldInfo[field];
    }

    function allNeedUpload(value) {
        return value.every(item => item.isReady);
    }
    function invalidSize(value) {
        return !(value.some(item => item.invalidSize));
    }
    function uploadError(value) {
        return !(value.some(item => item.uploadError));
    }

    export default {
        name: 'OR3CampaignClockin',
        mixins: [localizationMixin, validationMixin, safeId],
        safeIds: ['name', 'phoneNumber', 'weight'],
        validations() {
            return {
                form: {
                    name: {
                        required,
                        isName: formHelper.isValidCnName

                    },
                    phoneNumber: {
                        required,
                        isPhoneNumber: formHelper.isValidCnPhoneNumber
                    },
                    weight: {},
                    postPhotoes: this.withPhotoes ? {
                        allNeedUpload,
                        invalidSize: invalidSize.bind(this),
                        uploadError
                    } : {}
                },
                term: {
                    required: () => {
                        return this.term;
                    }
                }
            };
        },
        props: {
            weightMin: {
                type: Number,
                default: 0
            },
            weightMax: {
                type: Number,
                default: 999
            },
            // MB
            photoMin: {
                type: Number,
                default: 0.0001
            },
            // MB
            photoMax: {
                type: Number,
                default: 20
            },
            weightPrecision: {
                type: Number,
                default: 1
            },
            postPhotoesCnt: {
                type: Number,
                default: 2
            }
        },
        data() {
            return {
                name: '',
                phoneNumber: '',
                weight: '',
                postPhotoes: '',

                form: {
                    name: '',
                    phoneNumber: '',
                    weight: '',
                    postPhotoes: []
                },
                term: false,

                showSpinner: false,
                apiErrors: {
                    name: [],
                    phoneNumber: [],
                    weight: [],
                    postPhotoes: [],
                    rest: []
                },

                clockinSuccess: false
            };
        },
        computed: {
            errorMap() {
                const {
                    FormatError,
                    NameRequired,
                    PhoneNumberRequired,
                    PhotoCountError,
                    SizeError,
                    UploadError
                } = this.getLocalizationProp('Labels', {});
                return {
                    name: {
                        required: NameRequired,
                        isName: FormatError
                    },
                    phoneNumber: {
                        required: PhoneNumberRequired,
                        isPhoneNumber: FormatError
                    },
                    weight: {
                        isValidWeigth: 'Error.'
                    },
                    postPhotoes: {
                        allNeedUpload: PhotoCountError,
                        invalidSize: SizeError,
                        uploadError: UploadError
                    }
                };
            },
            campaignId() {
                return this.getLocalizationProp('Data.CampaignId');
            },
            phase() {
                return this.getLocalizationProp('Data.Phase');
            },
            personalInfoRequired() {
                return this.getLocalizationProp('Labels.PersonalInfoRequired');
            },
            withPhotoes() {
                return this.postPhotoesCnt > 0;
            }
        },
        created () {
            this.form.postPhotoes = Array(this.postPhotoesCnt).fill(undefined).map((_, index) => ({
                key: uniqid(),
                isReady: false,
                url: '',
                size: null,
                invalidSize: false,
                uploadError: false
            }));
        },
        methods: {
            resetApiError() {
                this.apiErrors = {};
            },
            isFieldError(info, field) {
                const fieldInfo = info[field];
                const apiErrorInfo = this.apiErrors[field];
                return fieldInfo.$error || (apiErrorInfo && apiErrorInfo.length);
            },
            getPlaceholderErrorInfo(param, fieldInfo) {
                let res;
                switch (param) {
                    case 'minLength':
                        res = {
                            '{0}': fieldInfo.$params.minLength.min
                        };
                        break;
                    case 'maxLength':
                        res = {
                            '{0}': fieldInfo.$params.maxLength.max
                        };
                        break;
                    case 'allNeedUpload':
                        res = {
                            '{0}': this.postPhotoesCnt
                        };
                        break;
                    default:
                        break;
                }
                return res;
            },
            getFieldErrorMsgs(info, field) {
                let res = [];
                if(field !== 'rest' && this.$v.$invalid) {
                    const fieldInfo = info[field];
                    for (let p of Object.keys(fieldInfo.$params)) {
                        if(checkFieldNotValid(fieldInfo, p)) {
                            const placeholderInfo = this.getPlaceholderErrorInfo(p, fieldInfo);
                            let errorMsg = this.errorMap[field][p];
                            if(placeholderInfo) {
                                Object.keys(placeholderInfo).forEach((placeholder) => {
                                    errorMsg = errorMsg.replace(placeholder, placeholderInfo[placeholder]);
                                });
                            }
                            res.push(errorMsg);
                        }
                    }
                }
                // show api error
                if(this.apiErrors && this.apiErrors[field]) {
                    res = [].concat(res, this.apiErrors[field]);
                }
                return res;
            },
            async clockin() {
                this.$v.$touch();
                this.resetApiError();
                if(!this.$v.$invalid) {
                    const {
                        name: customerName,
                        phoneNumber,
                        weight,
                        postPhotoes
                    } = this.form;
                    let imageUrls;
                    if(this.withPhotoes) {
                        imageUrls = postPhotoes.map(i => i.url);
                    }
                    this.showSpinner = true;
                    const response = await apiClockin.post(
                        {
                            campaignId: this.campaignId,
                            phase: this.phase,
                            customerName,
                            phoneNumber,
                            weight,
                            imageUrls
                        }
                    );
                    this.showSpinner = false;
                    if(response.success) {
                        if(response.data.Success) {
                            this.clockinSuccess = true;
                        } else {
                            const restErrors = (response.data.ErrorMessages || [])
                                .map(e => e.Translation);
                            this.apiErrors = {
                                name: [],
                                phoneNumber: [],
                                weight: [],
                                postPhotoes: [],
                                rest: restErrors
                            };
                        }
                    }
                }
            }
        }
    };
</script>

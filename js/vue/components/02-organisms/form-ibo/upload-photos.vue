<template>
    <div class="o-uploadPhotos">
        <m-form-title :title="getLocalizationProp('Data.UploadPhotosTitle')"></m-form-title>

        <div class="o-uploadPhotos__fields">
            <m-example-tip
                key="uploadPhotosTip"
                tip-name="uploadPhotosTip"
                :text="getLocalizationProp('Labels.UploadPhotosTip')"
                :cta-text="getLocalizationProp('Labels.Here')"
                :example-rtx="getLocalizationProp('Data.UploadPhotosDemo')"
            ></m-example-tip>

            <div class="o-uploadPhotos__field">
                <label class="m-formItemInput__label" for="frontOfIDCard">{{ getLocalizationProp('Labels.FrontOfIDCard') }}</label>
                <m-media
                    id="frontOfIDCard" v-model="frontOfIDCardMediaInfo" application="IBO" el-name="frontOfIDCard" :component-show="componentShow" mods="-type1" :media-min="mediaMin" :media-max="mediaMax" :ocr="frontOfIDCardMediaInfoOcr"></m-media>
                <m-error-messages v-if="isFieldError('frontOfIDCardMediaInfo')" :errors="getValidationErrors('frontOfIDCardMediaInfo')"></m-error-messages>
            </div>

            <div class="o-uploadPhotos__field">
                <label class="m-formItemInput__label" for="reverseOfIDCard">{{ getLocalizationProp('Labels.ReverseOfIDCard') }}</label>
                <m-media id="reverseOfIDCard" v-model="reverseOfIDCardMediaInfo" application="IBO" el-name="reverseOfIDCard" :component-show="componentShow" mods="-type1" :media-min="mediaMin" :media-max="mediaMax" :ocr="reverseOfIDCardMediaInfoOcr"></m-media>
                <m-error-messages v-if="isFieldError('reverseOfIDCardMediaInfo')" :errors="getValidationErrors('reverseOfIDCardMediaInfo')"></m-error-messages>
            </div>

            <div class="o-uploadPhotos__field">
                <label class="m-formItemInput__label" for="businessLicense">{{ getLocalizationProp('Labels.BusinessLicense') }}</label>
                <div>
                    <v-select
                        class="mb-8"
                        :class="{ '-error': isFieldError('licenseType') }"
                        :initial="licenseType"
                        is-disabled
                        vmodel="licenseType"
                        :options="businessLicenseOptions"
                        :values="businessLicenseValues"
                        @change="handleSelectChange"
                    ></v-select>
                </div>
                <m-media id="businessLicense" v-model="businessLicenseMediaInfo" application="IBO" el-name="businessLicense" :component-show="componentShow" mods="-type1" :media-min="mediaMin" :media-max="mediaMax" :ocr="businessLicenseMediaInfoOcr"></m-media>
                <m-error-messages
                    v-if="isFieldError('businessLicenseMediaInfo') || isFieldError('licenseType')"
                    :errors="[...getValidationErrors('businessLicenseMediaInfo'), ...getValidationErrors('licenseType')]"
                ></m-error-messages>
            </div>

            <div class="o-uploadPhotos__field">
                <label class="m-formItemInput__label" for="bankCard">{{ getLocalizationProp('Labels.BankCard') }}</label>
                <m-media id="bankCard" v-model="bankCardMediaInfo" application="IBO" el-name="bankCard" :component-show="componentShow" mods="-type1" :media-min="mediaMin" :media-max="mediaMax" :ocr="bankCardMediaInfoOcr"></m-media>
                <m-error-messages v-if="isFieldError('bankCardMediaInfo')" :errors="getValidationErrors('bankCardMediaInfo')"></m-error-messages>
            </div>
        </div>

        <m-checkbox
            v-model="uploadPhotosTerm"
            name="uploadPhotosTerm"
            class="mt-16"
            size="sm"
            :label-mods="`${isFieldError('uploadPhotosTerm') ? ' -error' : ''}`"
            :label="getLocalizationProp('Labels.ConfirmAgreement')"
        >
        </m-checkbox>
        <m-error-messages v-if="isFieldError('uploadPhotosTerm')" :errors="getValidationErrors('uploadPhotosTerm')"></m-error-messages>

        <v-button
            key="upload-photo"
            class="o-uploadPhotos__ctaBtn -full mt-30"
            @click="submitUploadPhotosForm">
            {{ getLocalizationProp('Labels.AgreeAndSubmit') }}
        </v-button>
        <m-error-messages v-if="verifyOcrResultApiErrors.length" :errors="verifyOcrResultApiErrors"></m-error-messages>

        <a-loading-spinner
            v-show="submitting"
            :visible="submitting"
            class="o-uploadPhotos__loading"
            aria-hidden="true"
        >
        </a-loading-spinner>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { validationMixin } from 'vuelidate';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import formValidateMixin from '@dsibo/source/js/vue/mixins/form-validate';
    import formDataStorageMixin from '@dsibo/source/js/vue/mixins/form-data-storage';
    import bankCardApi from '@api/routes/dsibo/wechatocr/bankcard';
    import businessLicenseApi from '@api/routes/dsibo/wechatocr/businesslicense';
    import idCardApi from '@api/routes/dsibo/wechatocr/idcard';
    import verifyOcrResultApi from '@api/routes/dsibo/wechatocr/verifyocrresult';
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'OUploadPhotos',
        mixins: [ localizationMixin, validationMixin, formValidateMixin, formDataStorageMixin],
        validations() {
            return {
                uploadPhotosTerm: {
                    uploadPhotosTermValidator: () => {
                        return this.uploadPhotosTerm;
                    }
                },
                licenseType: {
                    licenseTypeValidator: (val) => {
                        return !!val;
                    }
                },
                frontOfIDCardMediaInfo: {
                    frontOfIDCardMediaInfoApiValidator: (value) => {
                        return !value.error?.length;
                    },
                    frontOfIDCardMediaInfoValidator: (value) => {
                        return !!value.ready;
                    }
                },
                reverseOfIDCardMediaInfo: {
                    reverseOfIDCardMediaInfoApiValidator: (value) => {
                        return !value.error?.length;
                    },
                    reverseOfIDCardMediaInfoValidator: (value) => {
                        return !!value.ready;
                    }
                },
                businessLicenseMediaInfo: {
                    businessLicenseMediaInfoApiValidator: (value) => {
                        return !value.error?.length;
                    },
                    businessLicenseMediaInfoValidator: (value) => {
                        return !!value.ready;
                    }
                },
                bankCardMediaInfo: {
                    bankCardMediaInfoApiValidator: (value) => {
                        return !value.error?.length;
                    },
                    bankCardMediaInfoValidator: (value) => {
                        return !!value.ready;
                    }
                }
            };
        },
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                submitting: false,

                frontOfIDCardMediaInfo: {ready: false},
                reverseOfIDCardMediaInfo: {ready: false},
                businessLicenseMediaInfo: {ready: false},
                bankCardMediaInfo: {ready: false},

                licenseType: null,
                uploadPhotosTerm: false,

                mediaMin: 0,
                mediaMax: 5,

                verifyOcrResultApiErrors: [],

                formFields: [
                    'frontOfIDCardMediaInfo', 'reverseOfIDCardMediaInfo', 'businessLicenseMediaInfo', 'bankCardMediaInfo',
                    'licenseType', 'uploadPhotosTerm'
                ]
            };
        },
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            ...mapState('iboApp', ['ocrInfos', 'showUploadPhotosForm']),
            errorMessages() {
                return {
                    uploadPhotosTerm: {
                        uploadPhotosTermValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    licenseType: {
                        licenseTypeValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    frontOfIDCardMediaInfo: {
                        frontOfIDCardMediaInfoApiValidator: this.frontOfIDCardMediaInfo.error,
                        frontOfIDCardMediaInfoValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    reverseOfIDCardMediaInfo: {
                        reverseOfIDCardMediaInfoApiValidator: this.reverseOfIDCardMediaInfo.error,
                        reverseOfIDCardMediaInfoValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    businessLicenseMediaInfo: {
                        businessLicenseMediaInfoApiValidator: this.businessLicenseMediaInfo.error,
                        businessLicenseMediaInfoValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    bankCardMediaInfo: {
                        bankCardMediaInfoApiValidator: this.bankCardMediaInfo.error,
                        bankCardMediaInfoValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    }
                };
            },
            currentProcessId() {
                return this.getLocalizationProp('Data.ProcessID');
            },
            pageInfo() {
                return {
                    activeStepProcessId: this.activeStepProcessId,
                    currentProcessId: this.currentProcessId
                };
            },
            businessLicenseOptions() {
                const res = this.getLocalizationProp('Data.BusinessLicenseOptions', []).map(item => item.TypeName);
                res.unshift(this.getLocalizationProp('Labels.BusinessLicensePlaceHolder'));
                return res;
            },
            businessLicenseValues() {
                const res = this.getLocalizationProp('Data.BusinessLicenseOptions', []).map(item => item.TypeID);
                res.unshift(null);
                return res;
            },
            componentShow() {
                return this.activeStepProcessId === this.getLocalizationProp('Data.ProcessID') && this.showUploadPhotosForm;
            }
        },
        watch: {
            partialForm() {
                this.verifyOcrResultApiErrors = [];
            }
        },
        mounted () {
            eventBus.$on('mediaChanged', this.handleMediaChanged);
        },
        destroyed () {
            eventBus.$off('mediaChanged', this.handleMediaChanged);
        },
        methods: {
            ...mapMutations('iboApp', ['SET_ORC_INFOS']),
            ...mapActions('iboApp', ['showInfoFormOnly']),
            handleMediaChanged(elName, mediaInfo) {
                switch (elName) {
                    case 'frontOfIDCard':
                        if(!this.frontOfIDCardMediaInfo.ready) {
                            this.SET_ORC_INFOS({
                                IDCardNum: '',
                                CustomerName: ''
                            });
                        }
                        this.$v.frontOfIDCardMediaInfo.$touch();
                        break;
                    case 'reverseOfIDCard':
                        if(!this.reverseOfIDCardMediaInfo.ready) {
                            this.SET_ORC_INFOS({
                            });
                        }
                        this.$v.reverseOfIDCardMediaInfo.$touch();
                        break;
                    case 'businessLicense':
                        if(!this.businessLicenseMediaInfo.ready) {
                            this.SET_ORC_INFOS({
                                CorpName: '',
                                CorpIdentNo: '',
                                LegalRepName: ''
                            });
                        }
                        this.$v.businessLicenseMediaInfo.$touch();
                        break;
                    case 'bankCard':
                        if(!this.bankCardMediaInfo.ready) {
                            this.SET_ORC_INFOS({
                                BankName: '',
                                BankCardType: '',
                                BankCardNum: '',
                                ValidDate: ''
                            });
                        }
                        this.$v.bankCardMediaInfo.$touch();
                        break;
                    default:
                        break;
                }
            },
            convertImageToBase64(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);

                    reader.readAsDataURL(file);
                });
            },
            async submitUploadPhotosForm() {
                this.submitting = true;
                this.$v.$touch();
                this.verifyOcrResultApiErrors = [];
                if(!this.$v.$invalid) {
                    const verifyOcrResultResponse = await this.verifyOcrResult({
                        IDCardNum: this.ocrInfos.IDCardNum,
                        CustomerName: this.ocrInfos.CustomerName,
                        BankCardNum: this.ocrInfos.BankCardNum,
                        CorpName: this.ocrInfos.CorpName,
                        CorpIdentNo: this.ocrInfos.CorpIdentNo,
                        LegalRepName: this.ocrInfos.LegalRepName
                    });
                    if(verifyOcrResultResponse.success && verifyOcrResultResponse.data?.Success) {
                        // go to next
                        this.showInfoFormOnly();
                    } else if(verifyOcrResultResponse.success && !verifyOcrResultResponse.data?.Success) {
                        this.verifyOcrResultApiErrors = verifyOcrResultResponse.data?.ErrorMessages.map(i => i.Translation);
                    } else {
                        this.verifyOcrResultApiErrors = [verifyOcrResultResponse.error];
                    }
                }
                this.submitting = false;
            },
            async bankCard(data) {
                const response = await bankCardApi.post(data);
                return response;
            },
            async businessLicense(data) {
                const response = await businessLicenseApi.post(data);
                return response;
            },
            async idCard(data) {
                const response = await idCardApi.post(data);
                return response;
            },
            async verifyOcrResult(data) {
                const response = await verifyOcrResultApi.post(data);
                return response;
            },
            handleSelectChange(e) {
                if(e.value === null) return;
                this[e.model] = e.value || null;
            },
            async frontOfIDCardMediaInfoOcr(file) {
                let result = {
                    ocrSuccess: false,
                    base64Url: '',
                    error: []
                };
                const fileBase64 = await this.convertImageToBase64(file);
                result.base64Url = fileBase64;
                const response = await this.idCard({
                    FaceSide: fileBase64.replace(/^data:image\/.{0,9}?;base64,/, '')
                });

                if(response.success && response.data?.Success) {
                    this.SET_ORC_INFOS({
                        IDCardNum: response.data.Data.IdentNo,
                        CustomerName: response.data.Data.Name
                    });
                    result.ocrSuccess = true;
                } else if(response.success && !response.data?.Success) {
                    result.error = response.data?.ErrorMessages.map(i => i.Translation);
                } else {
                    result.error = response.error;
                }
                return result;
            },
            async reverseOfIDCardMediaInfoOcr(file) {
                let result = {
                    ocrSuccess: false,
                    base64Url: '',
                    error: []
                };
                const fileBase64 = await this.convertImageToBase64(file);
                result.base64Url = fileBase64;
                const response = await this.idCard({
                    NationalEmblemSide: fileBase64.replace(/^data:image\/.{0,9}?;base64,/, '')
                });

                if(response.success && response.data?.Success) {
                    this.SET_ORC_INFOS({
                    });
                    result.ocrSuccess = true;
                } else if(response.success && !response.data?.Success) {
                    result.error = response.data?.ErrorMessages.map(i => i.Translation);
                } else {
                    result.error = response.error;
                }
                return result;
            },
            async businessLicenseMediaInfoOcr(file) {
                let result = {
                    ocrSuccess: false,
                    base64Url: '',
                    error: []
                };
                const fileBase64 = await this.convertImageToBase64(file);
                result.base64Url = fileBase64;
                const response = await this.businessLicense({
                    ImageBase64: fileBase64.replace(/^data:image\/.{0,9}?;base64,/, '')
                });

                if(response.success && response.data?.Success) {
                    this.SET_ORC_INFOS({
                        CorpName: response.data.Data.CompanyName,
                        CorpIdentNo: response.data.Data.CreditNo,
                        LegalRepName: response.data.Data.ArtificialName
                    });
                    result.ocrSuccess = true;
                } else if(response.success && !response.data?.Success) {
                    result.error = response.data?.ErrorMessages.map(i => i.Translation);
                } else {
                    result.error = response.error;
                }
                return result;
            },
            async bankCardMediaInfoOcr(file) {
                let result = {
                    ocrSuccess: false,
                    base64Url: '',
                    error: []
                };
                const fileBase64 = await this.convertImageToBase64(file);
                result.base64Url = fileBase64;
                const response = await this.bankCard({
                    ImageBase64: fileBase64.replace(/^data:image\/.{0,9}?;base64,/, '')
                });

                if(response.success && response.data?.Success) {
                    this.SET_ORC_INFOS({
                        BankName: response.data.Data.BankName,
                        BankCardType: response.data.Data.BankCardType,
                        BankCardNum: response.data.Data.BankCardNo,
                        ValidDate: response.data.Data.ValidDate
                    });
                    result.ocrSuccess = true;
                } else if(response.success && !response.data?.Success) {
                    result.error = response.data?.ErrorMessages.map(i => i.Translation);
                } else {
                    result.error = response.error;
                }
                return result;
            }
        }
    };
</script>

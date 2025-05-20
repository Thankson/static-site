<template>
    <div class="o-materialInfo">
        <m-form-title :title="getLocalizationProp('Data.UploadMaterialsTitle')"></m-form-title>

        <div class="o-materialInfo__fields">
            <m-example-tip
                key="uploadMaterialsTip"
                tip-name="uploadMaterialsTip"
                :text="getLocalizationProp('Labels.UploadMaterialsTip')"
                :cta-text="getLocalizationProp('Labels.Here')"
                :example-rtx="getLocalizationProp('Data.UploadMaterialsDemo')"
            ></m-example-tip>

            <div class="o-materialInfo__field">
                <label class="m-formItemInput__label" for="workCertificate">{{ getLocalizationProp('Labels.WorkCertificate') }}</label>
                <m-medias v-model="workCertificateMediaInfos" :max="workCertificateMediaInfosMaxCnt" application="IBO" el-name="workCertificate" :component-show="componentShow"></m-medias>
                <m-error-messages v-if="isFieldError('workCertificateMediaInfos')" :errors="getValidationErrors('workCertificateMediaInfos')"></m-error-messages>
            </div>

            <div class="o-materialInfo__field">
                <label class="m-formItemInput__label" for="eDRecommendationGuaranteeLetter">{{ getLocalizationProp('Labels.EDRecommendationGuaranteeLetter') }}</label>
                <m-medias v-model="eDRecommendationGuaranteeLetterMediaInfos" :max="eDRecommendationGuaranteeLetterMediaInfosMaxCnt" application="IBO" el-name="eDRecommendationGuaranteeLetter" :component-show="componentShow"></m-medias>
                <m-error-messages v-if="isFieldError('eDRecommendationGuaranteeLetterMediaInfos')" :errors="getValidationErrors('eDRecommendationGuaranteeLetterMediaInfos')"></m-error-messages>
            </div>

            <div class="o-materialInfo__field">
                <label class="m-formItemInput__label" for="handwriteCommitmentLetter">{{ getLocalizationProp('Labels.HandwriteCommitmentLetter') }}</label>
                <m-medias v-model="handwriteCommitmentLetterMediaInfos" :max="handwriteCommitmentLetterMediaInfosMaxCnt" application="IBO" el-name="handwriteCommitmentLetter" :component-show="componentShow"></m-medias>
                <m-error-messages v-if="isFieldError('handwriteCommitmentLetterMediaInfos')" :errors="getValidationErrors('handwriteCommitmentLetterMediaInfos')"></m-error-messages>
            </div>

            <m-tip
                :text="getLocalizationProp('Data.UploadMaterialsNotice')"
            ></m-tip>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';
    import formValidateMixin from '@dsibo/source/js/vue/mixins/form-validate';
    import formDataStorageMixin from '@dsibo/source/js/vue/mixins/form-data-storage';
    export default {
        name: 'OMaterialInfo',
        mixins: [ localizationMixin, validationMixin, formValidateMixin, formDataStorageMixin ],
        validations() {
            return {
                workCertificateMediaInfos: {
                    workCertificateMediaInfosValidator: (val) => {
                        return val.length <= this.workCertificateMediaInfosMaxCnt &&
                            val.some(i => i.ready);
                    }
                },
                eDRecommendationGuaranteeLetterMediaInfos: {
                    eDRecommendationGuaranteeLetterMediaInfosValidator: (val) => {
                        return val.length <= this.eDRecommendationGuaranteeLetterMediaInfosMaxCnt &&
                            val.some(i => i.ready);
                    }
                },
                handwriteCommitmentLetterMediaInfos: {
                    handwriteCommitmentLetterMediaInfosValidator: (val) => {
                        return val.length <= this.handwriteCommitmentLetterMediaInfosMaxCnt &&
                            val.some(i => i.ready);
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
                workCertificateMediaInfos: [],
                eDRecommendationGuaranteeLetterMediaInfos: [],
                handwriteCommitmentLetterMediaInfos: [],

                workCertificateMediaInfosMaxCnt: 2,
                eDRecommendationGuaranteeLetterMediaInfosMaxCnt: 2,
                handwriteCommitmentLetterMediaInfosMaxCnt: 2,

                formFields: [
                    'workCertificateMediaInfos',
                    'eDRecommendationGuaranteeLetterMediaInfos',
                    'handwriteCommitmentLetterMediaInfos'
                ]
            };
        },
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            ...mapState('iboApp', ['showInfoForm']),
            errorMessages() {
                return {
                    workCertificateMediaInfos: {
                        workCertificateMediaInfosValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    eDRecommendationGuaranteeLetterMediaInfos: {
                        eDRecommendationGuaranteeLetterMediaInfosValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    },
                    handwriteCommitmentLetterMediaInfos: {
                        handwriteCommitmentLetterMediaInfosValidator: this.getLocalizationProp('Labels.CommonErrorMessage')
                    }
                };
            },
            componentShow() {
                return this.activeStepProcessId === this.getLocalizationProp('Data.ProcessID') && this.showInfoForm;
            }
        }
    };
</script>

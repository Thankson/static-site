<template>
    <div class="o-dsFaceVerify">
        <!-- face-verify -->
        <o-face-verify script-id="faceVerify" :data="data" :labels="labels" :checkboxes="checkboxes"></o-face-verify>
        <!-- ds-manual-verify -->
        <o-ds-manual-verify v-if="!showMannual" script-id="" :ds-manual-verify-data-label="dsManualVerifyDataLabel" @showMannualRecord="showMannualRecord">
            <template v-slot:ManualVerificationTitle>
                <m-form-title :title="getLocalizationProp('Data.ManualVerification.ManualVerificationTitle')"></m-form-title>
            </template>
            <template v-slot:SubtitleUploadIDCard>
                {{ getLocalizationProp('Labels.ManualVerification.SubtitleUploadIDCard') }}
            </template>
            <template v-slot:Modify>
                {{ getLocalizationProp('Labels.ManualVerification.Modify') }}
            </template>
            <template v-slot:SubtitleRecordVideo>
                {{ getLocalizationProp('Labels.ManualVerification.SubtitleRecordVideo') }}
            </template>
            <template v-slot:LeftVideoFootnote>
                {{ getLocalizationProp('Data.ManualVerification.LeftVideoFootnote') }}
            </template>
            <template v-slot:Submit>
                {{ getLocalizationProp('Labels.ManualVerification.Submit') }}
            </template>
        </o-ds-manual-verify>
        <!-- video recording -->
        <o-video-recording v-if="showMannual" script-id="" :description="getLocalizationProp('Data.ManualVerification.RandomMessageDescription')" @handleMannual="handleMannual">
            <template v-slot:VideoRecordingTitle>
                {{ getLocalizationProp('Labels.ManualVerification.VideoRecordingTitle') }}
            </template>
            <template v-slot:PleaseRead>
                {{ getLocalizationProp('Labels.ManualVerification.PleaseRead') }}
            </template>
            <template v-slot:RandomMessage>
                {{ getLocalizationProp('Data.ManualVerification.RandomMessage') }}
            </template>
            <template v-slot:Record>
                {{ getLocalizationProp('Labels.ManualVerification.Record') }}
            </template>
            <template v-slot:Stop>
                {{ getLocalizationProp('Labels.ManualVerification.Stop') }}
            </template>
            <template v-slot:Submit>
                {{ getLocalizationProp('Labels.ManualVerification.Submit') }}
            </template>
            <template v-slot:RecordAgain>
                {{ getLocalizationProp('Labels.ManualVerification.RecordAgain') }}
            </template>
        </o-video-recording>
        <!-- face verify result -->
        <m-face-verify-result v-show="false" :labels="getLocalizationProp('Labels') || {}" script-id="" :img-src="imgsrc" :result-data="resultRichText"></m-face-verify-result>
        <modal id="modal-contract" width="535px">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.Modal.Title') }}
            </template>

            <template v-slot:body>
                <p>{{ getLocalizationProp('Labels.Modal.Content') }}</p>
            </template>

            <template v-slot:footer>
                <div>
                    <button class="a-button text-base font-medium py-12 px-40 mx-10 ml-0 inline-block -plain" type="button" @click="handleCancel">
                        {{ getLocalizationProp('Labels.Modal.Reject') }}
                    </button>
                    <button class="a-button text-base font-medium py-12 px-40 mx-10 inline-block -sky" type="button" @click="handleConfirm">
                        {{ getLocalizationProp('Labels.Modal.Continue') }}
                    </button>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { validationMixin } from 'vuelidate';

    export default {
        name: 'ODsFaceVerify',
        mixins: [ localizationMixin, validationMixin ],
        data() {
            return {
                checkboxes: [],
                checkboxState: [],
                imgsrc: '',
                resultRichText: '',
                showMannual: false
            };
        },
        computed: {
            checkboxList() {
                return this.checkboxState.map(({ checkboxes }) => checkboxes).flat();
            },
            dsManualVerifyDataLabel() {
                let Data = this.getLocalizationProp('Data');
                let Labels = this.getLocalizationProp('Labels');
                return {
                    LeftImageDescription: Data?.ManualVerification?.LeftImageDescription,
                    LeftImageSample: Data?.ManualVerification?.LeftImageSample,
                    LeftVideoSample: Data?.ManualVerification?.LeftVideoSample,
                    SuccessUploadVideo: Labels?.ManualVerification?.SuccessUploadVideo,
                    SuccessUploadPhoto: Labels?.ManualVerification?.SuccessUploadPhoto
                };
            },
            data() {
                return this.localization?.Data || {};
            },
            labels() {
                return this.localization?.Labels || {};
            }
        },
        mounted() {
            this.checkboxesInit();
        },
        methods: {
            checkboxesInit() {
                let a = this.getLocalizationProp('Labels.TermReadAndAgree');
                this.checkboxes = [{
                    'checked': false,
                    'label': a,
                    'name': 'TermReadAndAgree',
                    'required': true
                }];
            },
            getVerifyResult(result) {
                let resultArray = {'success': 'VerificationSuccessDescription', 'fail': 'VerificationFailDescription', 'dark': 'VerificationDarkDescription'};
                let data = this.getLocalizationProp('Data');
                this.imgsrc = data.ImageSampleFace;
                console.log(resultArray[result]);
                this.resultRichText = data[resultArray[result]];
                console.log(this.resultRichText);
            },
            onCheckboxListChange(payload, catIndex) {
                this.isCommitAllRequiredChecked = payload.isAllRequiredChecked;
                // this.$set(this.isAllRequiredChecked, catIndex, payload.isAllRequiredChecked);
            },
            showMannualRecord(val) {
                console.log(val);
                this.showMannual = val;
            },
            handleMannual(val) {
                // ...
            }
        }
    };
</script>

<template>
    <div v-show="show" class="o-iboFaceVerify">
        <!-- face-verify -->
        <div v-show="!loading">
            <o-face-verify v-show="!showFaceVerifyResult" script-id="faceVerify" :data="data" :labels="labels" :checkboxes="checkboxes" v-on:stepEvent="handleJumpFaceVerify"></o-face-verify>
            <m-face-verify-result v-show="showFaceVerifyResult" :statu="resultStatu" :data="getLocalizationProp('Data') || {}" :labels="getLocalizationProp('Labels') || {}" script-id="" :img-src="imgsrc" :result-data="resultRichText" v-on:stepEvent="handleResult"></m-face-verify-result>
        </div>
        <div :class="loading ? '-isVisible' : ''">
            <a-loading-spinner :visible="loading" />
        </div>
    </div>
</template>

<script>
    import checkfaceverificationApi from '@api/routes/dsibo/checkfaceverification';
    import faceverificationlinkApi from '@api/routes/dsibo/wechatocr/faceverificationlink';
    import faceverificationresultApi from '@api/routes/dsibo/wechatocr/faceverificationresult';
    import { mapState, mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import timerMixin from '@dsibo/source/js/vue/mixins/timerMixin';
    import { ls } from '@common/source/js/utils/local-storage';

    export default {
        name: 'OIboFaceVerify',
        mixins: [ localizationMixin, timerMixin],
        data() {
            return {
                checkboxes: [],
                imgsrc: '',
                resultRichText: '',
                loading: false,
                faceVerifyResult: {},
                showFaceVerifyResult: false,
                urlParams: '',
                faceVerifyLink: null,
                dsibo: 'IBO',
                resultStatu: ''
            };
        },
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            ...mapState('signup', ['IBO']),
            show() {
                return this.activeStepProcessId === this.getLocalizationProp('Data.ProcessID');
            },
            data() {
                return this.localization?.Data || {};
            },
            labels() {
                return this.localization?.Labels || {};
            }
        },
        watch: {
            activeStepProcessId (oldVal, newVal) {
                console.log('faceverify', oldVal, newVal, this.show);
                if(this.show) {
                    this.checkReferrUrl();
                }
            }
        },
        mounted() {
            this.checkboxesInit();
        },
        methods: {
            ...mapMutations('access', ['GOTO_NEXT_STEP_PROCESS_ID']),
            ...mapMutations('signup', ['UPDATE_CACHE']),
            getVerifyResult(result) {
                let resultArray = {'success': 'VerificationSuccessDescription', 'fail': 'VerificationFailDescription', 'dark': 'VerificationDarkDescription'};
                let data = this.getLocalizationProp('Data');
                this.resultStatu = 'result';
                this.imgsrc = data.ImageSampleFace;
                this.resultRichText = data[resultArray[result]];
            },
            checkboxesInit() {
                let a = this.getLocalizationProp('Labels.TermReadAndAgree');
                this.checkboxes = [{
                    'checked': false,
                    'label': a,
                    'name': 'TermReadAndAgree',
                    'required': true
                }];
            },
            async check() {
                try {
                    const params = {'RedirectUrl': 'https://dsibo-cn.melaleuca.com.cn/ibo?processID=1&from=faceverificationlink'};
                    const res = await this.getFaceVerifyLink(params);
                    if(res?.SerialNo && res?.ShortUrl) {
                        this.loading = false;
                    }
                } catch (error) {
                    console.log('GetFaceVerifyLink catch error', error);
                    this.loading = false;
                }
            },
            checkReferrUrl() {
                const referrer = window.document.referrer;
                console.log('document referrer', referrer);
                if(referrer.includes('fadada.com')) {
                    console.log('from fadada');
                    return this.queryFaceverificationresult();
                }
            },
            async handleJumpFaceVerify() {
                try {
                    const params = {'RedirectUrl': 'https://dsibo-cn.melaleuca.com.cn/ibo?processID=1&from=faceverificationlink'};
                    const res = await this.getFaceVerifyLink(params);
                    if(res?.SerialNo && res?.ShortUrl) {
                        this.loading = false;
                        console.log('jump to fadada', this.faceVerifyLink?.ShortUrl);
                        // window.location.href = this.faceVerifyLink?.ShortUrl;
                    }
                } catch (error) {
                    console.log('GetFaceVerifyLink catch error', error);
                    this.loading = false;
                }
            },
            handleFaceVerifySuccess() {
                this.GOTO_NEXT_STEP_PROCESS_ID();
                // todo show next step enter info
            },
            // api
            async checkFaceVerify() {
                const response = await checkfaceverificationApi.get();
                console.log(response);
                if(response.success && response.data.Success) {
                    return response.data.Data;
                }
            },
            async getFaceVerifyLink(params) {
                const response = await faceverificationlinkApi.post(params);
                console.log(response);
                if(response.success && response.data.Success) {
                    this.$store.commit('signup/UPDATE_CACHE', {
                        path: 'FaceVerificationLink',
                        value: response.data.Data
                    });
                    this.faceVerifyLink = response.data.Data;
                    return response.data.Data;
                }
            },
            async queryFaceverificationresult() {
                this.loading = true;
                let SerialNo = ls.getItem('FaceVerificationLink')?.SerialNo;
                if(!SerialNo) {
                    this.loading = false;
                    return;
                }
                console.log(SerialNo);
                const response = await faceverificationresultApi.get(`?SerialNo=${SerialNo}`);
                console.log(response);
                if(response.success && response.data.Success && response.data.Data.ResultStatus === 1) {
                    this.getVerifyResult('success');
                    this.$addTimer(() => {
                        this.handleFaceVerifySuccess();
                    }, 1000, false);
                } else {
                    this.getVerifyResult('fail');
                }
                this.showFaceVerifyResult = true;
                this.loading = false;
            },
            handleResult(type) {
                if(type === 'refresh') {
                    const params3 = {'RedirectUrl': 'https://dsibo-cn.melaleuca.com.cn/ibo?processID=1&from=faceverificationlink'};
                    this.getFaceVerifyLink(params3)
                        .then((res) => {
                            console.log(res);
                            if(res?.SerialNo && res?.ShortUrl) return this.handleJumpFaceVerify(res);
                        });
                    // ..
                }
                if(type === 'jump') {
                    window.location = '/';
                }
                console.log(type);
            }
        }
    };
</script>

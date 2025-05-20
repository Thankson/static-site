<template>
    <div class="o-dsSignUp">
        <!-- confirm -->
        <m-signup-confirm v-if="step==1" script-id="" :labels="getLocalizationProp('Labels') || {}" dsibo="DS" v-on:stepEvent="gotoStep">
            <template v-slot:title>
                <m-form-title :title="getLocalizationProp('Data.SigningConfirmTitle')"></m-form-title>
            </template>
            <template v-slot:description>
                {{ getLocalizationProp('Data.VerifyDescription') }}
            </template>
        </m-signup-confirm>
        <!-- signup -->
        <m-signup-contract v-if="step==2" script-id="" :check-box="checkboxes" dsibo="DS" v-on:stepEvent="goToNextStep">
            <template v-slot:contract-title>
                <m-form-title :title="getLocalizationProp('Data.ContractSignUpTitle')"></m-form-title>
            </template>
            <template v-slot:ContractTerms>
                <div v-html="getLocalizationProp('Data.ContractTerms')"></div>
            </template>
            <template v-slot:checkTermsError>
                <p class="e-formError__item" role="alert" v-html="getLocalizationProp('Labels.ErrorTermUnchecked')"></p>
            </template>
            <template v-slot:btnLabel>
                {{ getLocalizationProp('Labels.SignUp') }}
            </template>
        </m-signup-contract>
        <!-- profile -->
        <div>
            <m-form-title :title="getLocalizationProp('Data.ProfilePhotoTitle')"></m-form-title>
            <div class="bg-white p-16">
                <div class="text-sm text-gray-150 py-16">{{ getLocalizationProp('Data.ProfilePhotoDescription') }}</div>
                <div class="text-center mb-50">
                    <div class="inline-block relative">
                        <img :src="getLocalizationProp('Data.IconEdit')" alt="" class="face_img_lt absoulte">
                        <img :src="getLocalizationProp('Data.ImageSampleFace')" alt="" class="face_img">
                        <img :src="getLocalizationProp('Data.IconEdit')" alt="" class="face_img_rb absoulte">
                    </div>
                </div>
                <m-iconTip script-id="" :text="getLocalizationProp('Data.ManualVerification.RandomMessageDescription')" wrap-class="py-8">
                    <template v-slot:extendText>
                        {{ phototip }}
                    </template>
                </m-iconTip>
                <m-iconTip script-id="" :text="getLocalizationProp('Labels.ErrorPhotoInvalidation')" wrap-class="mb-8" text-class="text-red text-tiny"></m-iconTip>
                <v-button class="a-button bg-sky w-full a-button text-base font-medium py-12 px-40 inline-block -sky" @click="handleStart"> {{ getLocalizationProp('Labels.Submit') }} </v-button>
                <v-button class="a-button bg-sky w-full a-button text-base font-medium py-12 px-40 inline-block -sky" @click="handleStart"> {{ getLocalizationProp('Labels.Submit') }} </v-button>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapState, mapMutations } from 'vuex';

    export default {
        name: 'ODsSignUp',
        mixins: [ localizationMixin],
        data() {
            return {
                step: 1,
                checkboxes: [],
                DsSignUpStorage: {
                    phoneConfirm: false,
                    checkItem01: false,
                    checkItem02: false,
                    ReadAgree: false,
                    isSubmit: false
                },
                phone: '',
                cacheField: 'signup',
                dsibo: 'DS'
            };
        },
        computed: {
            ...mapState('signup', ['DS']),
            phototip() {
                return (this.getLocalizationProp('Labels.ErrorPhotoUploadedTimes') || '').replace('{0}', this.getLocalizationProp('Data.ProfilePhotoUploadedTimes'));
            }
        },
        mounted() {
            // this.getLsInfo(); todolist
            this.checkboxInit(this.DsSignUpStorage.checkItem01, this.DsSignUpStorage.checkItem02);
        },
        methods: {
            ...mapMutations('signup', ['UPDATE_CACHE']),
            checkboxInit(ckItem01Statu, ckItem02Statu) {
                let checkboxItem01 = this.getLocalizationProp('Labels.TermReadAndAccept');
                let checkboxItem02 = this.getLocalizationProp('Labels.TermUnderstand');
                this.checkboxes = [{
                    'checked': ckItem01Statu,
                    'label': checkboxItem01,
                    'name': 'TermReadAndAccept',
                    'required': true
                }, {
                    'checked': ckItem02Statu,
                    'label': checkboxItem02,
                    'name': 'TermUnderstand',
                    'required': true
                }];
                // todolist: go to next step
            },
            handleCheckStatus() {
                alert('checkstatus');
            },
            gotoStep(stepNum) {
                this.step = stepNum;
            },
            goToNextStep() {
                // todo
                this.handleSignup();
            },
            handleSignup() {
                //
                let path = this.dsibo;
                this.$store.commit('signup/UPDATE_CACHE', {
                    path: path,
                    value: null
                });
                this.$store.commit('signup/UPDATE_CACHE', {
                    path: 'DS.isSignupSuccess',
                    value: true
                });
            },
            // 保存stepOne填写信息
            saveLsInfo() {
                // 如果注册成功，再重复保存数据
                if(this.registerSuccess) return false;
                // 信息验证通过
                /*
                let params = {};
                params[this.name.key] = this.name;
                params['recheck'] = this.recheck;
                */
                // ls.setItem('Ds_SIGNUP', this.DssignUpStorage); todolist
            },
            handleStart() {
                // ...
            }
            // async getAreaIdVirAreaName(params) {
            //     const response = await checkfaceverification.query(params);
            //     if(response.success && response.data.Success) {
            //         return response.data.Data;
            //     }
            // }
        }
    };
</script>

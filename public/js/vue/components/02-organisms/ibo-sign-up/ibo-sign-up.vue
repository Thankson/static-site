<template>
    <div v-show="show" class="o-iboSignUp">
        <m-signup-confirm v-if="step==1" script-id="" :labels="getLocalizationProp('Labels') || {}" dsibo="IBO" v-on:stepEvent="gotoStep">
            <template v-slot:title>
                <m-form-title :title="getLocalizationProp('Data.SigningConfirmTitle')"></m-form-title>
            </template>
            <template v-slot:description>
                {{ getLocalizationProp('Data.VerifyDescription') }}
            </template>
        </m-signup-confirm>
        <!-- signup -->
        <m-signup-contract v-if="step==2" script-id="" :check-box="checkboxes" dsibo="IBO" :api-loading="showLoading" v-on:stepEvent="goToNextStep">
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
        <!-- check modal -->
        <modal id="modal-contract" width="535px">
            <div class="m-signup-contract -modal">
                <h2 id="global-modal-heading" class="m-signup__modalTitle"></h2>
                <div class="m-signup__scroll">
                    <!--Custom scrollbar-->
                    <perfect-scrollbar ref="scroll">
                        <div class="m-rte pr-16 mb-44" v-html="getLocalizationProp('Data.ContractDoubleConfirmTerms')"></div>
                    </perfect-scrollbar>
                </div>
                <v-button class="bg-sky a-button text-base font-medium py-12 px-40 inline-block -sky" @click="handleSignup()">{{ getLocalizationProp('Labels.Agree') }}</v-button>
            </div>
        </modal>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OIboSignUp',
        mixins: [ localizationMixin],
        data() {
            return {
                step: 1,
                agreeConfirm: false,
                showLoading: false
            };
        },
        computed: {
            ...mapState('access', ['progressBar', 'activeStepProcessId']),
            ...mapState('iboApp', ['form']),
            currentProcessId() {
                return this.getLocalizationProp('Data.ProcessID');
            },
            show() {
                return this.activeStepProcessId === this.currentProcessId;
            },
            phoneNumber() {
                return this.form.phoneNumber;
            }
        },
        watch: {
            activeStepProcessId(newValue, oldValue) {
                if(newValue === this.currentProcessId) {
                    const currentProcessIdIndex = this.progressBar.findIndex(item => item.ProcessID === newValue);
                    const prevProcessIdIndex = this.progressBar.findIndex(item => item.ProcessID === oldValue);
                    if(currentProcessIdIndex > -1 && prevProcessIdIndex > -1 && (prevProcessIdIndex + 1) === currentProcessIdIndex) {
                        // TODO from prev step, call api
                        console.log('🔥from prev step💥 ');
                    }
                }
            }
        },
        mounted() {
            this.checkboxInit();
        },
        methods: {
            ...mapActions('iboApp', ['submit', 'showSubmitSuccess']),
            checkboxInit() {
                let checkboxItem01 = this.getLocalizationProp('Labels.TermReadAndAgree');
                this.checkboxes = [{
                    'checked': false,
                    'label': checkboxItem01,
                    'name': 'TermReadAndAgree',
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
            goToNextStep(stepNum) {
                this.$modal.show({ id: 'modal-contract' });
            },
            async handleSignup() {
                this.$modal.hide();
                this.showLoading = true;
                try {
                    const submitResponse = await this.submit();
                    console.log('🔥submitResponse💥 ', submitResponse);
                    this.showLoading = false;
                    this.showSubmitSuccess();
                } catch (e) {
                    console.log('IBOsubmit - Exception:');
                    console.log(e);
                    setTimeout(() => {
                        this.showLoading = false;
                        this.showSubmitSuccess();
                    }, 1000);
                }
                /*
                let params = this.dataFormat();
                const response = await ibosubmitApi.post(params);
                console.log(response);
                if(response.success && response.data.Success) {
                    this.$modal.hide();
                    return response.data.Data;
                }
                */
                //
            },
            dataFormat() {
                // 定义映射规则（旧属性名 → 新属性名）
                const mappingRules = {
                    newName1: 'oldName1', // 将 obj1.oldName1 赋值给 newObj.newName1
                    newName2: 'oldName2', // 以此类推
                    newName3: 'oldName3'
                };

                // 合并函数
                function mergeObjects(sources, rules) {
                    const result = {};
                    Object.entries(rules).forEach(([newKey, oldKey]) => {
                        // 遍历所有源对象，找到第一个存在的属性值
                        const value = sources.find(source => source[oldKey] !== undefined)?.[oldKey];
                        result[newKey] = value;
                    });
                    return result;
                }

                // 使用示例：合并 obj1、obj2、obj3
                mergeObjects([], mappingRules);
                // const newObj = mergeObjects([obj1, obj2, obj3], mappingRules);
            }
        }
    };
</script>

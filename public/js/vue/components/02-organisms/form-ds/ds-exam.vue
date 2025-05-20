<template>
    <div v-show="show" class="o-dsExam">
        <form v-show="showExamTerm">
            <o-ds-exam-term ref="dsExamTermRef" :script-id="scriptId"></o-ds-exam-term>
        </form>

        <form v-show="showExamQuestion">
            <template v-if="examResult.notFinishCnt > 0">
                <o-ds-exam-question
                    v-if="questions.length"
                    ref="examQuestionRef"
                    class="mt-16"
                    :questions="questions"
                    :script-id="scriptId"
                    @updateExamResult="updateExamResult"
                ></o-ds-exam-question>
            </template>
            <template v-else>
                <o-ds-exam-result ref="examResultRef" class="mt-16" :exam-result="examResult" :script-id="scriptId"></o-ds-exam-result>
                <v-button
                    v-if="examResult.isPass"
                    class="-full mt-30"
                    @click="next">
                    {{ getLocalizationProp('Labels.Next') }}
                </v-button>
                <v-button
                    v-else
                    class="-full mt-30"
                    @click="tryAgain">
                    {{ getLocalizationProp('Labels.TryAgain') }}
                </v-button>
            </template>
        </form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsExam',
        mixins: [ localizationMixin],
        data() {
            return {
                examResult: {}
            };
        },
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            ...mapState('dsApp', ['showExamTerm', 'showExamQuestion']),
            questions() {
                return this.getLocalizationProp('Data.Questions', []);
            },
            show() {
                return this.activeStepProcessId === this.getLocalizationProp('Data.ProcessID');
            }
        },
        mounted () {
            this.initExamResult();
        },
        methods: {
            initExamResult() {
                this.examResult = {
                    correctCnt: 0,
                    wrongCnt: 0,
                    notFinishCnt: this.questions.length,
                    totalScore: 0,
                    isPass: false
                };
            },
            updateExamResult(examResult) {
                this.examResult = examResult;
            },
            next() {},
            tryAgain() {
                this.initExamResult();
            }
        }

    };
</script>

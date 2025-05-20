<template>
    <div class="o-dsExamQuestion">
        <div class="o-dsExamQuestion__fields -allRadius space-y-40">
            <div v-for="(question, index) in questionsProcessed" :key="question.Name" class="o-dsExamQuestion__questionItem">
                <div class="o-dsExamQuestion__question">
                    {{ question.Title }}
                </div>
                <div class="o-dsExamQuestion__answers space-y-16 mt-16">
                    <div v-for="(answer) in question.AnswerOptions" :key="answer.Name" class="o-dsExamQuestion__answerItem">
                        <input
                            :id="answer.Name"
                            v-model="eachChooseItems[index]"
                            :value="answer.Key"
                            :type="question.IsMultiple ? 'checkbox' : 'radio'"
                            :name="question.Name"
                            class="hidden"
                            @change="handleAnswerChange"
                        />
                        <label
                            :for="answer.Name"
                            class="o-dsExamQuestion__answer"
                            :class="{'-active': question.IsMultiple ? eachChooseItems[index]?.includes(answer.Key) : eachChooseItems[index] === answer.Key}"
                        >
                            {{ answer.Key }} {{ answer.Title }}
                        </label>
                    </div>
                </div>
                <div class="o-dsExamQuestion__knowledgePoints mt-24" v-html="question.KnowledgePoints"></div>
            </div>
        </div>

        <v-button
            class="-full mt-30"
            @click="submitPartialForm">
            {{ getLocalizationProp('Labels.Submit') }}
        </v-button>
    </div>
</template>

<script>
    import uniqid from 'uniqid';
    import { isEmpty, isEqual } from 'lodash';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsExamQuestion',
        mixins: [ localizationMixin],
        props: {
            questions: {
                type: Array,
                default: () => ([])
            }
        },
        data() {
            return {
                eachCorrectItems: [],
                eachChooseItems: []
            };
        },
        computed: {
            questionsProcessed() {
                return this.questions.map(question => {
                    question.AnswerOptions = question.AnswerOptions.map(answer => ({...answer, Name: uniqid()}));
                    return {
                        ...question, Name: uniqid()
                    };
                });
            },
            scoreLine() {
                return +this.getLocalizationProp('Data.ScoreLine');
            }
        },
        mounted () {
            this.questions.forEach((question) => {
                if(question.IsMultiple) {
                    this.eachChooseItems.push([]);
                } else {
                    this.eachChooseItems.push('');
                }

                this.eachCorrectItems.push(question.CorrectItems.map(correctItem => correctItem.Key));
            });
        },
        methods: {
            handleAnswerChange() {
            },
            submitPartialForm() {
                const examResult = {
                    correctCnt: 0,
                    wrongCnt: 0,
                    notFinishCnt: 0,
                    totalScore: 0,
                    isPass: false
                };
                this.questions.forEach((item, index) => {
                    if(isEmpty(this.eachChooseItems[index])) {
                        examResult.notFinishCnt += 1;
                        return;
                    }
                    const choose = typeof this.eachChooseItems[index] === 'string' ? [this.eachChooseItems[index]] : this.eachChooseItems[index];
                    const correct = item.CorrectItems.map(i => i.Key);
                    if(isEqual(choose, correct)) {
                        examResult.correctCnt += 1;
                        examResult.totalScore += +item.Score;
                    } else {
                        examResult.wrongCnt += 1;
                    }
                });
                examResult.isPass = examResult.totalScore >= this.scoreLine;
                this.$emit('updateExamResult', examResult);
            }
        }
    };
</script>

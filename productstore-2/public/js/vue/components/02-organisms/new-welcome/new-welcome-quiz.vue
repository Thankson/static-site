
<template>
    <div class="o-newWelcomeQuiz">
        <NewWelcomeTracker
            :current-step="step"
            :number-of-steps="questionsListLength + 1"
        />
        <h1
            class="o-newWelcomeQuiz__heading"
        >
            {{ getLocalizationProp('Labels.Heading') }}
        </h1>
        <NewWelcomeQuestion
            :component-data="questionLocalizationData"
            :radio-value="radioValue"
            :user-answers-object="userAnswersObject"
            @checkboxInput="handleCheckboxInput"
            @radioInput="handleRadioInput"
        />
        <p
            v-if="hasError"
            class="o-newWelcomeQuiz__errorMsg"
        >
            {{ errorMsg }}
        </p>
        <div
            class="o-newWelcomeQuiz__controlsContainer"
            :class="[hasError && '-hasError']"
        >
            <button
                v-if="step > 0"
                class="a-button -white o-newWelcomeQuiz__controlButton"
                @click="handleBackClick()"
            >
                {{ getLocalizationProp('Labels.BackButton') }}
            </button>
            <button
                class="a-button -green o-newWelcomeQuiz__controlButton"
                @click="handleNextClick()"
            >
                {{ getLocalizationProp('Labels.NextButton') }}
            </button>
        </div>
        <div :class="[isLoading && 'o-newWelcomeQuiz__loadingBackground']">
            <div class="o-newWelcomeQuiz__spinnerContainer">
                <a-loading-spinner :visible="isLoading" />
            </div>
        </div>
    </div>
</template>

<script>
    import api from '@api/routes/welcome/survey';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import NewWelcomeQuestion from '@productstore/source/js/vue/components/01-molecules/new-welcome/new-welcome-question.vue';
    import NewWelcomeTracker from '@productstore/source/js/vue/components/01-molecules/new-welcome/new-welcome-tracker.vue';

    export default {
        name: 'ONewWelcomeQuiz',
        components: { NewWelcomeQuestion, NewWelcomeTracker },
        mixins: [ localizationMixin ],
        data() {
            return {
                errorMsg: '',
                hasError: false,
                isLoading: false,
                postData: {
                    'SurveyName': '',
                    'SurveyResponses': {}
                },
                questionLocalizationData: {},
                radioValue: '',
                step: 0,
                hasSubmittedName: false,
                userAnswersObject: {}
            };
        },
        computed: {
            currentQuestionId() {
                return this.questionsList[this.step].Id || '';
            },
            currentQuestionType() {
                return this.questionsList[this.step].Type || '';
            },
            makeSelectionErrorMsg() {
                return this.localization?.Labels?.MakeSelectionErrorMessage || '';
            },
            maxSelections() {
                return this.questionsList[this.step].MaxAllowedAnswerOptions || '';
            },
            maxSelectionsExceededErrorMsg() {
                return this.localization?.Labels?.SelectionOptionLimitErrorMsg || '';
            },
            maxSelectionsIntVal() {
                return parseInt(this.questionsList[this.step].MaxAllowedAnswerOptions) || undefined;
            },
            postSurveyRedirectUrl() {
                return this.localization?.Data?.PostSurveyRedirectUrl || '';
            },
            questionsList() {
                return this.localization?.Data?.Questions || [];
            },
            questionsListLength() {
                return this.questionsList.length || 0;
            },
            surveyName() {
                return this.localization?.Data?.SurveyName;
            }
        },
        mounted() {
            this.questionLocalizationData = this.questionsList[0];
            this.questionsList.forEach(question => {
                this.userAnswersObject[question.Id] = [];
            });
        },
        methods: {
            handleBackAndNextClickDataLayerPush(stepDirection) {
                switch (this.currentQuestionType) {
                    case 'checkbox':
                        window.dataLayer && window.dataLayer.push({
                            event: 'userEvent',
                            eC: 'Free Products Survey',
                            eA: 'CTA',
                            eL: `${stepDirection} -${this.step + 1}`,
                            pP: `Step number - ${this.step + 1}`,
                            pT: `Free Product. Step ${this.step + 1}`
                        });
                        break;
                    case 'radio':
                        window.dataLayer && window.dataLayer.push({
                            event: 'userEvent',
                            eC: 'Free Products Survey',
                            eA: 'Radio Buttons',
                            eL: `${stepDirection} -${this.step + 1}`
                        });
                        break;
                }
            },
            handleBackClick() {
                this.handleBackAndNextClickDataLayerPush(
                    this.getLocalizationProp('Labels.BackButton')
                );
                this.step -= 1;
                this.questionLocalizationData = this.questionsList[this.step];
                this.hasError = false;
            },
            handleCheckboxInput(currentVal, event) {
                const index =
                    this.userAnswersObject[this.currentQuestionId].indexOf(event.target.value);
                if(index > -1) this.userAnswersObject[this.currentQuestionId].splice(index, 1);
                else {
                    this.userAnswersObject[this.currentQuestionId].push(event.target.value);

                    const checkboxText = this.questionsList[this.step]
                        .Answers
                        .find(answer => answer.Id === event.target.value)
                        .Text;

                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'Free Products Survey',
                        eA: 'CTA',
                        eL: checkboxText,
                        pP: `Step number - ${this.step + 1}`,
                        pT: `Free Product. Step ${this.step + 1}`
                    });
                }

                if(this.userAnswersObject[this.currentQuestionId].length === 0) {
                    this.renderError(this.makeSelectionErrorMsg);
                } else if(!this.maxSelections && this.userAnswersObject[this.currentQuestionId].length > 0) {
                    this.hasError = false;
                } else if(this.maxSelections) {
                    if(this.userAnswersObject[this.currentQuestionId].length > this.maxSelectionsIntVal) {
                        this.renderError(replaceToken(this.maxSelectionsExceededErrorMsg, this.maxSelections));
                    } else this.hasError = false;
                }
            },
            async handleNextClick() {
                if(this.hasError) return;
                if(this.userAnswersObject[this.currentQuestionId].length === 0) {
                    this.renderError(this.makeSelectionErrorMsg);
                } else if(this.step < 1 && !this.hasSubmittedName) {
                    this.isLoading = true;
                    // Submit survey name to get survey id from api - first step only
                    // hasSubmittedName is for case when user goes back to first page
                    this.postData.SurveyName = this.surveyName;
                    const response = await api.post(this.postData);
                    if(response?.success && response?.data?.Success) {
                        this.isLoading = false;
                        this.postData.SurveyId = response?.data?.Data?.SurveyId;
                        this.hasSubmittedName = true;
                    } else {
                        // An error for this api call should not stop user from submitting quiz
                        this.isLoading = false;
                        this.errorMsg = response.data.ErrorMessages[0];
                        console.error('Error:', this.errorMsg);
                    }
                    this.incrementStep();
                } else if(!this.hasError && this.step === this.questionsListLength - 1) {
                    this.handleBackAndNextClickDataLayerPush(
                        this.getLocalizationProp('Labels.NextButton')
                    );
                    this.submitAnswers();
                } else {
                    this.incrementStep();
                }
            },
            handleRadioInput(inputVal) {
                this.radioValue = inputVal;
                this.userAnswersObject[this.currentQuestionId] = inputVal;

                const radioText = this.questionsList[this.step]
                    .Answers
                    .find(answer => answer.Id === inputVal)
                    .Text;

                window.dataLayer && window.dataLayer.push({
                    event: 'userEvent',
                    eC: 'Free Products Survey',
                    eA: 'Radio Buttons',
                    eL: radioText
                });

                if(this.hasError && this.userAnswersObject[this.currentQuestionId].length > 0) {
                    this.hasError = false;
                }
            },
            incrementStep() {
                this.handleBackAndNextClickDataLayerPush(
                    this.getLocalizationProp('Labels.NextButton')
                );
                this.step += 1;
                this.questionLocalizationData = this.questionsList[this.step];
            },
            renderError(errorMsg) {
                this.errorMsg = errorMsg;
                this.hasError = true;
            },
            async submitAnswers() {
                this.isLoading = true;
                let stringifiedAnswersObject = {};
                Object.keys(this.userAnswersObject).forEach(key => {
                    stringifiedAnswersObject[key] = this.userAnswersObject[key].toString();
                });
                this.postData.SurveyResponses = stringifiedAnswersObject;

                const response = await api.put(this.postData);

                if(response?.success && response?.data?.Success) {
                    this.isLoading = false;
                    window.location.href = this.postSurveyRedirectUrl;
                } else {
                    this.isLoading = false;
                    this.errorMsg = response.data.ErrorMessages[0];
                    this.hasError = true;
                }
            }
        }
    };
</script>

<template>
    <div v-if="hasQuiz" class="o-lteQuiz" :class="modClass">
        <div class="o-lteQuiz__banner">
            <p class="o-lteQuiz__label">{{ bannerTitle }}</p>
        </div>

        <!-- Counter -->
        <p v-if="qtityQuestions > 1" class="o-lteQuiz__count">
            {{ checkLocalization('Question', 'Quiz') }} {{ questionCount + 1 }} {{ checkLocalization('Of', 'Quiz') }} {{ qtityQuestions }}
        </p>

        <perfect-scrollbar>
            <!-- Questions -->
            <div v-for="(question, i) in quiz.Questions" :key="i" class="o-lteQuiz__loop">
                <div v-if="questionCount === i" class="o-lteQuiz__wrapper">
                    <div class="o-lteQuiz__questions">
                        <p ref="quizTitle" class="o-lteQuiz__question" tabindex="0">{{ question.Question }}</p>
                        <ul class="o-lteQuiz__answers" :class="{'-disabled': disabled}">

                            <!-- Options -->
                            <li
                                v-for="(answer, j) in question.Options" :key="j"
                                class="o-lteQuiz__answer"
                            >
                                <m-radio
                                    :ref="`${name}-${j}`"
                                    v-model="checked.id[j]"
                                    :name="`${name}-${i}`"
                                    :input-value="answer.IsCorrect.toString()"
                                    :label="answer.Title"
                                    label-mods="-lteQuiz"
                                    v-on:input="checkCorrectAnswer"
                                    @click.native="setStyle(answer, question.Options, question)"
                                >
                                </m-radio>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
        </perfect-scrollbar>

        <div class="o-lteQuiz__footer">

            <!-- Correct/Incorrect feedback -->
            <div v-if="showAnswer" class="o-lteQuiz__row">
                <p
                    id="o-lteQuiz__cta" class="o-lteQuiz__cta"
                    :class="[isCorrect ? '-correct' : '-incorrect']"
                >
                    {{ isCorrect ? ctaCorrect : ctaIncorrect }}
                </p>
            </div>

            <!-- CTA Next Question/Show Completion -->
            <div class="o-lteQuiz__row -button">
                <v-button
                    v-if="showAnswer"
                    ref="ctaNextFinish"
                    type="button"
                    :cta="buttonCta"
                    class="ctaNextFinish"
                    :class="buttonClasses"
                    tabindex="0"
                    :aria-label="ctaLabel"
                    @click="lastQuestion ? showCompletion($event) : nextQuestion()"
                />

            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'OLteQuiz',
        props: {
            amountFormatted: {
                type: String,
                default: ''
            },
            buttonClasses: {
                type: String,
                default: '-hemisphere py-15 md:py-10 md:px-18 to-md:block to-md:w-full'
            },
            hasQuiz: {
                type: Boolean,
                default: null
            },
            localization: {
                type: Object,
                default () {
                    return {};
                }
            },
            localizationDefault: {
                type: Object,
                default () {
                    return {
                        'Quiz': {
                            'Title': 'Answer {0} questions, activate {1} Loyalty Shopping Dollars',
                            'Question': 'Question',
                            'Of': 'of',
                            'Correct': 'Correct!',
                            'Incorrect': 'Incorrect',
                            'Finish': 'Finish',
                            'NextQuestion': 'Next Question'
                        }
                    };
                }
            },
            modClass: {
                type: String,
                default: ''
            },
            quiz: {
                type: Object,
                default () {
                    return {};
                }
            },
            name: {
                type: String,
                default: 'lteQquestion'
            }
        },

        data() {
            return {
                answerTemp: null,
                buttonCta: null,
                ctaCorrect: null,
                ctaIncorrect: null,
                choice: null,
                checked: {
                    id: []
                },
                disabled: false,
                isCorrect: null,
                labelMod: null,
                options: [],
                questionCount: 0,
                selected: null,
                showAnswer: false
            };
        },

        computed: {
            bannerTitle() {
                const bannerTitle = this.checkLocalization('Title', 'Quiz');
                return bannerTitle.replace('{0}', this.qtityQuestions).replace('{1}', this.amountFormatted);
            },

            ctaLabel() {
                return (this.isCorrect ? this.ctaCorrect : this.ctaIncorrect) + ` ${this.buttonCta}`;
            },

            lastQuestion() {
                return this.qtityQuestions === (this.questionCount + 1);
            },

            qtityQuestions() {
                return this.quiz.Questions.length;
            }
        },

        mounted() {
            this.$modal.$on.hidden(() => {
                // Reset all
                this.checked = null;
                this.options.map((answer, index) => {
                    let label = (this.$refs[this.name + '-' + index][0])
                        ? this.$refs[this.name + '-' + index][0].$el.querySelector('label')
                        : null;

                    if(label) {
                        label.classList.remove('-lteQuizCorrect', '-lteQuizError');
                    }
                });
                // Reset to initial data flow
                Object.assign(this.$data, this.$options.data.apply(this));
            });
        },

        methods: {
            setStyle(answer, options, question) {
                this.options = options;
                this.choice = answer;
                this.ctaCorrect = question.CorrectAnswerExplanation || this.checkLocalization('Correct', 'Quiz');
                this.ctaIncorrect = question.IncorrectAnswerExplanation || this.checkLocalization('Incorrect', 'Quiz');
            },

            checkCorrectAnswer(event) {
                this.showAnswer = true;

                // Show the proper CTA label
                (this.lastQuestion)
                    ? this.buttonCta = this.checkLocalization('Finish', 'Quiz')
                    : this.buttonCta = this.checkLocalization('NextQuestion', 'Quiz');

                // Options style
                (event === 'true') ? this.isCorrect = true : this.isCorrect = false;

                // Map classes
                this.options.map((answer, index) => {
                    let label = (this.$refs[this.name + '-' + index][0])
                        ? this.$refs[this.name + '-' + index][0].$el.querySelector('label')
                        : null;

                    if(label) {
                        label.classList.remove('-lteQuizCorrect');

                        if(event !== 'true' && this.choice.Title === answer.Title) {
                            label.classList.add('-lteQuizError');
                        } else {
                            label.classList.remove('-lteQuizError');

                            if(answer.IsCorrect) {
                                label.classList.add('-lteQuizCorrect');
                            }
                        }
                    }
                });

                this.$nextTick(() => {
                    this.disabled = true;
                    if(this.$refs.ctaNextFinish) this.$refs.ctaNextFinish.$el.focus();
                });

                const title = this.choice?.Title;
                this.gtmTrackAction({id: 409, text: title}, event);
            },

            checkLocalization(key, parent) {
                return (this.localization && this.localization[parent] && this.localization[parent][key])
                    ? this.localization[parent][key]
                    : this.localizationDefault[parent][key];
            },

            nextQuestion() {
                this.questionCount++;
                this.showAnswer = false;
                this.disabled = false;
                this.checked.id = [];

                this.$nextTick(() => {
                    this.$refs.quizTitle[0].focus();
                });
            },

            showCompletion(event) {
                this.$emit('showModalCompletion');

                // gtm
                const text = event?.target?.innerText;
                this.gtmTrackAction({id: 409, text: text.trim()}, event);
            }
        }
    };
</script>

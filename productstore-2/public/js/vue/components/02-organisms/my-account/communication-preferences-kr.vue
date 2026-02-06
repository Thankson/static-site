<template>
    <div class="o-commPrefs -kr bg-white border border-gray-50 rounded-md flex mb-20 md:mb-30 px-30 py-40">
        <form class="o-commPrefs__form" @submit.prevent>

            <!-- Text messages -  -->
            <div class="o-commPrefs__grid -left">
                <div class="o-commPrefs__row -header">
                    <h2 class="o-commPrefs__header">
                        {{ getLocalizationProp('Labels.Heading') }}
                    </h2>
                </div>
                <p>{{ currentMessage }}</p>

                <!-- Radio Buttons -->
                <div class="o-commPrefs__row">

                    <div class="m-formField -radio o-commPrefs__radio">
                        <input
                            id="optin"
                            v-model="textMessagesOptIn"
                            type="radio"
                            name="textMessagesOptIn"
                            class="a-input -radio"
                            :value="optInValue"
                            @change="[optionsChanged = true]"
                        >
                        <label for="optin" class="m-formField__label -radio o-commPrefs__label">{{ getLocalizationProp('Labels.OptInText') }}</label>
                    </div>
                    <div class="m-formField -radio o-commPrefs__radio">
                        <input
                            id="optout"
                            v-model="textMessagesOptIn"
                            type="radio"
                            name="textMessagesOptIn"
                            class="a-input -radio"
                            :value="optOutValue"
                            @change="[optionsChanged = true]"
                        >
                        <label for="optout" class="m-formField__label -radio o-commPrefs__label">{{ getLocalizationProp('Labels.OptOutText') }}</label>
                    </div>

                </div>

                <!-- Error and Submit -->
                <div class="o-commPrefs__row -submit">
                    <div
                        class="o-commPrefs__submit"
                        @click="
                            interactionDone = true;
                        "
                    >
                        <button ref="submitButton" type="submit" :class="buttonClasses" @click="validateForm">{{ saveChangesButton }}</button>
                    </div>
                    <transition
                        name="o-commPrefs__animation"
                        v-bind="animationClasses"
                        appear
                        :duration="650">

                        <div v-show="shouldDisplayErrorSubmitMessage" class="o-commPrefs__error">
                            <a-icon color="red" size="inherit">{{ errorIcon }}</a-icon>
                            <span class="o-commPrefs__errorMessage" role="alert">
                                {{ errorMessageNoChanges }}
                            </span>
                        </div>
                    </transition>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/customeraccount/subscribedservices';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'CommunicationPreferencesKr',

        mixins: [localizationMixin],

        props: {
            errorIcon: {
                type: String,
                default: 'error_outline'
            }
        },
        data() {
            return {

                // Text Message Section
                optInValue: true,
                optOutValue: false,
                textMessagesOptIn: true,
                consentMessageWithDate: '',
                dissentMessageWithDate: '',
                consentMessageNoDate: '',
                dissentMessageNoDate: '',
                currentMessage: '',

                // Interaction Validation
                interactionDone: false,
                optionsChanged: false,

                // CSS binds
                arrowProps: {
                    direction: '-down',
                    size: '-sm',
                    tailwindColor: 'black',
                    otherMods:
                        '-filled w-0 h-0 absolute right-18 top-4 pointer-events-none'
                },
                buttonClasses:
                    'a-authorBtn text-center bg-green rounded pointer -default px-40 md:px-75 w-full md:w-auto',
                animationClasses: {
                    enterClass: 'o-commPrefs__animation -enter',
                    enterToClass: 'o-commPrefs__animation -enterTo',
                    leaveToClass: 'o-commPrefs__animation -leaveTo'
                }
            };
        },
        computed: {
            shouldDisplayErrorSubmitMessage() {
                return this.interactionDone && !this.optionsChanged;
            },
            optInLabel() {
                return this.getLocalizationProp('Labels.OptInText');
            },
            optOutLabel() {
                return this.getLocalizationProp('Labels.OptOutText');
            },
            saveChangesButton() {
                return this.getLocalizationProp('Labels.SaveChangesText');
            },
            errorMessageNoChanges() {
                return this.getLocalizationProp('Labels.ErrorMessageNoChanges');
            }
        },

        watch: {
            interactionDone () {
                const date = new Date();
                if(this.textMessagesOptIn) {
                    this.currentMessage = replaceToken(this.consentMessageNoDate, this.getFormattedDate(date));
                } else {
                    this.currentMessage = replaceToken(this.dissentMessageNoDate, this.getFormattedDate(date));
                }
            }
        },
        mounted() {
            this.textMessagesOptIn = this.getLocalizationProp('Data.TextOptinInitialValue');
            this.consentMessageNoDate = this.getLocalizationProp('Labels.ConsentMessage', '정보통신망법에 따라 {0} 기준으로 멜라루카 광고성 문자 서비스 수신을 동의하셨습니다. 수신 거부 시 제품 소개, 이벤트, 안내 등 마케팅/홍보 정보 제공이 제한됩니다.');
            this.dissentMessageNoDate = this.getLocalizationProp('Labels.DissentMessage', '정보통신망법에 따라 {0} 기준으로 멜라루카 광고성 문자 서비스 수신을 동의하셨습니다. 수신 거부 시 제품 소개, 이벤트, 안내 등 마케팅/홍보 정보 제공이 제한됩니다.');

            const initialDate = this.textMessagesOptIn ? this.getLocalizationProp('Data.BeginDate') : this.getLocalizationProp('Data.EndDate');
            if(this.textMessagesOptIn) {
                this.currentMessage = replaceToken(this.consentMessageNoDate, this.getFormattedDate(initialDate));
            } else {
                this.currentMessage = replaceToken(this.dissentMessageNoDate, this.getFormattedDate(initialDate));
            }
        },
        methods: {
            getFormattedDate(prevDate) {
                const date = prevDate ? new Date(prevDate) : new Date();
                const formattedDate = date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                return formattedDate;
            },
            async validateForm(event) {
                event.preventDefault();
                if(event.target === this.$refs.submitButton) {
                    if(!this.optionsChanged) {
                        this.optionsChanged = false;
                        return;
                    }
                    const textOptIn = this.textMessagesOptIn;
                    let currentDate = new Date().toISOString();
                    let formData = {
                        ServiceType: 'TextWireService'
                    };
                    let response = null;
                    if(textOptIn) {
                        formData.BeginDate = currentDate;
                        response = await api.post(formData);
                    } else {
                        formData.EndDate = currentDate;
                        response = await api.put(formData);
                    }
                    if(response?.success) {
                        this.interactionDone = false;
                        this.error = '';
                    }
                }
            },
            replaceToken
        }
    };
</script>

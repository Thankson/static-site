<template>
    <a-shelf-toggle
        v-if="!isBetaEnabled"
        ref="shelf-toggle"
        :class="isProductSurvey ? 'a-button -white font-medium mt-15 md:mt-30 px-25 py-10 text-base' : 'a-sharePgBtn'"
        @click="gtmTrackAction({id: 23, text: getLocalizationProp('Labels.CTA')}, $event)">

        <!-- Start: Shelf CTA -->
        {{ getLocalizationProp('Labels.CTA') }}

        <span
            v-if="!isProductSurvey"
            class="material-icons ml-10"
            aria-hidden="true">

            mail_outline
        </span>
        <!-- End: Shelf CTA -->

        <template #heading>
            <div class="text-2xl pt-25 sm:text-2xl-2 sm:pt-20" role="text">
                {{ getLocalizationProp('Labels.Title') }}
            </div>

            <div v-if="getLocalizationProp('Labels.Subtitle')" class="text-gray text-md">
                {{ getLocalizationProp('Labels.Subtitle') }}
            </div>
        </template>

        <template #content>
            <form class="o-sharePgShelf" @submit.prevent>

                <!-- Share Copied Link Form -->
                <div v-if="showCopyForm">
                    <input-basic
                        id="emailLink"
                        ref="emailLink"
                        name="emailLink"
                        :value="currentUrl"
                        :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                        readonly />
                    <button
                        class="a-button text-base py-10 px-70 mt-20"
                        type="button"
                        :aria-label="getButtonAriaLabel"
                        @click="showTempMessage">

                        {{ copyText }}
                    </button>
                    <div v-show="showLinkedMessage" class="text-green text-sm pt-5">{{ linkCopiedText }}</div>
                </div>

                <!-- SMS/Email Form -->
                <div v-else class="o-sharePgShelf__form">

                    <!-- Email/SMS toggle -->
                    <div v-if="isSmsEnabled && !disableEmail" class="o-sharePgShelf__formGroup">
                        <span
                            class="o-sharePgShelf__toggle"
                            @click="toggle = !toggle">

                            <span :class="{toggle: !toggle}">{{ getLocalizationProp('Labels.Email') }}</span>
                            <span :class="{toggle: toggle}">{{ getLocalizationProp('Labels.SMS') }}</span>
                        </span>
                    </div>

                    <!-- Email/SMS Field -->
                    <div
                        v-if="toggle"
                        class="o-sharePgShelf__formGroup o-sharePgShelf__smsSelect flex flex-wrap">

                        <label
                            class="o-sharePgShelf__label w-full"
                            for="sms">

                            {{ phoneInputLabel }}
                        </label>

                        <div
                            v-if="!hideSmsSelect"
                            class="selectCultureCode"
                        >
                            <div
                                class="selectCultureCode__select"
                                :class="isShow ? '-isOpen' :'' ">

                                <div
                                    class="selectCultureCode__field flex"
                                    @click="isShow = !isShow">

                                    <img
                                        v-if="currentCulture.Flag && currentCulture.Flag.Url"
                                        class="m-popUpCulture__img mr-8 -list"
                                        :src="currentCulture.Flag.Url"
                                        alt="flag" />

                                    {{ currentCulture.ShortName }}

                                    <span
                                        aria-hidden="true"
                                        class="a-arrow -sm -filled w-0 h-0 absolute right-10 pointer-events-none -selectCultureCode"
                                        :class="isShow ? '-up' : '-down'">

                                        <span class="a-arrow__icon border-black"></span>
                                    </span>
                                </div>

                                <ul
                                    v-show="isShow"
                                    class="selectCultureCode__option">

                                    <li
                                        v-for="cultureCode in cultureCodes"
                                        :key="cultureCode.LongName"
                                        class="selectCultureCode__item"
                                        :class="cultureCode == currentCultureCodeValue ? '-active' :'' "
                                        @click="setCultureCode(cultureCode);">

                                        <img
                                            v-if="cultureCode.Flag && cultureCode.Flag.Url"
                                            class="m-popUpCulture__img -list"
                                            :src="cultureCode.Flag.Url" alt="flag" />

                                        <span class="m-popUpCulture__text -culture inline">{{ cultureCode.LongName }}</span>
                                    </li>
                                </ul>

                                <input
                                    id="smsCulture"
                                    type="hidden"
                                    :value="currentCulture.Culture" />
                            </div>
                        </div>

                        <input-basic
                            id="sms"
                            ref="SMS"
                            class="grow w-full pl-100"
                            :class="hideSmsSelect && '-hideSmsSelect'"
                            name="sms"
                            :value="sms"
                            :tailwind-mods="`bg-clear ${error.sms ? '-isInvalid': ''}`"
                            @keyup="error.sms = undefined"
                            @input="setValue('sms', $event)" />

                        <em
                            v-if="error.sms"
                            class="o-sharePgShelf__error"
                            role="alert">

                            {{ error.sms }}
                        </em>
                    </div>

                    <div
                        v-else
                        class="o-sharePgShelf__formGroup">

                        <label
                            class="o-sharePgShelf__label"
                            for="email">

                            {{ getLocalizationProp('Labels.Email') }}
                        </label>

                        <input-basic
                            id="email"
                            ref="Email"
                            name="email"
                            :value="email"
                            :tailwind-mods="`bg-clear ${error.email ? '-isInvalid': ''}`"
                            @keyup="error.email = undefined"
                            @input="setValue('email', $event)" />

                        <em
                            v-if="error.email"
                            class="o-sharePgShelf__error"
                            role="alert">

                            {{ error.email }}
                        </em>
                    </div>

                    <!-- Text Area Field -->
                    <div
                        v-if="message !== undefined"
                        class="o-sharePgShelf__formGroup">

                        <label
                            class="o-sharePgShelf__label"
                            for="message">

                            {{ getLocalizationProp('Labels.Message') }}
                        </label>

                        <text-area-basic
                            id="message"
                            ref="message"
                            name="message"
                            rows="10"
                            :disabled="disableMessageTextArea"
                            :value="message"
                            :tailwind-mods="`${disableMessageTextArea ? '' : 'bg-clear'} ${error.message ? '-isInvalid': ''}`"
                            @keyup="setMessage($event)"
                            @textArea="setMessage($event)" />
                        <div v-show="toggle" class="o-sharePgShelf__charLeft">{{ charactersLeftLabel }}</div>

                        <em
                            v-if="error.message"
                            class="o-sharePgShelf__error"
                            role="alert">

                            {{ error.message }}
                        </em>
                    </div>

                    <!-- Recipient Consent Checkbox -->
                    <div class="o-sharePgShelf__formGroup">
                        <m-checkbox
                            ref="consent"
                            v-model="consent"
                            name="consent"
                            :label="getLocalizationProp('Labels.Consent','Consent')"
                            :label-mods="`font-normal leading-tight text-sm md:text-base -m-4 tracking-tight ${error.consent ? '-error':''}`"
                            input-value="consent" />

                        <em
                            v-if="error.consent"
                            class="o-sharePgShelf__error"
                            role="alert">

                            {{ error.consent }}
                        </em>
                    </div>

                    <!-- Action Buttons -->
                    <div class="o-sharePgShelf__actions">
                        <button
                            v-if="!isProductSurvey"
                            class="a-button -outline -full text-base py-10 mr-8"
                            type="button"
                            :aria-label="getLocalizationProp('Labels.CancelAriaLabel')"
                            @click="[ $shelf.hide(), gtmTrackAction({id: 23}, $event) ]">

                            {{ getLocalizationProp('Labels.Cancel') }}
                        </button>

                        <button
                            class="a-button text-base py-10"
                            :class="isProductSurvey ? '-medium' : '-full'"
                            type="button"
                            :aria-label="getButtonAriaLabel"
                            @click="[submit($event), gtmTrackAction({id: 417}, $event)]">

                            {{ getButtonText }}
                        </button>
                    </div>

                    <em
                        v-if="error.limitReached"
                        class="o-sharePgShelf__error"
                        role="alert">

                        {{ error.limitReached }}
                    </em>

                    <div
                        v-if="isProductSurvey"
                        class="text-gray text-sm pt-15">

                        {{ getLocalizationProp('Labels.EmailNotification') }}
                    </div>

                    <div
                        v-if="isProductSurvey && showNotice"
                        class="text-gray text-sm pt-15">

                        {{ getLocalizationProp('Labels.Notice') }}
                    </div>

                    <!-- Loading Spinner -->
                    <a-loading-spinner
                        :visible="loading"
                        size="sm" />
                </div>
            </form>
        </template>

        <!-- Survey Share Page Error Modal -->
        <modal
            v-if="isProductSurvey"
            :id="surveyModalId"
            width="370px">

            <template #content>
                <h2 id="global-modal-heading" class="text-gray text-sm px-30 pb-30 md:p-0">{{ surveyModalTitle }}</h2>
            </template>
        </modal>
    </a-shelf-toggle>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/share-page';
    import apiSurvey from '@api/routes/productsurvey';
    import formHelper from '@common/source/js/vue/utils/form-helper';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import regexParser from 'regex-parser';

    const NA_CULTURES = ['ca', 'mx', 'us'];
    const DIGITS_ONLY_REGEX = '/^[0-9]+$/';

    export default {
        name: 'OSharePageShelfToggle',
        mixins: [ localizationMixin ],
        props: {
            isProductSurvey: {
                type: Boolean,
                default: false
            },
            surveyId: {
                type: [Number, String],
                default: null
            }
        },
        data() {
            return {
                loading: false,
                email: undefined,
                sms: undefined,
                message: undefined,
                isBetaEnabled: false,
                error: {},
                surveyModalId: 'modal-survey-limit-reached',
                surveyModalTitle: null,
                consent: false,
                toggle: false,
                currentCulture: {},
                cultureCodes: undefined,
                currentCultureCodeValue: undefined,
                arrowDirection: '-down',
                isShow: false,
                isSmsEnabled: false,
                smsMessage: '',
                emailMessage: '',
                maxCharacters: 0,
                charactersLeft: 0,
                showLinkedMessage: false
            };
        },
        computed: {
            charactersLeftLabel() {
                return replaceToken(this.localization?.Labels?.CharactersLeft, this.charactersLeft);
            },
            currentUrl() {
                return window.location.origin + window.location.pathname;
            },
            disableMessageTextArea() {
                return this.localization?.Data?.DisableMessageTextArea || false;
            },
            getButtonAriaLabel() {
                return this.toggle ? this.getLocalizationProp('Labels.SendSMSAriaLabel', 'Send SMS') : this.getLocalizationProp('Labels.SendEmailAriaLabel', 'Send Email');
            },
            getButtonText() {
                return this.toggle ? this.getLocalizationProp('Labels.SendSMS', 'Send SMS') : this.getLocalizationProp('Labels.SendEmail', 'Send Email');
            },
            hideSmsSelect() {
                return this.getLocalizationProp('Data.HideSmsSelect', false);
            },
            copyText() {
                return this.getLocalizationProp('Labels.Copy');
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            linkCopiedText() {
                return this.getLocalizationProp('Labels.LinkCopiedText');
            },
            phoneInputLabel() {
                const label = this.getLocalizationProp('Labels.PhoneNumber', null);
                return label || this.getLocalizationProp('Labels.SMS', '');
            },
            showCopyForm() {
                return this.localization?.Data?.ShowCopyForm || false;
            },
            showNotice() {
                return this.localization?.Data?.ShowNotice || false;
            },
            disableEmail() {
                return this.localization?.Data?.DisableEmail || false;
            }
        },
        watch: {
            toggle(newVal) {
                if(newVal) {
                    this.emailMessage = this.message || this.emailMessage;
                    this.setMessage(this.smsMessage);
                } else {
                    this.smsMessage = this.message || this.smsMessage;
                    this.message = this.emailMessage;
                }
            }
        },
        mounted() {
            this.maxCharacters = parseInt(this.getLocalizationProp('Data.MaxMessageLength', 134));
            this.email = '';
            this.emailMessage = this.getLocalizationProp('Data.EmailMessage') || this.getLocalizationProp('Data.Message');
            this.smsMessage = this.getLocalizationProp('Data.SmsMessage');
            this.message = this.emailMessage;
            this.isBetaEnabled = this.getLocalizationProp('Data.IsBetaEnabled');
            this.isSmsEnabled = this.getLocalizationProp('Data.IsSmsEnabled', false);
            this.toggle = this.isSmsEnabled; // if sms is enabled, default to sms tab

            this.setInitialCultureCodes();

            this.$shelf.$on.hidden(() => this.onShelfHidden());
        },
        methods: {
            replaceToken,
            async submit(event) {
                if(this.loading) {
                    return;
                }
                this.error = {};
                this.loading = true;
                if(!this.validateFields()) {
                    this.loading = false;
                    return;
                }

                let data = null;
                let response = null;
                const accessCode = new URLSearchParams(window.location.search).get('accessCode');
                const finalMessage = this.toggle && this.getLocalizationProp('Data.PrefixSMSMessage') ? `${this.getLocalizationProp('Data.PrefixSMSMessage')} ${this.message}` : this.message;

                // Survey Share Page
                if(this.isProductSurvey) {
                    data = {
                        AccessCode: accessCode,
                        SurveyId: this.surveyId,
                        Email: this.toggle === false ? this.email : '',
                        Sms: this.toggle === true ? this.sms : '',
                        Culture: this.currentCulture?.Culture,
                        ShareLimit: this.getLocalizationProp('Data.SharedLimit'),
                        Message: this.replaceNonGsmPunctuation(finalMessage)
                    };

                    apiSurvey.setRoute('/api/productsurvey/share');

                    response = await apiSurvey.post(data);

                // Regular Share Page
                } else {
                    data = {
                        email: this.toggle === false ? this.email : '',
                        sms: this.toggle === true ? this.sms : '',
                        culture: this.currentCulture?.Culture,
                        message: finalMessage
                    };

                    if(this.getLocalizationProp('Data.LimitReachedPl')) {
                        data.limitReached = true;
                    }

                    response = await api.post(data);
                }

                if(response.success) {
                    this.loading = false;

                    if(response.data?.Data?.LimitReached || response.data?.Data?.ReachedLimit) {
                        const shareLimit = this.getLocalizationProp('Data.SharedLimit');
                        this.error.limitReached = this.getLocalizationProp('Labels.ShareLimitReached').replace('{0}', shareLimit);

                        // It's Survey Share Page, then show a modal
                        if(this.isProductSurvey) {
                            // Close shelf
                            this.$shelf.hide();

                            // Open modal
                            this.surveyModalTitle = this.error.limitReached;
                            // GA tag when showing the modal
                            this.gtmTrackAction({id: 418}, event);
                            this.$refs['shelf-toggle'].$modal.show({ id: this.surveyModalId });
                        }

                        return;
                    }

                    // Close shelf
                    this.$shelf.hide();
                }
            },
            async pasteUrlToClipboard() {
                await navigator.clipboard.writeText(this.currentUrl);
                this.$refs['emailLink'].$el.focus();
                this.$refs['emailLink'].$el.select();
                this.$refs['emailLink'].$el.setSelectionRange(0, 99999);
                this.$refs['emailLink'].$el.blur();
            },
            // Show message for 15 seconds
            showTempMessage() {
                this.pasteUrlToClipboard();
                this.showLinkedMessage = true;
                setTimeout(() => {
                    this.showLinkedMessage = false;
                }, 15000);
            },
            replaceNonGsmPunctuation(str) {
                return str.replace(/“|”/g, '"').replace(/‘|’/g, "'");
            },
            validateFields() {
                let valid = true;

                if(!this.message) {
                    this.error.message = this.getLocalizationProp('Labels.Required', 'This field is required.');
                    this.$refs['message'].$el.focus();
                    valid = false;
                }

                // only check this if SMS is toggled
                if(this.toggle) {
                    const gsmCharactersOnly = this.getLocalizationProp('Data.GsmCharactersOnly', true);
                    if(gsmCharactersOnly && !formHelper.isValidSMS(this.message)) {
                        this.error.message = this.getLocalizationProp('Labels.MessageError', 'Only 114 characters and GSM characters allowed');
                        this.$refs['message'].$el.focus();
                        valid = false;
                    }
                }

                // only check this if email is toggled
                if(!this.toggle) {
                    if(!formHelper.isValidEmail(this.email)) {
                        this.error.email = this.getLocalizationProp('Labels.Error');
                        this.$refs['Email'].$el.focus();
                        valid = false;
                    }
                }

                // only check this if SMS is toggled
                if(this.toggle) {
                    if(!this.isValidSMS(this.sms) && this.toggle) {
                        this.error.sms = this.getLocalizationProp('Labels.SMSError');
                        this.$refs['SMS'].$el.focus();
                        valid = false;
                    }
                }

                if(!this.consent) {
                    this.error.consent = this.getLocalizationProp('Labels.ConsentError');
                    this.$refs['consent'].$el.focus();
                    valid = false;
                }

                return valid;
            },
            isValidSMS(sms) {
                if(!sms) return false;
                let countryCode = this.currentCultureCodeValue?.slice(-2).toLowerCase();
                // strictValidateCultures is a copy of NA_CULTURES
                const strictValidateCultures = [...NA_CULTURES];
                if(this.isCn) {
                    countryCode = 'cn';
                    strictValidateCultures.push(countryCode);
                }
                const isStrictValidateCulture = strictValidateCultures.includes(countryCode);
                // If country is in NA, pull regex from form-helper.js - otherwise restrict user input to digits only
                const chosenRegex = isStrictValidateCulture ? formHelper.phoneRegexPatterns[countryCode] : DIGITS_ONLY_REGEX;
                // Strip-out special characters, spaces from user input
                const smsDigitsOnly = sms.replace(/[\s.-.()-]?/g, '').trim();
                const smsDigitsLength = smsDigitsOnly.length;
                // Pull max char limit for all cultures from form-helper.js
                const max = formHelper.phoneCharLimits[countryCode].max;
                // If country is in NA, pull min char limit from form-helper.js - otherwise use hardcoded value of 3
                const min = isStrictValidateCulture ? formHelper.phoneCharLimits[countryCode].min : 3;
                // Evaluate digits only user input based on conditions specified above
                return smsDigitsLength >= min &&
                    smsDigitsLength <= max &&
                    regexParser(chosenRegex).test(smsDigitsOnly);
            },
            onShelfHidden() {
                this.email = '';
                this.sms = '';
                this.smsMessage = this.getLocalizationProp('Data.SmsMessage');
                this.emailMessage = this.getLocalizationProp('Data.EmailMessage') || this.getLocalizationProp('Data.Message');
                this.message = this.toggle ? this.smsMessage : this.emailMessage;
                this.setMessage(this.message);
                this.consent = false;
            },
            setMessage(value) {
                this.error.message = undefined;
                // If it is a SMS message
                if(this.toggle) {
                    const message = value.substring(0, this.maxCharacters);
                    this.message = message;
                    if(this.$refs['message']) this.$refs['message'].input = message;
                    this.charactersLeft = Math.max(0, this.maxCharacters - value.length);
                } else {
                    this.message = value;
                }
            },
            setValue(data, value) {
                this[data] = value;
            },
            setCultureCode(newVal) {
                this.currentCulture = newVal;
                this.currentCultureCodeValue = newVal?.Culture;
                this.$emit('selectedCultureCode', this.currentCultureCodeValue);
                this.isShow = false;
            },
            setInitialCultureCodes() {
                let cultureCodes = this.getLocalizationProp('Data.SMSCountries');
                const currentCountry = this.getLocalizationProp('Data.CurrentCountry') || cultureCodes[0].Country;
                const currentCulture = cultureCodes.find(({ Country }) => Country === currentCountry);
                this.currentCultureCodeValue = currentCulture.Culture;
                this.currentCulture = currentCulture;
                this.cultureCodes = cultureCodes;
            }
        }
    };
</script>

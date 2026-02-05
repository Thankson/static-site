<template>
    <article class="o-personalizedReminder" aria-live="polite">
        <div class="o-personalizedReminder__rte m-rte" v-html="getLocalizationProp('Data.Title', '')">
        </div>
        <template v-if="loaded">
            <form v-show="!reminderSet" class="o-personalizedReminder__form">
                <div class="o-personalizedReminder__container">
                    <!-- Timezone -->
                    <div class="o-personalizedReminder__col -timezone">
                        <div>
                            <label class="o-personalizedReminder__label" for="timezone">
                                {{ getLocalizationProp('Labels.TimeZone', 'Time Zone') }}
                            </label>
                            <div
                                class="a-select -sm -commPref -rounded -padding-xs w-full"
                                :class="{'-error': shouldDisplayErrorTimezoneReminderMessage}">
                                <select
                                    id="timezone"
                                    v-model="timezone"
                                    name="timezone"
                                    class="a-select__field"
                                >
                                    <option v-for="timezoneOption in getLocalizationProp('Labels.DropdownData.TimeZoneData', timezoneDropDownDefault)" :key="timezoneOption.Key" :value="timezoneOption.Value">{{ timezoneOption.Key }}</option>
                                </select>
                                <arrow v-bind="arrowProps"></arrow>
                            </div>
                        </div>

                        <div class="o-personalizedReminder__transition">
                            <transition
                                name="o-personalizedReminder__animation"
                                v-bind="animationClasses"
                                :duration="650"
                            >
                                <div
                                    v-show="shouldDisplayErrorTimezoneReminderMessage"
                                    class="text-red-100 text-sm"
                                    role="alert"
                                >
                                    <a-icon classes="text-red-100" size="inherit">error_outline</a-icon>
                                    <span>
                                        {{ getLocalizationProp('Labels.TimeZoneRequired', 'Please select timezone') }}
                                    </span>
                                </div>
                            </transition>
                        </div>
                    </div>
                    <div class="o-personalizedReminder__time">
                        <!-- AM Reminder -->
                        <div class="o-personalizedReminder__col -amPmReminder">
                            <label class="o-personalizedReminder__label" for="am-reminder">
                                {{ getLocalizationProp('Labels.AmPackReminder', 'AM Pack reminder') }}
                            </label>
                            <div
                                class="a-select -sm -commPref -rounded -padding-xs w-full text-sm"
                                :class="{'-error': shouldDisplayErrorAmPmReminderMessage}"
                            >
                                <select
                                    id="am-reminder"
                                    v-model="amReminder"
                                    name="am-reminder"
                                    class="a-select__field"
                                    @change="optionsChanged = true"
                                >
                                    <option v-for="am in getLocalizationProp('Labels.DropdownData.AMReminderList', amDropDownDefault)" :key="'am-' + am.Value" :value="am.Value">{{ am.Key }}</option>
                                </select>
                                <arrow v-bind="arrowProps"></arrow>
                            </div>
                        </div>

                        <!-- PM Reminder -->
                        <div class="o-personalizedReminder__col -amPmReminder">
                            <label class="o-personalizedReminder__label" for="pm-reminder">
                                {{ getLocalizationProp('Labels.PmPackReminder', 'PM Pack reminder') }}
                            </label>
                            <div
                                class="a-select -sm -commPref -rounded -padding-xs w-full"
                                :class="{'-error': shouldDisplayErrorAmPmReminderMessage}"
                            >
                                <select
                                    id="pm-reminder"
                                    v-model="pmReminder"
                                    name="pm-reminder"
                                    class="a-select__field"
                                    @change="optionsChanged = true"
                                >
                                    <option v-for="pm in getLocalizationProp('Labels.DropdownData.PMReminderList', pmDropDownDefault)" :key="'pm-' + pm.Value" :value="pm.Value">{{ pm.Key }}</option>
                                </select>
                                <arrow v-bind="arrowProps"></arrow>
                            </div>
                        </div>

                        <div class="o-personalizedReminder__transition -amPmReminder">
                            <transition
                                name="o-personalizedReminder__animation"
                                v-bind="animationClasses"
                                :duration="650"
                            >
                                <div
                                    v-show="shouldDisplayErrorAmPmReminderMessage"
                                    class="text-red-100 text-sm"
                                    role="alert"
                                >
                                    <a-icon color="red" size="inherit">error_outline</a-icon>
                                    <span>
                                        {{ getLocalizationProp('Labels.AmPmReminder', 'Please enter an AM or PM notification reminder time') }}
                                    </span>
                                </div>
                            </transition>
                        </div>
                    </div>
                    <div class="o-personalizedReminder__col -phoneNum">
                        <div>
                            <label class="o-personalizedReminder__label" for="phonenumber">{{ getLocalizationProp('Labels.PhoneNumber', 'Phone Number') }}</label>
                            <input id="phonenumber" type="tel" class="a-input -tel w-140 px-12" :class="{'border-1 border-red': shouldDisplayErrorReplacePhoneNumberMessage || shouldDisplayErrorPhoneNumberMessage}" name="phonenumber" :value="phoneNumber" :placeholder="getLocalizationProp('Labels.PhoneNumberPlaceholder', 'Phone Number')" :data-msg-required="getLocalizationProp('Labels.ErrorPhoneNumberMessage', 'Please enter a phone number')" @input="updatePhoneNum">
                        </div>

                        <div class="o-personalizedReminder__transition -phoneNum">
                            <transition
                                name="o-personalizedReminder__animation"
                                v-bind="animationClasses"
                                :duration="650"
                            >
                                <div
                                    v-show="shouldDisplayErrorReplacePhoneNumberMessage || shouldDisplayErrorPhoneNumberMessage"
                                    class="text-red-100 text-sm"
                                    role="alert"
                                >
                                    <a-icon color="red" size="inherit">error_outline</a-icon>
                                    <span v-show="shouldDisplayErrorReplacePhoneNumberMessage && !shouldDisplayErrorPhoneNumberMessage">
                                        {{ getLocalizationProp('Labels.PhoneUserNameMessage', 'Editing your phone number will affect your login credentials.') }}
                                    </span>
                                    <span v-show="shouldDisplayErrorPhoneNumberMessage">
                                        {{ getLocalizationProp('Labels.PhoneNumberRequired', 'Please enter a phone number') }}
                                    </span>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>
                <div class="o-personalizedReminder__disclaimer">
                    <m-checkbox
                        v-model="disclaimer"
                        class="-alignTop"
                        label-mods="font-normal text-xs text-gray-100"
                        name="phoneDisclaimer"
                        :label="getLocalizationProp('Labels.ReminderDisclaimer', '')"
                        :value="disclaimer" />
                    <transition
                        name="o-personalizedReminder__animation"
                        v-bind="animationClasses"
                        appear
                        :duration="650"
                    >
                        <div
                            v-show="shouldDisplayErrorSubmitMessage"
                            class="text-red-100 text-sm"
                            role="alert"
                        >
                            <a-icon color="red" size="inherit">error_outline</a-icon>
                            <span>
                                {{ getLocalizationProp('Labels.ReminderDisclaimerRequired', '') }}
                            </span>
                        </div>
                    </transition>
                </div>

                <div
                    class="o-personalizedReminder__action"
                    @click="submit"
                >
                    <button type="submit" class="o-personalizedReminder__cta -subscribe" style="background-color: #ffffff; border-color: #7D1710">
                        <!-- Initial text color must be set on inner div -->
                        <div style="color: #7D1710">
                            {{ getLocalizationProp('Labels.SubscribeButton', 'Subscribe') }}
                        </div>
                    </button>
                    <a-loading-spinner
                        :visible="loading"
                        :aria-hidden="true">
                    </a-loading-spinner>
                </div>
            </form>
            <div v-show="reminderSet" class="o-personalizedReminder__text -done">
                <p class="md:inline" v-html="getLocalizationProp('Data.ReminderSuccess', '')">
                </p>
                <button class="o-personalizedReminder__cta -undo" @click="resetReminder"> {{ getLocalizationProp('Labels.EditItNow', 'Edit It Now') }}</button>
            </div>
        </template>
    </article>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/communications/personalizedreminders';

    export default {
        name: 'PersonalizedReminder',
        mixins: [ localizationMixin ],
        data() {
            return {
                loaded: false,
                loading: false,
                businessOportunities: '',
                timezone: '',
                amReminder: '',
                pmReminder: '',
                disclaimer: false,
                arrowProps: {
                    direction: '-down',
                    size: '-sm',
                    tailwindColor: 'black',
                    otherMods:
                        '-filled w-0 h-0 absolute right-18 top-4 pointer-events-none'
                },
                animationClasses: {
                    enterClass: 'o-personalizedReminder__animation -enter',
                    enterToClass: 'o-personalizedReminder__animation -enterTo',
                    leaveToClass: 'o-personalizedReminder__animation -leaveTo'
                },
                reminderSet: false,
                shouldDisplayErrorTimezoneReminderMessage: false,
                shouldDisplayErrorAmPmReminderMessage: false,
                shouldDisplayErrorPhoneNumberMessage: false,
                shouldDisplayErrorReplacePhoneNumberMessage: false,
                shouldDisplayErrorSubmitMessage: false,
                timezoneDropDownDefault: [
                    {
                        'Key': 'GMT-5',
                        'Value': 'Central Daylight Time'
                    },
                    {
                        'Key': 'GMT-6',
                        'Value': 'Mountain Daylight Time'
                    },
                    {
                        'Key': 'GMT-7',
                        'Value': 'Mountain Standard Time'
                    },
                    {
                        'Key': 'GMT-7',
                        'Value': 'Pacific Daylight Time'
                    },
                    {
                        'Key': 'GMT-8',
                        'Value': 'Alaska Daylight Time'
                    },
                    {
                        'Key': 'GMT-10',
                        'Value': 'Hawaii-Aleutian Standard Time'
                    }
                ],
                amDropDownDefault: [
                    {
                        'Key': '',
                        'Value': 'No Reminder'
                    },
                    {
                        'Key': '1am',
                        'Value': '1:00 AM'
                    },
                    {
                        'Key': '2am',
                        'Value': '2:00 AM'
                    },
                    {
                        'Key': '3am',
                        'Value': '3:00 AM'
                    },
                    {
                        'Key': '4am',
                        'Value': '4:00 AM'
                    },
                    {
                        'Key': '5am',
                        'Value': '5:00 AM'
                    },
                    {
                        'Key': '6am',
                        'Value': '6:00 AM'
                    }],
                pmDropDownDefault: [
                    {
                        'Key': '',
                        'Value': 'No Reminder'
                    },
                    {
                        'Key': '1pm',
                        'Value': '1:00 PM'
                    },
                    {
                        'Key': '2pm',
                        'Value': '2:00 PM'
                    },
                    {
                        'Key': '3pm',
                        'Value': '3:00 PM'
                    },
                    {
                        'Key': '4pm',
                        'Value': '4:00 PM'
                    },
                    {
                        'Key': '5pm',
                        'Value': '5:00 PM'
                    },
                    {
                        'Key': '6pm',
                        'Value': '6:00 PM'
                    }
                ],
                phoneNumber: '',
                usernamePhone: '', // only updated through API
                submited: false
            };
        },
        mounted() {
            this.usernamePhone = this.getLocalizationProp('Data.IsPhoneUserName', true);
            this.callApi();
        },
        methods: {
            resetReminder() {
                this.reminderSet = false;
                this.$nextTick(() => {
                    document.querySelector('#timezone').focus();
                });
            },
            callApi() {
                api.get().then(result => {
                    if(result.data.Success) {
                        this.loaded = true;
                        this.reminderSet = result.data.Data?.IsSubscribed;
                        this.phoneNumber = result.data.Data?.MobilePhoneNumber;

                        if(result.data.Data?.IsSubscribed) {
                            this.timezone = result.data.Data?.Timezone;
                            this.amReminder = result.data.Data?.AmHour;
                            this.pmReminder = result.data.Data?.PmHour;
                            this.disclaimer = result.data.Data?.IsSubscribed;
                        }

                        // only focus on edit now after form is submitted
                        if(result.data.Data?.IsSubscribed && this.submited) {
                            this.$nextTick(() => {
                                document.querySelector('.o-personalizedReminder__cta.-undo').focus();
                            });
                        }
                    }
                });
            },
            updatePhoneNum(event) {
                this.shouldDisplayErrorReplacePhoneNumberMessage = this.usernamePhone;
                this.phoneNumber = event.target.value;
            },
            submit(event) {
                event.preventDefault();
                if(this.validadeForm()) {
                    console.log('VALID');
                    this.loading = true;
                    api.post({
                        'Timezone': this.timezone,
                        'AMReminder': this.amReminder,
                        'PMReminder': this.pmReminder,
                        'MobilePhoneNumber': this.phoneNumber
                    }).then(result => {
                        if(result.success) {
                            this.callApi();
                        }
                        this.loading = false;
                        this.submited = true;
                    });
                }
            },
            validadeForm() {
                let valid = true;
                let focus = '';

                this.shouldDisplayErrorTimezoneReminderMessage = this.timezone === '';
                this.shouldDisplayErrorAmPmReminderMessage = this.amReminder === '' && this.pmReminder === '';
                this.shouldDisplayErrorSubmitMessage = this.disclaimer === false;
                this.shouldDisplayErrorPhoneNumberMessage = !(new RegExp(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/).test(this.phoneNumber) || new RegExp(/^[0-9]{10}$/).test(this.phoneNumber));

                if(this.shouldDisplayErrorSubmitMessage) {
                    focus = '.o-personalizedReminder__disclaimer .m-formField.-checkbox label';
                    valid = false;
                }
                if(this.shouldDisplayErrorPhoneNumberMessage) {
                    focus = '#phonenumber';
                    valid = false;
                }
                if(this.shouldDisplayErrorAmPmReminderMessage) {
                    focus = '#am-reminder';
                    valid = false;
                }
                if(this.shouldDisplayErrorTimezoneReminderMessage) {
                    focus = '#timezone';
                    valid = false;
                }

                if(!valid) {
                    document.querySelector(focus).focus();
                }

                return valid;
            }
        }
    };
</script>

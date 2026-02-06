<template>
    <div class="m-accountPreferenceSection">
        <h2 :class="['m-accountPreferenceSection__title',{'mb-30' : !description}]" v-html="title" />
        <p class="m-accountPreferenceSection__subtitle">
            {{ description }}
        </p>

        <div class="m-accountPreferenceSection__options">
            <div v-for="option in preferenceOptions" :key="option.Title">
                <div class="m-accountPreferenceSection__option">
                    <a-lock-toggle-button
                        :value="getToggleValue(option)"
                        :input-id="getPreferenceKey(option)"
                        :input-name="getPreferenceKey(option)"
                        :gtm-id="PREFERENCES_GTM_IDS.toggle"
                        :is-locked="option.IsLocked"
                        @changed="handleChange($event.value, option.ChannelType, option.CategoryType, 'toggle')"
                    >
                        <div class="m-accountPreferenceSection__optionLabel">{{ option.Title }}</div>
                        <p v-if="option.SubTitle" class="m-accountPreferenceSection__optionDesc"> {{ option.SubTitle }} </p>
                    </a-lock-toggle-button>

                    <!-- Renders coupon select options -->
                    <div
                        v-if="isOptionCoupon(option)"
                        class="m-accountPreferenceSection__row">

                        <label :for="`selectCouponsDayOfMonth-${option.CategoryType}`" class="m-accountPreferenceSection__label">
                            {{ couponsText }}
                        </label>
                        <v-select
                            :id="`selectCouponsDayOfMonth-${option.CategoryType}`"
                            ref="couponDay"
                            class="m-accountPreferenceSection__dropdown"
                            data-testid="selectCouponsDayOfMonth"
                            :options="couponsDayOfMonthOptions"
                            :override-parent-emit="true"
                            :aria-label="couponsText"
                            select-mod="-padding-md"
                            :label="couponsText"
                            :initial="getSelectInitialValue(userPreferences.dayOfMonthToSend, couponsDayOfMonthOptions)"
                            vmodel="dayOfMonthToSend"
                            @change="handleChange(
                                $event.value,
                                option.ChannelType,
                                option.CategoryType,
                                'couponDay'
                            )"
                        />
                    </div>

                    <div
                        v-if="isOptionPeakPerformance(option)"
                        class="m-accountPreferenceSection__peakPerformance">

                        <div class="m-accountPreferenceSection__row">
                            <label :for="`timezoneSelect-${option.CategoryType}`" class="m-accountPreferenceSection__label mt-0">
                                {{ timeZoneText }}
                            </label>
                            <v-select
                                :id="`timezoneSelect-${option.CategoryType}`"
                                ref="pppTimeZone"
                                class="m-accountPreferenceSection__dropdown -timezone"
                                data-testid="selectTimezonePreference"
                                :options="timeZoneOptions"
                                :override-parent-emit="true"
                                :aria-label="timeZoneText"
                                select-mod="-padding-md"
                                :label="timeZoneText"
                                :initial="getSelectInitialValue(userPreferences.pppNotifications?.timeZone, timeZoneOptions)"
                                vmodel="pppNotifications.timeZone"
                                @change="handleChange(
                                    $event.value,
                                    option.ChannelType,
                                    option.CategoryType,
                                    'pppTimeZone'
                                )"
                            />
                        </div>

                        <div class="m-accountPreferenceSection__selectors">
                            <div class="m-accountPreferenceSection__row">
                                <label :for="`amPackReminderSelect-${option.CategoryType}`" class="m-accountPreferenceSection__label -margin-none -peakPerformance">
                                    {{ amPackReminderText }}
                                </label>
                                <v-select
                                    :id="`amPackReminderSelect-${option.CategoryType}`"
                                    ref="pppReminderAm"
                                    class="m-accountPreferenceSection__dropdown -packReminder"
                                    data-testid="selectAmPackReminder"
                                    :options="amPackReminderOptions"
                                    :override-parent-emit="true"
                                    :aria-label="amPackReminderText"
                                    select-mod="-padding-md"
                                    :label="amPackReminderText"
                                    :initial="getSelectInitialValue(userPreferences.pppNotifications?.amPackReminder, amPackReminderOptions)"
                                    vmodel="pppNotifications.amPackReminder"
                                    @change="handleChange(
                                        $event.value,
                                        option.ChannelType,
                                        option.CategoryType,
                                        'pppReminderAm'
                                    )"
                                />
                            </div>
                            <div class="m-accountPreferenceSection__row ml-0">
                                <label :for="`pmPackReminderSelect-${option.CategoryType}`" class="m-accountPreferenceSection__label -margin-none -peakPerformance">
                                    {{ pmPackReminderText }}
                                </label>
                                <v-select
                                    :id="`pmPackReminderSelect-${option.CategoryType}`"
                                    ref="pppReminderPm"
                                    class="m-accountPreferenceSection__dropdown -packReminder"
                                    data-testid="selectPmPackReminder"
                                    :options="pmPackReminderOptions"
                                    :override-parent-emit="true"
                                    :aria-label="pmPackReminderText"
                                    select-mod="-padding-md"
                                    :label="pmPackReminderText"
                                    :initial="getSelectInitialValue(userPreferences.pppNotifications?.pmPackReminder, pmPackReminderOptions)"
                                    vmodel="pppNotifications.pmPackReminder"
                                    @change="handleChange(
                                        $event.value,
                                        option.ChannelType,
                                        option.CategoryType,
                                        'pppReminderPm'
                                    )"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <p
            v-if="disclaimerText"
            class="m-accountPreferenceSection__disclaimerText"
            v-html="disclaimerText">
        </p>
        <p
            v-if="footerText"
            class="m-accountPreferenceSection__footerText"
            v-html="footerText">
        </p>

        <hr
            :class="`m-accountPreferenceSection__divider ${ !showDivider ? '-hidden' : '' }`" />
    </div>

</template>

<script>
    import isEmpty from 'lodash/isEmpty';
    const PREFERENCES_GTM_IDS = {
        toggle: 23,
        select: 243
    };
    const PREFERENCES_CATEGORIES = {
        COUPON: 'ExclusiveCoupons',
        PEAK_PERFORMANCE: 'PeakPerformancePackReminder'
    };
    export default {
        name: 'MAccountPreferenceSection',
        props: {
            additionalData: {
                type: Object,
                default: () => ({})
            },
            disclaimerText: {
                type: String,
                default: ''
            },
            description: {
                type: String,
                default: ''
            },
            footerText: {
                type: String,
                default: ''
            },
            getPreferenceKey: {
                type: Function,
                default: () => {},
                required: true
            },
            options: {
                type: Array,
                default: () => [{
                    Title: 'Go Digital!',
                    SubTitle: 'Go Digital!',
                    ChannelType: 'digital',
                    CategoryType: 'digital',
                    HideifOptIn: true
                }]
            },
            showDivider: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            userPreferences: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                PREFERENCES_GTM_IDS
            };
        },
        computed: {
            amPackReminderText() {
                return this.peakPerformance?.AMPackReminderText || '';
            },
            amPackReminderOptions() {
                const options = this.peakPerformance?.AMPackReminder || [];
                if(isEmpty(options)) return options;

                return options.map(option => option.Text);
            },
            couponsDayOfMonthOptions() {
                const options = this.additionalData?.Coupons?.DayOfMonth || [];
                return options?.map(option => option.Text);
            },
            couponsText() {
                return this.additionalData?.Coupons?.CouponsText || '';
            },
            errorMsgCoupons() {
                return this.peakPerformance?.ErrorMsgCoupons || '';
            },
            errorMsgTimeZone() {
                return this.peakPerformance?.ErrorMsgTimeZone || '';
            },
            errorMsgAmPm() {
                return this.peakPerformance?.ErrorMsgAMPPM || '';
            },
            peakPerformance() {
                return this.additionalData?.PeakPerformance || {};
            },
            pmPackReminderOptions() {
                const options = this.peakPerformance?.PMPackReminder || [];
                if(isEmpty(options)) return options;

                return options.map(option => option.Text);
            },
            pmPackReminderText() {
                return this.peakPerformance?.PMPackReminderText || '';
            },
            preferenceOptions() {
                if(this.options?.length === 0) return [];

                return this.options.filter((option) => {
                    return !this.isPreferenceHidden(option);
                });
            },
            timeZoneText() {
                return this.peakPerformance?.TimeZoneText || '';
            },
            timeZoneOptions() {
                const options = this.peakPerformance?.TimeZone || [];
                if(isEmpty(options)) return options;

                return options.map(option => option.Text);
            }
        },
        methods: {
            getSelectInitialValue(value, options) {
                if(value) return value;
                return options?.[0];
            },
            getToggleValue(option) {
                // Key example -> Email.digital : true/false
                const key = this.getPreferenceKey(option);
                return this.userPreferences[key] ?? false;
            },
            isOptionCoupon(option) {
                return option?.CategoryType === PREFERENCES_CATEGORIES.COUPON;
            },
            isOptionPeakPerformance(option) {
                return option?.CategoryType === PREFERENCES_CATEGORIES.PEAK_PERFORMANCE;
            },
            isPreferenceHidden(option = {}) {
                const {HideifOptIn} = option;
                const key = this.getPreferenceKey(option);
                return this.userPreferences?.[key] && HideifOptIn;
            },
            handleChange(value, channelType, categoryType, actionType) {
                this.$emit('change', value, channelType, categoryType, actionType);
                const gtmId = PREFERENCES_GTM_IDS.select;
                if(gtmId) {
                    const elementRef = this.$refs?.[actionType]?.[0]?.$refs?.select;
                    elementRef && this.gtmTrackAction({id: gtmId}, {target: elementRef});
                }
            }
        }
    };
</script>

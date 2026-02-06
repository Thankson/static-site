<template>
    <div class="o-communicationPreferencesV2 relative">
        <h2 class="o-communicationPreferencesV2__title">
            {{ title }}
        </h2>
        <p class="o-communicationPreferencesV2__description">
            {{ description }}
        </p>

        <hr class="o-communicationPreferencesV2__divider" />

        <div class="o-communicationPreferencesV2__row">
            <div class="o-communicationPreferencesV2__col -leftSection">
                <div
                    v-for="(subSection, index) in leftSectionSubSections"
                    :key="subSection.Title"
                    class="o-communicationPreferencesV2__section"
                >
                    <m-account-preference-section
                        :additional-data="additionalData"
                        :description="subSection.Description"
                        :disclaimer-text="index === leftSectionSubSections.length -1 ? disclaimerText : ''"
                        :footer-text="subSection.FooterText"
                        :options="subSection.Options"
                        :show-divider="index !== leftSectionSubSections.length -1"
                        :user-preferences="userPreferences"
                        :title="subSection.Title"
                        :get-preference-key="getPreferenceKey"
                        @change="onPreferenceChange"
                    />
                </div>
            </div>

            <div class="o-communicationPreferencesV2__col -rightSection">
                <div v-for="(subSection, index) in rightSectionSubSections" :key="subSection.Title">
                    <m-account-preference-section
                        :additional-data="additionalData"
                        :description="subSection.Description"
                        :disclaimer-text="index === rightSectionSubSections.length -1 ? disclaimerText : ''"
                        :footer-text="subSection.FooterText"
                        :options="subSection.Options"
                        :show-divider="index !== rightSectionSubSections.length -1"
                        :user-preferences="userPreferences"
                        :title="subSection.Title"
                        :get-preference-key="getPreferenceKey"
                        @change="onPreferenceChange"
                    />
                </div>
                <div class="o-communicationPreferencesV2__privacyDisclaimer">
                    <h2 class="o-communicationPreferencesV2__privacyDisclaimerLabel">{{ privacyDisclaimerLabel }}</h2>
                    <p class="o-communicationPreferencesV2__privacyDisclaimerDescription" v-html="privacyDisclaimer"></p>
                </div>
            </div>
        </div>
        <slot name="app-download" />
        <div
            class="o-personalLink__loadingBackground absolute w-full h-full top-0 left-0 z-3"
            :class="[isLoading ? 'block': 'hidden']"
        >
            <div class="flex justify-center items-center h-full">
                <a-loading-spinner :visible="isLoading" />
            </div>
        </div>
        <modal id="unableToSaveModal" width="470px">
            <template v-slot:heading>
                <h2 class="mb-4 text-2xl font-bold">{{ getLocalizationProp('Data.ModalSubmitFailed.Title') }}</h2>
                <p class="mb-30 text-sm leading-tight text-gray-120">
                    {{ getLocalizationProp('Data.ModalSubmitFailed.Text') }}
                </p>
            </template>
            <template v-slot:footer>
                <v-button
                    class="a-button text-base px-24 py-15 leading-base"
                    data-testid="button-communicationPreferencesReloadPage"
                    @click="reloadPage"
                >
                    {{ getLocalizationProp('Data.ModalSubmitFailed.ReloadPage') }}
                </v-button>
            </template>

        </modal>
    </div>
</template>

<script>
    import apiUserPreferences from '@api/routes/communications/preferences';
    import MAccountPreferenceSection from '@productstore/source/js/vue/components/01-molecules/my-account/account-preference-section.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    const PREFERENCE_CATEGORY_TYPES = {
        allInformation: 'AllInformation'
    };

    export default {
        name: 'OCommunicationPreferencesV2',
        components: {
            MAccountPreferenceSection
        },
        mixins: [ localizationMixin ],
        props: {
        },
        data() {
            return {
                isInitialized: false,
                isLoading: false,
                userPreferences: {
                    dayOfMonthToSend: null,
                    pppNotifications: {
                        amPackReminder: null,
                        pmPackReminder: null,
                        timeZone: null
                    }
                }
            };
        },
        computed: {
            additionalData() {
                return this.getLocalizationProp('Data.AdditonalData');
            },
            amPackReminderOptions() {
                return this.peakPerformance?.AMPackReminder || [];
            },
            dayOfMonthOptions() {
                return this.additionalData?.Coupons?.DayOfMonth || [];
            },
            description() {
                return this.getLocalizationProp('Data.Description');
            },
            disclaimerText() {
                return this.getLocalizationProp('Data.DisclaimerText');
            },
            leftSection() {
                return this.getLocalizationProp('Data.Sections.LeftSection', {});
            },
            leftSectionSubSections() {
                return this.leftSection?.SubSections ?? [];
            },
            peakPerformance() {
                return this.additionalData?.PeakPerformance || {};
            },
            pmPackReminderOptions() {
                return this.peakPerformance?.PMPackReminder || [];
            },
            preferencesOptions() {
                const allSubSections = this.leftSection?.SubSections?.concat(this.rightSection?.SubSections);
                const allOptions = allSubSections.flatMap(subSection => subSection.Options);

                return allOptions;
            },
            privacyDisclaimer() {
                return this.getLocalizationProp('Data.PrivacyDisclaimer');
            },
            privacyDisclaimerLabel() {
                return this.getLocalizationProp('Data.PrivacyDisclaimerLabel');
            },
            rightSection() {
                return this.getLocalizationProp('Data.Sections.RightSection', {});
            },
            rightSectionSubSections() {
                return this.rightSection?.SubSections ?? [];
            },
            title() {
                return this.getLocalizationProp('Data.Title');
            },
            timeZoneOptions() {
                return this.peakPerformance?.TimeZone || [];
            }
        },
        async mounted() {
            await this.fetchUserPreferences();
            this.$nextTick(() => {
                this.isInitialized = true;
            });
        },
        methods: {
            buildUserPreferences(data) {
                const userPreferences = {};

                data.forEach(preference => {
                    const {IsOptedIn} = preference;
                    const preferenceKey = this.getPreferenceKey(preference);

                    userPreferences[preferenceKey] = IsOptedIn ?? false;
                });
                return userPreferences;
            },
            disableAllInformation(channelType) {
                const allInfoKey = `${channelType}.AllInformation`;
                const isAllInformationActive = this.userPreferences[allInfoKey];

                if(isAllInformationActive) {
                    this.userPreferences[allInfoKey] = false;
                }
            },
            enableAllPreferences(value, channelType) {
                const allPreferencesList = this.preferencesOptions.filter(
                    option => option.ChannelType === channelType
                );

                allPreferencesList.forEach(async (preference) => {
                    const preferenceKey = this.getPreferenceKey(preference);
                    this.userPreferences[preferenceKey] = value;
                });
            },
            // Fetch user preferences logic here
            async fetchUserPreferences() {
                const response = await apiUserPreferences.get();
                const userPreferencesData = response?.data?.Data || [];

                this.userPreferences = this.buildUserPreferences(userPreferencesData);
                const pppNotificationDetails = this.getPppNotificationDetails(userPreferencesData);
                const pppNotification = pppNotificationDetails?.PppNotification || {};

                this.userPreferences = {
                    ...this.userPreferences,
                    pppNotifications: {
                        amPackReminder: this.getTextFromOptions(this.amPackReminderOptions, pppNotification?.AmPackReminder),
                        pmPackReminder: this.getTextFromOptions(this.pmPackReminderOptions, pppNotification?.PmPackReminder),
                        timeZone: this.getTextFromOptions(this.timeZoneOptions, pppNotification?.TimeZone)
                    },
                    dayOfMonthToSend: this.getTextFromOptions(this.dayOfMonthOptions, pppNotificationDetails?.DayOfMonthToSend)
                };
            },
            getPppNotificationDetails(preferences) {
                return preferences?.find(
                    option => option.CategoryType === 'PeakPerformancePackReminder'
                ) || {};
            },
            getTextFromOptions(options, value) {
                return options?.find(opt => opt.Value === value)?.Text || '';
            },
            getPreferenceKey(option) {
                return `${option.ChannelType}.${option.CategoryType}`;
            },
            async onPreferenceChange(value, channelType, categoryType, actionType) {
                if(!this.isInitialized) return;
                this.isLoading = true;
                let payload = {
                    ChannelType: channelType,
                    CategoryType: categoryType
                };
                if(actionType === 'toggle') payload.SetOptStatusTo = value;
                if(actionType === 'couponDay') {
                    payload.DayOfMonth = this.dayOfMonthOptions.find(obj => obj.Text === value).Value;
                }
                if(actionType === 'pppTimeZone') {
                    payload.TimeZone = this.timeZoneOptions.find(obj => obj.Text === value).Value;
                }
                if(actionType === 'pppReminderAm') {
                    payload.AMReminder = this.amPackReminderOptions.find(obj => obj.Text === value).Value;
                }
                if(actionType === 'pppReminderPm') {
                    payload.PMReminder = this.pmPackReminderOptions.find(obj => obj.Text === value).Value;
                }
                if(categoryType === 'AllInformation') {
                    this.enableAllPreferences(value, channelType);
                }

                if(value === false) {
                    this.disableAllInformation(channelType);
                }

                await this.saveUserPreference(payload);

                // Validate and enable AllInformation if every sub-preference is true
                if(value === true && categoryType !== PREFERENCE_CATEGORY_TYPES.allInformation) {
                    await this.validateAndUpdateAllInformation(channelType);
                }

                this.isLoading = false;
            },
            reloadPage() {
                window.location.reload();
            },
            async saveUserPreference(payload) {
                const response = await apiUserPreferences.put(payload);
                this.updatePreferenceValue(payload.SetOptStatusTo, payload.ChannelType, payload.CategoryType);

                if(!response?.data?.Success) {
                    this.$modal.show({ id: 'unableToSaveModal' });
                }
            },
            updatePreferenceValue(value, channelType, categoryType) {
                const key = this.getPreferenceKey({ChannelType: channelType, CategoryType: categoryType});
                this.userPreferences[key] = value;
            },
            async validateAndUpdateAllInformation(channelType) {
                const channelPreferencesList = this.preferencesOptions.filter(
                    option => option.ChannelType === channelType && option.CategoryType !== PREFERENCE_CATEGORY_TYPES.allInformation
                );

                const areAllPreferencesSelected = channelPreferencesList.every((preference) => {
                    const key = this.getPreferenceKey(preference);
                    return this.userPreferences[key] === true;
                });

                if(areAllPreferencesSelected) {
                    // Updates preference with key email.AllInformation
                    this.userPreferences[`${channelType}.${PREFERENCE_CATEGORY_TYPES.allInformation}`] = true;
                    await this.saveUserPreference({
                        ChannelType: channelType,
                        CategoryType: PREFERENCE_CATEGORY_TYPES.allInformation,
                        SetOptStatusTo: true
                    });
                }
            }
        }
    };
</script>

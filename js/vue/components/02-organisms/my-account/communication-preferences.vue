<template>
    <div class="o-commPrefs">
        <form class="o-commPrefs__form" :action="formActionUrl" method="POST" @submit.prevent>
            <!-- First section Email and Newsletter -  -->
            <div class="o-commPrefs__grid -left">
                <div class="o-commPrefs__row -header">
                    <h3 class="o-commPrefs__title">
                        <slot name="title-email" />
                    </h3>
                    <p class="o-commPrefs__subtitle">
                        <slot name="subtitle-email" />
                    </p>
                </div>

                <!-- All Info - Email -->
                <div class="o-commPrefs__row">
                    <m-input-toggle
                        v-model="allInformations"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="allInformations"
                        input-name="allInformations"
                        @changed="allInformationsToggle">

                        <slot name="label-email-all-info" />
                    </m-input-toggle>
                </div>

                <!-- Product Promotion -->
                <div class="o-commPrefs__row">
                    <m-input-toggle
                        v-model="productPromotion"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="productPromotion"
                        input-name="productPromotion"
                        @changed="inputToggleChanged">

                        <slot name="label-email-product" />
                    </m-input-toggle>
                </div>

                <!-- Marketplace -->
                <div v-if="!hideMarketplaceOptin" class="o-commPrefs__row">
                    <m-input-toggle
                        v-model="marketplacePartner"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="marketplacePartner"
                        input-name="marketplacePartner"
                        @changed="inputToggleChanged">

                        <slot name="label-email-marketplace" />
                    </m-input-toggle>
                </div>

                <!-- Business Building -->
                <div class="o-commPrefs__row">
                    <m-input-toggle
                        v-model="businessTips"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="businessTips"
                        input-name="businessTips"
                        @changed="inputToggleChanged">

                        <slot name="label-email-business-tips" />
                    </m-input-toggle>
                </div>

                <!-- Coupons -->
                <div v-if="enableCouponReminder && isCouponsEmailReminderEnabled" class="o-commPrefs__row -selectDay">
                    <m-input-toggle
                        v-model="coupons"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="coupons"
                        input-name="coupons"
                        @changed="inputToggleChanged">

                        <slot name="label-email-coupons" />
                    </m-input-toggle>

                    <!-- Day of Month -->
                    <div class="o-commPrefs__contain -selectDay">
                        <label for="dayOfMonth" class="o-commPrefs__label">
                            <slot name="label-email-day-of-month" />
                        </label>
                        <div class="o-commPrefs__selectDay">
                            <div class="a-select -sm -commPref -rounded -padding-xs">
                                <select
                                    id="dayOfMonth"
                                    v-model="dayOfMonth"
                                    name="dayOfMonth"
                                    class="a-select__field"
                                    @change="[optionsChanged = true, handleChange($event, gtmIdDayOfMonth)]">

                                    <slot name="options-day-of-month" />
                                </select>
                                <arrow v-bind="arrowProps"></arrow>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="o-commPrefs__closingBorder"></div>

                <!-- Go Digital Header -->
                <div v-if="enableDigitalOptin && $slots['title-go-digital']" class="o-commPrefs__row -header pt-44">
                    <h3 class="o-commPrefs__title">
                        <slot name="title-go-digital" />
                    </h3>
                    <p v-if="$slots['subtitle-go-digital']" class="o-commPrefs__subtitle">
                        <slot name="subtitle-go-digital" />
                    </p>
                </div>

                <!-- Go Digital Toggle -->
                <div v-if="enableDigitalOptin && $slots['label-go-digital']" class="o-commPrefs__row">
                    <m-input-toggle
                        v-model="goDigital"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="goDigital"
                        input-name="goDigital"
                        @changed="inputToggleChanged">

                        <slot name="label-go-digital" />
                    </m-input-toggle>
                </div>

                <!-- Privacy Settings Header -->
                <div v-if="enableCookiesOption && $slots['title-allow-cookie']" class="o-commPrefs__row -header pt-44">
                    <h3 class="o-commPrefs__title">
                        <slot name="title-allow-cookie" />
                    </h3>
                    <p v-if="$slots['subtitle-allow-cookie']" class="o-commPrefs__subtitle">
                        <slot name="subtitle-allow-cookie" />
                    </p>
                </div>

                <!-- Privacy Settings Toggle -->
                <div v-if="enableCookiesOption && $slots['label-allow-cookie']" class="o-commPrefs__row">
                    <m-input-toggle
                        v-model="allowHelpfulCookies"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="allowHelpfulCookies"
                        input-name="allowHelpfulCookies"
                        @changed="inputToggleChanged">
                        <slot name="label-allow-cookie" />
                    </m-input-toggle>
                </div>
            </div>
            <!-- END FIRST SECTION -  -->

            <!-- START SECOND SECTION -->
            <div class="o-commPrefs__grid -right">
                <!-- PUSH NOTIFICATION SECTION -->
                <template v-if="showPushNotifications">
                    <div class="o-commPrefs__row -header">
                        <h3 class="o-commPrefs__title">
                            <slot name="title-push-notifications" />
                        </h3>
                        <p class="o-commPrefs__subtitle">
                            <slot name="subtitle-push-notifications" />
                        </p>
                    </div>
                    <!-- Push Notification - All Info -->
                    <div class="o-commPrefs__row">
                        <m-input-toggle
                            v-model="pushAllInformation"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="pushAllInformation"
                            input-name="pushAllInformation"
                            @changed="pushAllInformationToggle">

                            <slot name="label-push-notifications-all-info" />
                        </m-input-toggle>
                    </div>

                    <!-- Push Notification - Coupons -->
                    <div class="o-commPrefs__row">
                        <m-input-toggle
                            v-model="pushCoupons"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="pushCoupons"
                            input-name="pushCoupons"
                            @changed="inputToggleChanged">

                            <slot name="label-push-notifications-coupons" />
                        </m-input-toggle>
                    </div>

                    <!-- Push Notification - Order Reminders -->
                    <div class="o-commPrefs__row">
                        <m-input-toggle
                            v-model="orderReminders"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="orderReminders"
                            input-name="orderReminders"
                            @changed="inputToggleChanged">

                            <slot name="label-push-notifications-order-reminders" />
                        </m-input-toggle>
                    </div>

                    <!-- Push Notification - New Products -->
                    <div class="o-commPrefs__row">
                        <m-input-toggle
                            v-model="newProducts"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="newProducts"
                            input-name="newProducts"
                            @changed="inputToggleChanged">

                            <slot name="label-push-notifications-new-products" />
                        </m-input-toggle>
                    </div>

                    <!-- Push Notification - Special Offers -->
                    <div class="o-commPrefs__row">
                        <m-input-toggle
                            v-model="specialOffers"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="specialOffers"
                            input-name="specialOffers"
                            @changed="inputToggleChanged">

                            <slot name="label-push-notifications-special-offers" />
                        </m-input-toggle>
                    </div>

                    <!-- Push Notification - Order Delivery Status -->
                    <div class="o-commPrefs__row">
                        <m-input-toggle
                            v-model="orderDeliveryStatus"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="orderDeliveryStatus"
                            input-name="orderDeliveryStatus"
                            @changed="inputToggleChanged">

                            <slot name="label-push-notifications-order-delivery-status" />
                        </m-input-toggle>
                    </div>

                    <!-- Push Notification - Account Notifications -->
                    <div class="o-commPrefs__row pb-40">
                        <m-input-toggle
                            v-model="accountNotifications"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="accountNotifications"
                            input-name="accountNotifications"
                            @changed="inputToggleChanged">

                            <slot name="label-push-notifications-account-notifications" />
                        </m-input-toggle>
                    </div>
                </template>
                <!-- END PUSH NOTIFICATION SECTION -->

                <!-- PHONE SECTION -->
                <div class="o-commPrefs__row -header">
                    <h3 class="o-commPrefs__title">
                        <slot name="title-phone" />
                    </h3>
                    <p class="o-commPrefs__subtitle">
                        <slot name="subtitle-phone" />
                    </p>
                </div>

                <!-- Business Opportunities -->
                <div class="o-commPrefs__row">
                    <m-input-toggle
                        v-model="businessOportunities"
                        class="-commPref"
                        :gtm-id="gtmIdToggle"
                        input-id="businessOportunities"
                        input-name="businessOportunities"
                        @changed="inputToggleChanged">

                        <slot name="label-phone-business-oportunities" />
                    </m-input-toggle>
                </div>

                <!-- Text Reminder -->
                <div class="o-commPrefs__row -textReminder">
                    <template v-if="enablePeakPerformancePack">
                        <m-input-toggle
                            v-model="textReminder"
                            class="-commPref"
                            :gtm-id="gtmIdToggle"
                            input-id="textReminder"
                            input-name="textReminder"
                            @changed="inputToggleChanged">

                            <slot name="label-phone-text-reminder" />
                        </m-input-toggle>

                        <!-- Timezone -->
                        <div class="o-commPrefs__contain -timezone">
                            <label for="timezone" class="o-commPrefs__label -select">
                                <slot name="label-phone-timezone" />
                            </label>
                            <div
                                class="a-select -sm -commPref -rounded -padding-xs"
                                :class="{'-error': shouldDisplayErrorTimezoneReminderMessage}">
                                <select
                                    id="timezone"
                                    v-model="timezone"
                                    name="timezone"
                                    class="a-select__field"
                                    @change="[optionsChanged = true, handleChange($event, gtmIdTimeZone)]">

                                    <slot name="options-timezone" />
                                </select>
                                <arrow v-bind="arrowProps"></arrow>
                            </div>
                        </div>

                        <div class="o-commPrefs__contain">
                            <transition
                                name="o-commPrefs__animation"
                                v-bind="animationClasses"
                                :duration="650">
                                <div
                                    v-show="shouldDisplayErrorTimezoneReminderMessage"
                                    class="o-commPrefs__error -reminder">

                                    <a-icon color="red" size="inherit">{{ errorIcon }}</a-icon>
                                    <span class="o-commPrefs__errorMessage" role="alert">
                                        <slot name="error-msg-timezone" />
                                    </span>
                                </div>
                            </transition>
                        </div>

                        <div class="o-commPrefs__contain -textReminder">
                            <!-- AM Reminder -->
                            <div class="o-commPrefs__col -left">
                                <label for="am-reminder" class="o-commPrefs__label -select">
                                    <slot name="label-phone-am-reminder" />
                                </label>
                                <div
                                    class="a-select -sm -commPref -rounded -padding-xs"
                                    :class="{'-error': shouldDisplayErrorAmPmReminderMessage}">
                                    <select
                                        id="am-reminder"
                                        v-model="amReminder"
                                        name="am-reminder"
                                        class="a-select__field"
                                        @change="[optionsChanged = true, handleChange($event, gtmIdAmPm)]">

                                        <slot name="options-am-reminder" />
                                    </select>
                                    <arrow v-bind="arrowProps"></arrow>
                                </div>
                            </div>

                            <!-- PM Reminder -->
                            <div class="o-commPrefs__col -right">
                                <label for="pm-reminder" class="o-commPrefs__label -select">
                                    <slot name="label-phone-pm-reminder" />
                                </label>
                                <div
                                    class="a-select -sm -commPref -rounded -padding-xs"
                                    :class="{'-error': shouldDisplayErrorAmPmReminderMessage}">
                                    <select
                                        id="pm-reminder"
                                        v-model="pmReminder"
                                        name="pm-reminder"
                                        class="a-select__field"
                                        @change="[optionsChanged = true, handleChange($event, gtmIdTimeZone)]">

                                        <slot name="options-pm-reminder" />
                                    </select>
                                    <arrow v-bind="arrowProps"></arrow>
                                </div>
                            </div>
                        </div>

                        <div class="o-commPrefs__contain -errorReminder">
                            <transition
                                name="o-commPrefs__animation"
                                v-bind="animationClasses"
                                :duration="650">
                                <div
                                    v-show="shouldDisplayErrorAmPmReminderMessage"
                                    class="o-commPrefs__error -reminder">

                                    <a-icon color="red" size="inherit">{{ errorIcon }}</a-icon>
                                    <span class="o-commPrefs__errorMessage" role="alert">
                                        <slot name="error-msg-am-pm" />
                                    </span>
                                </div>
                            </transition>
                        </div>
                    </template>

                    <!-- Disclaimer -->
                    <div class="o-commPrefs__contain">
                        <p class="o-commPrefs__disclaimer">
                            <slot name="phone-disclaimer" />
                        </p>
                    </div>
                </div>

                <!-- Error and Submit -->
                <div class="o-commPrefs__row -submit">
                    <transition
                        name="o-commPrefs__animation"
                        v-bind="animationClasses"
                        appear
                        :duration="650">

                        <div v-show="shouldDisplayErrorSubmitMessage" class="o-commPrefs__error">
                            <a-icon color="red" size="inherit">{{ errorIcon }}</a-icon>
                            <span class="o-commPrefs__errorMessage" role="alert">
                                <slot name="error-msg-no-change" />
                            </span>
                        </div>
                    </transition>

                    <!-- TODO: This logic will change in integration  -->
                    <div
                        class="o-commPrefs__submit"
                        @click="
                            // optionsChanged = !optionsChanged;
                            interactionDone = true;
                        ">

                        <button ref="submitButton" type="submit" :class="buttonClasses" @click="validateForm">{{ submitButtonLabel }}</button>
                    </div>
                </div>
            </div>
            <!-- END SECOND SECTION -->
        </form>
        <slot name="app-download" />
    </div>
</template>

<script>
    import giveConsentApi from '@api/routes/TrackingConsent/GiveConsent';
    import rejectConsentApi from '@api/routes/TrackingConsent/RejectConsent';

    export default {
        name: 'CommunicationPreferences',

        props: {
            culture: {
                type: String,
                default: 'en-US'
            },
            formActionUrl: {
                type: String,
                default: ''
            },

            //   LEFT SECTION
            allowHelpfulCookiesInitialValue: {
                type: Boolean,
                default: false
            },
            productPromotionInitialValue: {
                type: Boolean,
                default: false
            },
            marketplacePartnerInitialValue: {
                type: Boolean,
                default: false
            },
            businessTipsInitialValue: {
                type: Boolean,
                default: false
            },
            couponsInitialValue: {
                type: Boolean,
                default: false
            },
            dayOfMonthInitialValue: {
                type: String,
                default: ''
            },
            enableCookiesOption: {
                type: Boolean,
                default: false
            },
            enableDigitalOptin: {
                type: Boolean,
                default: false
            },
            gtmIdAmPm: {
                type: Number,
                default: null
            },
            gtmIdDayOfMonth: {
                type: Number,
                default: null
            },
            gtmIdTimeZone: {
                type: Number,
                default: null
            },
            gtmIdToggle: {
                type: Number,
                default: null
            },
            goDigitalInitialValue: {
                type: Boolean,
                default: false
            },
            hideMarketplaceOptin: {
                type: Boolean,
                default: false
            },
            enableCouponReminder: {
                type: Boolean,
                default: false
            },
            isCouponsEmailReminderEnabled: {
                type: Boolean,
                default: false
            },
            // RIGHT SECTION

            // Push Notification Section
            pushCouponsInitialValue: {
                type: Boolean,
                default: false
            },
            orderRemindersInitialValue: {
                type: Boolean,
                default: false
            },
            newProductsInitialValue: {
                type: Boolean,
                default: false
            },
            specialOffersInitialValue: {
                type: Boolean,
                default: false
            },
            orderDeliveryStatusInitialValue: {
                type: Boolean,
                default: false
            },
            accountNotificationsInitialValue: {
                type: Boolean,
                default: false
            },

            // Phone Section
            businessOportunitiesInitialValue: {
                type: Boolean,
                default: false
            },
            enablePeakPerformancePack: {
                type: Boolean,
                default: true
            },
            textReminderInitialValue: {
                type: Boolean,
                default: false
            },
            timezoneInitialValue: {
                type: String,
                default: ''
            },
            amReminderInitialValue: {
                type: String,
                default: ''
            },
            pmReminderInitialValue: {
                type: String,
                default: ''
            },

            showPushNotifications: {
                type: Boolean,
                default: false
            },
            submitButtonLabel: {
                type: String,
                default: 'Save Changes'
            },

            // Visual Options
            errorIcon: {
                type: String,
                default: 'error_outline'
            }
        },
        data() {
            return {
                // Privacy Section
                allowHelpfulCookies: '',

                // Email Section
                allInformations: '',
                productPromotion: '',
                marketplacePartner: '',
                businessTips: '',
                coupons: '',
                dayOfMonth: '',

                // Phone Section
                businessOportunities: '',
                textReminder: '',
                timezone: '',
                amReminder: '',
                pmReminder: '',

                // Push Notification Section
                // Note that both Email section and Push Notification sections have All Information and Coupons values. We delineate with push- prefix for push notification section.
                pushAllInformation: '',
                pushCoupons: '',
                orderReminders: '',
                newProducts: '',
                specialOffers: '',
                orderDeliveryStatus: '',
                accountNotifications: '',

                // Go Digital Section
                goDigital: '',

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
            shouldDisplayErrorSubmitMessage: function() {
                return this.interactionDone && !this.optionsChanged;
            },
            shouldDisplayErrorTimezoneReminderMessage: function() {
                return this.textReminder && !this.timezone;
            },
            shouldDisplayErrorAmPmReminderMessage: function() {
                return this.textReminder && !(this.amReminder || this.pmReminder);
            },
            lang() {
                if(!this.culture) {
                    return 'en-US';
                }
                let language = this.culture;
                if(!['en-us', 'es-us', 'en-ca', 'fr-ca', 'es-mx'].includes(language.toLowerCase())) {
                    language = 'en-US';
                }
                return language;
            }
        },
        mounted() {
            // Email Section
            this.productPromotion = this.productPromotionInitialValue;
            !this.hideMarketplaceOptin
                ? this.marketplacePartner = this.marketplacePartnerInitialValue
                : this.marketplacePartner = true;
            this.businessTips = this.businessTipsInitialValue;
            this.enableCouponReminder && this.isCouponsEmailReminderEnabled
                ? this.coupons = this.couponsInitialValue
                : this.coupons = true;
            this.dayOfMonth = this.dayOfMonthInitialValue;
            this.verifyAllInformations();

            // Go Digital Section
            this.enableDigitalOptin ? this.goDigital = this.goDigitalInitialValue : this.goDigital = true;

            // Privacy Section
            this.enableCookiesOption
                ? this.allowHelpfulCookies = this.allowHelpfulCookiesInitialValue
                : this.allowHelpfulCookies = true;

            // Phone Section
            this.businessOportunities = this.businessOportunitiesInitialValue;
            this.textReminder = this.textReminderInitialValue;
            this.timezone = this.timezoneInitialValue;
            this.amReminder = this.amReminderInitialValue;
            this.pmReminder = this.pmReminderInitialValue;

            // Push Notification Section
            this.pushAllInformation = this.pushAllInformationInitialValue;
            this.pushCoupons = this.pushCouponsInitialValue;
            this.orderReminders = this.orderRemindersInitialValue;
            this.newProducts = this.newProductsInitialValue;
            this.specialOffers = this.specialOffersInitialValue;
            this.orderDeliveryStatus = this.orderDeliveryStatusInitialValue;
            this.accountNotifications = this.accountNotificationsInitialValue;
            this.verifyPushAllInformation();
        },
        methods: {
            inputToggleChanged(payload) {
                // Example: payload is an object { name: "productPromotion", value: "true"}
                // Payloads names are the same as data in this component.
                this[payload.name] = payload.value;
                this.optionsChanged = true;

                if(payload.name !== 'allInformations') {
                    this.verifyAllInformations();
                }
            },
            allInformationsToggle: function(payload) {
                this.inputToggleChanged(payload);

                let toggle = this.allInformations;

                this.productPromotion = toggle;
                this.marketplacePartner = toggle;
                this.businessTips = toggle;
                this.coupons = toggle;
            },
            pushAllInformationToggle: function(payload) {
                this.inputToggleChanged(payload);

                let toggle = this.pushAllInformation;

                this.pushCoupons = toggle;
                this.orderReminders = toggle;
                this.newProducts = toggle;
                this.specialOffers = toggle;
                this.orderDeliveryStatus = toggle;
                this.accountNotifications = toggle;
            },
            handleChange(event, gtmId) {
                if(gtmId) {
                    this.gtmTrackAction({id: gtmId}, event);
                }
            },
            async updateConsentApi() {
                if(this.allowHelpfulCookies === true) {
                    await giveConsentApi.put({customerId: this.$custInfo?.customerID});
                } else if(this.allowHelpfulCookies === false) {
                    await rejectConsentApi.put({customerId: this.$custInfo?.customerID});
                }
            },
            verifyAllInformations: function() {
                this.allInformations = this.productPromotion && this.marketplacePartner && this.businessTips && this.coupons;
            },
            verifyPushAllInformation: function() {
                this.pushAllInformation = this.pushCoupons && this.orderReminders && this.newProducts && this.specialOffers && this.orderDeliveryStatus && this.accountNotifications;
            },
            async validateForm(event) {
                if(event.target === this.$refs.submitButton) {
                    if(this.shouldDisplayErrorTimezoneReminderMessage || this.shouldDisplayErrorAmPmReminderMessage) {
                        return;
                    }

                    if(!this.optionsChanged) {
                        this.optionsChanged = false;
                        return;
                    }

                    // Only call consent apis if user changes allowHelpfulCookies from initial value
                    if(this.allowHelpfulCookies === !this.allowHelpfulCookiesInitialValue) {
                        await this.updateConsentApi();
                    }

                    document.getElementsByClassName('o-commPrefs__form')[0].submit();
                }
            }
        }
    };
</script>

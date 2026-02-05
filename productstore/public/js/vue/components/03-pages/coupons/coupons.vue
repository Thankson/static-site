<template>
    <div class="p-coupons md:pt-15">
        <o-coupon-header
            :is-loaded="loaded"
            :banner-description="getLocalizationProp('Data.BannerDescription', defaultRTEDescription )"
            :banner-description-reminder="getLocalizationProp('Data.BannerDescriptionReminder', defaultRTEDescriptionReminder )"
            :banner-title="getLocalizationProp('Data.BannerTitle', 'Shopping  Reminder & Coupons' )"
            :banner-title-reminder="getLocalizationProp('Data.BannerTitleReminder', 'Shopping  Reminder & Coupons' )"
            :banner-image-url="getLocalizationProp('Data.BannerImage.Url', 'https://cdnsc1.melaleuca.com/na/images/product-store/coupon-background-desktop.jpg')"
            :banner-image-alt="getLocalizationProp('Data.BannerImage.Alt', 'A woman smiling at her phone')"
            :bottom-tile-title="getLocalizationProp('Labels.AvailableSavings', '{0} available savings')"
            :days="getLocalizationProp('Labels.DropDownValues', [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25])"
            :description-color="getLocalizationProp('Data.DescriptionColor', 'black')"
            :mobile-banner-image="getLocalizationProp('Data.BannerMobileImage.Url', 'https://cdnsc1.melaleuca.com/na/images/product-store/coupon-background-mobile.jpg')"
            :mobile-banner-image-alt="getLocalizationProp('Data.BannerMobileImage.Alt', 'A woman smiling at her phone')"
            :modal-description="getLocalizationProp('Labels.ShoppingReminderToActivate', 'Select the date of each month you\'d like to receive your shopping reminder to activate your coupons.')"
            :modal-title="getLocalizationProp('Labels.SetupYourReminder', 'Setup Your Reminder')"
            :select-date="getLocalizationProp('Labels.SelectDate', 'Select Date')"
            :set-date="getLocalizationProp('Labels.SetDate', 'Set Date')"
            :change-date="getLocalizationProp('Labels.ChangeDate', 'Change Date')"
            :services-success="!couponReminderRequestFail"
            :services-error-reload-text="getLocalizationProp('Labels.RefreshPage')"
            :services-error-text="getLocalizationProp('Labels.GenericFailureMessage')"
            :top-tile-title="getLocalizationProp('Labels.ToActivateCoupons', 'To activate coupons,')"
            :top-tile-title-activated="getLocalizationProp('Labels.NextShoppingReminder', 'Next Shopping Reminder')"
            :top-tile-subtitle="getLocalizationProp('Labels.SetShoppingReminderEmail', 'Set your shopping reminder email')"
            :is-coupons-email-reminder-enabled="getLocalizationProp('Data.IsCouponsEmailReminderEnabled', false )"
        ></o-coupon-header>

        <!-- Display Coupon Cards -->
        <o-coupon-cards
            v-if="!couponRequestFail"
            :coupon-price="getLocalizationProp('Labels.CouponPrice', 'Coupon Price')"
            :days="getLocalizationProp('Labels.DropDownValues', [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25])"
            :footnote="getLocalizationProp('Labels.NoCashValue', 'While supplies last. No cash value. Limit {0}')"
            :is-coupons-email-reminder-enabled="getLocalizationProp('Data.IsCouponsEmailReminderEnabled', false )"
            :limit-reached="getLocalizationProp('Labels.LimitReached', 'LIMIT REACHED')"
            :member-price="getLocalizationProp('Labels.MemberPrice', 'Member Price')"
            :modal-description="getLocalizationProp('Labels.ShoppingReminderToActivate', 'Select the date of each month you\'d like to receive your shopping reminder to activate your coupons.')"
            :modal-title="getLocalizationProp('Labels.SetupYourReminder', 'Setup Your Reminder')"
            :points="getLocalizationProp('Labels.Points', '{0} Points')"
            :redeem="getLocalizationProp('Labels.Redeem', 'REDEEM')"
            :save-text="getLocalizationProp('Labels.Save', 'Save {0}')"
            :select-date="getLocalizationProp('Labels.SelectDate', 'Select Date')"
            :set-date-aria="getLocalizationProp('Labels.DropDownBox', 'Set the reminder date')"
            :set-date-text="getLocalizationProp('Labels.SetDate', 'Set Date')"
            :coupon-ads="getLocalizationProp('Data.CouponAds', [])"
        ></o-coupon-cards>

        <!-- Display Service Failure for Coupon Cards -->
        <div v-else class="p-coupons__couponsError">
            <m-error-card
                mods="-separateLines"
                :reload-text="getLocalizationProp('Labels.RefreshPage')"
                :text="getLocalizationProp('Labels.GenericFailureMessage')" />
        </div>

        <!-- Display Spinner every time API is being loaded -->
        <div
            v-if="isLoading"
            class="flex items-center justify-center"
            :class="isLoadingFromShelf ? 'xy-centered' : 'min-h-120 relative'">
            <a-loading-spinner sr-text="Page is loading" :visible="true" />
        </div>
    </div>
</template>

<script>
    import {mapActions, mapState} from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'PCoupons',
        mixins: [ localizationMixin ],
        data() {
            return {
                loaded: false,
                isLoadingFromShelf: false,
                defaultRTEDescription: '<p class="text-base lg:text-xl md:pr-150 lg:pr-10 lg:pl-30 px-0 min-h-90 md:pl-10">Receive exclusive offers in your monthly shopping reminder. Thank you for being a valued Melaleuca customer.</p>',
                defaultRTEDescriptionReminder: '<p class="text-base lg:text-xl md:pr-150 lg:pr-10 lg:pl-30 px-0 min-h-90 md:pl-10">Receive exclusive offers in your monthly shopping reminder emailed on the <strong>{0} of each month.</strong> Thank you for being a valued Melaleuca customer.</p>'
            };
        },
        computed: {
            ...mapState('coupon', ['error', 'isLoading', 'couponRequestFail', 'couponReminderRequestFail']),

            // Used only on PatternLab to display Service Failure message
            forceErrorPatternLab() {
                return this.getLocalizationProp('Data.ForceErrorPatternLab') || false;
            },
            couponAds() {
                return this.getLocalizationProp('Data.CouponAds', []);
            }
        },
        async mounted() {
            // Get Coupons
            this.getData({
                // Used only on PatternLab to display Service Failure message
                forceError: this.forceErrorPatternLab
            });

            // Get Coupon Reminder
            await this.getReminderData({
                // Used only on PatternLab to display Service Failure message
                forceError: this.forceErrorPatternLab
            });

            // refresh data on page after the add to shelf has been closed
            this.$shelf.$on.hidden(() => {
                this.isLoadingFromShelf = true;

                this.getData({
                    // Used only on PatternLab to display Service Failure message
                    forceError: this.forceErrorPatternLab
                });
            });

            this.loaded = true;
        },
        methods: {
            ...mapActions('coupon', ['getData', 'getReminderData']),
            refreshPage() {
                location.reload();
            }
        }
    };
</script>

<template>
    <div class="o-couponHeader">
        <div class="o-couponHeader__col -hero" :class="{'-fullWidthCouponHeader': !isCouponsEmailReminderEnabled}">
            <m-coupon-page-hero
                :banner-description="bannerDescription"
                :banner-description-reminder="bannerDescriptionReminder"
                :banner-image-url="bannerImageUrl"
                :banner-image-alt="bannerImageAlt"
                :banner-title="bannerTitle"
                :banner-title-reminder="bannerTitleReminder"
                :description-color="descriptionColor"
                :mobile-banner-image="mobileBannerImage"
                :mobile-banner-image-alt="mobileBannerImageAlt"
            ></m-coupon-page-hero>
        </div>

        <!-- Coupon Reminder Section -->
        <div v-if="isLoaded && isCouponsEmailReminderEnabled" class="o-couponHeader__col -savings">
            <!-- Display Coupon Reminder Date -->
            <div v-if="servicesSuccess">
                <div class="o-couponHeader__date">
                    <m-coupon-reminder
                        :change-date="changeDate"
                        :days="days"
                        :modal-description="modalDescription"
                        :modal-title="modalTitle"
                        :select-date="selectDate"
                        :set-date-text="setDate"
                        :top-tile-title="topTileTitle"
                        :top-tile-title-activated="topTileTitleActivated"
                        :top-tile-subtitle="topTileSubtitle"
                    ></m-coupon-reminder>
                </div>
                <div class="o-couponHeader__save">
                    <m-coupon-page-savings
                        :bottom-tile-title="bottomTileTitle"
                    ></m-coupon-page-savings>
                </div>
            </div>

            <!-- Display Service Failure for Coupon Reminder Date -->
            <m-error-card v-else :reload-text="servicesErrorReloadText" :text="servicesErrorText"></m-error-card>
        </div>

        <!-- Spinner for Coupon Reminder Section -->
        <div v-else-if="isCouponsEmailReminderEnabled" class="o-couponHeader__col -savings flex items-center justify-center">
            <a-loading-spinner :visible="true" />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'OCouponHeader',
        props: {
            bannerDescription: {
                type: String,
                default: ''
            },
            bannerDescriptionReminder: {
                type: String,
                default: ''
            },
            bannerImageUrl: {
                type: String,
                default: ''
            },
            bannerImageAlt: {
                type: String,
                default: ''
            },
            bannerTitle: {
                type: String,
                default: ''
            },
            bannerTitleReminder: {
                type: String,
                default: ''
            },
            bottomTileTitle: {
                type: String,
                default: ''
            },
            changeDate: {
                type: String,
                default: ''
            },
            isLoaded: {
                type: Boolean,
                default: true
            },
            days: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            descriptionColor: {
                type: String,
                default: ''
            },
            mobileBannerImage: {
                type: String,
                default: ''
            },
            mobileBannerImageAlt: {
                type: String,
                default: ''
            },
            modalDescription: {
                type: String,
                default: ''
            },
            modalTitle: {
                type: String,
                default: ''
            },
            selectDate: {
                type: String,
                default: ''
            },
            servicesSuccess: {
                type: Boolean,
                default: false
            },
            servicesErrorReloadText: {
                type: String,
                default: ''
            },
            servicesErrorText: {
                type: String,
                default: ''
            },
            setDate: {
                type: String,
                default: ''
            },
            topTileTitle: {
                type: String,
                default: ''
            },
            topTileTitleActivated: {
                type: String,
                default: ''
            },
            topTileSubtitle: {
                type: String,
                default: ''
            },
            isCouponsEmailReminderEnabled: {
                type: Boolean,
                default: false
            }
        }
    };
</script>

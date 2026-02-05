<template>
    <article class="m-fwBanner -couponPage -stackMobile h-full" data-testid="article-fullWidthBanner">
        <div class="m-fwBanner__row -media" data-testid="container-fullWidthBanner">
            <!-- Start: Media block -->
            <div class="m-fwBanner__bgImage -desktop -right -middle" :style="`background-image: url('${ bannerImageUrl }');`" role="img" :aria-label="bannerImageAlt">
            </div>

            <div class="m-fwBanner__bgImage -mobile -right -top" :style="`background-image: url('${ mobileBannerImage }');`" role="img" :aria-label="mobileBannerImageAlt">
            </div>
            <!-- End: Media block -->
        </div>
        <div class="m-fwBanner__row -columns -w-sm -top -left">
            <!-- Start: Content block -->
            <div class="m-fwBanner__columns">
                <div class="m-fwBanner__col -content">
                    <div class="m-fwBanner__rte">
                        <div class="m-rte" :style="`color: ${descriptionColor}`">
                            <h1 class="text-2xl md:text-4xl lg:text-5xl leading-base font-bold pt-10 md:pt-0 md:pr-80 lg:pr-40 pr-60 md:pb-20 lg:pb-12 pb-9 lg:pl-30 pl-0">{{ hasReminderDate ? replaceToken(bannerTitleReminder, reminderDay) : bannerTitle }}</h1>
                            <div v-html="(hasReminderDate ? replaceToken(bannerDescriptionReminder, `${reminderDay}${reminderDaySuffix}`) : bannerDescription)">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End: Content block -->
        </div>
    </article>
</template>

<script>
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import { mapState } from 'vuex';

    export default {
        name: 'MCouponPageHero',
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
            }
        },
        computed: {
            ...mapState('coupon', ['reminderDay', 'hasReminderDate', 'reminderDaySuffix'])
        },
        methods: {
            replaceToken
        }
    };
</script>

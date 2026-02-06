<template>
    <!--
    MOST LIKELY DONT NEED. IT MIGHT BE USED BY JUST THE HBS FILE.
 -->
    <div class="p-ratingReview">
        <div class="p-ratingReview__noReviews" style="display: none">
            <p class="p-ratingReview__text" v-html="getLocalizationProp('Data.NoReviews.Text')"></p>
            <a
                :href="getLocalizationProp('Data.NoReviews.LinkUrl')"
                class="p-ratingReview__link"
                v-html="getLocalizationProp('Data.NoReviews.LinkText')"
            ></a>
        </div>
        <div class="p-ratingReview__content" style="display: none">
            <div id="pr-write"></div>
        </div>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'PRatingReview',
        mixins: [ localizationMixin ],
        mounted() {
            this.$nextTick(() => {
                window.POWERREVIEWS.display.render({
                    api_key: this.getLocalizationProp('Data.ApiKey'),
                    locale: this.getLocalizationProp('Data.Locale'),
                    pr_locale: this.getLocalizationProp('Data.Locale'),
                    merchant_group_id: this.getLocalizationProp('Data.MerchantGroupId'),
                    merchant_id: this.getLocalizationProp('Data.MerchantId'),
                    appName: 'ryp',
                    emuid: this.getLocalizationProp('Data.Emuid'),
                    components: {
                        ReviewYourPurchases: 'pr-write'
                    }
                });

                const makeAvailable = window.setInterval(() => {
                    if(window.POWERREVIEWS.display) {
                        if(window.POWERREVIEWS.display.fastUnpublishedReviews.length > 0) {
                            clearInterval(makeAvailable);
                            $('.p-ratingReview__content').slideDown();
                        } else if(window.POWERREVIEWS.display.fastUnpublishedReviews.length === 0) {
                            clearInterval(makeAvailable);
                            $('.p-ratingReview__noReviews').slideDown();
                        } else {
                            if($('.pr-alert-danger').length > 0) {
                                $('.pr-alert-danger').text(this.getLocalizationProp('Labels.Error'));
                            }
                        }
                    }
                }, 100);
            });
        }
    };
</script>

<template>
    <div class="m-pSurveyBanner">
        <div v-if="backgroundImage" class="m-pSurveyBanner__background" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }"></div>
        <div class="m-pSurveyBanner__container">
            <!-- Survey Complete -->
            <div v-if="isSurveyComplete" class="m-pSurveyBanner__wrapper">
                <!-- RTE -->
                <div
                    class="m-pSurveyBanner__rte"
                    v-html="replaceTokenArray(getLabels(localization, 'Data.SecondBannerContent'), [
                        productsTotal,
                        productsDisplayValue
                    ])"></div>
            </div>

            <!-- Survey Not Complete -->
            <div v-else class="m-pSurveyBanner__wrapper">
                <!-- RTE -->
                <div class="m-pSurveyBanner__rte" v-html="getLabels(localization, 'Data.FirstBannerContent')"></div>
            </div>

            <o-share-page-shelf-toggle
                v-if="isAuthenticated && showShareButton"
                :script-id="scriptIdSharePage"
                :is-product-survey="true"
                :survey-id="surveyId"
                :culture-codes="localization.Data.SMSCountries" />
        </div>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MSurveyBanner',
        mixins: [ labels ],
        props: {
            isAuthenticated: {
                type: Boolean,
                default: null
            },
            localization: {
                type: Object,
                default: () => {}
            },
            productsCommitment: {
                type: String,
                default: ''
            },
            productsTotal: {
                type: String,
                default: 'XXX'
            },
            productsPoints: {
                type: String,
                default: 'XX'
            },
            surveyId: {
                type: [Number, String],
                default: null
            },
            surveyStatus: {
                type: String,
                default: 'Incomplete'
            },
            scriptIdSharePage: {
                type: String,
                default: 'share-page-survey-localization'
            }
        },
        computed: {
            isSurveyComplete() {
                if(this.surveyStatus === 'Complete') {
                    return true;
                } return false;
            },
            backgroundImage() {
                if(this.isSurveyComplete) {
                    return this.localization?.Data?.SecondBannerBackgroundImage?.Url || null;
                } else {
                    return this.localization?.Data?.FirstBannerBackgroundImage?.Url || null;
                }
            },
            productsDisplayValue() {
                return this.useProductsCommitment ? this.productsCommitment : this.productsPoints;
            },
            showShareButton() {
                return !this.localization?.Data?.HideShareButton ?? true;
            },
            useProductsCommitment() {
                return this.localization?.Data?.UseProductsCommitment || false;
            }
        },
        methods: {
            replaceTokenArray
        }
    };
</script>

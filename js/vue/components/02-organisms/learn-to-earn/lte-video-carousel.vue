<template>
    <div class="o-lteVidCrsl">
        <div class="o-lteVidCrsl__header">
            <h3 class="o-lteVidCrsl__title">
                <slot name="title" />
            </h3>
            <p class="o-lteVidCrsl__CTA">
                <slot name="cta" />
            </p>
        </div>

        <div v-if="!isLoaded" class="o-lteVidCrsl__loading">
            <a-loading-spinner :visible="true" />
        </div>
        <div v-else class="o-lteVidCrsl__wrapper" aria-roledescription="carousel" :aria-label="ariaLabel">
            <nav class="o-lteVidCrsl__actions">
                <div class="o-lteVidCrsl__dots"></div>
                <div class="o-lteVidCrsl__arrows"></div>
            </nav>
            <p :id="'carousel-count-' + uniqueId" class="o-lteVidCrsl__count" aria-live="polite">
                {{ checkLocalization('Showing') }} <span class="slick-ada-from"></span>
                {{ checkLocalization('To') }} <span class="slick-ada-to"></span>
                {{ checkLocalization('OutOf') }} <span class="slick-ada-length"></span>.
            </p>
            <div :id="'carousel-' + uniqueId" class="o-lteVidCrsl__slider">
                <o-video-modal-card
                    v-for="card in carouselCardsList"
                    :id="card.LearnToEarn.Metadata.MetadataItemId"
                    :key="card.LearnToEarn.Metadata.MetadataItemId"
                    :amount-formatted="card.LearnToEarn.Metadata.FormattedLsdAmount"
                    :amount-value="card.LearnToEarn.Metadata.LsdAmount"
                    card-size="-carousel"
                    :desc="card.VirtualVideo.Description"
                    :has-reset="card.VirtualVideo.HasReset"
                    :is-new="card.VirtualVideo.IsNew"
                    :is-watched="card.VirtualVideo.IsWatched"
                    :localization="getLocalization['Data']"
                    :lte="card.LearnToEarn"
                    :prevent-seek="card.VirtualVideo.PreventSeek || false"
                    :allow-seek="card.VirtualVideo.AllowSeek || false"
                    :quiz="card.LearnToEarn.Quiz"
                    :title="card.VirtualVideo.Title"
                    :video-data="card.VirtualVideo"
                    :video-item-id="card.VirtualVideo.MediaId"
                    :tab-index="tabIndex"
                    aria-hidden="false"
                ></o-video-modal-card>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState, mapGetters } from 'vuex';
    export default {
        name: 'OLteVidCar',

        props: {
            ariaLabel: {
                type: String,
                default: ''
            },
            uniqueId: {
                type: String,
                default: ''
            },
            localizationDefault: {
                type: Object,
                default () {
                    return {
                        'ClickToWatch': 'Click to watch',
                        'LoyaltyShoppingDollars': 'Loyalty Shopping Dollars',
                        'New': 'New',
                        'OutOf': 'out of',
                        'PlayTime': 'Play time',
                        'Showing': 'Showing',
                        'To': 'to',
                        'Video': 'video',
                        'Watched': 'Watched'
                    };
                }
            }
        },

        data() {
            return {
                tabIndex: 0
            };
        },

        computed: {
            ...mapState('lteVideos', ['storedVideosList', 'isLoaded', 'carouselCardsList']),

            ...mapGetters('lteVideos', ['getLocalization'])
        },

        created() {
            // Get data from API
            if(!this.storedVideosList.length) this.getData();
        },

        methods: {
            ...mapActions('lteVideos', ['getData']),

            checkLocalization(key, parent) {
                const localizationData = this.getLocalization['Data'];

                if(localizationData && localizationData[key]) {
                    return (key && parent) ? localizationData[parent][key] : localizationData[key];
                } else {
                    return (key && parent) ? this.localizationDefault[parent][key] : this.localizationDefault[key];
                }
            }
        }
    };
</script>

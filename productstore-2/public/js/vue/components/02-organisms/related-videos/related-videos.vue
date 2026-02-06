<template>
    <article class="o-relatedVideos" :class="{ '-isCn' : isCn }">
        <div class="o-relatedVideos__header">
            <h3 class="o-relatedVideos__title">{{ getLocalizationProp('Labels.RelatedVideosTitle') }}</h3>
            <!-- Optional link -->
            <p v-if="getLocalizationProp('Data.CTALink.Url', null)" class="flex items-center tracking-wider text-green-100 text-md uppercase px-5 md:px-0">
                <a :href="getLocalizationProp('Data.CTALink.Url')" :title="getLocalizationProp('Data.CTALink.Aria')" :aria-label="getLocalizationProp('Data.CTALink.Aria')">
                    {{ getLocalizationProp('Data.CTALink.Text') }}
                    <span aria-hidden="true" class="a-arrow -sm -right -filled  ml-3">
                        <span class="a-arrow__icon border-green-100"></span>
                    </span>
                </a>
            </p>
        </div>
        <div v-if="loading" class="o-relatedVideos__loading">
            <a-loading-spinner :visible="true" />
        </div>
        <div v-else class="o-relatedVideos__wrapper" aria-roledescription="carousel" :aria-label="getLocalizationProp('Labels.AriaLabel')">
            <nav class="o-relatedVideos__actions">
                <div class="o-relatedVideos__dots"></div>
                <div class="o-relatedVideos__arrows"></div>
            </nav>
            <p :id="'carousel-count-' + getLocalizationProp('Id')" class="o-relatedVideos__count" aria-live="polite">
                {{ getLocalizationProp('Labels.Showing') }} <span class="slick-ada-from"></span>
                {{ getLocalizationProp('Labels.To') }} <span class="slick-ada-to"></span>
                {{ getLocalizationProp('Labels.OutOf') }} <span class="slick-ada-length"></span>.
            </p>
            <div :id="'carousel-' + getLocalizationProp('Id')" class="o-relatedVideos__slider">
                <m-vidlink-card
                    v-for="(card, index) in relatedVideoList"
                    :id="card.LearnToEarn ? card.LearnToEarn.Metadata.MetadataItemId : ''"
                    :key="index"
                    :amount-formatted="card.LearnToEarn ? card.LearnToEarn.Metadata.FormattedLsdAmount : undefined"
                    :amount-value="card.LearnToEarn ? card.LearnToEarn.Metadata.LsdAmount : undefined"
                    :desc="card.VirtualVideo.Description"
                    :has-reset="card.VirtualVideo.HasReset"
                    :is-new="card.VirtualVideo.IsNew"
                    :is-watched="card.VirtualVideo.IsWatched"
                    :link="hasLink(card)"
                    :localization="getLocalizationProp['Data']"
                    :lte="card.LearnToEarn ? card.LearnToEarn : undefined"
                    :quiz="card.LearnToEarn ? card.LearnToEarn.Quiz : undefined"
                    :title="card.VirtualVideo.Title"
                    :video-data="card.VirtualVideo"
                    :video-status="card.Status"
                    :tab-index="tabIndex"
                    aria-hidden="false"
                ></m-vidlink-card>
            </div>
        </div>
    </article>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ORelatedVideos',
        mixins: [ localizationMixin ],
        data() {
            return {
                loading: false,
                relatedVideoList: [],
                tabIndex: 0
            };
        },
        computed: {
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        async mounted() {
            this.relatedVideoList = this.getLocalizationProp('Data.RelatedVideos.Data');
        },
        methods: {
            openVideo: function(url) {
                window.location.href = url;
            },
            hasLink(card) {
                return card.VirtualVideo?.PageUrl?.Url || '';
            }
        }
    };
</script>

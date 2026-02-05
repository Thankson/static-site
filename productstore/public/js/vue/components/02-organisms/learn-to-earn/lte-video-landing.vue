<template>
    <article class="o-lteVidLand">
        <!-- Loading -->
        <div v-if="!checkIsLoaded" class="o-lteVidLand__loading">
            <a-loading-spinner
                :visible="true"
                :aria-hidden="true">
            </a-loading-spinner>
        </div>

        <div v-else :class="['o-lteVidLand__wrapper', isGrow && 'text-center']">
            <!-- Title and Description or extra contents | Top -->
            <slot v-if="infoOnTop && !hideInfo" name="extra-content-top">
                <div :class="isGrow ? 'pt-10' : 'o-lteVidLand__row -body'">
                    <!-- Title -->
                    <h2 v-if="titleComp" :class="['o-lteVidLand__title', isGrow && 'text-2xl md:text-3xl text-gray-150 lg:text-3xl font-bold']">
                        {{ titleComp }}
                    </h2>

                    <!-- Description -->
                    <p v-if="descComp" :class="['o-lteVidLand__desc', isGrow && 'text-lg md:text-lg lg:text-lg text-gray-150']" v-html="descComp"></p>

                    <!-- CTA -->
                    <v-button
                        v-if="hasCta"
                        :href="getLocalizationProp('Data.CtaLink.Url')"
                        type="button"
                        :cta="getLocalizationProp('Data.CtaLink.Text')"
                        :class="ctaClasses"
                        :aria-label="getLocalizationProp('Data.CtaLink.Aria')"
                        is-anchor
                    />
                </div>
            </slot>

            <div :class="isGrow && 'my-8 md:my-12 lg:my-16 px-10 flex justify-center items-center'">
                <div :class="isGrow &&'max-w-md w-full'">
                    <o-video-inline
                        :id="idComp"
                        :allow-seek="getLocalizationProp('Data.Video.VirtualVideo.AllowSeek', false)"
                        :amount-formatted="formattedLsdAmountComp"
                        :amount-value="lsdAmountComp"
                        :big-image="bigImageComp"
                        :big-image-alt="bigImageAltComp"
                        card-size="-video-landing"
                        :desc="descComp"
                        :has-lsd-to-activate="hasLsdToActivate"
                        :has-reset="getLocalizationProp('Data.Video.VirtualVideo.HasReset', false)"
                        :is-new="getLocalizationProp('Data.Video.VirtualVideo.IsNew', false)"
                        :is-watched="isWatched"
                        :localization="labelsComp || getLocalization['Data']"
                        :lte="lteComp"
                        mod-class="-vidLanding"
                        :quiz="quizComp"
                        :title="titleComp"
                        :video-data="videoComp"
                        :video-status="getLocalizationProp('Data.Video.VirtualVideo.Status', '')"
                        v-on:nextVideo="playNextVideo"
                        v-on:completed="completedVideo"
                    ></o-video-inline>
                </div>
            </div>
            <!-- Title and Description or extra contents | Bottom -->
            <slot v-if="!infoOnTop && !hideInfo" name="extra-content-bottom">
                <div :class="isGrow ? 'pt-10' : 'o-lteVidLand__row -body'">
                    <!-- Title -->
                    <h2 v-if="titleComp" :class="['o-lteVidLand__title', isGrow && 'text-2xl md:text-3xl text-gray-150 lg:text-3xl font-bold']">
                        {{ titleComp }}
                    </h2>

                    <!-- Description -->
                    <p v-if="descComp" :class="['o-lteVidLand__desc', isGrow && 'text-lg md:text-lg lg:text-lg text-gray-150']" v-html="descComp"></p>

                    <!-- CTA -->
                    <v-button
                        v-if="hasCta"
                        :href="getLocalizationProp('Data.CtaLink.Url')"
                        type="button"
                        :cta="getLocalizationProp('Data.CtaLink.Text')"
                        :class="ctaClasses"
                        :aria-label="getLocalizationProp('Data.CtaLink.Aria')"
                        is-anchor
                    />
                </div>
            </slot>
        </div>
    </article>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState, mapGetters } from 'vuex';

    export default {
        name: 'OLteVidLand',

        mixins: [ localizationMixin ],

        props: {
            ctaClasses: {
                type: String,
                default: 'a-authorBtn text-center bg-white rounded -default w-full md:w-auto px-60 justify-center'
            }
        },

        data() {
            return {
                isNextVideo: false,
                isWatchLocal: null,
                nextVideoDesc: null,
                nextVideoTitle: null
            };
        },

        computed: {
            ...mapState('lteVideos', ['isLoaded', 'storedVideosList']),
            ...mapGetters('lteVideos', ['getLocalization']),

            bigImageComp() {
                return this.localization?.Data?.BigImage;
            },

            bigImageAltComp() {
                return this.localization?.Data?.BigImageAlt;
            },

            checkIsLoaded() {
                return this.hasVideoOnLocalization ?? this.isLoaded;
            },

            descComp() {
                // Prioritize Description in Data over VirtualVideo.Description
                if(this.nextVideoDesc) return this.nextVideoDesc;
                if(this.localization?.Data?.Description) return this.localization?.Data?.Description;
                return this.localization?.Data?.Video?.VirtualVideo?.Description;
            },

            formattedLsdAmountComp() {
                return this.localization?.Data?.Video?.LearnToEarn?.Metadata?.FormattedLsdAmount;
            },

            hasCta() {
                let ctaFields = (this.localization?.Data?.CtaLink?.Url?.length > 0 &&
                    this.localization?.Data?.CtaLink?.Text?.length > 0) ?? false;
                return (this.isNextVideo) ? false : ctaFields;
            },

            hasVideoOnLocalization() {
                return this.localization?.Data?.Video?.VirtualVideo !== undefined;
            },

            hasLsdToActivate() {
                return this.localization?.Data?.Video?.LearnToEarn?.HasLsdToActivate;
            },

            idComp() {
                return this.localization?.Data?.Video?.LearnToEarn?.Metadata?.MetadataItemId;
            },

            hideInfo() {
                return this.localization?.Data?.HideInfo;
            },

            infoOnTop() {
                return this.localization?.Data?.InfoOnTop;
            },

            isWatched() {
                return this.isWatchLocal || this.getLocalizationProp('Data.Video.VirtualVideo.IsWatched', false);
            },

            labelsComp() {
                return this.localization?.Labels;
            },

            lteComp() {
                return this.localization?.Data?.Video?.LearnToEarn;
            },

            lsdAmountComp() {
                return this.localization?.Data?.Video?.LearnToEarn?.Metadata?.LsdAmount;
            },

            quizComp() {
                return this.localization?.Data?.Video?.LearnToEarn?.Quiz;
            },

            titleComp() {
                // Prioritize Title in Data over VirtualVideo.Title
                if(this.nextVideoTitle) return this.nextVideoTitle;
                if(this.localization?.Data?.Title) return this.localization?.Data?.Title;
                return this.localization?.Data?.Video?.VirtualVideo?.Title;
            },

            videoComp() {
                return this.localization?.Data?.Video?.VirtualVideo;
            },

            isGrow() {
                return !!this.localization?.Data?.Title || !!this.localization?.Data?.Description;
            }
        },

        mounted() {
            // Get data from API
            if(!this.storedVideosList.length && !this.hasVideoOnLocalization) this.getData();
        },

        methods: {
            ...mapActions('lteVideos', ['getData']),

            playNextVideo(videoData) {
                this.nextVideoTitle = videoData?.Title;
                this.nextVideoDesc = videoData?.Description;
                this.isNextVideo = true;
            },

            completedVideo(payload) {
                if(!this.lteComp.HasLsdToActivate) this.isWatchLocal = true;
            }
        }
    };
</script>

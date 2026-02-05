<template>
    <div class="o-lteVidPlayer">
        <div class="o-lteVidPlayer__video">
            <div class="o-lteVidPlayer__badges">
                <div v-if="amountValue > 0" class="o-lteVidPlayer__badge -amount">
                    <span class="sr-only">
                        {{ amountFormatted }} {{ checkLocalization('LoyaltyShoppingDollars') }}
                    </span>
                    <span aria-hidden="true">{{ amountFormatted }}</span>
                </div>
            </div>
            <mela-player
                :culture="videoData.Culture"
                :description="videoData.Description"
                :image-url="videoData.ImageUrl"
                :media-id="videoData.MediaId"
                :media-item-name="videoData.MediaItemName"
                :run-time-seconds="videoData.RunTimeSeconds"
                :subtitle-path="videoData.SubtitlePath"
                :title="videoData.Title"
                :thumbnail-image-url="videoData.ThumbnailImageUrl"
                :video-folder-path="videoData.VideoFolderPath"
                :hls="videoData.Hls"
                :dash="videoData.Dash"
                :progressive1080="videoData.Progressive1080"
                :progressive720="videoData.Progressive720"
                :progressive360="videoData.Progressive360"
                :progressive270="videoData.Progressive270"
                :progressive144="videoData.Progressive144">
            </mela-player>
        </div>
    </div>
</template>

<script>
    import { MelaVideoPlayer, VideoAnalytics, VideoAnalyticsData } from '@common/source/js/standard/mela-player/mela-player-base';
    import { mapActions } from 'vuex';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'OLteVidPlayer',

        props: {
            amountFormatted: {
                type: String,
                default: ''
            },
            amountValue: {
                type: Number,
                default: 0
            },
            hasReset: {
                type: Boolean,
                default: false
            },
            id: {
                type: String,
                default: ''
            },
            isWatched: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default () {
                    return {};
                }
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
            },
            videoData: {
                type: Object,
                default () {
                    return {};
                }
            }
        },

        data() {
            return {
                isVideoLoaded: false,
                getAnalytics: null,
                analyticsData: null
            };
        },

        computed: {
            setLocalization() {
                return Object.keys(this.localization).length ? this.localization : this.localizationDefault;
            }
        },

        watch: {
            analyticsData: {
                deep: true,
                handler(val) {
                    // Video Complete
                    if(this.analyticsData?.completed) this.videoCompleted(val);

                    // Video Destroyed
                    if(this.analyticsData?.destroyed) this.videoDestroyed(val);

                    // Video Paused
                    if(this.analyticsData?.paused) this.videoPaused(val);

                    // Video Played
                    if(this.analyticsData?.play) this.videoPlayed(val);

                    // Video Progress
                    if(this.analyticsData?.currentPosition > 0) this.videoProgress(val);

                    // Video Started
                    if(this.analyticsData?.started) this.videoStarted(val);
                }
            }
        },

        methods: {
            ...mapActions('lteVideos', ['updateState']),

            callPlayer() {
                // Create MelaPlayer
                this.$modal.$on.shown(() => {
                    if(!this.isVideoLoaded) {
                        this.createPlayer();
                        this.isVideoLoaded = true;

                        this.$emit('videoLoaded');
                        this.videoAnalyticsCheck('start');
                    }
                });

                this.$modal.$on.hidden(() => {
                    if(this.isVideoLoaded) {
                        if(window.vueMelaPlayer) {
                            window.vueMelaPlayer.DestroyVideo();
                            this.analyticsData = VideoAnalyticsData();
                            this.isVideoLoaded = false;

                            this.$emit('videoUnloaded');
                            this.videoAnalyticsCheck();
                        }
                    }
                });
            },

            videoAnalyticsCheck(event) {
                if(event) {
                    // Get video data from mela-player
                    this.getAnalytics = setInterval(() => {
                        this.analyticsData = VideoAnalyticsData();
                    }, 1000);
                } else {
                    clearInterval(this.getAnalytics);
                }
            },

            checkLocalization(val) {
                if(!this.setLocalization[val]) {
                    return this.localizationDefault[val];
                } else {
                    return this.setLocalization[val];
                }
            },

            createPlayer() {
                /* Object player */
                const videoObject = {
                    'culture': this.videoData.Culture,
                    'description': this.videoData.Description,
                    'fallbacks': {
                        'hls': this.videoData.Hls,
                        'dash': this.videoData.Dash,
                        'progressive1080': this.videoData.Progressive1080,
                        'progressive720': this.videoData.Progressive720,
                        'progressive360': this.videoData.Progressive360,
                        'progressive270': this.videoData.Progressive270,
                        'progressive144': this.videoData.Progressive144
                    },
                    'imageUrl': this.videoData.ImageUrl,
                    'mediaId': this.videoData.MediaId,
                    'mediaItemName': this.videoData.MediaItemName,
                    'runTimeSeconds': this.videoData.RuntimeSeconds,
                    'subtitlePath': this.videoData.SubtitlePath,
                    'title': this.videoData.Title,
                    'thumbnailImageUrl': this.videoData.ThumbnailImageUrl,
                    'videoFolderPath': this.videoData.VideoFolderPath
                };

                const videoPlayerWidth = Math.min($(window).width(), 640);
                const videoPlayerHeight = videoPlayerWidth * 0.75;
                let videoSetup = {
                    video: videoObject,
                    autostart: true
                };

                const melaPlayer =
                    new MelaVideoPlayer(
                        {
                            videoPlayerContainerId: this.videoData.MediaId,
                            videoPlayerId: this.videoData.MediaId,
                            height: videoPlayerHeight,
                            width: videoPlayerWidth,
                            analyticsCategory: '' // TO-DO
                        },
                        new VideoAnalytics()
                    );
                melaPlayer.SetupVideo(videoSetup);

                window.vueMelaPlayer = melaPlayer;
            },

            updateStore() {
                // Update Store and API
                let card = {
                    earnedAmount: this.amountValue,
                    mediaId: this.id,
                    status: 'watched'
                };
                // Set card as watched (update Store and API)
                this.updateState(card);
            },

            videoCompleted(val) {
                eventBus.$emit('video-completed', val);
            },

            videoDestroyed(val) {
                eventBus.$emit('video-destroyed', val);
            },

            videoProgress(val) {
                eventBus.$emit('video-progress', val);
            },

            videoPaused(val) {
                eventBus.$emit('video-paused', val);
            },

            videoPlayed(val) {
                eventBus.$emit('video-played', val);
            },

            videoStarted(val) {
                eventBus.$emit('video-started', val);
            }
        }
    };
</script>

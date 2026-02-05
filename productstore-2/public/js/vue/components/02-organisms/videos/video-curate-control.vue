<template>
    <div class="o-vidCurate">
        <div v-if="!checkIsLoaded && !hasAudio" class="o-vidCurate__loading">
            <a-loading-spinner :visible="true" size="sm" />
        </div>

        <!-- Video Card -->
        <o-video-modal-card
            v-else-if="!isVideoBtn"
            :id="getLocalizationProp('Data.Video.LearnToEarn.Metadata.MetadataItemId') || getLocalizationProp('Data.Video.VirtualVideo.MediaId')"
            :amount-formatted="getLocalizationProp('Data.Video.LearnToEarn.Metadata.FormattedLsdAmount')"
            :amount-value="getLocalizationProp('Data.Video.LearnToEarn.Metadata.LsdAmount', 0)"
            card-size="-auto"
            :has-reset="getLocalizationProp('Data.Video.VirtualVideo.HasReset')"
            :is-new="getLocalizationProp('Data.Video.VirtualVideo.IsNew')"
            :is-watched="getLocalizationProp('Data.Video.VirtualVideo.IsWatched')"
            :is-month="getLocalizationProp('Data.Video.VirtualVideo.IsMonth','')"
            :lte="getLocalizationProp('Data.Video.LearnToEarn', {})"
            :localization="getLocalization['Data']"
            :video-data="hasAudio ? audioAsVideoData : getLocalizationProp('Data.Video.VirtualVideo')"
            :prevent-seek="getLocalizationProp('Data.Video.VirtualVideo.PreventSeek', false)"
            :allow-seek="getLocalizationProp('Data.Video.VirtualVideo.AllowSeek', false)"
            :use-main-image="getLocalizationProp('Data.UseMainImage', false)"
            :video-item-id="getLocalizationProp('Data.VideoItemId')"
            :is-cn="isCn"
        ></o-video-modal-card>
        <!-- End Video Card -->

        <!-- Video Button -->
        <o-video-modal-button
            v-else
            :id="hasAudio ? audioAsVideoData.MediaId : getLocalizationProp('Data.Video.LearnToEarn.Metadata.MetadataItemId') || getLocalizationProp('Data.Video.VirtualVideo.MediaId')"
            :localization="getLocalization['Data']"
            :video-data="hasAudio ? audioAsVideoData : getLocalizationProp('Data.Video.VirtualVideo')"
            :lte="getLocalizationProp('Data.Video.LearnToEarn', {})"
            :video-item-id="getLocalizationProp('Data.VideoItemId')"
            :has-reset="getLocalizationProp('Data.Video.VirtualVideo.HasReset')"
            :is-new="getLocalizationProp('Data.Video.VirtualVideo.IsNew')"
            :is-watched="getLocalizationProp('Data.Video.VirtualVideo.IsWatched')"
            :prevent-seek="getLocalizationProp('Data.Video.VirtualVideo.PreventSeek', false)"
            :allow-seek="getLocalizationProp('Data.Video.VirtualVideo.AllowSeek', false)"
        >

            <!-- Slot to pass custom button styles/icons/content to the video modal button component -->
            <slot />

        </o-video-modal-button>
        <!-- End Video Button -->

    </div>
</template>

<script>
    import { mapActions, mapState, mapGetters } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'OVidCurateCtrl',
        mixins: [localizationMixin],
        props: {
            isVideoBtn: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState('lteVideos', [
                'isLoaded',
                'storedVideosList',
                'watchedStep'
            ]),

            ...mapGetters('lteVideos', ['getLocalization']),

            checkIsLoaded() {
                return this.hasVideoOnLocalization ?? this.isLoaded;
            },

            hasLte() {
                return (this.localization?.Data?.Video?.LearnToEarn) ? Object.keys(this.localization.Data.Video.LearnToEarn).length : null;
            },

            hasVideoOnLocalization() {
                return this.localization?.Data?.Video?.VirtualVideo !== undefined;
            },

            hasAudio() {
                return this.localization?.Data?.Audio !== undefined;
            },

            // Prepare audio data in the format expected by the video modal
            audioAsVideoData() {
                if(!this.hasAudio) return {};
                // Get the audio data directly from the localization object
                const audioData = this.localization?.Data?.Audio || {};
                return {
                    ImageUrl: audioData.ImageUrl || '',
                    MediaId: audioData.MediaId || '',
                    Title: audioData.Title || '',
                    ThumbnailImageUrl: audioData.ThumbnailImageUrl || '',
                    // Set IsAudio flag to true for audio playback
                    IsAudio: true,
                    // Audio specific properties
                    AudioPath: audioData.AudioPath || '',
                    Mp3: audioData.Fallbacks?.mp3 || '',
                    Aac: audioData.Fallbacks?.aac || '',
                    Ogg: audioData.Fallbacks?.ogg || ''
                };
            },

            mediaIdLocal() {
                return (this.localization?.Data?.Video?.VirtualVideo.MediaId) ?? null;
            },

            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            watchedStep(val) {
                const watchedMediaID = val?.CurrentVideo?.VirtualVideo?.MediaId;
                if(val && this.hasLte && watchedMediaID === this.mediaIdLocal) {
                    this.setVideoWatched();
                }
            }
        },
        mounted() {
            // Get data from API
            if(!this.storedVideosList.length && !this.hasVideoOnLocalization) this.getData();

            // Check Labels
            if(!this.getLocalization?.Data && this.hasLte) this.fetchLocalization();

            // Needs to call the melaplayer JS
            if(window.refreshMelaPlayer) {
                window.refreshMelaPlayer();
            }

            // EventBus listener
            this.setEventBus();
        },
        methods: {
            ...mapActions('lteVideos', ['getData', 'fetchLocalization']),

            setVideoWatched() {
                if(this.localization?.Data?.Video?.LearnToEarn) this.localization.Data.Video.LearnToEarn.Metadata.LsdAmount = 0;
                this.localization.Data.Video.VirtualVideo.IsNew = false;
                this.localization.Data.Video.VirtualVideo.IsWatched = true;
            },

            setEventBus() {
                eventBus.$on('lte-completion', (payload) => {
                    // If the video is LTE
                    const videoId = this.localization?.Data?.Video?.LearnToEarn?.Metadata?.MetadataItemId;
                    if(payload === videoId && this.hasLte) {
                        this.setVideoWatched();
                    }
                });
                eventBus.$on('video-completed', (payload) => {
                    // If the video is NON-LTE
                    if(payload?.videoId === this.mediaIdLocal && !this.hasLte) {
                        this.setVideoWatched();
                    }
                });
            }
        }
    };
</script>

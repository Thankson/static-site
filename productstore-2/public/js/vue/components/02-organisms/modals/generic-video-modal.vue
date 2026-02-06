<template>
    <div class="o-genericVideo">
        <modal-content id="thumbnail" width="370px">
            <template v-slot:content>

                <!-- Img and icon -->
                <button
                    class="o-genericVideo__cta"
                    @click="showVideo"
                >
                    <img
                        :src="getLocalizationProp('Data.Video.VirtualVideo.ImageUrl')"
                        :alt="getLocalizationProp('Data.Video.VirtualVideo.Description')"
                    >

                    <!-- Play time -->
                    <span v-if="setPlayTime" class="sr-only">
                        {{ getLocalizationProp('Labels.PlayTime') }} : {{ getPlayTimeResult(setPlayTime) }}
                    </span>
                    <div v-if="setPlayTime" class="a-runTime -play" aria-hidden="true">
                        <span class="a-runTime__num">{{ getPlayTimeResult(setPlayTime) }}</span>
                    </div>
                    <span class="sr-only">{{ getLocalizationProp('Labels.ClickToWatch') }}</span>
                </button>

                <!-- Description -->
                <div class="o-genericVideo__desc" v-html="getLocalizationProp('Data.RTE')"></div>
            </template>
        </modal-content>

        <modal id="generic-video" width="max-content" :will-hide="willHideModal">
            <o-video-inline
                :id="getLocalizationProp('Data.Video.LearnToEarn.Metadata.MetadataItemId', '0')"
                ref="genericVideoInline"
                :amount-formatted="getLocalizationProp('Data.Video.LearnToEarn.Metadata.FormattedLsdAmount', '')"
                :amount-value="getLocalizationProp('Data.Video.LearnToEarn.Metadata.LsdAmount', 0)"
                card-size="-modal"
                :desc="getLocalizationProp('Data.Video.VirtualVideo.Description', '')"
                :has-reset="getLocalizationProp('Data.Video.VirtualVideo.HasReset', false)"
                :is-new="getLocalizationProp('Data.Video.VirtualVideo.IsNew', false)"
                :is-on-modal="true"
                :is-watched="getLocalizationProp('Data.Video.VirtualVideo.IsWatched', false)"
                :localization="getLocalizationProp('Labels', {})"
                :lte="getLocalizationProp('Data.Video.LearnToEarn', {})"
                mod-class="-modal"
                :quiz="getLocalizationProp('Data.Video.LearnToEarn.Quiz', {})"
                :title="getLocalizationProp('Data.Video.VirtualVideo.Title', '')"
                :video-data="videoDataComp"
                :video-status="getLocalizationProp('Data.Video.VirtualVideo.Status', '')"
                v-on:nextVideo="playNextVideo"
            ></o-video-inline>
        </modal>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import getPlayTime from '../../../utils/get-play-time';

    export default {
        name: 'GenericVideo',
        mixins: [ localizationMixin ],
        data() {
            return {
                canClose: false,
                isOnFlow: false,
                showVideoModal: false,
                // new video data
                nextVideoId: null,
                nextVideoData: null,
                nextVideoLte: null
            };
        },
        computed: {
            ...mapGetters('lteVideos', ['getLocalization']),

            hasLTE() {
                const lte = this.getLocalizationProp('Data.Video.LearnToEarn');
                return lte && Object.keys(lte).length;
            },
            lteComp() {
                return this.getLocalizationProp('Data.Video.LearnToEarn');
            },
            setPlayTime() {
                return (this.getLocalizationProp('Data.Video') &&
                    this.getLocalizationProp('Data.Video.VirtualVideo') &&
                    this.getLocalizationProp('Data.Video.VirtualVideo.RuntimeSeconds'))
                    ? this.getLocalizationProp('Data.Video.VirtualVideo.RuntimeSeconds') : '';
            },
            videoDataComp() {
                return this.nextVideoData ?? this.getLocalizationProp('Data.Video.VirtualVideo', '');
            }
        },
        mounted () {
            this.setEventBus();
            this.isOnFlow = true;
            this.$modal.show({ id: 'thumbnail'});
        },

        methods: {
            getPlayTimeResult(time) {
                return getPlayTime(time);
            },
            playNextVideo(payload) {
                this.canClose = false;

                // Passing all new video (nv) info
                this.nextVideoId = payload.nvId;
                this.nextVideoData = payload.nvData;
                this.nextVideoLte = payload.nvLte;

                this.showVideo();
                // Wait for modal animation completion
                setTimeout(() => {
                    this.$refs.genericVideoInline.callPlayerInline();
                }, 300);
            },
            setEventBus() {
                eventBus.$on('canCloseModal', (val) => {
                    this.canClose = val;
                });

                eventBus.$on('changeModalSize', (val) => {
                    this.$modal.config({
                        focusEl: '.a-closeX',
                        margin: '0',
                        width: val
                    });
                });
            },
            showVideo() {
                this.$modal.hide();

                this.showVideoModal = true;

                // After hidden call the video
                this.$modal.$on.hidden(() => {
                    if(this.showVideoModal) {
                        this.$modal.show({
                            id: 'generic-video'
                        });

                        // If is regular flow, modal can close w/o confirmation
                        this.$modal.$on.shown(() => {
                            if(!this.hasLTE) this.canClose = true;
                        });

                        this.showVideoModal = false;
                    }
                });
            },
            willHideModal() {
                if(this.isOnFlow) {
                    if(this.amountValueComp === 0 || this.canClose) {
                        // Close modal
                        return true;
                    } else {
                        // Show exit confirmation
                        if(this.hasLTE) eventBus.$emit('callExitConfirmation');
                    }
                }
            }
        }
    };
</script>

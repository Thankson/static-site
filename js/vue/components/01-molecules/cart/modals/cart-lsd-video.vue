<template>
    <div class="o-lsdModal">
        <modal ref="lsdModal" width="max-content">
            <div ref="lsdModalText" class="o-lsdModal__wrapper -text" :class="{'-isCn':isCn}">

                <h2 class="o-lsdModal__heading">{{ getLocalizationProp('Data.VideoModal.Title', 'Congratulations!! You have Loyalty Shopping Dollars to spend.') }}</h2>
                <p class="o-lsdModal__text">{{ getLocalizationProp('Data.VideoModal.Desc', 'If you\'d like to learn more about how to use them, simply start the tutorial.') }}</p>
                <footer class="o-lsdModal__footer">
                    <button v-if="isCn" class="a-button o-lsdModal__action" type="button" v-on:click="hide()">
                        {{ getLocalizationProp('Data.VideoModal.ButtonText', 'Close') }}
                    </button>
                    <button v-else class="a-button o-lsdModal__action" type="button" v-on:click="[showVideo(), gtmTrackAction({id: 409}, $event)]">
                        {{ getLocalizationProp('Data.VideoModal.ButtonText', 'Watch Tutorial!') }}
                    </button>
                </footer>

            </div>
        </modal>
        <modal id="lsd-modal-video" width="640" :will-hide="willHideModal">
            <div ref="lsdModalVideo" class="o-lsdModal__wrapper -video">
                <o-video-inline
                    :id="getLocalizationProp('Data.VideoModal.Video.LearnToEarn.Metadata.MetadataItemId', '0')"
                    ref="lsdVideoinline"
                    :amount-formatted="getLocalizationProp('Data.VideoModal.Video.LearnToEarn.Metadata.FormattedLsdAmount', '')"
                    :amount-value="getLocalizationProp('Data.VideoModal.Video.LearnToEarn.Metadata.LsdAmount', 0)"
                    card-size="-modal"
                    :desc="getLocalizationProp('Data.VideoModal.Video.VirtualVideo.Description', '')"
                    :has-reset="getLocalizationProp('Data.VideoModal.Video.VirtualVideo.HasReset', false)"
                    :is-new="getLocalizationProp('Data.VideoModal.Video.VirtualVideo.IsNew', false)"
                    :is-on-modal="true"
                    :is-watched="getLocalizationProp('Data.VideoModal.Video.VirtualVideo.IsWatched', false)"
                    :localization="getLocalizationProp('Labels.VideoModal', {})"
                    :lte="getLocalizationProp('Data.VideoModal.Video.LearnToEarn', {})"
                    mod-class="-modal"
                    :quiz="getLocalizationProp('Data.VideoModal.Video.LearnToEarn.Quiz', {})"
                    :title="getLocalizationProp('Data.VideoModal.Video.VirtualVideo.Title', '')"
                    :video-data="videoDataComp"
                    :video-status="getLocalizationProp('Data.VideoModal.Video.VirtualVideo.Status', '')"
                    v-on:nextVideo="playNextVideo"
                ></o-video-inline>
            </div>
        </modal>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { get } from 'lodash';
    import cartTertiaryModal from '../../../../mixins/cart-tertiary-modal';
    import eventBus from '../../../../mixins/event-bus';

    export default {
        name: 'MCartLsdVideo',
        mixins: [ cartTertiaryModal ],
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
                const lte = this.getLocalizationProp('Data.VideoModal.Video.LearnToEarn');
                return lte && Object.keys(lte).length;
            },
            isCn() {
                // CN behavior is this modal is just a normal popup and does not lead to a video
                return this.$env?.IsCn || false;
            },
            lteComp() {
                return this.getLocalizationProp('Data.VideoModal.Video.LearnToEarn');
            },
            videoDataComp() {
                return this.nextVideoData ?? this.getLocalizationProp('Data.VideoModal.Video.VirtualVideo', '');
            }
        },
        mounted () {
            this.setEventBus();
            this.isOnFlow = true;
        },

        methods: {
            getLocalizationProp(path, fallback = '') {
                return get(this.data, path, fallback);
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
                    this.$refs.lsdVideoinline.callPlayerInline();
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
                            id: 'lsd-modal-video'
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

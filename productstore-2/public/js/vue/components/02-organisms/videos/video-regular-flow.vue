<template>
    <div class="o-vidRegFlow">
        <m-vid-player
            :id="id"
            ref="videoPlayer"
            :is-cn="isCn"
            :localization="localization"
            :video-data="videoData"
            :allow-seek="allowSeek"
            :keep-new-customer-modal="keepNewCustomerModal"
            :prevent-seek="preventSeek"
            :on-play-progress-feedback-function="onPlayProgressFeedbackFunction"
            :on-complete-function="onCompleteFunction"
            @videoWatched="handleVideoCompleted"
        ></m-vid-player>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import eventBus from '../../../mixins/event-bus';
    export default {
        name: 'OVideoRegFlow',

        props: {
            amountFormatted: {
                type: String,
                default: ''
            },
            amountValue: {
                type: Number,
                default: 0
            },
            allowSeek: {
                type: Boolean,
                default: false
            },
            keepNewCustomerModal: {
                type: Boolean,
                default: false
            },
            preventSeek: {
                type: Boolean,
                default: false
            },
            hasReset: {
                type: Boolean,
                default: false
            },
            id: {
                type: String,
                default: ''
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isRegularFlow: {
                type: Boolean,
                default: false
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
            videoData: {
                type: Object,
                default () {
                    return {};
                }
            },
            videoItemId: {
                type: String,
                default: ''
            },
            onPlayProgressFeedbackFunction: { // eslint-disable-line
                type: Function,
                required: false
            },
            onCompleteFunction: { // eslint-disable-line
                type: Function,
                required: false
            }
        },

        data() {
            return {
                isRegularFlowLocal: false
            };
        },

        mounted () {
            this.setEventBus();
            this.isRegularFlowLocal = this.isRegularFlow;
        },

        methods: {
            ...mapActions('lteVideos', ['updateNonL2eVideos']),

            callPlayer() {
                // Call melaPlayer
                this.$nextTick(() => {
                    if(this.$refs.videoPlayer) this.$refs.videoPlayer.callPlayer();
                });
            },

            handleVideoCompleted() {
                this.$emit('videoWatched', true);
            },

            setEventBus() {
                // Set video as watched
                eventBus.$on('video-completed', (payload) => {
                    const videoId = payload.videoId;
                    if(this.isRegularFlowLocal && (videoId === this.id || videoId === this.videoItemId) && !this.isCn) {
                        this.updateNonL2eVideos({vItemId: this.videoItemId, vId: this.id});
                        this.isRegularFlowLocal = false;
                    }
                });
            }
        }
    };
</script>

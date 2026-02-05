<template>
    <div class="o-couponVidFlow" :class="modClass">
        <div class="o-couponVidFlow__wrapper">
            <!-- <a-loading-spinner :visible="shouldShowLoading" /> -->
            <!-- Exit confirmation -->
            <o-video-not-completed-modal
                v-if="showExitConfirm"
                ref="videoNotCompletedModal"
                :localization="couponLocalization"
                v-on:hideExitConfirm="hideExitConfirm"
                v-on:closeModal="closeModal"
            ></o-video-not-completed-modal>

            <!-- Video Player -->
            <m-vid-player
                v-show="showVidPlayer"
                :id="id"
                ref="couponVideoPlayer"
                :localization="localization"
                :allow-seek="allowSeek"
                :prevent-seek="preventSeek"
                :video-data="videoData"
                @videoLoaded="setVideoLoaded"
                @videoUnloaded="setVideoUnloaded"
                @videoWatched="handleVideoCompleted"
            ></m-vid-player>

            <!-- Completion -->
            <o-coupon-completion-modal
                v-if="showCompletion"
                :localization="couponLocalization"
                :is-visible="showCompletion"
                :video-data="videoData"
                @continue="handleContinue"
            ></o-coupon-completion-modal>
        </div>
    </div>
</template>

<script>
    import videoFlowMixin from '../../../mixins/video-flow';
    import OCouponCompletionModal from './coupon-completion-modal.vue';
    import OVideoNotCompletedModal from './video-not-completed-modal.vue';
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'OCouponVidFlow',
        components: {
            OCouponCompletionModal,
            OVideoNotCompletedModal
        },

        mixins: [videoFlowMixin],

        props: {
            allowSeek: {
                type: Boolean,
                default: false
            },
            couponLocalization: {
                type: Object,
                default() {
                    return {};
                }
            },
            id: {
                type: String,
                default: ''
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            modClass: {
                type: String,
                default: ''
            },
            preventSeek: {
                type: Boolean,
                default: false
            },
            videoData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },

        data() {
            return {
                flowStep: 'showVidPlayer', // Current visible component
                showCompletion: false,
                showExitConfirm: false,
                showVidPlayer: true
            };
        },
        watch: {
            showVidPlayer(val) {
                this.$emit('showVidPlayer', val);
            }
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                // Reset to initial data flow
                const newData = this.$options.data.apply(this);
                newData.showVidPlayer = this.allowVideoPlay && newData.showVidPlayer;
                Object.assign(this.$data, newData);
                this.showComponent('showVidPlayer');
            });
            this.setEventBus();
        },
        methods: {
            setEventBus() {
                eventBus.$off('callExitConfirmation');
                eventBus.$on('callExitConfirmation', () => {
                    this.showModalExitConfirm();
                });
            },
            hideExitConfirm() {
                // Set to NOT hide the modal
                this.$emit('setShouldNotHideModal');

                // Back to the prev component
                if(this.flowStep === 'showVidPlayer') {
                    window.vueMelaPlayer.Player.play();
                    this.modalSize('video');
                    this.showComponent(this.flowStep);
                } else {
                    this.modalSize('default');
                    this.showComponent(this.flowStep);
                }
            },

            showModalExitConfirm() {
                const showExit = () => {
                    window.vueMelaPlayer.Player.pause();
                    this.modalSize('default');
                    this.showComponent('showExitConfirm');
                };

                // Show exit confirmation modal
                showExit();
            }
        }
    };
</script>

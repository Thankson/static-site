<!-- welcome-video-flow.vue -->
<template>
    <div class="o-welcomeVidFlow" :class="modClass">
        <div class="o-welcomeVidFlow__wrapper">
            <!-- Exit confirmation -->
            <o-video-not-completed-modal
                v-if="showExitConfirm"
                ref="videoNotCompletedModal"
                :localization="localization"
                v-on:hideExitConfirm="hideExitConfirm"
                v-on:closeModal="closeModal"
            ></o-video-not-completed-modal>

            <!-- Video Player -->
            <m-vid-player
                v-show="showVidPlayer"
                :id="id"
                ref="welcomeVideoPlayer"
                :localization="localization"
                :allow-seek="allowSeek"
                :prevent-seek="preventSeek"
                :video-data="videoData"
                :is-welcome-video="isWelcomeVideo"
                :is-watched="isWatched"
                @videoProgress="handleVideoProgress"
                @videoLoaded="setVideoLoaded"
                @videoUnloaded="setVideoUnloaded"
                @videoWatched="handleVideoCompleted"
            ></m-vid-player>

            <!-- Completion -->
            <o-congratulations-modal
                v-if="showCompletion"
                :localization="localization"
                @continue="handleContinue"
            ></o-congratulations-modal>
        </div>
    </div>
</template>

<script>
    import videoFlowMixin from '../../../mixins/video-flow';
    import OCongratulationsModal from './congratulations-modal.vue';
    import OVideoNotCompletedModal from './video-not-completed-modal.vue';
    import { mapState } from 'vuex';

    export default {
        name: 'OWelcomeVidFlow',
        components: { OCongratulationsModal, OVideoNotCompletedModal },
        mixins: [videoFlowMixin],

        props: {
            id: {
                type: String,
                default: ''
            },
            isWatched: {
                type: Boolean,
                default: false
            },
            isWelcomeVideo: {
                type: Boolean,
                default: true
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
            allowSeek: {
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
                shouldHideModal: false,
                showCompletion: false,
                showExitConfirm: false,
                showVidPlayer: true
            };
        },
        computed: {
            // using wecome state to check if video has been watched & to only show completion modal once.
            ...mapState('welcome', ['hasWatchedVideo'])
        },
        watch: {
            showVidPlayer(val) {
                this.$emit('showVidPlayer', val);
            }
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                // Reset to initial data flow
                Object.assign(this.$data, this.$options.data.apply(this));
            });
        },
        methods: {
            callPlayer() {
                // Call melaPlayer
                this.$nextTick(() => {
                    if(this.$refs.welcomeVideoPlayer) this.$refs.welcomeVideoPlayer.callPlayer();
                });
            },

            closeModal() {
                this.$emit('setShouldHideModal');
                this.shouldHideModal = true;
            },

            handleContinue() {
                this.closeModal();
            },

            handleVideoCompleted(payload) {
                if(payload && this.isVideoLoaded && !this.hasWatchedVideo) {
                    this.isVideoWatched = true;
                    this.$emit('videoWatched', payload);
                    this.showModalCompletion();
                }
            },

            handleVideoProgress(val) {
                this.$emit('videoProgress', val);
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
                    window.vueMelaPlayer?.Player?.pause();
                    this.modalSize('default');
                    this.showComponent('showExitConfirm');
                };

                // Show exit confirmation modal
                showExit();
            }
        }
    };
</script>

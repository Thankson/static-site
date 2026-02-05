<template>
    <div class="o-lteVidFlow" :class="modClass">
        <div class="o-lteVidFlow__wrapper">

            <!-- Exit confirmation -->
            <o-lte-exit-confirm
                v-if="showExitConfirm"
                ref="lteExitConfirm"
                :title="checkLocalization('Title', 'CloseWarning')"
                :desc="checkLocalization('Description', 'CloseWarning')"
                :question="checkLocalization('AreYouSure', 'CloseWarning')"
                :cta-primary="checkLocalization('No', 'CloseWarning')"
                :cta-secondary="checkLocalization('Yes', 'CloseWarning')"
                :mod-class="modClass"
                v-on:hideExitConfirm="hideExitConfirm"
                v-on:closeModal="closeModal"
            ></o-lte-exit-confirm>

            <a-loading-spinner :visible="shouldShowLoading" />

            <!-- 1st step: video -->
            <m-vid-player
                v-show="showVidPlayer && !shouldShowLoading"
                :id="id"
                ref="lteVideoPlayer"
                :amount-formatted="amountFormatted"
                :amount-value="setAmountValue"
                :is-replay="isReplay"
                :has-reset="hasReset"
                :is-watched="isWatched"
                :localization="localization"
                :video-data="videoData"
                :allow-seek="allowSeek"
                :prevent-seek="preventSeek"
                v-on:videoLoaded="setVideoLoaded"
                v-on:videoUnloaded="setVideoUnloaded"
            ></m-vid-player>

            <!-- 2nd step: Quiz -->
            <o-lte-quiz
                v-show="hasLsdToActivate && hasQuiz && showQuiz"
                ref="lteQuiz"
                :key="id"
                :amount-formatted="amountFormatted"
                :has-quiz="hasQuiz"
                :localization="localization"
                :mod-class="modClass"
                :quiz="quiz"
                v-on:showModalCompletion="showModalCompletion"
            ></o-lte-quiz>

            <!-- 3rd step: Completion -->
            <o-lte-vid-completion
                v-if="showCompletion"
                ref="lteVideoCompletion"
                :is-watched="isWatched"
                :has-reset="hasReset"
                :localization="localization"
                :mod-class="modClass"
                :watched-step="watchedStep"
                :is-replay="isReplay"
                v-on:updateStore="updateStore"
                v-on:closeModal="closeModal"
                v-on:replayVideo="replayVideo"
                v-on:nextVideo="playNextVideo"
            ></o-lte-vid-completion>

            <!-- Next video : Modal -->
            <o-video-modal-button
                v-if="showNextVideo"
                v-show="false"
                :id="nextVideoId"
                ref="nextvideo"
                :localization="localization"
                :video-data="nextVideoData"
                :lte="nextVideoLte"
                :quiz="nextVideoLte.Quiz"
            >
            </o-video-modal-button>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'OLteVidFlow',

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
            isNew: {
                type: Boolean,
                default: false
            },
            isWatched: {
                type: Boolean,
                default: false
            },
            lte: {
                type: Object,
                default () {
                    return {};
                }
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
                        'CloseWarning': {
                            'Title': 'Please Confirm',
                            'Description': 'No Loyalty Shopping Dollars can be earned if you leave now. If you leave, you will be required to rewatch this video in its entirety to activate the associated Loyalty Shopping Dollars.',
                            'AreYouSure': 'Are you sure you want to leave early?',
                            'Yes': 'Yes, I understand',
                            'No': 'No, finish'
                        }
                    };
                }
            },
            modClass: {
                type: String,
                default: ''
            },
            allowSeek: {
                type: Boolean,
                default: false
            },
            preventSeek: {
                type: Boolean,
                default: false
            },
            quiz: {
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
            }
        },

        data() {
            return {
                amountValueLocal: null, // Amount changed locally when replay video
                flowStep: 'showVidPlayer', // Current visible component
                isOnFlow: false,
                isQuizDone: false,
                isReplay: false,
                isVideoLoaded: false,
                isVideoWatched: false,
                showCompletion: false,
                showExitConfirm: false,
                showQuiz: false,
                showVidPlayer: true,
                shouldHideModal: false,
                // Next Video data
                showNextVideo: false,
                nextVideoId: null,
                nextVideoData: null,
                nextVideoLte: null,
                shouldShowLoading: true
            };
        },

        computed: {
            ...mapState('lteVideos', ['watchedStep']),

            hasLsdToActivate() {
                return this.lte?.HasLsdToActivate;
            },

            hasQuiz() {
                return this.quiz?.Questions?.length > 0;
            },

            setAmountValue() {
                return this.amountValueLocal ?? this.amountValue;
            },

            showFlow() {
                // Logic behind if we show the video flow
                return this.setAmountValue > 0 && (!this.isWatched || this.hasReset);
            }
        },

        watch: {
            isQuizDone: {
                handler: 'checkHasQuiz',
                immediate: true
            },
            hasLsdToActivate: {
                deep: true,
                immediate: true,
                handler(val) {
                    if(!val) this.isReplay = true;
                }
            }
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                // Reset to initial data flow
                Object.assign(this.$data, this.$options.data.apply(this));
            });

            if(!this.hasLsdToActivate) this.isReplay = true;
            this.setEventBus();
        },

        methods: {
            ...mapActions('lteVideos', ['updateState']),
            ...mapActions('lsd', ['getLsdApiData']),

            checkHasQuiz() {
                // Set isQuizDone
                (this.hasQuiz && (this.hasReset || !this.isWatched)) ? this.isQuizDone = false : this.isQuizDone = true;
            },

            checkLocalization(key, parent) {
                const localizationData = this.localization;
                if((localizationData && localizationData[key]) || (localizationData && localizationData[parent] && localizationData[parent][key])) {
                    return (key && parent) ? localizationData[parent][key] : localizationData[key];
                } else {
                    return (key && parent) ? this.localizationDefault[parent][key] : this.localizationDefault[key];
                }
            },

            closeModal() {
                this.$emit('setShouldHideModal');
                this.shouldHideModal = true;
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

            modalLteVideoFlow() {
                this.isOnFlow = true;
                this.modalSize('video');
                // Call melaPlayer
                this.$nextTick(() => {
                    if(this.$refs.lteVideoPlayer) this.$refs.lteVideoPlayer.callPlayer();
                    this.shouldShowLoading = false;
                });
            },

            modalSize(val) {
                if(val === 'video') {
                    val = '640px';
                } else if(val === 'default') {
                    val = '900px';
                }

                this.$emit('changeModalSize', val);
                eventBus.$emit('changeModalSize', val);
            },

            playNextVideo(payload) {
                // Passing all new video (nv) info to the modal button
                this.nextVideoId = payload.nvId;
                this.nextVideoData = payload.nvData;
                this.nextVideoLte = payload.nvLte;

                this.hideModal();
                this.showNextVideo = true;

                // Modal
                this.$modal.$on.hidden(() => {
                    if(this.$refs.nextvideo) this.$refs.nextvideo.openModal(this.$event, true);
                });

                // Inline videos
                this.$emit('nextVideo', {nvId: this.nextVideoId, nvData: this.nextVideoData, nvLte: this.nextVideoLte});
            },

            replayVideo() {
                this.isReplay = true;
                this.flowStep = 'showVidPlayer';
                this.showComponent(this.flowStep);
                this.modalLteVideoFlow();
                this.amountValueLocal = 0;
                window.vueMelaPlayer.Player.play();
            },

            resetFlow() {
                // Reset to initial flow
                Object.assign(this.$data, this.$options.data.apply(this));
            },

            setEventBus() {
                // Customer fully WATCHED video
                // Set video as watched and go to the next step
                eventBus.$off('video-completed');
                eventBus.$on('video-completed', (payload) => {
                    if(payload && this.isVideoLoaded) {
                        // Forcing JWPlayer to go out of fullscreen (fix for Safari)
                        window.jwplayer().setFullscreen(false);

                        this.isVideoWatched = true;
                        // Check if show Quiz or Completion
                        (this.showFlow && this.hasQuiz && !this.isReplay)
                            ? this.showModalQuiz()
                            : this.showModalCompletion();
                    }
                });

                // Exit confirmation
                eventBus.$off('callExitConfirmation');
                eventBus.$on('callExitConfirmation', () => {
                    if(this.isOnFlow) this.showModalExitConfirm();
                });

                // Close modal
                eventBus.$off('closeModal');
                eventBus.$on('closeModal', () => {
                    this.closeModal();
                });
            },

            setVideoLoaded() {
                this.isVideoLoaded = true;
            },

            setVideoUnloaded() {
                this.isVideoLoaded = false;
            },

            showComponent(el) {
                // Hide all and show the chosen one: el
                // In the data, the key is "flowStep"
                this.showCompletion = false;
                this.showExitConfirm = false;
                this.showQuiz = false;
                this.showVidPlayer = false;

                this[el] = true;
            },

            showModalCompletion() {
                const showCompletion = () => {
                    this.flowStep = 'showCompletion';
                    this.modalSize('default');
                    this.showComponent(this.flowStep);
                    window.vueMelaPlayer.Player.stop();

                    // inline video
                    eventBus.$emit('completionStep');
                };

                // Show completion modal
                showCompletion();
            },

            showModalExitConfirm() {
                const showExit = () => {
                    window.vueMelaPlayer.Player.pause();
                    this.modalSize('default');
                    this.showComponent('showExitConfirm');
                };

                // Show exit confirmation modal
                if(this.isOnFlow) (this.showFlow && !this.showExitConfirm) ? showExit() : this.hideModal();
            },

            hideModal() {
                this.$modal.hide();
                eventBus.$emit('closeVideo');
                this.showExitConfirm = false;
                this.showNextVideo = false;
            },

            showModalQuiz() {
                const showQuiz = () => {
                    this.flowStep = 'showQuiz';
                    this.modalSize('default');
                    this.showComponent('showQuiz');
                    window.vueMelaPlayer.Player.stop();
                };

                // Show quiz modal
                if(this.isOnFlow) this.showFlow ? showQuiz() : this.hideModal();
            },

            updateStore() {
                // Update Store and API
                let card = {
                    earnedAmount: (this.showFlow) ? this.amountValue : 0,
                    mediaId: this.id,
                    status: 'watched'
                };
                // Set card as watched (update Store and API)
                this.updateState(card);
            }
        }
    };
</script>

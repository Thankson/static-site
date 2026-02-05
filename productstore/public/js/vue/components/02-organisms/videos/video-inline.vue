<template>
    <div class="o-videoInline" :class="modClass">
        <div class="o-videoInline__wrapper">

            <button v-if="showVideo && !isOnModal" ref="closeVideoBtn" class="o-videoInline__btn -close" @click="callExitConfirmation">
                close
            </button>

            <button
                v-if="!showVideo"
                class="o-videoInline__btn"
                :class="{ '-noHover' : noHover }"
                @click="callPlayerInline"
            >

                <!-- Tags -->
                <div
                    v-if="!noTags"
                    class="o-videoInline__tags -inline"
                    :class="{'-isCn' : isCn}"
                >

                    <!-- LSD amount -->
                    <div
                        v-if="showLsdAmount"
                        class="o-videoInline__amount"
                    >
                        <span class="sr-only">
                            {{ amountFormattedComp }} {{ checkLocalization('LoyaltyShoppingDollars') }}
                        </span>
                        <span aria-hidden="true">{{ amountFormattedComp }}</span>
                    </div>

                    <!-- Video Status: New/Watched -->
                    <div
                        v-if="showVideoStatus"
                        class="o-videoInline__status"
                    >
                        <span class="sr-only">{{ setVideoStatus }} {{ checkLocalization('Video') }}</span>
                        <span aria-hidden="true">{{ setVideoStatus }}</span>
                    </div>

                    <!-- Play time -->
                    <span v-if="setPlayTime" class="sr-only">
                        {{ checkLocalization('PlayTime') }} : {{ getPlayTimeResult(setPlayTime) }}
                    </span>
                    <div v-if="setPlayTime" class="a-runTime -play" aria-hidden="true">
                        <span class="a-runTime__num">{{ getPlayTimeResult(setPlayTime) }}</span>
                    </div>
                    <span class="sr-only">{{ checkLocalization('ClickToWatch') }}</span>

                </div>

                <!-- Image button -->
                <img :src="bigImageComp" :alt="bigImageAltComp" class="o-videoInline__thumbnail">

            </button>

            <!-- LTE Flow or Regular video -->
            <div v-if="showVideo" class="o-videoInline__video">
                <!-- Learn to Earn Flow -->
                <o-lte-vid-flow
                    v-if="hasLTE"
                    :id="idComp"
                    ref="vidInlineL2eFlow"
                    :allow-seek="allowSeek"
                    :amount-formatted="amountFormattedComp"
                    :amount-value="amountValueComp"
                    :has-reset="hasReset"
                    :is-new="setIsNew"
                    :is-watched="setIsWatched"
                    :lte="lteComp"
                    :localization="localization"
                    :mod-class="modClass"
                    :quiz="quizComp"
                    :video-data="videoDataComp"
                    v-on:nextVideo="playNextVideo"
                >
                </o-lte-vid-flow>

                <!-- Video Player -->
                <m-vid-player
                    v-else
                    :id="idComp"
                    ref="videoInlinePlayer"
                    :localization="localization"
                    :video-data="videoDataComp"
                    :allow-seek="allowSeek"
                    :prevent-seek="preventSeek"
                ></m-vid-player>
            </div>

        </div>
    </div>
</template>

<script>
    import getPlayTime from '../../../utils/get-play-time';
    import { mapActions, mapState } from 'vuex';
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'OVideoInline',

        props: {
            amountFormatted: {
                type: String,
                default: ''
            },
            amountValue: {
                type: Number,
                default: 0
            },
            bigImage: {
                type: String,
                default: '//placehold.co/2556x1228?text=Click+to+play'
            },
            bigImageAlt: {
                type: String,
                default: ''
            },
            hasLsdToActivate: {
                type: Boolean,
                default: false
            },
            hasReset: {
                type: Boolean,
                default: false
            },
            hideAllStamps: {
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
            isOnModal: {
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
            modClass: {
                type: String,
                default: ''
            },
            noHover: {
                type: Boolean,
                default: false
            },
            noTags: {
                type: Boolean,
                default: false
            },
            lte: {
                type: Object,
                default () {
                    return {};
                }
            },
            allowSeek: {
                type: Boolean,
                default: false
            },
            preventSeek: {
                type: Boolean,
                default: false
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
                amountValueLocal: null,
                completionStep: false,
                showVideo: false,
                idLocal: null,
                isNewLocal: null,
                isOnFlow: false,
                isWatchedLocal: null,
                // new video data
                nextVideoId: null,
                nextVideoData: null,
                nextVideoLte: null
            };
        },

        computed: {
            ...mapState('lteVideos', ['watchedStep']),

            amountValueComp() {
                return (!this.hasLsdToActivate) ? 0 : (this.nextVideoLte?.Metadata?.LsdAmount ?? this.lte?.Metadata?.LsdAmount);
            },

            amountFormattedComp() {
                return this.nextVideoLte?.Metadata?.FormattedLsdAmount ?? this.lte?.Metadata?.FormattedLsdAmount;
            },

            bigImageComp() {
                return this.nextVideoData?.ImageUrl ?? this.bigImage;
            },

            bigImageAltComp() {
                return this.nextVideoData?.Title ?? this.bigImageAlt;
            },

            hasLTE() {
                return (this.nextVideoLte && Object.keys(this.nextVideoLte).length) ?? (this.lte && Object.keys(this.lte).length);
            },

            idComp() {
                return this.nextVideoId ?? this.id;
            },

            isCn() {
                return this.$env?.IsCn || false;
            },

            lteComp() {
                return this.nextVideoLte ?? this.lte;
            },

            quizComp() {
                return this.nextVideoLte?.Quiz ?? this.lte?.Quiz;
            },

            setAmountValue() {
                return (this.amountValueLocal) ?? (this.nextVideoLte?.Metadata?.LsdAmount ?? this.amountValue);
            },

            setIsNew() {
                return this.isNewLocal ?? (this.nextVideoLte?.Metadata?.IsNew ?? this.isNew);
            },

            setIsWatched() {
                return this.isWatchedLocal ?? (this.nextVideoLte?.Metadata?.IsWatched ?? this.isWatched);
            },

            setLocalization() {
                return Object.keys(this.localization).length ? this.localization : this.localizationDefault;
            },

            setPlayTime() {
                return (this.nextVideoData?.RuntimeSeconds) ?? (this.videoData?.RuntimeSeconds ? this.videoData.RuntimeSeconds : '');
            },

            setVideoStatus() {
                if(!this.setIsNew && !this.setIsWatched) {
                    return null;
                } else if(this.setIsWatched) {
                    return this.checkLocalization('Watched');
                } else {
                    return this.checkLocalization('New');
                }
            },

            showLsdAmount() {
                return this.hideAllStamps
                    ? false
                    : this.setAmountValue > 0 &&
                        this.setIsWatched === false &&
                        this.hasLTE &&
                        this.hasLsdToActivate;
            },

            showVideoStatus() {
                return this.hideAllStamps ? false : this.setVideoStatus && this.hasLTE;
            },

            videoDataComp() {
                return this.nextVideoData ?? this.videoData;
            }
        },

        watch: {
            watchedStep(val) {
                if(val) {
                    // Set LSD and badges
                    if(this.lte?.Metadata?.LsdAmount) this.lte.Metadata.LsdAmount = 0; // eslint-disable-line
                    this.amountValueLocal = 0;
                    this.isNewLocal = false;
                    this.isWatchedLocal = true;
                }
            }
        },

        created () {
            if(this.isOnModal) this.callPlayerInline();
        },

        mounted () {
            this.setEventBus();
        },

        methods: {
            ...mapActions('lteVideos', ['updateNonL2eVideos']),

            callExitConfirmation() {
                if(this.hasLTE && this.hasLsdToActivate) {
                    // If we're at the completion step
                    if(this.completionStep) {
                        this.closeVideo();
                        this.resetNextVideo();
                    } else {
                        // Show exit confirmation
                        if(this.hasLTE) eventBus.$emit('callExitConfirmation');
                    }
                } else {
                    // Close video directly if don't have LTE
                    this.closeVideo();
                    this.resetNextVideo();
                }
            },

            resetNextVideo() {
                if(this.nextVideoLte?.Metadata?.LsdAmount) this.nextVideoLte.Metadata.LsdAmount = 0;
                if(this.nextVideoLte?.IsNew) this.nextVideoData.IsNew = false;
                if(this.nextVideoData?.IsWatched) this.nextVideoData.IsWatched = true;
            },

            callPlayerInline() {
                this.showVideo = true;
                this.isOnFlow = true;

                // Call melaPlayer
                this.$nextTick(() => {
                    // Focus close button
                    if(!this.isOnModal) this.$refs.closeVideoBtn.focus();

                    // LTE Flow
                    if(this.$refs.vidInlineL2eFlow) this.$refs.vidInlineL2eFlow.modalLteVideoFlow();
                    // Regular Flow
                    if(this.$refs.videoInlinePlayer) this.$refs.videoInlinePlayer.callPlayer();
                });
            },

            checkLocalization(val) {
                if(!this.setLocalization[val]) {
                    return this.localizationDefault[val];
                } else {
                    return this.setLocalization[val];
                }
            },

            closeVideo() {
                if(this.isOnModal) {
                    this.$modal.hide();
                } else {
                    this.showVideo = false;
                    this.isOnFlow = false;
                    window.vueMelaPlayer.Player.stop();
                }
            },

            closeVideoFocus() {
                this.$refs.closeVideoBtn.focus();
            },

            setEventBus() {
                eventBus.$on('closeVideo', (payload) => {
                    this.closeVideo();
                });

                // The user has passed all flow
                eventBus.$on('completionStep', () => {
                    if(this.isOnFlow) {
                        this.completionStep = true;
                    }
                });

                eventBus.$on('video-completed', (payload) => {
                    if(this.videoDataComp.MediaId === payload.videoId && !(this.hasLTE && this.hasLsdToActivate)) {
                        this.updateNonL2eVideos({vItemId: this.id, vId: this.videoDataComp.MediaId});
                        this.$emit('completed', {vItemId: this.id, vId: this.videoDataComp.MediaId});
                    }
                });
            },

            getPlayTimeResult(time) {
                return getPlayTime(time);
            },

            playNextVideo(payload) {
                // Reseting and closing the old video
                this.$refs.vidInlineL2eFlow.resetFlow();
                if(!this.isOnModal) this.closeVideo();
                this.completionStep = false;

                // Local vars
                this.amountValueLocal = payload.nvLte?.Metadata?.LsdAmount;
                this.isNewLocal = payload.nvData?.IsNew;
                this.isWatchedLocal = payload.nvData?.IsWatched;

                this.$nextTick(() => {
                    // Passing all new video (nv) info
                    this.nextVideoId = payload.nvId;
                    this.nextVideoData = payload.nvData;
                    this.nextVideoLte = payload.nvLte;

                    // And calling next video
                    this.callPlayerInline();

                    // Sending info to the parent
                    this.$emit('nextVideo', this.nextVideoData);
                });
            }
        }
    };
</script>

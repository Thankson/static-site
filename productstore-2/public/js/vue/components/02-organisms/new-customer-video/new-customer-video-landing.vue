<template>
    <div class="o-ncvModal -isLanding">
        <div class="o-ncvModal__pop">

            <div class="o-ncvModal__content">
                <div v-if="infoOnTop && !hideInfo" class="o-ncvModal__landingContent">
                    <h2 class="o-ncvModal__title">{{ videoInfoTitle }}</h2>
                    <p class="o-ncvModal__subtitle" v-html="videoInfoSubTitle"></p>
                    <a v-if="!hideCta && ctaLink" class="o-ncvModal__learnMore" :href="ctaLink.Url">{{ ctaLink.Text }}</a>
                </div>

                <div class="o-ncvModal__wrapper">
                    <button v-if="showVideoFlow" class="o-ncvModal__btn -close" @click="willStopVideo">
                        close
                        <slot />
                    </button>
                    <button v-if="!showVideoFlow" class="o-ncvModal__cta" v-on:click="callPlayerInline()">
                        <slot name="cta">
                            <div class="o-ncvModal__row -header">
                                <!-- Play Button-->
                                <div class="o-ncvModal__playButton">
                                    <span class="sr-only">Play video</span>
                                    <img class="o-ncvModal__playIcon" :src="videoPlayButtonIcon.Url" :alt="videoPlayButtonIcon.Alt" aria-hidden="true">
                                </div>

                                <div class="o-ncvModal__header">
                                    <!-- Tags -->
                                    <div class="o-ncvModal__tags">
                                        <!-- Video Status: New/Watched -->
                                        <div v-if="setVideoStatus && isCompleted" class="o-ncvModal__status" :style="{'background-color' : videoTag.Color}">
                                            <span class="sr-only">{{ setVideoStatus }} {{ checkLocalization('Video') }}</span>
                                            <span aria-hidden="true"><img v-if="videoTag" class="o-ncvModal__icon" :src="videoTag.Icon.Url" :alt="videoTag.Icon.Alt" />{{ setVideoStatus }}</span>
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

                                    <!-- Image -->
                                    <div class="o-ncvModal__media">
                                        <img
                                            v-if="videoImage && videoImage.Url"
                                            :src="videoImage.Url"
                                            :alt="videoImage.Alt"
                                            class="o-ncvModal__img"
                                        >
                                        <img
                                            v-else
                                            :src="thumbImgDefault"
                                            alt=""
                                            class="o-ncvModal__img"
                                        >
                                    </div>
                                </div>
                            </div>
                        </slot>
                    </button>
                    <div v-if="showVideoFlow" class="o-ncvModal__video">
                        <o-video-reg-flow
                            :id="videoData.MediaId"
                            ref="vidRegFlowNewCustomer"
                            :has-reset="hasReset"
                            :is-watched="isWatched"
                            :localization="localization"
                            :video-data="{ ...videoData, ...staticVideoData }"
                            :video-item-id="id"
                            :is-regular-flow="true"
                            :is-cn="isCn"
                            :keep-new-customer-modal="keepNewCustomerModal"
                            :allow-seek="allowSeekNcv"
                            :prevent-seek="preventSeekNcv"
                            :on-play-progress-feedback-function="onPlayProgressFeedbackFunction()"
                        >
                        </o-video-reg-flow>
                    </div>
                </div>

                <div v-if="!infoOnTop && !hideInfo" class="o-ncvModal__landingContent">
                    <h2 class="o-ncvModal__title">{{ videoInfoTitle }}</h2>
                    <p class="o-ncvModal__subtitle" v-html="videoInfoSubTitle"></p>
                    <a v-if="!hideCta && ctaLink" class="o-ncvModal__learnMore" :href="ctaLink.Url">{{ ctaLink.Text }}</a>
                </div>
            </div>
        </div>
        <!-- Virtual modal -->
        <modal id="new-customer-confirm" width="460px" :prevent-close="true">
            <template v-slot:default>
                <!-- if user close the video -->
                <o-lte-exit-confirm
                    :desc="abortModal.Description"
                    :cta-primary="videoLabels.AbortModal.KeepWatch"
                    :cta-secondary="videoLabels.AbortModal.ConfirmAbort"
                    :mod-class="modClass"
                    :is-new-customer-landing="true"
                    v-on:closeModal="closeModal"
                    v-on:hideExitConfirm="hideExitConfirm"
                ></o-lte-exit-confirm>
            </template>
        </modal>

        <modal id="new-customer-completion" width="460px">
            <template v-slot:default>
                <!-- if user has completion watched the video -->
                <o-new-customer-video-completion
                    :complete-modal="completeModal"
                    :complete-cta="videoLabels.CompleteModal"
                    v-on:replayVideo="replayVideo"
                >
                </o-new-customer-video-completion>
            </template>
        </modal>
    </div>
</template>

<script>
    import eventBus from '@common/source/js/vue/mixins/event-bus';
    import apiWatched from '@api/routes/newcustomervideo/watched';
    import videoModal from '../../../mixins/video-modal';
    import newCustomerVideoMixin from './new-customer-video.mixin';
    import ONewCustomerVideoCompletion from './new-customer-video-completion.vue';

    export default {
        name: 'ONewCustomerVideoLanding',
        components: {
            'o-new-customer-video-completion': ONewCustomerVideoCompletion
        },
        mixins: [ videoModal, newCustomerVideoMixin ],
        props: {
            abortModal: {
                type: Object,
                default () {
                    return {};
                }
            },
            completeModal: {
                type: Object,
                default () {
                    return {};
                }
            },
            ctaLink: {
                type: Object,
                default () {
                    return {};
                }
            },
            hideCta: {
                type: Boolean,
                default: false
            },
            hideInfo: {
                type: Boolean,
                default: false
            },
            infoOnTop: {
                type: Boolean,
                default: false
            },
            learnMorePage: {
                type: Object,
                default () {
                    return {};
                }
            },
            modClass: {
                type: String,
                default: '-newCustomerVideo'
            },
            thumbImgDefault: {
                type: String,
                default: 'https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg'
            },
            videoDescription: {
                type: String,
                default: ''
            },
            videoImage: {
                type: Object,
                default () {
                    return {};
                }
            },
            videoInfo: {
                type: Object,
                default () {
                    return {};
                }
            },
            videoLabels: {
                type: Object,
                default () {
                    return {};
                }
            },
            videoPlayButtonIcon: {
                type: Object,
                default () {
                    return {};
                }
            },
            videoTag: {
                type: Object,
                default () {
                    return {};
                }
            }
        },
        data() {
            return {
                isVideoLoaded: false,
                isVideoWatched: false,
                showVideoFlow: false,
                showCompletion: false,
                showExitConfirm: false,
                allowSeekNcv: false,
                preventSeekNcv: false,
                isCompleted: false,
                keepNewCustomerModal: false
            };
        },
        computed: {
            setVideoStatus() {
                if(!this.isCompleted) {
                    return null;
                } else {
                    return this.checkLocalization('Watched');
                }
            },
            videoInfoTitle({ isCompleted, videoInfo: { TitleWatched = '', TitleNotWatched = '' } }) {
                return isCompleted ? TitleWatched : TitleNotWatched;
            },
            videoInfoSubTitle({ isCompleted, videoInfo: { DescriptionWatched = '', DescriptionNotWatched = '' } }) {
                return isCompleted ? DescriptionWatched : DescriptionNotWatched;
            }
        },
        watch: {
            isCompleted(val) {
                if(val) {
                    this.keepNewCustomerModal = false;
                    this.$modal.$on.hidden(() => {
                        if(this.keepNewCustomerModal) {
                            this.showVideoFlow = true;
                        } else {
                            this.showVideoFlow = false;
                        }
                    });
                } else {
                    this.keepNewCustomerModal = true;
                }
            },
            videoData: {
                handler() {
                    this.getNewCustomerVideo();
                },
                deep: true
            }
        },
        mounted () {
            this.setEventBus();
            this.keepNewCustomerModal = !this.isCompleted;
        },
        methods: {
            callPlayerInline() {
                this.showVideoFlow = true;
                this.$nextTick(() => {
                    // Regular Flow
                    if(this.$refs.vidRegFlowNewCustomer) this.$refs.vidRegFlowNewCustomer.callPlayer();
                });

                this.$modal.$on.hidden(() => {
                    if(this.keepNewCustomerModal) {
                        this.showVideoFlow = true;
                    } else {
                        this.showVideoFlow = false;
                    }
                });
            },
            closeModal() {
                this.keepNewCustomerModal = false;
                this.$modal.hide({
                    id: 'new-customer-confirm'
                });
                this.showVideoFlow = false;
                window.vueMelaPlayer.Player.stop();
            },
            closeCompletionModal() {
                this.keepNewCustomerModal = false;
                this.$modal.hide({
                    id: 'new-customer-completed'
                });
                this.showVideoFlow = false;
                window.vueMelaPlayer.Player.stop();
            },
            replayVideo() {
                this.keepNewCustomerModal = true;
                this.$modal.hide({
                    id: 'new-customer-completed'
                });
                window.vueMelaPlayer.Player.play();
            },
            setEventBus() {
                eventBus.$off('video-completed');
                eventBus.$on('video-completed', (payload) => {
                    if((payload?.name === this.videoData.MediaItemName) && payload?.completed) {
                        this.videoCompleted();
                    }
                });
            },
            showModalExitConfirm() {
                this.keepNewCustomerModal = true;
                window.vueMelaPlayer.Player.pause();
                this.$modal.show({
                    id: 'new-customer-confirm'
                });
            },
            willStopVideo() {
                if(this.isCompleted) {
                    // Close modal
                    this.keepNewCustomerModal = false;
                    this.showVideoFlow = false;
                    window.vueMelaPlayer.Player.stop();
                } else {
                    this.showModalExitConfirm();
                }
            },
            hideExitConfirm() {
                this.keepNewCustomerModal = true;
                this.$modal.hide({
                    id: 'new-customer-confirm'
                });
                window.vueMelaPlayer.Player.play();
            },

            async updateNewCustomerVideo() {
                const response = await apiWatched.post({
                    MediaItemName: this.videoData.MediaItemName,
                    ViewedProgress: 1,
                    ViewedComplete: true
                });
                if(response.success && response.data.Success) {
                    this.preventSeekNcv = false;
                    this.isCompleted = true;
                    this.$modal.show({
                        id: 'new-customer-completion'
                    });
                }
            },

            async videoCompleted() {
                if(!this.isCompleted) {
                    this.preventSeekNcv = false;
                    this.updateNewCustomerVideo();
                } else {
                    this.showVideoFlow = false;
                }
            }
        }
    };
</script>

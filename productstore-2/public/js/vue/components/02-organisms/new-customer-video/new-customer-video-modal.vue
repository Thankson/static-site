<template>
    <div class="o-ncvModal">
        <modal-content id="id" class="o-ncvModal__pop">
            <template v-slot:content>
                <div class="o-ncvModal__content">
                    <button class="o-ncvModal__cta" :data-index="dataIndex" v-on:click="openNewCustomerModal($event)">
                        <slot name="cta">
                            <div class="o-ncvModal__row -header">
                                <div class="o-ncvModal__header">
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
                    <p class="o-ncvModal__subtitle" v-html="videoDescription || videoData.Description"></p>
                </div>
            </template>
        </modal-content>
        <!-- Virtual modal -->
        <modal id="modal-video" :will-hide="willHideModal">
            <template v-slot:default>
                <!-- Regular Video Flow -->
                <div :class="showVideoFlow ? 'block' : 'hidden'">
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
                        :allow-seek="allowSeekNcv"
                        :prevent-seek="preventSeekNcv"
                        :on-play-progress-feedback-function="onPlayProgressFeedbackFunction()"
                        v-on:changeModalSize="changeModalSize"
                        v-on:setShouldHideModal="setShouldHideModal"
                        v-on:setShouldNotHideModal="setShouldNotHideModal"
                    >
                    </o-video-reg-flow>
                </div>

                <!-- if user close the video -->
                <o-lte-exit-confirm
                    v-if="showExitConfirm"
                    ref="lteExitConfirm"
                    :desc="abortModal.Description"
                    :cta-primary="videoLabels.AbortModal.KeepWatch"
                    :cta-secondary="videoLabels.AbortModal.ConfirmAbort"
                    :mod-class="modClass"
                    v-on:hideExitConfirm="hideExitConfirm"
                    v-on:closeModal="closeModal"
                ></o-lte-exit-confirm>

                <!-- if user has completion watched the video -->
                <o-new-customer-video-completion
                    v-if="showCompletion"
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
    import videoModal from '../../../mixins/video-modal';
    import newCustomerVideoMixin from './new-customer-video.mixin';
    import eventBus from '@common/source/js/vue/mixins/event-bus';
    import apiWatched from '@api/routes/newcustomervideo/watched';
    import ONewCustomerVideoCompletion from './new-customer-video-completion.vue';

    export default {
        name: 'ONewCustomerVideoModal',
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
            learnMorePage: {
                type: Object,
                default () {
                    return {};
                }
            },
            thumbImgDefault: {
                type: String,
                default: 'https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg'
            },
            videoLabels: {
                type: Object,
                default () {
                    return {};
                }
            },
            videoImage: {
                type: Object,
                default () {
                    return {};
                }
            },
            videoDescription: {
                type: String,
                default: ''
            },
            modClass: {
                type: String,
                default: '-newCustomerVideo'
            }
        },
        data() {
            return {
                isVideoLoaded: false,
                isVideoWatched: false,
                showVideoFlow: true,
                showCompletion: false,
                showExitConfirm: false,
                allowSeekNcv: false,
                preventSeekNcv: true,
                isCompleted: false
            };
        },
        watch: {
            videoData: {
                handler() {
                    this.getNewCustomerVideo();
                },
                deep: true
            }
        },
        mounted () {
            this.setEventBus();
        },
        methods: {
            closeModal() {
                this.setShouldHideModal();
                this.shouldHideModal = true;
                this.preventCloseClass = '';
            },
            modalSize(val) {
                if(val === 'video') {
                    val = '640px';
                } else if(val === 'default') {
                    val = '460px';
                }

                this.changeModalSize(val);
                eventBus.$emit('changeModalSize', val);
            },
            openNewCustomerModal($event) {
                this.modalSize('video');
                this.showComponent('showVideoFlow');
                this.getNewCustomerVideo();
                this.$modal.hide({
                    id: 'modal-video'
                });
                this.openModal($event, true);
            },
            replayVideo() {
                this.modalSize('video');
                this.shouldHideModal = true;
                this.showComponent('showVideoFlow');
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
            showComponent(el) {
                // Hide all and show the chosen one: el
                this.showVideoFlow = false;
                this.showCompletion = false;
                this.showExitConfirm = false;

                this[el] = true;
            },
            showModalExitConfirm() {
                const showExit = () => {
                    window.vueMelaPlayer.Player.pause();
                    this.preventCloseClass = '-exitConfirm';
                    this.modalSize('default');
                    this.showComponent('showExitConfirm');
                };

                // Show exit confirmation modal
                showExit();
            },
            willHideModal() {
                if(this.shouldHideModal) {
                    // Close modal
                    window.vueMelaPlayer.Player.stop();
                    return true;
                } else {
                    this.showModalExitConfirm();
                }
            },
            hideExitConfirm() {
                this.setShouldNotHideModal();
                this.shouldHideModal = false;
                this.preventCloseClass = '';
                // Back to the prev component
                this.modalSize('video');
                this.showComponent('showVideoFlow');
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
                    this.modalSize('default');
                    this.showComponent('showCompletion');
                }
            },

            async videoCompleted() {
                this.shouldHideModal = true;
                if(!this.isCompleted) {
                    this.preventSeekNcv = false;
                    this.updateNewCustomerVideo();
                }
            }
        }
    };
</script>

<template>
    <div class="o-videoModalCard" :class="setCardSize">
        <div class="o-videoModalCard__wrapper">

            <!-- CTA -->
            <button
                ref="callFlowBtn"
                class="o-videoModalCard__cta"
                :data-index="dataIndex"
                :class="[ setCardSize, {'pointer-events-none': disableVideo} ]"
                :tabindex="tabIndex"
                :aria-hidden="ariaHidden ? ariaHidden : false"
                v-on:click="!disableVideo && openModal($event)"
            >
                <slot name="cta">
                    <div class="o-videoModalCard__row -header" :data-index="dataIndex">
                        <div class="o-videoModalCard__header">
                            <div class="o-videoModalCard__tags">

                                <!-- Coupons Tag -->
                                <div
                                    v-if="showCoupon"
                                    class="o-videoModalCard__amount -coupon"
                                >
                                    {{ couponLabel }}
                                </div>

                                <!-- LSD amount -->
                                <div
                                    v-if="showLSD"
                                    class="o-videoModalCard__amount"
                                >
                                    <span class="sr-only">
                                        {{ amountFormattedComp }} {{ checkLocalization('LoyaltyShoppingDollars') }}
                                    </span>
                                    <span aria-hidden="true">{{ amountFormattedComp }}</span>
                                </div>

                                <!-- Video Status: New/Watched -->
                                <div
                                    v-if="showVideoStatus"
                                    class="o-videoModalCard__status"
                                >
                                    <span class="sr-only">{{ setVideoStatus }} {{ checkLocalization('Video') }}</span>
                                    <span aria-hidden="true">{{ setVideoStatus }}</span>
                                </div>

                                <!-- Video Status:  Preferred/mouth-->
                                <div v-if="setMonthStatus !== null" class="o-videoModalCard__status -month">
                                    <span class="sr-only">{{ setMonthStatus }}</span>
                                    <span aria-hidden="true">{{ setMonthStatus }}</span>
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
                            <div class="o-videoModalCard__media">
                                <img
                                    v-if="useMainImage && videoData.ImageUrl"
                                    :src="videoData.ImageUrl"
                                    :alt="videoData.AltImage || videoData.Title + ' - ' + checkLocalization('ClickToWatch')"
                                    class="o-videoModalCard__img"
                                >
                                <img
                                    v-else-if="videoData && videoData.ThumbnailImageUrl"
                                    :src="videoData.ThumbnailImageUrl"
                                    :alt="videoData.AltImage || videoData.ThumbnailImageAlt || videoData.Title + ' - ' + checkLocalization('ClickToWatch')"
                                    class="o-videoModalCard__img"
                                >
                                <img
                                    v-else
                                    :src="thumbImgDefault"
                                    alt=""
                                    class="o-videoModalCard__img"
                                >
                            </div>
                        </div>
                    </div>
                </slot>
            </button>

            <!-- Title and Description or extra contents-->
            <slot v-if="!hideExtraContent" name="extra-content">
                <div v-if="setCardSize !== '-lp'" class="o-videoModalCard__row -body">
                    <div v-if="title" class="o-videoModalCard__title">
                        {{ title }}
                    </div>
                    <div v-if="desc" class="o-videoModalCard__desc" v-html="desc"></div>
                </div>
            </slot>

            <slot v-if="showDownloadButton" name="download">
                <a :href="downloadUrl" class="o-videoModalCard__download" download="video"><span class="material-icons text-sm mr-5">file_download</span>{{ downloadButtonText }}</a>
            </slot>

            <button
                v-if="renderShareButton"
                class="o-videoModalCard__shareButton"
                :aria-label="labels.ShareThisVideo"
                @click="handleShareClick"
            >
                <span class="material-icons mr-4 text-xs">share</span>
                {{ labels.Share }}
            </button>

        </div>

        <modal id="modal-share" size="sm">
            <template v-slot:content>
                <h1 class="mb-12 text-xl leading-base">
                    {{ labels.ShareThisVideo }}
                </h1>
                <div class="flex">
                    <ShareModalButton
                        button-mods="bg-blue-175"
                        button-type="sms"
                        container-mods="mr-20 sm:hidden"
                        :label="labels.SMS"
                        :video-id="videoData.MediaItemName"
                    />
                    <ShareModalButton
                        button-mods="bg-green"
                        button-type="email"
                        container-mods="mr-20"
                        :label="labels.Email"
                        :video-id="videoData.MediaItemName"
                    />
                    <ShareModalButton
                        button-mods="bg-gray-95"
                        button-type="link"
                        :label="labels.CopyLink"
                        :link-copied-label="labels.LinkCopied"
                        :video-id="videoData.MediaItemName"
                    />
                </div>
            </template>
        </modal>

        <modal id="modal-video" :will-hide="willHideModal">
            <template v-slot:default>
                <!-- Learn to Earn Flow -->
                <o-lte-vid-flow
                    v-if="hasLTE && !isCn && !isWelcomeVideo"
                    :id="id"
                    ref="vidL2eFlow"
                    :amount-formatted="amountFormattedComp"
                    :amount-value="amountValueComp"
                    :has-reset="hasReset"
                    :is-new="isNew"
                    :is-watched="isWatched"
                    :lte="lte"
                    :localization="localization"
                    modal-target="modal-video"
                    :quiz="quizComp"
                    :video-data="videoData"
                    :prevent-seek="preventSeek"
                    :allow-seek="allowSeek"
                    v-on:changeModalSize="changeModalSize"
                    v-on:setShouldHideModal="setShouldHideModal"
                    v-on:setShouldNotHideModal="setShouldNotHideModal"
                >
                </o-lte-vid-flow>

                <!-- Welcome Video Flow -->
                <o-welcome-vid-flow
                    v-else-if="isWelcomeVideo"
                    :id="id"
                    ref="vidWelcomeFlow"
                    :is-welcome-video="isWelcomeVideo"
                    :localization="localization"
                    :prevent-seek="preventSeek"
                    :allow-seek="allowSeek"
                    :video-data="videoData"
                    @videoWatched="handleVideoWatchedStatus"
                    @videoProgress="handleVideoProgress"
                    v-on:showVidPlayer="setVideoModalMargins"
                    v-on:setShouldHideModal="setShouldHideModal"
                    v-on:setShouldNotHideModal="setShouldNotHideModal"
                >
                </o-welcome-vid-flow>

                <!-- Coupon Video Flow -->
                <o-coupon-vid-flow
                    v-else-if="isCoupon"
                    :id="id"
                    ref="vidCouponFlow"
                    :localization="localization"
                    :coupon-localization="couponLocalization"
                    :prevent-seek="preventSeek"
                    :video-data="videoData"
                    @videoWatched="handleVideoWatchedStatus"
                    v-on:showVidPlayer="setVideoModalMargins"
                    v-on:setShouldHideModal="setShouldHideModal"
                    v-on:setShouldNotHideModal="setShouldNotHideModal"
                >
                </o-coupon-vid-flow>

                <!-- Regular Video Flow -->
                <o-video-reg-flow
                    v-else
                    :id="videoData.MediaId"
                    ref="vidRegFlow"
                    :has-reset="hasReset"
                    :is-cn="isCn"
                    :is-watched="isWatched"
                    :localization="localization"
                    :video-data="videoData"
                    :video-item-id="id"
                    :is-regular-flow="true"
                    @videoWatched="handleVideoWatchedStatus"
                >
                </o-video-reg-flow>

            </template>
        </modal>

    </div>
</template>

<script>
    import videoModal from '../../../mixins/video-modal';
    import ShareModalButton from '@productstore/source/js/vue/components/01-molecules/share-modal-button/share-modal-button.vue';

    export default {
        name: 'OVideoModalCard',
        components: { ShareModalButton },
        mixins: [ videoModal ],
        props: {
            cardSize: {
                type: String,
                default: '' // grid, lp, carousel
            },
            couponLabel: {
                type: String,
                default: ''
            },
            couponLocalization: {
                type: Object,
                default: () => {}
            },
            disableVideo: {
                type: Boolean,
                default: false
            },
            downloadButtonText: {
                type: String,
                default: ''
            },
            downloadUrl: {
                type: String,
                default: ''
            },
            hideExtraContent: {
                type: Boolean,
                default: false
            },
            isCn: {
                type: Boolean,
                default: false
            },
            isWelcomeVideo: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => {}
            },
            renderShareButton: {
                type: Boolean,
                default: false
            },
            showDownloadButton: {
                type: Boolean,
                default: false
            },
            thumbImgDefault: {
                type: String,
                default: 'https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg'
            },
            useMainImage: {
                type: Boolean,
                default: false
            },
            videoIdUrlParam: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                showCoupon: false
            };
        },
        computed: {
            hideAllStamps() {
                return this.videoData?.HideAllStamps || false;
            },
            setCardSize() {
                return this.cardSize ?? `-${this.cardSize}`;
            },
            isCoupon() {
                return this.videoData?.IsCoupon || false;
            },
            showLSD() {
                return this.hideAllStamps
                    ? false
                    : !this.isCn &&
                        this.hasLTE &&
                        (!this.isWatched || this.hasReset) &&
                        this.amountValueComp > 0 &&
                        this.hasLsdToActivate;
            },
            showVideoStatus() {
                return this.hideAllStamps ? false : this.setVideoStatus && !this.isCn && !this.isCoupon;
            }
        },
        mounted() {
            this.showCoupon = this.isCoupon;

            // Currently for Learning Video Library
            // If 'videoId' URL param is passed from parent component via props
            // AND it is equal to videoItemId --> open video modal
            if(this.videoIdUrlParam && this.videoIdUrlParam === this.videoItemId) {
                this.openModal();
            }
        },
        methods: {
            handleShareClick() {
                this.$modal.show({id: 'modal-share'});
            },
            handleVideoProgress(val) {
                this.$emit('videoProgress', val);
            },
            handleVideoWatchedStatus(val) {
                this.showCoupon = false;
                this.$emit('videoWatched', val);
            },
            setVideoModalMargins(val) {
                // If modal is hidden, do not run
                if(this.setShouldHideModal) return;
                // If video is playing, set the modal margin to 0
                // If modal is displayed instead of video, set the modal margin to 10px
                if(val && (this.isWelcomeVideo || this.isCoupon)) {
                    this.changeModalMargin('0');
                } else {
                    this.changeModalMargin('10px');
                }
            }
        }
    };
</script>

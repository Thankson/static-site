<template>
    <div class="o-cartL2eVideos">
        <div v-if="showComponent && isLoaded && isLsdLoaded && showApiErrors" class="o-cartL2eVideos__error">
            <p class="o-cartL2eVideos__trouble">
                {{ checkLocalization('GenericFailureMessage') }}
            </p>
        </div>
        <o-cart-accordion
            v-if="showComponent && isLoaded && isLsdLoaded && !showApiErrors"
            ref="accordion"
            :title="titleAccordionComputed"
            :mask-class="accordionMaskClass"
            @show="[gtmTrackAction({id: 232, text: titleGtm}, {}), isOpen = true]"
            @hide="isOpen = false">

            <div class="o-cartL2eVideos__wrapper">
                <div v-if="!isLoaded" class="o-cartL2eVideos__loading">
                    <a-loading-spinner :visible="true" size="sm" />
                </div>

                <div v-else class="o-cartL2eVideos__loaded">

                    <h3 class="o-cartL2eVideos__title">
                        {{ titleComputed }}
                    </h3>
                    <p class="o-cartL2eVideos__subTitle">
                        {{ checkLocalization('Subtitle') }}
                    </p>

                    <h4 class="o-cartL2eVideos__title -topVideos">
                        {{ checkLocalization('TopVideos') }}
                    </h4>

                    <ul class="o-cartL2eVideos__videosList">
                        <li
                            v-for="(video, index) in cartVideosList"
                            :key="video.LearnToEarn.Metadata.MetadataItemId"
                            class="o-cartL2eVideos__video">
                            <!-- Card -->
                            <o-video-modal-card
                                :id="video.LearnToEarn.Metadata.MetadataItemId"
                                :key="video.LearnToEarn.Metadata.MetadataItemId"
                                :amount-formatted="video.LearnToEarn.Metadata.FormattedLsdAmount"
                                :amount-value="video.LearnToEarn.Metadata.LsdAmount"
                                card-size="-cart"
                                :data-index="index"
                                :has-reset="video.VirtualVideo.HasReset"
                                :is-new="video.VirtualVideo.IsNew"
                                :is-watched="video.VirtualVideo.IsWatched"
                                :lte="video.LearnToEarn"
                                :localization="getLocalization['Data']"
                                :quiz="video.LearnToEarn.Quiz"
                                :title="video.VirtualVideo.Title"
                                :video-data="video.VirtualVideo"
                                :video-status="video.Status"
                                :prevent-seek="video.VirtualVideo.PreventSeek || false"
                                :allow-seek="video.VirtualVideo.AllowSeek || false"
                            >
                                <template v-slot:extra-content>
                                    <div class="o-cartL2eVideos__row -cart">
                                        <!-- Title -->
                                        <div v-if="video.VirtualVideo && video.VirtualVideo.Title" class="o-cartL2eVideos__title">
                                            {{ video.VirtualVideo.Title }}
                                        </div>

                                        <!-- Time -->
                                        <div v-if="video.VirtualVideo && video.VirtualVideo.RuntimeSeconds" class="o-cartL2eVideos__time -cart">
                                            {{ checkLocalization('Time') }}:
                                            <span class="o-cartL2eVideos__value">
                                                {{ getPlayTimeResult(video.VirtualVideo.RuntimeSeconds) }}
                                            </span>
                                        </div>

                                        <!-- Activates -->
                                        <div
                                            v-if="activatesCheck(video)"
                                            class="o-cartL2eVideos__activate"
                                        >
                                            {{ checkLocalization('Activates') }}:
                                            <span class="o-cartL2eVideos__value">{{ video.LearnToEarn.Metadata.FormattedLsdAmount }}</span>
                                        </div>

                                        <!-- Badge watched -->
                                        <div v-if="video.VirtualVideo.IsWatched" class="o-cartL2eVideos__status -cart">
                                            <span aria-hidden="true">{{ checkLocalization('Watched') }}</span>
                                        </div>
                                    </div>
                                </template>
                            </o-video-modal-card>
                        </li>
                    </ul>

                    <!-- See more Videos -->
                    <button class="o-cartL2eVideos__btn -seeMore" @click="seeMoreVideos">
                        {{ checkLocalization('SeeMoreVideos') }}
                    </button>

                    <!-- Read Program Details -->
                    <a
                        v-if="l2eVideoData && l2eVideoData.ReadProgramUrl && l2eVideoData.ReadProgramUrl.Url && l2eVideoData.ReadProgramUrl.Text"
                        :href="l2eVideoData.ReadProgramUrl.Url"
                        :target="l2eVideoData.ReadProgramUrl.Target || '_blank'"
                        class="o-cartL2eVideos__btn -programDetails"
                    >
                        {{ l2eVideoData.ReadProgramUrl.Text }}
                        <span aria-hidden="true" class="o-cartL2eVideos__arrow">chevron_right</span>
                    </a>

                    <!-- Video Tutorial -->
                    <div class="o-cartL2eVideos__tutorial">
                        <o-video-modal-button
                            id="videoTutorial"
                            ref="lteVideoPlayerCart"
                            :video-data="l2eVideoData.TutorialVideo.VirtualVideo"
                        >
                            <span
                                v-if="l2eVideoData.TutorialVideo && l2eVideoData.TutorialVideo.VirtualVideo"
                                class="o-cartL2eVideos__text"
                            >
                                {{ checkLocalization('HowToUseLsd') }}
                                <span aria-hidden="true" class="o-cartL2eVideos__arrow -tuto">chevron_right</span>
                            </span>

                        </o-video-modal-button>
                    </div>
                </div>

            </div>
        </o-cart-accordion>
        <div v-if="isOpen" class="rounded bg-gray-35 relative h-16 w-full"></div>

    </div>
</template>

<script>
    import getPlayTime from '../../../utils/get-play-time';
    import { mapActions, mapState, mapGetters } from 'vuex';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'OCartL2eVideo',

        props: {
            accordionMaskClass: {
                type: String,
                default: '-gray25'
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
                        'Activates': 'Activates',
                        'AccordionTitle': 'You Have <strong>{0}</strong> to Activate',
                        'Title': 'You have {0} Loyalty Shopping Dollars waiting to be activated.',
                        'Subtitle': 'To use them for this order, watch videos and answer the questions at the end.',
                        'TopVideos': 'Top Videos',
                        'SeeMoreVideos': 'See more videos',
                        'ReadProgramDetails': 'Read Program Details',
                        'Time': 'Time',
                        'HowToUseLsd': 'Watch: How to Use My Dollars',
                        'Watched': 'Watched',
                        'GenericFailureMessage': 'This part of the page has trouble loading.'
                    };
                }
            },
            l2eVideoData: {
                type: Object,
                default () {
                    return {};
                }
            },
            showApiErrorPLOnly: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: null
            }
        },

        data() {
            return {
                showVideoTutorial: false,
                lsdData: {},
                firstLoad: true,
                isOpen: false
            };
        },

        computed: {
            ...mapState('lsd', ['isLsdLoaded', 'lsdDetails']),
            ...mapState('lteVideos', ['isLoaded', 'storedVideosList', 'cartVideosList']),
            ...mapGetters('lteVideos', ['getLocalization']),

            showApiErrors() {
                const lsdCheck = this.$store?.state?.lsd?.showApiError;
                const l2EVideosCheck = this.$store?.state?.lteVideos?.showApiError;
                return lsdCheck || l2EVideosCheck;
            },

            hasLsd() {
                const lsdAmount = this.lsdDetails?.LsdAvailableToUnlock;
                let lsdAmountValue = null;
                (lsdAmount) ? lsdAmountValue = parseFloat(lsdAmount.replace('$', '')) : lsdAmountValue = null;
                return lsdAmountValue;
            },

            titleAccordionComputed() {
                const accTitle = this.localization['AccordionTitle'];
                const unlockLsd = this.lsdDetails?.LsdAvailableToUnlock;
                return accTitle.replace('{0}', unlockLsd);
            },

            titleGtm() {
                return this.titleAccordionComputed.replace(/<[^>]*>?/gm, '');
            },

            titleComputed() {
                const title = this.localization['Title'];
                const unlockLsd = this.lsdDetails?.LsdAvailableToUnlock;
                return title.replace('{0}', unlockLsd);
            },

            showComponent() {
                return this.l2eVideoData?.ShowLSDAccordion;
            }
        },

        mounted () {
            this.setEventBus();
        },

        created() {
            // Get data from API
            if(!this.storedVideosList.length) {
                if(this.showApiErrorPLOnly) {
                    // Only for PatternLab
                    this.getLsdApiDataError();
                    this.getDataError();
                } else {
                    this.getData();
                    if(!Object.keys(this.lsdDetails).length) this.getLsdApiData();
                }
            }
        },

        methods: {
            ...mapActions('lsd', ['getLsdApiData', 'getLsdApiDataError']),
            ...mapActions('lteVideos', ['getData', 'updateL2eVideoCart', 'getDataError']),
            ...mapActions('cart', ['refreshData']),

            activatesCheck(video) {
                return video.LearnToEarn &&
                    video.LearnToEarn.Metadata &&
                    video.LearnToEarn.Metadata.LsdAmount > 0 &&
                    (!video.VirtualVideo.IsWatched || video.VirtualVideo.HasReset) &&
                    video.LearnToEarn.HasLsdToActivate;
            },

            checkLocalization(key) {
                const localizationData = this.localization;
                return (localizationData && localizationData[key]) ? localizationData[key] : this.localizationDefault[key];
            },

            getPlayTimeResult(time) {
                return getPlayTime(time);
            },

            openTutorial() {
                this.showVideoTutorial = true;

                // Opening modal
                this.$modal.show({
                    focusEl: '.a-closeX',
                    id: 'l2e-video-tuto',
                    margin: '0',
                    width: '640px'
                });

                if(this.showVideoTutorial) {
                    // Call melaPlayer
                    if(this.$refs.lteVideoPlayerCart) this.$refs.lteVideoPlayerCart.callPlayer();

                    this.$modal.$on.shown(() => {
                        if(this.$refs.lteVideoPlayerCart) this.$refs.lteVideoPlayerCart.createPlayer();
                    });

                    this.$modal.$on.hidden(() => {
                        this.showVideoTutorial = false;
                        if(window.vueMelaPlayer) window.vueMelaPlayer.DestroyVideo();
                    });
                }
            },

            seeMoreVideos() {
                this.updateL2eVideoCart();
            },

            setEventBus() {
                eventBus.$on('updateLsd', () => this.refreshData());
            }
        }
    };
</script>

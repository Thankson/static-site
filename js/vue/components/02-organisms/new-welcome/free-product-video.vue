<template>
    <div class="o-freeProductVideoBanner">
        <div class="o-freeProductVideoBanner__contentWrapper">
            <div
                :class="['o-freeProductVideoBanner__content', watchedVideoSize]"
                :style="backgroundImages"
            >
                <div
                    :class="[
                        'o-freeProductVideoBanner__videoContainer',
                        watchedVideoSize
                    ]"
                >
                    <!-- added && to props to prevent rendering issues -->
                    <o-video-modal-card
                        v-if="videoComp"
                        ref="video"
                        card-size="-auto"
                        :hide-extra-content="true"
                        :title="videoTitle"
                        :video-data="videoComp.VirtualVideo"
                        :localization="videoLocalization"
                        :is-watched="isWatchedLocal"
                        :prevent-seek="videoComp.VirtualVideo.PreventSeek"
                        :allow-seek="videoComp.VirtualVideo.AllowSeek"
                        :has-reset="
                            videoComp &&
                                videoComp.VirtualVideo &&
                                videoComp.VirtualVideo.HasReset
                        "
                        :is-new="
                            videoComp &&
                                videoComp.VirtualVideo &&
                                videoComp.VirtualVideo.IsNew
                        "
                        :is-cn="false"
                        :is-welcome-video="true"
                        @videoWatched="handleVideoWatchedStatus"
                    />
                </div>
                <div class="o-freeProductVideoBanner__text">
                    <div
                        class="o-freeProductVideoBanner__heading"
                        v-html="headingText"
                    />
                    <div
                        class="o-freeProductVideoBanner__subheading"
                        v-html="subheadingText"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import api from '@api/routes/welcome/watched';
    import { mapActions, mapGetters, mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OFreeProductVideoBanner',
        mixins: [isDesktop, localizationMixin],
        props: {
            allowSeek: {
                type: Boolean,
                default: false
            },
            isWelcomeVideo: {
                type: Boolean,
                default: true
            },
            preventSeek: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                videoTitle: this.getLocalizationProp('Data.Video.Title'),
                isWatchedLocal: false
            };
        },
        computed: {
            ...mapGetters('welcome', ['onShowVideoModal']),

            // Computes background image based on screen size
            backgroundImages() {
                let backgroundImageKey;
                if(this.isDesktop) {
                    backgroundImageKey = this.isWatchedLocal
                        ? 'Data.WatchedVideoContent.BackgroundImage.Url'
                        : 'Data.UnWatchedVideoContent.BackgroundImage.Url';
                } else {
                    backgroundImageKey = this.isWatchedLocal
                        ? 'Data.WatchedVideoContent.MobileBackgroundImage.Url'
                        : 'Data.UnWatchedVideoContent.MobileBackgroundImage.Url';
                }
                return `backgroundImage: url(${this.getLocalizationProp(backgroundImageKey)})`;
            },

            headingText() {
                return this.isWatchedLocal ? this.getLocalizationProp('Data.WatchedVideoContent.Title') : this.getLocalizationProp('Data.UnWatchedVideoContent.Title');
            },

            mediaItemName() {
                return this.getLocalizationProp('Data.Video.VirtualVideo.MediaItemName');
            },

            subheadingText() {
                return this.isWatchedLocal
                    ? this.getLocalizationProp('Data.WatchedVideoContent.Description')
                    : this.getLocalizationProp('Data.UnWatchedVideoContent.Description');
            },

            videoComp() {
                return this.getLocalizationProp('Data.Video');
            },

            videoLocalization() {
                return this.getLocalizationProp('Data');
            },
            // sets video size based on watched status
            watchedVideoSize() {
                return this.isWatchedLocal ? '-watched' : '';
            }
        },
        watch: {
            isWatchedLocal() {
                this.SET_HAS_WATCHED_VIDEO(this.isWatchedLocal);
            }
        },
        created() {
            this.onShowVideoModal(() => this.showVideoModal());
        },
        mounted() {
            this.SET_VIDEO_BANNER_MOUNTED(true);
            this.isWatchedLocal = this.getLocalizationProp('Data.Video.VirtualVideo.IsWatched', false);
        },
        methods: {
            ...mapMutations('welcome', ['SET_HAS_WATCHED_VIDEO', 'SET_VIDEO_BANNER_MOUNTED']),
            ...mapMutations('cart', ['SET_LOADING']),
            ...mapActions('cart', ['getData']),
            async handleVideoWatchedStatus(val) {
                this.isWatchedLocal = val.completed;

                // Make API call only if video has been watched
                if(this.isWatchedLocal) {
                    const response = await api.post({
                        mediaItemName: this.mediaItemName
                    });
                    if(response.success && response?.data?.Success) {
                        this.SET_LOADING(true);
                        await this.getData();
                        this.SET_LOADING(false);
                    } else {
                        console.error('Error in the Welcome Watched API call');
                    }
                }
            },
            showVideoModal() {
                this.$refs['video']?.openModal(null, true);
            }
        }
    };
</script>

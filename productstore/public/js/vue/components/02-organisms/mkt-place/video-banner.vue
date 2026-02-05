<template>
    <div
        v-if="(!isLoading && showComponent) || isPageEditor"
        class="o-mktVideoBanner"
    >
        <!-- Loading -->
        <div v-if="isLoading && serviceGroup && !isPageEditor" class="o-mktVideoBanner__loading">
            <a-loading-spinner :visible="true" />
        </div>

        <!-- Wrapper -->
        <div
            v-else
            class="o-mktVideoBanner__wrapper"
            :style="{backgroundColor: getLocalizationProp('Data.BackgroundColor'),
                     backgroundImage: `url(${getLocalizationProp('Data.BackgroundImage.Url')})`}"
        >
            <!-- Text Left -->
            <div
                v-if="!isTextRight || !isDesktop"
                class="o-mktVideoBanner__col">
                <m-mkt-video-banner-text
                    :localization="localization"
                />
            </div>

            <!-- L2E Video -->
            <div
                class="o-mktVideoBanner__col -video"
                :class="{'-textRight': isTextRight}"
            >
                <div v-if="!isLoaded && hasVideoData" class="o-mktVideoBanner__loading">
                    <a-loading-spinner :visible="true" size="sm" />
                </div>
                <!-- Note that video needs id only for L2E, not for regular videos -->
                <div class="o-mktVideoBanner__video">
                    <o-video-modal-card
                        v-if="isLoaded && hasVideoData"
                        :id="hasL2e ? videoComp.LearnToEarn.Metadata.MetadataItemId : null"
                        :amount-formatted="hasL2e ? videoComp.LearnToEarn.Metadata.FormattedLsdAmount : '0'"
                        :amount-value="hasL2e ? videoComp.LearnToEarn.Metadata.LsdAmount : 0"
                        card-size="-full -tagsLg"
                        :desc="videoComp.VirtualVideo.Description"
                        :has-reset="videoComp.VirtualVideo.HasReset"
                        :hide-extra-content="true"
                        :is-new="videoComp.VirtualVideo.IsNew"
                        :is-watched="isWatched"
                        :localization="localizationStore['Data']"
                        :lte="videoComp.LearnToEarn"
                        :quiz="hasL2e ? videoComp.LearnToEarn.Quiz : null"
                        :title="videoComp.VirtualVideo.Title"
                        :video-data="videoComp.VirtualVideo"
                        :video-item-id="videoComp.VirtualVideo.MediaId"
                        :prevent-seek="videoComp.VirtualVideo.PreventSeek || false"
                        :allow-seek="videoComp.VirtualVideo.AllowSeek || false"
                    >
                    </o-video-modal-card>
                </div>
            </div>

            <!-- Text Right -->
            <div
                v-if="isTextRight && isDesktop"
                class="o-mktVideoBanner__col">
                <m-mkt-video-banner-text
                    :localization="localization"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';
    import mktHelper from '@marketplace/source/js/vue/mixins/mkt-helper';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import eventBus from '../../../mixins/event-bus'; // Same event-bus from L2E feature

    export default {
        name: 'OMktVideoBanner',
        mixins: [
            localizationMixin,
            mktHelper,
            isDesktop
        ],
        data() {
            return {
                isLoaded: false,
                isWatchLocal: null
            };
        },
        computed: {
            ...mapState('lteVideos', ['isApiLabelsCalled']),

            hasL2e() {
                return this.videoComp.LearnToEarn?.Metadata?.MetadataItemId && this.videoComp.LearnToEarn?.Metadata?.FormattedLsdAmount && this.videoComp.LearnToEarn?.Metadata?.LsdAmount;
            },

            hasVideoData() {
                return this.videoComp && Object.keys(this.videoComp).length > 0;
            },

            localizationStore() {
                return this.$store?.state?.lteVideos?.localization;
            },

            isTextRight() {
                return this.getLocalizationProp('Data.IsTextRight', false);
            },

            isWatched() {
                return this.isWatchLocal || this.getLocalizationProp('Data.Video.VirtualVideo.IsWatched', false);
            },

            videoComp() {
                return this.getLocalizationProp('Data.Video');
            }
        },
        watch: {
            localizationStore(val) {
                if(val) this.isLoaded = true;
            }
        },
        mounted() {
            // Get L2E labels from API
            if(!this.isApiLabelsCalled && Object.keys(this.localizationStore).length === 0) this.fetchLocalization();

            this.setEventBus();
        },
        methods: {
            ...mapActions('lteVideos', ['fetchLocalization']),

            setEventBus() {
                eventBus.$on('lte-completion', (payload) => {
                    this.isWatchLocal = true;
                });
            }
        }
    };
</script>

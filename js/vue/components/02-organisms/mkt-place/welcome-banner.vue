<template>
    <div v-if="(!isLoading && showComponent) || isPageEditor" class="o-mktWelcomeBanner">
        <!-- BG -->
        <div
            class="o-mktWelcomeBanner__media -mobile"
            :style="{backgroundColor: getLocalizationProp('Data.BackgroundColor'),
                     backgroundImage: `url(${getLocalizationProp('Data.BackgroundImageMobile.Url')})`}"
        ></div>
        <div
            class="o-mktWelcomeBanner__media -desktop"
            :style="{backgroundColor: getLocalizationProp('Data.BackgroundColor'),
                     backgroundImage: `url(${getLocalizationProp('Data.BackgroundImageDesktop.Url')})`}"
        ></div>

        <div class="o-mktWelcomeBanner__wrapper">
            <!-- Title -->
            <div
                v-if="getLocalizationProp('Data.Title')"
                class="o-mktWelcomeBanner__title"
                v-html="getLocalizationProp('Data.Title')"
            ></div>

            <!-- Subtitle -->
            <div
                v-if=" getLocalizationProp('Data.Subtitle')"
                class="o-mktWelcomeBanner__subtitle"
                v-html=" getLocalizationProp('Data.Subtitle')"
            ></div>

            <!-- Description -->
            <div
                v-if="getLocalizationProp('Data.Description')"
                class="o-mktWelcomeBanner__desc"
                v-html="getLocalizationProp('Data.Description')"
            ></div>

            <!-- Video L2E -->
            <div v-if="hasVideo" class="o-mktWelcomeBanner__video">
                <o-video-modal-card
                    v-if="isLoaded"
                    :id="hasL2e ? videoComp.LearnToEarn.Metadata.MetadataItemId : '0'"
                    :amount-formatted="hasL2e ? videoComp.LearnToEarn.Metadata.FormattedLsdAmount : '0'"
                    :amount-value="hasL2e ? videoComp.LearnToEarn.Metadata.LsdAmount : 0"
                    card-size="-lp -mkt"
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
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';
    import mktHelper from '@marketplace/source/js/vue/mixins/mkt-helper';
    import eventBus from '../../../mixins/event-bus'; // Event-bus L2E

    export default {
        name: 'OWelcomeBanner',
        mixins: [
            localizationMixin,
            mktHelper
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

            localizationStore() {
                return this.$store?.state?.lteVideos?.localization;
            },

            isWatched() {
                return this.isWatchLocal || this.getLocalizationProp('Data.Video.VirtualVideo.IsWatched', false);
            },

            videoComp() {
                return this.getLocalizationProp('Data.Video');
            },
            hasVideo() {
                return Object.keys(this.getLocalizationProp('Data.Video')).length > 0;
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

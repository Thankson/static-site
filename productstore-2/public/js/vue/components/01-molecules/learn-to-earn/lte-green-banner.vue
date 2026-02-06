<template>
    <div v-if="isAnyIntroVideoWatched" class="m-LTEGreenBanner">
        <a
            v-if="isAllIntroVideosWatched"
            :href="getLocalizationProp('Labels.Watch.Url')"
            class="m-LTEGreenBanner__cta"
            :class="{'-withIcon': getLocalizationProp('Labels.Watch.Icon')}"
            :style="`background-color:${getLocalizationProp('Labels.Watch.BackgroundColor')}; color:${getLocalizationProp('Labels.Watch.TextColor')}`"
        >
            <span role="text" class="m-LTEGreenBanner__title">
                <span
                    v-show="getLocalizationProp('Labels.Watch.Icon')"
                    class="material-icons m-LTEGreenBanner__icon"
                >
                    {{ getLocalizationProp('Labels.Watch.Icon') }}
                </span>
                <span
                    class="m-LTEGreenBanner__text"
                    v-html="getLocalizationProp('Labels.Watch.Title')"
                ></span>
            </span>
        </a>
        <o-video-modal-button
            v-else
            :id="getLocalizationProp('Data.Video.LearnToEarn.Metadata.MetadataItemId')"
            :localization="getLocalization"
            :video-data="getLocalizationProp('Data.Video.VirtualVideo')"
        >
            <span
                role="text"
                class="m-LTEGreenBanner__cta"
                :class="{'-withIcon': getLocalizationProp('Labels.Rewatch.Icon')}"
                :style="`background-color:${getLocalizationProp('Labels.Rewatch.BackgroundColor')}; color:${getLocalizationProp('Labels.Rewatch.TextColor')}`"
            >
                <span
                    v-show="getLocalizationProp('Labels.Rewatch.Icon')"
                    class="material-icons m-LTEGreenBanner__icon"
                >
                    {{ getLocalizationProp('Labels.Rewatch.Icon') }}
                </span>
                <span
                    class="m-LTEGreenBanner__text"
                    v-html="getLocalizationProp('Labels.Rewatch.Title')"
                ></span>
            </span>
        </o-video-modal-button>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState, mapGetters } from 'vuex';

    export default {
        name: 'MLteGreenBanner',
        mixins: [ localizationMixin ],
        computed: {
            ...mapState('lteVideos', ['storedVideosList', 'introVideosList']),
            ...mapGetters('lteVideos', ['getLocalization']),
            isAnyIntroVideoWatched: function () {
                return this.introVideosList.length > 0 && this.introVideosList.some(video => video.VirtualVideo.IsWatched);
            },
            isAllIntroVideosWatched: function () {
                return this.introVideosList.every(video => video.VirtualVideo.IsWatched);
            }
        },
        mounted() {
            const variation = this.getLocalizationProp('Data.BannerVariation');
            if(!this.introVideosList.length) this.getData({greenBanner: variation});
        },
        methods: {
            ...mapActions('lteVideos', ['getData'])
        }

    };
</script>

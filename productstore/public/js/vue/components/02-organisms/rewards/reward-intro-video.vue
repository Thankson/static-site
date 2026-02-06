<template>
    <div class="o-rewardMod -introVideo">
        <m-reward-container
            ref="introVideo"
            :title="getLocalizationProp('Data.Headline', 'Additional Info')"
            :subtitle="getLocalizationProp('Data.SubHeadLine', 'Watch into video')">
            <template v-if="getLocalizationProp('Data.AdditionalContent')" v-slot:content>
                <div v-html="getLocalizationProp('Data.AdditionalContent')"></div>
            </template>
            <template v-if="getLocalizationProp('Data.Image.Url')" v-slot:image>
                <img
                    class="w-full h-full"
                    :class="mobileImg && mobileImg.Url ? 'o-rewardMod__img m-rewards__img': 'm-rewards__img'"
                    :src="getLocalizationProp('Data.Image.Url', '')"
                    :alt="getLocalizationProp('Data.Image.Alt', '')" />
                <img
                    v-if="mobileImg && mobileImg.Url"
                    class="o-rewardMod__mImg m-rewards__img"
                    :src="getLocalizationProp('Data.MobileImage.Url', '')"
                    :alt="getLocalizationProp('Data.MobileImage.Alt', '')" />
                <o-video-modal-button
                    v-if="videoData"
                    :id="videoData.VirtualVideo.MediaId"
                    class="absolute bottom-5 right-5"
                    :localization="videoData"
                    :video-data="videoData.VirtualVideo"
                    :has-reset="videoData.VirtualVideo.HasReset "
                    :is-watched="videoData.VirtualVideo.IsWatched"
                    @videoWatched="registerVideoAsWatched">
                    <div v-if="videoData.VirtualVideo.RuntimeSeconds" class="pl-15">
                        <span class="sr-only">
                            {{ videoRunTimeLabel }}
                        </span>
                        <div class="a-runTime -play relative bottom-0 right-0" aria-hidden="true">
                            <span class="a-runTime__num">{{ getPlayTime(videoData.VirtualVideo.RuntimeSeconds) }}</span>
                        </div>
                    </div>
                </o-video-modal-button>
            </template>
        </m-reward-container>
    </div>
</template>

<script>
    import { mapMutations, mapState } from 'vuex';
    import videoWatchApi from '@api/routes/welcome/watched';
    import getPlayTime from '../../../utils/get-play-time';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ORewardIntroVideo',
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        computed: {
            ...mapState('rewards', ['isIntroVideoWatched']),
            mobileImg() {
                return this.localization?.Data?.MobileImage;
            },
            videoData() {
                return this.localization?.Data?.Video;
            }
        },
        mounted() {
            if(!this.localization?.Data?.IsIntroVideoBannerPrioritized) {
                this.SET_INTRO_VIDEO_AS_WATCHED(true);
            }
        },
        methods: {
            ...mapMutations('rewards', ['SET_INTRO_VIDEO_AS_WATCHED']),
            async registerVideoAsWatched(val) {
                if(val) {
                    const response = await videoWatchApi.post({
                        mediaItemName: this.videoData?.VirtualVideo?.MediaItemName
                    });
                    if(!response.success || !response?.data?.Success) {
                        console.error('Error in regitering video as watched');
                    }
                }
            },
            videoRunTimeLabel() {
                return `${this.getLocalizationProp('Labels.PlayTime', 'Play')} : ${this.getPlayTime(this.videoData.VirtualVideo.RuntimeSeconds)}`;
            },
            getPlayTime
        }
    };
</script>

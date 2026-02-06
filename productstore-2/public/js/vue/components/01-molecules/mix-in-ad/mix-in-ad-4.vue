<template>
    <mix-in-ad-base v-bind="$props">
        <template
            v-if="context.Data.LogoImage && context.Data.LogoImage.Url"
            v-slot:logo-image>

            <img
                class="m-mixinAd__img"
                :src="context.Data.LogoImage.Url"
                :alt="context.Data.LogoImage.Alt" />
        </template>

        <template
            v-if="context.Data.CardImage && context.Data.CardImage.Url"
            v-slot:main-product-image>

            <img
                :src="context.Data.CardImage.Url"
                :alt="context.Data.CardImage.Alt" />
        </template>

        <template
            v-if="context.Data.SitecoreVideo.VirtualVideo && context.Data.SitecoreVideo.VirtualVideo.MediaId"
            v-slot:video-button>

            <o-video-modal-button
                :id="idComp"
                :localization="labels"
                :video-data="videoData || {}"
                :lte="lteData || {}"
                :has-reset="mixHasReset"
                :is-watched="mixIsWatched">

                <span
                    class="a-playCircle material-icons items-start justify-center"
                    :class="context.Data.VideoIconStyle">

                    {{ context.Data.VideoIcon }}
                </span>

                <p v-html="context.Data.WatchVideoText" />
            </o-video-modal-button>
        </template>
    </mix-in-ad-base>
</template>

<script>
    import mixInAdBase, { baseProps } from './mix-in-ad-base.vue';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'MMixInAd4',
        components: {
            mixInAdBase
        },
        props: {
            ...baseProps
        },
        data() {
            return {
                mixIsWatched: false,
                mixHasReset: false
            };
        },
        computed: {
            idComp() {
                return this.context.Id || this.videoData?.MediaId;
            },
            labels() {
                return this.context.Labels;
            },
            lteData() {
                return this.context.Data?.SitecoreVideo?.LearnToEarn;
            },
            videoData() {
                const video = {
                    Culture: this.context.Data?.SitecoreVideo?.VirtualVideo?.Culture,
                    Dash: this.context.Data?.SitecoreVideo?.VirtualVideo?.Dash,
                    Description: this.context.Data?.SitecoreVideo?.VirtualVideo?.Description,
                    HasReset: this.context.Data?.SitecoreVideo?.VirtualVideo?.HasReset,
                    Hls: this.context.Data?.SitecoreVideo?.VirtualVideo?.Hls,
                    ImageUrl: this.context.Data?.SitecoreVideo?.VirtualVideo?.ImageUrl,
                    IsNew: this.context.Data?.SitecoreVideo?.VirtualVideo?.IsNew,
                    IsWatched: this.context.Data?.SitecoreVideo?.VirtualVideo?.IsWatched,
                    MediaId: this.context.Data?.SitecoreVideo?.VirtualVideo?.MediaId,
                    MediaItemName: this.context.Data?.SitecoreVideo?.VirtualVideo?.MediaItemName,
                    Progressive1080: this.context.Data?.SitecoreVideo?.VirtualVideo?.Progressive1080,
                    Progressive144: this.context.Data?.SitecoreVideo?.VirtualVideo?.Progressive144,
                    Progressive270: this.context.Data?.SitecoreVideo?.VirtualVideo?.Progressive270,
                    Progressive360: this.context.Data?.SitecoreVideo?.VirtualVideo?.Progressive360,
                    Progressive720: this.context.Data?.SitecoreVideo?.VirtualVideo?.Progressive720,
                    RuntimeSeconds: this.context.Data?.SitecoreVideo?.VirtualVideo?.RuntimeSeconds,
                    SubtitlePath: this.context.Data?.SitecoreVideo?.VirtualVideo?.SubtitlePath,
                    ThumbnailImageUrl: this.context.Data?.SitecoreVideo?.VirtualVideo?.ThumbnailImageUrl,
                    Title: this.context.Data?.SitecoreVideo?.VirtualVideo?.Title,
                    VideoFolderPath: this.context.Data?.SitecoreVideo?.VirtualVideo?.VideoFolderPath
                };
                return video;
            }
        },
        mounted() {
            this.mixIsWatched = this.videoData.IsWatched;
            this.mixHasReset = this.videoData.HasReset;

            this.setEventBus();
        },
        methods: {
            setEventBus() {
                eventBus.$on('lte-completion', (payload) => {
                    if(this.idComp === payload) {
                        this.mixIsWatched = true;
                        this.mixHasReset = false;
                    }
                });
            }
        }
    };
</script>

<template>
    <modal width="630px">

        <template v-slot:before>
            <div class="mb-10">
                <img
                    v-if="showImg"
                    class="w-full"
                    :src="getLocalizationProp('Data.Image.Url')"
                    :alt="getLocalizationProp('Data.Image.Alt')"
                >
                <o-video-inline
                    v-else
                    :id="getLocalizationProp('Data.Video.VirtualVideo.MediaId')"
                    :big-image="getLocalizationProp('Data.Video.VirtualVideo.ImageUrl')"
                    big-image-alt=""
                    :desc="getLocalizationProp('Data.Video.VirtualVideo.Description')"
                    :has-reset="false"
                    :is-new="true"
                    :is-watched="false"
                    mod-class="-aspectRatioPadding"
                    :title="getLocalizationProp('Data.Video.VirtualVideo.Title', {})"
                    :video-data="videoDataComp"
                    :prevent-seek="false"
                ></o-video-inline>
            </div>
        </template>

        <template v-slot:heading>
            <span class="text-4xl md:text-5xl text-gray-150">{{ getLocalizationProp('Data.Heading') }}</span>
        </template>

        <template v-slot:body>
            <div v-html="getLocalizationProp('Data.RTE')"></div>
        </template>

        <template v-slot:footer>
            <a class="a-button -modal" :href="getLocalizationProp('Data.ReferAFriendLink.Url')">{{ getLocalizationProp('Data.ReferAFriendLink.Text') }}</a>
        </template>

    </modal>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'OReferAFriendAB',
        mixins: [ localizationMixin ],
        computed: {
            videoDataComp() {
                return this.getLocalizationProp('Data.Video.VirtualVideo') || {};
            },
            showImg() {
                if(this.localization?.Data?.Image?.Url) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        mounted() {
            this.urlParams = new URLSearchParams(window.location.search);
            if(this.urlParams.has('showorderfeedback')) {
                this.$modal.show();
            }
        }

    };
</script>

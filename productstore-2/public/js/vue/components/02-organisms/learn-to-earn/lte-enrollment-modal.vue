<template>
    <div class="o-lteEnrollmentModal">

        <modal-content
            class="o-lteEnrollmentModal__content"
            :class="{hidden: !hideVideo}"
            width="540px"
            heading-class="o-lteEnrollmentModal__heading">

            <template v-slot:heading>
                {{ getLocalizationProp('Labels.Heading') }}
            </template>

            <template v-slot:body>
                <p class="o-lteEnrollmentModal__subtitle" v-html="getLocalizationProp('Labels.Subtitle')"></p>
                <a-loading-spinner :visible="!getLocalizationProp('Data')" size="sm" />
                <div v-if="getLocalizationProp('Data')" class="o-lteEnrollmentModal__cta">

                    <button class="o-lteEnrollmentModal__imageBtn relative" @click="[showVideo(), gtmTrackAction({id: 407}, $event)]">
                        <img
                            v-if="getLocalizationProp('Data.Video') && getLocalizationProp('Data.Video.VirtualVideo.ThumbnailImageUrl')"
                            :src="getLocalizationProp('Data.Video.VirtualVideo.ThumbnailImageUrl')"
                            :alt="getLocalizationProp('Data.Video.VirtualVideo.ThumbnailImageAlt')"
                            class="o-lteEnrollmentModal__img"
                        >
                        <img
                            v-else
                            :src="thumbImgDefault"
                            alt=""
                            class="o-lteEnrollmentModal__img"
                        >
                        <!-- Play time -->
                        <span v-if="setPlayTime" class="sr-only">
                            {{ getLocalizationProp('Labels.PlayTime') }} : {{ getPlayTimeResult(setPlayTime) }}
                        </span>
                        <div v-if="setPlayTime" class="a-runTime -play" aria-hidden="true">
                            <span class="a-runTime__num">{{ getPlayTimeResult(setPlayTime) }}</span>
                        </div>
                        <span class="sr-only">{{ getLocalizationProp('Labels.ClickToWatch') }}</span>
                    </button>
                    <button
                        class="a-button -reactivation mt-20 md:mt-0 md:ml-40"
                        type="button"
                        :aria-label="getLocalizationProp('Labels.ButtonAriaLabel')"
                        @click="[showVideo(), gtmTrackAction({id: 407}, $event)]"
                    >
                        {{ getLocalizationProp('Labels.ButtonText') }}
                    </button>
                </div>

            </template>
        </modal-content>
        <!-- Video -->
        <div class="o-lteEnrollmentModal__wrapper -video" :class="{hidden: hideVideo}">
            <m-vid-player
                v-if="getLocalizationProp('Data.Video')"
                :video-data="getLocalizationProp('Data.Video.VirtualVideo')"
                :prevent-seek="getLocalizationProp('Data.Video.PreventSeek', '')">
            </m-vid-player>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import getPlayTime from '../../../utils/get-play-time';

    export default {
        name: 'OLteEnrollmentModal',
        mixins: [ localizationMixin ],
        props: {
            thumbImgDefault: {
                type: String,
                default: 'https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg'
            }
        },
        data() {
            return {
                hideVideo: true
            };
        },
        computed: {
            setPlayTime() {
                return (this.getLocalizationProp('Data.Video') &&
                    this.getLocalizationProp('Data.Video.VirtualVideo') &&
                    this.getLocalizationProp('Data.Video.VirtualVideo.RuntimeSeconds'))
                    ? this.getLocalizationProp('Data.Video.VirtualVideo.RuntimeSeconds') : '';
            }
        },
        mounted() {
            // needs to call the melaplayer JS
            if(window.refreshMelaPlayer) {
                window.refreshMelaPlayer();
            }
        },
        methods: {
            getPlayTimeResult(time) {
                return getPlayTime(time);
            },
            showVideo: function() {
                this.hideVideo = false;
                this.$modal.config({
                    id: this.getLocalizationProp('Labels.ModalId'),
                    width: '640px'
                });
                jwplayer().play(); // eslint-disable-line
                // window.refreshMelaPlayer();
                this.$modal.$on.hidden(() => {
                    if(jwplayer) { // eslint-disable-line
                       jwplayer().stop(); // eslint-disable-line
                    }
                });
            }
        }
    };
</script>

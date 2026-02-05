<template>
    <div class="o-guestShoppingWelcomeVideo">

        <div v-show="showEndScreen" class="o-guestShoppingWelcomeVideo__endScreen">
            <!-- CTA Desktop -->
            <a
                v-if="ckeckCta && isDesktop"
                ref="guestShoopingCtaDektop"
                class="o-guestShoppingWelcomeVideo__cta -desktop"
                :href="getLocalizationProp('Data.Cta.Url')"
            >
                {{ getLocalizationProp('Data.Cta.Text', 'Become a member') }}
            </a>
            <div class="o-guestShoppingWelcomeVideo__inner">
                <!-- Replay Button -->
                <button
                    class="o-guestShoppingWelcomeVideo__reload"
                    :aria-label="getLocalizationProp('Labels.ReplayVideo', 'Replay the video')"
                    @click="replayVideo">
                    replay
                </button>

                <!-- Big image -->
                <img
                    :src="getLocalizationProp('Data.BigImage.Url')"
                    :alt="getLocalizationProp('Data.BigImage.Alt')"
                    class="o-guestShoppingWelcomeVideo__img noLazy"
                >
            </div>

            <!-- CTA Mobile -->
            <a
                v-if="ckeckCta && !isDesktop"
                ref="guestShoopingCta"
                class="o-guestShoppingWelcomeVideo__cta"
                :href="getLocalizationProp('Data.Cta.Url')"
            >
                {{ getLocalizationProp('Data.Cta.Text', 'Become a member') }}
            </a>
        </div>

        <!-- Video -->
        <div v-show="!showEndScreen" class="o-guestShoppingWelcomeVideo__video">
            <o-video-inline
                :id="getLocalizationProp('Data.Video.VirtualVideo.MediaId')"
                ref="videoInline"
                :big-image="getLocalizationProp('Data.BigImage.Url')"
                :big-image-alt="getLocalizationProp('Data.BigImage.Alt')"
                :localization="getLocalizationProp('Labels') || {}"
                :video-data="getLocalizationProp('Data.Video.VirtualVideo') || {}"
                :prevent-seek="getLocalizationProp('Data.Video.VirtualVideo.PreventSeek')"
                :no-hover="getLocalizationProp('Data.NoHover')"
                :no-tags="getLocalizationProp('Data.NoTags')"
            ></o-video-inline>
        </div>

    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import eventBus from '../../../mixins/event-bus';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    export default {
        name: 'OGuestShoppingWelcomeVideo',
        mixins: [
            isDesktop,
            localizationMixin
        ],
        data() {
            return {
                showEndScreen: false
            };
        },
        computed: {
            ckeckCta() {
                return this.localization?.Data?.Cta?.Text && this.localization?.Data?.Cta?.Url;
            }
        },
        mounted () {
            this.setEventBus();
        },
        methods: {
            setEventBus() {
                eventBus.$on('video-completed', () => {
                    this.showEndScreen = true;
                    this.$nextTick(() => {
                        if(this.$refs?.guestShoopingCta) this.$refs.guestShoopingCta.focus();
                        if(this.$refs?.guestShoopingCtaDektop) this.$refs.guestShoopingCtaDektop.focus();
                    });
                });
            },
            replayVideo() {
                this.showEndScreen = false;
                window.vueMelaPlayer.Player.play();
                this.$nextTick(() => {
                    if(this.$refs?.videoInline) this.$refs.videoInline.closeVideoFocus();
                });
            }
        }
    };
</script>

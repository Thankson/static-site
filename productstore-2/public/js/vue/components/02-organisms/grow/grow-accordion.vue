<template>
    <div class="o-growAccordion mb-20 p-10 border border-gray-50 md:py-30 md:px-30" :style="backgroundColorStyle">
        <div class="md:flex">
            <div v-if="hasImage" class="flex justify-center mb-12 md:block md:mb-0">
                <img
                    v-if="!hasVideo"
                    class="md:max-w-200"
                    :src="getLocalizationProp('Data.Image.Url')"
                    :alt="getLocalizationProp('Data.Image.Alt')"
                />
                <o-video-modal-button
                    v-if="hasVideo"
                    :id="getLocalizationProp('Data.Video.Id')"
                    class="relative"
                    :localization="getLocalizationProp('Labels.Video')"
                    :video-data="getLocalizationProp('Data.Video.VirtualVideo')"
                    data-testid="button-growAccordionVideoModalImage"
                >
                    <img
                        class="md:max-w-200"
                        :src="getLocalizationProp('Data.Image.Url')"
                        :alt="getLocalizationProp('Data.Image.Alt')"
                    />
                    <div
                        class="absolute z-1"
                        :class="[
                            playIconPosition === 'bottom-right' && 'bottom-10 right-10',
                            playIconPosition === 'bottom-left' && 'bottom-10 left-10',
                            playIconPosition === 'top-left' && 'top-10 left-10',
                            playIconPosition === 'top-right' && 'top-10 right-10',
                            playIconPosition === 'center' && 'flex justify-center items-center w-full h-full top-0'
                        ]"
                    >
                        <span
                            class="a-playCircle -xl material-icons"
                            :class="[getLocalizationProp('Data.Video.PlayIcon.Color')]"
                        >
                            play_circle_outline
                        </span>
                    </div>
                </o-video-modal-button>
            </div>
            <div class="w-full" :class="{'md:pl-40': hasImage}">
                <div class="relative md:pr-36">
                    <h2 class="mb-10 font-medium text-xl leading-tight md:text-3xl-2">
                        {{ getLocalizationProp('Labels.Heading') }}
                    </h2>
                    <div v-html="getLocalizationProp('Labels.Subheading')" />
                    <div v-if="hasBodyContent" class="absolute hidden bottom-0 -right-10 leading-base md:block">
                        <ChevronButton
                            arrow-mods="text-3xl-2"
                            :is-inverted="isCollapseOpen"
                            data-testid="button-growAccordionChevronDesktop"
                            @click="isCollapseOpen = !isCollapseOpen"
                        />
                    </div>
                </div>
                <button
                    v-if="showCtaButton"
                    v-show="!isCollapseOpen"
                    class="a-button mt-15 py-10 px-16 text-xs leading-base md:text-sm"
                    data-testid="button-growAccordionExpand"
                    @click="isCollapseOpen = !isCollapseOpen"
                >
                    {{ getLocalizationProp('Labels.ButtonText') }}
                </button>
                <template v-if="hasCta">
                    <o-video-modal-button
                        v-if="hasVideo"
                        :id="getLocalizationProp('Data.Video.Id')"
                        class="mt-15"
                        :localization="getLocalizationProp('Labels.Video')"
                        :video-data="getLocalizationProp('Data.Video.VirtualVideo')"
                        data-testid="button-growAccordionVideoModalCta"
                    >
                        <div class="a-button py-10 px-16 text-xs leading-base md:text-sm">
                            {{ getLocalizationProp('Labels.ButtonText') }}
                        </div>
                    </o-video-modal-button>
                    <o-video-modal-button
                        v-else-if="hasAudio && !hasVideo"
                        :id="getLocalizationProp('Data.Audio.MediaId')"
                        class="mt-15"
                        :localization="localization"
                        :video-data="audioAsVideoData"
                        data-testid="button-growAccordionAudioModalCta"
                    >
                        <div class="a-button py-10 px-16 text-xs leading-base md:text-sm flex items-center">
                            {{ getLocalizationProp('Labels.ButtonText') }}
                        </div>
                    </o-video-modal-button>
                </template>
                <transition
                    name="-expand"
                    @enter="handelEnter"
                    @afterEnter="resetHeight"
                    @leave="handleLeave"
                    @afterLeave="resetHeight"
                >
                    <div
                        v-show="isCollapseOpen"
                        ref="collapseWrapper"
                        class="o-accordion__content"
                    >
                        <div class="py-10" v-html="getLocalizationProp('Labels.Body')" />
                        <slot />
                        <button
                            v-if="hasCloseButton"
                            class="a-button mt-10 py-10 px-16 text-xs leading-base md:text-sm"
                            @click="isCollapseOpen = false"
                        >
                            {{ getLocalizationProp('Labels.CloseButtonText') }}
                        </button>
                    </div>
                </transition>
                <div v-if="hasBodyContent" class="flex justify-end md:hidden">
                    <ChevronButton
                        arrow-mods="text-3xl-2"
                        :is-inverted="isCollapseOpen"
                        data-testid="button-growAccordionChevronMobile"
                        @click="isCollapseOpen = !isCollapseOpen"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { reflow } from '@common/source/js/utils/dom';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import ChevronButton from '@productstore/source/js/vue/components/00-atoms/buttons/chevron-button.vue';

    export default {
        name: 'OGrowAccordion',
        components: { ChevronButton },
        mixins: [ localizationMixin ],
        data() {
            return {
                isCollapseOpen: false
            };
        },
        computed: {
            hasCloseButton() {
                return this.localization?.Labels?.CloseButtonText;
            },
            hasCta() {
                return this.localization?.Labels?.ButtonText;
            },
            hasImage() {
                return this.localization?.Data?.Image;
            },
            hasVideo() {
                const video = this.localization?.Data?.Video;
                if(!video) return false;
                return ['Progressive1080', 'Progressive144', 'Progressive270', 'Progressive360', 'Progressive720']
                    .some(key => !!video.VirtualVideo[key]);
            },
            hasAudio() {
                return this.localization?.Data?.Audio?.IsAudio;
            },
            playIconPosition() {
                return this.localization?.Data?.Video?.PlayIcon?.Position || 'bottom-right';
            },
            hasBodyContent() {
                const bodyContent = this.getLocalizationProp('Labels.Body');
                return bodyContent && bodyContent.trim().length > 0;
            },
            showCtaButton() {
                return this.hasCta && !this.hasVideo && !this.hasAudio;
            },
            backgroundColorStyle() {
                return {
                    backgroundColor: this.getLocalizationProp('Data.BackgroundColor') || '#ffffff'
                };
            },
            // Prepare audio data in the format expected by the video modal
            audioAsVideoData() {
                if(!this.hasAudio) return {};
                // Get the audio data directly from the localization object
                const audioData = this.localization?.Data?.Audio || {};
                return {
                    ImageUrl: audioData.ImageUrl || '',
                    MediaId: audioData.MediaId || '',
                    Title: audioData.Title || '',
                    ThumbnailImageUrl: audioData.ThumbnailImageUrl || '',
                    // Set IsAudio flag to true for audio playback
                    IsAudio: true,
                    // Audio specific properties
                    AudioPath: audioData.AudioPath || '',
                    Mp3: audioData.Fallbacks?.mp3 || '',
                    Aac: audioData.Fallbacks?.aac || '',
                    Ogg: audioData.Fallbacks?.ogg || ''
                };
            }
        },
        methods: {
            handelEnter(el) {
                el.style.height = `${el.scrollHeight}px`;
            },
            handleLeave(el) {
                el.style.height = `${el.clientHeight}px`;
                reflow(el);
                el.style.height = '0px';
            },
            resetHeight() {
                const el = this.$refs['collapseWrapper'];
                if(el && el.style) el.style.height = null;
            }
        }
    };
</script>

<template>
    <div class="o-rewardMod -welcomeGift">
        <m-reward-container
            ref="welcome-gift"
            :title="getLocalizationProp('Data.Headline', 'Welcome Gifts')"
            :subtitle="getLocalizationProp('Data.SubHeadLine', 'Earn and spend like cash')">
            <template v-slot:content>
                <div v-if="!hideCheckboxes" class="o-rewardMod__circles">
                    <a-reward-circle
                        v-for="index in rewardSlots"
                        ref="reward-circles"
                        :key="`${index}-reward-circles`"
                        :is-filled="isFilled(index)"
                    />
                </div>
                <ul>
                    <m-reward-list-item
                        v-for="listItem in rewardsList"
                        :id="listItem.Description"
                        :key="listItem.Heading"
                        :cta-link="listItem.CTA && listItem.CTA.Url"
                        :cta-label="listItem.CTA && listItem.CTA.Url ? listItem.CTA.Text : getLocalizationProp('Labels.More', 'More')"
                        cta-mods="-white uppercase"
                        :icon-alt="listItem.Logo && listItem.Logo.Alt"
                        :icon-url="listItem.Logo && listItem.Logo.Url"
                        root-element="li"
                        @click="moreClicked(listItem.Modal)"
                    >
                        <h3
                            class="m-rewardListItem__label"
                            v-html="listItem.Heading"
                        />
                        <p
                            class="m-rewardListItem__label text-xs italic text-gray"
                            v-html="listItem.SubHeading"
                        />
                        <template v-if="listItem.Video" v-slot:cta>
                            <div class="pl-15">
                                <o-video-modal-button
                                    v-if="listItem.Video !== null"
                                    :id="listItem.Video.LearnToEarn ? listItem.Video.LearnToEarn.Metadata.MetadataItemId : listItem.Video.VirtualVideo.MediaId"
                                    :localization="listItem.Video"
                                    :video-data="listItem.Video.VirtualVideo"
                                    :lte="listItem.Video.LearnToEarn || {}"
                                    :video-item-id="listItem.VideoItemId"
                                    :has-reset="listItem.Video.VirtualVideo.HasReset"
                                    :is-new="listItem.Video.VirtualVideo.IsNew"
                                    :is-watched="listItem.Video.VirtualVideo.IsWatched"
                                    :prevent-seek="listItem.Video.VirtualVideo.PreventSeek"
                                    :allow-seek="listItem.Video.VirtualVideo.AllowSeek"
                                >
                                    <div v-if="listItem.Video.VirtualVideo && listItem.Video.VirtualVideo.RuntimeSeconds" class="pl-15">
                                        <span class="sr-only">
                                            {{ getLocalizationProp('Labels.PlayTime', 'Play Time') }} : {{ getPlayTime(listItem.Video.VirtualVideo.RuntimeSeconds) }}
                                        </span>
                                        <div class="a-runTime -play relative bottom-0 right-0" aria-hidden="true">
                                            <span class="a-runTime__num">{{ getPlayTime(listItem.Video.VirtualVideo.RuntimeSeconds) }}</span>
                                        </div>
                                    </div>
                                </o-video-modal-button>
                            </div>
                        </template>
                    </m-reward-list-item>
                </ul>
            </template>
            <template v-if="getLocalizationProp('Data.Image.Url')" v-slot:image>
                <img
                    class="o-rewardMod__img m-rewards__img"
                    :src="getLocalizationProp('Data.Image.Url', '')"
                    :alt="getLocalizationProp('Data.Img.Alt', '')" />

                <img
                    class="o-rewardMod__mImg m-rewards__img"
                    :src="getLocalizationProp('Data.MobileImage.Url', '')"
                    :alt="getLocalizationProp('Data.MobileImg.Alt', '')" />
            </template>
        </m-reward-container>
        <modal id="reward-welcome-gift" alignment="bottom" width="440px">
            <template #content>
                <div class="o-rewardMod__modal">
                    <perfect-scrollbar class="o-rewardMod__ps pr-20">
                        <div v-html="modalBody"></div>
                    </perfect-scrollbar>
                </div>
                <div>
                    <button v-modal-hide class="a-button -outline -hemisphere font-medium px-15 py-10 leading-tight">{{ getLocalizationProp('Labels.Close', 'Close') }}</button>
                    <a
                        v-if="modalLink.Url && modalLink.Text"
                        class="a-button -hemisphere font-medium px-15 py-10 leading-tight ml-7"
                        :href="modalLink.Url"
                        :target="modalLink.Target">
                        {{ modalLink.Text }}
                    </a>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import aRewardCircle from '../../00-atoms/reward/reward-circle.vue';
    import getPlayTime from '../../../utils/get-play-time';
    import { mapState } from 'vuex';

    export default {
        name: 'ORewardWelcomeGiftTracker',
        components: {
            aRewardCircle
        },
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                modalBody: '',
                modalLink: {},
                videoId: null
            };
        },
        computed: {
            ...mapState('rewards', ['welcomeGiftMonths']),

            apiData() {
                return {
                    NextLVIPStatus: 'Silver',
                    MonthToReachNextLVIPStatus: 0,
                    NextStatusCommitment: 45,
                    CurrentStatus: 'Member'
                };
            },
            hideCheckboxes() {
                return this.localization?.Data?.HideCheckboxes || false;
            },
            rewardsList() {
                return this.localization?.Data?.MonthlyGiftItems;
            },
            rewardSlots() {
                return 5;
            }
        },
        methods: {
            isFilled(ind) {
                let filled = this.welcomeGiftMonths.find((circle) => circle === ind + 1);
                return Boolean(filled);
            },
            getPlayTime,
            setVideoId(listItem) {
                this.videoId = listItem.Video.LearnToEarn.Metadata.MetadataItemId ? listItem.Video.LearnToEarn.Metadata.MetadataItemId : listItem.Video.VirtualVideo.MediaId;
            },
            moreClicked(modalInfo) {
                this.modalBody = modalInfo?.Description;
                this.modalLink = modalInfo?.CTA;
                this.$modal.show({id: 'reward-welcome-gift'});
            }
        }
    };
</script>

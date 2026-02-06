<template>
    <div class="o-rewardMod -learningLibrary">
        <m-reward-container
            ref="learning-section"
            :title="getLocalizationProp('Data.Headline')"
            :subtitle="getLocalizationProp('Data.SubHeadLine')">

            <template v-slot:content>
                <div class="o-rewardMod__cta">
                    <a class="a-button -white -hemisphere -tiny -uppercase" :href="getLocalizationProp('Data.CTA.Url')">{{ getLocalizationProp('Data.CTA.Text') }}</a>
                </div>
                <ul>
                    <m-reward-list-item
                        v-for="listItem in rewardsList" :id="listItem.Description"
                        :key="listItem.Description"
                        :cta-link="listItem.CTA && listItem.CTA.Url"
                        :cta-label="listItem.CTA && listItem.CTA.Url ? listItem.CTA.Text : getLocalizationProp('Labels.More', 'More')"
                        cta-mods="-white uppercase"
                        :hide-more-cta="getLocalizationProp('Data.HideMoreCTA')"
                        :icon-alt="listItem.Logo && listItem.Logo.Alt"
                        :icon-url="listItem.Logo && listItem.Logo.Url"
                        :label="listItem.Description"
                        root-element="li"
                        @click="moreClicked(listItem.Modal)"
                    >
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
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ORewardLearningLibrary',
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
                modalLink: {}
            };
        },
        computed: {
            rewardsList() {
                return this.localization?.Data?.SectionItems;
            }
        }
    };
</script>

<template>
    <div class="m-rewardMod">
        <m-reward-container
            class="-resetCol"
            :title="getLocalizationProp('Data.Headline')"
            :subtitle="getLocalizationProp('Data.SubHeadLine')">

            <template #content>
                <ul>
                    <m-reward-list-item
                        v-for="(item, index) in sectionItems"
                        :key="item.Heading"
                        :cta-link="item.CTA && item.CTA.Url"
                        :cta-label="item.CTA && item.CTA.Url ? item.CTA.Text : getLocalizationProp('Labels.More', 'More')"
                        cta-mods="-white uppercase"
                        :icon-alt="item.Icon && item.Icon.Alt"
                        :icon-url="item.Icon && item.Icon.Url"
                        :label="item.Heading"
                        root-element="li"
                        @click="onMoreClick(index)"
                    />
                </ul>
            </template>

            <template
                v-if="getLocalizationProp('Data.Image.Url', false)"
                #image>

                <img
                    v-if="getLocalizationProp('Data.Image.Url', false)"
                    class="o-rewardMod__img m-rewards__img"
                    :src="getLocalizationProp('Data.Image.Url', '')"
                    :alt="getLocalizationProp('Data.Image.Alt', '')"
                />

                <img
                    v-if="getLocalizationProp('Data.MobileImage.Url', false)"
                    class="o-rewardMod__mImg m-rewards__img"
                    :src="getLocalizationProp('Data.MobileImage.Url', '')"
                    :alt="getLocalizationProp('Data.MobileImage.Alt', '')"
                />
            </template>
        </m-reward-container>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ORewardMelaleucaServices',
        mixins: [ localizationMixin ],
        computed: {
            sectionItems() {
                return this.getLocalizationProp('Data.SectionItems', []);
            }
        },
        methods: {
            onMoreClick(index) {
                this.modalBody = this.sectionItems[index].ModalContent;
                this.$modal.show();
            }
        }
    };
</script>

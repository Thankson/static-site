<template>
    <div class="m-rewardMod -shippingOnUs">
        <m-reward-container
            class="-resetCol"
            :title="getLocalizationProp('Data.Title', 'Shipping On Us')"
            :subtitle="getLocalizationProp('Data.SubTitle', 'Get your flat rate shipping back in Loyalty Shopping Dollars')">

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

        <modal alignment="bottom" width="440px">
            <template #content>
                <div class="o-rewardMod__modal">
                    <perfect-scrollbar class="o-rewardMod__ps pr-20">
                        <div v-html="modalBody"></div>
                    </perfect-scrollbar>
                    <div>
                        <button v-modal-hide class="a-button -outline -hemisphere font-medium px-15 py-10 leading-tight">{{ getLocalizationProp('Labels.Close', 'Close') }}</button>
                    </div>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ORewardShippingOnUs',
        mixins: [ localizationMixin ],
        data() {
            return {
                modalBody: ''
            };
        },
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

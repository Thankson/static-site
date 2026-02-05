<template>
    <div>
        <div v-if="isVip && showQuarterlyRewards" class="o-rewardMod -quarterlyRewards">
            <m-reward-container
                ref="quarteryRewards"
                :title="getLocalizationProp('Data.Title', 'Quarterly Rewards')"
                :subtitle="getLocalizationProp('Data.SubTitle', 'Get this free')">
                <template v-slot:content>
                    <ul>
                        <m-reward-list-item
                            v-for="listItem in sectionItems"
                            :id="listItem.Description"
                            :key="listItem.Description"
                            :cta-link="listItem.CTA && listItem.CTA.Url"
                            :cta-label="listItem.CTA && listItem.CTA.Url ? listItem.CTA.Text : getLocalizationProp('Labels.More', 'More')"
                            cta-mods="-white uppercase"
                            root-element="li"
                            mod-class="-quarterlyRewards"
                            @click="moreClicked(listItem.ModalContent)"
                        >
                            <p
                                class="m-rewardListItem__label -quarterlyRewards"
                                v-html="listItem.Description"
                            />
                        </m-reward-list-item>

                    </ul>
                </template>
                <template v-if="getLocalizationProp('Data.Image.Url')" v-slot:image>
                    <img
                        class="o-rewardMod__img m-rewards__img"
                        :src="getLocalizationProp('Data.Image.Url', '')"
                        :alt="getLocalizationProp('Data.Image.Alt', '')" />

                    <img
                        class="o-rewardMod__mImg m-rewards__img"
                        :src="getLocalizationProp('Data.MobileImage.Url', '')"
                        :alt="getLocalizationProp('Data.MobileImage.Alt', '')" />
                </template>
            </m-reward-container>
        </div>
        <modal id="reward-quarterly-rewards" alignment="bottom" width="440px">
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
        name: 'ORewardQuarterlyRewards',
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                modalBody: ''
            };
        },
        computed: {
            // Determines if the user is a VIP
            isVip: function () {
                return this.$custInfo?.lvipStatus;
            },
            sectionItems() {
                return this.getLocalizationProp('Data.SectionItems', []);
            },
            // Allows Content to determine if Quarterly Rewards Module should display
            showQuarterlyRewards() {
                return this.getLocalizationProp('Data.ShowQuarterlyRewards', false);
            }
        },
        methods: {
            moreClicked(content) {
                this.modalBody = content;
                this.$modal.show({id: 'reward-quarterly-rewards'});
            }
        }
    };
</script>

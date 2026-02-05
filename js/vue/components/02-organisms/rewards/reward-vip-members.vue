<template>
    <div class="o-rewardMod">
        <m-reward-container
            ref="welcome-gift"
            :title="getLocalizationProp('Data.Title', 'VIP Members')"
            :subtitle="getLocalizationProp('Data.SubTitle', 'More benefits and better discounts')">
            <template v-slot:content>
                <ul>
                    <m-reward-list-item
                        v-for="listItem in benefits"
                        :id="listItem.Description"
                        :key="listItem.Heading"
                        :cta-link="listItem.CTA && listItem.CTA.Url"
                        :cta-label="listItem.CTA && listItem.CTA.Url ? listItem.CTA.Text : getLocalizationProp('Labels.More', 'More')"
                        cta-mods="-white uppercase"
                        :icon-alt="listItem.Logo && listItem.Logo.Alt"
                        :icon-url="listItem.Logo && listItem.Logo.Url"
                        root-element="li"
                        @click="moreClicked(listItem.ModelContent)"
                    >
                        <p
                            class="m-rewardListItem__label"
                            v-html="listItem.Title"
                        />
                    </m-reward-list-item>
                    <div v-if="benefitRTE" v-html="benefitRTE">
                    </div>
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
        <modal id="reward-vip-member" alignment="bottom" width="440px">
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
        name: 'ORewardVipMembers',
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
            benefits() {
                return this.localization?.Data?.Benefits;
            },
            benefitRTE() {
                return this.localization?.Data?.BenefitGridContent;
            }
        },
        methods: {
            moreClicked(content) {
                this.modalBody = content;
                this.$modal.show({id: 'reward-vip-member'});
            }
        }
    };
</script>

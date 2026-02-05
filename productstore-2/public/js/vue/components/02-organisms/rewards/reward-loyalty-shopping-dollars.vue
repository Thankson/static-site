<template>
    <div class="o-rewardMod">
        <m-reward-container
            ref="lsd"
            :title="getLocalizationProp('Data.Headline', 'Loyalty Shopping Dollars')"
            :subtitle="getLocalizationProp('Data.SubHeadLine', 'Earn and spend like cash')">
            <template v-slot:content>
                <div v-if="lsdDetails" class="pb-10 md:pb-20">
                    <div v-if="getLocalizationProp('Data.ShowAvailableToSpendLabel')" class="o-rewardMod__row">
                        <span>{{ getLocalizationProp('Data.AvailableToSpend', 'Lifetime Earned') }}</span>
                        <span class="font-bold">{{ lsdDetails.LsdAvailableToSpend }}</span>
                    </div>
                    <div v-if="getLocalizationProp('Data.ToActivate') && getLocalizationProp('Data.ShowToActivateLabel')" class="o-rewardMod__row">
                        <span>{{ getLocalizationProp('Data.ToActivate', 'To Activate') }}</span>
                        <span class="font-bold">{{ lsdDetails.LsdAvailableToUnlock }}</span>
                    </div>
                    <div class="o-rewardMod__row">
                        <span>{{ getLocalizationProp('Labels.LifetimeEarned', 'Lifetime Earned') }}</span>
                        <span class="font-bold">{{ lsdDetails.LifetimeLoyaltyDollarsEarned }}</span>
                    </div>
                    <div class="o-rewardMod__row">
                        <span>{{ getLocalizationProp('Labels.ExpiringThisMonth', 'Expiring this Month') }}</span>
                        <span class="font-bold">{{ lsdDetails.LsdExpiringInCurrentMonth }}</span>
                    </div>
                </div>
                <ul>
                    <m-reward-list-item
                        v-for="listItem in rewardsList" :id="listItem.Description"
                        :key="listItem.Description"
                        :cta-link="listItem.CTA && listItem.CTA.Url"
                        :cta-label="listItem.CTA && listItem.CTA.Url ? listItem.CTA.Text : getLocalizationProp('Labels.More', 'More')"
                        cta-mods="-white uppercase"
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
                    :class="mobileImg && mobileImg.Url ? 'o-rewardMod__img m-rewards__img': 'm-rewards__img'"
                    :src="getLocalizationProp('Data.Image.Url', '')"
                    :alt="getLocalizationProp('Data.Image.Alt', '')" />

                <img
                    v-if="mobileImg && mobileImg.Url"
                    class="o-rewardMod__mImg m-rewards__img"
                    :src="getLocalizationProp('Data.MobileImage.Url', '')"
                    :alt="getLocalizationProp('Data.MobileImage.Alt', '')" />
            </template>
        </m-reward-container>
        <modal id="reward-LSD" alignment="bottom" width="440px">
            <template v-slot:content>
                <perfect-scrollbar class="o-rewardMod__ps">
                    <div v-html="modalBody"></div>
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
                </perfect-scrollbar>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'ORewardLoyaltyShoppingDollars',
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
            ...mapState('lsd', ['lsdDetails']),
            mobileImg() {
                return this.localization?.Data?.MobileImage;
            },
            rewardsList() {
                return this.localization?.Data?.RewardsLSDList;
            }
        },
        mounted() {
            this.getLsdApiData();
        },
        methods: {
            ...mapActions('lsd', ['getLsdApiData']),
            moreClicked(modalInfo) {
                this.modalBody = modalInfo?.Description;
                this.modalLink = modalInfo?.CTA;
                this.$modal.show({id: 'reward-LSD'});
            }
        }
    };
</script>

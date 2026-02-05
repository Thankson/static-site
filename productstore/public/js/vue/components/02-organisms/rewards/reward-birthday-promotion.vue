<template>
    <div class="o-rewardMod -birthdayPromo">
        <m-reward-container
            ref="welcome-gift"
            :subtitle="promoTitle">
            <template v-slot:content>
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
    import { mapState } from 'vuex';

    export default {
        name: 'ORewardBirthdayPromotion',
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
            ...mapState('rewards', ['welcomeGiftMonths']),
            rewardsList() {
                return this.localization?.Data?.SectionItems;
            },
            promoTitle() {
                const title = this.getLocalizationProp('Data.SubHeadLine', 'Happy Birthday');
                const name = this.getLocalizationProp('Data.UserName', 'Jennifer');
                const hasToken = title.includes('{0}');
                const promoTitle = hasToken ? `${title.replace('{0}', name)}` : `${title} ${name}!`;
                return promoTitle;
            }
        },
        methods: {
            moreClicked(modalInfo) {
                this.modalBody = modalInfo?.Description;
                this.modalLink = modalInfo?.CTA;
                this.$modal.show({id: 'reward-welcome-gift'});
            }
        }
    };
</script>

<template>
    <div class="m-rewardMod">
        <m-reward-container
            class="-resetCol"
            :title="getLocalizationProp('Data.Headline')"
            :subtitle="getLocalizationProp('Data.SubHeadLine')">

            <template #content>
                <div class="o-rewardMod__cta">
                    <a
                        v-if="topButtonCtaText"
                        class="a-button -white -hemisphere -tiny -uppercase"
                        :href="getLocalizationProp('Data.CTA.Url')"
                    >
                        {{ topButtonCtaText }}
                    </a>
                </div>
                <ul>
                    <!-- For month status, each value has a different meaning null (non-award section item):
                         -1 [Not completed, can start ],
                         0 [Complete],
                         1 [Not Completed (and not availabe)],
                         2 [Not Started] -->
                    <m-reward-list-item
                        v-for="listItem in sectionItems"
                        :id="listItem.Description"
                        :key="listItem.Heading"
                        :cta-link="listItem.CTA && listItem.CTA.Url"
                        :cta-label="(listItem.CTA && listItem.CTA.Url) ? listItem.CTA.Text : getLocalizationProp('Labels.More', 'More')"
                        cta-mods="-white uppercase"
                        :icon-alt="listItem.Icon && listItem.Icon.Alt"
                        :icon-url="listItem.Icon && listItem.Icon.Url"
                        :show-month-status="(!listItem.MonthStatus && listItem.MonthStatus !== 0) || listItem.MonthStatus === -1 ? false : true"
                        :month-status="listItem.MonthStatus"
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
                    </m-reward-list-item>
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

        <modal id="free-products-modal" alignment="bottom" width="440px">
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

    export default {
        name: 'ORewardFreeProducts',
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
            sectionItems() {
                return this.localization?.Data?.SectionItems;
            },
            topButtonCtaText() {
                return this.getLocalizationProp('Data.CTA.Text');
            }
        },
        methods: {
            moreClicked(modalInfo) {
                this.modalBody = modalInfo?.Description;
                this.modalLink = modalInfo?.CTA;
                this.$modal.show({id: 'free-products-modal'});
            }
        }
    };
</script>

<template>
    <div class="o-inviteAFriend">
        <MCallout
            v-if="showCallout"
            data-testid="callout-wrapper"
            :arrow-modifier="arrowModifier"
            :callout-modifier="calloutModifier"
            :callout-sr-name="getLocalizationProp('Labels.Callout.CalloutSrLabel')"
            :width="'350px'"
            @close="handleCalloutClose"
        >
            <template v-slot:titleText>
                {{ getLocalizationProp('Labels.Callout.CalloutSrLabel') }}
            </template>

            <template v-slot:rte>
                <div v-html="getLocalizationProp('Labels.Callout.RTE')"></div>
            </template>

            <template v-slot:cta>
                <div class="flex flex-col md:flex-row flex-wrap">
                    <v-button
                        class="text-lg py-10 px-18 md:mr-18 justify-center mb-10 bg-white text-blue hover:bg-blue-50 focus:bg-blue-50"
                        :class="primaryButtonClass"
                        data-testid="button-inviteNowCallout"
                        @click="openShelf"
                    >
                        {{ primaryButtonText }}
                    </v-button>
                    <v-button
                        class="text-lg py-10 px-18 justify-center mb-10 bg-white text-blue hover:bg-blue-50 focus:bg-blue-50"
                        :class="secondaryButtonClass"
                        data-testid="button-closeCallout"
                        @click="handleCalloutClose"
                    >
                        {{ secondaryButtonText }}
                    </v-button>
                </div>
            </template>
        </MCallout>
        <div class="static">
            <div class="a-inviteRail" :class="{ '-open': shelfOpen, '-hidden': isNonInviteShelfOpen }">
                <a-shelf-toggle
                    ref="inviteShelf"
                    class="a-inviteRail__inviteToggle"
                    :class="inviteToggleClassSet"
                    data-testid="button-inviteToggle"
                    :heading-visible="false"
                    @shelf-open="onShelfOpen"
                    @click.native.capture="onToggleClick"
                >
                    <span class="a-inviteToggle__label">
                        <span class="a-inviteRail__labelDesktop">{{ labelDesktop }}</span>
                        <span class="a-inviteRail__labelMobile">{{ labelMobile }}</span>
                    </span>
                    <template v-slot:content>
                        <div class="pt-30 md:pt-20 px-24 md:px-0">
                            <div v-if="promotion && Object.keys(promotion).length > 1" class="pb-20">
                                <InviteAFriendAd
                                    :border-color="promotion.BorderColor"
                                    :background-color="promotion.BackgroundColor"
                                    :background-image="promotion.BackgroundImage"
                                    :title-rte="promotion.TitleRte"
                                    :description-rte="promotion.DescriptionRte"
                                    :product-image="promotion.ProductImgUrl"
                                    :product-image-alt="promotion.ProductImgAlt"
                                />
                            </div>
                            <InviteAFriendMaxLimit
                                v-if="Object.keys(apiLocalization).length && apiLocalization.LimitAvailable <= 0"
                                :api-localization="apiLocalization"
                                @close-shelf="closeShelf"
                            />
                            <!-- Form goes here -->
                            <InviteAFriendForm
                                v-else-if="Object.keys(apiLocalization).length"
                                :api-localization="apiLocalization"
                                @invitationSent="showConfirmation = true"
                            />
                        </div>
                    </template>
                </a-shelf-toggle>
            </div>
        </div>
    </div>
</template>

<script>
    import localization from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/customer/inviteFriendForm';
    import MCallout from '../../01-molecules/callout/callout.vue';
    import InviteAFriendForm from './invite-a-friend-form.vue';
    import InviteAFriendMaxLimit from '../../01-molecules/invite-a-friend-max-limit/invite-a-friend-max-limit.vue';
    import InviteAFriendAd from '../../01-molecules/invite-a-friend/invite-a-friend-ad.vue';
    import ShelfEventBus from '@common/source/js/vue/plugins/shelf/bus';

    export default {
        name: 'OInviteAFriend',
        components: {
            InviteAFriendAd,
            InviteAFriendMaxLimit,
            MCallout,
            InviteAFriendForm
        },
        mixins: [ localization ],
        data() {
            return {
                apiLocalization: {},
                showCallout: false,
                shelfOpen: false,
                tabClicked: false,
                isNonInviteShelfOpen: false,
                previousFocus: null
            };
        },
        computed: {
            labelDesktop() {
                return this.getLocalizationProp('Labels.LabelDesktop');
            },
            labelMobile() {
                return this.getLocalizationProp('Labels.LabelMobile');
            },
            arrowModifier() {
                return `${this.calloutModifier} -rightSwing -lg`;
            },
            calloutModifier() {
                return this.getLocalizationProp('Labels.Callout.CalloutCssClass');
            },
            primaryButtonClass() {
                return this.primaryButtonData?.CssClass;
            },
            primaryButtonData() {
                return this.findButtonByType('Submit');
            },
            primaryButtonText() {
                return this.primaryButtonData?.ButtonText;
            },
            promotion() {
                return this.apiLocalization?.Promotions || {};
            },
            secondaryButtonClass() {
                return this.secondaryButtonData?.CssClass;
            },
            secondaryButtonData() {
                return this.findButtonByType('Cancel');
            },
            secondaryButtonText() {
                return this.secondaryButtonData?.ButtonText;
            },
            inviteToggleClassSet() {
                return this.getLocalizationProp('Data.InviteToggleClassSet', '');
            }
        },
        mounted() {
            this.previousFocus = document?.activeElement;
            this.showCallout = this.getLocalizationProp('Data.ShowCallout');

            this.$shelf.$on.show(() => {
                if(this.tabClicked) {
                    this.isNonInviteShelfOpen = false;
                } else {
                    this.shelfOpen = false;
                    this.isNonInviteShelfOpen = true;
                }
                this.tabClicked = false;
            });

            this.$shelf.$on.hidden(() => {
                this.isNonInviteShelfOpen = false;
                this.tabClicked = false;
            });

            ShelfEventBus.$on('open-invite-a-friend', () => {
                this.openShelf();
            });
        },
        methods: {
            async openShelf() {
                this.showCallout = false;
                this.tabClicked = true;
                if(Object.keys(this.apiLocalization).length === 0) {
                    const response = await api.get();
                    if(response.success && response.data?.Success) {
                        this.apiLocalization = response.data.Data;
                    }
                }
                this.$nextTick(() => {
                    this.$refs.inviteShelf?.show();
                });
            },
            onShelfOpen(isOpen) {
                this.shelfOpen = isOpen;
                if(isOpen) {
                    this.isNonInviteShelfOpen = false;
                }
            },
            closeShelf() {
                this.shelfOpen = false;
                this.$shelf.hide();
            },
            findButtonByType(type) {
                const typeLower = type?.toLowerCase?.() || '';
                const localizedButtons = this.getLocalizationProp('Labels.Callout.Buttons', []);
                if(!Array.isArray(localizedButtons)) return null;
                const match = localizedButtons.find(
                    button => button?.Type?.toLowerCase?.() === typeLower
                );
                return match || null;
            },
            handleCalloutClose() {
                this.showCallout = false;
                const fallback = this.$refs?.inviteTrigger;
                (this.previousFocus || fallback)?.focus();
            },
            onToggleClick(evt) {
                if(this.shelfOpen) {
                    evt?.stopPropagation?.();
                    this.closeShelf();
                } else {
                    this.openShelf();
                }
            }
        }
    };
</script>

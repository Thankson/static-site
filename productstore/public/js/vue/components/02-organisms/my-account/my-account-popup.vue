<template>
    <div ref="myAccount" class="o-myAccPopup">
        <button
            class="o-myAccPopup__btn"
            :aria-label="getLocalizationProp('Labels.ButtonText')"
            type="button"
            name="button"
            :aria-pressed="visible ? 'true' : 'false'"
            data-testid="button-myAccountPopup"
            @click.stop.prevent="open">

            <img
                :src="buttonIcon"
                class="o-myAccPopup__icon"
                :alt="getLocalizationProp('Labels.ButtonText')" />
        </button>

        <popup
            ref="myAccountPopup"
            :header-title="title"
            header-title-mods="text-xl pl-24"
            subtitle-mods="pl-24"
            :subtitle="formattedStatus"
            :vip-title="formattedVIPStatus"
            :lvip-title="lvipStatus"
            :lvip-icon="lvipIcon"
            :lsd-labels="lsdLabels"
            :lsd-mobile-label="lsdMobileLabels"
            :lsd-title="lsdTitle"
            :lsd="lsd"
            :footer-link="getLocalizationProp('Labels.FooterLink.Url',)"
            :footer-title="getLocalizationProp('Labels.FooterLink.Text',)"
            :show-vip-title="userFlags.ShowLoyaltyStatus"
            mods="top-40 right-25"
            body-mods="pb-16 pl-24 pr-16"
            footer-mods="h-auto"
            footer-c-t-a-mods="py-10 pl-24 h-auto font-bold"
            @visibility="toggle">

            <template v-slot:header>
                <a-loading-spinner
                    :class="loading ? 'inline-block' : 'inline'"
                    size="sm"
                    sr-text="Loading User Info"
                    :visible="loading" />
            </template>

            <div class="m-myAccPopup">
                <template v-for="(link, index) in getLocalizationProp('Labels.Links', [])">
                    <a-badge
                        v-if="link.Badge"
                        :key="`${link.Text}_${index}`"
                        class="w-full"
                        :is-grow-premium-popup="link.Badge.IsGrowPremiumPopup"
                        :tailwind-classes="`p-0 bg-transparent static ml-10 text-sm italic ${link.Badge.TailwindClasses}`"
                        :text-color="link.Badge.TextColor"
                        :title="link.Badge.Text"
                        data-testid="span-myAccountPopupPremium"
                    >
                        <a
                            :href="link.Url"
                            class="m-myAccPopup__link -grow"
                            v-html="link.Text" />
                    </a-badge>
                    <a
                        v-else
                        :key="`${link.Text}_${index}_${link.Url}`"
                        :href="link.Url"
                        class="m-myAccPopup__link"
                        :class="isCn ? '-isCn' : ''"
                        v-html="link.Text" />
                </template>
            </div>
        </popup>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import closest from '../../../utils/closest';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import togglePopUpMixin from '../../../mixins/toggle-popup';

    export default {
        name: 'OMyAccPopup',
        mixins: [ localizationMixin, togglePopUpMixin ],
        data() {
            return {
                visible: false,
                buttonIcon: null
            };
        },
        computed: {
            ...mapState('navigation', ['formattedName', 'formattedStatus', 'formattedVIPStatus', 'lvipStatus', 'lvipIcon', 'lsd', 'lsdLabels', 'lsdMobileLabels', 'lsdTitle', 'isLoaded', 'loading', 'labels', 'greetingLabels', 'userFlags']),
            isCn() {
                return this.$env?.IsCn || false;
            },
            title() {
                if(this.isCn) {
                    return this.greetingLabels?.replace('{0}', this.formattedName) || '';
                } else {
                    return this.labels?.Greeting?.replace('{0}', this.formattedName) || '';
                }
            }
        },
        created() {
            // Clear user name and user status
            this.$store.commit('navigation/SET_FORMATTED_NAME', '');
            this.$store.commit('navigation/SET_FORMATTED_STATUS', '');

            // Set as CN if that's the case
            this.$store.commit('navigation/SET_IS_CN', this.isCn);
        },
        mounted() {
            this.getIcon();
        },
        methods: {
            ...mapActions('navigation', ['getNavigation']),
            getIcon() {
                if(this.$refs['myAccount']) {
                    const parent = closest.getClosestParent(this.$refs['myAccount'], '.o-siteHeader__col');

                    // Get the icon from parent's data attribute
                    if(parent) {
                        this.buttonIcon = parent.getAttribute('data-myaccount-icon');
                    }
                }
            },
            open() {
                if(this.visible) {
                    return;
                }

                this.togglePopUp('myAccountPopup', {
                    id: 114,
                    eL: 'My Account'
                });

                if(!this.isLoaded) {
                    this.getNavigation();
                }
            },
            toggle(visible) {
                this.visible = visible;
            }
        }
    };
</script>

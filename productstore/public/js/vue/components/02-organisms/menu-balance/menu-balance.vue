<template>
    <div class="o-menuBalance">
        <button
            class="o-menuBalance__toggle"
            :close-aria-label="getLocalizationProp('Labels.ButtonText')"
            type="button"
            name="button"
            :aria-pressed="visible ? 'true' : 'false'"
            v-on:click.stop.prevent="openPopup"
        >
            {{ getLocalizationProp('Labels.Title') }} <span v-if="info"> {{ info.LsdAvailableToSpend }}</span>
            <span class="o-menuBalance__icon material-icons" aria-hidden="true">help</span>
        </button>
        <popup
            ref="menuBalance"
            :header-visible="false"
            :close-alt="getLocalizationProp('Labels.ClosePopup.Alt')"
            :footer-link="getLocalizationProp('Labels.LearnMore.Url')"
            :footer-title="getLocalizationProp('Labels.LearnMore.Text')"
            :footer-cta-aria-label="getLocalizationProp('Labels.LearnMore.AriaLabel')"
            mods="top-40 -right-12"
            body-mods="py-16 pl-24"
            footer-mods="h-auto"
            footer-c-t-a-mods="py-10 pl-24 h-auto font-bold leading-tight"
            v-on:visibility="checkVisibility"
        >
            <div class="m-menuBalance">
                <p class="m-menuBalance__text">{{ getLocalizationProp('Labels.Text') }}</p>
                <!--Api Service failure message-->
                <div v-if="isServiceFailure" class="m-menuBalance__wrapper">
                    <p class="m-menuBalance__text -serviceFailure">{{ getLocalizationProp('Labels.ServiceFailure') }}</p>
                </div>
                <div v-else class="m-menuBalance__wrapper">
                    <h6 :class="['m-menuBalance__subtitle', { '-isCn' : isCn }]">{{ getLocalizationProp('Labels.Subtitle') }}</h6>
                    <div class="m-menuBalance__loading">
                        <a-loading-spinner :visible="loading" size="sm" />
                    </div>

                    <div v-if="info.ShippingOnUsEnabled">
                        <span v-if="isCn" class="m-menuBalance__info -data">{{ info.LsdAvailableToSpend }}</span>
                        <!-- shipping on us -->
                        <div v-show="!isCn && !loading" class="m-menuBalance__data">
                            <p class="m-menuBalance__info">
                                {{ getLocalizationProp('Labels.Available') }}
                                <span class="m-menuBalance__info -data">{{ info.LsdAvailableToSpend }} </span>
                            </p>
                            <p v-if="info.HasLsdToActive && !isKr" class="m-menuBalance__info">
                                {{ getLocalizationProp('Labels.Activate') }}
                                <span class="m-menuBalance__info -data">{{ info.LsdAvailableToUnlock }} </span>
                            </p>
                            <p v-if="info.HasExpiringThisMonth" class="m-menuBalance__info">
                                {{ getLocalizationProp('Labels.Expiring') }}
                                <span class="m-menuBalance__info -data">{{ info.LsdExpiringInCurrentMonth }}</span>
                            </p>
                            <p class="m-menuBalance__info">
                                {{ getLocalizationProp('Labels.Lifetime') }}
                                <span class="m-menuBalance__info -data">{{ info.LifetimeLoyaltyDollarsEarned }}</span>
                            </p>
                        </div>
                        <a v-show="!isCn && info.HasLsdToActive && !loading" :href="getLocalizationProp('Labels.Watch.Url')" class="m-menuBalance__link -popup">{{ getLocalizationProp('Labels.Watch.Text') }}</a>
                    </div>

                    <div v-else>
                        <span v-if="isCn" class="m-menuBalance__info -data">{{ info.LsdAvailableToSpend }}</span>
                        <div v-show="isCn" class="m-menuBalance__data">
                            <p v-if="info.HasExpiringThisMonth" class="m-menuBalance__info -expiring">
                                {{ getLocalizationProp('Labels.Expiring') }}
                                <span class="m-menuBalance__info -data">{{ info.LsdExpiringInCurrentMonth }}</span>
                            </p>
                        </div>
                        <div v-if="!loading && !isCn && info" class="m-menuBalance__data">
                            <p class="m-menuBalance__info">
                                {{ getLocalizationProp('Labels.Spend') }}
                                <span class="m-menuBalance__info -data">{{ info.LsdAvailableToSpend }}</span>
                            </p>
                            <p v-if="showDollarsToActivate && !isKr" class="m-menuBalance__info">
                                {{ getLocalizationProp('Labels.Activate') }}
                                <span class="m-menuBalance__info -data">{{ info.LsdAvailableToUnlock }}</span>
                            </p>
                            <p class="m-menuBalance__info">
                                {{ getLocalizationProp('Labels.Lifetime') }}
                                <span class="m-menuBalance__info -data">{{ info.LifetimeLoyaltyDollarsEarned }}</span>
                            </p>
                        </div>
                        <a v-if="!isCn" :href="getLocalizationProp('Labels.Watch.Url')" class="m-menuBalance__link -popup">{{ getLocalizationProp('Labels.Watch.Text') }}</a>
                    </div>

                    <a v-if="!isCn" :href="getLocalizationProp('Labels.Earning.Url')" class="m-menuBalance__link -popup">{{ getLocalizationProp('Labels.Earning.Text') }}</a>
                </div>
            </div>
        </popup>
    </div>
</template>
<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'OMenuBalance',
        mixins: [ localizationMixin, togglePopUpMixin ],
        data() {
            return {
                visible: false,
                loading: false,
                info: {
                    LsdAvailableToSpend: 0,
                    LsdAvailableToUnlock: 0,
                    LifetimeLoyaltyDollarsEarned: 0
                },
                isServiceFailure: false
            };
        },
        computed: {
            ...mapState('lsd', ['lsdDetails', 'showApiError']),

            // CN shows only balance and removes the two links
            isCn: function () {
                return this.$env?.IsCn || false;
            },
            isKr() {
                return this.$env.Country === 'Korea';
            },
            showDollarsToActivate() {
                return !this.info.HideDollarsToActivate;
            }
        },
        mounted() {
            this.info = this.getData();
            this.setEventBus();
            this.isServiceFailurePLOnly();
        },
        methods: {
            ...mapActions('lsd', ['getLsdApiData']),
            ...mapMutations('lsd', ['RESET_FAIL_REQUEST']),

            checkVisibility: function(val) {
                this.visible = val;
            },
            shouldClose: function() {
                if(this.visible) {
                    this.$parent.$emit('shouldClose');
                }
            },
            getData: async function() {
                this.loading = true;
                this.RESET_FAIL_REQUEST();
                await this.getLsdApiData();
                if(!this.showApiError && Object.keys(this.lsdDetails).length !== 0) {
                    this.loading = false;
                    this.info = this.lsdDetails;
                } else {
                    this.isServiceFailure = true;
                }
            },
            openPopup: function () {
                if(this.visible) {
                    return;
                }
                this.getData();
                this.togglePopUp('menuBalance');
            },
            setEventBus() {
                eventBus.$on('updateLsd', () => this.getData());
            },
            // pattern lab only -  force error on hbs file
            isServiceFailurePLOnly() {
                if(this.isServiceFailurePL === true) {
                    this.isServiceFailure = true;
                }
            }
        }
    };
</script>

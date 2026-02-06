<template>
    <div class="o-busPrefs">
        <header class="o-busPrefs__header">
            <h2>{{ getLocalizationProp('Labels.Services') }}</h2>
        </header>
        <section class="o-busPrefs__section">
            <div class="o-busPrefs__leftCol">
                <header class="o-busPrefs__sectionHeader">
                    <h3 class="font-bold text-xl">{{ growTitle }}</h3>
                    <a :href="growLearnMore.Url" class="o-busPrefs__learnMore">
                        <span class="align-middle">{{ growLearnMore.Text }}</span>
                        <span class="align-middle font-material -ml-5 text-xl">arrow_right</span>
                    </a>
                </header>
                <div class="o-busPrefs__sectionToggle">
                    <div @click="growToggleValidation">
                        <m-input-toggle
                            v-model="isGrowSubscribed"
                            class="-busPref"
                            :disabled="growToggleDisabled || growLoading"
                            :gtm-id="gtmIdToggle"
                            input-id="growSubscribed"
                            input-name="METools"
                            @changed="subscribeToGrow">
                            <div v-html="growDescription" />
                            <a-loading-spinner size="sm" :visible="growLoading" />
                        </m-input-toggle>
                    </div>
                    <div v-if="showGrowMessage" class="o-busPrefs__infoMsg mt-10">
                        <p class="o-busPrefs__info mt-10 text-sm pr-10" :class="growMessage.Type">
                            <span class="font-material">error_outline</span>
                            <span v-html="alertMessage" />
                        </p>
                    </div>
                </div>
            </div>
            <div class="o-busPrefs__rightCol">
                <div class="o-busPrefs__pricing">
                    <h6 class="o-busPrefs__priceTitle" v-html="growPricing.Title" />
                    <div class="o-busPrefs__priceDescription" v-html="growPricing.Description" />
                    <p class="o-busPrefs__priceDisclaimer" v-html="growPricing.Disclaimer" />
                </div>
            </div>
        </section>
        <section v-if="moreSectionEnabled" class="o-busPrefs__section">
            <div class="o-busPrefs__leftCol">
                <header class="o-busPrefs__sectionHeader">
                    <h3 class="font-bold text-xl">{{ moreTitle }}</h3>
                    <a :href="moreLearnMore.Url" class="o-busPrefs__learnMore">
                        <span class="align-middle">{{ moreLearnMore.Text }}</span>
                        <span class="align-middle font-material -ml-5 text-xl">arrow_right</span>
                    </a>
                </header>
                <div class="o-busPrefs__sectionToggle" @click="moreToggleValidation">
                    <m-input-toggle
                        v-model="isMoreSubscribed"
                        class="-busPref"
                        :disabled="moreToggleDisabled"
                        :gtm-id="gtmIdToggle"
                        input-id="moreSubscribed"
                        input-name="MoreReportSubscription"
                        @changed="subscribeToMore">
                        <div v-html="moreDescription" />
                    </m-input-toggle>
                </div>
            </div>
            <div class="o-busPrefs__rightCol">
                <div class="o-busPrefs__pricing">
                    <h6 class="o-busPrefs__priceTitle" v-html="morePricing.Title" />
                    <div class="o-busPrefs__priceDescription" v-html="morePricing.Description" />
                    <p class="o-busPrefs__priceDisclaimer" v-html="morePricing.Disclaimer" />
                </div>
            </div>
        </section>
        <!-- GROW Subscribe Modal -->
        <modal id="modal-grow-subscribe" width="500px">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.Subscribed') }}
            </template>

            <template v-slot:body>
                <p class="o-busPrefs__modalDescription text-gray-120" v-html="growModalData.Description" />
            </template>

            <template v-slot:footer>
                <div class="o-busPrefs__modalFooter text-center">
                    <v-button
                        v-modal-hide
                        class="o-busPrefs__button -modal -wide"
                        type="button">
                        {{ getLocalizationProp('Labels.Close') }}
                    </v-button>
                    <section class="o-busPrefs__apps mt-40">
                        <p class="o-busPrefs__appsTitle text-sm" v-html="growApps.Title" />
                        <div class="o-busPrefs__appLinks">
                            <div
                                v-for="(app) in growApps.AppLinks"
                                :key="app.Link.Title"
                                class="o-busPrefs__app">
                                <img class="o-busPrefs__appQrCode hidden md:block" :src="app.QrCode.Url" :alt="app.QrCode.Alt" />
                                <a class="o-busPrefs__appLink" :href="app.Link.Url">
                                    <img class="o-busPrefs__appBadge" :src="app.Badge.Url" :alt="app.Badge.Alt" />
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </template>
        </modal>
        <!-- GROW Unsubscribe Modal -->
        <modal id="modal-grow-unsubscribe" width="460px">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.Unsubscribed') }}
            </template>

            <template v-slot:body>
                <p class="o-busPrefs__modalDescription text-gray-120" v-html="growModalData.Description" />
            </template>

            <template v-slot:footer>
                <div>
                    <div class="o-busPrefs__buttons">
                        <v-button
                            class="o-busPrefs__button -modal -white"
                            type="button"
                            name="opt-back-in"
                            :disabled="growLoading"
                            @click="subscribeToGrow">
                            {{ getLocalizationProp('Labels.OptBackIn') }}
                        </v-button>
                        <v-button
                            v-modal-hide
                            class="o-busPrefs__button -modal"
                            type="button">
                            {{ getLocalizationProp('Labels.Close') }}
                        </v-button>
                    </div>
                    <a-loading-spinner size="sm" mods="-m-0 pt-10" :visible="growLoading" />
                </div>
            </template>
        </modal>
        <!-- M.O.R.E. Subscribe Modal -->
        <modal v-if="moreSectionEnabled" id="modal-more-subscribe" width="460px">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.Subscribed') }}
            </template>

            <template v-slot:body>
                <p class="text-gray-120" v-html="moreModalData.Description" />
            </template>

            <template v-slot:footer>
                <div class="text-center">
                    <v-button
                        v-modal-hide
                        class="o-busPrefs__button -modal -wide"
                        type="button">
                        {{ getLocalizationProp('Labels.Close') }}
                    </v-button>
                </div>
            </template>
        </modal>
        <!-- M.O.R.E. Unsubscribe Modal -->
        <modal v-if="moreSectionEnabled" id="modal-more-unsubscribe" width="460px">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.Unsubscribed') }}
            </template>

            <template v-slot:body>
                <p class="text-gray-120" v-html="moreModalData.Description" />
            </template>

            <template v-slot:footer>
                <div class="o-busPrefs__buttons">
                    <v-button
                        class="o-busPrefs__button -modal -white"
                        type="button"
                        @click="subscribeToMore">
                        {{ getLocalizationProp('Labels.OptBackIn') }}
                    </v-button>
                    <v-button
                        v-modal-hide
                        class="o-busPrefs__button -modal"
                        type="button">
                        {{ getLocalizationProp('Labels.Close') }}
                    </v-button>
                </div>
            </template>
        </modal>
        <!-- M.O.R.E. Cannot Subscribe Modal -->
        <modal v-if="moreSectionEnabled" id="modal-more-cannot-unsubscribe" width="460px">
            <template v-slot:heading>
                {{ getLocalizationProp('Labels.CannotUnsubscribe') }}
            </template>

            <template v-slot:body>
                <p class="text-gray-120" v-html="moreModalData.Description" />
            </template>

            <template v-slot:footer>
                <div class="text-center">
                    <v-button
                        v-modal-hide
                        class="o-busPrefs__button -modal -wide"
                        type="button">
                        {{ getLocalizationProp('Labels.Close') }}
                    </v-button>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import api from '@api/routes/account/marketingexecutive';

    import { mapState, mapActions } from 'vuex';
    export default {
        name: 'OBusinessPreferences',
        mixins: [localizationMixin],
        data() {
            return {
                isLoading: true,
                growToggleDisabled: true, // Disable toggles until Get summary api call
                moreToggleDisabled: true, // Disable toggles until Get summary api call
                showGrowMessage: false,
                urlId: ''
            };
        },
        computed: {
            ...mapState('businessPreferences', ['isGrowSubscribed', 'growLoading', 'growMessage', 'growModalData', 'isMoreSubscribed', 'moreModalData', 'subscribedServicesSummary']),
            alertMessage() {
                const message = this.growMessage?.Description;
                // Only replace token if message includes token and customer has not signed IMEA
                const updatedMesssage = (message.includes('?id={0}') && !this.$custInfo.hasIMEA) ? replaceToken(message, this.urlId) : message;
                return updatedMesssage;
            },
            growApps() {
                return this.getLocalizationProp('Data.GrowSection.Apps');
            },
            growDescription() {
                return this.getLocalizationProp('Data.GrowSection.Description');
            },
            growLearnMore() {
                return this.getLocalizationProp('Data.GrowSection.LearnMore');
            },
            growModals() {
                return this.getLocalizationProp('Data.GrowSection.GrowModals');
            },
            growPricing() {
                return this.getLocalizationProp('Data.GrowSection.Pricing');
            },
            growTitle() {
                return this.getLocalizationProp('Data.GrowSection.Title');
            },
            moreDescription() {
                return this.getLocalizationProp('Data.MoreSection.Description');
            },
            moreLearnMore() {
                return this.getLocalizationProp('Data.MoreSection.LearnMore');
            },
            moreModals() {
                return this.getLocalizationProp('Data.MoreSection.MoreModals');
            },
            morePricing() {
                return this.getLocalizationProp('Data.MoreSection.Pricing');
            },
            moreSectionEnabled() {
                return this.getLocalizationProp('Data.EnableMoreSection');
            },
            moreTitle() {
                return this.getLocalizationProp('Data.MoreSection.Title');
            },
            gtmIdToggle() {
                return this.getLocalizationProp('Data.GtmIdToggle', 0);
            }
        },
        async mounted() {
            await this.growSubscription({
                RequestType: 'Get'
            });
            this.setGrowToggle();
            if(this.moreSectionEnabled) {
                await this.moreSubscription({
                    RequestType: 'Get'
                });
                this.setMoreToggle();
            }
            this.isLoading = false;
            this.setShowGrowMessage();

            if(!this.$custInfo.hasIMEA) {
                this.getUrlId();
            }
        },
        methods: {
            ...mapActions('businessPreferences', ['growSubscription', 'moreSubscription']),

            replaceToken,
            // Get URL ID for token replacement
            async getUrlId() {
                const response = await api.get();
                if(response.success && response.data.Success) {
                    const data = response.data?.Data;
                    this.urlId = data?.mobileInvitationCode;
                }
                return this.urlId;
            },
            handleGrowModals(optBackIn) {
                if(optBackIn) {
                    this.$modal.hide({ id: 'modal-grow-unsubscribe' });
                    return;
                }
                if(this.isGrowSubscribed) {
                    this.$modal.show({ id: 'modal-grow-subscribe' });
                } else {
                    this.$modal.show({ id: 'modal-grow-unsubscribe' });
                }
            },
            handleMoreModals() {
                if(this.moreModalData?.CannotUnsubscribe) {
                    this.$modal.show({ id: 'modal-more-cannot-unsubscribe' });
                    return;
                }
                if(this.isMoreSubscribed) {
                    this.$modal.show({ id: 'modal-more-subscribe' });
                } else {
                    this.$modal.show({ id: 'modal-more-unsubscribe' });
                }
            },
            growToggleValidation() {
                this.showGrowMessage = this.growToggleDisabled && !this.isLoading;
            },
            moreToggleValidation() {
                if(this.moreToggleDisabled && !this.isLoading) {
                    this.handleMoreModals();
                }
            },
            setGrowToggle() {
                // Disable GROW Opt-In if customer has not signed IMEA
                this.growToggleDisabled = !this.$custInfo?.hasIMEA && !this.isGrowSubscribed;
            },
            setMoreToggle() {
                // Disable MORE Opt-In if customer is subscribed and cannot unsubscribe
                this.moreToggleDisabled = this.isMoreSubscribed && this.moreModalData.CannotUnsubscribe;
            },
            setShowGrowMessage() {
                this.showGrowMessage = !this.growToggleDisabled && !this.isLoading && this.growMessage?.Type && this.growMessage?.Description;
            },
            async subscribeToGrow(e) {
                const optBackIn = e.srcElement?.name === 'opt-back-in' || '';
                await this.growSubscription({
                    // Put is to unsubscribe and Post is to subscribe
                    RequestType: this.subscribedServicesSummary ? 'Put' : 'Post'
                });
                // Get will return subscription and messaging
                await this.growSubscription({
                    RequestType: 'Get'
                });
                this.setShowGrowMessage();
                this.handleGrowModals(optBackIn);
            },
            async subscribeToMore() {
                await this.moreSubscription({
                    // Put is to unsubscribe and Post is to subscribe
                    RequestType: this.isMoreSubscribed ? 'Put' : 'Post'
                });
                // Get will return subscription, messaging, and modal data
                await this.moreSubscription({
                    RequestType: 'Get'
                });
                if(this.moreModalData) {
                    this.handleMoreModals();
                }
            }
        }
    };
</script>

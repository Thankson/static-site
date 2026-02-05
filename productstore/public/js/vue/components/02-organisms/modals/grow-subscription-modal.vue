<template>
    <modal class="o-growSubscriptionModal" width="500px">
        <template v-slot:heading>
            <div class="o-growSubscriptionModal__heading">
                {{ getLocalizationProp('Data.Subscribed') }}
            </div>
        </template>

        <template v-slot:body>
            <div class="o-growSubscriptionModal__body text-center">
                <p class="o-growSubscriptionModal__description" v-html="getLocalizationProp('Data.SuccessMessage')" />

                <v-button
                    v-modal-hide
                    class="o-growSubscriptionModal__button"
                    type="button"
                    @click="onCloseModal"
                >
                    {{ getLocalizationProp('Data.Close') }}
                </v-button>
                <div class="o-growSubscriptionModal__apps">
                    <p class="o-growSubscriptionModal__title" v-html="growApps.Title" />
                    <div class="o-growSubscriptionModal__links">
                        <template
                            v-for="(app, key) in growApps.AppLinks"
                        >
                            <div
                                v-if="!isAppUrlEmpty(app)"
                                :key="key"
                                class="o-growSubscriptionModal__app">
                                <img v-if="app.QrCode.Url" class="o-growSubscriptionModal__qrCode" :src="app.QrCode.Url" :alt="app.QrCode.Alt" />
                                <a v-if="app.Link.Url" class="o-growSubscriptionModal__link" :href="app.Link.Url">
                                    <img class="o-growSubscriptionModal__badge" :src="app.Badge.Url" :alt="app.Badge.Alt" />
                                </a>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </template>

    </modal>
</template>

<script>
    import { mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OGrowSubscriptionModal',
        mixins: [localizationMixin],
        computed: {
            ...mapState('businessPreferences', ['growModalData']),
            closePopUpLink() {
                return this.getLocalizationProp('Data.ClosePopUpLink');
            },
            growApps() {
                return this.getLocalizationProp('Data.Apps');
            }
        },
        mounted() {
            /** Listens to modal hide event */
            this.$modal.$on.hide(() => {
                this.onCloseModal();
            });
        },
        methods: {
            isAppUrlEmpty(app) {
                return !app?.QrCode?.Url && !app?.Link?.Url && !app?.Badge?.Url;
            },
            /**
             * Handles actions to perform when the modal is closed
             */
            onCloseModal() {
                if(!this.closePopUpLink?.Url) return;

                if(this.closePopUpLink?.Target) {
                    window.open(this.closePopUpLink.Url, this.closePopUpLink.Target);
                } else {
                    window.location.href = this.closePopUpLink.Url;
                }
            }
        }
    };
</script>

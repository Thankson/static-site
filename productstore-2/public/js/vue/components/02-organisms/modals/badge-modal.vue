<template>
    <modal class="o-badgeModal" heading-class="font-bold leading-base text-4xl-2 text-dark" width="530px">
        <template v-slot:heading>
            {{ getLocalizationProp('Data.Heading') }}
        </template>
        <template v-slot:body>
            <p class="mb-20 text-sm" v-html="getLocalizationProp('Data.Description')"></p>
        </template>
        <template v-slot:footer>
            <div class="flex flex-col w-full md:flex-row md:pb-0">
                <v-button
                    v-modal-hide
                    class="text-base font-medium justify-center text-center px-25 py-10 mb-20 md:mb-0 md:mr-20 -white -modal"
                    @click="hideModal"
                >
                    {{ getLocalizationProp('Data.BackButtonText') }}
                </v-button>
                <v-button
                    :href="getLocalizationProp('Data.SubscribeToGrowButtonLink')"
                    :is-anchor="true"
                    class="justify-center text-base text-center font-medium py-12 px-24">
                    {{ getLocalizationProp('Data.SubscribeToGrowButtonText') }}
                </v-button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions } from 'vuex/dist/vuex.common.js';
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OBadgeModal',
        mixins: [
            localizationMixin
        ],
        props: {
            scriptId: {
                type: String,
                default: 'GrowPremiumLocalization'
            },
            showDefault: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
            };
        },
        mounted () {
            this.setEventBus();

            if(this.showDefault) {
                this.$modal.show();
            }
        },
        beforeDestroy() {
            eventBus.$off('showGrowPremiumSubscriptionPopup');
        },
        methods: {
            ...mapActions('navigation', ['closeNavMenu']),
            hideModal() {
                this.$modal.hide();
            },
            setEventBus() {
                eventBus.$on('showGrowPremiumSubscriptionPopup', (val) => {
                    this.$modal.show();
                    this.closeNavMenu();
                });
            }
        }
    };
</script>

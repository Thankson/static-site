<template>
    <div class="m-lsdPanels">

        <!-- Loading -->
        <div v-if="!isLsdLoaded" class="m-lsdPanels__loading">
            <a-loading-spinner size="sm" :visible="!isLsdLoaded" />
        </div>

        <!-- API Error -->
        <div v-if="isLsdLoaded && showApiError" class="m-lsdPanels__error">
            <p
                class="m-lsdPanels__text"
                v-html="getLocalizationProp('Labels.GenericFailureMessage', labelsFallback.genericMessage)">
            </p>
            <button class="m-lsdPanels__reload" @click="reloadPage">
                {{ getLocalizationProp('Labels.RefreshPage', labelsFallback.refreshPage) }}
            </button>
        </div>

        <!-- Panels -->
        <ul v-if="isLsdLoaded && !showApiError" class="m-lsdPanels_list">
            <li v-for="(panel, index) in panels" :key="panel.index" class="m-lsdPanels__item" :class="{ '-active': panel.Link && panel.Link.Url }">
                <h3 class="m-lsdPanels__title">{{ labels[index].Value }}</h3>
                <div v-if="isLsdLoaded" class="m-lsdPanels__content">
                    <a v-if="panel.Link && panel.Link.Url" class="m-lsdPanels__link" :href="panel.Link.Url" :target="panel.Link.Target" :aria-label="panel.Link.AriaLabel">
                        <span class="m-lsdPanels__linkText">{{ lsdDetails[panel.Key] }}</span>
                        <a-icon v-if="panel.Icon" class="m-lsdPanels__icon" size="sm" color="green">
                            {{ panel.Icon }}
                        </a-icon>
                    </a>
                    <span v-else class="m-lsdPanels__amount">{{ lsdDetails[panel.Key] }}</span>
                    <div v-if="!(panel.Link && panel.Link.Url)" class="m-lsdPanels__tooltip">
                        <m-tooltip
                            v-if="panel.TooltipContent"
                            tooltip-icon="info"
                        >
                            <div v-html="panel.TooltipContent"></div>
                        </m-tooltip>
                    </div>
                </div>
            </li>
        </ul>

    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import preComponentLoader from '@common/source/js/vue/mixins/pre-component-loader';
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'MLteLsdPanels',
        mixins: [ localizationMixin, preComponentLoader ],
        props: {
            showApiErrorPLOnly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                data: {},
                panels: [],
                labels: [],
                hideDollarsExpiringIfZero: false,
                labelsFallback: {
                    genericMessage: '<span class="font-bold">Looks like something went wrong.</span> This part of the page had trouble loading.',
                    refreshPage: 'Refresh Page'
                }
            };
        },
        computed: {
            ...mapState('lsd', ['lsdDetails', 'isLsdLoaded', 'showApiError'])
        },
        watch: {
            lsdDetails() {
                if(this.hideDollarsToActivateFlag || (this.lsdDetails?.HideDollarsToActivate && !this.lsdDetails?.HasLsdToActive)) {
                    this.panels = this.panels.filter(obj => obj.Key !== 'LsdAvailableToUnlock');
                    this.labels = this.labels.filter(obj => obj.Key !== 'LsdAvailableToUnlock');
                }
                if(this.lsdDetails.HideExpiringThisMonth || (this.hideDollarsExpiringIfZero && !this.lsdDetails.HasExpiringThisMonth)) {
                    this.panels = this.panels.filter(obj => obj.Key !== 'LsdExpiringInCurrentMonth');
                    this.labels = this.labels.filter(obj => obj.Key !== 'LsdExpiringInCurrentMonth');
                }
            }
        },
        created() {
            if(!this.lsdDetails.length) {
                if(this.showApiErrorPLOnly) {
                    // For Pattern-Lab only
                    this.getLsdApiDataError();
                } else {
                    this.getLsdApiData();
                }
            }
        },
        mounted() {
            this.labels = this.getLocalizationProp('Data.LsdPanels.Labels.PanelTitles');
            this.panels = this.getLocalizationProp('Data.LsdPanels.Data.Panels');
            this.hideDollarsExpiringIfZero = this.getLocalizationProp('Data.HideDollarsExpiringIfZero', false);
            this.hideDollarsToActivateFlag = this.getLocalizationProp('Data.HideDollarsToActivate', false);
            this.unsetPreComponentLoader();
        },
        methods: {
            ...mapActions('lsd', ['getLsdApiData', 'getLsdApiDataError']),
            reloadPage() {
                window.location.reload();
            }
        }
    };
</script>

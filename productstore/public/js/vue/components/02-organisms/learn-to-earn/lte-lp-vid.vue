<template>
    <article v-show="showComponent" class="o-lteLPVid">
        <!-- Header with two slots-->
        <header class="o-lteLPVid__header">
            <h3 class="o-lteLPVid__title">
                <slot name="title" />
            </h3>
            <div v-if="isLoaded && isAllIntroVideosWatched" class="o-lteLPVid__cta">
                <slot name="cta" />
            </div>
        </header>
        <!-- End Header with two slots-->

        <!-- Video Card-->
        <div v-if="!isLoaded" class="o-lteLPVid__loading">
            <a-loading-spinner :visible="true" size="sm" />
        </div>
        <div v-if="showApiError && isLoaded" class="o-lteLPVid__error">
            <p
                class="o-lteLPVid__text"
                v-html="getLocalizationProp('Labels.GenericFailureMessage', labelsFallback.genericMessage)"></p>
            <button class="o-lteLPVid__reload" @click="reloadPage">
                {{ getLocalizationProp('Labels.RefreshPage', labelsFallback.refreshPage) }}
            </button>
        </div>
        <div v-if="!showApiError && isLoaded" class="o-lteLPVid__card">
            <o-video-modal-card
                :id="newCard.LearnToEarn.Metadata.MetadataItemId"
                :amount-formatted="newCard.LearnToEarn.Metadata.FormattedLsdAmount"
                :amount-value="newCard.LearnToEarn.Metadata.LsdAmount"
                card-size="-lp"
                :desc="newCard.VirtualVideo.Description"
                :has-reset="newCard.VirtualVideo.HasReset"
                :is-new="newCard.VirtualVideo.IsNew"
                :is-watched="newCard.VirtualVideo.IsWatched"
                :lte="newCard.LearnToEarn"
                :localization="getLocalization['Data']"
                :quiz="newCard.LearnToEarn.Quiz"
                :title="newCard.VirtualVideo.Title"
                :video-data="newCard.VirtualVideo"
                :prevent-seek="newCard.VirtualVideo.PreventSeek || false"
                :allow-seek="newCard.VirtualVideo.AllowSeek || false"
                :video-item-id="newCard.VirtualVideo.MediaId"
            ></o-video-modal-card>
        </div>
        <!-- End Video Card-->

    </article>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import preComponentLoader from '@common/source/js/vue/mixins/pre-component-loader';
    import { mapActions, mapState, mapGetters } from 'vuex';

    export default {
        name: 'OLteLPVid',

        mixins: [ localizationMixin, preComponentLoader],

        props: {
            showApiErrorPLOnly: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                newCard: {},
                hideTilesOnZeroToActivate: false,
                labelsFallback: {
                    genericMessage: '<span class="font-bold">Looks like something went wrong.</span> This part of the page had trouble loading.',
                    refreshPage: 'Refresh Page'
                }
            };
        },

        computed: {
            ...mapState('lteVideos', ['newestVideoCard', 'isLoaded', 'showApiError', 'storedVideosList', 'introVideosList']),
            ...mapState('lsd', ['lsdDetails']),
            ...mapGetters('lteVideos', ['getLocalization']),
            showComponent() {
                return !(this.hideTilesOnZeroToActivate && !this.lsdDetails.HasLsdToActive);
            },

            isAllIntroVideosWatched: function () {
                return this.introVideosList.every(video => video.VirtualVideo.IsWatched);
            }
        },

        watch: {
            isLoaded() {
                this.newCard = this.newestVideoCard;
                this.unsetPreComponentLoader();
            }
        },

        created() {
            // Get data from API
            if(!this.storedVideosList.length) {
                if(this.showApiErrorPLOnly) {
                    // Only for PatternLab
                    this.getDataError();
                } else {
                    this.getData();
                }
            }
        },

        mounted() {
            this.$modal.$on.hidden(() => {
                this.newCard = this.newestVideoCard;
            });
            this.hideTilesOnZeroToActivate = this.getLocalizationProp('HideTilesOnZeroToActivate', false);
        },

        methods: {
            ...mapActions('lteVideos', ['getData', 'getDataError']),

            reloadPage() {
                window.location.reload();
            }
        }
    };
</script>

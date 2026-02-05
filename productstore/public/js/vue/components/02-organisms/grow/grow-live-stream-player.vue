<template>
    <div class="o-growLiveStreamPlayer bg-cover bg-center relative" :style="{ backgroundImage: `url(${getLocalizationProp('Data.BackgroundImage')})` }">
        <div class="o-widthControl mx-auto w-full max-w-full px-10 md:max-w-contain md:px-100">
            <img v-if="activeLogo" class="o-growLiveStreamPlayer__logo mx-auto md:ml-0 mb-18 md:mb-24 w-150 md:w-auto" :src="activeLogo.Url" :alt="activeLogo.Alt" />
            <div v-if="loading || !activeButtonState" class="o-growLiveStreamPlayer__content flex items-center justify-center">
                <ALoadingSpinner
                    :visible="true"
                    size="lg"
                    color="#ffffff"
                    mods="center"
                    sr-text="Loading livestream data..."
                />
            </div>
            <div v-else>
                <div v-if="currentFailover === 'techFailure'" class="o-growLiveStreamPlayer__content flex items-center justify-center">
                    <div class="o-growLiveStreamPlayer__rte" v-html="getLocalizationProp('Data.TechnicalFailureMessage')"></div>
                </div>
                <div v-else-if="currentFailover === 'failsafe'" class="o-growLiveStreamPlayer__content flex items-center justify-center">
                    <div class="o-growLiveStreamPlayer__rte" v-html="getLocalizationProp('Data.FailSafeMessage')"></div>
                </div>
                <div v-else>
                    <div v-if="isDuringEvent || isPostLiveWatch">
                        <div v-if="liveEventData" v-html="liveEventData"></div>
                        <div v-else class="o-growLiveStreamPlayer__content bg-transparent relative">
                            <button v-show="isMuted" class="m-vidPlayer__muted absolute top-25 left-0 ml-20 z-1" @click="toggleMute">
                                <img class="w-48 h-auto" :src="mutedIconUrl" alt="Muted volume icon" />
                            </button>
                            <m-vid-player
                                ref="videoPlayer"
                                :event-start-time="eventStartTime"
                                :is-live-event="true"
                                :mute="true"
                                :post-live-watch-duration="postLiveWatchDuration"
                                :prevent-rewind="preventRewind"
                                :prevent-seek="true"
                                :video-data="videoData"
                                :on-complete-function="onCompleteFunction"
                                :on-mute-function="onMuteFunction">
                            </m-vid-player>
                            <button v-if="jumpToLiveLabels.text" class="mt-12" :aria-label="jumpToLiveLabels.ariaLabel" @click="jumpToLive" v-html="jumpToLiveLabels.text"></button>
                        </div>
                    </div>
                    <div v-else class="o-growLiveStreamPlayer__content flex items-center justify-center">
                        <div class="o-growLiveStreamPlayer__rte" v-html="activeButtonState.RTE"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ALoadingSpinner from '@common/source/js/vue/components/00-atoms/loading-spinner/loading-spinner.vue';
    import * as lambdaEventTypes from '../../../utils/lambda-event-types';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapActions, mapGetters } from 'vuex';
    import { isTimeReached } from '../../../utils/compare-dates';

    export default {
        name: 'OGrowLiveStreamPlayer',
        components: { ALoadingSpinner },
        mixins: [localizationMixin],
        data() {
            return {
                eventPollingInterval: null,
                isVideoLoaded: false,
                isVideoPlayed: false,
                isVideoWatched: false,
                loading: true,
                isMuted: true,
                currentFailover: 'none'
            };
        },
        computed: {
            ...mapGetters('liveSession', ['liveSessionData']),
            activeButtonState() {
                return this.eventStates?.find(state => state.Type === this.activeButtonType);
            },
            activeButtonType() {
                switch (true) {
                    case this.isEventEnded:
                        return lambdaEventTypes.Ended;
                    case this.isDuringEvent:
                        return lambdaEventTypes.WatchNow;
                    case this.isEventStart:
                        return lambdaEventTypes.ComingSoon;
                    default:
                        return lambdaEventTypes.ComingSoon;
                }
            },
            activeLogo() {
                const watchNowData = this.eventStates?.find(state => state.Type === lambdaEventTypes.WatchNow);
                if(watchNowData && watchNowData.LiveEvent) {
                    return this.getLocalizationProp('Data.LaunchLogo');
                }
                return this.getLocalizationProp('Data.BroadcastLogo');
            },
            apiInterval() {
                return this.convertToNumber(this.getLocalizationProp('Data.ApiInterval', 10000));
            },
            eventStates() {
                return this.getLocalizationProp('Data.EventStates', []);
            },
            eventStartTime() {
                return this.liveSessionData?.eventStart ? new Date(this.liveSessionData.eventStart).getTime() : null;
            },
            failoverStatus() {
                const d = this.liveSessionData || {};
                const techFailure = d.techFailure; // backend sets true/false
                const failsafeStart = d.failsafeStart;
                const failsafeEnd = d.failsafeEnd;

                // TECH FAILURE
                if(techFailure) {
                    return 'techFailure';
                }

                // FAILSAFE WINDOW
                if(failsafeStart && failsafeEnd) {
                    const inFailsafeWindow =
                        isTimeReached(failsafeStart) && !isTimeReached(failsafeEnd);

                    if(inFailsafeWindow) {
                        return 'failsafe';
                    }
                }

                // NORMAL TIMING
                return 'none';
            },
            isDuringEvent() {
                return this.isEventStart && !this.isEventEnded && !this.isVideoWatched;
            },
            isEventEnded() {
                return isTimeReached(this.liveSessionData?.eventEnd);
            },
            isEventStart() {
                return isTimeReached(this.liveSessionData?.eventStart);
            },
            isPostLiveWatch() {
                let isPostLiveWatchActive = false;
                if(this.isEventEnded && this.isVideoPlayed && !this.isVideoWatched && this.postLiveWatchDuration && !this.liveEventData) {
                    let eventEndTimestamp = new Date(this.liveSessionData.eventEnd).getTime();
                    let postLiveWatchEndTime = new Date(eventEndTimestamp + this.postLiveWatchDuration);
                    isPostLiveWatchActive = !isTimeReached(postLiveWatchEndTime);
                }
                return isPostLiveWatchActive;
            },
            jumpToLiveLabels() {
                return {
                    text: this.getLocalizationProp('Data.Text'),
                    ariaLabel: this.getLocalizationProp('Data.AriaLabel')
                };
            },
            liveEventData() {
                return this.activeButtonState?.LiveEvent;
            },
            liveEventTotalSeconds() {
                const startStr = this.liveSessionData?.eventStart;
                const endStr = this.liveSessionData?.eventEnd;
                if(!startStr || !endStr) return 0;

                const startTime = new Date(startStr).getTime();
                const endTime = new Date(endStr).getTime();
                return Math.floor((endTime - startTime) / 1000);
            },
            lambdaUrl() {
                return this.getLocalizationProp('Data.LambdaUrl');
            },
            mutedIconUrl() {
                return this.getLocalizationProp('Data.MutedIconUrl');
            },
            postLiveWatchDuration() {
                return this.convertToNumber(this.getLocalizationProp('Data.PostLiveWatchDuration'));
            },
            preventRewind() {
                return this.getLocalizationProp('Data.PreventRewind', false);
            },
            showMelaPlayer() {
                return this.isDuringEvent && this.videoData && !this.liveEventData;
            },
            videoData() {
                const videoData = this.activeButtonState?.Video?.VirtualVideo;
                if(!videoData) {
                    return {};
                }
                return videoData;
            }
        },
        watch: {
            activeButtonType(val) {
                if(val === lambdaEventTypes.WatchNow) this.updateVideoState();
            },
            liveSessionData(val) {
                if(val) this.loading = false;
            },
            failoverStatus(newVal) {
                this.currentFailover = newVal;
            }
        },
        mounted() {
            this.startEventPolling();
        },
        beforeDestroy() {
            this.clearEventPollingInterval();
        },
        methods: {
            ...mapActions('liveSession', ['fetchLambdaEvents']),
            clearEventPollingInterval() {
                clearInterval(this.eventPollingInterval);
                this.eventPollingInterval = null;
            },
            convertToNumber(value) {
                if(typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
                    return Number(value);
                }
                return value;
            },
            fetchEvents() {
                this.fetchLambdaEvents({ lambdaUrl: this.lambdaUrl });
            },
            jumpToLive() {
                if(window.vueMelaPlayer) {
                    window.vueMelaPlayer.JumpToLive();
                }
            },
            loadMelaPlayer() {
                this.$nextTick(() => {
                    this.$refs.videoPlayer.callPlayer();
                    this.isVideoLoaded = true;
                    this.isVideoPlayed = true;
                });
            },
            onCompleteFunction() {
                this.isVideoWatched = true;
            },
            onMuteFunction(mute) {
                this.isMuted = mute;
            },
            startEventPolling() {
                if(this.eventPollingInterval) {
                    return;
                }
                this.fetchEvents();
                this.eventPollingInterval = setInterval(() => this.fetchEvents(), this.apiInterval);
            },
            toggleMute() {
                const player = window.vueMelaPlayer?.Player;
                if(player) {
                    player.setVolume(100);
                    this.isMuted = false;
                }
            },
            updateVideoState() {
                if(!this.showMelaPlayer) {
                    this.isVideoLoaded = false;
                } else if(!this.isVideoLoaded) {
                    this.loadMelaPlayer();
                }
            }
        }
    };
</script>

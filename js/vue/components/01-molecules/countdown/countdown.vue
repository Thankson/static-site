<template>
    <div class="m-countdown">
        <ALoadingSpinner
            v-if="loading"
            :visible="true"
            size="lg"
            color="#ffffff"
            mods="center"
            sr-text="Loading livestream data..."
        />
        <div v-else class="flex flex-col md:flex-row justify-between items-start md:items-center w-full p-30" :style="bannerStyle">
            <div class="w-full md:w-1/2 mb-10 text-white">
                <div class="m-rte" :style="{ color: activeState?.TextColor }" v-html="activeState?.Text" />
                <p class="text-base mb-20" :style="{ color: activeState?.DescriptionTextColor }">{{ activeState?.Description }}</p>
                <ButtonIcon
                    v-if="shouldShowButton"
                    :href="activeState.Link"
                    :style="buttonStyle"
                    @mouseover="hovering = true"
                    @mouseleave="hovering = false"
                    v-html="activeState.Button.ButtonText"
                />
            </div>
            <div
                v-if="showCountdown && eventStart"
                class="flex w-full md:w-1/2 justify-center md:justify-end"
                :style="{ background: activeState?.CountdownBackgroundColor }">
                <div
                    v-for="(value, key, index) in timeLeft"
                    :key="key"
                    :class="timeUnitClasses(index)"
                    :style="timeUnitStyle">
                    <div class="text-xl font-bold">{{ value }}</div>
                    <div class="text-xs mt-3 uppercase">{{ key }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ButtonIcon from '../../00-atoms/buttons/banner-button.vue';
    import ALoadingSpinner from '@common/source/js/vue/components/00-atoms/loading-spinner/loading-spinner.vue';
    import { isTimeReached } from '../../../utils/compare-dates';
    import liveSessionMixin from '../../../mixins/live-session';

    const UPDATE_INTERVAL = 1000;
    const TIME_UNITS = {
        DAYS: 1000 * 60 * 60 * 24,
        HOURS: 1000 * 60 * 60,
        MINUTES: 1000 * 60,
        SECONDS: 1000
    };

    const DEFAULT_TIME = { Days: '0', Hours: '0', Minutes: '0', Seconds: '0' };

    export default {
        name: 'MCountdown',
        components: { ButtonIcon, ALoadingSpinner },
        mixins: [liveSessionMixin],
        data() {
            return {
                timeLeft: DEFAULT_TIME,
                timer: null,
                hovering: false,
                loading: true,
                timeLeftLength: 4
            };
        },

        computed: {
            isEventEnd() {
                return isTimeReached(this.liveSessionData?.eventEnd);
            },
            livestreamData() {
                return this.localization?.Data?.LivestreamCountdown;
            },

            lambdaUrl() {
                return this.livestreamData?.LambdaUrl;
            },

            eventStart() {
                return this.liveSessionData?.eventStart || null;
            },

            walkInStart() {
                return this.liveSessionData?.walkInStart || null;
            },

            cutoffTime() {
                return this.liveSessionData?.cutoff || null;
            },

            activeState() {
                if(!this.liveSessionData) return {};
                const now = new Date().getTime();
                const times = {
                    event: new Date(this.eventStart).getTime(),
                    walkIn: new Date(this.walkInStart).getTime(),
                    cutoff: new Date(this.cutoffTime).getTime()
                };

                if(now < times.walkIn) {
                    return this.getStateByType('ComingSoon');
                } else if(now >= times.walkIn && now < times.event) {
                    return this.getStateByType('WalkIn');
                } else if(now >= times.event && now < times.cutoff) {
                    return this.getStateByType('WatchNow');
                }
                return this.getStateByType('Ended');
            },

            shouldShowButton() {
                return this.activeState?.Button?.ButtonText;
            },

            showCountdown() {
                return ['ComingSoon', 'WalkIn'].includes(this.activeState?.Type);
            },

            buttonStyle() {
                const btn = this.activeState?.Button;
                return btn ? {
                    backgroundColor: this.hovering ? btn.HoverColor : btn.BackgroundColor,
                    color: btn.TextColor
                } : {};
            },

            bannerStyle() {
                const { Gradient, BackgroundImage, BorderColor, BackgroundColor } =
                    this.activeState || {};
                const style = {};
                if(Gradient) style.background = Gradient;
                else if(BackgroundColor) style.background = BackgroundColor;
                if(BackgroundImage) style.backgroundImage = `url('${BackgroundImage}')`;
                if(BorderColor) style.border = `1px solid ${BorderColor}`;
                return style;
            },

            timeUnitStyle() {
                return { color: this.activeState?.CountdownTextColor };
            }
        },

        watch: {
            liveSessionData(newVal) {
                if(newVal) {
                    this.loading = false;
                }
                if(this.isEventEnd) {
                    this.clearTimers();
                }
            },
            loading(newVal) {
                if(!newVal && this.showCountdown) {
                    this.initializeCountdown();
                }
            }
        },

        beforeDestroy() {
            this.clearTimers();
        },

        methods: {
            getStateByType(type) {
                return this.livestreamData?.CountdownStates.find(s => s.Type === type) || {};
            },
            async initializeCountdown() {
                this.calculateTime();
                this.startTimers();
            },
            startTimers() {
                if(this.timer) return;
                this.timer = setInterval(this.calculateTime, UPDATE_INTERVAL);
            },
            clearTimers() {
                this.clearCountdownInterval();
            },
            clearCountdownInterval() {
                clearInterval(this.timer);
            },
            timeUnitClasses(index) {
                return [
                    'text-center py-20 relative w-1_4',
                    index > 0 && index < this.timeLeftLength && 'm-countdown__colon'
                ];
            },
            calculateTime() {
                const eventTime = new Date(this.eventStart);
                if(isNaN(eventTime)) {
                    console.error('Invalid date format:', this.eventStart);
                    return;
                }

                const now = new Date().getTime();
                let diff = eventTime.getTime() - now;

                if(diff <= 0) {
                    diff = 0;
                    this.clearCountdownInterval();
                    this.fetchEventData();
                }

                this.timeLeft = {
                    Days: Math.floor(diff / TIME_UNITS.DAYS),
                    Hours: Math.floor((diff % TIME_UNITS.DAYS) / TIME_UNITS.HOURS),
                    Minutes: Math.floor((diff % TIME_UNITS.HOURS) / TIME_UNITS.MINUTES),
                    Seconds: Math.floor((diff % TIME_UNITS.MINUTES) / TIME_UNITS.SECONDS)
                };
            }
        }
    };
</script>

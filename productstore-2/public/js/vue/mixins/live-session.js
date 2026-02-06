import apiLambdaEvents from '@api/routes/events/lambda';
import * as lambdaEventTypes from '../utils/lambda-event-types';
import { isTimeReached } from '../utils/compare-dates';
import localizationMixin from '@common/source/js/vue/mixins/localization';

export default {
    mixins: [localizationMixin],
    data() {
        return {
            eventPollingInterval: null,
            liveSessionData: null
        };
    },
    computed: {
        activeButtonState() {
            return this.buttonStates?.find(state => state.Type === this.activeButtonType) || {};
        },
        activeButtonType() {
            switch (true) {
                case this.isEventEnd:
                    return lambdaEventTypes.Replay;
                case this.isCutoff:
                    return lambdaEventTypes.Ended;
                case this.isButtonStart:
                    return lambdaEventTypes.WatchNow;
                case this.isEventStartDay:
                    return lambdaEventTypes.ComingSoon;
                default:
                    return lambdaEventTypes.ComingSoon;
            }
        },
        apiInterval() {
            return this.getLocalizationProp('Data.LiveSession.ApiInterval', 10000);
        },
        buttonData() {
            return this.activeButtonState?.Button || {};
        },
        buttonStates() {
            return this.getLocalizationProp('Data.LiveSession.ButtonStates', []);
        },
        eventTime() {
            return this.getLocalizationProp('Data.LiveSession.EventTime');
        },
        isButtonStart() {
            return isTimeReached(this.liveSessionData?.buttonStart);
        },
        isCutoff() {
            return isTimeReached(this.liveSessionData?.cutoff);
        },
        isEventEnd() {
            return isTimeReached(this.liveSessionData?.eventEnd);
        },
        isEventStart() {
            return isTimeReached(this.liveSessionData?.eventStart);
        },
        isEventStartDay() {
            return isTimeReached(this.liveSessionData?.eventStartDay);
        },
        isWalkInStart() {
            return isTimeReached(this.liveSessionData?.walkInStart);
        },
        lambdaUrl() {
            return this.getLocalizationProp('Data.LiveSession.LambdaUrl');
        }
    },
    mounted() {
        this.startEventPolling();
    },
    beforeDestroy() {
        this.clearEventPollingInterval();
    },
    methods: {
        clearEventPollingInterval() {
            clearInterval(this.eventPollingInterval);
            this.eventPollingInterval = null;
        },
        fetchEventData() {
            if(process.env.NODE_ENV === 'development') {
                apiLambdaEvents.get().then(response => {
                    this.liveSessionData = response.data;
                });
            } else {
                fetch(this.lambdaUrl)
                    .then(response => response.json())
                    .then(response => {
                        this.liveSessionData = response;
                    })
                    .catch(error => {
                        console.error('Error fetching Lambda events:', error);
                    });
            }
        },
        startEventPolling() {
            if(this.eventPollingInterval) {
                return;
            }
            this.fetchEventData();
            this.eventPollingInterval = setInterval(() => this.fetchEventData(), this.apiInterval);
        }
    }
};

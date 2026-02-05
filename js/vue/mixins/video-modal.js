import eventBus from '@common/source/js/vue/mixins/event-bus';
import getPlayTime from '../utils/get-play-time';

export default {
    props: {
        amountFormatted: {
            type: String,
            default: ''
        },
        amountValue: {
            type: Number,
            default: 0
        },
        ariaHidden: {
            type: String,
            default: ''
        },
        dataIndex: {
            type: Number,
            default: null
        },
        desc: {
            type: String,
            default: ''
        },
        hasReset: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            default: ''
        },
        isCn: {
            type: Boolean,
            default: false
        },
        isNew: {
            type: Boolean,
            default: false
        },
        isWatched: {
            type: Boolean,
            default: false
        },
        isMonth: {
            type: String,
            default: ''
        },
        lte: {
            type: Object,
            default () {
                return {};
            }
        },
        localization: {
            type: Object,
            default () {
                return {};
            }
        },
        localizationDefault: {
            type: Object,
            default () {
                return {
                    'ClickToWatch': 'Click to watch',
                    'LoyaltyShoppingDollars': 'Loyalty Shopping Dollars',
                    'New': 'New',
                    'OutOf': 'out of',
                    'PlayTime': 'Play time',
                    'Showing': 'Showing',
                    'To': 'to',
                    'Video': 'video',
                    'Watched': 'Watched'
                };
            }
        },
        allowSeek: {
            type: Boolean,
            default: false
        },
        preventSeek: {
            type: Boolean,
            default: false
        },
        quiz: {
            type: Object,
            default () {
                return {};
            }
        },
        tabIndex: {
            type: Number,
            default: 0
        },
        title: {
            type: String,
            default: ''
        },
        videoData: {
            type: Object,
            default () {
                return {};
            }
        },
        videoItemId: {
            type: String,
            default: ''
        },
        videoStatus: {
            type: String,
            default: '' // new, watched or reset
        }
    },

    data() {
        return {
            shouldHideModal: false,
            preventCloseClass: '' // value "-exitConfirm" used to hide X for new customer video 's confrim modal
        };
    },

    computed: {
        amountValueComp() {
            return (!this.hasLsdToActivate) ? 0 : this.lte?.Metadata?.LsdAmount;
        },

        amountFormattedComp() {
            return this.lte?.Metadata?.FormattedLsdAmount;
        },

        hasLsdToActivate() {
            return this.lte?.HasLsdToActivate;
        },

        hasLTE() {
            return (this.lte) ? Object.keys(this.lte).length : null;
        },

        quizComp() {
            return this.lte?.Quiz;
        },

        setLocalization() {
            return Object.keys(this.localization).length ? this.localization : this.localizationDefault;
        },

        setPlayTime() {
            return (this.videoData && this.videoData.RuntimeSeconds) ? this.videoData.RuntimeSeconds : '';
        },

        setVideoStatus() {
            if(!this.isNew && !this.isWatched) {
                return null;
            } else if(this.isWatched) {
                return this.checkLocalization('Watched');
            } else {
                return this.checkLocalization('New');
            }
        },

        setMonthStatus() {
            if(this.isMonth === null || this.isMonth === '') {
                return null;
            } else {
                return this.isMonth;
            }
        }
    },

    mounted() {
        this.setPlayNextVideo();

        // load video once modal is shown and all refs are mounted
        this.$modal.$on.shown(() => {
            this.loadVideo();
        });
    },

    methods: {
        checkLocalization(val) {
            if(!this.setLocalization[val]) {
                return this.localizationDefault[val];
            } else {
                return this.setLocalization[val];
            }
        },
        changeModalMargin(val) {
            this.$modal.show({
                focusEl: '.a-closeX',
                id: 'modal-video',
                margin: val,
                width: '640px'
            });
        },
        changeModalSize(val) {
            this.$modal.config({
                focusEl: '.a-closeX',
                id: 'modal-video',
                class: this.preventCloseClass,
                margin: '0',
                width: val
            });
        },

        getPlayTimeResult(time) {
            return getPlayTime(time);
        },

        loadVideo() {
            // REGULAR Flow
            if(this.$refs.vidRegFlow) {
                // Start player
                this.$refs.vidRegFlow.callPlayer();
                // Set as possible to close modal
                this.shouldHideModal = true;
            }

            // REGULAR Flow New Customer Video
            if(this.$refs.vidRegFlowNewCustomer) {
                // Start player
                this.$refs.vidRegFlowNewCustomer.callPlayer();
            }

            // LTE Flow
            if(this.$refs.vidL2eFlow) this.$refs.vidL2eFlow.modalLteVideoFlow();

            // Welcome Video Flow
            if(this.$refs.vidWelcomeFlow) {
                this.$refs.vidWelcomeFlow.callPlayer();
            }

            // Coupon Video Flow
            if(this.$refs.vidCouponFlow) {
                this.$refs.vidCouponFlow.callPlayer();
            }
        },

        openModal(event, isOnModal) {
            // On load open video with no margin on left or right
            this.changeModalMargin('0');

            // If is already on Modal
            if(isOnModal) {
                // load video on nextTick so that refs are ready and mounted
                this.$nextTick(() => {
                    this.loadVideo();
                });
            }

            // Grab info about the clicked obj
            const targetEl = event?.target;
            let indexEl = targetEl?.getAttribute('data-index');

            eventBus.$on('shouldHideModal', () => {
                this.shouldHideModal = true;
            });

            // Closing modal
            this.$modal.$on.hidden(() => {
                this.shouldHideModal = false;

                // If el was removed from DOM,
                // Forcing focus the element based on the attr.
                if(indexEl) {
                    document.querySelector(`[data-index="${indexEl}"]`).focus();
                    indexEl = null;
                }
            });
        },

        setPlayNextVideo() {
            eventBus.$on('playNextVideo', (payload) => {
                if(payload === this.id) this.$refs.callFlowBtn.click();
            });
        },

        setShouldHideModal() {
            this.shouldHideModal = true;
        },

        setShouldNotHideModal() {
            this.shouldHideModal = false;
        },
        willHideModal() {
            if(this.isWelcomeVideo) {
                if(this.shouldHideModal || (this.isWatched)) {
                    // Close modal (for video-not-completed modal) with Welcome Video
                    return true;
                } else {
                    // Show exit confirmation for Welcome Video
                    this.$refs['vidWelcomeFlow']?.showModalExitConfirm();
                }
            } else if(this.isCoupon) {
                if(this.shouldHideModal || this.isWatched) {
                    // Close modal (for video-not-completed modal) with Coupon Video
                    return true;
                } else {
                    // Show exit confirmation for Coupon Video
                    // Can't use a ref here as the video component is made when the user clicks
                    // on the first video, and we don't have access to it when they click on the second
                    // video.
                    eventBus.$emit('callExitConfirmation');
                }
            } else if(this.isCn || this.amountValueComp === 0 || !this.hasLsdToActivate || !this.amountValueComp || this.shouldHideModal || (this.isWatched && !this.hasReset)) {
                // Close modal
                return true;
            } else {
                // Show exit confirmation
                if(this.hasLTE) eventBus.$emit('callExitConfirmation');
            }
        }
    }
};

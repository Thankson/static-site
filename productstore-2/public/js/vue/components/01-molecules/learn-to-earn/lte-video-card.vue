<template>
    <article class="m-lteVidCard" :class="setCardSize">
        <div class="m-lteVidCard__wrapper" :class="setCardSize">

            <button
                ref="callFlowBtn"
                class="m-lteVidCard__row -header"
                data-js="videoModal-open"
                :tabindex="tabIndex"
                :aria-hidden="ariaHidden"
                v-on:click="callFlow()">

                <div class="m-lteVidCard__header">
                    <div class="m-lteVidCard__tags">

                        <div v-if="(!isWatched || hasReset) && amountValue > 0" class="m-lteVidCard__amount">
                            <span class="sr-only">
                                {{ amountFormatted }} {{ checkLocalization('LoyaltyShoppingDollars') }}
                            </span>
                            <span aria-hidden="true">{{ amountFormatted }}</span>
                        </div>

                        <div v-if="setVideoStatus" class="m-lteVidCard__status">
                            <span class="sr-only">{{ setVideoStatus }} {{ checkLocalization('Video') }}</span>
                            <span aria-hidden="true">{{ setVideoStatus }}</span>
                        </div>

                        <span v-if="setPlayTime" class="sr-only">
                            {{ checkLocalization('PlayTime') }} : {{ getPlayTimeResult(setPlayTime) }}
                        </span>
                        <div v-if="setPlayTime" class="m-lteVidCard__time -play" aria-hidden="true">
                            <span>{{ getPlayTimeResult(setPlayTime) }}</span>
                        </div>
                        <span class="sr-only">{{ checkLocalization('ClickToWatch') }}</span>
                    </div>
                    <div class="m-lteVidCard__media" :class="setCardSize">
                        <img
                            v-if="videoData && videoData.ThumbnailImageUrl"
                            :src="videoData.ThumbnailImageUrl"
                            :alt="videoData.Title + '-' + checkLocalization('ClickToWatch')"
                            class="m-lteVidCard__img"
                            :class="setCardSize">
                        <img
                            v-else
                            :src="thumbImgDefault"
                            alt=""
                            class="m-lteVidCard__img"
                            :class="setCardSize">
                    </div>
                </div>
            </button>
            <div v-if="setCardSize !== '-lp' && setCardSize !== '-enrollment'" class="m-lteVidCard__row -body">
                <div v-if="title" class="m-lteVidCard__title">
                    {{ title }}
                </div>
                <div v-if="desc" class="m-lteVidCard__desc" v-html="desc"></div>
            </div>
        </div>

        <o-lte-vid-flow
            :id="id"
            ref="lteVideoFlow"
            :amount-formatted="amountFormatted"
            :amount-value="amountValue"
            :has-reset="hasReset"
            :is-new="isNew"
            :is-watched="isWatched"
            :localization="localization"
            :quiz="quiz"
            :video-data="videoData"
        >
        </o-lte-vid-flow>
    </article>

</template>

<script>
    import getPlayTime from '../../../utils/get-play-time';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'MLteVidCard',
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
            cardSize: {
                type: String,
                default: 'grid' // grid, lp, carousel, enrollment
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
            isNew: {
                type: Boolean,
                default: false
            },
            isWatched: {
                type: Boolean,
                default: false
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
            modalCloseTxt: {
                type: String,
                default: ''
            },
            modalWrapper: {
                type: String,
                default: null
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
            thumbImgDefault: {
                type: String,
                default: 'https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg'
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
            videoStatus: {
                type: String,
                default: '' // new, watched or reset
            }
        },
        data() {
            return {};
        },
        computed: {
            setLocalization() {
                return Object.keys(this.localization).length ? this.localization : this.localizationDefault;
            },

            setCardSize() {
                return this.cardSize ? `-${this.cardSize}` : '-grid';
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
            }
        },

        mounted() {
            this.setPlayNextVideo();
            this.replayVideo();
        },

        methods: {
            callFlow() {
                if(this.modalWrapper) {
                    this.$modal.hide({ id: this.modalWrapper });
                }
                setTimeout(() => {
                    this.$refs.lteVideoFlow.modalLteVideoFlow();
                }, 300);
            },

            checkLocalization(val) {
                if(!this.setLocalization[val]) {
                    return this.localizationDefault[val];
                } else {
                    return this.setLocalization[val];
                }
            },

            getPlayTimeResult(time) {
                return getPlayTime(time);
            },

            replayVideo() {
                eventBus.$on('replayVideo', (payload) => {
                    if(payload === this.id) this.$refs.callFlowBtn.click();
                });
            },

            setPlayNextVideo() {
                eventBus.$on('playNextVideo', (payload) => {
                    if(payload === this.id) this.$refs.callFlowBtn.click();
                });
            }
        }
    };
</script>

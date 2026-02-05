<template>
    <article class="m-souShelf">
        <a :href="link.Url" :target="link.Target" @click="gtmData()">
            <div>
                <h2 class="m-souShelf__title">{{ title }}</h2>

                <div v-if="variation === 'Variation1'">
                    <p v-for="(message, i) in pointsAwayMessage" :key="i" class="m-souShelf__text" v-html="message"></p>
                </div>

                <div v-if="variation === 'Variation2'">
                    <p v-for="(message, i) in pointsAwayMessage" :key="i" class="m-souShelf__text">
                        <strong class="italic">{{ message[0] }}</strong>
                        {{ message[1] }}
                    </p>
                    <p class="m-souShelf__text">{{ thresholdMessage }}</p>
                </div>

                <div v-if="variation === 'Variation3'">
                    <p class="m-souShelf__text" v-html="thresholdMessage"></p>
                </div>
            </div>
            <p class="m-souShelf__text -link">{{ link.Text }}</p>
        </a>
    </article>
</template>
<script>
    export default {
        name: 'MShippingOnUsShelf',
        props: {
            availableOffers: {
                type: Array,
                default() {
                    return [];
                }
            },
            currentOffer: {
                type: Object,
                default () {
                    return {};
                }
            },
            labels: {
                type: Object,
                default () {
                    return {};
                }
            },
            link: {
                type: Object,
                default () {
                    return {};
                }
            },
            souFeatureOn: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                variation: '',
                pointsAwayMessage: [],
                thresholdMessage: ''
            };
        },
        computed: {
            title() {
                return this.labels[this.variation]?.Title;
            }
        },
        async mounted() {
            this.$nextTick(() => {
                this.setShippingOnUsBannerCopy();
            });
        },
        methods: {
            gtmData() {
                window.dataLayer && window.dataLayer.push({
                    'event': 'Shipping on US ATC',
                    'eventaction': 'CTA',
                    'eventlabel': this.link.Text
                });
            },
            setShippingOnUsBannerCopy() {
                if(this.currentOffer.WillEarn === false) {
                    // has not met any offers yet

                    this.variation = 'Variation1';
                    // eslint-disable-next-line
                    this.pointsAwayMessage = this.availableOffers
                        .sort((a, b) => b.SortOrder - a.SortOrder)
                        .map(obj => {
                            return this.labels.Variation1.PointsAway
                                .replace('{0}', obj.PointsUntilThreshold)
                                .replace('{1}', obj.FormattedPercentageRate);
                        });
                } else if(this.currentOffer.WillEarn === true && this.availableOffers.length > 0) {
                    // has met 50% offer threshold

                    this.variation = 'Variation2';
                    this.pointsAwayMessage = [...this.availableOffers]
                        .sort((a, b) => b.SortOrder - a.SortOrder)
                        .map(obj => {
                            return [this.labels?.Variation2?.PointsAwayBegin?.replace('{0}', obj?.PointsUntilThreshold),
                                    this.labels?.Variation2?.PointsAwayEnd?.replace('{0}', obj?.FormattedPercentageRate)];
                        });
                    this.thresholdMessage =
                        this.labels.Variation2.ThresholdMessage?.replace('{0}', this.currentOffer.FormattedPercentageRate);
                } else if(this.currentOffer.WillEarn === true && this.availableOffers.length === 0) {
                    this.variation = 'Variation3';
                    this.thresholdMessage =
                        this.labels.Variation3.ThresholdMessage?.replace('{0}', this.currentOffer.FormattedPercentageRate);
                }
            }
        }
    };
</script>

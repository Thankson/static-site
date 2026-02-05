<template>
    <article v-if="souFeatureOn && foundMatches" data-component-name-is="MCartShippingOnUsBanner" class="m-cartShippingOnUsBanner bg-orange mx-0 p-10 mb-40 rounded-md relative md:w-full md:px-24 md:py-12 cursor-pointer" @click="toggleExpand">
        <div v-if="expanded" class="material-icons absolute top-10 right-10" aria-hidden>close</div>
        <div class="md:flex md:justify-between md:items-end">
            <div class="md:w-3_4">
                <h2 class="text-base font-bold text-gray-150 uppercase">{{ title }}</h2>

                <div v-if="variation === 'Variation1'">
                    <p v-for="(message, i) in pointsAwayMessage" :key="i" class="text-sm leading-tight md:text-base" v-html="message"></p>
                </div>

                <div v-if="variation === 'Variation2'">
                    <p v-for="(message, i) in pointsAwayMessage" :key="i" class="text-sm leading-tight md:text-base">
                        <strong class="italic">{{ message[0] }}</strong>
                        {{ message[1] }}
                    </p>
                    <p class="text-sm leading-tight md:text-base">{{ thresholdMessage }}</p>
                </div>

                <div v-if="variation === 'Variation3'">
                    <p class="text-sm leading-tight md:text-base" v-html="thresholdMessage"></p>
                </div>
            </div>
            <button class="text-sm uppercase font-bold underline md:text-base" :class="{'invisible': expanded}">{{ labels.Details }}</button>
        </div>
        <transition-expand>
            <div v-if="expanded" aria-live="polite" class="md:w-5_6">
                <p class="text-sm leading-tight md:text-base md:mt-30" v-html="labels.CollapsedMessage"></p>
                <button class="text-sm uppercase font-bold underline md:text-base">{{ labels.Close }}</button>
            </div>
        </transition-expand>
    </article>
</template>

<script>
    export default {
        name: 'MCartShippingOnUsBanner',
        props: {
            labels: {
                type: Object,
                default () {
                    return {};
                }
            },
            currentOffer: {
                type: Object,
                default () {
                    return {};
                }
            },
            availableOffers: {
                type: Array,
                default() {
                    return [];
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
                thresholdMessage: '',
                expanded: false,
                foundMatches: true
            };
        },
        computed: {
            title() {
                return this.labels[this.variation]?.Title;
            }
        },
        watch: {
            availableOffers: function() {
                this.setShippingOnUsBannerCopy();
            },
            currentOffer: function() {
                this.setShippingOnUsBannerCopy();
            }
        },
        mounted() {
            if(this.souFeatureOn) {
                this.setShippingOnUsBannerCopy();
            }
        },
        methods: {
            setShippingOnUsBannerCopy() {
                if(this.currentOffer.WillEarn === false) {
                    // has not met any offers yet

                    this.variation = 'Variation1';
                    this.pointsAwayMessage = [...this.availableOffers]
                        .sort((a, b) => b.SortOrder - a.SortOrder)
                        .map(obj => {
                            return this.labels.Variation1?.PointsAway
                                .replace('{0}', obj.PointsUntilThreshold)
                                .replace('{1}', obj.FormattedPercentageRate);
                        });
                } else if(this.currentOffer?.WillEarn === true && this.availableOffers.length > 0) {
                    // has met 50% offer threshold

                    this.variation = 'Variation2';
                    this.pointsAwayMessage = [...this.availableOffers]
                        .sort((a, b) => b.SortOrder - a.SortOrder)
                        .map(obj => {
                            return [this.labels?.Variation2?.PointsAwayBegin?.replace('{0}', obj?.PointsUntilThreshold),
                                    this.labels?.Variation2?.PointsAwayEnd?.replace('{0}', obj?.FormattedPercentageRate)];
                        });
                    this.thresholdMessage =
                        this.labels?.Variation2?.ThresholdMessage?.replace('{0}', this.currentOffer?.FormattedPercentageRate);
                } else if(this.currentOffer?.WillEarn === true && this.availableOffers.length === 0) {
                    // has met 100% offer threshold

                    this.variation = 'Variation3';
                    this.thresholdMessage =
                        this.labels?.Variation3?.ThresholdMessage?.replace('{0}', this.currentOffer?.FormattedPercentageRate);
                } else {
                    this.foundMatches = false;
                }
            },
            toggleExpand(e) {
                this.expanded = !this.expanded;
                this.dataLayerPush(e.target.innerText);
            },
            dataLayerPush(eventlabel) {
                window.dataLayer && window.dataLayer.push(
                    {
                        'event': 'Shipping on Us Cart',
                        'eventaction': 'CTA',
                        eventlabel
                    });
            }
        }
    };
</script>

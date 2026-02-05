<template>
    <article v-if="souFeatureOn && foundMatches && !minimalMarketing" data-component-name-is="MBogoShippingOnUsBanner" class="m-bogoShippingOnUsBanner relative bg-orange mx-8 p-10 mb-40 rounded-md md:mx-auto md:px-24 md:py-12 cursor-pointer" @click="toggleExpand">
        <a-loading-spinner :visible="souLoading"></a-loading-spinner>
        <div v-show="!souLoading" class="md:flex md:justify-between md:items-end" @click="track">
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
            </div>
            <button class="text-sm uppercase font-bold underline md:text-base" :class="{'hidden': expanded}">{{ labels.Details }}</button>
        </div>
        <transition-expand>
            <div v-if="expanded" aria-live="polite" class="w-full md:flex justify-between items-end">
                <p class="text-sm leading-tight mt-20 md:text-base md:mt-30 md:w-5_6" v-html="labels.CollapsedMessage"></p>
                <button class="text-sm uppercase font-bold underline md:text-base md:pl-10">{{ labels.Close }}</button>
            </div>
        </transition-expand>
    </article>
</template>
<script>
    import { mapActions, mapState } from 'vuex';

    export default {
        name: 'MBogoShippingOnUsBanner',
        props: {
            labels: {
                type: Object,
                default () {
                    return {};
                }
            }
        },
        data() {
            return {
                variation: '',
                pointsAwayMessage: [],
                thresholdMessage: '',
                foundMatches: true,
                expanded: false
            };
        },
        computed: {
            ...mapState('shippingOnUs', ['minimalMarketing', 'souFeatureOn', 'currentOffer', 'availableOffers', 'souLoading']),
            title() {
                return this.labels[this.variation]?.Title;
            }
        },
        watch: {
            souFeatureOn(val) {
                if(val) {
                    this.setShippingOnUsBannerCopy();

                    this.$shelf.$on.hidden(async () => {
                        await this.getCartSouData();
                        this.setShippingOnUsBannerCopy();
                    });
                }
            }
        },
        methods: {
            ...mapActions('shippingOnUs', ['getCartSouData']),

            setShippingOnUsBannerCopy() {
                if(this.currentOffer.WillEarn === false) {
                    // has not met any offers yet

                    this.variation = 'Variation1';
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
                        this.labels?.Variation2?.ThresholdMessage?.replace('{0}', this.currentOffer?.FormattedPercentageRate);
                } else {
                    this.foundMatches = false;
                }
            },
            track(e) {
                this.dataLayerPush(e.target.innerText);
            },
            toggleExpand(e) {
                this.expanded = !this.expanded;
                this.dataLayerPush(e.target.innerText);
            },
            dataLayerPush(eventlabel) {
                window.dataLayer && window.dataLayer.push(
                    {
                        'event': 'Shipping on Us Bogo',
                        'eventaction': 'CTA',
                        eventlabel
                    });
            }
        }
    };
</script>

<template>
    <article v-if="souFeatureOn && foundMatches" data-component-name-is="MReceiptShippingOnUsBanner" class="m-receiptShippingOnUsBanner bg-orange mx-0 p-10 mb-16 rounded-md relative md:w-full md:px-24 md:py-12" style="margin-top: -16px;">
        <a v-if="variation === 'Variation1'" :href="link.Url" class="md:flex justify-between" @click="track">
            <h2 class="sr-only">{{ title }}</h2>
            <p class="text-sm leading-tight md:text-base">
                {{ copy }} <strong class="uppercase">{{ title }}</strong>
            </p>
            <p class="text-sm uppercase font-bold underline md:text-base" tabindex="0" role="link">{{ link.Text }}</p>
        </a>
        <div v-if="variation === 'Variation2'">
            <h2 class="text-sm font-bold leading-tight text-gray-150 uppercase float-left mr-5 md:text-base">{{ title }}</h2>
            <p class="text-sm leading-tight md:text-base" v-html="copy"></p>
        </div>
    </article>
</template>

<script>
    export default {
        name: 'MReceiptShippingOnUsBanner',
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
            },
            link: {
                type: Object,
                default () {
                    return {};
                }
            },
            defaultShippingMethodUsed: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                variation: '',
                copy: '',
                foundMatches: true
            };
        },
        computed: {
            title() {
                return this.labels[this.variation]?.Title;
            }
        },
        watch: {
            defaultShippingMethodUsed: function() {
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
                if(this.currentOffer?.WillEarn === false) {
                    // has not met any offers yet

                    this.variation = 'Variation1';
                    this.copy = this.labels?.Variation1?.PointsAway
                        .replace('{0}', this.availableOffers[this.availableOffers.length - 1]?.MinPoints);
                } else if(this.currentOffer?.WillEarn === true) {
                    let thresholdMessage = this.defaultShippingMethodUsed ? 'ThresholdMessage' : 'ThresholdMessageNotGround';
                    let formattedValue = this.defaultShippingMethodUsed ? 'FormattedPercentageRate' : 'FormattedReimbursementValue';
                    // has met 50% offer threshold

                    this.variation = 'Variation2';
                    this.copy = this.labels?.Variation2?.[thresholdMessage]
                        .replace('{0}', this.currentOffer?.[formattedValue]);
                } else {
                    this.foundMatches = false;
                }
            },
            track(e) {
                this.dataLayerPush(e.target.innerText);
            },
            dataLayerPush(eventlabel) {
                window.dataLayer && window.dataLayer.push(
                    {
                        'event': 'Shipping on Us Receipt',
                        'eventaction': 'CTA',
                        eventlabel
                    });
            }

        }
    };
</script>

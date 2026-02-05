<template>
    <article v-if="souFeatureOn && foundMatches" data-component-name-is="MCheckoutShippingOnUsBanner" :class="shippingMessageClass" style="margin-top: -16px;">
        <a :href="link.Url" @click="track">
            <h2 class="text-sm font-bold leading-tight text-gray-150 uppercase float-left mr-5 md:text-base">{{ title }}</h2>
            <p class="text-sm leading-tight md:text-base">
                <span v-for="(message, i) in copy" :key="i" v-html="message"> </span>
            </p>
            <p v-show="variation !== 'Variation3'" class="text-sm uppercase font-bold underline md:text-base" tabindex="0" role="link">{{ link.Text }}</p>
        </a>
    </article>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'MCheckoutShippingOnUsBanner',
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
            // isSgMy: {
            //     type: Boolean,
            //     default: false
            // },
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
                copy: [],
                thresholdMessage: '',
                foundMatches: true
            };
        },
        computed: {
            ...mapState('checkout', ['selectedShippingOption', 'shippingOptions']),
            shipMethod() {
                return this.shippingOptions;
            },
            isSgMy() {
                return this.$env?.Country === 'Singapore' || this.$env?.Country === 'Malaysia';
            },
            // Styling for SG and MY is the same as the Shipping Message styling in other cultures
            shippingMessageClass() {
                return !this.isSgMy ? 'm-checkoutShippingOnUsBanner bg-orange mx-0 p-10 mb-16 rounded-md relative md:w-full md:px-24 md:py-12 cursor-pointer' : 'p-checkout__message mb-10';
            },
            title() {
                return this.labels[this.variation]?.Title;
            }
        },
        watch: {
            shipMethod: function() {
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
                let usingDefaultShipping = this.determineDefaultShipping(this.selectedShippingOption, this.shippingOptions);
                let thresholdMessage = usingDefaultShipping ? 'ThresholdMessage' : 'ThresholdMessageNotGround';
                let formattedValue = usingDefaultShipping ? 'FormattedPercentageRate' : 'FormattedReimbursementValue';

                if(this.currentOffer.WillEarn === false) {
                    // has not met any offers yet
                    this.variation = 'Variation1';
                    this.copy = [...this.availableOffers]
                        .sort((a, b) => b.SortOrder - a.SortOrder)
                        .map((obj, i) => {
                            if(i === 0) {
                                return this.labels.Variation1.PointsAwayFlat
                                    .replace('{0}', obj.PointsUntilThreshold)
                                    .replace('{1}', obj.FormattedPercentageRate);
                            } else {
                                return this.labels.Variation1.PointsAway
                                    .replace('{0}', obj.PointsUntilThreshold)
                                    .replace('{1}', obj.FormattedPercentageRate);
                            }
                        });
                } else if(this.currentOffer.WillEarn === true && this.availableOffers.length > 0) {
                    // has met 50% offer threshold

                    this.variation = 'Variation2';
                    this.copy = [
                        this.labels?.Variation2?.PointsAwayFlat
                            ?.replace('{0}', this.availableOffers[this.availableOffers.length - 1]?.PointsUntilThreshold)
                            ?.replace('{1}', this.availableOffers[this.availableOffers.length - 1]?.FormattedPercentageRate),
                        this.labels?.Variation2?.[thresholdMessage]
                            ?.replace('{0}', this.currentOffer?.[formattedValue])
                    ];
                } else if(this.currentOffer?.WillEarn === true && this.availableOffers.length === 0) {
                    // has met 100% offer threshold

                    this.variation = 'Variation3';
                    this.copy =
                        [this.labels?.Variation3?.[thresholdMessage]?.replace('{0}', this.currentOffer?.[formattedValue])];
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
                        'event': 'Shipping on Us Checkout',
                        'eventaction': 'CTA',
                        eventlabel
                    });
            },
            determineDefaultShipping(selected, all) {
                // if it is zero then it is the default shipping
                return all.indexOf(selected) === 0;
            }
        }

    };
</script>

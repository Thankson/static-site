<template>
    <div ref="cartSummaryRef" class="m-cartSummary" aria-live="polite" aria-atomic="true">
        <h3 v-if="$slots['heading']" class="m-cartSummary__heading" :class="{'md:mt-0':isCn}">
            <slot name="heading" />
        </h3>

        <ul>
            <li class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="item-total">
                        Item Total
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ itemTotal }}
                </span>
            </li>
            <li v-if="showWelcomeProgramLsd" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="welcome-program-lsd">
                        <span class="underline">$20 Free Products</span><br />
                        used this order
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    -{{ welcomeProgramLsd }}
                </span>
            </li>
            <li v-if="showLsdTotal && (isCn ? isCNPreferredPrice : true)" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="lsd-total">
                        <u>Loyalty Shopping Dollars</u><br />
                        used this order
                    </slot>
                </span>
                <span v-if="isCn" class="m-cartSummary__desc">
                    <template v-if="lsdUsed > 0">{{ lsdTotalFormatted }}</template>
                    <template v-else>{{ lsdTotal }}</template>
                </span>
                <span v-else class="m-cartSummary__desc">
                    <template v-if="lsdUsed > 0">-</template>{{ lsdTotal }}
                </span>
            </li>
            <li v-if="showCcTotal && !isCn" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="cc-total">
                        <u>Convenience Certificates</u><br />
                        used this order
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    -{{ ccTotal }}
                </span>
            </li>
            <li v-if="shippingHandling && !isCn" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="shipping-handling">
                        <u>Shipping & Handling</u>
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ shippingHandling ? shippingHandling : pendingLabel }}<span v-if="showShippingOnUsMarker">{{ shippingOnUsMarker }}</span>
                </span>
            </li>
            <li v-if="salesTax && !isCn && !hideSalesTax" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="sales-tax">
                        <u>Sales Tax</u>
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    <span>{{ salesTax ? salesTax : pendingLabel }}</span>
                </span>
            </li>

            <li v-if="showLsdRedemptionFee" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="lsd-redemption-fee">
                        <u>LSD Redemption Fee</u>
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ redemptionFee }}
                </span>
            </li>

            <li v-if="totalDiscount !== 0 && productDiscount && (isCn ? isCNPreferredPrice : true)" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="product-discount">
                        <u>Product Discount</u>
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ productDiscount }}
                </span>
            </li>

            <li v-if="shippingHandling && isCn" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="shipping-handling">
                        <u>Shipping & Handling</u>
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ shippingHandling }}<span v-if="showShippingOnUsMarker">{{ shippingOnUsMarker }}</span>
                </span>
            </li>
            <li v-if="serviceTax" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="service-tax">
                        <u>Service Tax</u>
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ serviceTax }}
                </span>
            </li>
        </ul>

        <hr class="m-cartSummary__divider" />

        <ul>
            <li v-if="$slots['subtotal'] && subtotal" class="m-cartSummary__item">
                <span class="m-cartSummary__title -subtotal">
                    <slot name="subtotal">
                        Subtotal
                    </slot>
                </span>
                <span class="m-cartSummary__desc -subtotal">
                    {{ subtotal }}
                </span>
            </li>

            <!-- Delete cntotal instead of the total -->

            <!-- Credit on Account (coa) -->
            <li v-if="$slots['coa'] && coaFormatted" class="m-cartSummary__item">
                <span class="m-cartSummary__title -coa">
                    <slot name="coa">
                        Credit on Account used this order
                    </slot>
                </span>
                <span class="m-cartSummary__desc -coa">
                    {{ coaFormatted }}
                </span>
            </li>

            <hr v-if="subtotal" class="m-cartSummary__divider" />

            <li v-if="$slots['total']" class="m-cartSummary__item">
                <span class="m-cartSummary__title -total">
                    <slot name="total">
                        Total
                    </slot>
                </span>
                <strong class="m-cartSummary__desc -total">
                    {{ total }}
                </strong>
            </li>

            <hr v-if="userFlags.ViewPointsHighlight && total" class="m-cartSummary__divider" />

            <!-- GST Inclusive -->
            <li v-if="showGstInOrderSummary" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="salex-taxes">
                        GST Inclusive
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ salesTax ? salesTax : pendingLabel }}
                </span>
            </li>

            <!-- VAT Inclusive -->
            <li v-if="showVatInOrderSummary" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="vat-taxes">
                        VAT Inclusive
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ salesTax ? salesTax : pendingLabel }}
                </span>
            </li>
            <li v-if="$slots['commitment'] && showCommitment" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="commitment">
                        Commitment
                    </slot>
                </span>
                <span class="m-cartSummary__desc">
                    {{ commitment }}
                </span>
            </li>
            <li v-if="viewPoints && !hideOrderHistoryProductPoints" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="points">
                        Points
                    </slot>
                </span>
                <span class="m-cartSummary__desc" :class="{ '-highlight': userFlags.ViewPointsHighlight }">
                    {{ points }}
                </span>
            </li>
            <li v-if="$slots['shipping-taxes'] && !isCn" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="shipping-taxes">
                        Shipping and taxes<br />
                        (calculated in checkout)
                    </slot>
                </span>
                <span
                    class="m-cartSummary__desc">
                    <span>{{ shipping ? shipping : pendingLabel }}</span>
                </span>
            </li>
            <li v-if="isCn && isCart" class="m-cartSummary__item">
                <span class="m-cartSummary__title">
                    <slot name="shipping-taxes">
                        <u>Shipping & Handling</u>
                    </slot>
                </span>
                <span class="m-cartSummary__desc text-xl">
                    {{ pendingLabel }}
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'MCartSummary',
        props: {
            ccTotal: {
                default: '',
                type: String
            },
            coaFormatted: {
                default: '',
                type: String
            },
            commitment: {
                default: '',
                type: String
            },
            hideOrderHistoryProductPoints: {
                default: false,
                type: Boolean
            },
            hideSalesTax: {
                default: false,
                type: Boolean
            },
            isCart: {
                default: false,
                type: Boolean
            },
            isCn: {
                default: false,
                type: Boolean
            },
            isPreferred: {
                default: false,
                type: Boolean
            },
            itemTotal: {
                required: true,
                type: String
            },
            lsdTotal: {
                default: '',
                type: String
            },
            lsdUsed: {
                default: null,
                type: Number
            },
            points: {
                required: true,
                type: [String, Number]
            },
            productDiscount: {
                default: '',
                type: String
            },
            redemptionFee: {
                default: '',
                type: String
            },
            salesTax: {
                default: '',
                type: String
            },
            serviceTax: {
                default: '',
                type: String
            },
            shipping: {
                default: '',
                type: String
            },
            shippingHandling: {
                default: '',
                type: String
            },
            shippingOnUsMarker: {
                default: '',
                type: String
            },
            showCcTotal: {
                default: false,
                type: Boolean
            },
            showGstInOrderSummary: {
                default: false,
                type: Boolean
            },
            showLsdRedemptionFee: {
                default: false,
                type: Boolean
            },
            showLsdTotal: {
                default: false,
                type: Boolean
            },
            showWelcomeProgramLsd: {
                default: false,
                type: Boolean
            },
            showPurchaseCommitment: {
                default: false,
                type: Boolean
            },
            showShippingOnUsMarker: {
                default: false,
                type: Boolean
            },
            showVatInOrderSummary: {
                default: false,
                type: Boolean
            },
            subtotal: {
                default: '',
                type: String
            },
            total: {
                default: '',
                type: String
            },
            totalDiscount: {
                default: 0,
                type: Number
            },
            viewPoints: {
                type: Boolean,
                default: false
            },
            welcomeProgramLsd: {
                default: '',
                type: String
            },
            pendingLabel: {
                default: '--',
                type: String
            }
        },
        computed: {
            ...mapState('commitmentProfile', ['commitmentProfile']),
            ...mapState('userFlags', ['userFlags']),

            isCNPreferredPrice() {
                return this.commitmentProfile?.CustomerPriceType === 'Preferred';
            },
            lsdTotalFormatted() {
                return this.lsdTotal.slice(0, 1) + '-' + this.lsdTotal.slice(1);
            },
            showCommitment() {
                return (this.showPurchaseCommitment || this.isCn) && this.commitment;
            }

        }
    };
</script>

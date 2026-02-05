<template>
    <article
        class="m-mscProductCard"
        :style="computedMargin">
        <div class="m-mscProductCard__link">
            <a
                :href="link"
                :alt="description"
                :tabindex="tabindex"
                @click="gtmClickPush()"
            >

                <img
                    :src="productImage"
                    :alt="productAlt"
                    class="m-mscProductCard__img"
                >

            </a>
        </div>

        <p :class="blockPriceClass">
            <span :class="titleClass">{{ save }} {{ savings }}</span>
            <span :class="subTitleClass">{{ subTitle }}</span>
            <span :class="blockPriceClassInner">
                <span class="sr-only">{{ forString }}</span>
                <s :class="oldPriceClass">{{ oldPrice }}</s>
                <span class="sr-only">{{ by }}</span>
                <em :class="priceClass">{{ price }}</em>
            </span>
            <span class="sr-only">{{ earn }}</span>
            <span v-if="!hidePoints && userFlags.ViewPoints" :class="[pointsClass, pointsHighlightStyle]">{{ points }}</span>
            <span class="sr-only">{{ purchase }}</span>

        </p>
        <!--Price/Unit-EU specific -->
        <PricePerUnit
            v-if="concentratedPricePerUnit"
            :label="concentratedLabel"
            :price="concentratedPricePerUnit"
            :unit="concentratedPricePerUnitMeasurementType"
            :tailwind-mods="`text-sm text-gray`"
        />
        <PricePerUnit
            v-if="dilutedPricePerUnit"
            :label="dilutedLabel"
            :price="dilutedPricePerUnit"
            :unit="dilutedPricePerUnitMeasurementType"
            :tailwind-mods="`text-sm text-gray`"

        />
        <PricePerUnit
            v-if="originalPricePerUnit"
            :price="originalPricePerUnit"
            :unit="originalPricePerUnitMeasurementType"
            :tailwind-mods="`text-sm text-gray`"
        />
        <div :class="buttonWrapperClass">
            <template v-if="offsaleDisplay">
                <span class="text-gray">{{ offsaleDisplay }}</span>
            </template>
            <template v-else>
                <o-shelf-configurator
                    :button-label="buttonAriaLabel"
                    :sku="sku"
                    :family-id="familyId"
                    :cart="orderType"
                    class="a-button text-xs py-12 px-16"
                    :class="buttonClasses"
                    :gtm-id="415"
                    :impressions-title="impressionsTitle"
                    :product-name="subTitle"
                    :tab-index="tabindex">
                    {{ cta }}
                </o-shelf-configurator>
            </template>
        </div>
    </article>
</template>

<script>
    import { mapState } from 'vuex';
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MMscProductCard',
        components: {
            PricePerUnit
        },
        props: {
            ariaProps: {
                type: String,
                default: 'aria-label="Custom Button Label" aria-expanded="true"'
            },
            blockPriceClass: {
                type: String,
                default: 'flex flex-col text-center text-gray'
            },
            blockPriceClassInner: {
                type: String,
                default: 'flex justify-center items-center pt-4'
            },
            buttonClasses: {
                type: String,
                default: ''
            },
            buttonWrapperClass: {
                type: String,
                default: 'relative flex justify-center mb-10 pt-4'
            },
            by: {
                type: String,
                default: 'By'
            },
            calculatedHeaderHeight: {
                type: Number,
                default: null
            },
            concentratedLabel: {
                type: String,
                default: ''
            },
            concentratedPricePerUnit: {
                type: String,
                required: true
            },
            concentratedPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            cta: {
                type: String,
                default: 'Add to Cart'
            },
            description: {
                type: String,
                default: 'Loading description...'
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            dilutedPricePerUnit: {
                type: String,
                default: ''
            },
            dilutedPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            earn: {
                type: String,
                default: 'Earn'
            },
            familyId: {
                type: String,
                required: true,
                default: ''
            },
            forString: {
                type: String,
                default: 'For'
            },
            image: {
                type: Object,
                default () {
                    return {};
                }
            },
            isErpDateValid: {
                type: Boolean,
                default: true
            },
            isInventoryControlled: {
                type: Boolean,
                default: false
            },
            isOffSale: {
                type: Boolean,
                default: false
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            isSoldOutLabel: {
                type: String,
                default: 'Sold Out'
            },
            link: {
                type: String,
                default: '#'
            },
            oldPrice: {
                type: String,
                default: '$0.00'
            },
            oldPriceClass: {
                type: String,
                default: 'text-sm line-through inline'
            },
            offSaleTitle: {
                type: String,
                default: ''
            },
            originalPricePerUnit: {
                type: String,
                default: ''
            },
            originalPricePerUnitMeasurementType: {
                type: String,
                default: ''
            },
            points: {
                type: String,
                default: '0 Points'
            },
            pointsClass: {
                type: String,
                default: 'text-sm leading-half pb-12'
            },
            price: {
                type: String,
                default: '$0.00'
            },
            priceClass: {
                type: String,
                default: 'text-xl font-bold not-italic text-gray-150 pl-5'
            },
            purchase: {
                type: String,
                default: 'with this purchase'
            },
            quantityAvailable: {
                type: Number,
                default: 0
            },
            rawPrice: {
                type: Number,
                default: null
            },
            save: {
                type: String,
                default: 'Save'
            },
            savings: {
                type: String,
                default: ''
            },
            sku: {
                type: String,
                required: true,
                default: ''
            },
            subTitle: {
                type: String,
                default: 'Loading...'
            },
            subTitleClass: {
                type: String,
                default: 'ml-5 mr-5 text-gray-120 text-base whitespace-pre-wrap'
            },
            slideIndex: {
                type: Number,
                default: 0
            },
            tabindex: {
                type: Number,
                default: -1
            },
            titleClass: {
                type: String,
                default: 'font-bold text-black leading-tight text-3xl md:text-2xl'
            }
        },
        data() {
            return {
                orderType: 'order'
            };
        },
        computed: {
            ...mapState('monthlySpecialCarousel', ['userFlags']),
            buttonAriaLabel() {
                return this.cta + ' ' + this.subTitle;
            },
            computedMargin() {
                return this.calculatedHeaderHeight ? { marginTop: this.calculatedHeaderHeight + 14 + 'px' } : {};
            },
            pointsHighlightStyle() {
                return this.userFlags.ViewPointsHighlight ? 'font-bold' : '';
            },
            productImage() {
                return this.image?.Url ?? 'https://cdnsc1.melaleuca.com/na/images/product-store/Image-Coming-Soon-Placeholder.jpg';
            },
            productAlt() {
                return this.image?.Alt ?? this.description;
            },
            hidePoints() {
                return !this.$custInfo?.viewPoints || false;
            },
            offsaleDisplay() {
                let offsaleDisplay = '';

                if(this.isErpDateValid) {
                    if(this.isOffSale) {
                        if(this.isInventoryControlled && this.quantityAvailable <= 0) {
                            offsaleDisplay = this.offSaleTitle;
                        }
                    } else {
                        if(this.isInventoryControlled && this.quantityAvailable <= 0) {
                            offsaleDisplay = this.isSoldOutLabel;
                        }
                    }
                } else {
                    offsaleDisplay = this.isOffSale ? this.offSaleTitle : this.isSoldOutLabel;
                }

                return offsaleDisplay;
            }
        },
        methods: {
            gtmClickPush() {
                const title = `${this.save} ${this.savings} ${this.subTitle}`;
                const cardLink = this.link || '';
                const data = {
                    'id': this.sku || '', // Product ID or SKU (string) - REQUIRED
                    'name': title || '', // Product name (string) - REQUIRED
                    'price': this.rawPrice || '', // Product price (string)
                    'brand': '', // Product brand (string)
                    'category': '', // Product category (string)
                    'variant': '', // Product variant (string)
                    'position': this.slideIndex || '' // Product position (number)
                };

                console.log('Click push msc card Data', data, cardLink);

                window.dataLayer && window.dataLayer.push({
                    'event': 'productClick',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '', // Local currency
                        'click': {
                            'actionField': {'list': this.impressionsTitle || this.$gtmList}, // Product list (string)
                            'products': [data]
                        }
                    },
                    'eventCallback': function() {
                        document.location = cardLink; // Product's Page URL (string)
                    }
                });
            },
            showPricePerUnit(concentrated, diluted, original) {
                return concentrated || diluted || original;
            }
        }
    };
</script>

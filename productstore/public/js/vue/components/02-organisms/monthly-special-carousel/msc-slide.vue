<template>
    <div class="relative h-full text-center md:min-w-full">
        <!-- LOADED SLIDE -->
        <!-- Slide BG -->
        <div
            class="o-monthlySpecial__bg"
            :style="{ 'background-image': `url(${setImageBg})` }" />

        <div class="o-monthlySpecial__wrapper">
            <!-- Product Cards -->
            <div class="o-monthlySpecial__cards">
                <div
                    v-for="(product, indexProd) in slide.products"
                    :key="indexProd"
                    :style="getCardWidth">

                    <m-msc-product-card
                        v-if="product.PriceRange"
                        ref="productCard"
                        :key="indexProd"
                        :aria-hidden="setAriaHiddenProd(indexProd)"
                        :by="by"
                        :calculated-header-height="calculatedHeaderHeight"
                        :concentrated-label="concentratedLabel"
                        :concentrated-price-per-unit="getPricePerUnit(product.PriceRange, 'Concentrated', viewMemberPricing)"
                        :concentrated-price-per-unit-measurement-type="product.PriceRange.ConcentratedPPUMeasurementType"
                        :diluted-label="dilutedLabel"
                        :diluted-price-per-unit="getPricePerUnit(product.PriceRange, 'Diluted', viewMemberPricing)"
                        :diluted-price-per-unit-measurement-type="product.PriceRange.DilutedPPUMeasurementType"
                        :original-price-per-unit="getPricePerUnit(product.PriceRange, 'Original', viewMemberPricing)"
                        :original-price-per-unit-measurement-type="product.PriceRange.OriginalPPUMeasurementType"
                        :cta="cta"
                        :data-index="indexProd + countProd"
                        :data-prod-total="slide.products.length"
                        :description="product.description"
                        :earn="earn"
                        :family-id="product.FamilyId"
                        :for-string="forString"
                        :image="product.Image"
                        :impressions-title="impressionsTitle"
                        :is-erp-date-valid="product.IsErpDateValid"
                        :is-inventory-controlled="product.IsInventoryControlled"
                        :is-off-sale="product.IsOffSale"
                        :link="product.link"
                        :off-sale-title="product.OffSaleTitle"
                        :old-price="product.PriceRange.MaxRegularPrice"
                        :points="product.points"
                        :price="product.PriceRange.MaxPreferredPrice"
                        :purchase="purchase"
                        :quantity-available="product.quantityAvailable"
                        :raw-price="rawPrice(product.PriceRange)"
                        :save="save"
                        :savings="dollarOrPercentSavings(product)"
                        :sku="product.Sku"
                        :slide-index="indexProd + countProd"
                        :is-sold-out-label="soldOut || 'Sold Out'"
                        :sub-title="product.subTitle"
                        :tabindex="setTabIndex(indexProd)"
                        :title="product.title" />
                </div>
            </div>
            <!-- END LOADED SLIDE -->
        </div>
    </div>
</template>

<script>
    import { getPricePerUnit } from '../../../utils/get-price-per-unit';

    export default {
        name: 'MscSlide',
        props: {
            actualSlide: {
                type: Number,
                default: 0
            },
            ariaHidden: {
                type: String,
                default: 'true'
            },
            by: {
                type: String,
                default: 'By'
            },
            calculatedHeaderHeight: {
                type: Number,
                default: null
            },
            carouselWidth: {
                type: Number,
                default: window.innerWidth
            },
            countProd: {
                type: Number,
                default: 0
            },
            cta: {
                type: String,
                default: 'Add to Cart'
            },
            concentratedLabel: {
                type: String,
                default: ''
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            earn: {
                type: String,
                default: 'Earn'
            },
            forString: {
                type: String,
                default: 'For'
            },
            impressionsTitle: {
                type: String,
                default: ''
            },
            purchase: {
                type: String,
                default: 'with this purchase'
            },
            save: {
                type: String,
                default: 'Save'
            },
            savings: {
                type: String,
                default: ''
            },
            slide: {
                type: Object,
                default: () => {}
            },
            slideIndex: {
                type: Number,
                default: 0
            },
            soldOut: {
                type: String,
                default: 'Sold Out'
            },
            tabindex: {
                type: Number,
                default: -1
            },
            userFlags: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            setImageBg() {
                if(this.carouselWidth <= 767) {
                    if(this.slide.bgMobileImage === null || this.slide.bgMobileImage === '' ||
                        typeof this.slide.bgMobileImage === 'undefined') {
                        return this.slide.bgImage;
                    } else {
                        return this.slide.bgMobileImage;
                    }
                } else {
                    return this.slide.bgImage;
                }
            },
            getCardWidth() {
                if(this.carouselWidth <= 767) {
                    return `width: ${this.carouselWidth}px`;
                }
                return null;
            },
            viewMemberPricing() {
                return this.userFlags?.ViewMemberPricing || false;
            }

        },
        methods: {
            getPricePerUnit,
            setAriaHiddenProd(index) {
                if(this.carouselWidth <= 767) {
                    // Mobile
                    if(index + this.countProd === this.actualSlide + 1) {
                        return 'false';
                    } else {
                        return 'true';
                    }
                } else {
                    // Desktop
                    return 'false';
                }
            },
            setTabIndex(index) {
                if(this.carouselWidth <= 767) {
                    // Mobile
                    if(index + this.countProd === this.actualSlide + 1) {
                        return 0;
                    } else {
                        return -1;
                    }
                } else {
                    // Desktop
                    return this.tabindex;
                }
            },
            isOffSale(product) {
                return product.IsOffSale;
            },
            offSaleLabel(product) {
                return product.OffSaleTitle;
            },
            rawPrice(card) {
                const priceRaw = this.userFlags?.ViewMemberPricing ? card?.RawMinPreferredPrice || '' : card?.RawMinRegularPrice || '';
                return priceRaw;
            },
            dollarOrPercentSavings(product) {
                return product?.FormattedPackSavings || product?.PriceRange?.PreferredMemberSavings;
            }
        }
    };
</script>

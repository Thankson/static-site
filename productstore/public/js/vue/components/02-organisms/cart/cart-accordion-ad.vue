<template>
    <o-cart-accordion
        ref="accordion"
        class="mt-4"
        :title="accordionData.DropdownText"
        :mask-class="accordionMaskClass"
        :open-accordion="showAd"
    >
        <div class="o-cartAccordionAd">
            <div class="o-cartAccordionAd__wrapper">

                <div class="o-cartAccordionAd__image" :style="backgroundStyle" />

                <div class="o-cartAccordionAd__col">
                    <div class="o-cartAccordionAd__content" v-html="RTEContent" />

                    <div class="o-cartAccordionAd__cta">
                        <a class="a-button text-center" :class="buttonMods" :href="ctaLink" @click="handleClick">{{ ctaDescription }}</a>
                    </div>

                </div>
            </div>
        </div>
    </o-cart-accordion>
</template>

<script>
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    export default {
        name: 'OCartAccordionAd',
        mixins: [isDesktop],
        props: {
            accordionMaskClass: {
                type: String,
                default: ''
            },
            error: {
                type: Boolean,
                default: false
            },
            accordionData: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            backgroundStyle() {
                const images = this.accordionData?.Images;
                if(!images) {
                    return {};
                }

                let imageUrl = images?.Tablet?.Url || images?.Mobile?.Url;
                if(this.isLg) {
                    imageUrl = images?.Desktop?.Url;
                } else if(this.isXs) {
                    imageUrl = images?.Mobile?.Url;
                }

                return {
                    backgroundImage: `url('${imageUrl}')`
                };
            },
            buttonMods() {
                return this.accordionData?.ButtonMods;
            },
            ctaDescription() {
                return this.accordionData?.CTA?.Text || '';
            },
            ctaLink() {
                return this.accordionData?.CTA?.Url || '';
            },
            gtmPromoObj() {
                return {
                    id: this.accordionData?.Gtm?.Id,
                    name: 'Cart Accordion',
                    creative: this.accordionData?.Gtm?.Creative,
                    position: this.accordionData?.Gtm?.Position
                };
            },
            RTEContent() {
                return this.accordionData?.RTEContent || '';
            },
            // Default open accordion ad when true
            showAd() {
                return this.accordionData?.OpenAccordion && !this.error;
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.gtmPromoPush('promoView', this.ctaLink, this.gtmPromoObj, false);
            });
        },
        methods: {
            // Handle click event
            handleClick() {
                this.gtmPromoPush('promoClick', this.ctaLink, this.gtmPromoObj);
            }
        }
    };
</script>

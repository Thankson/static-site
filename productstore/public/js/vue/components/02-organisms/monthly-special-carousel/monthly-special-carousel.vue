<template>
    <div>
        <!-- TEMPLATE -->
        <section
            v-if="!componentLoaded"
            ref="monthlySpecial"
            class="o-monthlySpecial">

            <!-- Header -->
            <div ref="carouselHeader" class="o-monthlySpecial__header absolute flex flex-col justify-center items-center md:w-full z-1">
                <div class="o-monthlySpecial__title pt-10 text-2xl font-bold uppercase md:text-5xl">Loading...</div>
                <div class="o-monthlySpecial__subTitle text-base leading-half md:text-2xl">Loading...</div>

                <div class="o-monthlySpecial__nav flex justify-center items-center mt-20">
                    <!-- Left arrow -->
                    <button
                        class="o-monthlySpecial__arrow flex justify-center items-center pointer-events-none"
                        aria-label="Previous products slide"
                        data-testid="button-monthlySpecialArrow">

                        <arrow
                            direction="-left"
                            size="-lg"
                            tailwind-color="black"
                            other-mods="-thin mr-20" />
                    </button>

                    <!-- Dots -->
                    <div class="o-monthlySpecial__dots justify-center items-center flex">
                        <button
                            v-for="(productSlide, index) in 4"
                            :key="index"
                            class="o-monthlySpecial__dot w-5 h-5 bg-black rounded-full mr-10"
                            data-testid="button-monthlySpecialDot" />
                    </div>

                    <!-- Right arrow -->
                    <button
                        class="o-monthlySpecial__arrow flex justify-center items-center pointer-events-none"
                        aria-label="Next products slide"
                        data-testid="button-monthlySpecialArrow">

                        <arrow
                            direction="-right"
                            size="-lg"
                            tailwind-color="black"
                            other-mods="-thin ml-20" />
                    </button>
                </div>
            </div>

            <!-- Slides -->
            <div class="o-monthlySpecial__list flex flex-no-wrap h-full">
                <!-- Show template if is not loaded -->
                <div class="relative h-full text-center md:min-w-full">
                    <msc-slide-template />
                </div>
            </div>

        </section>

        <!-- REAL COMPONENT -->
        <section
            v-else
            ref="monthlySpecial"
            v-touch:swipe.left="bindRightArrow"
            v-touch:swipe.right="bindLeftArrow"
            class="o-monthlySpecial">
            <!-- Header -->
            <div ref="carouselHeader" class="o-monthlySpecial__header absolute flex flex-col justify-center items-center md:w-full z-1">
                <div class="o-monthlySpecial__title pt-10 text-2xl font-bold uppercase md:text-5xl">{{ storeCarousel.title }}</div>
                <div class="o-monthlySpecial__subTitle text-base leading-half md:text-2xl">{{ storeCarousel.subTitle }}</div>

                <div class="o-monthlySpecial__nav flex justify-center items-center mt-20">
                    <!-- Left arrow -->
                    <button
                        ref="arrowLeft"
                        class="o-monthlySpecial__arrow flex justify-center items-center"
                        :class="{ 'pointer-events-none' : !actualSlide }"
                        :disabled="!actualSlide"
                        :aria-label="buttonPrevSlide"
                        data-testid="button-monthlySpecialArrow"
                        @click="bindLeftArrow()">

                        <arrow
                            direction="-left"
                            size="-lg"
                            tailwind-color="gray-150"
                            other-mods="-thinner mr-10" />
                    </button>

                    <!-- Dots -->
                    <div class="o-monthlySpecial__dots justify-center items-center flex">
                        <button
                            v-for="(productSlide, index) in totalSlides"
                            :key="index"
                            :aria-label="ariaLabelDots(index, totalSlides)"
                            class="o-monthlySpecial__dot"
                            :class="{ '-isActualSlide': index === actualSlide }"
                            :data-index="index"
                            :data-page="Math.floor((index / 3) + 1)"
                            :data-active="index === actualSlide ? 'true' : 'false'"
                            data-testid="button-monthlySpecialDot"
                            @click="bindDots(index, Math.floor((index / 3) + 1))">

                            <span
                                class="block w-5 h-5 absolute xy-centered rounded-full bg-gray-150"
                                :class="{ 'w-10 h-10': index === actualSlide }" />
                        </button>
                    </div>

                    <!-- Right arrow -->
                    <button
                        ref="arrowRight"
                        class="o-monthlySpecial__arrow flex justify-center items-center"
                        :class="{ 'pointer-events-none' : actualSlide === (totalScroll - 1) }"
                        :disabled="actualSlide === (totalScroll - 1)"
                        :aria-label="buttonNextSlide"
                        data-testid="button-monthlySpecialArrow"
                        @click="bindRightArrow()">

                        <arrow
                            direction="-right"
                            size="-lg"
                            tailwind-color="gray-150"
                            other-mods="-thinner ml-10" />
                    </button>
                </div>
            </div>

            <!-- Slides -->
            <div
                ref="o-monthlySpecial__list"
                class="o-monthlySpecial__list flex flex-no-wrap h-full transition-standard"
                :style="{ 'transform': `translateX(${position}px)` }">

                <div
                    v-for="(productSlide, index) in storeCarousel.slides"
                    :key="index"
                    ref="slide"
                    class="o-monthlySpecial__slide relative  text-center md:min-w-full"
                    :data-slides-on-page="storeCarousel.slides.length"
                    :aria-hidden="setAriaHidden(index)"
                    data-testid="button-monthlySpecialSlide">

                    <!-- Show the loaded slide -->
                    <div
                        v-if="productSlide.products"
                        class="relative h-full text-center md:min-w-full">
                        <msc-slide
                            :actual-slide="actualSlide"
                            :aria-hidden="setAriaHiddenProd(index)"
                            :by="by"
                            :calculated-header-height="carouselHeaderHeight"
                            :carousel-width="carouselWidth"
                            :concentrated-label="concentratedLabel"
                            :count-prod="setCardIndex(index)"
                            :cta="cta"
                            :data-slide-index="index + 1"
                            :diluted-label="dilutedLabel"
                            :earn="earn"
                            :for-string="forString"
                            :impressions-title="impressionsTitle"
                            :prev-prod-count="totalProdOnSlideGet[index - 1]"
                            :purchase="purchase"
                            :save="save"
                            :sold-out="soldOut || 'Sold Out'"
                            :slide-index="index + 1"
                            :slide="productSlide"
                            :user-flags="userFlags"
                            :tabindex="setTabIndex(index)" />
                    </div>
                    <!-- Show template if is not loaded -->
                    <div
                        v-else
                        class="relative h-full text-center md:min-w-full">

                        <msc-slide-template />
                    </div>

                </div>

            </div>

        </section>
        <div v-if="checkViewAllLink" class="flex justify-center pt-30 sm:w-full px-10">
            <a
                :href="storeCarousel.ViewAllLink.Url"
                :target="storeCarousel.ViewAllLink.Target"
                class="a-button -white block  text-center rounded  w-full xs:w-auto px-20">
                {{ storeCarousel.ViewAllLink.Text }}
            </a>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
    import MscSlideTemplate from './msc-slide-template.vue';
    import MscSlide from './msc-slide.vue';
    import preComponentLoaderMixin from '@common/source/js/vue/mixins/pre-component-loader';

    export default {
        name: 'MonthlySpecialCarousel',
        components: {
            MscSlideTemplate,
            MscSlide
        },
        mixins: [preComponentLoaderMixin],
        props: {
            active: {
                type: String,
                default: 'Active'
            },
            apiEndpoint: {
                type: String,
                default: ''
            },

            buttonNextSlide: {
                type: String,
                default: 'Next slide of products'
            },

            buttonPrevSlide: {
                type: String,
                default: 'Previous slide of products'
            },

            by: {
                type: String,
                default: 'By'
            },

            cta: {
                type: String,
                default: 'Add to Cart'
            },

            carouselAddress: {
                type: String,
                default: ''
            },

            carouselId: {
                type: String,
                default: ''
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
            loading: {
                type: String,
                default: 'Loading..'
            },

            notActive: {
                type: String,
                default: 'Not active'
            },

            of: {
                type: String,
                default: 'Of'
            },

            purchase: {
                type: String,
                default: 'with this purchase'
            },

            save: {
                type: String,
                default: 'Save'
            },

            slide: {
                type: String,
                default: 'Slide'
            },

            soldOut: {
                type: String,
                default: 'Sold Out'
            }
        },
        data() {
            return {
                actualPage: 1,
                actualSlide: 0,
                cardIndex: 0,
                carouselWidth: window.innerWidth,
                carouselHeaderHeight: null,
                position: 0,
                slideLoadedOnStore: false,
                totalPages: 0, // API
                totalProductsOnPage: 0, // API
                totalScroll: 0,
                totalSlidesGlobal: 0, // API
                windowWidth: 0
            };
        },
        computed: {
            ...mapState('monthlySpecialCarousel', ['storeCarousel', 'pagesLoaded', 'isLoaded', 'impressionsTitle', 'userFlags']),
            ...mapGetters('monthlySpecialCarousel', ['getProductCardData', 'totalSlidesGlobalGet', 'totalProductsGlobalGet', 'totalPagesGet', 'totalProdOnSlideGet']),
            ...mapGetters('gtm', ['checkMounted', 'checkCreated']),

            checkViewAllLink() {
                return this.storeCarousel?.ViewAllLink?.Url && this.storeCarousel?.ViewAllLink?.Text;
            },
            componentLoaded() {
                return this.isLoaded > 0;
            },
            totalSlides() {
                return this.carouselWidth > 767 ? this.storeCarousel.totalSlidesGlobal : this.storeCarousel.totalProductsGlobal;
            }
        },
        watch: {
            totalSlidesGlobal() {
                this.resetCarousel();
            },
            totalSlidesGlobalGet(val) {
                this.totalSlidesGlobal = val;
            },
            totalProductsGlobalGet(val) {
                this.totalProductsGlobal = val;
            },
            totalPagesGet(val) {
                this.totalPages = val;
            }
        },
        created() {
            this.INCREMENT_CREATED(); // GTM counting created parent components
        },
        beforeDestroy() {
            // Unregister
            window.removeEventListener('resize', this.onResize);
        },
        mounted() {
            // Get data from API: first page (gtm impressions happen in the store)
            this.getData({
                page: 1,
                id: this.carouselId,
                address: this.carouselAddress
            });

            this.windowWidth = window.innerWidth;
            window.addEventListener('resize', this.onResize);
            // Fix- Monthly-carousel-image-alignment breaks with additional padding on outer div - Bug - 1000391
            this.$nextTick(() => {
                this.adjustCarouselWidth();
                this.setInitCarousel();
            });

            // turn the loading icon off that wrapped the component until it is
            // bootstrapped
            this.unsetPreComponentLoader();
        },

        methods: {
            ...mapActions('monthlySpecialCarousel', ['getData', 'storeCarouselGet']),
            ...mapMutations('gtm', ['INCREMENT_CREATED']),

            ariaLabelDots(index, total) {
                const newIndex = index + 1;
                const isActive = index === this.actualSlide ? this.active : this.notActive;
                const labelString = `${this.slide} ${newIndex} ${this.of} ${total} - ${isActive}`;

                return labelString;
            },
            bindRightArrow() {
                this.actualSlide++;
                if(this.actualSlide <= (this.totalScroll - 1)) {
                    this.moveSlide();
                } else if(this.actualSlide >= this.totalScroll) {
                    this.actualSlide = (this.totalScroll - 1);
                }

                // Calling NEXT page
                this.actualPage++;
                if(this.actualPage <= this.totalPages) {
                    // Checking if was previously loaded
                    if(this.pagesLoaded.indexOf(this.actualPage) === -1) {
                        this.getData({
                            page: this.actualPage,
                            id: this.carouselId,
                            address: this.carouselAddress
                        });
                    }
                } else {
                    this.actualPage = this.totalPages;
                }
            },
            bindLeftArrow() {
                this.actualSlide--;
                if(this.actualSlide >= 0) {
                    this.moveSlide();
                } else if(this.actualSlide <= 0) {
                    this.actualSlide = 0;
                }

                // Calling PREV page
                this.actualPage--;
                if(this.actualPage > 1) {
                    // Checking if it was previously loaded
                    if(this.pagesLoaded.indexOf(this.actualPage) === -1) {
                        this.getData({
                            page: this.actualPage,
                            id: this.carouselId,
                            address: this.carouselAddress});
                    }
                } else {
                    this.actualPage = 1;
                }
            },
            bindDots(index, page) {
                this.actualSlide = index;

                // Load page if it was not previously
                if(!this.pagesLoaded.includes(page)) {
                    this.getData({
                        page,
                        id: this.carouselId,
                        address: this.carouselAddress
                    });
                }

                this.actualPage = page;
                this.moveSlide();
            },
            calculateCarouselHeaderHeight() {
                this.$nextTick(() => {
                    if(this.$refs.carouselHeader) {
                        this.carouselHeaderHeight = this.$refs.carouselHeader.clientHeight;
                    }
                });
            },
            moveSlide() {
                // Moving...
                this.position = -(this.carouselWidth * this.actualSlide);
            },
            onResize(event) {
                this.calculateCarouselHeaderHeight();
                // Set new width and reset all
                this.adjustCarouselWidth();

                // Reset only if the width changed.
                if(window.innerWidth !== this.windowWidth) {
                    this.resetCarousel();
                    this.windowWidth = window.innerWidth;
                }
            },
            resetCarousel() {
                this.position = 0;
                this.actualSlide = 0;
                this.setInitCarousel();
            },
            setAriaHidden(index) {
                if(this.carouselWidth <= 767) {
                    // On mobile, all slides are aria-hidden="false"
                    // The control of it is done by the product card
                    return 'false';
                } else {
                    if(index === this.actualSlide) {
                        return 'false';
                    } else {
                        return 'true';
                    }
                }
            },
            setAriaHiddenProd(index) {
                if(this.carouselWidth <= 767) {
                    if(index + this.countProd === this.actualSlide + 1) {
                        return 'false';
                    } else {
                        return 'true';
                    }
                } else {
                    if(index === this.actualSlide) {
                        return 'false';
                    } else {
                        return 'true';
                    }
                }
            },
            setCardIndex(index) {
                // Sum of previous products on each slide
                let prodCardArr = this.totalProdOnSlideGet;
                let sum;
                prodCardArr = prodCardArr.map(elem => {
                    sum = (sum || 0) + elem;
                });
                let valuePrev = (prodCardArr[index - 1]) | 0;

                for (let i = 0; i < this.totalProdOnSlideGet[index]; i++) {
                    // Adding iteration number for each product
                    return valuePrev + i + 1;
                }
            },
            setTabIndex(index) {
                if(this.carouselWidth <= 767) {
                    if(index === this.actualSlide && this.setAriaHidden(index) === 'false') {
                        return 0;
                    } else {
                        return -1;
                    }
                } else {
                    if(index === this.actualSlide) {
                        return 0;
                    } else {
                        return -1;
                    }
                }
            },
            setInitCarousel() {
                this.calculateCarouselHeaderHeight();
                // Set initial values based on the width
                if(this.carouselWidth <= 767) {
                    // Qtity of product cards
                    this.totalScroll = this.totalProductsGlobalGet;
                } else {
                    // Qtity of slides
                    this.totalScroll = this.totalSlidesGlobalGet;
                }
            },
            adjustCarouselWidth() {
                this.carouselWidth = this.$refs.monthlySpecial.clientWidth;
                if(this.carouselWidth <= 767) {
                    // set the width to be of html element
                    this.carouselWidth = document.querySelector('html').clientWidth;
                }
            }
        }
    };
</script>

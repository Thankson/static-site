<template>
    <div v-if="showMenus" class="o-topNavigationCarousel">
        <div class="o-topNavigationCarousel__main">
            <!-- Start: Carousel Wrapper -->
            <div
                ref="wrapper"
                role="region"
                class="o-topNavigationCarousel__wrapper"
                :aria-label="carouselDescription"
                aria-roledescription="carousel">
                <nav>
                    <m-nav-carousel
                        ref="carousel"
                        v-bind="pluginSettings"
                        @afterChange="afterChange"
                        @beforeChange="beforeChange">
                        <!-- Start: Product Categories -->
                        <div v-for="(menu, index) in categoryMenus" :key="index">
                            <button
                                v-if="isGrowPremiumPopup(menu)"
                                type="button"
                                class="o-topNavigationCarousel__tab"
                                @click="handleMenuClick()">
                                {{ menu.Text }}
                            </button>
                            <a
                                v-else
                                :href="menu.Url"
                                class="o-topNavigationCarousel__tab">
                                {{ menu.Text }}
                            </a>
                        </div>
                        <!-- End: Product Categories -->
                    </m-nav-carousel>
                </nav>

                <!-- Start: Custom Nav -->
                <nav ref="nav" class="o-topNavigationCarousel__actions">
                    <!-- Arrow buttons wrapper -->
                    <div class="o-topNavigationCarousel__arrows">
                        <!-- Prev Button -->
                        <button
                            ref="prevarrow"
                            :aria-label="labels.Previous || 'Previous'"
                            class="o-topNavigationCarousel__button slick-prev"
                            data-testid="button-productCarouselPrev"
                            @click="prev()">
                            <span aria-hidden="true" class="slick-arrow-icon a-arrow -sm-10 -left -thin mt-5 ml-5">
                                <span
                                    class="a-arrow__icon border-green-200 text-green"
                                    v-html="labels.Previous || 'Previous'"></span>
                            </span>
                        </button>

                        <!-- Next Button -->
                        <button
                            ref="nextarrow"
                            :aria-label="labels.Next || 'Next'"
                            class="o-topNavigationCarousel__button slick-next"
                            data-testid="button-slickNext"
                            @click="next()">

                            <span aria-hidden="true" class="slick-arrow-icon a-arrow -sm-10 -right -thin mt-5 ml-5">
                                <span
                                    class="a-arrow__icon border-green-200 text-green"
                                    v-html="labels.Next || 'Next'"></span>
                            </span>
                        </button>
                    </div>
                </nav>
            <!-- End: Custom Nav -->
            </div>
        <!-- End: Carousel Wrapper -->
        </div>
    </div>

</template>

<script>
    import eventBus from '../../../mixins/event-bus';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import customNavCarousel from '../../../mixins/custom-navigation-carousel';
    import MNavCarousel from '../../01-molecules/nav-carousel/nav-carousel.vue';

    export default {
        name: 'OTopNavigationCarousel',
        components: { MNavCarousel },
        mixins: [ localizationMixin, customNavCarousel],
        props: {
        },
        data() {
            return {
                categoryMenus: [],
                labels: {}
            };
        },
        computed: {
            showMenus() {
                return this.categoryMenus && this.categoryMenus?.length;
            },
            totalSlides() {
                return this.categoryMenus.length || 0;
            },
            carouselDescription() {
                return this.labels.CarouselDescription || 'Product Categories'; // Labels
            }
        },
        mounted() {
            // // Init carousel
            this.$nextTick(() => {
                this.categoryMenus = this.localization?.Data?.Menus || [];
                this.labels = this.localization?.Labels || {};
            });
        },
        methods: {
            handleMenuClick() {
                eventBus.$emit('showGrowPremiumSubscriptionPopup');
            },
            isGrowPremiumPopup(menu) {
                return menu.Badge?.IsGrowPremiumPopup === 'true';
            }
        }
    };
</script>

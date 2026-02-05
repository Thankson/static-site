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
                    <!-- Start: VueSlickCarousel Plugin -->
                    <VueSlickCarousel
                        ref="carousel"
                        v-bind="pluginSettings"
                        @afterChange="afterChange"
                        @beforeChange="beforeChange">
                        <!-- Start: Product Categories -->
                        <div v-for="menu in categoryMenus" :key="menu.Text">
                            <a class="o-topNavigationCarousel__tab" :href="menu.Url">{{ menu.Text }}</a>
                        </div>
                        <!-- End: Product Categories -->
                    </VueSlickCarousel>
                </nav>

                <!-- End: VueSlickCarousel Plugin -->

                <!-- Start: Custom Nav -->
                <nav ref="nav" class="o-topNavigationCarousel__actions">
                    <!-- Arrow buttons wrapper -->
                    <div class="o-topNavigationCarousel__arrows">
                        <!-- Prev Button -->
                        <button
                            ref="prevarrow"
                            :aria-label="labels.Previous || 'Previous'"
                            class="o-topNavigationCarousel__button slick-prev"
                            data-testid="button-slickPrev"
                            @click="prev()">
                            <span aria-hidden="true" class="slick-arrow-icon a-arrow -sm-10 -left -thin mt-5 ml-5">
                                <span
                                    class="a-arrow__icon border-sky text-sky"
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
                                    class="a-arrow__icon border-sky text-sky"
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
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import customNavCarousel from '../../../mixins/custom-navigation-carousel';

    export default {
        name: 'OTopNavigationCarousel',
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
            // Init carousel
            this.$nextTick(() => {
                this.categoryMenus = (this.localization?.Data?.Navs || []).map(i => ({
                    Text: i.Text,
                    Url: i.Link
                }));
                this.labels = this.localization?.Labels || {};
            });
        }
    };
</script>

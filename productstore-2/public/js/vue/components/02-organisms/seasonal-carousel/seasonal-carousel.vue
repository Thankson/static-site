<template>
    <article
        class="o-seasonalCarousel"
        aria-roledescription="carousel"
        :aria-label="getLocalizationProp('Labels.CarouselDescription')"
    >
        <!-- Slides Wrapper -->
        <div v-if="slides && slides.length" class="o-seasonalCarousel__wrapper">
            <VueSlickCarousel
                ref="carousel"
                v-bind="pluginSettings"
                class="o-seasonalCarousel__slider"
                data-testid="container-seasonalCarousel__slider"
                @afterChange="afterChange">

                <!-- Slides -->
                <template v-for="(slide, index) in slides">
                    <figure v-if="slide.Type !== 'Promotion' || userFlags.IsAuthenticated" :key="index" class="o-seasonalCarousel__slide">
                        <o-seasonal-slide
                            v-if="slide.Type !== 'Promotion'"
                            :impressions-title="impressionsTitle"
                            :slide="slide"
                            :user-flags="userFlags"
                            :localization="getLocalizationProp('Labels')" />
                        <o-seasonal-promotion-slide
                            v-if="slide.Type === 'Promotion'"
                            :impressions-title="impressionsTitle"
                            :slide="slide"
                            :user-flags="userFlags"
                            :localization="getLocalizationProp('Labels')" />
                    </figure>
                </template>
            </VueSlickCarousel>
            <p class="sr-only" aria-live="polite" aria-atomic="true">
                {{ slideInfo }}
            </p>
        </div>
    </article>
</template>
<script>
    import apiCarousel from '@api/routes/carousel/seasonal';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import preComponentLoaderMixin from '@common/source/js/vue/mixins/pre-component-loader';

    export default {
        name: 'OSeasonalCarousel',
        mixins: [ localizationMixin, preComponentLoaderMixin ],
        data() {
            return {
                currentSlide: null,
                loading: false,
                slides: [],
                pluginSettings: {
                    arrows: true,
                    dots: false,
                    infinite: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    speed: 500,
                    variableWidth: false,
                    adaptiveHeight: this.$env?.IsCn || false
                },
                userFlags: {}
            };
        },
        computed: {
            dataSourceId() {
                return this.localization?.Data?.DatasourceId || null;
            },
            customSpeed() {
                let speed = parseInt(this.localization?.Labels?.Speed);
                if(speed < 100) speed = 500;
                return speed;
            },
            impressionsTitle() {
                return this.localization?.Data?.ImpressionsTitle;
            },
            slideInfo() {
                const text = this.getLocalizationProp('Labels.CounterText') || 'Slide {0} of {1}';
                return text?.replace('{0}', this.currentSlide + 1).replace('{1}', this.slides.length);
            }
        },
        watch: {
            customSpeed() {
                if(this.customSpeed) {
                    this.pluginSettings.speed = this.customSpeed;
                }
            }
        },
        async mounted() {
            // Init loading
            this.loading = true;

            // Get seasonal carousel
            const data = await this.getData();

            // Set slides and user flags
            this.slides = data?.Slides || [];
            this.userFlags = data?.UserFlags || {};

            // Set as loaded
            this.loading = false;
            this.unsetPreComponentLoader();
        },
        methods: {
            afterChange(slideIndex) {
                this.currentSlide = slideIndex;
            },
            async getData() {
                const response = await apiCarousel.query({
                    dataSourceId: this.dataSourceId
                });

                return response?.data?.Data || {};
            }
        }
    };
</script>

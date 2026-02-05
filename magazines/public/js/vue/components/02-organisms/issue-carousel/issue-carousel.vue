<template>
    <div v-if="books.length" class="o-issueCarousel">
        <m-category-header :payload="categoryHeaderPayload"></m-category-header>
        <VueSlickCarousel
            ref="carousel"
            v-bind="pluginSettings"
            @afterChange="afterChange"
        >
            <a
                v-for="(i, index) in books" :key="`${i.Title}-${index}`"
                class="o-issueCarousel__card"
                :href="i.Link"
            >
                <img class="o-issueCarousel__cover" :src="i.Cover" :alt="i.Title" />
                <span class="o-issueCarousel__title">{{ i.Title }}</span>
            </a>
        </VueSlickCarousel>
        <div class="o-issueCarousel__actions">
            <button
                class="o-issueCarousel__arrow material-icons -prev"
                aria-hidden="true"
                :aria-label="getLocalizationProp('Labels.AriaLabels.PreviousSlide', 'Previous slide of issues')"
                @click="prev"
            >arrow_back_ios</button>
            <button
                v-for="(d, index) in dotCount" :key="d + index"
                class="o-issueCarousel__dot material-icons"
                :class="{'-active': index === activeDot}"
                aria-hidden="true"
                @click="handleDotClicked(index)"
            >circle</button>
            <button
                class="o-issueCarousel__arrow material-icons -next"
                aria-hidden="true"
                :aria-label="getLocalizationProp('Labels.AriaLabels.NextSlide', 'Next slide of issues')"
                @click="next">arrow_forward_ios</button>
        </div>
    </div>
</template>

<script>
    import { debounce } from 'lodash';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OIssueCarousel',
        mixins: [ localizationMixin],
        data() {
            return {
                debouncedResize: null,
                dotCount: 0,
                activeDot: -1,
                innerSliderRef: null,
                partialInnerSliderThis: {},
                pluginSettings: {
                    arrows: false,
                    dots: false,
                    infinite: false,
                    speed: 500,
                    slidesToShow: 6,
                    slidesToScroll: 6,
                    variableWidth: true,
                    responsive: [
                        {
                            breakpoint: 1170,
                            settings: {
                                infinite: false,
                                slidesToShow: 5,
                                slidesToScroll: 5,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 950,
                            settings: {
                                infinite: false,
                                slidesToShow: 4,
                                slidesToScroll: 4,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 690,
                            settings: {
                                infinite: false,
                                slidesToShow: 3,
                                slidesToScroll: 3,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 520,
                            settings: {
                                infinite: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                variableWidth: true
                            }
                        }
                    ]
                }
            };
        },
        computed: {
            clickDotParams() {
                return {
                    message: 'dots',
                    slidesToScroll: this.partialInnerSliderThis.slidesToScroll,
                    currentSlide: this.partialInnerSliderThis.currentSlide
                };
            },
            books() {
                return this.getLocalizationProp('Data.Issues', []);
            },
            categoryHeaderPayload() {
                return {
                    image: this.getLocalizationProp('Data.Image'),
                    title: this.getLocalizationProp('Data.Title')
                };
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.onWindowResized();
            });
            window.addEventListener('resize', this.onWindowResized);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onWindowResized);
        },
        methods: {
            onWindowResized() {
                if(this.debouncedResize) this.debouncedResize.cancel();
                this.debouncedResize = debounce(
                    () => this.resizeWindow(),
                    100
                );
                this.debouncedResize();
            },
            resizeWindow() {
                this.innerSliderRef = this.$refs.carousel?.$refs?.innerSlider;
                if(!this.innerSliderRef) return;
                this.updateDotCount();
                this.updateActiveDot();
            },
            getDotCount(spec) {
                let dots;
                if(spec.infinite) {
                    dots = Math.ceil(spec.slideCount / spec.slidesToScroll);
                } else {
                    dots =
                        Math.ceil((spec.slideCount - spec.slidesToShow) / spec.slidesToScroll) + 1;
                }
                return dots;
            },
            updateDotCount() {
                if(!this.innerSliderRef) return;
                this.partialInnerSliderThis = {
                    ...this.partialInnerSliderThis,
                    slideCount: this.innerSliderRef.slideCount,
                    slidesToScroll: this.innerSliderRef.slidesToScroll,
                    slidesToShow: this.innerSliderRef.slidesToShow,
                    infinite: this.innerSliderRef.infinite
                };
                this.dotCount = this.getDotCount(this.partialInnerSliderThis);
            },
            updateActiveDot() {
                if(!this.innerSliderRef) return;
                this.partialInnerSliderThis = {
                    ...this.partialInnerSliderThis,
                    slidesToScroll: this.innerSliderRef.slidesToScroll,
                    currentSlide: this.innerSliderRef.currentSlide
                };
                this.activeDot = Array.apply(
                    null,
                    Array(this.dotCount + 1)
                        .join('0')
                        .split('')
                ).findIndex((x, i) => {
                    let leftBound = i * this.partialInnerSliderThis.slidesToScroll;
                    let rightBound = i * this.partialInnerSliderThis.slidesToScroll + (this.partialInnerSliderThis.slidesToScroll - 1);
                    return this.partialInnerSliderThis.currentSlide >= leftBound && this.partialInnerSliderThis.currentSlide <= rightBound;
                });
            },
            prev() {
                this.$refs['carousel'].prev();
            },
            next() {
                this.$refs['carousel'].next();
            },
            handleDotClicked(i) {
                if(this.innerSliderRef) {
                    this.innerSliderRef.changeSlide({
                        ...this.clickDotParams,
                        index: i
                    });
                }
            },
            afterChange() {
                this.updateActiveDot();
            }
        }
    };
</script>

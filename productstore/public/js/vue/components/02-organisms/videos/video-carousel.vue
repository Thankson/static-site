<template>
    <article class="o-videoCarousel -carouselSlick" :class="{'-isCn' : isCn}" :style="{ backgroundColor: bgColor, color: arrowColor }">
        <div class="o-videoCarousel__wrapper">
            <!-- Header RTE -->
            <div class="o-videoCarousel__header m-rte">
                <slot name="header" />
            </div>

            <!-- Carousel -->
            <div
                :id="'carousel-count-' + uniqueId"
                ref="wrapper"
                class="o-videoCarousel__carousel"
                role="carousel"
                :aria-label="ariaLabel"
                aria-roledescription="carousel">

                <!-- VueSlickCarousel Plugin -->
                <!-- vue slick does not disable prev arrow when infinite carousel is set to true. Using afterChange method to track when to add class and enable prev arrow again -->
                <VueSlickCarousel
                    ref="carousel"
                    v-bind="pluginSettings"
                    class="o-videoCarousel__slider"
                    :class="{ '-isChanged': isChanged }"
                    @afterChange="afterChange">

                    <!-- Slides -->
                    <template v-slot:default>
                        <slot name="video-card" />
                    </template>

                </VueSlickCarousel>
            </div>
        </div>
    </article>
</template>

<script>

    export default {
        name: 'OVideoCarousel',

        props: {
            ariaLabel: {
                type: String,
                default: ''
            },
            arrowColor: {
                type: String,
                default: '#6F3B1B'
            },
            bgColor: {
                type: String,
                default: '#6F3B1B'
            },
            uniqueId: {
                type: String,
                default: 'unique-id'
            }
        },

        data() {
            return {
                pluginSettings: { // Default settings (used if settings prop is null)
                    arrows: true,
                    dots: true,
                    infinite: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    variableWidth: true
                },
                isChanged: false
            };
        },

        computed: {
            isCn() {
                return this.$env?.IsCn || false;
            }
        },

        methods: {
            afterChange() {
                this.isChanged = true;
            }
        }
    };
</script>

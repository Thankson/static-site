<template>
    <div ref="boxRef" class="a-textCarousel">
        <div ref="contentRef" class="a-textCarousel__content" :style="contentStyle">
            <p ref="textRef" class="a-textCarousel__text" :style="textStyle">{{ text }}</p>
            <p v-show="showDuplicateText" ref="duplicateTtextRef" class="a-textCarousel__text" :style="textStyle">{{ text }}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ATextCarousel',
        props: {
            text: {
                type: String,
                default: ''
            },
            // unit second
            delay: {
                type: Number,
                default: 2
            },
            // unit pixels per second
            speed: {
                type: Number,
                default: 80
            }
        },
        data() {
            return {
                isPlaying: false,
                textWidth: 0,
                textPaddingRight: 0,
                contentStyleSheet: '',
                showDuplicateText: false
            };
        },
        computed: {
            textStyle() {
                return this.showDuplicateText ? `padding-right: ${this.textPaddingRight}px;` : '';
            },
            contentStyle() {
                return this.showDuplicateText ? this.contentStyleSheet : '';
            }
        },
        watch: {
            text: {
                handler() {
                    this.$nextTick(() => {
                        this.handleScrollLeftThrottle();
                    });
                },
                immediate: true
            }
        },
        methods: {
            handleScrollLeftThrottle() {
                if(this.isPlaying) return;
                this.isPlaying = true;

                this.checkScrollLeft();
            },
            checkScrollLeft() {
                const box = this.$refs.boxRef;
                const content = this.$refs.contentRef;
                const text = this.$refs.textRef;
                const boxWidth = box.offsetWidth;
                let textWidth = text.offsetWidth;
                // Determine whether the text length is greater than the box length and start scrolling
                if(textWidth > boxWidth) {
                    // set half padding `50%`
                    this.textPaddingRight = boxWidth * 0.5;
                    this.showDuplicateText = true;

                    this.$nextTick(() => {
                        // above have set padding, so update contentWidth value
                        const contentWidth = content.offsetWidth;
                        const totalScrollingTimePerTime = (contentWidth - boxWidth) / this.speed;
                        this.contentStyleSheet = `animation: scroll-text ${totalScrollingTimePerTime}s linear ${this.delay}s infinite;`;
                    });
                }
            }
        }
    };
</script>

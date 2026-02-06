export default {
    data() {
        return {
            viewportWidth: 0,
            buttonNext: null,
            buttonPrev: null,
            theSlides: null,
            currentSettings: {},
            currentSlide: 0,
            enterKeyEvent: false,
            pluginSettings: { // Fixed settings because slides can have a variable width
                arrows: false,
                dots: false,
                infinite: false,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                variableWidth: true
            }
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.$nextTick(() => {
                this.setSpec(false);
                this.initCustomNav();
                // To fix signout issue
                setTimeout(() => {
                    this.initCustomNav();
                }, 100);
            });
        });
    },
    created() {
        // Viewport
        this.setViewport();
        // Create resize listener
        window.addEventListener('resize', this.onResize);
        // create keydown listener
        window.addEventListener('keydown', this.onKeyDown);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('keydown', this.onKeyDown);
    },
    methods: {
        afterChange() {
            this.setAriasAndTabIndx();
        },
        setViewport() {
            this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        },
        initCustomNav() {
            if(this.$refs['nav']) {
                this.buttonPrev = this.$refs['prevarrow'];
                this.buttonNext = this.$refs['nextarrow'];

                if(this.buttonPrev && this.buttonNext) {
                    this.beforeChange(this.currentSlide, this.currentSlide);
                }
            }
        },
        beforeChange(prevSlide, nextSlide) {
            this.currentSlide = nextSlide;
            this.currentSettings.currentSlide = nextSlide;
            this.slides = this.$refs['wrapper'] ? this.$refs['wrapper'].querySelectorAll('.slick-slide') : null;

            // Enable previous arrow
            if(this.buttonPrev) {
                this.buttonPrev.classList.remove('slick-disabled');
            }
            // If it's the first slide, then disable previous arrow
            if(nextSlide === 0) {
                if(this.buttonPrev) {
                    this.buttonPrev.classList.add('slick-disabled');
                }
            }
            this.setAriasAndTabIndx();
        },

        setAriasAndTabIndx() {
            let ariaRoledescription = this.labels.AriaRoleDescription || 'Slide';
            if(this.slides) {
                let tabindex = null;
                let arialLabel = null;
                let slideNumber = 1;
                this.slides.forEach((slide, index) => {
                    arialLabel = `${this.labels.Category || 'Category'} ${slideNumber} ` +
                        `${this.labels.Of || 'Of'} ${this.totalSlides}, `;
                    // class-name each slide
                    slide.classList.add(`slide${slideNumber}`);
                    // assign tabindex 0 if slide in viewport else tabindex -1
                    tabindex = this.isSlideOnViewport(slide) ? 0 : -1;
                    if((index + 1) % this.currentSettings.slidesToScroll === 0) {
                        slideNumber++;
                    }
                    slide.setAttribute('aria-roledescription', ariaRoledescription);
                    slide.setAttribute('aria-label', arialLabel);

                    // Remove tab index from the main div
                    slide.removeAttribute('tabindex');

                    // Remove tab index from all the children, except links and buttons
                    const children = slide.querySelectorAll('div, ul, li, section, article');
                    children.forEach(child => {
                        // Remove tab index
                        child.removeAttribute('tabindex');
                    });

                    // Add or remove links/buttons from tab order
                    const focusable = slide.querySelectorAll('a, button');
                    focusable.forEach(child => {
                        // Set tab index
                        child.setAttribute('tabindex', tabindex);
                    });
                });

                this.controlNextArrow();
            }
        },
        isSlideOnViewport(slide) {
            const rect = slide.getBoundingClientRect();
            const lastSlideWidth = slide.clientWidth;
            if(rect.right <= (window.innerWidth - lastSlideWidth || document.documentElement.clientWidth - lastSlideWidth)) {
                return true;
            }
            return false;
        },

        setSpec(resize = false) {
            let spec = this.pluginSettings;
            spec.currentSlide = this.currentSlide;
            spec.slideCount = this.totalSlides;
            this.currentSettings = spec;
        },
        controlNextArrow() {
            // forcibly enable or disable next arrow
            const lastSlideEnd = this.$refs['wrapper']?.querySelector(`.slide${this.totalSlides}`).getBoundingClientRect().right;
            const sliderWidthEnd = this.$refs['wrapper']?.querySelector(`.slick-list`).getBoundingClientRect().right;
            if(lastSlideEnd <= sliderWidthEnd) {
                if(this.buttonNext) {
                    // hide next arrow
                    this.buttonNext.classList.add('slick-disabled');
                }
            } else {
                // show next arrow

                this.buttonNext.classList.remove('slick-disabled');
            }
        },
        focusCurrentSlide(slide) {
            if(slide) {
                slide.focus({focusVisible: true});
            }
        },
        next() {
            this.$refs['carousel'].next();
            // control tab index
            if(this.buttonNext && this.enterKeyEvent) {
                let slidesOnViewport = [];
                let firstItem = null;
                this.slides.forEach((slide) => {
                    let firstEl = slide.querySelector("[tabindex='-1']");
                    if(firstEl !== null) {
                        slidesOnViewport.push(firstEl);
                    }
                    // bring tab to the first slide having tabindex -1 after nextArrow
                    firstItem = slidesOnViewport[0];
                });
                // Necessary to prevent plugin to focus on body after click in next button
                setTimeout(() => {
                    this.focusCurrentSlide(firstItem);
                }, 100);
            }
        },
        prev() {
            this.$refs['carousel'].prev();
            // control tab index
            if(this.buttonPrev && this.enterKeyEvent) {
                let slidesOnViewport = [];
                let lastItem = null;
                this.slides.forEach((slide) => {
                    let lastEl = slide.querySelector("[tabindex='0']");
                    if(lastEl !== null) {
                        slidesOnViewport.push(lastEl);
                    }
                    // bring tab to the second-last slide having tabindex 0 after prevArrow
                    lastItem = slidesOnViewport[slidesOnViewport.length - 2];
                });
                // Necessary to prevent plugin to focus on body after click in next button
                setTimeout(() => {
                    this.focusCurrentSlide(lastItem);
                }, 100);
            }
        },
        onResize() {
            if(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) !== this.viewportWidth) {
                this.setViewport();
                this.setSpec(true);
                this.initCustomNav();
                this.setAriasAndTabIndx();
            }
        },
        onKeyDown(event) {
            const keyCode = event.keyCode ? event.keyCode : event.which;
            // needed to focus on slides on enter while pressing arrows
            this.enterKeyEvent = keyCode === 13;
        }

    }
};

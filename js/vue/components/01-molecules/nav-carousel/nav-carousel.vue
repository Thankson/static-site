<script>
    export default {
        name: 'MNavCarousel',
        props: {
            draggable: {
                type: Boolean,
                default: true
            },
            leftSpacerWidth: {
                type: Number,
                default: 20
            },
            rightSpacerWidth: {
                type: Number,
                default: 64
            },
            slidesToScroll: {
                type: Number,
                default: 1
            },
            speed: {
                type: Number,
                default: 500
            },
            touchMove: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                animationFrame: null,
                contentWidth: 0,
                currentSlide: 0,
                currentTransform: 0,
                dragStarted: false,
                isDestroyed: false,
                isDragging: false,
                isSnapping: false,
                lastX: 0,
                minDragDistance: 5, // Pixels to move before a drag is registered
                resizeTimeout: null,
                slides: [],
                startTransform: 0,
                startX: 0,
                trackWidth: 0,
                velocity: 0
            };
        },
        computed: {
            canScroll() {
                return this.contentWidth > this.trackWidth;
            }
        },
        mounted() {
            this.handleResize = null;
            this.preventDragHandler = null;
            this.boundHandleDragMove = null;
            this.boundHandleDragEnd = null;

            this.$nextTick(() => {
                const track = this.$refs.track;
                if(track) {
                    this.slides = Array.from(track.children || []);
                    this.setupDimensionTracking();
                    this.setupDragListeners();

                    // Ensure dimensions are accurate and initialize transform position
                    this.$nextTick(() => {
                        this.updateDimensions();
                        if(typeof this.onResize === 'function') {
                            this.onResize();
                        }
                        this.applyTransform();
                    });
                }
            });
        },
        beforeDestroy() {
            this.isDestroyed = true;
            this.isDragging = false;
            this.isSnapping = false;

            if(this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }

            this.removeGlobalDragListeners();
            this.removeDragListeners();

            if(this.$refs && this.$refs.track && this.$refs.track.style) {
                this.$refs.track.style.cursor = '';
                this.$refs.track.style.userSelect = '';
                this.$refs.track.style.transform = '';
            }

            this.handleResize = null;
            this.preventDragHandler = null;
            this.boundHandleDragMove = null;
            this.boundHandleDragEnd = null;
        },
        methods: {
            addGlobalDragListeners(isTouch) {
                if(isTouch) {
                    document.addEventListener('touchmove', this.boundHandleDragMove, { passive: false });
                    document.addEventListener('touchend', this.boundHandleDragEnd);
                } else {
                    document.addEventListener('mousemove', this.boundHandleDragMove);
                    document.addEventListener('mouseup', this.boundHandleDragEnd);
                }
            },
            applyTransform() {
                if(this.isDestroyed || !this.$refs || !this.$refs.track) return;

                const track = this.$refs.track;
                if(!track || !track.style) return;

                track.style.transform = `translate3d(${this.currentTransform}px, 0, 0)`;
            },
            cancelAllAnimations() {
                if(this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                    this.animationFrame = null;
                }

                this.isSnapping = false;
            },
            checkSnapBack() {
                if(this.isDestroyed || this.isSnapping) return;

                this.updateDimensions();

                if(!this.canScroll) {
                    this.snapToPosition(0);
                    return;
                }

                const minTransform = -(this.contentWidth - this.trackWidth);

                if(this.currentTransform > 0) {
                    this.snapToPosition(0, true);
                } else if(this.currentTransform < minTransform) {
                    this.snapToPosition(minTransform, true);
                }
            },
            extractLinksFromSlots(createElement, nodes) {
                const links = [];
                let keyCounter = 0;
                const traverse = (nodeList) => {
                    if(!nodeList) return;
                    nodeList.forEach((node, index) => {
                        if(node && (node.tag === 'a' || node.tag === 'button')) {
                            links.push(createElement(node.tag, {
                                key: `link-${keyCounter++}-${node.key || index}`,
                                class: 'slick-slide',
                                ...node.data,
                                style: {
                                    display: 'inline-block',
                                    whiteSpace: 'nowrap',
                                    marginRight: '12px',
                                    padding: '7px 7px',
                                    flexShrink: 0,
                                    boxSizing: 'border-box',
                                    ...(node.data?.style || {})
                                }
                            }, node.children));
                        } else if(node && node.children) {
                            traverse(node.children);
                        }
                    });
                };
                traverse(nodes);
                return links;
            },
            handleDragEnd() {
                if(!this.isDragging || this.isDestroyed) return;

                this.isDragging = false;

                this.removeGlobalDragListeners();

                if(this.$refs && this.$refs.track && this.$refs.track.style) {
                    this.$refs.track.style.cursor = 'grab';
                    this.$refs.track.style.userSelect = '';
                }

                this.updateDimensions();

                this.$nextTick(() => {
                    if(Math.abs(this.velocity) > 1) {
                        this.momentumScroll();
                    } else {
                        this.checkSnapBack();
                    }
                });
            },
            handleDragMove(e) {
                if(!this.isDragging || this.isDestroyed || !this.$refs || !this.$refs.track) return;

                const isTouch = !!e.touches;
                if(isTouch) {
                    e.preventDefault();
                }

                const pageX = isTouch ? e.touches[0].pageX : e.pageX;
                const x = pageX - (this.$refs.track.offsetLeft || 0);
                const walk = (x - this.startX);

                if(!this.dragStarted && Math.abs(walk) > this.minDragDistance) {
                    this.dragStarted = true;
                }

                let newTransform = this.startTransform + walk;

                if(this.canScroll) {
                    const minTransform = -(this.contentWidth - this.trackWidth);
                    // Apply resistance when scrolling past the boundaries
                    if(newTransform > 0) {
                        const overscroll = newTransform;
                        newTransform = this.startTransform + walk * (1 - overscroll / (this.trackWidth + overscroll));
                    } else if(newTransform < minTransform) {
                        const overscroll = newTransform - minTransform;
                        newTransform = this.startTransform + walk * (1 - Math.abs(overscroll) / (this.trackWidth + Math.abs(overscroll)));
                    }
                }

                this.currentTransform = newTransform;
                this.applyTransform();

                this.velocity = pageX - this.lastX;
                this.lastX = pageX;
            },
            handleDragStart(e) {
                if(!this.draggable || this.isDestroyed || !this.$refs || !this.$refs.track) return;

                // Prevent drag on right-click
                if(e.button === 2) return;

                this.cancelAllAnimations();

                const isTouch = !!e.touches;
                const pageX = isTouch ? e.touches[0].pageX : e.pageX;

                this.isDragging = true;
                this.dragStarted = false;
                this.startX = pageX - (this.$refs.track.offsetLeft || 0);
                this.startTransform = this.currentTransform;
                this.lastX = pageX;
                this.velocity = 0;

                this.addGlobalDragListeners(isTouch);

                if(this.$refs.track.style) {
                    this.$refs.track.style.cursor = 'grabbing';
                    this.$refs.track.style.userSelect = 'none';
                }

                if(e.type === 'mousedown') {
                    e.preventDefault();
                }
            },
            momentumScroll() {
                if(this.isDestroyed) return;

                this.cancelAllAnimations();

                let velocity = this.velocity * 5;
                const friction = 0.95;
                const minVelocity = 0.5;

                const animate = () => {
                    if(!this.animationFrame || this.isDestroyed) return;

                    if(Math.abs(velocity) < minVelocity) {
                        this.animationFrame = null;
                        this.checkSnapBack();
                        return;
                    }

                    let newTransform = this.currentTransform + velocity;

                    if(this.canScroll) {
                        const minTransform = -(this.contentWidth - this.trackWidth);
                        if(newTransform > 0 || newTransform < minTransform) {
                            // Apply resistance when scrolling past the boundaries
                            newTransform = this.currentTransform + (velocity / 2);
                        }
                    }

                    this.currentTransform = newTransform;
                    this.applyTransform();

                    velocity *= friction;

                    this.animationFrame = requestAnimationFrame(animate);
                };

                this.animationFrame = requestAnimationFrame(animate);
            },
            moveToCurrentSlide() {
                if(this.isDestroyed || !this.$refs || !this.$refs.track) return;

                const track = this.$refs.track;
                const currentSlide = this.slides[this.currentSlide];

                if(currentSlide && track) {
                    const slideOffset = currentSlide.offsetLeft || 0;
                    const targetPosition = -slideOffset + this.leftSpacerWidth;
                    this.snapToPosition(targetPosition, false);
                }
            },
            next() {
                if(!this.slides || this.slides.length === 0) return;
                const newSlide = Math.min(this.currentSlide + this.slidesToScroll, this.slides.length - 1);
                if(newSlide !== this.currentSlide) {
                    this.$emit('beforeChange', this.currentSlide, newSlide);
                    this.currentSlide = newSlide;
                    this.moveToCurrentSlide();
                    this.$emit('afterChange', this.currentSlide);
                }
            },
            prev() {
                if(!this.slides || this.slides.length === 0) return;
                const newSlide = Math.max(this.currentSlide - this.slidesToScroll, 0);
                if(newSlide !== this.currentSlide) {
                    this.$emit('beforeChange', this.currentSlide, newSlide);
                    this.currentSlide = newSlide;
                    this.moveToCurrentSlide();
                    this.$emit('afterChange', this.currentSlide);
                }
            },
            removeDragListeners() {
                const track = this.$refs.track;

                if(track) {
                    track.removeEventListener('mousedown', this.handleDragStart);
                    if(this.touchMove) {
                        track.removeEventListener('touchstart', this.handleDragStart);
                    }

                    if(this.preventDragHandler) {
                        track.removeEventListener('dragstart', this.preventDragHandler);
                    }
                }

                this.removeGlobalDragListeners();

                if(this.handleResize) {
                    window.removeEventListener('resize', this.handleResize);
                    this.handleResize = null;
                }

                this.preventDragHandler = null;
                this.boundHandleDragMove = null;
                this.boundHandleDragEnd = null;
            },
            removeGlobalDragListeners() {
                document.removeEventListener('mousemove', this.boundHandleDragMove);
                document.removeEventListener('mouseup', this.boundHandleDragEnd);
                document.removeEventListener('touchmove', this.boundHandleDragMove);
                document.removeEventListener('touchend', this.boundHandleDragEnd);
            },
            setupDimensionTracking() {
                if(this.isDestroyed || !this.$refs || !this.$refs.track) return;

                this.updateDimensions();

                this.handleResize = () => {
                    clearTimeout(this.resizeTimeout);
                    this.resizeTimeout = setTimeout(() => {
                        if(!this.isDestroyed) {
                            this.updateDimensions();
                            if(typeof this.onResize === 'function') {
                                this.onResize();
                            }
                            // Force a check after dimensions update to ensure proper boundaries
                            this.$nextTick(() => {
                                if(!this.isDestroyed) {
                                    this.checkSnapBack();
                                }
                            });
                        }
                    }, 100);
                };
                window.addEventListener('resize', this.handleResize);
            },
            setupDragListeners() {
                if(this.isDestroyed || !this.$refs || !this.$refs.track) return;

                const track = this.$refs.track;

                this.boundHandleDragMove = this.handleDragMove.bind(this);
                this.boundHandleDragEnd = this.handleDragEnd.bind(this);

                track.addEventListener('mousedown', this.handleDragStart);

                if(this.touchMove) {
                    track.addEventListener('touchstart', this.handleDragStart, { passive: false });
                }

                this.preventDragHandler = (e) => e.preventDefault();
                track.addEventListener('dragstart', this.preventDragHandler);
            },
            snapToPosition(targetTransform, bounceAnimation = false) {
                if(this.isSnapping || this.isDestroyed) return;

                this.cancelAllAnimations();

                this.isSnapping = true;

                const startTransform = this.currentTransform;
                const distance = targetTransform - startTransform;

                const baseDuration = bounceAnimation ? 600 : Math.min(Math.abs(distance) * 2, this.speed);
                const duration = Math.max(baseDuration, 250);
                const startTime = performance.now();

                const animate = (currentTime) => {
                    if(!this.animationFrame || !this.isSnapping || this.isDestroyed) return;

                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    let easedProgress;
                    if(bounceAnimation) {
                        const c1 = 1.70158;
                        const c3 = c1 + 1;
                        easedProgress = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
                    } else {
                        easedProgress = 1 - Math.pow(1 - progress, 3);
                    }

                    this.currentTransform = startTransform + (distance * easedProgress);
                    this.applyTransform();

                    if(progress < 1) {
                        this.animationFrame = requestAnimationFrame(animate);
                    } else {
                        this.animationFrame = null;
                        this.isSnapping = false;
                    }
                };

                this.animationFrame = requestAnimationFrame(animate);
            },
            updateDimensions() {
                if(this.isDestroyed || !this.$refs || !this.$refs.track) return;

                const track = this.$refs.track;
                if(!track || typeof track.offsetWidth === 'undefined') return;

                this.trackWidth = track.offsetWidth || 0;
                this.contentWidth = track.scrollWidth || 0;
            }
        },
        render(createElement) {
            const slides = this.$slots.default || [];
            const links = this.extractLinksFromSlots(createElement, slides);

            this.$nextTick(() => {
                if(!this.isDestroyed && this.$refs.track) {
                    this.slides = Array.from(this.$refs.track.children || []);
                    this.updateDimensions();
                }
            });

            const leftSpacer = createElement('div', {
                key: 'left-spacer',
                style: {
                    width: `${this.leftSpacerWidth}px`,
                    flexShrink: 0,
                    height: '1px'
                }
            });

            const rightSpacer = createElement('div', {
                key: 'right-spacer',
                style: {
                    width: `${this.rightSpacerWidth}px`,
                    flexShrink: 0,
                    height: '1px'
                }
            });

            const trackContent = [leftSpacer, ...links, rightSpacer];

            return createElement('div', {
                class: 'm-nav-carousel'
            }, [
                createElement('div', {
                    class: 'm-nav-carousel__wrapper slick-list',
                    style: {
                        overflow: 'hidden'
                    }
                }, [
                    createElement('div', {
                        class: 'm-nav-carousel__track',
                        ref: 'track',
                        style: {
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'nowrap',
                            overflowX: 'visible',
                            width: '100%',
                            cursor: this.draggable ? 'grab' : 'default'
                        },
                        on: {
                            click: (e) => {
                                if(this.dragStarted) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this.dragStarted = false;
                                }
                            }
                        }
                    }, trackContent)
                ])
            ]);
        }
    };
</script>

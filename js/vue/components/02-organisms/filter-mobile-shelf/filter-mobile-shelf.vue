<template>
    <transition
        :name="!isDesktop ? '-slide-up': ''"
        @afterLeave="onAfterLeave">

        <div
            v-show="isVisible || isDesktop"
            class="o-filterMobile"
            :class="isVisible ? '-isVisible': ''"
            :role="!isDesktop ? 'dialog' : false"
            :aria-modal="!isDesktop"
            :aria-labelledby="!isDesktop ? headingId : false"
            v-on="modalHandlers">

            <focus-trap
                :active="!isDesktop ? isVisible : null"
                :initial-focus="() => firstFocusable">

                <div class="o-filterMobile__container" :role="!isDesktop ? 'document' : false">
                    <div class="o-filterMobile__wrapper">
                        <div v-touch:swipe.down.stop="hide" class="o-filterMobile__drag"></div>

                        <div class="o-filterMobile__content">
                            <div class="o-filterMobile__header">
                                <div class="o-filterMobile__aside">
                                    <h2 :id="headingId" class="o-filterMobile__heading">{{ heading }}</h2>

                                    <!-- Doesn't need aria attributes because there is already one on page -->
                                    <a-loading-spinner class="-m-0" :aria="false" size="sm" :visible="loading" />
                                </div>

                                <div v-if="$slots['controls']" class="o-filterMobile__controls">
                                    <slot name="controls" />
                                </div>
                            </div>

                            <div class="o-filterMobile__scroll">
                                <slot />
                            </div>
                        </div>

                        <div v-if="$slots['done']" class="o-filterMobile__done">
                            <slot name="done" />
                        </div>

                    </div>
                </div>
            </focus-trap>
        </div>
    </transition>
</template>

<script>
    import requestAnimationFrame from '@common/source/js/utils/request-animation-frame';
    import bodyOverflow from '@common/source/js/utils/body-overflow';
    import keyCodes from '@common/source/js/utils/key-codes';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { theme } from '../../../../../../tailwind.config';

    const DESKTOP_THRESHOLD = parseInt(theme.screens.md);

    export default {
        name: 'OFilterMobileShelf',
        mixins: [ safeId ],
        safeIds: [
            'headingId'
        ],
        props: {
            heading: {
                type: String,
                default: ''
            },
            visible: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isVisible: false,
                viewportWidth: 0,

                // dynamically generated Id to prevent collisions
                headingId: ''
            };
        },
        computed: {
            firstFocusable() {
                // slots could change without this from knowing, so we need to recalculate which element is the first focusable element when shown
                let el = null;
                if(this.isVisible) {
                    el = this.$el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                }
                return el;
            },
            isDesktop() {
                return this.viewportWidth >= DESKTOP_THRESHOLD;
            },
            modalHandlers() {
                let handlers = {};
                if(!this.isDesktop) {
                    handlers = {
                        click: evt => {
                            this.clickOut(evt);
                        },
                        keydown: evt => {
                            const key = evt.which || evt.keyCode || 0;
                            if(key === keyCodes.ESC) {
                                this.hide();
                            }
                        }
                    };
                }
                return handlers;
            }
        },
        watch: {
            visible() {
                this.isVisible = this.visible;
            },
            isVisible() {
                if(this.isVisible) {
                    this.onShow();
                } else {
                    this.onHide();
                }
            }
        },
        created() {
            this.setViewport();
            window.addEventListener('resize', this.onResize);
        },
        mounted() {
            this.isVisible = this.visible;
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onResize);
        },
        methods: {
            show() {
                this.isVisible = true;
            },
            onShow() {
                this.$emit('show');
                bodyOverflow.hide();
            },
            hide() {
                this.isVisible = false;
            },
            onHide() {
                this.$emit('hide');
            },
            onAfterLeave() {
                bodyOverflow.show();
            },
            onResize() {
                requestAnimationFrame(this.setViewport());
            },
            clickOut(evt) {
                if(evt.target === this.$el) {
                    this.hide();
                }
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            }
        }
    };
</script>

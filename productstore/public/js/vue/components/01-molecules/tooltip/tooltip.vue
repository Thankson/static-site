<template>
    <div class="m-tooltip" v-on="rootEvents">
        <div v-if="$slots['button']">
            <slot name="button" />
        </div>
        <button
            v-else
            ref="button"
            class="m-tooltip__toggle"
            :type="isWithinForm ? 'button': 'toggle'"
            :aria-label="tooltipAriaLabel ? tooltipAriaLabel : false"
            :aria-labelledby="tooltipAriaLabelledby ? tooltipAriaLabelledby : false"
            :aria-describedby="tooltipId"
            :aria-expanded="ariaExpanded"
            :aria-controls="tooltipId"
            v-on="toggleEvents"
        >
            <a-icon class="m-tooltip__icon block" :size="tooltipIconSize" color="green">
                {{ tooltipIcon }}
            </a-icon>
        </button>

        <transition
            v-if="!disableTooltip && !disableTransition"
            name="-fade"
            @afterLeave="destroyPopper"
        >
            <div
                v-show="visible"
                :id="tooltipId"
                role="tooltip"
                class="m-tooltip__animation"
                :aria-hidden="!visible ? 'true' : 'false'"
            >
                <div
                    ref="tooltip"
                    class="m-tooltip__popup"
                    :class="tooltipPopupMod"
                >
                    <button
                        v-if="closeAlt && closeAriaLabel && closeIcon"
                        class="m-popUp__close"
                        tabindex="0"
                        :aria-label="closeAriaLabel"
                        data-testid="button-popUpClose"
                        @click="hide"
                    >
                        <img
                            class="m-popUp__closeImg"
                            :src="closeIcon"
                            :alt="closeAlt"
                            aria-hidden="true"
                        />
                    </button>
                    <span class="sr-only">{{ tooltipSrLabel }}</span>
                    <div v-if="tooltipRte" v-html="tooltipRte" />
                    <slot />
                    <div
                        class="m-tooltip__caret"
                        :style="{left: caretOffsetXPixels}"
                        @click="$refs.button.focus(); toggleVisibility();"
                    />
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import { createPopper } from '@popperjs/core/lib/popper-lite';
    import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
    import flip from '@popperjs/core/lib/modifiers/flip';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import offset from '@popperjs/core/lib/modifiers/offset';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import keyCodes from '@common/source/js/utils/key-codes';

    export default {
        name: 'MTooltip',
        mixins: [ safeId, isDesktop ],
        safeIds: [
            'tooltipId'
        ],
        props: {
            closeAlt: {
                type: String,
                default: null
            },
            closeAriaLabel: {
                type: String,
                default: null
            },
            closeIcon: {
                type: String,
                default: null
            },
            disableTooltip: {
                type: Boolean,
                default: false
            },
            isWithinForm: {
                type: Boolean,
                default: false
            },
            placement: {
                type: String,
                default: 'top'
            },
            popperOffsetXDesktop: {
                type: Number,
                default: 0
            },
            popperOffsetXMobile: {
                type: Number,
                default: 0
            },
            popperOffsetY: {
                type: Number,
                default: 0
            },
            toggle: {
                type: Boolean,
                default: false
            },
            tooltipAriaLabel: {
                type: String,
                default: ''
            },
            tooltipIcon: {
                type: String,
                default: 'help'
            },
            tooltipIconSize: {
                type: String,
                default: 'sm'
            },
            tooltipPopupMod: {
                type: String,
                default: null
            },
            tooltipAriaLabelledby: {
                type: String,
                default: ''
            },
            tooltipSrLabel: {
                type: String,
                default: 'Tooltip: '
            },
            tooltipRte: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                disableTransition: false,
                hovered: false,
                popperOffsetX: 0,
                tooltipId: '',
                visible: false
            };
        },
        computed: {
            ariaExpanded() {
                const val = this.visible ? 'true' : 'false';
                return this.toggle ? val : false;
            },
            caretOffsetXPixels() {
                // Multiply the inverse of current offsetX value by 2
                return `${this.popperOffsetX * -2}px`;
            },
            flipFallback() {
                let fallback = [];

                switch (this.placement) {
                    case 'top':
                        fallback = ['bottom', 'left', 'right'];
                        break;
                    case 'bottom':
                        fallback = ['top', 'left', 'right'];
                        break;
                    case 'left':
                        fallback = ['right', 'top', 'bottom'];
                        break;
                    case 'right':
                        fallback = ['left', 'top', 'bottom'];
                        break;
                }

                return fallback;
            },
            popperConfig() {
                return {
                    placement: this.placement,
                    modifiers: [
                        flip,
                        {
                            name: 'flip',
                            options: {
                                fallbackPlacements: this.flipFallback
                            }
                        },
                        // See https://popper.js.org/docs/v2/modifiers/offset/
                        offset,
                        {
                            name: 'offset',
                            options: {
                                offset: [this.popperOffsetX, this.popperOffsetY]
                            }
                        },
                        preventOverflow
                    ]
                };
            },
            rootEvents() {
                return !this.toggle ? {
                    // Root is controlled by hover events only
                    mouseover: this.mouseover,
                    mouseleave: this.mouseleave
                } : {
                    // Root is controlled by click and keydown events only
                    click: this.toggleVisibility,
                    keydown: evt => {
                        if(this.disableTooltip) {
                            return;
                        }
                        if(evt.keyCode === keyCodes.ENTER || evt.keyCode === keyCodes.SPACE) {
                            evt.preventDefault();
                            this.toggleVisibility();
                        }
                        if(evt.keyCode === keyCodes.ESC) {
                            this.hide();
                        }
                    }
                };
            },
            toggleEvents() {
                return !this.toggle ? {
                    focus: () => {
                        if(!this.hovered) {
                            this.show();
                        }
                    },
                    blur: this.hide,
                    click: this.toggleVisibility
                } : {
                    click: this.toggleVisibility,
                    keydown: evt => {
                        if(this.disableTooltip) {
                            return;
                        }
                        if(evt.keyCode === keyCodes.ENTER || evt.keyCode === keyCodes.SPACE) {
                            evt.preventDefault();
                            this.toggleVisibility();
                        }
                    }
                };
            }
        },
        watch: {
            isDesktop(val) {
                // Only if either offsetX val has been changed from 0 via props
                if(this.popperOffsetXDesktop !== 0 || this.popperOffsetXMobile !== 0) {
                    // Reset offsetX val based on isDesktop media query
                    this.setPopperOffsetX(val);
                    // Disable css opacity fade transition
                    this.disableTransition = true;
                    // Hide popper
                    this.visible = false;
                    // Create a new popper instance
                    this._popper = null;
                    // Reenable css opacity fade transition
                    setTimeout(() => {
                        this.disableTransition = false;
                    }, 150);
                }
            },
            visible() {
                if(this.visible) {
                    this.createPopper();
                }
            }
        },
        mounted() {
            const globalEvents = this.globalEvents();
            Object.keys(globalEvents).forEach(key => {
                const handler = globalEvents[key];
                window.addEventListener(key, handler);
            });
        },
        beforeDestroy() {
            const globalEvents = this.globalEvents();
            Object.keys(globalEvents).forEach(key => {
                const handler = globalEvents[key];
                window.removeEventListener(key, handler);
            });
        },
        created() {
            // Set init offsetX values on component mount
            this.setPopperOffsetX(this.isDesktop);
            // create non-reactive popper instance
            this._popper = null;
        },
        methods: {
            createPopper() {
                if(!this._popper && !this.disableTooltip) {
                    this._popper = createPopper(this.$el, this.$refs['tooltip'], this.popperConfig);
                }
            },
            destroyPopper() {
                if(this._popper) {
                    this._popper.destroy();
                    this._popper = null;
                }
            },
            setPopperOffsetX(isDesktopView) {
                if(isDesktopView) this.popperOffsetX = this.popperOffsetXDesktop;
                else this.popperOffsetX = this.popperOffsetXMobile;
            },
            show() {
                setTimeout(() => (this.visible = true), 150);
            },
            hide() {
                setTimeout(() => (this.visible = false), 150);
            },
            globalEvents() {
                return {
                    keydown: evt => {
                        if(evt.keyCode === keyCodes.ESC || evt.keyCode === keyCodes.TAB) {
                            this.hide();
                        }
                    },
                    click: evt => {
                        if(!evt.target.closest('.m-tooltip')) {
                            this.hide();
                        }
                    }
                };
            },
            mouseover() {
                if(!this.hovered) {
                    this.show();
                    this.hovered = true;
                }
            },
            mouseleave() {
                this.hide();
                this.hovered = false;
            },
            toggleVisibility() {
                this.visible = !this.visible;
            }
        }
    };
</script>

<template>
    <div
        class="m-callout"
        :class="
            arrowModifier.includes('-rightSwing') ? '-rightArrow' : '-leftArrow'
        "
    >
        <focus-trap
            :initial-focus="() => focusTrapBindings"
            :fallback-focus="() => $refs.calloutPanel"
        >
            <div class="relative h-full">
                <div
                    ref="calloutPanel"
                    class="m-callout__section bg-blue text-white"
                    :class="calloutModifier"
                    :style="computedStyles"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="calloutSrName"
                    @keydown.esc.prevent="onEsc"
                >
                    <!-- Arrow -->
                    <div class="m-callout__arrow bg-blue" :class="arrowModifier" aria-hidden="true"></div>

                    <!-- <a11y mapping> -->
                    <template v-if="$slots.titleText">
                        <div :id="calloutSrName" class="sr-only"><slot name="titleText" /></div>
                    </template>

                    <!-- RTE -->
                    <template v-if="$slots.rte">
                        <div class="m-callout__rte pr-10 mb-24">
                            <perfect-scrollbar ref="scroll">
                                <slot name="rte" />
                            </perfect-scrollbar>
                        </div>
                    </template>

                    <!-- CTA -->
                    <template v-if="$slots.cta">
                        <div class="m-callout__cta">
                            <slot name="cta" />
                        </div>
                    </template>
                </div>
            </div>
        </focus-trap>
    </div>
</template>
<script>
    import bodyOverflow from '../../../../../../../_common/source/js/utils/body-overflow';

    export default {
        name: 'MCallout',
        props: {
            arrowModifier: {
                type: String,
                default: '-rightSwing bg-blue -lg'
            },
            calloutModifier: {
                type: String,
                default: 'bg-blue text-white'
            },
            calloutSrName: {
                type: String,
                default: 'callout'
            },
            width: {
                type: String,
                default: '400px'
            }
        },
        data() {
            return {
                focusTarget: null,
                hasPrimedFocus: false, // has the initial tab been pressed
                shouldTrapFocus: false // don’t grab anything yet
            };
        },
        computed: {
            computedStyles() {
                return [this.width ? { maxWidth: this.width } : null];
            },
            focusTrapBindings() {
                return this.shouldTrapFocus ? this.focusTarget : this.$refs?.calloutPanel;
            }
        },
        mounted() {
            bodyOverflow.hide(); // disable body scroll
            document.addEventListener('keydown', this.handleInitialTab, true);
            this.$nextTick(() => {
                this.setFocusTarget();
            });
        },
        beforeDestroy() {
            document.removeEventListener('keydown', this.handleInitialTab, true);
            bodyOverflow.show(); // restore body scroll
        },
        methods: {
            // When callout is open, we want to trap focus inside it and not the background page.
            // The first time the user hits tab, we set the focus to the first focusable element.
            handleInitialTab(evt) {
                if(evt.key !== 'Tab' || this.hasPrimedFocus) return;
                evt.preventDefault();
                this.shouldTrapFocus = true;
                this.$nextTick(() => {
                    this.focusTarget?.focus?.();
                    this.hasPrimedFocus = true;
                });
                document.removeEventListener(
                    'keydown',
                    this.handleInitialTab,
                    true
                );
            },
            onEsc() {
                this.$emit('close');
            },
            setFocusTarget() { // set focus to first button or panel itself
                const panel = this.$refs?.calloutPanel;
                const firstButton = panel?.querySelector('button'); // Should be expandable to other focusable elements if needed
                this.focusTarget = firstButton || panel || null;
            }

        }
    };
</script>

<template>
    <div class="o-imeaAccordion pt-12 pb-20 border-t-1 border-gray-50">
        <div class="flex justify-between items-start">
            <div class="pt-8 md:flex" :class="{'pt-20': isCollapseAlwaysOpen || isCollapseOpen}">
                <ImeaSectionHeading
                    :closed-heading="closedHeading"
                    :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
                    :open-heading="openHeading"
                    @click="handleOpenClick"
                />
                <ImeaRemoveButton
                    v-show="isDesktop && isCollapseOpen"
                    button-mods="ml-20"
                    :remove-label="removeLabel"
                    @click="setIsCollapseOpen(false)"
                />
            </div>
            <ChevronButton
                v-if="!isCollapseAlwaysOpen"
                :is-inverted="isCollapseOpen"
                @click="handleOpenClick"
                @focus="setIsChevronFocused(true)"
                @blur="setIsChevronFocused(false)"
            />
        </div>
        <ImeaRemoveButton
            v-show="!isDesktop && isCollapseOpen"
            button-mods="mt-20 mb-18"
            :remove-label="removeLabel"
            @click="setIsCollapseOpen(false)"
        />
        <ImeaSectionSubheading
            v-if="subheading"
            :is-collapse-open="isCollapseAlwaysOpen || isCollapseOpen"
            :subheading="subheading"
        />
        <transition
            :name="isCollapseAlwaysOpen ? '' : '-expand'"
            @enter="handelEnter"
            @afterEnter="resetHeight"
            @leave="handleLeave"
            @afterLeave="resetHeight"
        >
            <div
                v-show="isCollapseAlwaysOpen || isCollapseOpen"
                ref="formWrapper"
                class="o-accordion__content"
                :class="[{ '-open': isCollapseAlwaysOpen || isCollapseOpen }]"
            >
                <slot />
            </div>
        </transition>
    </div>
</template>

<script>
    import { reflow } from '@common/source/js/utils/dom';
    import ChevronButton from '@productstore/source/js/vue/components/00-atoms/buttons/chevron-button.vue';
    import ImeaRemoveButton from '@productstore/source/js/vue/components/00-atoms/imea/imea-remove-button.vue';
    import ImeaSectionHeading from '@productstore/source/js/vue/components/00-atoms/imea/imea-section-heading.vue';
    import ImeaSectionSubheading from '@productstore/source/js/vue/components/00-atoms/imea/imea-section-subheading.vue';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    export default {
        name: 'OImeaAccordion',
        components: {
            ChevronButton,
            ImeaRemoveButton,
            ImeaSectionHeading,
            ImeaSectionSubheading
        },
        mixins: [isDesktop],
        props: {
            closedHeading: {
                type: String,
                required: true
            },
            /*
             * If isCollapseAlwaysOpen is true (value obtained from localization data and passed from child via prop):
             * - CSS transition is disabled
             * - Init state of collapse is open
             * - Chevron and remove buttons are not rendered
             * - Click events on the heading button do not toggle collapse
             */
            isCollapseAlwaysOpen: {
                type: Boolean,
                default: false
            },
            openHeading: {
                type: String,
                required: true
            },
            removeLabel: {
                type: String,
                required: true
            },
            subheading: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                isCollapseOpen: false
            };
        },
        methods: {
            handelEnter(el) {
                el.style.height = `${el.scrollHeight}px`;
            },
            handleLeave(el) {
                el.style.height = `${el.clientHeight}px`;
                reflow(el);
                el.style.height = '0px';
            },
            handleOpenClick() {
                if(this.isCollapseAlwaysOpen) return;
                if(!this.isCollapseOpen) {
                    window.dataLayer && window.dataLayer.push({
                        event: 'userEvent',
                        eC: 'Accordion Clicks',
                        eA: 'CTA',
                        eL: this.closedHeading
                    });
                }
                this.setIsCollapseOpen(!this.isCollapseOpen);
            },
            resetHeight() {
                const el = this.$refs['formWrapper'];
                if(el && el.style) el.style.height = null;
            },
            setIsChevronFocused(val) {
                this.$emit('set-is-chevron-focused', val);
            },
            setIsCollapseOpen(val) {
                this.isCollapseOpen = val;
                this.$emit('set-is-collapse-open', val);
            }
        }
    };
</script>

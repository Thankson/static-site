<template>
    <div v-if="refiners.length" class="o-facetGroup">
        <accordion
            :aria-label="facetAriaLabel ? replaceToken(facetAriaLabel, title): ''"
            arrow-size="-md"
            :title="title"
            title-el="div"
            :gtm-toggle-id="gtmToggleId"
            :mod-title="`-facet ${accordionTitleClass}`"
            mod-toggler="-facet"
            :content-id="contentId"
            :toggle-id="toggleId"
            :visible="isDesktop">

            <template v-slot:icon="$accordion">
                <span class="text-2xl leading-none">
                    <a-icon size="inherit" :class="[ $accordion.isOpened ? '-flip': '', $accordion.isReady ? '-transition' : '']">
                        keyboard_arrow_down
                    </a-icon>
                </span>
            </template>

            <div
                role="group"
                class="o-facetGroup__content"
                :class="contentClass"
                :aria-labelledby="toggleId">
                <div
                    v-for="(refiner, i) in refiners"
                    :key="i"
                    class="o-facetGroup__item">

                    <m-checkbox
                        class="-facet"
                        :label="refiner.name"
                        size="sm"
                        :name="refiner.value"
                        :value="selected"
                        :input-value="refiner.value"
                        :disabled="disabled || refiner.disabled"
                        @input="(val, event) => update(refiner, event)" />
                </div>
            </div>

        </accordion>
    </div>
</template>

<script>
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import replaceToken from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'OFacetGroupChecks',
        mixins: [
            safeId,
            isDesktop
        ],
        safeIds: [
            'toggleId',
            'contentId'
        ],
        props: {
            title: {
                type: String,
                required: true
            },
            disabled: {
                type: Boolean,
                default: false
            },
            accordionTitleClass: {
                type: String,
                default: ''
            },
            contentClass: {
                type: String,
                default: ''
            },
            facetAriaLabel: {
                type: String,
                default: ''
            },
            gtmCheckboxId: {
                type: Number,
                default: null
            },
            gtmToggleId: {
                type: Number,
                default: null
            },
            /** @typedef {{ name: string, value: string, disabled: boolean }} Refiner */
            /** @type {Array<Refiner>} */
            refiners: {
                type: Array,
                required: true
            },
            selected: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                // dynamically generated Ids
                toggleId: '',
                contentId: ''
            };
        },
        methods: {
            replaceToken,
            update(refiner, event) {
                this.$emit('input', refiner);
                if(this.gtmCheckboxId && event.target.checked) {
                    this.gtmTrackAction({id: this.gtmCheckboxId, text: refiner.name}, event);
                }
            }
        }
    };
</script>

<template>
    <div class="o-facetGroup">
        <accordion
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
                    <a-icon size="inherit" class="-transition" :class="$accordion.isOpened ? '-flip': ''">
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

                    <m-radio
                        v-model="selected"
                        :label="refiner.name"
                        name="CatListSortBy"
                        size="sm"
                        :input-value="refiner.value"
                        @change="gtmRadioboxId ? gtmTrackAction({id: gtmRadioboxId, text: refiner.name}, $event) : ''"
                    />
                </div>
            </div>

        </accordion>
    </div>
</template>

<script>
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'OFacetGroupRadios',
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
            gtmRadioboxId: {
                type: Number,
                default: null
            },
            gtmToggleId: {
                type: Number,
                default: null
            },
            /** @typedef {{ name: string, value: string }} Refiner */
            /** @type {Array<Refiner>} */
            refiners: {
                type: Array,
                required: true
            },
            value: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // dynamically generated Ids
                toggleId: '',
                contentId: ''
            };
        },
        computed: {
            selected: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        }
    };
</script>

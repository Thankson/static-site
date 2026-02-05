<template>
    <div class="o-checkoutSequence">
        <OSequentialSection
            :class="sequentialSectionClassModifier"
            :container-type="containerType"
            :title-type="titleType"
            :title-copy="titleCopy"
            :sequence-index="sequenceIndex"
            :change-label="getLocalizationProp('Labels.ShippingSection.Change')"
        >
            <template v-slot:selctedTitle>
                <div :class="sequentialTitleClassModifier">
                    <slot name="selected-title" />
                </div>
            </template>

            <slot />
        </OSequentialSection>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import OSequentialSection from '../../02-organisms/sequential-section/sequential-section.vue';

    export default {
        name: 'OCheckoutSequence',
        components: {
            OSequentialSection
        },
        mixins: [ localizationMixin],
        props: {
            containerType: {
                type: String,
                default: 'section'
            },
            scriptId: {
                type: String,
                default: ''
            },
            sequenceIndex: {
                type: Number,
                required: true
            },
            sequentialSectionClassModifier: {
                type: String,
                default: ''
            },
            sequentialTitleClassModifier: {
                type: String,
                default: ''
            },
            titleCopy: {
                type: String,
                default: ''
            },
            titleType: {
                type: String,
                default: 'h2'
            }
        }
    };
</script>

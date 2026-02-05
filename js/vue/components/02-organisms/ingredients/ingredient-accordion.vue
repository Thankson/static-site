<template>
    <div class="o-ingredientAccordion">
        <accordion
            arrow-color="gray-150"
            arrow-size="-md"
            :content-id="accordionId"
            mod-title="-ingredList"
            mod-toggler="-ingredList"
            mod-wrapper-title="mr-40"
            :title="title"
            title-el="h3"
            :toggle-id="toggleId">

            <slot
                item-element-class="o-ingredientAccordion__item"
                list-element-class="o-ingredientAccordion__list"
            />
        </accordion>
    </div>
</template>

<script>
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'OIngredientAccordion',
        mixins: [ safeIdMixin ],
        safeIds: [
            'accordionId',
            'toggleId'
        ],
        props: {
            title: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                accordionId: '',
                toggleId: ''
            };
        }
    };
</script>

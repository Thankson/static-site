<template>
    <div class="m-ingredientCard">
        <h4 class="m-ingredientCard__heading">
            {{ title }}
        </h4>

        <div v-if="rte" v-html="rte"></div>
    </div>
</template>

<script>
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'MIngredientCard',
        mixins: [ safeIdMixin ],
        props: {
            rte: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                required: true
            }
        }
    };
</script>

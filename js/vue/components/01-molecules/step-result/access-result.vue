<template>
    <div class="m-accessResult">
        <div v-html="resultData"></div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MAccessResult',
        mixins: [ localizationMixin],
        props: {
            resultData: {
                type: String,
                default: ''
            }
        }
    };
</script>

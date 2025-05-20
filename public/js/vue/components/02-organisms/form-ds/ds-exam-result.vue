<template>
    <div class="o-dsExamResult">
        <div class="o-dsExamResult__fields -allRadius m-auto text-center" v-html="resultMessage"></div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsExamResult',
        mixins: [ localizationMixin],
        props: {
            examResult: {
                type: Object,
                default: () => ({
                })
            }
        },
        computed: {
            resultMessage() {
                return this.examResult.isPass ? this.getLocalizationProp('Data.PassedMessage') : this.getLocalizationProp('Data.NotPassedMessage');
            }
        }
    };
</script>

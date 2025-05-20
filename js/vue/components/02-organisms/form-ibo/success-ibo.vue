<template>
    <div class="o-successIbo">
        <div class="o-successIbo__fields -allRadius" v-html="getLocalizationProp('Data.SubmitSuccess')">
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OSuccessIbo',
        mixins: [localizationMixin]
    };
</script>

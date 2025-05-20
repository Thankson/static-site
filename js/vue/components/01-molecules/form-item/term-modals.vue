<template>
    <div class="m-termModals">
        {{ getLocalizationProp('Data.Text') }}
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'MTermModals',
        mixins: [ localizationMixin]
    };
</script>

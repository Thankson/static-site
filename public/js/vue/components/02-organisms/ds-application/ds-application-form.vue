<template>
    <div class="o-dsApplicationForm">
        <o-process class="-ds" :script-id="scriptId"></o-process>
        <slot v-if="!isSubmitSuccess" name="ds-process" />
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsApplicationForm',
        mixins: [ localizationMixin],
        computed: {
            ...mapState('dsApp', ['isSubmitSuccess'])
        }
    };
</script>

<template>
    <div v-show="show" class="o-dsEnterInfo">
        <form class="o-dsEnterInfo__Info space-y-32">
            <o-ds-personal-info ref="dsPersonalInfoRef" :script-id="scriptId"></o-ds-personal-info>
            <o-ds-personal-info-more ref="dsPersonalInfoMoreRef" :script-id="scriptId"></o-ds-personal-info-more>
            <o-ds-material-info ref="dsMaterialInfoRef" :script-id="scriptId"></o-ds-material-info>
            <o-ds-extra-info ref="dsExtraInfoRef" :script-id="scriptId"></o-ds-extra-info>

            <v-button
                key="info"
                class="o-dsEnterInfo__ctaBtn -full mt-30"
                @click="submitInfoForm">
                {{ getLocalizationProp('Labels.Continue') }}
            </v-button>
        </form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsEnterInfo',
        mixins: [ localizationMixin],
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            show() {
                return this.activeStepProcessId === this.getLocalizationProp('Data.ProcessID');
            }
        },
        methods: {
            submitInfoForm() {
                //
            }
        }
    };
</script>

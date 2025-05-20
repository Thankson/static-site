<template>
    <div v-show="show" class="o-iboEnterInfo">
        <form v-show="showUploadPhotosForm" class="o-iboEnterInfo__uploadPhotos">
            <o-upload-photos :script-id="scriptId"></o-upload-photos>
        </form>

        <form v-show="showInfoForm" class="o-iboEnterInfo__Info space-y-32">
            <o-personal-info ref="personalInfoRef" :script-id="scriptId"></o-personal-info>
            <o-company-info ref="companyInfoRef" :script-id="scriptId"></o-company-info>
            <o-material-info v-show="ageIsUnderThreshold" ref="materialInfoRef" :script-id="scriptId"></o-material-info>
            <o-extra-info ref="extraInfoRef" :script-id="scriptId"></o-extra-info>

            <v-button
                key="info"
                class="o-iboEnterInfo__ctaBtn -full mt-30 max-w-md m-auto"
                @click="submitInfoForm">
                {{ getLocalizationProp('Labels.Continue') }}
            </v-button>
        </form>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'OIboEnterInfo',
        mixins: [ localizationMixin ],
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            ...mapState('iboApp', ['showUploadPhotosForm', 'showInfoForm']),
            show() {
                return this.activeStepProcessId === this.getLocalizationProp('Data.ProcessID');
            },
            ageIsUnderThreshold() {
                return this.getLocalizationProp('Data.AgeIsUnderThreshold');
            }
        },
        methods: {
            ...mapMutations('access', ['GOTO_NEXT_STEP_PROCESS_ID']),
            ...mapActions('iboApp', ['submit']),
            async submitInfoForm() {
                // const personalInfoIsValidate = this.$refs.personalInfoRef.submitPartialForm();
                const companyInfoIsInvalid = this.$refs.companyInfoRef.submitPartialForm();

                const materialInfoIsInvalidate = this.ageIsUnderThreshold ? this.$refs.materialInfoRef.submitPartialForm() : false;

                const extraInfoIsInvalidate = this.$refs.extraInfoRef.submitPartialForm();

                const isInvalidate = companyInfoIsInvalid || materialInfoIsInvalidate || extraInfoIsInvalidate;

                if(!isInvalidate) {
                    eventBus.$emit('iboEnterInfoFinished');

                    this.GOTO_NEXT_STEP_PROCESS_ID();
                }
            },
            jumpToInfoForm() {
                // TAG
                // 1. go to enter info form
                // 2. do show info
                this.showInfoFormOnly();
                // 3. go to field via hash
            }
        }
    };
</script>

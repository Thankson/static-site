<template>
    <div class="o-iboApplicationForm">
        <o-process :script-id="scriptId"></o-process>

        <slot v-if="!isSubmitSuccess" name="ibo-process" />
        <o-success-ibo v-else class="mt-15" :script-id="scriptId"></o-success-ibo>

        <m-ibo-startup-apply-notice-modal :script-id="scriptId" :modal-obj="startupApplyNoticeModal"></m-ibo-startup-apply-notice-modal>
        <m-ibo-overwrite-ibo-notice-modal :script-id="scriptId" :modal-obj="overwriteIboNoticeModal"></m-ibo-overwrite-ibo-notice-modal>
    </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OIboApplicationForm',
        mixins: [ localizationMixin],
        data() {
            return {
                startupApplyNoticeModal: {},
                overwriteIboNoticeModal: {}
            };
        },
        computed: {
            ...mapState('access', ['activeStepProcessId']),
            ...mapState('iboApp', ['isSubmitSuccess', 'showUploadPhotosForm', 'showInfoForm']),
            positionInfo() {
                return {
                    processID: this.activeStepProcessId,
                    showUploadPhotosForm: this.showUploadPhotosForm,
                    showInfoForm: this.showInfoForm
                };
            }
        },
        watch: {
            positionInfo: {
                handler() {
                    this.STORE_CURRENT_POSITION(this.activeStepProcessId);
                },
                deep: true
                // immediate: true
            }
        },
        mounted () {
            this.startupApplyNoticeModal = {
                content: this.getLocalizationProp('Data.StartupApplyNotice'),
                ok: this.getLocalizationProp('Labels.Confirm'),
                cancel: this.getLocalizationProp('Labels.Cancel'),
                okAction: () => {}
            };
            this.overwriteIboNoticeModal = {
                content: this.getLocalizationProp('Data.OverwriteIBONotice'),
                ok: this.getLocalizationProp('Labels.Yes'),
                cancel: this.getLocalizationProp('Labels.No'),
                okAction: () => {}
            };
        },
        methods: {
            ...mapMutations('iboApp', ['STORE_CURRENT_POSITION'])
        }
    };
</script>

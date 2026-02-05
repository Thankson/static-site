<template>
    <section class="o-ncvModalSection">
        <o-new-customer-video-modal
            :abort-modal="getLocalizationProp('Data.AbortModal', null) || {}"
            :complete-modal="getLocalizationProp('Data.CompleteModal', null) || {}"
            :learn-more-page="getLocalizationProp('Data.LearnMorePage', null) || {}"
            :localization="getLocalizationProp('Labels.Video', null) || {}"
            :video-data="getLocalizationProp('Data.Video.VirtualVideo', null) || {}"
            :video-image="getLocalizationProp('Data.Image', null) || {}"
            :is-cn="true"
            :video-description="getLocalizationProp('Data.Description', null) || ''"
            :video-labels="getLocalizationProp('Labels', null) || {}"
        >
        </o-new-customer-video-modal>
    </section>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ONcvModalSection',
        mixins: [ localizationMixin ],
        mounted () {
            this.changeNcvModalSize();
        },
        methods: {
            changeNcvModalSize() {
                this.$modal.config({
                    focusEl: '.a-closeX',
                    margin: '0',
                    width: '680px'
                });
            }
        }
    };
</script>

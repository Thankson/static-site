<template>
    <section class="o-ncvLandingSection">
        <o-new-customer-video-landing
            :abort-modal="getLocalizationProp('Data.AbortModal', null) || {}"
            :complete-modal="getLocalizationProp('Data.CompleteModal', null) || {}"
            :cta-link="getLocalizationProp('Data.CtaLink', null) || {}"
            :learn-more-page="getLocalizationProp('Data.LearnMorePage', null) || {}"
            :localization="getLocalizationProp('Labels.Video', null) || {}"
            :video-data="getLocalizationProp('Data.Video.VirtualVideo', null) || {}"
            :video-image="getLocalizationProp('Data.Image', null) || {}"
            :video-info="getLocalizationProp('Data.Info', null) || {}"
            :hide-cta="getLocalizationProp('Data.HideCTA', false) || false"
            :hide-info="getLocalizationProp('Data.HideInfo', false) || false"
            :is-cn="true"
            :is-watched="getLocalizationProp('Data.Video.VirtualVideo.IsWatched', false) || false"
            :info-on-top="getLocalizationProp('Data.InfoOnTop', false) || false"
            :video-description="getLocalizationProp('Data.Description', '') || ''"
            :video-play-button-icon="getLocalizationProp('Data.VideoPlayButtonIcon', null) || {}"
            :video-tag="getLocalizationProp('Data.VideoTag', null) || {}"
            :video-labels="getLocalizationProp('Labels', null) || {}"
        >
        </o-new-customer-video-landing>
    </section>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ONcvLandingSection',
        mixins: [ localizationMixin ]
    };
</script>

<template>
    <div class="o-dsMaterialInfo">
        <m-form-title title="Please submit additional materials since you are under 22."></m-form-title>

        <div class="o-dsMaterialInfo__fields">
            <m-example-tip
                key="uploadMaterialsTip"
                tip-name="uploadMaterialsTip"
                :text="getLocalizationProp('Labels.UploadMaterialsTip')"
                :cta-text="getLocalizationProp('Labels.Here')"
                :example-rtx="getLocalizationProp('Data.UploadMaterialsDemo')"
            ></m-example-tip>

            <div class="o-dsMaterialInfo__field">
                <label class="m-formItemInput__label" for="frontOfIdCard">{{ getLocalizationProp('Labels.WorkCertificate') }}</label>
                <m-images-upload></m-images-upload>
            </div>

            <div class="o-dsMaterialInfo__field">
                <label class="m-formItemInput__label" for="frontOfIdCard">{{ getLocalizationProp('Labels.EDRecommendationGuaranteeLetter') }}</label>
                <m-images-upload></m-images-upload>
            </div>

            <div class="o-dsMaterialInfo__field">
                <label class="m-formItemInput__label" for="frontOfIdCard">{{ getLocalizationProp('Labels.HandwriteCommitmentLetter') }}</label>
                <m-images-upload></m-images-upload>
            </div>

            <m-tip
                :text="getLocalizationProp('Data.UploadMaterialsNotice')"
            ></m-tip>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsMaterialInfo',
        mixins: [ localizationMixin]
    };
</script>

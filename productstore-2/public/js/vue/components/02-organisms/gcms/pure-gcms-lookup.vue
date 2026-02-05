<template>
    <section class="o-pureGCMSLookup" :style="{ backgroundImage: `url(${getLocalizationProp('Data.BackgroundImage')})` }">
        <div class="o-pureGCMSLookup__container">
            <!-- Title -->
            <h2 class="o-pureGCMSLookup__title">
                {{ getLocalizationProp('Data.Title') }}
            </h2>

            <!-- RTE content -->
            <div class="o-pureGCMSLookup__rte m-rte" v-html="getLocalizationProp('Data.RTE')"></div>

            <!-- GCMS Search -->
            <div class="o-pureGCMSLookup__form">
                <m-gcms-search
                    class="-lg"
                    :action-url="getLocalizationProp('Data.GCMSSearchResultPage.Url')"
                    :localization="getLocalizationProp('Labels.GCMSSearchForm', null) || {}" />
            </div>
        </div>
    </section>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OPureGcmsLookup',
        mixins: [ localizationMixin ]
    };
</script>

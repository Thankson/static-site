<template>
    <article class="m-roadBlock">
        <div class="m-roadBlock__wrapper">
            <div class="m-roadBlock__rte" v-html="getLocalizationProp('Labels.Text')"></div>
            <div class="m-roadBlock__cta">
                <v-button
                    class="m-roadBlock__button"
                    type="button"
                    :aria-label="getLocalizationProp('Labels.ButtonTextAriaLabel')"
                    :cta="getLocalizationProp('Labels.ButtonText')"
                    @click="reloadPage" />
            </div>
            <div v-if="getLocalizationProp('Labels.CornerImage')" class="a-cornerImagery -bottom -right" aria-hidden="true">
                <img
                    class="a-cornerImagery__img"
                    :alt="getLocalizationProp('Labels.CornerImage.Alt')"
                    :src="getLocalizationProp('Labels.CornerImage.Url')" />
            </div>
        </div>
    </article>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    export default {
        name: 'MRoadBlock',
        mixins: [ localizationMixin ],
        methods: {
            reloadPage: function() {
                window.location.reload();
            }
        }
    };
</script>

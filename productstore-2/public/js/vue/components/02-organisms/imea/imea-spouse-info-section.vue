<template>
    <o-imea-accordion
        :closed-heading="getLocalizationProp('Labels.ClosedHeading')"
        :open-heading="getLocalizationProp('Labels.OpenHeading')"
        :remove-label="getLocalizationProp('Labels.Remove')"
        @set-is-collapse-open="setIsCollapseOpen"
    >
        <ImeaPersonalInfoFormMx
            v-if="isMx"
            form-id="spouse"
            :labels="formLabels"
            :is-collapse-open="isCollapseOpen"
            :form-for-self-info="false"
        />
        <ImeaPersonalInfoForm
            v-else
            form-id="spouse"
            :labels="formLabels"
            :is-collapse-open="isCollapseOpen"
            :form-for-self-info="false"
        />
    </o-imea-accordion>
</template>
<script>
    import ImeaPersonalInfoFormMx from './imea-personal-info-form-mx.vue';
    import ImeaPersonalInfoForm from './imea-personal-info-form.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OImeaSpouseInfoSection',
        components: {
            ImeaPersonalInfoFormMx,
            ImeaPersonalInfoForm
        },
        mixins: [localizationMixin],
        data() {
            return {
                isCollapseOpen: false
            };
        },
        computed: {
            formLabels() {
                return this.localization?.Labels || {};
            },
            isMx() {
                return this.$env?.Country === 'Mexico' || false;
            }
        },
        methods: {
            setIsCollapseOpen(isOpen) {
                this.isCollapseOpen = isOpen;
            }
        }
    };
</script>

<template>
    <div class="o-dsPersonalInfo">
        <m-form-title :title="getLocalizationProp('Data.PersonalInfoTitle')"></m-form-title>

        <div class="o-dsPersonalInfo__fields">
            <div v-for="info in personalInfo" :key="info.FieldLabel" class="o-dsPersonalInfo__field">
                <m-input-pseudo-inline :label="info.FieldLabel" :name="info.PropertyName" :value="info.PropertyValue"></m-input-pseudo-inline>
            </div>

            <m-tip :text="getLocalizationProp('Data.PersonalInfoTips')"></m-tip>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsPersonalInfo',
        mixins: [ localizationMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        computed: {
            personalInfo() {
                return this.getLocalizationProp('Data.PersonalInfo', []);
            }
        }
    };
</script>

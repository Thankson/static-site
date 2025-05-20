<template>
    <div class="o-personalInfo">
        <m-form-title :title="getLocalizationProp('Data.PersonalInfoTitle')"></m-form-title>

        <div class="o-personalInfo__fields">
            <div v-for="info in personalInfo" :key="info.FieldLabel" class="o-personalInfo__field">
                <m-input-pseudo-inline :label="info.FieldLabel" :name="info.PropertyName" :value="info.PropertyValue"></m-input-pseudo-inline>
            </div>

            <m-tip :text="getLocalizationProp('Data.PersonalInfoTips')"></m-tip>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import formDataStorageMixin from '@dsibo/source/js/vue/mixins/form-data-storage';
    export default {
        name: 'OPersonalInfo',
        mixins: [ localizationMixin, formDataStorageMixin],
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                phoneNumber: '',
                formFields: ['phoneNumber']
            };
        },
        computed: {
            personalInfo() {
                return this.getLocalizationProp('Data.PersonalInfo', []);
            }

        },
        watch: {
            personalInfo(newValue, oldValue) {
                this.phoneNumber = this.personalInfo.find(i => i.PropertyName === 'PhoneNumber').PropertyValue;
            }
        }
    };
</script>

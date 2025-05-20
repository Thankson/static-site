<template>
    <div class="o-dsPersonalInfoMore">
        <m-form-title :title="getLocalizationProp('Data.OtherInfoTitle')"></m-form-title>

        <div class="o-dsPersonalInfoMore__fields">
            <div class="o-dsPersonalInfoMore__field">
                <label class="m-formItemInput__label" for="maritalStatus">{{ getLocalizationProp('Labels.MaritalStatus') }}</label>
                <v-select
                    class="mb-8"
                    :options="maritalStatusOptions"
                    :values="maritalStatusValues"
                    :value="'111'"
                >
                </v-select>
            </div>
            <div class="o-dsPersonalInfoMore__field">
                <label class="m-formItemInput__label" for="education">{{ getLocalizationProp('Labels.Education') }}</label>
                <v-select
                    class="mb-8"
                    :options="educationOptions"
                    :values="educationValues"
                    :value="'111'"
                >
                </v-select>
            </div>
            <div class="o-dsPersonalInfoMore__field">
                <label class="m-formItemInput__label" for="job">{{ getLocalizationProp('Labels.Job') }}</label>
                <v-select
                    class="mb-8"
                    :options="jobOptions"
                    :values="jobValues"
                    :value="'111'"
                >
                </v-select>
            </div>
            <div class="o-dsPersonalInfoMore__field">
                <label class="m-formItemInput__label" for="workingCondition">{{ getLocalizationProp('Labels.WorkingCondition') }}</label>
                <v-select
                    class="mb-8"
                    :options="workingConditionOptions"
                    :values="workingConditionValues"
                    :value="'111'"
                >
                </v-select>
            </div>
            <div class="o-dsPersonalInfoMore__field">
                <label class="m-formItemInput__label" for="bankCard">{{ getLocalizationProp('Labels.BankCard') }}</label>
                <input-basic
                    id="bankCard"
                    v-model="bankCard"
                    placeholder="bankCard"
                ></input-basic>
            </div>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'ODsPersonalInfoMore',
        mixins: [ localizationMixin],
        data() {
            return {
                bankCard: ''
            };
        },
        computed: {
            maritalStatusOptions() {
                return this.getLocalizationProp('Data.MaritalStatusOptions', []).map(item => item.OptionName);
            },
            maritalStatusValues() {
                return this.getLocalizationProp('Data.MaritalStatusOptions', []).map(item => item.OptionID);
            },
            educationOptions() {
                return this.getLocalizationProp('Data.EducationOptions', []).map(item => item.OptionName);
            },
            educationValues() {
                return this.getLocalizationProp('Data.EducationOptions', []).map(item => item.OptionID);
            },
            jobOptions() {
                return this.getLocalizationProp('Data.JobOptions', []).map(item => item.OptionName);
            },
            jobValues() {
                return this.getLocalizationProp('Data.JobOptions', []).map(item => item.OptionID);
            },
            workingConditionOptions() {
                return this.getLocalizationProp('Data.WorkingConditionOptions', []).map(item => item.OptionName);
            },
            workingConditionValues() {
                return this.getLocalizationProp('Data.WorkingConditionOptions', []).map(item => item.OptionID);
            }
        }
    };
</script>

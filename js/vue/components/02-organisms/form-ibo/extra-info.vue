<template>
    <div class="o-extraInfo">
        <div class="o-extraInfo__fields -allRadius">
            <p>{{ getLocalizationProp('Data.IdentityInformationTitle') }}</p>
            <ul class="o-extraInfo__options my-16 space-y-16">
                <li
                    v-for="option in identityOptions"
                    :key="option.OptionName"
                    class="o-extraInfo__option "
                    :class="{'-active': participationLevel === option.OptionName}"
                >

                    <input
                        :id="option.OptionName"
                        v-model="participationLevel"
                        :value="option.OptionName"
                        type="radio"
                        :name="option.OptionName"
                        class="hidden"
                    />
                    <label
                        class="o-extraInfo__optionLabel"
                        :for="option.OptionName"
                    >
                        {{ option.Description }}
                    </label>
                </li>
            </ul>
            <m-error-messages
                v-if="isFieldError('participationLevel')"
                :errors="getValidationErrors('participationLevel')"
            ></m-error-messages>
        </div>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { required } from 'vuelidate/lib/validators';
    import { validationMixin } from 'vuelidate';
    import formValidateMixin from '@dsibo/source/js/vue/mixins/form-validate';
    import formDataStorageMixin from '@dsibo/source/js/vue/mixins/form-data-storage';
    export default {
        name: 'OExtraInfo',
        mixins: [ localizationMixin, validationMixin, formValidateMixin, formDataStorageMixin],
        validations() {
            return {
                participationLevel: {
                    required
                }
            };
        },
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                participationLevel: '',

                formFields: ['participationLevel']
            };
        },
        computed: {
            errorMessages() {
                return {
                    participationLevel: {
                        required: this.getLocalizationProp('Labels.CommonErrorMessage')
                    }
                };
            },
            identityOptions() {
                return this.getLocalizationProp('Data.IdentityOptions', []);
            }
        }
    };
</script>

<template>
    <GuiCodeForm
        ref="form"
        :error-label="errorMsg"
        :input-label="inputLabel"
        :input-value="value"
        :is-error="error"
        :is-loading="loading"
        :is-readonly="isReadonly"
        :is-success="success"
        :submit-label="submitLabel"
        :success-label="successLabel"
        @submit="onSubmit">

        <template #input="$slotProps">
            <GuiLoveCodeAutocomplete
                ref="input"
                v-model="value"
                :input-id="$slotProps.inputId"
                :input-class-names="$slotProps.inputClassNames"
                :no-results-label="noResultsLabel"
                :placeholder="inputPlaceholder"
                :aria-invalid="$slotProps.isError"
                :aria-describedby="$slotProps.isError ? $slotProps.inputErrorId : null"
                :readonly="isReadonly"
            />
        </template>
    </GuiCodeForm>
</template>

<script>
    import GuiCodeForm from './gui-code-form.vue';
    import GuiLoveCodeAutocomplete from '../gui-love-code-autocomplete/gui-love-code-autocomplete.vue';
    import guiEditMixin from '../../../mixins/gui-edit';
    import updateDonationApi from '@api/routes/account/customers/updatedonation';

    export default {
        name: 'MGuiEditLoveCode',
        components: {
            GuiCodeForm,
            GuiLoveCodeAutocomplete
        },
        mixins: [ guiEditMixin ],
        props: {
            carrierType: {
                type: String,
                required: true
            },
            noResultsLabel: {
                type: String,
                default: 'No results found'
            }
        },
        data() {
            return {
                value: ''
            };
        },
        watch: {
            inputValue() {
                this.value = this.inputValue;
            }
        },
        mounted() {
            this.value = this.inputValue;
        },
        methods: {
            focusInput() {
                this.$refs.input?.focusInput();
            },
            updateCodeApi(value) {
                return updateDonationApi.post({
                    Value: value
                });
            }
        }
    };
</script>

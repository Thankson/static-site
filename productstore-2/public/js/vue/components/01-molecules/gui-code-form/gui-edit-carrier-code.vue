<template>
    <GuiCodeForm
        ref="form"
        :error-label="errorMsg"
        :input-label="inputLabel"
        :input-placeholder="inputPlaceholder"
        :input-value="savedCode"
        :is-error="error"
        :is-loading="loading"
        :is-readonly="isReadonly"
        :is-success="success"
        :submit-label="submitLabel"
        :success-label="successLabel"
        @submit="onSubmit"
    />
</template>

<script>
    import GuiCodeForm from './gui-code-form.vue';
    import guiEditMixin from '../../../mixins/gui-edit';
    import updateCarrierApi from '@api/routes/account/customers/updatecarrier';

    export default {
        name: 'MGuiEditCarrierCode',
        components: {
            GuiCodeForm
        },
        mixins: [ guiEditMixin ],
        props: {
            carrierType: {
                type: String,
                required: true
            }
        },
        methods: {
            updateCodeApi(value) {
                return updateCarrierApi.post({
                    Type: this.carrierType,
                    Value: value
                });
            }
        }
    };
</script>

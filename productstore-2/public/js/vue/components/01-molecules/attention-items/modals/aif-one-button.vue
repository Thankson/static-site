<template>
    <modal width="630px">
        <template v-slot:content>
            <div class="block px-30 pb-30 md:px-0 md:pb-0">
                <!-- RTE content -->
                <div class="mb-30" v-html="rteContent"></div>

                <!-- Buttons -->
                <div class="md:flex">
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button text-base px-50 py-12"
                        :aria-label="labels.Close || false">
                        {{ labels.Close }}
                    </button>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MOneButton',
        errorCodes: ['EmployeeOnlineShoppingNotAllowed'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

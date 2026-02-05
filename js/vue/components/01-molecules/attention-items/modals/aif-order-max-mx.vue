<template>
    <modal width="600px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <template v-if="data && labels.OkButtonText">
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button text-base font-medium mt-20 py-12 px-40 mb-30 md:mb-0">

                        {{ labels.OkButtonText }}
                    </button>
                </template>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MOrderMaxMx',
        errorCodes: ['OrderOverMonthlyWebCount'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

<template>
    <modal width="370px">
        <template v-slot:content>
            <div v-html="rteContent" />

            <button
                v-modal-hide
                type="button"
                class="a-button font-medium px-25 py-15 mt-36">

                {{ labels.Close || 'Close' }}
            </button>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MWeightLimitExceeded',
        errorCodes: ['SkuSumOverMaxWeight'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

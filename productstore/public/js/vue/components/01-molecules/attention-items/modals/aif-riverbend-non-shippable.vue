<template>
    <modal width="470px">
        <template v-slot:content>
            <div class="px-10 md:px-0">
                <div v-html="rteContent"></div>

                <button
                    v-if="labels.ContinueBrowsing"
                    v-modal-hide
                    type="button"
                    class="a-button text-base block font-medium mt-10 py-12 px-25 mb-25 md:mb-0 tracking-wide">
                    {{ labels.ContinueBrowsing }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MRiverbendNonShippable',
        errorCodes: ['InvalidRiverbendShippingAddress'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

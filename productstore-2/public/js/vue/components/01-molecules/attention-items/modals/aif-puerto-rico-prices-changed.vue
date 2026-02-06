<template>
    <modal width="370px">
        <template v-slot:content>
            <div class="px-10 pb-30 md:p-0">
                <div v-html="rteContent"></div>
                <div class="pt-20">
                    <button type="button" aria-label="Close">
                        <span aria-hidden="true" class="a-button text-sm font-medium px-20 py-10 mb-20" @click="hide">{{ labels.Continue }}</span>
                    </button>
                </div>
            </div>
        </template>
    </modal>
</template>
<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';
    export default {
        name: 'MAifPuertoRicoPricesChanged',
        errorCodes: ['PricesChanged'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

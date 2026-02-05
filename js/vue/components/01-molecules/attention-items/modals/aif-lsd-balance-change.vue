<template>
    <modal width="430px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>
                <button
                    v-modal-hide
                    type="button"
                    class="a-button text-base font-medium mt-10 py-12 px-25 mb-15 md:mb-0 block w-full md:w-auto">
                    {{ labels.Close }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MPueNotice',
        errorCodes: ['CertBalanceChange', 'LsdBalanceChange'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

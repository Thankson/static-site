<template>
    <modal :width="isRiverbend ? '370px' : '620px'">
        <template v-slot:content>
            <div class="" :class="isRiverbend ? 'px-0' : 'px-30 md:px-0'">
                <div v-html="rteContent"></div>

                <a :href="labels.Button.Url" class="a-button text-base font-medium mt-10 py-12 px-25 mb-25 md:mb-0 md:w-200 text-center inline-block">
                    {{ labels.Button.Text }}
                </a>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MBadDebtModal',
        errorCodes: ['BadDebt', 'CustomerHasOwingBalanceAndStopOrderPurchase'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

<template>
    <modal width="500px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>
                <button
                    v-modal-hide
                    type="button"
                    class="a-button text-base text-center block w-full font-medium mt-18 py-12 px-30 mb-30 md:mb-0 md:w-auto leading-tight"
                    @click="expandPaymentMethod">
                    {{ data.ChoosePayMethod }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MCollectHoldAch',
        errorCodes: ['DayWaitAchRule', 'CollectionHoldAch'],
        mixins: [ attentionItemModalMixin ],
        methods: {
            ...mapActions('checkoutAccordions', ['expandPaymentMethod'])
        }
    };
</script>

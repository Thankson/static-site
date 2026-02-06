<template>
    <modal width="535px">
        <template v-slot:content>
            <div>
                <div v-html="rteContent"></div>

                <template v-if="data && data.OrderLink">
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button text-base font-medium mt-10 py-12 px-25 mb-15 md:mb-0"
                        @click="goToPayment"
                    >
                        {{ data.OrderLink.Text }}
                    </button>
                </template>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MPendingOrderModal',
        errorCodes: ['HasPendingPayment'],
        mixins: [ attentionItemModalMixin ],
        methods: {
            goToPayment() {
                this.data?.OrderLink ? window.location.href = this.data.OrderLink.Url : this.$modal.hide();
            }
        }
    };
</script>

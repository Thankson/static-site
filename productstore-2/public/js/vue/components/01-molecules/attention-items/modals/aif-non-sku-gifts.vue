<template>
    <modal width="370px">
        <template v-slot:content>
            <div class="px-10 pb-30 md:p-0">
                <div v-html="rteContent"></div>
                <div class="pt-20">
                    <a
                        :href="data.ContinueShoppingLink.Url"
                        class="a-button text-sm font-medium px-20 py-10 mb-20">
                        {{ data.ContinueShoppingLink.Text }}
                    </a>
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button -white text-sm font-medium px-20 py-10 "
                        @click="checkout">
                        {{ labels.CheckoutNowButtonText }}
                    </button>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MPueNotice',
        errorCodes: ['InvalidLSDPromotionsInCart'],
        mixins: [ attentionItemModalMixin ],
        props: {
            checkout: {
                type: Function,
                required: true
            }
        }
    };
</script>

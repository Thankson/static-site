<template>
    <modal width="630px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <div class="md:flex">
                    <a
                        v-if="data.EditLink && data.EditLink.Url"
                        class="a-button -white w-full text-center justify-center text-base font-medium leading-tight mb-20 py-12 md:w-auto md:leading-normal md:mb-0 md:py-11 md:px-50 md:mr-15"
                        :href="data.EditLink.Url">

                        {{ data.EditLink.Text }}
                    </a>

                    <button
                        v-modal-hide
                        type="button"
                        class="a-button w-full text-center justify-center text-base font-medium leading-tight mb-20 py-12 md:w-auto md:leading-normal md:mb-0 md:py-12 md:px-25"
                        @click="expandPaymentMethod">

                        {{ labels }}
                    </button>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MSingleAchOrderMax',
        errorCodes: ['OverMonthlyAchOrders'],
        mixins: [ attentionItemModalMixin ],
        methods: {
            ...mapActions('checkoutAccordions', ['expandPaymentMethod'])
        }
    };
</script>

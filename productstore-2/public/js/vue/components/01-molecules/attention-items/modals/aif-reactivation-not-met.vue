<template>
    <modal width="505px">
        <template v-slot:content>
            <div>
                <div v-html="rteContent"></div>
                <div class="md:flex pt-8 md:pt-1">
                    <a
                        v-if="data.KeepShopping"
                        :href="data.KeepShopping.Url"
                        class="a-button text-base text-center font-medium pt-12 pb-9 md:px-24 mb-20 md:mb-0 block tracking-wide md:mr-10 ">
                        {{ data.KeepShopping.Text }}
                    </a>
                    <a
                        v-if="data.ProceedToCheckout"
                        :href="data.ProceedToCheckout.Url"
                        class="a-button -white text-base text-center font-medium pt-12 pb-9 px-24 block tracking-wide">
                        {{ data.ProceedToCheckout.Text }}
                    </a>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MReactivationNotMet',
        errorCodes: ['ReactivationPpCommitmentNotMet'],
        mixins: [ attentionItemModalMixin ]
    };
</script>

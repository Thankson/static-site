<template>
    <modal width="630px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <template v-if="data && data.EditLink">
                    <a
                        v-if="isLink"
                        :href="data.EditLink.Url"
                        class="a-button text-base font-medium mt-10 py-12 px-25 mb-15 md:mb-0">

                        {{ data.EditLink.Text }}
                    </a>

                    <button
                        v-else
                        v-modal-hide
                        type="button"
                        class="a-button text-base font-medium mt-10 py-12 px-25 mb-15 md:mb-0">

                        {{ data.EditLink.Text }}
                    </button>
                </template>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MHomeConversionPackModal',
        errorCodes: ['OrderOverMonthlyTotal', 'OrderOverMaxOrderSize', 'RiverbendRanchOrderValueUnderMinimumThreshold'],
        mixins: [ attentionItemModalMixin ],
        computed: {
            isLink() {
                console.log(`${window.location.origin}${window.location.pathname}`);
                if(!this.data.EditLink?.Url) {
                    return false;
                }

                return this.data.EditLink.Url !== `${window.location.origin}${window.location.pathname}`;
            }
        }
    };
</script>

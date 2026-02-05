<template>
    <modal width="500px">
        <template v-slot:content>
            <div class="block px-30 pb-30 md:px-0 md:pb-0">
                <!-- RTE content -->
                <div class="mb-30" v-html="rteContent"></div>

                <!-- List of unavailable items with scroll -->
                <m-unavailable-items
                    ref="unavailable-items"
                    :items="items"
                    :localization="modalData"
                    :max-height="210">
                </m-unavailable-items>

                <!-- Buttons -->
                <div class="md:flex">
                    <button
                        v-modal-hide
                        type="button"
                        class="a-button text-base px-50 py-12"
                        :aria-label="labels.Close || false">
                        {{ labels.Close }}
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
        name: 'MNoShipLsd',
        errorCodes: ['LineTypeChanged'],
        mixins: [ attentionItemModalMixin ],
        computed: {
            items() {
                let items = [];

                if(this.modalData?.Sections && this.modalData.Sections[0] && this.modalData.Sections[0].Data) {
                    items = this.modalData.Sections[0].Data;
                }

                return items;
            }
        },
        methods: {
            ...mapActions('checkoutAccordions', ['expandShippingAddress'])
        }
    };
</script>

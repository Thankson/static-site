<template>
    <modal width="370px">
        <template v-slot:content>
            <div class="px-30 md:px-0">
                <div v-html="rteContent"></div>

                <button v-modal-hide type="button" class="a-button text-base font-medium mt-10 mb-30 py-12 px-25 md:mb-0">
                    {{ labels.Close }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions, mapMutations } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MHomeConversionPackModal',
        errorCodes: ['CareerPackLimitExceeded', 'EnrollmentLengthCareerPackInvalid', 'GuestCareerPackNotAllowed', 'IsProductCareerPack'],
        mixins: [ attentionItemModalMixin ],
        mounted() {
            this.updateCart();
        },
        methods: {
            ...mapActions('cart', ['refreshData', 'removeItem']),
            ...mapMutations('cart', ['SET_LOADING']),

            async updateCart() {
                const lineId = this.sections.ReadonlyProductList?.Data?.[0]?.LineId;
                if(lineId) {
                    this.SET_LOADING();

                    await this.removeItem({ lineId });
                    await this.refreshData();

                    this.SET_LOADING(false);
                }
            }
        }
    };
</script>

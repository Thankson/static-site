<template>
    <modal width="370px">
        <template v-slot:content>
            <div class="px-10 pb-30 md:p-0">
                <div v-if="data.Product" v-html="rteContent"></div>
                <div class="pt-20">
                    <a
                        :href="data.ContinueShopping.Url"
                        class="a-button text-sm font-medium px-20 py-10 mb-20">
                        {{ data.ContinueShopping.Text }}
                    </a>
                    <button
                        type="button"
                        class="a-button -white text-sm font-medium px-20 py-10 "
                        :class="loading ? '-disabled': ''"
                        @click="removeItems">
                        {{ labels.RemoveAndCheckout }}
                    </button>
                    <div class="mx-auto mt-20" role="alert">
                        <a-loading-spinner :visible="loading" size="sm" />
                    </div>
                </div>
            </div>
        </template>
    </modal>
</template>
<script>
    import { mapActions, mapGetters, mapState } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';
    import api from '@api/routes/unredeempromotion';

    export default {
        name: 'MReactivationGiftNotMet',
        errorCodes: ['ReactivationGiftInCartPpCommitmentNotMet'],
        mixins: [ attentionItemModalMixin ],
        data() {
            return {
                loading: false
            };
        },
        computed: {
            ...mapState('cart', ['checkoutUrl']),
            ...mapGetters('cart', ['customerId']),
            serviceEnv() {
                return this.$env?.ServiceBaseUrl;
            },
            bearerToken() {
                return this.data.Token;
            }
        },
        methods: {
            ...mapActions('cart', ['refreshData']),
            async removeItems() {
                const params = {promotionId: this.data?.Product?.PromotionId};

                if(!this.loading) {
                    this.loading = true;
                    const response = await api.post(params);

                    if(response.success && response.data.Success) {
                        setTimeout(() => {
                            this.$modal.hide();
                            this.refreshData();
                            this.loading = false;
                        }, 500);
                    } else {
                        this.loading = false;
                    }
                }
            }
        }
    };
</script>

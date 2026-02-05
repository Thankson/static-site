<template>
    <modal width="520px">
        <template v-slot:content>
            <div class="px-25 md:px-20">
                <div v-html="rteContent"></div>

                <ul v-if="lineItems.length > 0">
                    <li
                        v-for="line in lineItems"
                        :key="line.LineId"
                        class="m-specialOffer">

                        <div
                            v-if="line.Image && line.Image.Url"
                            class="m-specialOffer__media">

                            <img
                                :src="line.Image.Url"
                                :alt="line.Image.Alt || line.Title"
                                class="m-specialOffer__img">
                        </div>

                        <span class="m-specialOffer__title">
                            {{ line.Title }}
                        </span>
                    </li>
                </ul>

                <!-- Button when on cart -->
                <!-- Anchor-tag when on checkout -->
                <v-button
                    v-modal-hide
                    :is-anchor="isAttentionItemOnCheckout"
                    :href="getCartLink"
                    :type="isAttentionItemOnCheckout ? 'link' : 'button'"
                    class="a-button w-full justify-center text-base font-medium mt-10 py-12 mb-20 md:font-bold"
                    :class="loading ? '-disabled': ''"
                    :aria-disabled="loading"
                    :aria-label="getOnCartOrCheckoutAriaLabel">
                    {{ getOnCartOrCheckoutLabel }}
                </v-button>

                <button
                    type="button"
                    class="a-button -white w-full justify-center text-base font-medium leading-tight mb-20 py-12 px-50 md:font-bold md:leading-normal md:mb-0 md:py-12 md:px-0"
                    :class="loading ? '-disabled': ''"
                    :aria-label="labels.RemoveOfferCheckoutAriaLabel || false"
                    :aria-disabled="loading"
                    @click="removeItems">
                    {{ labels.RemoveOfferCheckoutButtonText }}
                </button>

                <div class="mx-auto mt-20" role="alert">
                    <a-loading-spinner :visible="loading" size="sm" />
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MBogo',
        errorCodes: ['InvalidPromotionsInCart'],
        mixins: [ attentionItemModalMixin ],
        data() {
            return {
                loading: false
            };
        },
        computed: {
            ...mapState('cart', ['checkoutUrl']),

            getCartLink() {
                return this.labels?.CartLink?.Url ?? '';
            },
            getOnCartOrCheckoutAriaLabel() {
                return this.isAttentionItemOnCheckout
                    ? this.labels?.GoToCartButtonAriaLabel
                    : this.labels?.KeepShoppingButtonAriaLabel;
            },
            getOnCartOrCheckoutLabel() {
                return this.isAttentionItemOnCheckout
                    ? this.labels?.CartLink?.Text
                    : this.labels?.KeepShoppingButtonText;
            },
            // Determine if the Attention item is on checkout else follow Cart behavior
            isAttentionItemOnCheckout() {
                return this.data?.Location && this.data?.Location === 'Checkout';
            },
            lineItems() {
                let lineItems = [];

                const productList = this.sections.ReadonlyProductList;
                if(productList && Array.isArray(productList.Data)) {
                    productList.Data.forEach(({ Product }) => {
                        lineItems.push(Product);
                    });
                }

                return lineItems;
            }
        },
        methods: {
            ...mapActions('cart', ['refreshData', 'removeItem']),
            ...mapActions('checkout', ['getCheckout']),

            async removeItems() {
                if(!this.loading) {
                    let lineId = this.lineItems.map(i => i.LineId).join(',');
                    await this.removeItem({lineId: lineId});
                    this.loading = false;

                    if(this.isAttentionItemOnCheckout) {
                        // Refresh checkout
                        this.getCheckout();
                        this.$modal.hide();
                    } else {
                        if(this.checkoutUrl) {
                            window.location.href = this.checkoutUrl;
                        } else {
                            this.$modal.hide();
                            this.refreshData();
                        }
                    }
                }
            }
        }
    };
</script>

<template>
    <modal width="370px">
        <template v-slot:content>
            <div class="px-10 pb-30 md:p-0">
                <div v-if="data.Product && data.Product.length > 0" v-html="rteContent"></div>
                <div ref="welcomeGifts-lists">
                    <perfect-scrollbar>
                        <ul>
                            <li v-for="prd in data.Product" :key="prd.LineId" class="flex pt-20 md:pr-25">
                                <div class="w-70 flex-shrink-0">
                                    <img class="mx-auto" :src="prd.Image.Url" :alt="prd.Image.Alt">
                                </div>
                                <div class="pl-10 text-sm font-bold text-gray-120 leading-tight" v-html="prd.Title"></div>
                            </li>
                        </ul>
                    </perfect-scrollbar>
                </div>
                <div class="pt-20">
                    <a
                        :href="data.ContinueShopping.Url"
                        class="a-button text-sm font-medium px-20 py-10 mb-20">
                        {{ data.ContinueShopping.Text }}
                    </a>
                    <button
                        v-modal-hide
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
    import { mapActions, mapState } from 'vuex';
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';
    export default {
        name: 'MGiftPromotion',
        errorCodes: ['InvalidGiftPromotionsInCart', 'FreeGiftPPNotMet'],
        mixins: [ attentionItemModalMixin ],
        props: {
            checkout: {
                type: Function,
                required: true
            }
        },
        data() {
            return {
                loading: false
            };
        },
        computed: {
            ...mapState('cart', ['checkoutUrl'])
        },
        mounted() {
            this.updateScroll();
        },
        methods: {
            ...mapActions('cart', ['refreshData', 'removeItem']),

            async removeItems() {
                if(!this.loading) {
                    this.loading = true;
                    let lineId = this.data?.Product?.map(i => i.LineId).join(',');
                    await this.removeItem({lineId: lineId});
                    this.loading = false;

                    if(this.checkoutUrl) {
                        window.location.href = this.checkoutUrl;
                    } else {
                        this.$modal.hide();
                        this.refreshData();
                    }
                }
            },

            updateScroll() {
                const totalMaxHeight = 270;
                const scrollInterval = setInterval(() => {
                    if(this.$refs['welcomeGifts-lists']) {
                        const scroll = this.$refs['welcomeGifts-lists'].querySelector('.ps');
                        if(scroll) {
                            clearInterval(scrollInterval);

                            scroll.style.maxHeight = totalMaxHeight + 'px';

                            // To fix $refs bug
                            setTimeout(() => {
                                if(scroll.offsetHeight >= totalMaxHeight) {
                                    scroll.classList.add('ps--active-y');
                                    scroll.scrollTo(0, 1);
                                }
                            }, 100);
                        }
                    }
                }, 100);
            }
        }
    };
</script>

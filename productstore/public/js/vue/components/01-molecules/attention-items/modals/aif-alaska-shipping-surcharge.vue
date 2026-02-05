<template>
    <modal width="673px">
        <template v-slot:content>
            <div class="m-outOfStock">
                <div class="m-outOfStock__rte" v-html="rteContent"></div>
                <ul
                    v-if="sections.ReadonlyProductList && sections.ReadonlyProductList.Data.length > 0"
                    ref="outOfStock-lists"
                    class="m-outOfStock__list">
                    <!-- Scroll -->
                    <perfect-scrollbar>
                        <li
                            v-for="line in lineItems"
                            :key="line.Product.LineId"
                            class="m-outOfStock__listItem"
                        >
                            <m-aif-product-item
                                :line="line.Product"
                                :labels="labels"
                                :price="line.Product.Price"
                            ></m-aif-product-item>
                        </li>
                    </perfect-scrollbar>
                </ul>
                <div class="mx-auto mt-20" role="alert">
                    <a-loading-spinner :visible="loading" size="sm" />
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';

    export default {
        name: 'MAifAlaskaShippingSurcharge',
        errorCodes: ['ShowSurchargePrompt'],
        mixins: [ attentionItemModalMixin ],
        data() {
            return {
                loading: false,
                maxHeightUnit: 130
            };
        },
        computed: {
            lineItems() {
                let lineItems = [];

                const productList = this.sections.ReadonlyProductList;
                if(productList && Array.isArray(productList.Data)) {
                    productList.Data.forEach(product => {
                        lineItems.push(product);
                    });
                }

                return lineItems;
            }
        },
        mounted() {
            this.updateScroll();
        },
        methods: {

            updateScroll() {
                const totalMaxHeight = this.lineItems.length > 3 ? this.maxHeightUnit * this.lineItems.length : this.maxHeightUnit * 3;
                const scrollInterval = setInterval(() => {
                    if(this.$refs['outOfStock-lists']) {
                        const scroll = this.$refs['outOfStock-lists'].querySelector('.ps');
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

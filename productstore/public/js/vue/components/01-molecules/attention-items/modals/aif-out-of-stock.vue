<template>
    <modal :width="isCn ? '460px' : '673px'">
        <template v-slot:content>
            <div class="m-outOfStock">
                <div class="m-outOfStock__rte" v-html="rteContent"></div>
                <ul v-if="sections.ReadonlyProductList && sections.ReadonlyProductList.Data.length > 0" class="m-outOfStock__list">
                    <li
                        v-for="line in sections.ReadonlyProductList.Data"
                        :key="line.Product.LineId"
                        class="m-outOfStock__listItem"
                    >
                        <m-aif-product-item
                            :line="line.Product"
                            :labels="labels"
                            :price="findPrice(line.Product.PriceRange)"
                        ></m-aif-product-item>
                    </li>
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
        name: 'MAifOutOfStock',
        errorCodes: ['OrderRemovedProducts'],
        mixins: [ attentionItemModalMixin ],
        data() {
            return {
                loading: false
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
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        methods: {
            findPrice(priceRange) {
                let price = '';
                if(this.getUserFlags?.ViewMemberPricing) {
                    price = priceRange.MaxPreferredPrice;
                } else {
                    price = priceRange.MaxRegularPrice;
                }
                return price;
            }
        }
    };
</script>

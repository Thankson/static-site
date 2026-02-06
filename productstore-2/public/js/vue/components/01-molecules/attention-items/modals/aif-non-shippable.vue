<template>
    <modal width="673px" :will-hide="updateData">
        <template v-slot:content>
            <div class="m-nonShippable">
                <div v-html="replaceTokenArray(rteContent, [data.Carrier, data.ShipMethod])"></div>
                <div class="m-nonShippable__text -review">{{ labels.ReviewItem }}</div>
                <!-- Custom Scroll -->
                <perfect-scrollbar>
                    <ul v-if="lineItems.length > 0" class="m-nonShippable__list">
                        <li
                            v-for="line in lineItems"
                            :key="line.Product.LineId"
                        >
                            <non-shippable-item
                                :product-details="line"
                                :labels="labels"
                                :product-data="data"
                                @remove="hasUpdate += 1"
                                @undo="hasUpdate -= 1"
                            ></non-shippable-item>
                        </li>
                    </ul>
                </perfect-scrollbar>
                <div class="m-nonShippable__container -shipping">
                    <span class="m-nonShippable__text -or">{{ labels.Or }}:</span>
                    <div class="m-nonShippable__changeShipping">
                        <v-button
                            v-modal-hide class="text-base font-medium align-center inline-block py-16 px-20 leading-tight"
                            :aria-label="labels.ChangeShippingMethodAriaLabel"
                            @click="expandShippingMethod"
                        >
                            {{ labels.ChangeShippingMethod }}
                        </v-button>
                        <div class="m-nonShippable__footnote">{{ labels.Footnote }} </div>
                    </div>
                </div>
            </div>
        </template>
    </modal>
</template>

<script>
    import attentionItemModalMixin from '../../../../mixins/attention-item-modal';
    import { mapActions } from 'vuex';
    import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

    export default {
        name: 'MBogo',
        errorCodes: ['OrderProductNonShippable'],
        mixins: [ attentionItemModalMixin ],
        data() {
            return {
                hasUpdate: 0
            };
        },
        computed: {
            lineItems() {
                let lineItems = [];

                const productList = this.sections.EditableProductList;
                if(productList && Array.isArray(productList.Data)) {
                    productList.Data.forEach(product => {
                        lineItems.push(product);
                    });
                }
                return lineItems;
            }
        },
        methods: {
            ...mapActions('checkout', ['expandShippingMethod', 'getData']),
            replaceTokenArray,
            async updateData() {
                if(this.hasUpdate) {
                    await this.getData();
                }
                return true;
            }
        }
    };
</script>

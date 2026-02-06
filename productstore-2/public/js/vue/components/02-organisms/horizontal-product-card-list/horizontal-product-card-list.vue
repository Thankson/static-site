<template>
    <ul class="o-horizProdCardList">
        <li
            v-for="product in productsWithQuantity"
            :key="product.ItemId">
            <horizontal-product-card
                :product="product"
                :labels="labels"
                :quantity="product.Quantity"
                :validation-modal-labels="validationModalLabels"
                :video-modal-prompt-labels="videoModalPromptLabels"
            />
        </li>
    </ul>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';

    export default {
        name: 'OHorizontalProductCardList',
        props: {
            labels: {
                type: Object,
                default: () => {}
            },
            powerReviews: {
                type: Object,
                default: () => {}
            },
            products: {
                type: Array,
                default: () => []
            },
            validationModalLabels: {
                type: Object,
                default: () => {}
            },
            videoModalPromptLabels: {
                type: Object,
                default: () => {}
            }
        },
        computed: {
            ...mapState('cart', ['items']),
            productsWithQuantity() {
                return this.products.map(product => {
                    const matchingProducts = this.items.filter(item => item.FamilyId === product.FamilyID && item.LineType === 'WelcomeProgram');
                    const quantity = matchingProducts.reduce((acc, current) => acc + current?.Quantity || 0, 0);
                    return { ...product, Quantity: quantity };
                }) || [];
            }
        },
        watch: {
            products(newVal) {
                this.$nextTick(() => {
                    if(newVal.length > 0 && this.$env.HideAllPowerReviews === false) {
                        this.callPowerReviews();
                    }
                });
            }
        },
        async mounted() {
            this.SET_LOADING();
            await this.getData();
            this.SET_LOADING(false);
        },
        methods: {
            ...mapActions('cart', ['getData', 'refreshData']),
            ...mapMutations('cart', ['SET_LOADING']),

            callPowerReviews() {
                const categoryInfo = this.products?.map(product => {
                    return {
                        ENABLE_CLIENT_SIDE_STRUCTURED_DATA: false,
                        api_key: this.powerReviews?.Key,
                        locale: this.$custInfo?.uiCulture?.replace('-', '_') || 'en_US',
                        merchant_group_id: this.powerReviews?.MerchantGroupId,
                        merchant_id: this.powerReviews?.MerchantId,
                        page_id: product.FamilyID,
                        components: {
                            CategorySnippet: `category-snippet-${product.ItemId}`
                        }
                    };
                });
                console.log('categoryInfo', categoryInfo);
                window.pwr = window.pwr || function () {
                    // eslint-disable-next-line
                    (pwr.q = pwr?.q || []).push(arguments);
                };
                // eslint-disable-next-line
                pwr("render", categoryInfo);
            }
        }
    };
</script>

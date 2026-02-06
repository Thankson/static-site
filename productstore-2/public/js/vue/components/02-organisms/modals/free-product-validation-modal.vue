<template>
    <modal
        heading-class="text-xl leading-tight"
        width="470px">

        <template #heading>
            {{ titleLabel }}
        </template>

        <template #body>
            <ul class="-mb-10">
                <li
                    v-for="(product, productIndex) in duplicateProducts"
                    :key="product.LineId"
                    :class="productIndex > 0 ? 'mt-25' : ''">

                    <FreeProductValidationCard
                        :product="product"
                        :removed-label="removedLabel"
                        :selected="selectedLineId.indexOf(product.LineId) !== -1"
                        :undo-label="undoLabel"
                        @click="onItemSelect(product.LineId)"
                    />
                </li>
            </ul>
        </template>

        <template #footer>
            <p
                v-if="hasError"
                role="alert"
                class="text-red text-sm mb-20">

                {{ errorMsg }}
            </p>

            <div class="flex items-start flex-wrap">
                <button
                    class="a-button text-base px-25 py-12 mb-15 md:mb-0 md:mr-15"
                    type="button"
                    @click="onUpdateCart">

                    {{ updateCartLabel }}
                </button>

                <div class="flex-fill pl-15 md:order-1">
                    <a-loading-spinner
                        :visible="loading"
                        size="sm"
                    />
                </div>

                <button
                    v-modal-hide
                    class="a-button -outline text-base px-24 py-12"
                    type="button">

                    {{ cancelLabel }}
                </button>
            </div>
        </template>
    </modal>
</template>

<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import FreeProductValidationCard from '../../01-molecules/new-welcome/free-product-validation-card.vue';

    export default {
        name: 'OFreeProductValidationModal',
        components: {
            FreeProductValidationCard
        },
        props: {
            duplicateProducts: {
                type: Array,
                default: () => []
            },
            cancelLabel: {
                type: String,
                default: 'Cancel'
            },
            errorLabel: {
                type: String,
                default: 'Please make at least one selection to update your cart.'
            },
            removedLabel: {
                type: String,
                default: 'This item will be removed.'
            },
            serviceErrorLabel: {
                type: String,
                default: 'Sorry your cart cannot update. Please cancel and try again.'
            },
            titleLabel: {
                type: String,
                default: 'Which item would you like to remove?'
            },
            undoLabel: {
                type: String,
                default: 'Undo'
            },
            updateCartLabel: {
                type: String,
                default: 'Update Cart'
            }
        },
        data() {
            return {
                hasSelectionError: false,
                selectedLineId: []
            };
        },
        computed: {
            ...mapState('cart', ['hasMultipleCartErrors', 'loading']),

            errorMsg() {
                return this.hasSelectionError ? this.errorLabel : this.serviceErrorLabel;
            },
            hasError() {
                return this.hasSelectionError || this.hasMultipleCartErrors;
            }
        },
        watch: {
            duplicateProducts() {
                this.selectedLineId = [];
                this.hasSelectionError = false;
            }
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                this.SET_HAS_UPDATE_MULTIPLE_CART_ERRORS(false);
            });
        },
        methods: {
            ...mapActions('cart', ['updateQuantity']),
            ...mapMutations('cart', ['SET_LOADING', 'SET_HAS_UPDATE_MULTIPLE_CART_ERRORS']),

            hide() {
                this.$modal.hide();
            },
            onItemSelect(lineId) {
                const indexLineId = this.selectedLineId.indexOf(lineId);
                if(indexLineId === -1) {
                    this.selectedLineId.push(lineId);
                } else {
                    this.selectedLineId.splice(indexLineId, 1);
                }

                if(this.selectedLineId.length > 0) {
                    this.hasSelectionError = false;
                }
            },
            async onUpdateCart() {
                if(this.loading) return;

                this.hasSelectionError = false;

                if(!this.selectedLineId.length > 0) {
                    this.hasSelectionError = true;
                    return;
                }
                const payload = this.selectedLineId.map((lineId) => {
                    const selectedProduct = this.duplicateProducts.find((product) => product.LineId === lineId);
                    return {
                        lineId: lineId,
                        lineType: selectedProduct.LineType,
                        position: selectedProduct.Position,
                        quantity: selectedProduct.Quantity - 1,
                        sku: selectedProduct.Sku
                    };
                });
                await this.updateQuantity(payload);
                if(!this.hasMultipleCartErrors) {
                    this.hide();
                    this.selectedLineId = [];
                }
            },
            show() {
                this.$modal.show();
            }
        }
    };
</script>

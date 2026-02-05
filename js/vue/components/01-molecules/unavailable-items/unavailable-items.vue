<template>
    <div ref="unavailable-items" class="m-unavailableItems">
        <!-- Scroll -->
        <perfect-scrollbar>
            <div
                v-for="(product, index) in parsedItems"
                :key="index"
                class="m-unavailableItems__item"
                :class="{'-last': (index + 1) === parsedItems.length}">
                <!-- Image -->
                <div class="m-unavailableItems__picture">
                    <img
                        v-if="product.Details && product.Details.Image && product.Details.Image.Url"
                        class="m-unavailableItems__img"
                        :src="product.Details.Image.Url"
                        :alt="product.Details.Image.Alt" />
                </div>

                <!-- Title, Sku, Size and Validation Error -->
                <div class="m-unavailableItems__description">
                    <!-- Title -->
                    <h3 class="m-unavailableItems__name">{{ product.Details.Title }}</h3>

                    <!-- Sku and Size -->
                    <span class="m-unavailableItems__skuSize">
                        {{ product.Details.Sku }} | {{ sizeLabel }}: {{ product.Details.Size }}
                    </span>

                    <!-- Validation Error -->
                    <div v-if="product.Validation">
                        <span
                            v-for="(validation, x) in product.Validation"
                            :key="x"
                            class="m-unavailableItems__error"
                            :class="{'not-italic' : isCn}"
                            v-html="getValidationError(validation)">
                        </span>
                    </div>

                    <!-- Edit Pack CTA / Edit Quantity CTA -->
                    <o-shelf-configurator
                        v-if="showEdit(product)"
                        :is-edit="true"
                        :sku="product.Details.Sku"
                        :family-id="product.Details.FamilyID"
                        :button-label="product.editAriaLabel"
                        :pre-selected-configurations="product.Details.Configurations"
                        class="a-button justify-center rounded-full font-medium text-tiny py-5 px-20">
                        {{ product.editLabel }}
                    </o-shelf-configurator>
                </div>
            </div>
        </perfect-scrollbar>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';

    export default {
        name: 'MUnavailableItems',
        mixins: [ labels ],
        props: {
            items: {
                type: Array,
                default() {
                    return [];
                }
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            maxHeight: {
                type: Number,
                default: 310
            },
            allowEditPack: {
                type: Boolean,
                default: false
            },
            allowEditQuantity: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                editQuantityCode: [
                    'ItemExceedsTheRestrictionLimitForRestrictionGroup',
                    'QuantityLimitExceeded'
                ],
                removedItems: []
            };
        },
        computed: {
            parsedItems() {
                let items = [];
                let product = null;

                if(this.items && this.items.length) {
                    this.items.map(item => {
                        if(!this.removedItems.includes(item.Details?.Sku)) {
                            product = {};
                            product.editLabel = null;

                            // Product details
                            if(!item.Details) {
                                product.Details = item;
                            } else {
                                product.Details = item.Details;
                            }

                            // Product validation
                            if(!item.Validation) {
                                product.Validation = [];
                            } else {
                                product.Validation = item.Validation;
                            }

                            items.push(product);
                        }
                    });
                }

                return items;
            },
            sizeLabel() {
                return this.getLabels(this.localization, 'Labels.Size', null) || this.getLabels(this.localization, 'Size', 'Size');
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        mounted() {
            this.updateScroll();
        },
        methods: {
            getValidationError(validation) {
                return validation.Snippets?.Inline?.RteContent || validation.ValidationCode;
            },
            showEdit(product) {
                console.log('showEdit: ', product);
                if(this.allowEditPack && product.Details?.Configurations?.length) {
                    product.editLabel = this.localization?.Labels?.EditPack || 'Edit';
                    product.editAriaLabel = this.localization?.Labels?.EditPackAriaLabel?.replace('{0}', product?.Details?.Title);
                    return true;
                }

                if(this.allowEditQuantity &&
                    product.Validation.some(msg => msg.ValidationCode && this.editQuantityCode.includes(msg.ValidationCode))) {
                    product.editLabel = this.localization?.Labels?.EditQuantity || 'Edit';
                    product.editAriaLabel = this.localization?.Labels?.EditQuantityAriaLabel?.replace('{0}', product?.Details?.Title);
                    return true;
                }

                return false;
            },
            updateScroll() {
                const scrollInterval = setInterval(() => {
                    if(this.$refs['unavailable-items']) {
                        const scroll = this.$refs['unavailable-items'].querySelector('.ps');
                        if(scroll) {
                            clearInterval(scrollInterval);

                            scroll.style.maxHeight = this.maxHeight + 'px';

                            // To fix $refs bug
                            setTimeout(() => {
                                if(scroll.offsetHeight >= this.maxHeight) {
                                    scroll.classList.add('ps--active-y');
                                    scroll.scrollTo(0, 1);
                                }
                            }, 100);
                        }
                    }
                }, 100);
            },
            removeItem(sku) {
                this.removedItems.push(sku);
            }
        }
    };
</script>

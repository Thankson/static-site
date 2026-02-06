<template>
    <div class="m-cBOrder__card">
        <div class="m-cBOrder__qty">
            <label class="m-cBOrder__qty -label">
                {{ qtyLabel }}.
            </label>

            <input
                :id="inputId"
                ref="quantity"
                type="text" name=""
                class="m-cBOrder__qty -value"
                :value="qty"
                @blur="updateCart" />
        </div>

        <img
            :src="cardImg.url"
            class="m-cBOrder__img"
            :alt="cardImg.alt" />

        <div class="m-cBOrder__prodDetails" :class="{ '-isCn': isCn }">
            <div class="m-cBOrder__wrapper">
                <h3
                    class="m-cBOrder__title"
                    v-html="product.Title" />

                <div
                    v-show="selectionOptions.length > 0"
                    class="m-cBOrder__pack">

                    <ul
                        class="m-cBOrder__detailList"
                        :class="{ '-allVisible': readMore }">

                        <li
                            v-for="(option, i) in selectionOptions"
                            :key="i"
                            class="m-cBOrder__detailItem">

                            {{ option.Title ? `${option.Title}: ` : '' }}{{ option.Value }}
                        </li>
                    </ul>

                    <button
                        v-if="selectionOptions && selectionOptions.length > 6"
                        type="button"
                        class="m-cBOrder__readMore"
                        :aria-label="readMore ? readLessAriaLabel : readMoreAriaLabel"
                        :aria-expanded="String(readMore)"
                        @click="readMore = !readMore">

                        {{ readMore ? readLessLabel : readMoreLabel }}
                    </button>

                    <o-shelf-configurator
                        v-if="isEditable"
                        class="m-cBOrder__edit"
                        :sku="prodData.Sku"
                        :family-id="prodData.FamilyId"
                        :pre-selected-configurations="configurations"
                        :quantity="qty"
                        :is-edit="true"
                        cart="backuporder"
                        :line-id="prodData.LineItemId">

                        {{ editLabel }}
                    </o-shelf-configurator>
                </div>
            </div>

            <div class="m-cBOrder__pricing font-bold">
                <span v-if="!hidePoints && userFlags.ViewPoints">
                    <span>
                        {{ prodData.Points }} <span class="sr-only">{{ pointsLabel }}</span> <span aria-hidden="true">{{ ptsLabel }}</span>
                    </span>
                    <span class="p-5">|</span>
                </span>
                <span>{{ prodData.FormattedPrice }}</span>
                <span
                    v-if="prodData.HasSurcharge"
                    class="m-cBOrder__asterisk">

                    *
                </span>
            </div>
        </div>

        <button
            ref="exit"
            :aria-label="removeProductAria"
            class="m-cBOrder__close"
            @click="deleteItem">

            <span aria-hidden="true" class="a-icon material-icons -inherit">close</span>
        </button>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import safeId from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'CustBackupOrderCard',
        mixins: [ safeId ],
        safeIds: [
            'inputId'
        ],
        props: {
            index: {
                type: Number,
                default: 0
            },
            editLabel: {
                type: String,
                default: 'Edit'
            },
            product: {
                type: Object,
                default() {
                    return {
                        LineItemId: '969d4493-8bad-4440-9de8-a8ae3132143b',
                        LineItemOrder: 1,
                        Title: 'Renew&reg; with PURE&trade; Lavender',
                        Image: {
                            Url: 'http://placehold.it/50x50',
                            Alt: ''
                        },
                        Points: 10,
                        Price: 9.99,
                        FormattedPrice: '$9.99',
                        Sku: '400',
                        Quantity: 5,
                        HasSurcharge: false,
                        Configuration: [
                            {
                                SelectedSku: '4201',
                                FeatureSku: 'F524',
                                Title: 'Hand Dishwashing Liquid: Apple'
                            },
                            {
                                SelectedSku: '4201',
                                FeatureSku: 'F524',
                                Title: 'Hand Dishwashing Lemon'
                            }
                        ]
                    };
                }
            },
            pointsLabel: {
                type: String,
                default: 'points'
            },
            ptsLabel: {
                type: String,
                default: 'pts'
            },
            qtyLabel: {
                type: String,
                default: 'qty'
            },
            readMoreAriaLabel: {
                type: String,
                default: 'Read More'
            },
            readMoreLabel: {
                type: String,
                default: 'Read More'
            },
            removeProductAriaLabel: {
                type: String,
                default: 'Remove {0} product'
            },
            readLessAriaLabel: {
                type: String,
                default: 'Read Less'
            },
            readLessLabel: {
                type: String,
                default: 'Read Less'
            },
            sizeLabel: {
                type: String,
                default: 'Size'
            },
            isCn: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                readMore: false,
                qty: null,
                prodData: [],
                inputId: ''
            };
        },
        computed: {
            ...mapState('userFlags', ['userFlags']),
            cardImg() {
                return {
                    url: this.product.Image?.Url !== undefined ? this.product.Image.Url : 'https://placehold.it/50x50',
                    alt: this.product.Image?.Alt !== undefined ? this.product.Image.Alt : 'null'
                };
            },
            configurations() {
                return this.prodData.Configurations || [];
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            // check if line item is editable pack/kit
            isEditable() {
                // using for loop so we can exit early without having to iterate the whole array
                for (let i = 0; i < this.configurations.length; i++) {
                    const configuration = this.configurations[i];
                    if(configuration.SelectedSku) {
                        return true;
                    }
                }

                return false;
            },
            removeProductAria() {
                return this.removeProductAriaLabel.replace('{0}', this.prodData.Title);
            },

            selectionOptions() {
                return this.prodData.SelectionOptions || [];
            }

        },
        mounted() {
            this.prodData = Object.assign({}, this.product);
        },
        updated() {
            this.prodData = this.product;
            this.qty = this.prodData.Quantity;
            console.log('Updated Cust Card: ', this.qty);
        },
        methods: {
            deleteItem() {
                this.$emit('delete-item', this.prodData, this.index);
            },
            updateCart() {
                const qty = parseInt(this.$refs.quantity.value);
                const index = this.index;
                const noChange = this.prodData.Quantity === qty;

                if(noChange) {
                    return;
                }

                if(qty === 0) {
                    this.deleteItem();
                } else {
                    this.$emit('update-quantity', { qty, index });
                }
            }
        }
    };
</script>

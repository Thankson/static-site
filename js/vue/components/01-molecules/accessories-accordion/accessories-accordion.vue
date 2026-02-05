<template>
    <div class="m-accessoriesAcc">
        <div class="w-full md:flex">
            <div v-if="$slots['content-left']" class="flex-1">
                <slot name="content-left" />
            </div>

            <button
                v-if="quantity > 0"
                class="m-accessoriesAcc__button"
                :class="$slots['content-left'] ? 'to-md:mt-30': ''"
                type="button"
                name="button"
                :aria-label="`${accessoriesLabel} (${quantity})`"
                :aria-expanded="String(toggleAccordion)"
                :aria-controls="collapseId"
                @click="toggleAccordion = !toggleAccordion">

                <span
                    v-if="toggleAccordion"
                    class="m-accessoriesAcc__icon -opened"
                    aria-hidden="true">

                    &#8722;
                </span>

                <span
                    v-else
                    class="m-accessoriesAcc__icon -closed"
                    aria-hidden="true">

                    &#43;
                </span>

                <span class="m-accessoriesAcc__textWrapper">
                    <span class="m-accessoriesAcc__text -button">{{ accessoriesLabel }}</span>

                    ({{ quantity }})
                </span>
            </button>
        </div>

        <div
            v-if="quantity > 0"
            v-show="toggleAccordion"
            :id="collapseId"
            class="m-accessoriesAcc__content"
            :aria-hidden="String(!toggleAccordion)">

            <ul>
                <li
                    v-for="(item, index) in accordionItems"
                    :key="index"
                    class="m-accessoriesAcc__item">

                    <div
                        v-if="item.Image"
                        class="m-accessoriesAcc__media">

                        <img
                            class="m-accessoriesAcc__image"
                            :src="item.Image.Url"
                            aria-hidden="true"
                            :alt="item.Image.Alt" />
                    </div>

                    <div class="m-accessoriesAcc__text -content">
                        <a
                            class="m-accessoriesAcc__link"
                            :href="item.Url"
                            v-html="item.Name" />
                    </div>

                    <p class="m-accessoriesAcc__info">
                        <span
                            v-if="getPrice(item.PriceRange)"
                            class="m-accessoriesAcc__price">

                            {{ getPrice(item.PriceRange) }}
                        </span>

                        <span
                            v-if="item.PriceRange && item.PriceRange.MinPoints && showPoints"
                            class="m-accessoriesAcc__points">

                            {{ item.PriceRange.MinPoints }} {{ pts }}
                        </span>

                        <span v-if="isAuthenticated || isGuestShoppingEnabled">
                            <o-shelf-configurator
                                :sku="item.Sku"
                                :button-label="item.ButtonLabel"
                                class="a-actionIcon">
                                <span class="a-actionIcon__materialIcons">
                                    <span aria-hidden="true" class="a-icon material-icons -inherit">add</span>
                                    <span aria-hidden="true" class="a-icon material-icons -inherit">shopping_cart</span>
                                    <span class="sr-only">{{ item.ButtonLab }}</span>
                                </span>
                            </o-shelf-configurator>
                        </span>
                    </p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import safeIdMixin from '@common/source/js/vue/mixins/safe-id';

    export default {
        name: 'MAccessoriesAccordion',
        mixins: [ safeIdMixin ],
        safeIds: [
            'collapseId'
        ],
        props: {
            accessoriesLabel: {
                type: String,
                default: 'Accessories'
            },
            accordionItems: {
                type: Array,
                default: () => []
            },
            pts: {
                type: String,
                default: 'pts'
            },
            viewMemberPricing: {
                type: Boolean,
                default: false
            },
            isAuthenticated: {
                type: Boolean,
                default: false
            },
            isGuestShoppingEnabled: {
                type: Boolean,
                default: false
            },
            // Governed by UnAuthenticateCustomerHidePrices flag being set per market
            shouldHidePrices: {
                type: Boolean,
                default: false
            },
            showPoints: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                toggleAccordion: true,
                collapseId: ''
            };
        },
        computed: {
            quantity() {
                return this.accordionItems.length;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        methods: {
            getPrice({ MinPreferredPrice: preferredPrice, MinRegularPrice: regularPrice }) {
                if(this.shouldHidePrices || (!preferredPrice && !regularPrice)) {
                    return null;
                }
                return this.viewMemberPricing ? preferredPrice : regularPrice;
            }
        }

    };
</script>

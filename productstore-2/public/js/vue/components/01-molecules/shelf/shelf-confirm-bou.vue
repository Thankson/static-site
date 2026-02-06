<template>
    <div class="m-shelfConfirm -buo" :class="{'-isCn' : isCn}">
        <h2 id="global-shelf-heading" class="m-shelfConfirm__heading -hasIcon">
            <span aria-hidden="true" class="a-icon o-shelfCart__icon material-icons -md">check</span>
            <span role="text">{{ getLocalizationProp('Labels.OrderConfirm.BUOAddedToOrder', 'Added to Order') }}</span>
        </h2>

        <div class="m-shelfConfirm__summary">
            <div v-if="details.Image" class="m-shelfConfirm__imgWrapper">
                <img class="m-shelfConfirm__img" :alt="details.Image.Alt" :src="details.Image.Url" />
            </div>

            <div class="m-shelfConfirm__details">
                <a
                    id="cartProductName"
                    :href="details.PdpUrl"
                    class="m-shelfConfirm__product"
                    v-html="details.Title">
                </a>

                <ul class="m-shelfConfirm__list" aria-labelledby="cartProductName">
                    <li class="m-shelfConfirm__title">{{ getLocalizationProp('Labels.OrderConfirm.Price', 'Item Price') }}</li>
                    <li class="m-shelfConfirm__desc">{{ isPreferred ? priceRange.MinPreferredPrice : priceRange.MinRegularPrice }}</li>
                    <li v-if="viewPoints" class="m-shelfConfirm__title" v-html="getLocalizationProp('Labels.OrderConfirm.Points', 'Points')"></li>
                    <li v-if="viewPoints" class="m-shelfConfirm__desc">{{ priceRange.MinPoints }}</li>
                    <li class="m-shelfConfirm__title">{{ getLocalizationProp('Labels.OrderConfirm.Qty', 'Qty') }}</li>
                    <li class="m-shelfConfirm__desc">
                        {{ details.Quantity }}
                    </li>
                </ul>
            </div>
        </div>

        <ul class="m-shelfConfirm__subtotal" :class="{ '-center': userFlags.ViewPointsHighlight }">
            <li class="m-shelfConfirm__title -subtotal">{{ getLocalizationProp('Labels.OrderConfirm.BUOSubtotal', 'Order Subtotal') }}</li>
            <li class="m-shelfConfirm__total -price">
                {{ summary.FormattedOrderTotal }}
            </li>
            <li v-if="viewPoints" class="m-shelfConfirm__title -subtotal">{{ getLocalizationProp('Labels.OrderConfirm.BUOOrderPoints', 'Points') }}</li>
            <li v-if="viewPoints" class="m-shelfConfirm__total -points">
                {{ summary.OrderPoints }} <span v-html="getLocalizationProp('Labels.OrderConfirm.Points')"></span>
            </li>
        </ul>

        <div class="m-shelfConfirm__actions mb-30 -mx-5">
            <button v-shelf-hide class="a-button -center flex-1 mx-5">
                {{ getLocalizationProp('Labels.OrderConfirm.CTA') }}
            </button>
        </div>

        <m-shelf-accessories
            v-if="details.Accessories && details.Accessories.length > 0"
            :accessories="details.Accessories"
            :labels="getLocalizationProp('Labels.OrderConfirm', {})" />
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { get as getProperty } from 'lodash';

    export default {
        name: 'MShelfConfirmBou',
        mixins: [ localizationMixin ],
        props: {
            scriptId: {
                type: String,
                default: 'data-shelf-configurator-localization'
            }
        },
        data() {
            return {
                isConfirmed: false
            };
        },
        computed: {
            ...mapState('addToCart', ['cartData']),
            ...mapGetters('addToCart', ['isPreferred']),

            details() {
                return getProperty(this.cartData, 'Item.Details', {});
            },
            priceRange() {
                return this.details.PriceRange || {};
            },
            summary() {
                return this.cartData.Summary || {};
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            userFlags() {
                return this.cartData.UserFlags || {};
            },
            viewPoints() {
                return !this.$env?.HidePoints && this.userFlags?.ViewPoints && this.isPreferred;
            }
        },
        mounted() {
            this.$shelf.$once.hidden(() => this.cleanup());
        },
        methods: {
            ...mapActions('customBackupOrder', ['updateCartSelection']),
            ...mapMutations('addToCart', ['RESET_CONFIRMATION']),

            cleanup() {
                this.RESET_CONFIRMATION();
                this.updateCartSelection(this.cartData);
            }
        }
    };
</script>

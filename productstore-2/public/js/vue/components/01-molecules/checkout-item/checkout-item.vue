<template>
    <div class="m-checkoutItem">
        <div class="m-checkoutItem__col -img">
            <div class="aspectRatioBox -aspect-1-1">
                <img
                    v-if="item.Image"
                    :src="item.Image.Url"
                    :alt="item.Image.Alt || item.Title"
                    class="m-checkoutItem__img aspectRatioBox__content" />
            </div>
        </div>

        <div class="m-checkoutItem__col -product">
            <span
                v-if="asterisk"
                class="m-checkoutItem__text -product"
                v-html="asterisk">
            </span><span
                role="text"
                class="m-checkoutItem__text -product"
                v-html="item.Title" />

            <div class="m-checkoutItem__wrapper">
                <ul
                    v-if="selectionOptions.length > 0"
                    class="m-checkoutItem__list"
                    :class="{ '-allVisible': readMore }">

                    <li
                        v-for="option in selectionOptions"
                        :key="option.SelectedSku"
                        class="m-checkoutItem__listItem">

                        {{ option.Title ? `${option.Title}: ` : '' }}{{ option.Value }}
                    </li>
                </ul>
                <div
                    v-if="item.LineType === 'CrossBorderSurcharge' && item.SizeLabel"
                    class="m-checkoutItem__listItem">
                    {{ sizeLabel }}: {{ item.SizeLabel }}
                </div>
                <button
                    v-if="selectionOptions && selectionOptions.length > 6"
                    type="button"
                    class="m-checkoutItem__readMore"
                    @click="readMore = !readMore">

                    {{ readMore ? readLessLabel : readMoreLabel }}
                </button>
            </div>

            <!-- For Riverbend Receipt, if there is In Next Order Message, show it -->
            <div v-if="item.InoItemMessage && (isReceipt && isRiverbend)" class="m-checkoutItem__data -nextOrder" v-html="item.InoItemMessage">
            </div>

            <span
                v-if="attentionItem"
                class="m-checkoutItem__attentionItem"
                v-html="attentionItem" />
        </div>

        <div class="m-checkoutItem__col -amount">
            <div class="m-checkoutItem__data -price">
                <span v-if="isFree">
                    {{ freeLabel }}
                </span>
                <template v-else>
                    <span v-if="!isReturn && (isLsd(item) || isCC(item) || isWelcomeGift(item))" class="text-red text-base font-bold line-through block">{{ item.FormattedPrice ? addDollarSign(item.FormattedPrice) : addDollarSign(item.Price) }}</span>
                    <span>{{ adjustedPrice(item) }}</span>
                </template>
                <!--Price/Unit-EU specific -->
                <PricePerUnit
                    v-if="getPricePerUnit(item.PriceRange, 'Concentrated', userFlags.ViewMemberPricing)"
                    :label="concentratedLabel"
                    :price="getPricePerUnit(item.PriceRange, 'Concentrated', userFlags.ViewMemberPricing)"
                    :unit="item.PriceRange.ConcentratedPPUMeasurementType"
                    :tailwind-mods="`text-xs text-gray leading-tight font-normal mt-5`"
                />
                <PricePerUnit
                    v-if="getPricePerUnit(item.PriceRange, 'Diluted', userFlags.ViewMemberPricing)"
                    :label="dilutedLabel"
                    :price="getPricePerUnit(item.PriceRange, 'Diluted', userFlags.ViewMemberPricing)"
                    :unit="item.PriceRange.DilutedPPUMeasurementType"
                    :tailwind-mods="`text-xs text-gray leading-tight font-normal`"
                />
                <PricePerUnit
                    v-if="getPricePerUnit(item.PriceRange, 'Original', userFlags.ViewMemberPricing)"
                    :price="getPricePerUnit(item.PriceRange, 'Original', userFlags.ViewMemberPricing)"
                    :unit="item.PriceRange.OriginalPPUMeasurementType"
                    :tailwind-mods="`text-xs text-gray font-normal mt-5`"
                />
            </div>

            <div
                v-if="!isSystem(item) && !hidePoints && !hideOrderHistoryProductPoints"
                class="m-checkoutItem__data -points">
                {{ points }} {{ pointsLabel }}
            </div>

            <div v-if="!isSystem(item)" class="m-checkoutItem__data -qty">
                {{ quantityLabel }} {{ item.Quantity }}
            </div>

            <div v-if="isCn && isLsdUsed" class="m-checkoutItem__data -lsd">
                {{ lsdUsedLabel }}
            </div>

            <!-- item.AdditionalLabel indicates whether the product was purchased as some type of promotional item (i.e. coupon, promo) -->
            <div v-if="!isCn && item.AdditionalLabel && !(isReceipt && item.GiftType === 'WelcomeGift')" class="m-checkoutItem__data -promoType" v-html="item.AdditionalLabel">
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { getPricePerUnit } from '../../../utils/get-price-per-unit';
    import PricePerUnit from '../../00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MCheckoutItem',
        components: {
            PricePerUnit
        },
        props: {
            /**
             * @type {{
                Image: { Url: string, Alt: string },
                Title: string,
                Type: string,
                Price: string,
                FormattedPrice: string,
                Points: string,
                Quantity: number,
                LineId: string
            }}
             */
            asterisk: {
                type: String,
                default: null
            },
            concentratedLabel: {
                type: String,
                default: ''
            },
            dilutedLabel: {
                type: String,
                default: ''
            },
            freeLabel: {
                type: String,
                default: 'FREE'
            },
            hideOrderHistoryProductPoints: {
                default: false,
                type: Boolean
            },
            isFree: {
                type: Boolean,
                default: false
            },
            isReceipt: {
                type: Boolean,
                default: false
            },
            isRiverbend: {
                type: Boolean,
                default: false
            },
            item: {
                type: Object,
                required: true
            },
            pointsLabel: {
                type: String,
                default: 'Points'
            },
            quantityLabel: {
                type: String,
                default: 'Qty'
            },
            isReturn: {
                type: Boolean,
                default: false
            },
            sizeLabel: {
                type: String,
                default: 'Size'
            },
            readMoreLabel: {
                type: String,
                default: 'Read More'
            },
            readLessLabel: {
                type: String,
                default: 'Read Less'
            },
            isCn: {
                type: Boolean,
                default: false
            },
            lsdUsedLabel: {
                type: String,
                default: ''
            },
            userFlags: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                readMore: false
            };
        },
        computed: {
            ...mapGetters('attentionItems', ['lineItemMessages']),

            attentionItem() {
                return this.lineItemMessages[this.lineId];
            },
            getPrice() {
                if(this.isReceipt) {
                    return this.item.LineType === 'LSD' && !this.isCn ? this.item?.LsdAdjustedPrice : this.item?.FormattedPrice;
                } else {
                    return this.item?.Price;
                }
            },
            lineId() {
                return this.item.LineId || null;
            },
            points() {
                let points = this.item.Points;

                if(this.item.LineType === 'LSD' || this.item.LineType === 'Certificate') {
                    points = '0';
                }

                return points;
            },
            // getting configuration items
            selectionOptions() {
                return this.item.SelectionOptions || [];
            },
            hidePoints() {
                return this.userFlags?.IsGuest || !this.userFlags?.ViewPoints || this.$env?.HidePoints || false;
            },
            isLsdUsed() {
                return Number(this.item?.LsdDollarsUsed?.replaceAll(/[^0-9.-]/g, '')) > 0;
            },
            currencyCode() {
                return this.$env?.CurrencyCode || 'USD';
            },
            cultureCode() {
                const culture = window.dataLayer ? window.dataLayer.find(element => element.uiCulture)?.uiCulture : 'en-US';

                return culture;
            }
        },
        methods: {
            adjustedPrice(item) {
                if(item.Price < 0) {
                    return this.item.FormattedPrice;
                }
                if(this.isLsd(item)) return this.addDollarSign(item?.LsdAdjustedPrice);
                else if(this.isCC(item)) return this.addDollarSign(item?.ConvenienceCertificateAdjustedPrice);
                else if(this.isWelcomeGift(item) && item?.WelcomeProgramLsdAdjustedPrice === 0) return this.freeLabel;
                else if(this.isWelcomeGift(item)) return item?.FormattedWelcomeProgramLsdAdjustedPrice;
                else return this.getPrice;
            },
            getPricePerUnit,
            isLsd(item) {
                return item?.LineType === 'LSD';
            },
            isCC(item) {
                return item?.LineType === 'Certificate';
            },
            isWelcomeGift(item) {
                return item?.LineType === 'WelcomeProgram';
            },
            isSystem(item) { // example: Advantage Tax in EU market
                return item.LineType === 'System';
            },
            addDollarSign(val) {
                const currencySymbol = val.replace(/[\d., ]/g, '');

                if(currencySymbol && val.includes(currencySymbol)) return val;

                return Number(val).toLocaleString(this.cultureCode, {style: 'currency', currency: this.currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2});
            }
        }
    };
</script>

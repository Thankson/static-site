<template>
    <article class="m-prodCard" :class="cardVersion" :data-productid="skuComp">
        <component
            :is="hasPdpLink ? 'a' : 'div'"
            :href="hasPdpLink ? product.InnerData.Data.PdpLink : false"
            class="m-prodCard__row -content"
            v-on="hasPdpLink ? { click: () => { gtmClickPush() } } : null">

            <div class="m-prodCard__header">
                <!-- Product image -->
                <div
                    v-if="product.InnerData.Data.Image && product.InnerData.Data.Image.Src"
                    class="m-prodCard__media">

                    <img
                        class="m-prodCard__hero"
                        :src="product.InnerData.Data.Image.Src"
                        :alt="product.InnerData.Data.Image.Alt ? product.InnerData.Data.Image.Alt : ''" />
                </div>

                <!-- Product Title -->
                <div class="m-prodCard__heading">
                    <em class="m-prodCard__title" :class="isCn ? '-isCn' : ''">{{ product.InnerData.Data.Title }}<span v-if="isCn" class="m-prodCard__icon -tooltip material-icons" aria-label="tooltip for more saving info" @click.stop.prevent="openModal('bogocardsId_'+product.InnerData.Data.ItemId)">info</span></em>
                </div>
            </div>

            <div class="m-prodCard__body">
                <div class="m-prodCard__content -top">
                    <!-- Save phrase -->
                    <div class="m-prodCard__save">
                        <icon-tag v-if="rawPreferredMemberSavings" />
                        <span v-if="rawPreferredMemberSavings" class="m-prodCard__text -saveAmount">{{ saveLabel }} {{ product.InnerData.Data.PriceRange.PreferredMemberSavings }}</span>
                        <span class="m-prodCard__text -saveInfo">{{ afterReachComp(minProdPoints, product.InnerData.Data.MaxQuantity) }}</span>
                    </div>
                </div>

                <!-- Prices and Points -->
                <div class="m-prodCard__content -bottom">
                    <div class="m-prodCard__pricing">

                        <!-- Member Price and Label-->
                        <span class="m-prodCard__row -price -first">
                            <span class="m-prodCard__text -price -mdBold">
                                <template v-if="isCn">
                                    {{ product.CouponPrice > 0 ? product.FormattedCouponPrice : product.InnerData.Data.PriceRange.MaxPreferredPrice }}
                                </template>
                                <template v-else>
                                    {{ product.InnerData.Data.PriceRange.MaxPreferredPrice }}
                                </template>
                            </span>

                            <span class="m-prodCard__text -price">
                                {{ memberLabel }}
                            </span>
                        </span>

                        <!-- Non-Member Price and Label-->
                        <span class="m-prodCard__row -price -second">
                            <span class="m-prodCard__text -price">
                                {{ product.InnerData.Data.PriceRange.MinRegularPrice }}
                            </span>

                            <span class="m-prodCard__text -price">
                                {{ nonMemberLabel }}
                            </span>
                        </span>

                    </div>

                    <!-- Points -->
                    <div v-if="!hidePoints" class="m-prodCard__points">
                        <span class="m-prodCard__text -points" :class="{ '-highlight': userFlags.ViewPointsHighlight }">
                            {{ product.InnerData.Data.PriceRange.MaxPoints }} {{ points }}
                        </span>
                    </div>

                </div>
            </div>
        </component>

        <!-- CTA -->
        <div class="m-prodCard__row -actions" :class="{'-isCn': isCn}">
            <div class="m-prodCard__button -shelfToggle">
                <o-shelf-configurator
                    v-if="(!isCn || product.InnerData.Data.QtyAvailable > 0) && (!isSavingPack || isSavingPack && eligibleForSavingPacks)"
                    class="a-button justify-center w-full"
                    :family-id="familyIdComp"
                    :promotion-id="promotionIdComp"
                    line-type="Promotion"
                    :gtm-id="415"
                    :product-name="product.InnerData.Data.Title"
                    :sku="skuComp"
                    :is-bogo="true"
                    :product="product"
                    :button-label="buttonAriaLabel">

                    <span aria-hidden="true" class="flex justify-center items-center text-white md:hidden">
                        <span class="font-global-sans inline-block text-3xl leading-none mr-4">+</span>
                        <span class="material-icons inline-block">shopping_cart</span>
                    </span>
                    <span aria-hidden="true" class="hidden md:block">{{ selectLabel }}</span>

                </o-shelf-configurator>

                <template v-if="(isCn && product.InnerData.Data.QtyAvailable === 0) && (!isSavingPack || isSavingPack && eligibleForSavingPacks)">
                    <a aria-hidden="true" class="flex justify-center items-center text-white py-8 px-10 bg-gray-50 md:hidden" href="javascript:;">
                        <span class="font-global-sans inline-block text-3xl leading-none mr-4">+</span>
                        <span class="material-icons inline-block">shopping_cart</span>
                    </a>
                    <a class="a-button justify-center text-center w-full mx-auto bg-gray-50 px-40  hidden md:block" href="javascript:;">{{ selectLabel }}</a>
                </template>

                <div
                    v-if="isSavingPack && !eligibleForSavingPacks"
                    class="m-prodCard__disabled">
                    {{ pastEligibleDateMessage }}
                </div>
            </div>
        </div>
        <modal :id="'bogocardsId_'+product.InnerData.Data.ItemId">
            <template v-slot:heading>
                <p v-if="isCn" class="text-2xl mx-30 md:text-4xl-2 md:mx-0">
                    {{ product.InnerData.Data.Title }}
                </p>
                <template v-else>
                    {{ product.InnerData.Data.Title }}
                </template>
            </template>

            <template v-slot:body>
                <div class="px-30 md:px-0 text-gray-120">
                    <p :class="{'pt-10':isCn}">{{ skuLabel }}:{{ product.InnerData.Data.Sku }}</p>
                    <p :class="{'pb-20':isCn}" v-html="product.InnerData.Data.Description"></p>
                    <img
                        class="m-prodCard__hero"
                        :class="{'w-auto mx-0': isCn}"
                        :src="product.InnerData.Data.Image.Src"
                        :alt="product.InnerData.Data.Image.Alt ? product.InnerData.Data.Image.Alt : product.InnerData.Data.Title" />
                </div>
            </template>

            <template v-slot:footer>
                <button class="a-button px-15" :class="{'mx-30 py-16 px-50 mb-30 md:mb-0 md:mx-0':isCn}" @click="closeModal('bogocardsId_'+product.InnerData.Data.ItemId)">{{ continueLabel }}</button>
            </template>
        </modal>
    </article>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'MBogoProductCard',
        props: {
            afterReachLabel: {
                type: String,
                default: ''
            },
            cardVersion: {
                type: String,
                default: '-bogo'
            },
            continueLabel: {
                type: String,
                default: 'Continue'
            },
            isOffSale: {
                type: Boolean,
                default: false
            },
            isSoldOut: {
                type: Boolean,
                default: false
            },
            isSoldOutLabel: {
                type: String,
                default: 'Sold Out'
            },
            limit: {
                type: Number,
                default: null
            },
            limitLabel: {
                type: String,
                default: 'limit'
            },
            memberLabel: {
                type: String,
                default: 'Member'
            },
            minProdPoints: {
                type: Number,
                default: 35
            },
            nonMemberLabel: {
                type: String,
                default: 'Non-Member'
            },
            pastEligibleDateMessage: {
                type: String,
                default: null
            },
            isSavingPack: {
                type: Boolean,
                default: false
            },
            eligibleForSavingPacks: {
                type: Boolean,
                default: false
            },
            pointLabel: {
                type: String,
                default: 'point'
            },
            pointsLabel: {
                type: String,
                default: 'points'
            },
            pointsLabelSingular: {
                type: String,
                default: 'point'
            },
            position: {
                type: Number,
                default: null
            },
            product: {
                type: Object,
                default: () => ({
                    Labels: Object,
                    Data: {
                        ItemId: String,
                        Image: {
                            Src: String,
                            Alt: String
                        },
                        Title: String,
                        PriceRange: {
                            MinRegularPrice: String,
                            MaxRegularPrice: String,
                            ShowRangeForRegularPrice: Boolean,
                            MinPreferredPrice: String,
                            MaxPreferredPrice: String,
                            ShowRangeForPreferredPrice: Boolean,
                            MinPoints: String,
                            MaxPoints: String,
                            ShowRangeForPoints: Boolean,
                            PreferredMemberSavings: String,
                            PackSavings: String,
                            HasPackSavings: Boolean
                        },
                        Stamp: String,
                        ShowPreferredSavings: Boolean,
                        PdpLink: String,
                        Sku: String
                    },
                    Id: String
                })
            },
            productLabel: {
                type: String,
                default: 'Product'
            },
            rangeSrText: {
                type: String,
                default: 'to'
            },
            saveLabel: {
                type: String,
                default: 'Save'
            },
            selectLabel: {
                type: String,
                default: 'Select'
            },
            skuLabel: {
                type: String,
                default: 'sku'
            },
            showPoints: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            ...mapState('userFlags', ['userFlags']),
            buttonAriaLabel() {
                return this.selectLabel + ' ' + this.product?.InnerData?.Data?.Title;
            },
            familyIdComp() {
                return this.product?.InnerData?.Data?.FamilyId;
            },
            hasPdpLink() {
                return this.product?.InnerData?.Data?.PdpLink;
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            isCn() {
                // CN behavior is this modal is just a normal popup and does not lead to a video
                return this.$env?.IsCn || false;
            },
            points() {
                return this.product?.InnerData?.Data?.PriceRange?.RawMaxPoints > 1 ? this.pointsLabel : this.pointLabel;
            },
            promotionIdComp() {
                return this.product?.InnerData?.Data?.PromotionId;
            },
            rawPreferredMemberSavings() {
                return this.product?.InnerData?.Data?.PriceRange?.RawPreferredMemberSavings;
            },
            skuComp() {
                return this.product?.InnerData?.Data?.Sku;
            }
        },
        methods: {
            afterReachComp(minProdPoints, maxQtity) {
                return this.afterReachLabel.replace('{0}', minProdPoints).replace('{1}', maxQtity);
            },
            closeModal: function(id) {
                this.$modal.hide({id: id});
            },
            gtmClickPush() {
                const card = this.product.InnerData.Data;
                const cardLink = card?.PdpLink || '';
                const cardPrice = card?.PriceRange?.RawMaxPreferredPrice;
                const data = {
                    'id': card?.Sku || '', // Product ID or SKU (string) - REQUIRED
                    'name': card?.Title || '', // Product name (string) - REQUIRED
                    'price': cardPrice || '', // Product price (string)
                    'brand': card?.Brand || '', // Product brand (string)
                    'category': card?.Category || '', // Product category (string)
                    'variant': card?.Variant || '', // Product variant (string)
                    'position': this.position || '' // Product position (number)
                };

                console.log('Click push bogo card Data', data, cardLink);

                window.dataLayer && window.dataLayer.push({
                    'event': 'productClick',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '', // Local currency
                        'click': {
                            'actionField': {'list': this.$gtmList}, // Product list (string)
                            'products': [data]
                        }
                    },
                    'eventCallback': function() {
                        document.location = cardLink; // Product's Page URL (string)
                    }
                });
            },
            openModal: function(id) {
                this.$modal.show({id: id});
            }
        }
    };
</script>

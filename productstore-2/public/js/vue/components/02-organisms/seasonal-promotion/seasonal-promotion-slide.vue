<template>
    <article
        v-if="slide && userFlags.IsAuthenticated"
        class="o-seasonalSlide"
        :class="slideMods"
        :aria-label="slide.Title"
    >
        <!-- Title and Subtitle -->
        <header class="o-seasonalSlide__header">
            <h1 class="o-seasonalSlide__title" v-html="slide.Title"></h1>
            <p class="o-seasonalSlide__description" v-html="slide.SubTitle"></p>
            <p class="o-seasonalSlide__tip" v-html="maxQuantityTip()"></p>
        </header>

        <!-- Desktop image -->
        <img
            v-if="slide.DesktopBackgroundImage && slide.DesktopBackgroundImage.Url"
            :class="`o-seasonalSlide__image -desktop`"
            :style="`object-position: ${backgroundPositionDesktop}`"
            :src="slide.DesktopBackgroundImage.Url"
            :aria-label="slide.DesktopBackgroundImage.Alt"
        />

        <!-- Mobile image -->
        <img
            v-if="slide.MobileBackgroundImage && slide.MobileBackgroundImage.Url"
            :class="`o-seasonalSlide__image -mobile`"
            :style="`object-position: ${backgroundPositionMobile}`"
            :src="slide.MobileBackgroundImage.Url"
            :aria-label="slide.MobileBackgroundImage.Alt"
        />
        <!-- If the slide is product type -->
        <div v-if="isProduct" class="o-seasonalSlide__products">
            <div class="o-seasonalSlide__wrapper">
                <!-- Seasonal Product Card -->
                <m-seasonal-product-card
                    v-for="(card, index) in slide.Items"
                    :key="index"
                    :product="card"
                    :card-cta="getLabels(localization, 'ProductSlide.Save')"
                    :card-version="card.CardVersion"
                    :concentrated-label="getLabels(localization, 'ProductSlide.Concentrated')"
                    :diluted-label="getLabels(localization, 'ProductSlide.Diluted')"
                    :impressions-title="impressionsTitle"
                    :is-carousel="true"
                    :is-preferred="userFlags.ViewMemberPricing"
                    :is-signed-in="userFlags.IsAuthenticated"
                    :is-seasonal-promotion="true"
                    :is-sold-out-label="getLabels(localization, 'ProductSlide.SoldOut')"
                    :left-qty-tip="leftQtyTip(card.Sku)"
                    :maximum-qty-tip="replaceToken(getLabels(localization, 'ProductSlide.MaximumQtyTip'), eventsData(card.Sku)['MaxQuantity'] || 0)"
                    :max-quantity="eventsData(card.Sku)['MaxQuantity'] || 0"
                    :member-only-label="getLabels(localization, 'ProductSlide.MemberOnlyOffer')"
                    :points-label="getLabels(localization, 'ProductSlide.Points')"
                    :points-label-singular="getLabels(localization, 'ProductSlide.PointsSingular')"
                    :promotion-id="eventsData(card.Sku)['PromotionId'] || 0"
                    :qty-available="eventsData(card.Sku)['QtyAvailable'] || 0"
                    :qty-in-cart="eventsData(card.Sku)['QtyInCart'] || 0"
                    :range-sr-text="getLabels(localization, 'ProductSlide.RangeSrText')"
                    :card-position="index + 1"
                    :user-flags="userFlags"
                    :you-could-save-label="getLabels(localization, 'ProductSlide.YouCouldSaveLabel')"
                    :save-label="customLabel('ProductSlide.SaveLabel', card)"
                    :save-up-to-label="customLabel('ProductSlide.SaveUpToLabel', card)"
                    :add-list-label="getLabels(localization, 'ProductSlide.AddListArialLabel', 'Add {0} to list')"
                    :shelf-config-label="getLabels(localization, 'ProductSlide.CardCtaArialLabel', 'Add {0} to cart')"
                    tooltip-text=""
                    :is-cn="isCn"
                />
            </div>
        </div>
    </article>
</template>
<script>
    import { mapActions, mapGetters, mapState, mapMutations } from 'vuex';
    import envSoldOut from '../../../mixins/env'; // sets the domain (when necessary)
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import labels from '@common/source/js/vue/mixins/api-localization';

    export default {
        name: 'OSeasonalPromotionSlide',
        mixins: [labels, envSoldOut],
        props: {
            impressionsTitle: {
                type: String,
                default: ''
            },
            slide: {
                type: Object,
                default() {
                    return {};
                }
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            userFlags: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
            };
        },
        computed: {
            ...mapGetters('gtm', ['checkMounted', 'checkCreated']),
            ...mapGetters('seasonalEvents', ['events']),
            ...mapState('seasonalEvents', ['events']),

            backgroundPositionDesktop() {
                return this.slide?.ImageBackgroundPosition?.BackgroundPositionDesktop || null;
            },
            backgroundPositionMobile() {
                return this.slide?.ImageBackgroundPosition?.BackgroundPositionMobile || null;
            },
            isProduct() {
                return this.slide.Type && this.slide.Type.toLowerCase() === 'promotion';
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            slideMods() {
                let mods = [this.slide?.ImageBackgroundPosition?.Main] || [];

                if(this.isProduct) mods.push('-products -promotion');
                if(this.isCn) mods.push('-isCn');

                return mods;
            },
            eventsData() {
                return (sku) => {
                    sku = sku || this.slide.Items[0].Sku;
                    const listCurrent = this.getCurrentEvent(this.events, sku);
                    return listCurrent[0] || {};
                };
            },
            maxQuantityTip() {
                return (sku) => {
                    let promotion = this.eventsData(sku);
                    return !this.isCn && (promotion !== {} ? promotion['MaxQuantity'] || 0 : 0) < 2 ? replaceToken(this.getLabels(this.localization, 'ProductSlide.LeftQtyTipSingular'), promotion['MaxQuantity'] || 0) : replaceToken(this.getLabels(this.localization, 'ProductSlide.TotalQtyTip'), promotion['MaxQuantity'] || 0);
                };
            }
        },
        watch: {
            deep: true,
            immediate: true,
            eventsData(newVal, oldVal) {
                return newVal;
            }
        },
        created() {
            this.INCREMENT_CREATED(); // GTM counting created parent components
        },
        async mounted() {
            // If the slide is a product type
            if(this.isProduct) {
                this.mountImpressions();
            } else {
                // reduce count to keep the push data accurate
                this.DECREMENT_CREATED();
            }

            this.getData();
        },
        methods: {
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapMutations('gtm', ['INCREMENT_CREATED', 'DECREMENT_CREATED']),
            ...mapActions('seasonalEvents', ['getData']),
            replaceToken,
            customLabel(label, card) {
                const saveLbl = this.getLabels(this.localization, label);
                if(!saveLbl) {
                    return null;
                }
                return replaceToken(saveLbl, card.PriceRange.PreferredMemberSavings);
            },
            getCurrentEvent(list, val) {
                return list.filter(item => item.Sku.toString() === val.toString());
            },
            leftQtyTip(sku) {
                let promotion = this.eventsData(sku);

                if(!this.isCn && promotion['QtyAvailable'] < 2) {
                    return this.replaceToken(this.localization.ProductSlide.LeftQtyTipSingular, '<span class="text-red">' + (promotion['QtyAvailable'] || 0) + '</span>');
                }
                return this.replaceToken(this.localization.ProductSlide.LeftQtyTip, '<span class="text-red">' + (promotion['QtyAvailable'] || 0) + '</span>');
            },
            mountImpressions() {
                // Send GTM Card data
                const gtmProducts = this.slide?.Items || [];

                for (let [i, card] of gtmProducts.entries()) {
                    const impressionItemData = {
                        sku: card.Sku,
                        title: card.Title,
                        list: this.$gtmList,
                        position: i + 1
                    };

                    this.addCardImpressions(impressionItemData);
                }

                this.pushImpressions(); // GTM push product impressions
            }
        }
    };
</script>

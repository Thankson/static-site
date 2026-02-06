<template>
    <article
        v-if="slide"
        class="o-seasonalSlide"
        :class="slideMods"
        :aria-label="slide.Title"
    >
        <!-- Title and Subtitle -->
        <header class="o-seasonalSlide__header">
            <h1 class="o-seasonalSlide__title">{{ slide.Title }}</h1>
            <p class="o-seasonalSlide__description">{{ slide.SubTitle }}</p>
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
                    :is-sold-out-label="getLabels(localization, 'ProductSlide.SoldOut')"
                    :member-only-label="getLabels(localization, 'ProductSlide.MemberOnlyOffer')"
                    :points-label="getLabels(localization, 'ProductSlide.Points')"
                    :points-label-singular="getLabels(localization, 'ProductSlide.PointsSingular')"
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

        <!-- If the slide is generic or share type -->
        <div v-else class="o-seasonalSlide__categories">
            <article v-for="(card, index) in slide.Items" :key="index" :class="`m-prodCard ${card.CardVersion}`">
                <a :href="card.CTA.Url" class="m-prodCard__row -content" @click="gtmClickPush(card)">
                    <div class="m-prodCard__header">
                        <div v-if="card.Image" class="m-prodCard__media">
                            <img :src="card.Image.Url" :alt="card.Image.Alt" class="m-prodCard__hero loaded o-seasonalSlide__genericImg">
                        </div>
                    </div>
                </a>
                <div class="m-prodCard__row -actions">
                    <div class="m-prodCard__actions">
                        <a :href="card.CTA.Url" class="a-button -white justify-center w-full">
                            {{ card.CTA.Text }}
                        </a>
                    </div>
                </div>
            </article>
        </div>
    </article>
</template>
<script>
    import { mapActions, mapGetters, mapMutations } from 'vuex';
    import envSoldOut from '../../../mixins/env'; // sets the domain (when necessary)
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import labels from '@common/source/js/vue/mixins/api-localization';

    export default {
        name: 'OSeasonalSlide',
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
            return {};
        },
        computed: {
            ...mapGetters('gtm', ['checkMounted', 'checkCreated']),

            isProduct() {
                return this.slide.Type && this.slide.Type.toLowerCase() === 'product';
            },
            backgroundPositionDesktop() {
                return this.slide?.ImageBackgroundPosition?.BackgroundPositionDesktop || null;
            },
            backgroundPositionMobile() {
                return this.slide?.ImageBackgroundPosition?.BackgroundPositionMobile || null;
            },
            slideMods() {
                let mods = [this.slide?.ImageBackgroundPosition?.Main] || [];

                if(this.isProduct) mods.push('-products');
                if(this.isCn) mods.push('-isCn');

                return mods;
            },
            isCn() {
                return this.$env?.IsCn || false;
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
        },
        methods: {
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapMutations('gtm', ['INCREMENT_CREATED', 'DECREMENT_CREATED']),
            replaceToken,
            customLabel(label, card) {
                const saveLbl = this.getLabels(this.localization, label);
                if(!saveLbl) {
                    return null;
                }
                return replaceToken(saveLbl, card.PriceRange.PreferredMemberSavings);
            },

            gtmClickPush(card) {
                const cardLink = card?.PdpLink || '';
                const data = {
                    'id': card?.Sku || '', // Product ID or SKU (string) - REQUIRED
                    'name': card?.CTA?.Text || '', // Product name (string) - REQUIRED
                    'price': '', // Product price (string) - no price in this component
                    'brand': card?.Brand || '', // Product brand (string)
                    'category': card?.Category || '', // Product category (string)
                    'variant': card?.Variant || '', // Product variant (string)
                    'position': '' // Product position (number)
                };

                console.log('Click push seasonal card Data', data, cardLink);

                window.dataLayer && window.dataLayer.push({
                    'event': 'productClick',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode, // Local currency
                        'click': {
                            'actionField': {'list': this.impressionsTitle || this.$gtmList}, // Product list (string)
                            'products': [data]
                        }
                    },
                    'eventCallback': function() {
                        document.location = card?.CTA?.Url; // Product's Page URL (string)
                    }
                });
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

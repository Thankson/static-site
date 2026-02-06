<template>
    <article class="m-prodCard -savingsPack" :class="[data.activeCardVersion, {'-isCn' : isCn}]">
        <component
            :is="data.activeProduct.PdpLink ? 'a' : 'div'"
            :href="data.activeProduct.PdpLink ? data.activeProduct.PdpLink : false"
            class="m-prodCard__row -content">

            <div class="m-prodCard__header">
                <!-- Stamps -->
                <div v-if="data.activeProduct.Stamps" class="m-prodCard__tag">
                    <em class="a-stamp" :class="data.activeProduct.Stamps.Style">{{ data.activeProduct.Stamps.StampTitle }}</em>
                </div>

                <!-- Image -->
                <div v-if="data.activeProduct.Image && data.activeProduct.Image.Url" class="m-prodCard__media">
                    <img
                        class="m-prodCard__hero"
                        :src="data.activeProduct.Image.Url"
                        :alt="data.activeProduct.Image.Alt ? data.activeProduct.Image.Alt : ''">
                </div>

                <div class="m-prodCard__heading">
                    <!-- Title -->
                    <em class="m-prodCard__title" :class="{'pt-20': !data.activeProduct.Image || !data.activeProduct.Image.Url}">
                        {{ data.activeProduct.Title }}

                        <!-- SubTitle -->
                        <span class="m-prodCard__subtitle">{{ data.activeProduct.SubTitle }}</span>
                    </em>

                    <!-- Saving Message -->
                    <div v-if="isCn ? isAuthenticated : true" class="m-prodCard__save">
                        <icon-tag />
                        <span class="m-prodCard__text -saveInfo" v-html="saveText"></span>
                    </div>
                </div>
            </div>

            <div v-if="isCn ? isAuthenticated : true" class="m-prodCard__body">
                <!-- Prices and Points -->
                <div class="m-prodCard__content -bottom">
                    <div v-if="showMemberPrice" class="m-prodCard__pricing">
                        <!-- Special Pack Price -->
                        <span class="m-prodCard__row -price -first">
                            <span class="m-prodCard__text -price -mdBold">
                                {{ packPrice }}
                            </span>

                            <span class="m-prodCard__text -price">
                                {{ labels.activePackPriceLabel }}
                            </span>
                        </span>

                        <!-- Member Price -->
                        <span class="m-prodCard__row -price">
                            <span class="m-prodCard__text -price">
                                {{ memberPrice }} {{ labels.activePreferredPriceLabel }}
                            </span>
                        </span>
                    </div>

                    <!-- Points -->
                    <div v-if="!hidePoints" class="m-prodCard__points">
                        <span class="m-prodCard__text -points" :class="{ '-highlight': userFlags.ViewPointsHighlight }" v-html="points"></span>
                    </div>
                </div>
            </div>
        </component>

        <!-- CTAs and Non-eligible Message -->
        <div v-if="isCn ? isAuthenticated : true" class="m-prodCard__row -actions">
            <div class="m-prodCard__button -shelfToggle" :class="isCn ? 'flex-row-reverse' : 'flex-row'">
                <!-- Add To Cart (for eligible customers) -->
                <o-shelf-configurator
                    v-if="data.activeIsEligible"
                    :sku="data.activeProduct.Sku"
                    :family-id="data.activeProduct.FamilyID"
                    :gtm-id="415"
                    :product-name="data.activeProduct.Title"
                    :class="isCn ? 'a-actionIcon -xl a-button' : 'a-button justify-center w-full py-12 font-medium text-base'">
                    <span v-if="!isCn" class="flex justify-center items-center">{{ labels.activeCardCta }}</span>

                    <span v-if="isCn" aria-hidden="true" class="flex mx-auto justify-center items-center text-white"><span class="font-global-sans inline-block text-3xl leading-none mr-4">+</span> <span class="material-icons inline-block">shopping_cart</span></span>
                </o-shelf-configurator>

                <!-- Add To List (for eligible customers and China) -->
                <m-shoplists-add-item
                    v-if="data.activeIsEligible && isCn"
                    class="mr-10 h-36"
                    :is-shelf="true"
                    :product="data.activeProduct"
                >
                    <template v-slot:icon>
                        <span class="material-icons" aria-hidden="true">playlist_add</span>
                    </template>
                </m-shoplists-add-item>

                <!-- Message (for non-eligible customers) -->
                <span v-if="!data.activeIsEligible" class="m-prodCard__message">
                    {{ labels.activePastEligibleLabel }}
                </span>
            </div>
        </div>
    </article>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';

    export default {
        name: 'MSavingsPackProductCard',
        mixins: [ localizationMixin ],
        props: {
            cardCta: {
                type: String,
                default: null
            },
            cardVersion: {
                type: String,
                default: null // -horizontal -third or null
            },
            isEligible: {
                type: Boolean,
                default: null
            },
            pointsLabel: {
                type: String,
                default: null
            },
            pointsLabelSingular: {
                type: String,
                default: null
            },
            product: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            saveLabel: {
                type: String,
                default: null
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            packPriceLabel: {
                type: String,
                default: null
            },
            preferredPriceLabel: {
                type: String,
                default: null
            },
            pastEligibleLabel: {
                type: String,
                default: null
            }
        },
        computed: {
            ...mapState('userFlags', ['userFlags']),
            ...mapGetters('gtm', ['checkMounted', 'checkCreated']),

            data() {
                return {
                    activeCardVersion: this.cardVersion || this.localization?.Data?.CardVersion,
                    activeIsEligible: this.localization?.Data?.IsEligible || this.isEligible,
                    activeProduct: this.localization?.Data?.Product || this.product
                };
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            labels() {
                return {
                    activePreferredPriceLabel: this.localization?.Labels?.MemberPriceLabel || this.preferredPriceLabel,
                    activePackPriceLabel: this.localization?.Labels?.SpecialPackPriceLabel || this.packPriceLabel,
                    activePastEligibleLabel: this.localization?.Labels?.PastEligibleDate || this.pastEligibleLabel,
                    activeCardCta: this.localization?.Labels?.Select || this.cardCta
                };
            },
            memberPrice() {
                return this.isCn ? this.data.activeProduct?.PriceRange?.MinRegularPrice : this.data.activeProduct?.NewCustomerPackMemberPrice;
            },
            packPrice() {
                return this.data.activeProduct?.PriceRange?.MinPreferredPrice;
            },
            points() {
                let points = '';
                const isValid = this.data.activeProduct?.PriceRange?.MinPoints ?? false;

                if(isValid) {
                    if(this.data.activeProduct?.PriceRange?.RawMinPoints === 1) {
                        // use singular label if there is only 1 point
                        points = this.localization?.Labels?.PointsTextSingular || this.pointsLabelSingular;
                    } else {
                        // plural for all fallbacks
                        points = this.localization?.Labels?.PointsText || this.pointsLabel;
                    }

                    if(points.indexOf('{0}') > -1) {
                        points = points.replace('{0}', this.data.activeProduct?.PriceRange?.MinPoints);
                    } else {
                        points = this.data.activeProduct?.PriceRange?.MinPoints + ' ' + points;
                    }
                }

                return points;
            },
            productData() {
                return this.localization?.Data?.Product || this.Product;
            },
            saveText() {
                const label = this.localization?.Labels?.SavingMessage || this.saveLabel;
                let value = this.data.activeProduct?.PriceRange?.PackSavings;

                if(!this.isKr) {
                    let save = `<span class="text-red font-bold">${(label || 'Save {0}')}`;

                    if(save.indexOf('{0}') > -1) {
                        save = save.replace('{0}', value + '</span>');
                    } else {
                        save = save + '</span>';
                    }

                    return save;
                } else {
                    let save = `${(label || '{0}')}`;
                    save = save.replace('{0}', value);
                    return save;
                }
            },
            showMemberPrice() {
                return !this.$env.ProductPricing?.HideProductMemberPrice;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isKr() {
                return this.$env?.Country === 'Korea';
            },
            isAuthenticated() {
                return this.localization?.Data?.UserFlags?.IsAuthenticated;
            }
        },
        created() {
            this.INCREMENT_CREATED(); // GTM counting created parent components
        },
        mounted() {
            console.log(
                '%c -- PRODUCT CARD PARENT MOUNTED -- ',
                'background-color:pink; color:black; border-radius: 2px;'
            );

            // Send GTM Card data
            const impressionItemData = {
                sku: this.productData.Sku,
                title: this.productData.Title
            };

            this.addCardImpressions(impressionItemData);
            this.pushImpressions(); // GTM push product impressions
        },
        methods: {
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapMutations('gtm', ['INCREMENT_CREATED'])
        }
    };
</script>

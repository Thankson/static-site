<template>
    <div class="p-freeProducts">
        <div v-if="$slots['banner']" class="pb-12">
            <slot name="banner"></slot>
        </div>
        <div v-else class="pt-20 md:pt-36 px-10">
            <MNewWelcomeTracker
                v-if="getLocalizationProp('Data.NumberOfSteps')"
                :current-step="getLocalizationProp('Data.NumberOfSteps')"
                :number-of-steps="getLocalizationProp('Data.NumberOfSteps')"
            />
            <h1 class="p-freeProducts__title">{{ getLocalizationProp('Labels.Title') }}</h1>
            <p class="p-freeProducts__subtitle">{{ getLocalizationProp('Labels.Subtitle') }}</p>
        </div>
        <div class="p-freeProducts__listContainer">
            <OHorizontalProdcutCardList
                :labels="getLocalizationProp('Labels', {})"
                :power-reviews="getLocalizationProp('Data.PowerReviews', {})"
                :products="products"
                :validation-modal-labels="getLocalizationProp('Data.ValidationModal', {})"
                :video-modal-prompt-labels="getLocalizationProp('Data.VideoModalPrompt', {})">
            </OHorizontalProdcutCardList>
        </div>
        <slot v-if="renderToast" name="toast" />
    </div>
</template>
<script>
    import MNewWelcomeTracker from '../../01-molecules/new-welcome/new-welcome-tracker.vue';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import OHorizontalProdcutCardList from '../../02-organisms/horizontal-product-card-list/horizontal-product-card-list.vue';
    import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';

    export default {
        name: 'PFreeProducts',
        components: {
            MNewWelcomeTracker,
            OHorizontalProdcutCardList
        },
        mixins: [ localizationMixin ],
        data() {
            return {
                freeProducts: []
            };
        },
        computed: {
            ...mapGetters('userFlags', ['onUserFlagsLoaded']),
            ...mapState('welcome', ['products', 'hasWatchedVideo', 'videoBannerMounted']),
            ...mapState('userFlags', {
                userFlags: 'userFlags',
                userFlagsLoaded: 'loaded',
                userFlagsLoading: 'loading'
            }),
            renderToast() {
                return !this.videoBannerMounted || this.hasWatchedVideo;
            }
        },
        watch: {
            hasWatchedVideo() {
                // TODO: For story https://tfs.melaleuca.net:8443/tfs/MelaleucaIT/Melaleuca/_workitems/edit/168386
                //  it will need to know the value of hasWatchedVideo. This is a proof of concept that the story 168386
                //  can be done. This will need to be altered during development of the story.
                console.log('hasWatchedVideo', this.hasWatchedVideo);
            }
        },
        async mounted() {
            this.SET_PAGE_TYPE('FREE_PRODUCTS');

            await this.getProductData();
            this.pushDataLayer();
        },
        methods: {
            ...mapActions('welcome', ['getProductData']),
            ...mapActions('userFlags', ['getUserFlags']),
            ...mapMutations('addToCart', ['SET_PAGE_TYPE']),

            async pushDataLayer() {
                if(!this.userFlagsLoaded) {
                    if(this.userFlagsLoading) {
                        this.onUserFlagsLoaded(() => this.pushDataLayer());
                        return;
                    } else {
                        await this.getUserFlags('from free products');
                    }
                }

                const impressions = this.products.map((product, index) => {
                    const minPrice = this.userFlags.ViewMemberPricing ? product.PriceRange?.RawMinPreferredPrice : product.PriceRange?.RawMinRegularPrice;
                    const maxPrice = this.userFlags.ViewMemberPricing ? product.PriceRange?.RawMaxPreferredPrice : product.PriceRange?.RawMaxRegularPrice;
                    const price = minPrice !== maxPrice ? `${minPrice} - ${maxPrice}` : `${minPrice}`;
                    return {
                        'name': product.Title,
                        'id': product.FamilyID,
                        'price': price,
                        'category': product.Category,
                        'list': 'Free Product',
                        'position': ++index
                    };
                });
                window.dataLayer && window.dataLayer.push({
                    'event': 'impressions',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '',
                        impressions
                    }
                });
            }
        }
    };
</script>

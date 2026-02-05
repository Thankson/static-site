<template>
    <article class="o-savedLaterCarousel" :class="{'-hideGradient': hideGradient, '-isCn': isCn}">
        <div class="o-savedLaterCarousel__header">
            <h3 class="o-savedLaterCarousel__title">{{ labels.Title }}</h3>
        </div>

        <div
            v-if="loading"
            class="o-savedLaterCarousel__loading">

            <a-loading-spinner :visible="true" />
        </div>

        <div
            v-else-if="!loading && savedForLaterItems && savedForLaterItems.length"
            class="o-savedLaterCarousel__wrapper"
            aria-roledescription="carousel"
            :aria-label="labels.AriaLabel">

            <nav class="o-savedLaterCarousel__actions">
                <div class="o-savedLaterCarousel__dots"></div>
                <div class="o-savedLaterCarousel__arrows"></div>
            </nav>

            <p
                :id="`carousel-count-${id}`"
                class="o-savedLaterCarousel__count"
                aria-live="polite">

                {{ labels.Showing }} <span class="slick-ada-from"></span>
                {{ labels.To }} <span class="slick-ada-to"></span>
                {{ labels.OutOf }} <span class="slick-ada-length"></span>.
            </p>

            <div
                :id="`carousel-${id}`"
                class="o-savedLaterCarousel__slider">

                <div
                    v-for="(product, index) in savedForLaterItems"
                    :key="index">

                    <m-backup-product-card
                        card-version="-savedLater"
                        :labels="labels"
                        :is-preferred="isPreferred"
                        points-label="<span class='sr-only'>Earn </span>{0} Points"
                        points-label-singular="<span class='sr-only'>Earn </span>{0} Point"
                        :product="{ Data: product }">

                        <template v-slot:button>
                            <button
                                class="o-savedLaterCarousel__remove"
                                :aria-label="labels.Remove ? labels.Remove + ' ' + product.Title : null"
                                @click="removeItem(product.Sku)">

                                <img
                                    src="//cdnsc1.melaleuca.com/na/images/common/trash.png"
                                    aria-hidden="true"
                                    class="o-savedLaterCarousel__removeIcon" />
                            </button>

                            <div class="m-prodCard__button -shelfToggle">
                                <o-shelf-configurator
                                    class="a-actionIcon -xl"
                                    :sku="product.Sku"
                                    :family-id="product.FamilyId"
                                    :button-label="labels.Add ? labels.Add + ' ' + product.Title : null"
                                    @open="openShelf">

                                    <img
                                        src="https://cdnsc1.melaleuca.com/na/images/atoms/add-cart-icon.png"
                                        class="a-actionIcon__img"
                                        aria-hidden="true" />
                                </o-shelf-configurator>
                            </div>
                        </template>
                    </m-backup-product-card>
                </div>
            </div>
        </div>

        <div
            v-else
            class="o-savedLaterCarousel__empty">

            <p>{{ labels.EmptyList }}</p>
        </div>
    </article>
</template>
<script>
    import api from '@api/routes/shoppinglists';
    import { mapState, mapMutations, mapGetters, mapActions } from 'vuex';

    export default {
        name: 'OSavedLaterCarousel',
        props: {
            endpoint: {
                type: String,
                default: ''
            },
            id: {
                type: String,
                default: ''
            },
            isPreferred: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => ({})
            },
            userFlags: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                loading: false,
                selectedSku: null,
                tabIndex: 0
            };
        },
        computed: {
            ...mapState('cart', ['newSaveLater']),
            ...mapState('savedForLater', [ 'savedForLaterItems' ]),
            hideGradient() {
                return this.savedForLaterItems.length < 6;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        watch: {
            newSaveLater() {
                if(this.newSaveLater) {
                    this.getData().then(() => {
                        window.refreshSavedLaterCarousel();
                    });

                    this.SET_SAVED_LATER(false);
                }
            }
        },
        created() {
            this.INCREMENT_CREATED(); // GTM counting created parent components
        },
        mounted() {
            this.getData().then(() => {
                window.refreshSavedLaterCarousel();

                if(this.savedForLaterItems) {
                    // Run GTM Impressions
                    this.mountImpressions();
                } else {
                    // reduce count to keep the push data accurate
                    this.DECREMENT_CREATED();
                }
            });

            this.updateData();
        },
        methods: {
            ...mapGetters('cart', ['onCartRefresh']),
            ...mapMutations('cart', ['SET_SAVED_LATER']),
            ...mapMutations('gtm', ['INCREMENT_CREATED', 'DECREMENT_CREATED']),
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapActions('savedForLater', ['removeSavedForLater']),

            async getData() {
                this.loading = true;
                api.setRoute(this.endpoint);
                const response = await api.get();
                if(response.success) {
                    this.$store.commit('savedForLater/SET_SAVED_FOR_LATER', response.data?.Data);
                    this.loading = false;
                } else {
                    this.$store.commit('savedForLater/SET_SAVED_FOR_LATER', []);
                }
            },
            mountImpressions() {
                // Send GTM Card data
                const gtmProducts = this.savedForLaterItems || null;

                if(gtmProducts !== null) {
                    for (let [i, card] of gtmProducts.entries()) {
                        const price = this.userFlags?.ViewMemberPricing ? card.PriceRange.RawMinPreferredPrice : card.PriceRange.RawMinRegularPrice;
                        const impressionItemData = {
                            sku: card?.Sku,
                            title: card?.Title,
                            price: price,
                            brand: card?.Brand,
                            category: card?.Category,
                            variant: card?.Variant,
                            list: this.$gtmList,
                            position: i + 1
                        };
                        this.addCardImpressions(impressionItemData);
                    }

                    this.pushImpressions(); // GTM push product impressions
                }
            },
            openShelf(sku) {
                this.selectedSku = sku;
            },
            removeItem(sku) {
                this.removeSavedForLater(sku);
            },
            updateData() {
                this.$shelf.$on.hidden(() => {
                    this.selectedSku = null;
                });

                this.onCartRefresh(() => {
                    if(this.selectedSku) {
                        this.removeItem(this.selectedSku);
                    }
                });
            }
        }
    };
</script>

<template>
    <div v-show="!hide" :ref="dataSourceId" class="o-productCarouselVue -isCn" :class="{'-isShelf' : isShelf, '-isRecommend' : isRecommend,'-isPromotion -isRecommend' : isPromotion}">
        <!-- Start: Header -->
        <div v-if="!loading" class="o-productCarouselVue__header">
            <!-- Section Title -->
            <template v-if="!disableTitle">
                <slot v-if="$slots['title']" name="title" />
                <h3
                    v-else
                    class="o-productCarouselVue__title"
                    v-html="carouselTitle"></h3>
                <!-- End: Section Title -->
            </template>
            <!-- Start: Section Link -->
            <slot
                v-if="$slots['link']"
                name="link" />
            <p
                v-else-if="carouselLink && carouselText && !isShelf"
                class="flex items-center tracking-wider text-green-100 text-md uppercase px-5 md:px-0">
                <a
                    :href="carouselLink"
                    :title="carouselText">
                    {{ carouselText }}
                    <span aria-hidden="true" class="a-arrow -sm -right -filled ml-3">
                        <span class="a-arrow__icon border-green-100"></span>
                    </span>
                </a>
            </p>
            <!-- End: Section Link -->
        </div>
        <!-- End: Header -->

        <!-- Start: Spinner - Show spinner while API is being loaded -->
        <div v-if="loading" class="o-productCarouselVue__loading">
            <a-loading-spinner
                :visible="true"
                aria-hidden="true">
            </a-loading-spinner>
        </div>
        <!-- End: Spinner -->

        <!--  category mb only for recommend-->
        <div
            v-if="( isRecommend && !isPromotion ) && prods && prods.length"
            v-touch:swipe.left="nextCates"
            v-touch:swipe.right="preCates"
            class="o-productCarouselVue__category">
            <nav class="o-productCarouselVue__nav">
                <ul ref="cate" class="o-productCarouselVue__list" :style="`left: ${-leftOffset}px;`">
                    <li v-for="(cate, index) in getLocalizationProp('Labels.Category')" :key="index" class="o-productCarouselVue__classify" :class="isCurrentCate == index ? '-isCurrent' : ''" @click="getCurrentCate(index,cate.id)">
                        <em class="o-productCarouselVue__catename"> {{ cate.Name }} </em>
                    </li>
                </ul>
            </nav>
        </div>

        <div v-if="isRecommend || isPromotion" class="o-productCarouselVue__group">
            <ul v-touch:swipe.top="getNextPage" class="o-productCarouselVue__grid">
                <template v-for="(product, index) in prods">
                    <li v-if="index < 4 + 2 * currentPage" :key="index" class="o-productCarouselVue__cell">
                        <!-- BackUpOrder Product Card for each item -->
                        <m-backup-product-card
                            v-if="isBackupOrder"
                            :card-cta="getLocalizationProp('Labels.ProductCarousel.CardCta')"
                            :card-version="isPromotion ? '-isPromotion -carousel' : '-carousel'"
                            button-mods="-transparent font-bold text-sm"
                            :labels="getLocalizationProp('Labels.ProductCarousel')"
                            :product="{ Data: product }"
                        >
                        </m-backup-product-card>

                        <!-- Product Card for each item -->
                        <m-product-card
                            v-else
                            :become-member-rte="getLocalizationProp('Data.BecomeAMember', '')"
                            :become-member-url="getLocalizationProp('Data.BecomeAMemberLink.Url', null)"
                            :card-cta="getLocalizationProp('Labels.ProductCarousel.CardCta', 'Add')"
                            :card-version="isPromotion ? '-isPromotion -carousel' : '-carousel'"
                            :carousel-size="carouselSize"
                            :family-id="product.FamilyID"
                            :get-started-label="getLocalizationProp('Labels.ProductCarousel.GetStarted', 'Get Started')"
                            :pdp-link="product.PdpLink"
                            :is-backup-order="false"
                            :is-sold-out="isSoldOut(product)"
                            :is-sold-out-label="getLocalizationProp('Labels.ProductCarousel.SoldOutLabel', 'Sold Out')"
                            :is-off-sale="isOffSale(product)"
                            :is-carousel="isPromotion ? false : true"
                            :is-promotion-carousel="isPromotion"
                            :is-promotion="isPromotion ? isPromotion : false"
                            :is-preferred="isPreferred"
                            :is-cn="true"
                            :learn-more-label="getLocalizationProp('Labels.ProductCarousel.LearnMore', 'Learn More')"
                            :lvip-status="isPromotion ? lvipStatus : null "
                            :lvip-price-type="isPromotion ? getLocalizationProp('Labels.ProductCarousel.LvipPriceType', '') : '' "
                            :online-enrollment-url="getLocalizationProp('Data.OnlineEnrollmentLink', null)"
                            :show-prices="showPrices"
                            :show-points="showPoints"
                            :savings-label-preferred="(isPromotion && lvipStatus === null) ? getLocalizationProp('Labels.ProductCarousel.BecomeLVIPSaving', 'by becoming a lvip Member') : getLocalizationProp('Labels.ProductCarousel.PreferredMemberSaving', 'by becoming a Preferred Member')"
                            :tooltip-text="toolTipText"
                            :points-label="`{0} ${getLocalizationProp('Labels.ProductCarousel.Points', 'Points')}`"
                            :points-label-singular="`{0} ${getLocalizationProp('Labels.ProductCarousel.Point', 'Point')}`"
                            :position="index + 1"
                            :product="{ Data: product }"
                            :range-sr-text="getLocalizationProp('Labels.ProductCarousel.RangeSR', 'to')"
                            :script-id-configurator="scriptIdConfigurator"
                            :sku="product.Sku"
                            :slide-number="index"
                            :user-flags="userFlags"
                            :you-could-save-label="getLocalizationProp('Labels.ProductCarousel.YouCouldSaveLabel', 'You Could')"
                            :save-label="getLocalizationProp('Labels.ProductCarousel.SaveLabel') ? replaceToken(getLocalizationProp('Labels.ProductCarousel.SaveLabel'), product.PriceRange.PreferredMemberSavings) : null"
                            :save-up-to-label="getLocalizationProp('Labels.ProductCarousel.SaveUpToLabel') ? replaceToken(getLocalizationProp('Labels.ProductCarousel.SaveUpToLabel'), product.PriceRange.PreferredMemberSavings) : null"
                            :promotion-regular-price-label="isPromotion ? getLocalizationProp('Labels.ProductCarousel.Preferred') : ''"
                            @add-list-popup="handleAddListPopup"
                        >
                            <template v-slot:regular-price-label>
                                <span v-if="isPromotion" v-html="getLocalizationProp('Labels.ProductCarousel.Preferred')"></span>
                            </template>

                        </m-product-card>
                    </li>
                </template>
            </ul>
            <div class="o-productCarouselVue__loadmore">
                <div v-if="!isLoading" class="o-productCarouselVue__img -logoImg">
                    <img :src="getLocalizationProp('Labels.LogoImage.Url')" :alt="getLocalizationProp('Labels.LogoImage.Alt')" />
                </div>
                <img
                    v-if="isLoading"
                    class="o-productCarouselVue__img -loadImg"
                    :src="getLocalizationProp('Labels.LoadImage.Url')"
                    :alt="getLocalizationProp('Labels.LoadImage.Alt')"
                />
            </div>
        </div>

        <!-- Carousel Wrapper -->
        <div
            v-if="prods && prods.length"
            ref="wrapper"
            class="o-productCarouselVue__wrapper"
            role="region"
            :aria-label="carouselDescription"
            aria-roledescription="carousel">

            <!-- Start: VueSlickCarousel Plugin -->
            <VueSlickCarousel
                ref="carousel"
                v-bind="pluginSettings"
                @init="init"
                @afterChange="afterChange"
                @beforeChange="beforeChange">

                <!-- Start: Backup Order Cards -->
                <template
                    v-if="isBackupOrder"
                    v-slot:default>

                    <m-backup-product-card
                        v-for="(product, index) in prods" :key="index"
                        :card-version="isPromotion ? '-isPromotion -carousel' : '-carousel'"
                        :is-preferred="true"
                        :card-cta="getLocalizationProp('Labels.ProductCarousel.CardCta')"
                        button-mods="-transparent font-bold text-sm"
                        :labels="getLocalizationProp('Labels.ProductCarousel')"
                        :product="{ Data: product }">
                    </m-backup-product-card>
                </template>
                <!-- End: Backup Order Cards -->

                <!-- Start: Product Cards -->
                <template
                    v-else
                    v-slot:default>

                    <m-product-card
                        v-for="(product, index) in prods"
                        :key="index"
                        :become-member-rte="getLocalizationProp('Data.BecomeAMember', '')"
                        :become-member-url="getLocalizationProp('Data.BecomeAMemberLink.Url', null)"
                        :card-cta="getLocalizationProp('Labels.ProductCarousel.CardCta', 'Add')"
                        :card-version="isPromotion ? '-isPromotion -carousel' : '-carousel'"
                        :carousel-size="carouselSize"
                        :family-id="product.FamilyID"
                        :get-started-label="getLocalizationProp('Labels.ProductCarousel.GetStarted', 'Get Started')"
                        :pdp-link="product.PdpLink"
                        :is-backup-order="false"
                        :is-sold-out="isSoldOut(product)"
                        :is-sold-out-label="getLocalizationProp('Labels.ProductCarousel.SoldOutLabel', 'Sold Out')"
                        :is-off-sale="isOffSale(product)"
                        :is-carousel="isPromotion ? false : true"
                        :is-preferred="isPreferred"
                        :is-cn="true"
                        :is-promotion="isPromotion ? isPromotion : false"
                        :is-promotion-carousel="isPromotion"
                        :learn-more-label="getLocalizationProp('Labels.ProductCarousel.LearnMore', 'Learn More')"
                        :lvip-status="isPromotion ? lvipStatus : null "
                        :lvip-price-type="isPromotion ? getLocalizationProp('Labels.ProductCarousel.LvipPriceType', '') : ''"
                        :online-enrollment-url="getLocalizationProp('Data.OnlineEnrollmentLink', null)"
                        :show-prices="showPrices"
                        :show-points="showPoints"
                        :savings-label-preferred="(isPromotion && lvipStatus === null) ? getLocalizationProp('Labels.ProductCarousel.BecomeLVIPSaving', 'by becoming a lvip Member') : getLocalizationProp('Labels.ProductCarousel.PreferredMemberSaving', 'by becoming a Preferred Member')"
                        :tooltip-text="toolTipText"
                        :points-label="`{0} ${getLocalizationProp('Labels.ProductCarousel.Points', 'Points')}`"
                        :points-label-singular="`{0} ${getLocalizationProp('Labels.ProductCarousel.Point', 'Point')}`"
                        :position="index + 1"
                        :product="{ Data: product }"
                        :range-sr-text="getLocalizationProp('Labels.ProductCarousel.RangeSR', 'to')"
                        :script-id-configurator="scriptIdConfigurator"
                        :sku="product.Sku"
                        :slide-number="index"
                        :user-flags="userFlags"
                        :you-could-save-label="getLocalizationProp('Labels.ProductCarousel.YouCouldSaveLabel', 'You Could')"
                        :save-label="getLocalizationProp('Labels.ProductCarousel.SaveLabel') ? replaceToken(getLocalizationProp('Labels.ProductCarousel.SaveLabel'), product.PriceRange.PreferredMemberSavings) : null"
                        :save-up-to-label="getLocalizationProp('Labels.ProductCarousel.SaveUpToLabel') ? replaceToken(getLocalizationProp('Labels.ProductCarousel.SaveUpToLabel'), product.PriceRange.PreferredMemberSavings) : null"
                        :promotion-regular-price-label="isPromotion ? getLocalizationProp('Labels.ProductCarousel.Preferred') : ''"
                        @add-list-popup="handleAddListPopup">
                        <template v-slot:regular-price-label>
                            <span v-if="isPromotion" v-html="getLocalizationProp('Labels.ProductCarousel.Preferred')"></span>
                        </template>
                    </m-product-card>
                </template>
                <!-- End: Product Cards -->
            </VueSlickCarousel>
            <!-- End: VueSlickCarousel Plugin -->
        </div>

        <!-- Custom Nav pc-->
        <nav v-if="prods && prods.length" ref="nav" class="o-productCarouselVue__actions">
            <!-- Arrow buttons wrapper -->
            <div class="o-productCarouselVue__arrows">
                <!-- Prev Button -->
                <button
                    ref="prevarrow"
                    :aria-controls="carouselId"
                    :aria-label="getLocalizationProp('Labels.ProductCarousel.PreviousSlide', 'Previous slide of products')"
                    class="o-productCarouselVue__button slick-prev"
                    @click="prev('p')">
                    <span aria-hidden="true" class="slick-arrow-icon a-arrow -lg -left ml-12 mt-12 -thin">
                        <span
                            class="a-arrow__icon border-white"
                            v-html="getLocalizationProp('Labels.ProductCarousel.Previous', 'Previous')"></span>
                    </span>
                </button>

                <!-- Next Button -->
                <button
                    ref="nextarrow"
                    :aria-controls="carouselId"
                    :aria-label="getLocalizationProp('Labels.ProductCarousel.NextSlide', 'Next slide of products')"
                    class="o-productCarouselVue__button slick-next"
                    @click="next('p')">
                    <span aria-hidden="true" class="slick-arrow-icon a-arrow -lg -right ml-12 mt-12 -thin">
                        <span
                            class="a-arrow__icon border-white"
                            v-html="getLocalizationProp('Labels.ProductCarousel.Next', 'Next')"></span>
                    </span>
                </button>
            </div>
        </nav>

        <!-- Custom Nav mobile-->
        <div v-if="showCustomNavMobile && (prods.length > 4)" class="o-productCarouselVue__nav -inLineArrow">
            <!-- Left arrow -->
            <button
                ref="prevarrowMobile"
                class="o-productCarouselVue__arrow"
                :aria-controls="carouselId"
                :aria-label="getLocalizationProp('Labels.ProductCarousel.PreviousSlide', 'Previous slide of products')"
                :disabled="(actualSlide === 0 ? true : false)"
                @click="prev('m')"
            >
                <arrow
                    direction="-left"
                    size="-lg"
                    tailwind-color="gray-150"
                    other-mods="-thinner mr-10"
                ></arrow>
            </button>

            <!-- Dots -->
            <div class="o-productCarouselVue__dots">
                <button
                    v-for="(item, index) in prodsPage"
                    :key="index"
                    class="o-productCarouselVue__dot"
                    :class="{ '-isActualSlide': index === actualSlide }"
                    :data-index="index"
                    :data-page="index"
                    :data-active="(index === actualSlide) ? 'true' : 'false'"
                    @click="bindDots(index)">
                    <span
                        class="block w-5 h-6 absolute xy-centered rounded-full bg-gray-150"
                        :class="{ 'w-10 h-10': index === actualSlide }"
                    >
                    </span>
                </button>
            </div>

            <!-- Right arrow -->
            <button
                ref="nextarrowMobile"
                class="o-productCarouselVue__arrow"
                :aria-controls="carouselId"
                :aria-label="getLocalizationProp('Labels.ProductCarousel.NextSlide', 'Next slide of products')"
                :disabled="(actualSlide === (totalScroll - 1) ? true : false)"
                @click="next('m')"
            >
                <arrow
                    direction="-right"
                    size="-lg"
                    tailwind-color="gray-150"
                    other-mods="-thinner ml-10"
                ></arrow>
            </button>
        </div>
    </div>
</template>

<script>
    import apiCarousel from '@api/routes/carousel/product';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { mapActions, mapGetters, mapMutations } from 'vuex';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import eventBus from '@common/source/js/vue/mixins/event-bus';

    export default {
        name: 'OProductCarouselCn',
        mixins: [ localizationMixin, safeId],
        safeIds: [
            'carouselId'
        ],
        props: {
            disableLink: {
                type: Boolean,
                default: false
            },
            disableTitle: {
                type: Boolean,
                default: false
            },
            flags: {
                type: Object,
                default: () => ({})
            },
            // IMPORTANT: by default, all carousels use carousel API (GET /api/carousel/product), except BUO Shelf Carousel and Prod Survey Carousel
            isCarouselApi: {
                type: Boolean,
                default: true
            },
            isRecommend: {
                type: Boolean,
                default: false
            },
            isPromotion: {
                type: Boolean,
                default: false
            },
            isShelf: {
                type: Boolean,
                default: false
            },
            isBackupOrder: {
                type: Boolean,
                default: false
            },
            products: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            settings: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            // ID for product carousel labels
            scriptId: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            // ID for configurator labels
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            disablePoints: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                actualSlide: 0,
                breakpoint: null,
                buttonNext: null,
                buttonNextHide: false,
                buttonPrev: null,
                buttonPrevHide: false,
                carouselId: '',
                country: this.$env.Country ? this.$env.Country : 'UnitedStates',
                currentSettings: {},
                currentSlide: 0,
                data: {},
                innerSlider: null,
                loading: false,
                pluginSettings: { // Default settings (used if settings prop is null)
                    arrows: false,
                    dots: false,
                    infinite: false,
                    speed: 500,
                    slidesToShow: 7,
                    slidesToScroll: 7,
                    variableWidth: true,
                    responsive: [
                        {
                            breakpoint: 1150,
                            settings: {
                                infinite: false,
                                slidesToShow: 6,
                                slidesToScroll: 6,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 992,
                            settings: {
                                infinite: false,
                                slidesToShow: 5,
                                slidesToScroll: 5,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 865,
                            settings: {
                                infinite: false,
                                slidesToShow: 4,
                                slidesToScroll: 4,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 625,
                            settings: {
                                infinite: false,
                                slidesToShow: 3,
                                slidesToScroll: 3,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 576,
                            settings: {
                                infinite: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                rows: 2,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 320,
                            settings: {
                                infinite: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                rows: 2,
                                variableWidth: true
                            }
                        }
                    ]
                },
                pluginSettingsOneLine: { // OneLine settings (used if settings prop is null)
                    arrows: false,
                    dots: false,
                    infinite: false,
                    speed: 500,
                    slidesToShow: 7,
                    slidesToScroll: 7,
                    variableWidth: true,
                    responsive: [
                        {
                            breakpoint: 1150,
                            settings: {
                                infinite: false,
                                slidesToShow: 6,
                                slidesToScroll: 6,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 992,
                            settings: {
                                infinite: false,
                                slidesToShow: 5,
                                slidesToScroll: 5,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 865,
                            settings: {
                                infinite: false,
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 625,
                            settings: {
                                infinite: false,
                                slidesToShow: 2,
                                slidesToScroll: 1,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 576,
                            settings: {
                                infinite: false,
                                slidesToShow: 2,
                                slidesToScroll: 1,
                                variableWidth: true
                            }
                        },
                        {
                            breakpoint: 320,
                            settings: {
                                infinite: false,
                                slidesToShow: 1,
                                slidesToScroll: 1,
                                variableWidth: true
                            }
                        }
                    ]
                },
                prods: [],
                prodsPage: [],
                slides: [],
                showCustomNavMobile: false,
                totalSlides: 0,
                totalScroll: 0,
                viewportWidth: 0,
                currentPage: 0,
                isCurrentCate: 0,
                isLoading: false,
                lvipStatus: null,
                currCateShow: 0,
                leftOffset: 0,
                indexAddListOpen: null,
                hide: false
            };
        },
        computed: {
            ...mapGetters('gtm', ['checkMounted', 'checkCreated']),

            dataSourceId() {
                if(this.localization?.Data?.ShelfProductCarousel?.DatasourceId) return this.localization.Data.ShelfProductCarousel.DatasourceId;
                return this.localization?.Data?.DatasourceId || null;
            },
            isLvipPromotion() {
                if(this.localization?.Data?.ShelfProductCarousel?.IsLvipPromotion) return this.localization.Data.ShelfProductCarousel.IsLvipPromotion;
                return this.localization?.Data?.IsLvipPromotion || null;
            },
            numberOfProducts() {
                if(this.localization?.Data?.ShelfProductCarousel?.NumberOfProducts) return this.localization.Data.ShelfProductCarousel.NumberOfProducts;
                return this.localization?.Data?.NumberOfProducts || null;
            },
            carouselTitle() {
                if(this.data?.Title) return this.data.Title;
                if(this.localization?.Labels?.ProductCarousel?.Title) return this.localization.Labels.ProductCarousel.Title;
                return this.localization?.Labels?.ProductCarousel?.FallbackTitle || null;
            },
            carouselDescription() {
                if(this.data?.AdaDescription) return this.data.AdaDescription;
                if(this.localization.Labels?.ProductCarousel?.CarouselName) return this.localization.Labels.ProductCarousel.CarouselName;
                return this.localization?.Labels?.ProductCarousel?.FallbackCarouselName || null;
            },
            carouselLink() {
                return this.localization.Labels?.ProductCarousel?.SeeAllLink || null;
            },
            carouselText() {
                return this.localization.Labels?.ProductCarousel?.SeeAllText || null;
            },
            carouselSize() {
                let size = '-lg';

                if(this.currentSettings.slidesToShow < 4) {
                    size = '-sm';
                }

                return size;
            },
            isPreferred() {
                return this.userFlags.ViewMemberPricing;
            },
            showPrices() {
                if(this.localization?.Data?.ShelfProductCarousel) return this.localization.Data.ShelfProductCarousel.ShowPrices;
                return this.localization?.Data?.ShowPrices;
            },
            showPoints() {
                if(this.disablePoints) return false;
                if(this.localization?.Data?.ShelfProductCarousel) return this.localization.Data.ShelfProductCarousel.ShowPoints;
                return this.localization?.Data?.ShowPoints;
            },
            toolTipText() {
                return this.localization?.Labels?.ProductCarousel?.ToolTipText;
            },
            userFlags() {
                if(this.flags && Object.keys(this.flags).length > 0) return this.flags; // From prop
                if(this.data?.UserFlags) return this.data.UserFlags;
                return this.localization?.Data?.UserFlags || {};
            }
        },
        watch: {
            currentSlide() {
                this.handleDots();
            }
        },
        created() {
            this.INCREMENT_CREATED(); // GTM counting created parent components

            // Handle settings
            if(this.settings && Object.keys(this.settings).length) {
                this.pluginSettings = this.settings;
            }

            // Disable plugin arrows and dots (necessary to use arrows/dots inside a <nav>)
            this.pluginSettings.arrows = false; // Disable the default plugin arrows
            this.pluginSettings.dots = false; // Disable the default plugin dots

            // Viewport
            this.setViewport();

            // Create resize listener
            window.addEventListener('resize', this.onResize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onResize);
        },
        async mounted() {
            // Init loading
            this.loading = true;

            this.lvipStatus = this.getLocalizationProp('Labels.ProductCarousel.LvipStatus', null);

            // If there's data source id and number of products and it's NOT BUO Shelf, then get products from API
            if(this.isCarouselApi && this.dataSourceId && this.numberOfProducts && !this.isBackupOrder) {
                // Get carousel data
                this.data = await this.getData();

                // Set products
                this.prods = this.data?.Products || [];
            } else {
                // Get products from localization or from prop
                this.prods = this.products || this.localization?.Data?.Products;
            }

            // If there's no product, then hide the carousel
            if(!this.prods?.length) {
                this.hide = true;
            }

            if(this.prods?.length < 3) {
                this.pluginSettings = this.pluginSettingsOneLine;
            }

            this.mountImpressions();

            if(this.prods.length > 0) {
                const prodPage = this.prods;
                var arrPage = [];
                var each = (this.prods?.length < 4) ? 1 : 4;
                prodPage.forEach((item, index) => {
                    arrPage.push(Math.floor((index / each) + 1));
                });
                this.prodsPage = [...new Set(arrPage)];
            }
            this.totalScroll = this.prodsPage.length;

            // Set as loaded
            this.loading = false;

            // Init carousel
            this.$nextTick(async () => {
                await this.setSpec();
                await this.initInnerSlider();
                await this.initCustomNav();
                var a = this.$refs[this.dataSourceId];

                // Loaded Carousel Flag
                eventBus.$emit('loadedCarousel', {prods: this.prods, idx: a.parentElement?.parentElement?.attributes?.id?.value});
            });

            this.showCustomNavMobile = !this.isRecommend && !this.isPromotion && (window.innerWidth <= 576);
        },
        methods: {
            replaceToken,
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapMutations('gtm', ['INCREMENT_CREATED']),
            async getData() {
                let response;
                response = await apiCarousel.query({
                    isLvipPromotion: this.isLvipPromotion ? this.isLvipPromotion : false,
                    dataSourceId: this.dataSourceId,
                    numberOfCards: this.numberOfProducts
                });
                return response?.data?.Data || {};
            },
            afterChange() {
                this.handleTabOrder();
            },
            beforeChange(prevSlide, nextSlide) {
                this.currentSlide = nextSlide;
                this.currentSettings.currentSlide = nextSlide;
                this.innerSlider = this.$refs['carousel'] ? this.$refs['carousel'].$refs['innerSlider'] : null;

                if(this.innerSlider) {
                    // Check if there's next slide
                    if(!this.canGoNext()) {
                        // Set slick as ended
                        this.innerSlider.$el.classList.remove('slick-start');
                        this.innerSlider.$el.classList.add('slick-end');

                        // Disable next arrow
                        if(this.buttonNext) {
                            this.buttonNext.classList.add('slick-disabled');
                        }

                        // Enable previous arrow
                        if(nextSlide <= this.currentSettings.slidesToShow && this.buttonPrev) {
                            // If there's less items then it should show, then disable previous arrow
                            if(this.currentSettings.slideCount <= this.currentSettings.slidesToShow) {
                                this.buttonPrev.classList.add('slick-disabled');
                            } else {
                                this.buttonPrev.classList.remove('slick-disabled');
                            }
                        }
                        // If it's the first slide, then disable previous arrow and set slick as running
                        if(nextSlide === 0) {
                            // Set slick as running
                            this.innerSlider.$el.classList.remove('slick-start');

                            // Disable previous arrow
                            if(this.buttonPrev) {
                                this.buttonPrev.classList.add('slick-disabled');
                            }
                        }
                        if(this.innerSlider && this.innerSlider.$el) {
                            this.innerSlider.$el.classList.remove('slick-start');
                            this.innerSlider.$el.classList.remove('slick-end');
                        }
                    } else {
                        // Set slick as started
                        this.innerSlider.$el.classList.add('slick-start');
                        this.innerSlider.$el.classList.remove('slick-end');

                        // Enable previous arrow
                        if(this.buttonPrev) {
                            this.buttonPrev.classList.remove('slick-disabled');
                        }

                        // Enable next arrow
                        if(this.buttonNext) {
                            this.buttonNext.classList.remove('slick-disabled');
                        }

                        // If it's the first slide, then disable previous arrow and set slick as running
                        if(nextSlide === 0) {
                            // Set slick as running
                            this.innerSlider.$el.classList.remove('slick-start');

                            // Disable previous arrow
                            if(this.buttonPrev) {
                                this.buttonPrev.classList.add('slick-disabled');
                            }
                        }
                    }
                }
            },
            canFocus(item) {
                let canFocus = false;

                if(item) {
                    // If it's visible and is not the active element and tabindex is not -1
                    if(
                        item.offsetWidth > 0 && item.offsetHeight > 0 &&
                        item !== document.activeElement &&
                        parseInt(item.tabIndex) !== -1
                    ) {
                        canFocus = true;

                        // If it's a slide
                        if(item.className.indexOf('slick-slide') > -1) {
                            // Is it's not the current slide and it's a active slide
                            if(item.className.indexOf('slick-current') === -1 && item.className.indexOf('slick-active') > -1) {
                                canFocus = true;
                            } else {
                                canFocus = false;
                            }
                        }
                    }
                }

                return canFocus;
            },
            canGoNext() {
                const spec = this.currentSettings;
                let canGo = true;

                if(!spec.infinite) {
                    if(spec.centerMode && spec.currentSlide >= spec.slideCount - 1) {
                        canGo = false;
                    } else if(
                        spec.slideCount <= spec.slidesToShow ||
                        spec.currentSlide >= spec.slideCount - spec.slidesToShow
                    ) {
                        canGo = false;
                    }
                }

                return canGo;
            },
            clickOut(evt) {
                if(evt.target === this.$el) {
                    this.getNextPage();
                }
            },
            getNextPage() {
                this.isLoading = true;
                this.timer = setTimeout(() => {
                    this.currentPage++;
                    this.isLoading = false;
                }, 300);
            },
            nextCates() {
                let len = this.$refs.cate.children.length;
                if(this.currCateShow < len - 1) {
                    if(this.$refs.cate.children[this.currCateShow + 1]) {
                        this.leftOffset = this.leftOffset + this.$refs.cate.children[this.currCateShow + 1].offsetWidth + this.$refs.cate.children[this.currCateShow].offsetWidth + 20;
                        this.currCateShow = this.currCateShow + 2;
                    } else {
                        this.leftOffset = this.leftOffset + this.$refs.cate.children[this.currCateShow].offsetWidth + 10;
                        this.currCateShow = this.currCateShow + 1;
                    }
                }
            },
            preCates() {
                if(this.currCateShow > 0) {
                    if(this.$refs.cate.children[this.currCateShow - 2]) {
                        this.leftOffset = this.leftOffset - this.$refs.cate.children[this.currCateShow - 2].offsetWidth - this.$refs.cate.children[this.currCateShow - 1].offsetWidth - 20;
                        this.currCateShow = this.currCateShow - 2;
                    } else {
                        this.leftOffset = this.leftOffset - this.$refs.cate.children[this.currCateShow - 1].offsetWidth - 10;
                        this.currCateShow = this.currCateShow - 1;
                    }
                }
            },
            getIndexActive() {
                const focussableElements = this.$refs['wrapper'].querySelectorAll('a, button, .slick-slide');
                let indexActive = null;

                // Get the index of the active element
                Array.prototype.map.call(focussableElements, (item, index) => {
                    if(item === document.activeElement) {
                        indexActive = index;
                    }
                });

                return indexActive;
            },
            async getCurrentCate(curId, cateId) {
                this.isCurrentCate = curId;
                this.currentPage = 0;
                /* this.initialProds = this.products;
                if(this.cateId != null) {
                    try {
                        const skuParams = new URLSearchParams();
                        skuParams.append('categories', cateId);
                        await soldOutApi.query(skuParams).then((response) => {
                            if(response.success) {
                                if(response.data && response.data.length > 0 && Array.isArray(response.data)) {
                                    this.prods = response.data?.Data?.Products;
                                } else {
                                    this.prods = this.initialProds;
                                }
                            } else {
                                this.prods = this.initialProds;
                            }
                        }).catch(error => {
                            console.log(error);
                            this.prods = this.initialProds;
                        });
                    } catch (e) {
                        console.log(e);
                        this.prods = this.initialProds;
                    }
                } */
            },
            goTo(event, page) {
                if(this.$refs['carousel']) {
                    if(event && event.target) {
                        const dot = event.target;

                        if(['button', 'a'].includes(dot.nodeName.toLowerCase()) && dot.dataset.index) {
                            this.$refs['carousel'].goTo(dot.dataset.index);
                        }
                    } else {
                        if(page !== null && page !== undefined) {
                            this.$refs['carousel'].goTo(page);
                        }
                    }
                }
            },
            handleADA() {
                // Organize tab order
                this.handleTabOrder();

                const slickList = this.$refs['wrapper'].querySelector('.slick-list');
                if(slickList) {
                    slickList.setAttribute('aria-live', 'polite');
                }

                // Get all focusable elements inside the carousel wrapper
                const focussableElements = this.$refs['wrapper'].querySelectorAll('a, button, .slick-slide');
                if(focussableElements) {
                    focussableElements.forEach(element => {
                        // Add keydown listener to each focusable element inside the carousel wrapper
                        element.addEventListener('keydown', (event) => {
                            const keyCode = event.keyCode ? event.keyCode : event.which;

                            // Tab key
                            if(keyCode === 9) {
                                // If press shift key then it's backward
                                const isForward = !event.shiftKey;
                                let item = null;
                                let indexActive = this.getIndexActive();
                                let minus = 1;

                                if(this.buttonPrev.classList.contains('slick-disabled')) {
                                    minus = minus + 2;
                                }

                                if(this.buttonNext.classList.contains('slick-disabled')) {
                                    minus = minus + 2;
                                }

                                // If it's forward
                                if(indexActive !== null && indexActive < focussableElements.length - minus && isForward) {
                                    // Stop default focus
                                    event.preventDefault();
                                    event.stopPropagation();

                                    // Find next element to focus
                                    for (let i = indexActive; i < focussableElements.length; i++) {
                                        item = focussableElements[i];

                                        if(this.canFocus(item)) {
                                            item.focus();
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                    });
                }
            },
            handleClass(str) {
                var arr = this.carouselBlockClass.split('__');
                return arr[0] + '__' + str;
            },
            handleDots() {
                if(this.$refs['slickdots']) {
                    const dots = this.$refs['slickdots'].querySelectorAll('[data-index]');
                    if(dots) {
                        dots.forEach(dot => {
                            dot.parentElement.classList.remove('slick-active');
                        });

                        const active = this.$refs['slickdots'].querySelector('[data-index="' + this.currentSlide + '"]');
                        if(active) {
                            active.parentElement.classList.add('slick-active');
                        }
                    }
                }
            },
            handleTabOrder() {
                const slides = this.$refs['wrapper'] ? this.$refs['wrapper'].querySelectorAll('.slick-slide') : null;
                if(slides) {
                    let tabindex = null;
                    let arialLabel = null;
                    let slideNumber = 1;
                    const totalPages = Math.ceil(this.totalSlides / this.currentSettings.slidesToScroll);

                    slides.forEach((slide, index) => {
                        if(slide.className.indexOf('slick-active') === -1) {
                            // Remove from tab order
                            tabindex = -1;
                        } else {
                            // Add in tab order
                            tabindex = 0;
                        }

                        arialLabel = `${this.getLocalizationProp('Labels.ProductCarousel.Slide', 'Slide')} ${slideNumber} ` +
                            `${this.getLocalizationProp('Labels.ProductCarousel.Of', 'of')} ${totalPages}, ` +
                            `${this.getLocalizationProp('Labels.ProductCarousel.Item', 'Item')} ${index + 1} ` +
                            `${this.getLocalizationProp('Labels.ProductCarousel.Of', 'of')} ${this.totalSlides}`;

                        if((index + 1) % this.currentSettings.slidesToScroll === 0) {
                            slideNumber++;
                        }

                        // this attribute needs a semantic role not description #21268
                        slide.setAttribute('aria-roledescription', 'slide');
                        slide.setAttribute('aria-label', arialLabel);

                        // Remove tab index from the main div
                        slide.removeAttribute('tabindex');

                        // Remove tab index from all the children, except links and buttons
                        const children = slide.querySelectorAll('div, ul, li, section, article');
                        children.forEach(child => {
                            // Remove tab index
                            child.removeAttribute('tabindex');
                        });

                        // Add or remove links/buttons from tab order
                        const focusable = slide.querySelectorAll('a, button');
                        focusable.forEach(child => {
                            // Set tab index
                            child.setAttribute('tabindex', tabindex);
                        });
                    });
                }
            },
            init() {
                this.totalSlides = this.prods.length;
            },
            initCustomNav() {
                if(this.$refs['nav']) {
                    this.buttonPrev = this.$refs['prevarrow'];
                    this.buttonNext = this.$refs['nextarrow'];

                    if(this.buttonPrev && this.buttonNext) {
                        this.beforeChange(this.currentSlide, this.currentSlide);
                    }
                }
            },
            initInnerSlider() {
                if(this.$refs['carousel']) {
                    this.innerSlider = this.$refs['carousel'].$refs['innerSlider'];
                    this.innerSlider.$el.setAttribute('id', this.carouselId);
                    this.handleADA();
                    this.handleDots();
                }
            },
            mountImpressions() {
                // Send GTM Card data
                const gtmProducts = this.prods;

                if(gtmProducts !== null) {
                    for (let [i, card] of gtmProducts.entries()) {
                        const pricing = this.userFlags.ViewMemberPricing ? card.PriceRange.RawMinPreferredPrice : card.PriceRange.RawMinRegularPrice;
                        const impressionItemData = {
                            list: this.$gtmList,
                            position: i + 1,
                            price: pricing,
                            sku: card.Sku,
                            title: card.Title
                        };

                        this.addCardImpressions(impressionItemData);
                    }

                    this.pushImpressions(); // GTM push product impressions
                }
            },
            focusCurrentSlide() {
                const current = this.$refs['wrapper']?.querySelector('.slick-current');
                if(current) {
                    const focusable = current.querySelectorAll('a, button:not(.m-tooltip__toggle)');

                    if(focusable && focusable[0]) {
                        focusable[0].focus();
                    }
                }
            },
            next(t) {
                if(t === 'm') {
                    this.actualSlide++;
                    if(this.actualSlide <= (this.totalScroll - 1)) {
                        this.$refs['carousel'].next();
                    } else if(this.actualSlide >= this.totalScroll) {
                        this.actualSlide = (this.totalScroll - 1);
                    }
                } else {
                    this.$refs['carousel'].next();
                }

                if(this.buttonPrev && this.buttonNext) {
                    // Necessary to prevent plugin to focus on body after click in next button
                    setTimeout(() => {
                        this.focusCurrentSlide();
                    }, 100);
                }
            },

            bindDots(page) {
                this.actualSlide = page;
                if(this.prods.length < 4) {
                    this.$refs['carousel'].goTo(page * 1);
                } else {
                    this.$refs['carousel'].goTo(page * 2);
                }
            },

            onResize() {
                this.setViewport();
                this.setSpec();
                this.initCustomNav();
                this.handleTabOrder();
                this.showCustomNavMobile = !this.isRecommend && !this.isPromotion && (window.innerWidth <= 576);
            },
            prev(t) {
                if(t === 'm') {
                    this.actualSlide--;
                    if(this.actualSlide >= 0) {
                        this.$refs['carousel'].prev();
                    } else if(this.actualSlide <= 0) {
                        this.actualSlide = 0;
                    }
                } else {
                    this.$refs['carousel'].prev();
                }

                if(this.buttonPrev && this.buttonNext) {
                    // Necessary to prevent plugin to focus on body after click in prev button
                    setTimeout(() => {
                        this.focusCurrentSlide();
                    }, 100);
                }
            },
            setSpec() {
                let spec = this.pluginSettings;

                // If there is some responsive settings
                if(this.pluginSettings.responsive) {
                    let newSpec = null;
                    let minWidth = null;
                    let maxWidth = null;

                    // Create an array with the breakpoints
                    const breakpoints = this.pluginSettings.responsive.map(breakpt => breakpt.breakpoint);
                    const totalBreakpts = breakpoints.length;

                    // Sort the breakpoints in numerical order
                    breakpoints.sort((x, y) => x - y);

                    // Loop through all the breakpoints to find the correct one
                    breakpoints.forEach((breakpt, index) => {
                        // Define the min and max-width for each breakpoint
                        minWidth = index === 0 ? 0 : breakpoints[index - 1] + 1;
                        maxWidth = breakpt;

                        if(totalBreakpts - 1 === index) {
                            maxWidth--;
                        }

                        // Verify media query according to the viewport
                        if(this.viewportWidth >= minWidth && this.viewportWidth <= maxWidth) {
                            // Get the new settings according to the breakpoint
                            newSpec = this.pluginSettings.responsive.find(setting => setting.breakpoint === breakpt);
                            spec = newSpec.settings || this.pluginSettings;
                            this.breakpoint = spec;

                            // Set current slide to the first one
                            this.currentSlide = 0;
                            this.goTo(null, 0);

                            if(this.innerSlider && this.innerSlider.$el) {
                                this.innerSlider.$el.classList.remove('slick-start');
                                this.innerSlider.$el.classList.remove('slick-end');
                            }
                        }
                    });
                }

                spec.currentSlide = this.currentSlide;
                spec.slideCount = this.totalSlides;

                this.currentSettings = spec;
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            },
            isOffSale(product) {
                return product.IsOffSale;
            },
            isSoldOut(product) {
                return product.quantityAvailable <= 0 && product.isInventoryControlled;
            },
            isElementColliding(el1, el2) {
                const rect1 = el1.getBoundingClientRect();
                const rect2 = el2.getBoundingClientRect();

                return !(
                    rect1.top > rect2.bottom ||
                    rect1.right < rect2.left ||
                    rect1.bottom < rect2.top ||
                    rect1.left > rect2.right
                );
            },
            resetButtonsLayer() {
                this.buttonPrevHide = false;
                this.buttonNextHide = false;
                this.buttonPrev.classList.remove('slick-cta-hidden');
                this.buttonNext.classList.remove('slick-cta-hidden');
            },
            // Necessary to fix Prev/Next CTA z-index when Add to List is open/closed
            handleAddListPopup(payload) {
                this.$nextTick(() => {
                    try {
                        if(payload.isLoaded) {
                            const currentSlide = payload.index;
                            const slide = this.innerSlider.$el.querySelectorAll('.slick-slide')[currentSlide];
                            let popup = null;
                            if(slide) {
                                popup = slide.querySelector('.m-popUp');
                                if(payload.isOpen) {
                                    this.indexAddListOpen = currentSlide;

                                    // Check if Prev CTA is colliding with Add To List popup
                                    if(this.isElementColliding(this.buttonPrev, popup)) {
                                        this.buttonPrevHide = true;
                                        this.buttonNextHide = false;
                                        this.buttonPrev.classList.add('slick-cta-hidden');
                                        this.buttonNext.classList.remove('slick-cta-hidden');

                                    // Check if Next CTA is colliding with Add To List popup
                                    } else if(this.isElementColliding(this.buttonNext, popup)) {
                                        this.buttonNextHide = true;
                                        this.buttonPrevHide = false;
                                        this.buttonNext.classList.add('slick-cta-hidden');
                                        this.buttonPrev.classList.remove('slick-cta-hidden');

                                    // If nothing is colliding, then reset Prev/Next CTA z-index
                                    } else {
                                        this.resetButtonsLayer();
                                    }
                                } else {
                                    if(this.indexAddListOpen === currentSlide) {
                                        this.resetButtonsLayer();
                                    }
                                }
                            }
                        } else {
                            this.resetButtonsLayer();
                        }
                    } catch (e) {
                        console.log('[ProductCarousel] HandleAddListPopup');
                        console.log(e);
                    }
                });
            }
        }
    };
</script>

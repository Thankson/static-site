<template>
    <div v-if="!hide" class="o-productCarouselVue" :class="{'-isShelf' : isShelf }" data-testid="container-productCarousel">
        <!-- Start: Header -->
        <div v-if="!loading" class="o-productCarouselVue__header">
            <!-- Start: Section Title -->
            <slot
                v-if="$slots['title'] && !disableTitle"
                name="title" />

            <h3
                v-else-if="!$slots['title'] && !disableTitle"
                class="o-productCarouselVue__title"
                v-html="carouselTitle"></h3>
            <!-- End: Section Title -->

            <!-- Start: Section Link -->
            <slot
                v-if="$slots['link'] && !disableLink"
                name="link" />
            <p
                v-else-if="carouselLink && carouselText && !isShelf && !$slots['link'] && !disableLink"
                class="flex items-center tracking-wider text-green-100 text-md uppercase px-5 md:px-0">
                <a
                    :href="carouselLink"
                    :aria-label="carouselAriaText">
                    {{ carouselText }}
                    <span aria-hidden="true" class="a-arrow -sm -right -filled ml-3">
                        <span class="a-arrow__icon border-green-100"></span>
                    </span>
                </a>
            </p>
            <!-- End: Section Link -->
        </div>
        <!-- End: Header -->

        <!-- Start: Carousel Wrapper -->
        <div
            v-if="prods && prods.length"
            ref="wrapper"
            role="region"
            class="o-productCarouselVue__wrapper"
            :class="{'-hideGradient': hideGradient}"
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
                        card-version="-carousel"
                        :card-cta="getLocalizationProp('Labels.ProductCarousel.CardCta', 'Add')"
                        :regular="getLocalizationProp('Labels.Configurator.Regular', 'Regular')"
                        :is-preferred="true"
                        button-mods="-transparent font-bold text-sm"
                        :labels="getLocalizationProp('Labels.ProductCarousel')"
                        :product="{ Data: product }" />
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
                        :concentrated-label="getLocalizationProp('Labels.Concentrated')"
                        :can-upgrade-account="getLocalizationProp('Data.CanUpgradeAccount')"
                        :card-cta="getLocalizationProp('Labels.ProductCarousel.CardCta', 'Add')"
                        card-version="-carousel"
                        :carousel-size="carouselSize"
                        :diluted-label="getLocalizationProp('Labels.Diluted')"
                        :family-id="product.FamilyID"
                        :family-off-sale-message="getLocalizationProp('Labels.ProductCarousel.FamilyOffSaleMessage', 'Temporarily Unavailable')"
                        :get-started-label="getLocalizationProp('Labels.ProductCarousel.GetStarted', 'Get Started')"
                        :pdp-link="product.PdpLink || product.PdpUrl"
                        :impressions-title="impressionsTitle"
                        :is-backup-order="false"
                        :is-carousel="true"
                        :is-erp-date-valid="product.IsErpDateValid"
                        :is-inventory-controlled="product.IsInventoryControlled"
                        :is-off-sale="product.IsOffSale"
                        :is-sold-out-label="getLocalizationProp('Labels.ProductCarousel.SoldOutLabel', 'Sold Out')"
                        :is-preferred="isPreferred"
                        :is-restricted-pack="product.IsRestrictedPack"
                        :learn-more-label="getLocalizationProp('Labels.ProductCarousel.LearnMore')"
                        :member-only-label="getLocalizationProp('Labels.ProductCarousel.MemberOnlyOffer', '')"
                        :off-sale-message="product.OffSaleMessage"
                        :off-sale-title="product.OffSaleTitle"
                        :online-enrollment-url="getLocalizationProp('Data.OnlineEnrollmentLink', null)"
                        :quantity-available="product.quantityAvailable"
                        :show-prices="showPrices"
                        :show-points="showPoints"
                        :tooltip-text="tooltipText"
                        :points-label="`{0} ${getLocalizationProp('Labels.ProductCarousel.Points', 'Points')}`"
                        :points-label-singular="`{0} ${getLocalizationProp('Labels.ProductCarousel.Point', 'Point')}`"
                        :position="index + 1"
                        :product="{ Data: product }"
                        :range-sr-text="getLocalizationProp('Labels.ProductCarousel.RangeSR', 'to')"
                        :script-id-configurator="scriptIdConfigurator"
                        :shelf-config-label="getLocalizationProp('Labels.ProductCarousel.CardCtaArialLabel', 'Add {0} to cart')"
                        :sku="product.Sku"
                        :slide-number="index"
                        :user-flags="userFlags"
                        :you-could-save-label="getLocalizationProp('Labels.ProductCarousel.YouCouldSaveLabel', 'You Could')"
                        :save-label="getLocalizationProp('Labels.ProductCarousel.SaveLabel') ? replaceToken(getLocalizationProp('Labels.ProductCarousel.SaveLabel'), product.PriceRange.PreferredMemberSavings) : null"
                        :save-up-to-label="getLocalizationProp('Labels.ProductCarousel.SaveUpToLabel') ? replaceToken(getLocalizationProp('Labels.ProductCarousel.SaveUpToLabel'), product.PriceRange.PreferredMemberSavings) : null"
                        @add-list-popup="handleAddListPopup" />
                </template>
                <!-- End: Product Cards -->
            </VueSlickCarousel>
            <!-- End: VueSlickCarousel Plugin -->

            <!-- Start: Custom Nav -->
            <nav ref="nav" class="o-productCarouselVue__actions" :class="{'z-auto': buttonPrevHide || buttonNextHide }">
                <!-- Arrow buttons wrapper -->
                <div class="o-productCarouselVue__arrows">
                    <!-- Prev Button -->
                    <button
                        ref="prevarrow"
                        :aria-controls="carouselId"
                        :aria-label="getLocalizationProp('Labels.ProductCarousel.PreviousSlide', 'Previous slide of products')"
                        class="o-productCarouselVue__button slick-prev"
                        data-testid="button-productCarouselPrev"
                        @click="prev()">
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
                        data-testid="button-productCarouselNext"
                        @click="next()">

                        <span aria-hidden="true" class="slick-arrow-icon a-arrow -lg -right ml-12 mt-12 -thin">
                            <span
                                class="a-arrow__icon border-white"
                                v-html="getLocalizationProp('Labels.ProductCarousel.Next', 'Next')"></span>
                        </span>
                    </button>
                </div>
            </nav>
            <!-- End: Custom Nav -->
        </div>
        <!-- End: Carousel Wrapper -->
    </div>
</template>

<script>
    import apiCarousel from '@api/routes/carousel/product';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import preComponentLoaderMixin from '@common/source/js/vue/mixins/pre-component-loader';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import replaceToken from '@common/source/js/vue/utils/replace-token';
    import { mapActions, mapGetters, mapMutations } from 'vuex';

    export default {
        name: 'OProductCarousel',
        mixins: [ localizationMixin, safeId, preComponentLoaderMixin ],
        safeIds: [
            'carouselId'
        ],
        props: {
            // IMPORTANT: by default, all carousels use carousel API (GET /api/carousel/product), except BUO Shelf Carousel and Prod Survey Carousel
            isCarouselApi: {
                type: Boolean,
                default: true
            },
            isShelf: {
                type: Boolean,
                default: false
            },
            isBackupOrder: {
                type: Boolean,
                default: false
            },
            flags: {
                type: Object,
                default: function() {
                    return {};
                }
            },
            disableTitle: {
                type: Boolean,
                default: false
            },
            disableLink: {
                type: Boolean,
                default: false
            },
            carouselAdaDescription: {
                type: String,
                default: null
            },
            products: {
                type: [ Array, Object ],
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
            }
        },
        data() {
            return {
                breakpoint: null,
                buttonNext: null,
                buttonNextHide: false,
                buttonPrev: null,
                buttonPrevHide: false,
                carouselId: '',
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
                            breakpoint: 475,
                            settings: {
                                infinite: false,
                                slidesToShow: 2,
                                slidesToScroll: 2,
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
                slides: [],
                totalSlides: 0,
                viewportWidth: 0,
                indexAddListOpen: null,
                hide: false
            };
        },
        computed: {
            ...mapGetters('gtm', ['checkMounted', 'checkCreated']),
            ...mapGetters('productCarousel', ['getHistoryIndex']),

            dataSourceId() {
                if(this.localization?.Data?.ShelfProductCarousel?.DatasourceId) return this.localization.Data.ShelfProductCarousel.DatasourceId;
                return this.localization?.Data?.DatasourceId || null;
            },
            hideGradient() {
                return this.prods.length <= 7;
            },
            numberOfProducts() {
                if(this.localization?.Data?.ShelfProductCarousel?.NumberOfProducts) return this.localization.Data.ShelfProductCarousel.NumberOfProducts;
                return this.localization?.Data?.NumberOfProducts || null;
            },
            carouselAriaText() {
                return this.localization.Labels?.ProductCarousel?.SeeAllAriaText || this.localization.Labels?.ProductCarousel?.SeeAllText || null;
            },
            carouselTitle() {
                if(this.data?.Title) return this.data.Title; // From Carousel API
                if(this.localization?.Labels?.ProductCarousel?.Title) return this.localization.Labels.ProductCarousel.Title; // From Localization
                return this.localization?.Labels?.ProductCarousel?.FallbackTitle || null; // From Localization
            },
            carouselDescription() {
                if(this.carouselAdaDescription) return this.carouselAdaDescription; // From prop
                if(this.data?.AdaDescription) return this.data.AdaDescription; // From Carousel API
                if(this.localization.Labels?.ProductCarousel?.CarouselName) return this.localization.Labels.ProductCarousel.CarouselName; // Labels
                return this.localization?.Labels?.ProductCarousel?.FallbackCarouselName || null; // Labels
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
            historyIndex() {
                return this.getHistoryIndex(this._uid);
            },
            impressionsTitle() {
                return this.localization?.Data?.ImpressionsTitle;
            },
            isPreferred() {
                return this.userFlags.ViewMemberPricing;
            },
            showPrices() {
                if(this.localization?.Data?.ShelfProductCarousel) return this.localization.Data.ShelfProductCarousel.ShowPrices;
                return this.localization?.Data?.ShowPrices;
            },
            showPoints() {
                if(this.localization?.Data?.ShelfProductCarousel) return this.localization.Data.ShelfProductCarousel.ShowPoints;
                return this.localization?.Data?.ShowPoints;
            },
            tooltipText() {
                return this.localization?.Labels?.ProductCarousel?.ToolTipText;
            },
            userFlags() {
                if(this.flags && Object.keys(this.flags).length > 0) return this.flags; // From prop
                if(this.data?.UserFlags) return this.data.UserFlags; // From Carousel API
                return this.localization.Data.UserFlags || {}; // From localization
            }
        },
        watch: {
            currentSlide() {
                this.handleDots();
                this.updateHistoryState();
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

            // History State
            this.setupHistoryState();

            // Create resize listener
            window.addEventListener('resize', this.onResize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onResize);
        },
        async mounted() {
            // Init loading
            this.loading = true;

            // If there's data source id and number of products and it's NOT BUO Shelf, then get products from API
            if(this.isCarouselApi && this.dataSourceId && this.numberOfProducts && !this.isBackupOrder) {
                // Get carousel data
                this.data = await this.getData();

                // Set products
                this.prods = this.data?.Products || [];
            } else {
                // Get products from localization or from prop
                this.prods = this.products || [];
            }

            // If there's no product, then hide the carousel
            if(!this.prods?.length) {
                this.hide = true;
            }

            // Init GMT
            this.mountImpressions();

            // Set as loaded
            this.loading = false;
            this.unsetPreComponentLoader();

            // Init carousel
            this.$nextTick(() => {
                this.setSpec();
                this.initInnerSlider();
                this.initCustomNav();
            });
        },
        methods: {
            ...mapActions('gtm', ['addCardImpressions', 'pushImpressions']),
            ...mapActions('productCarousel', ['setHistoryItem', 'setupHistoryStore']),
            ...mapMutations('gtm', ['INCREMENT_CREATED']),
            ...mapMutations('productCarousel', ['SET_HISTORY', 'UPDATE_HISTORY_ITEM']),
            replaceToken,

            async getData() {
                const response = await apiCarousel.query({
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
                this.innerSlider = this.$refs['carousel'].$refs['innerSlider'];

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
                this.totalSlides = this.prods.length || 0;
            },
            initCustomNav() {
                if(this.$refs['nav']) {
                    this.buttonPrev = this.$refs['prevarrow'];
                    this.buttonNext = this.$refs['nextarrow'];

                    if(this.buttonPrev && this.buttonNext) {
                        this.resetButtonsLayer();
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

                if(gtmProducts !== null && gtmProducts?.length) {
                    for (let [i, card] of gtmProducts.entries()) {
                        const pricing = this.isPreferred ? card.PriceRange.RawMinPreferredPrice : card.PriceRange.RawMinRegularPrice;
                        const impressionItemData = {
                            list: this.impressionsTitle || this.$gtmList,
                            position: i + 1,
                            price: pricing,
                            sku: card.Sku,
                            title: card.Title
                        };

                        this.addCardImpressions(impressionItemData);
                    }
                }
                // Issue 75111 - pushImpressions still need to happen even if there isn't any cards to add.
                this.pushImpressions(); // GTM push product impressions
            },
            focusCurrentSlide() {
                const current = this.$refs['wrapper']?.querySelector('.slick-current');
                if(current) {
                    const focusable = current.querySelectorAll('a, button');

                    if(focusable && focusable[0]) {
                        focusable[0].focus();
                    }
                }
            },
            next() {
                this.$refs['carousel'].next();

                if(this.buttonPrev && this.buttonNext) {
                    // Necessary to prevent plugin to focus on body after click in next button
                    setTimeout(() => {
                        this.focusCurrentSlide();
                        // If next button is disable, then focus on prev button
                        /* if(this.buttonNext.classList.contains('slick-disabled')) {
                            // Keep focus in the prev button
                            this.buttonPrev.focus();
                        } else {
                            // Keep focus in the next button
                            this.buttonNext.focus();
                        } */
                    }, 100);
                }
            },
            onResize() {
                if(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) !== this.viewportWidth) {
                    this.setViewport();
                    this.setSpec(true);
                    this.initCustomNav();
                    this.handleTabOrder();
                }
            },
            prev() {
                this.$refs['carousel'].prev();

                if(this.buttonPrev && this.buttonNext) {
                    // Necessary to prevent plugin to focus on body after click in prev button
                    setTimeout(() => {
                        this.focusCurrentSlide();
                        /* // If next button is disable, then focus on prev button
                        if(this.buttonPrev.classList.contains('slick-disabled')) {
                            // Keep focus in the next button
                            this.buttonNext.focus();
                        } else {
                            // Keep focus in the prev button
                            this.buttonPrev.focus();
                        } */
                    }, 100);
                }
            },
            setSpec(resize = false) {
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
                            if(resize) {
                                this.currentSlide = 0;
                                this.goTo(null, 0);
                            }

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
            },
            // History state handlers
            setupHistoryState() {
                this.setupHistoryStore();

                this.setHistoryItem({
                    id: this._uid,
                    index: this.currentSlide
                });

                if(this.historyIndex) {
                    this.currentSlide = this.historyIndex;
                    this.pluginSettings = {
                        ...this.pluginSettings,
                        initialSlide: this.historyIndex
                    };
                }
            },
            updateHistoryState() {
                this.UPDATE_HISTORY_ITEM({
                    id: this._uid,
                    index: this.currentSlide
                });
            }
        }
    };
</script>

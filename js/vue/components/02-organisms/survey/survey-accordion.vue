<template>
    <div class="o-surveyAccordion bg-white border border-gray-50 rounded py-20 px-10 mb-20">
        <accordion
            v-if="section"
            arrow-size="-md"
            :title="title"
            title-el="h2"
            :content-id="contentId"
            :toggle-id="toggleId"
            :visible="initOpened"
            :wrapper-mods="`-surveyAccordion`"
            @show="() => $emit('show')"
            @hide="() => $emit('hide')">
            <!-- Arrow Icon -->
            <template v-slot:icon="$accordion">
                <span class="text-2xl leading-none">
                    <a-icon size="inherit" :class="['text-gray-120', $accordion.isOpened ? '-flip': '', $accordion.isReady ? '-transition' : '']">
                        keyboard_arrow_down
                    </a-icon>
                </span>
            </template>

            <!-- Accordion Content -->
            <div class="o-surveyAccordion__content">
                <!-- If it's result, then displays the products/points -->
                <div v-if="isResult" class="o-surveyAccordion__result">
                    <!-- Points -->
                    <p class="font-bold mb-10">
                        {{ useProductsCommitment ? getLabels(localization, 'Labels.Commitment', null) : getPointLabel }}
                    </p>

                    <!-- Result -->
                    <div class="o-surveyAccordion__list">
                        <div v-for="(item, index) in items" :key="index" class="o-surveyAccordion__item">
                            <!-- Item -->
                            <div class="flex">
                                <!-- Points -->
                                <span v-if="!useProductsCommitment" class="o-surveyAccordion__points" :class="{'-fitSpace': isCn}">
                                    {{
                                        getPoints(getPointsTobePassed(item))
                                    }}
                                </span>

                                <span v-else class="o-surveyAccordion__points mr-8">
                                    {{ getOptionCommitment(item.ProductInnerData.PriceRange) }}
                                </span>
                                <!-- Product Link/Family Name -->
                                <a
                                    v-if="item.IsProduct === true"
                                    class="hover:text-green hover:underline ml-5"
                                    :href="item.ProductInnerData.PdpUrl">
                                    {{ item.ProductInnerData.FamilyTitle }}
                                </a>

                                <!-- Service Name/Description -->
                                <div v-else class="inline-block">
                                    <!-- Service Name -->
                                    {{ item.ServiceInnerData.Name }}

                                    <!-- Service Description -->
                                    <div v-html="item.ServiceInnerData.Description"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Carousel wrapper -->
                    <div v-if="hasProductResult" :class="(carouselOpen ? 'pt-0' : 'pt-40') + ' px-0 xl:px-25 -mx-10 xl:mx-0'">
                        <!-- See Products CTA -->
                        <p class="m-0 p-0 text-center" :style="getCarouselCTA('show')">
                            <button
                                :id="toggleCarouselId"
                                ref="seeproducts"
                                class="a-button -white font-medium"
                                :aria-label="getLabels(localization, 'Labels.SeeProducts', null)"
                                :aria-controls="carouselId"
                                :aria-expanded="String(carouselOpen)"
                                :tabindex="carouselOpen ? -1 : 0"
                                @click="carouselToggle(true)">
                                {{ getLabels(localization, 'Labels.SeeProducts', null) }}
                            </button>
                        </p>

                        <!-- Carousel -->
                        <o-product-carousel
                            v-if="carouselOpen && carouselProducts.length && !isCn"
                            :id="carouselId"
                            ref="carousel"
                            :aria-labelledby="toggleCarouselId"
                            role="region"
                            :is-carousel-api="false"
                            :products="carouselProducts"
                            :flags="userFlags"
                            :disable-title="true"
                            :disable-link="true"
                            :carousel-ada-description="getLabels(localization, 'Labels.CarouselADADescription', null)" />

                        <o-product-carousel-cn
                            v-if="carouselOpen && carouselProducts.length && isCn"
                            :id="carouselId"
                            ref="carousel"
                            :aria-labelledby="toggleCarouselId"
                            role="region"
                            :is-carousel-api="false"
                            :products="carouselProducts"
                            :disable-points="localization.Data.DisablePoints"
                            :flags="userFlags"
                            :disable-title="true"
                            :carousel-ada-description="getLabels(localization, 'Labels.CarouselADADescription', null)" />

                        <!-- Hide Products CTA -->
                        <p class="m-0 p-0 text-center" :style="getCarouselCTA('hide')">
                            <button
                                class="a-button -white font-medium"
                                :aria-label="getLabels(localization, 'Labels.HideProducts', null)"
                                :aria-controls="carouselId"
                                :aria-expanded="String(carouselOpen)"
                                :tabindex="carouselOpen ? 0 : -1"
                                @click="carouselToggle(false)">
                                {{ getLabels(localization, 'Labels.HideProducts', null) }}
                            </button>
                        </p>
                    </div>
                </div>

                <!-- If it's NOT result, then displays checkbox options -->
                <div v-else-if="section.Options" class="o-surveyAccordion__options-list -checkboxes" :style="{height: optionsHeight}">
                    <!-- Options - Checkbox -->
                    <div v-for="(option, index) in section.Options" :key="index" class="o-surveyAccordion__items">
                        <m-checkbox
                            label-mods="font-normal text-xs"
                            :tabindex="index + 1"
                            :label="option.Title"
                            :input-value="option.Id"
                            :value="choices"
                            @input="choicesChecked">
                        </m-checkbox>
                    </div>

                    <!-- Select All - Checkbox -->
                    <div class="o-surveyAccordion__items">
                        <m-checkbox
                            v-model="all"
                            label-mods="font-normal text-xs"
                            :tabindex="section.Options.length + 1"
                            :label="getLabels(localization, 'Labels.SelectAll', null)"
                            input-value="all"
                            :value="all"
                            @input="[selectAll(all), trackCheckbox(all, `${getLabels(localization, 'Labels.SelectAll', null)} ${title}`, $event)]">
                        </m-checkbox>
                    </div>
                </div>
            </div>
        </accordion>
    </div>
</template>

<script>
    import labels from '@common/source/js/vue/mixins/api-localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';

    export default {
        name: 'OSurveyAccordion',
        mixins: [ labels, safeId, isDesktop ],
        safeIds: [
            'contentId',
            'toggleId',
            'toggleCarouselId',
            'carouselId'
        ],
        props: {
            accordionIndex: {
                type: Number,
                default: 0
            },
            initOpened: {
                type: Boolean,
                default: true
            },
            localization: {
                type: Object,
                default: () => {}
            },
            section: {
                type: Object,
                default: () => {
                    return {
                        Id: String,
                        Title: String,
                        // Used when isResult is false:
                        Options: [
                            {
                                IsProduct: Boolean,
                                IsService: Boolean,
                                Id: String,
                                Title: String,
                                Sku: String, // It's null for Service
                                Description: String
                            }
                        ],
                        // Used when isResult is true:
                        Results: [
                            {
                                IsProduct: Boolean,
                                IsService: Boolean,
                                ProductInnerData: {
                                    // Fields for Product
                                    Sku: String,
                                    FamilyTitle: String,
                                    Title: String,
                                    Price: Number,
                                    FormattedPrice: String,
                                    Image: {
                                        Url: String,
                                        Alt: String
                                    },
                                    PriceRange: {},
                                    ConfigurationSkus: [],
                                    Accessories: [],
                                    PdpUrl: String,
                                    Size: String
                                },
                                ServiceInnerData: {
                                    // Fields for Service
                                    Name: String,
                                    Description: String,
                                    Points: { // It's string for Product
                                        MinPoints: String,
                                        MaxPoints: String,
                                        ShowRangeForPoints: Boolean
                                    }
                                }
                            }
                        ]
                    };
                }
            }
        },
        data() {
            return {
                contentId: '',
                toggleId: '',
                all: false,
                choices: [],
                toggleCarouselId: '',
                carouselId: '',
                carouselOpen: false,
                optionsHeight: 'auto'
            };
        },
        computed: {
            getPointLabel() {
                const label = this.hidePoints ? 'Labels.Price' : 'Labels.Points';
                return this.getLabels(this.localization, label, null);
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isResult() {
                return this.section?.Results?.length > 0;
            },
            items() {
                let items = [];

                if(this.isResult) {
                    // Get only the items that has InnerData
                    items = this.section.Results.filter(item => item.ProductInnerData || item.ServiceInnerData);
                }

                return items;
            },
            hasProductResult() {
                if(!this.isResult) return false;

                // Get only the items that is Product and has InnerData
                return this.section.Results.find(item => item.IsProduct === true && item.ProductInnerData);
            },
            hidePoints() {
                return this.$env?.HidePoints || false;
            },
            title() {
                if(!this.useProductsCommitment) {
                    if(this.isResult && this.totalPoints) {
                        const points = this.hidePoints ? '' : this.getLabels(this.localization, 'Labels.Points');
                        return `${this.section?.Title} <span class="font-normal capitalize">(${this.totalPoints} ${points})</span>`;
                    }
                } else {
                    if(this.isResult && this.totalCommitment) {
                        const commitment = this.getLabels(this.localization, 'Labels.Commitment');
                        return `${this.section?.Title} <span class="font-normal capitalize">(${this.totalCommitment} ${commitment})</span>`;
                    }
                }

                return this.section?.Title || null;
            },
            totalPoints() {
                if(this.isResult) {
                    const isGroupPrice = this.hidePoints;
                    return this.getPoints(this.hidePoints ? this.section?.Price : this.section?.Points, isGroupPrice);
                }
                return 0;
            },
            totalCommitment() {
                if(this.isResult) {
                    return this.getSectionCommitment(this.section.Commitment);
                }
                return 0;
            },
            totalProducts() {
                if(this.isResult) {
                    return this.items.length;
                }

                return 0;
            },
            carouselProducts() {
                let arrProducts = [];

                if(this.isResult && this.hasProductResult) {
                    this.section.Results.forEach(item => {
                        if(item.IsProduct === true && item.ProductInnerData) {
                            arrProducts.push(item.ProductInnerData);
                        }
                    });
                }

                return arrProducts;
            },
            userFlags() {
                return this.getLabels(this.localization, 'Data.UserFlags') || {};
            },
            useProductsCommitment() {
                return this.localization?.Data?.UseProductsCommitment || false;
            }
        },
        watch: {
            isXS(val) {
                if(this.isResult || val === false) return;

                this.optionsHeight = 'auto';
            },
            isSM(val) {
                if(this.isResult || val === false) return;

                this.setOptionsHeight(2);
            },
            isDesktop(val) {
                if(this.isResult || val === false) return;

                this.setOptionsHeight(3);
            }
        },
        mounted() {
            // Mark selected choices - Used when editing a survey
            if(this.section?.Options?.length) {
                const choices = [];

                for (const option of this.section.Options) {
                    if(option.Selected) {
                        choices.push(option.Id);
                    }
                }

                this.updateChoices(choices, this.accordionIndex);
            }

            this.$emit('update-total-products', this.totalProducts);
        },
        methods: {
            getPoints(points, isGroupPrice = false) {
                if(!points) {
                    return '';
                }

                if(typeof points === 'object') {
                    if(this.hidePoints) {
                        if(isGroupPrice) {
                            // Compute total price for a category
                            const defaultPrice = points?.MaxPrice || '';
                            return points?.ShowRangeForPrice ? `${points?.MinPrice}-${defaultPrice}` : defaultPrice;
                        } else {
                            // Compute individual product price
                            // Use preferred prices for preferred customers
                            const maxPrice = this.userFlags.ViewMemberPricing ? points?.MaxPreferredPrice : points?.MaxRegularPrice;
                            const minPrice = this.userFlags.ViewMemberPricing ? points?.MinPreferredPrice : points?.MinRegularPrice;
                            return points?.ShowRangeForPrice ? `${minPrice}-${maxPrice}` : maxPrice;
                        }
                    } else {
                        const defaultPoint = points?.MaxPoints || '';
                        return points?.ShowRangeForPoints ? `${points?.MinPoints}-${defaultPoint}` : defaultPoint;
                    }
                } else {
                    return points;
                }
            },
            getPointsTobePassed(item) {
                // Pass price values instead of points incase of HidePoints flag
                if(this.hidePoints) {
                    return item.IsProduct === true ? item.ProductInnerData.PriceRange : item.ServiceInnerData?.Price;
                }
                return item.IsProduct === true ? item.ProductInnerData?.PriceRange?.MaxPoints : item.ServiceInnerData?.Points;
            },
            getSectionCommitment(commitment) {
                let str = '';

                if(commitment) {
                    if(typeof commitment === 'object') {
                        if(commitment.ShowRangeForCommitment) {
                            str = `${commitment.MinCommitment}-${commitment.MaxCommitment}`;
                        } else {
                            str = commitment.MaxCommitment;
                        }
                    } else {
                        str = commitment;
                    }
                }

                return str;
            },
            getOptionCommitment(priceRange) {
                let str = '';

                if(priceRange) {
                    if(typeof priceRange === 'object') {
                        if(priceRange.RawMaxPreferredPrice !== priceRange.RawMinPreferredPrice) {
                            str = `${priceRange.MinPreferredPrice}-${priceRange.MaxPreferredPrice}`;
                        } else {
                            str = priceRange.MaxPreferredPrice;
                        }
                    }
                }

                return str;
            },
            choicesChecked(choices, event) {
                this.trackCheckbox(event.currentTarget.checked, event.target.nextElementSibling.textContent, event);
                this.updateChoices(choices, this.accordionIndex);
            },
            updateChoices(choices, accordionIndex) {
                this.choices = choices;
                this.all = this.choices.length === this.section.Options.length;

                this.$emit('update-choices', {choices: this.choices, index: accordionIndex});
            },
            selectAll(checked) {
                if(checked) {
                    this.choices = this.section.Options.map(option => option.Id);
                } else {
                    this.choices = [];
                }

                this.$emit('update-choices', {choices: this.choices, index: this.accordionIndex});
            },
            carouselToggle(open) {
                this.carouselOpen = open;

                this.$nextTick(() => {
                    if(open) {
                        // Focus on first slide after opening the carousel
                        if(this.$refs['carousel']?.$el) {
                            const slide = this.$refs['carousel']?.$el.querySelector('.slick-current');
                            if(slide) {
                                const clickable = slide.querySelector('a, button');
                                clickable.focus();
                            }
                        }
                    } else {
                        // Focus on See Products CTA after closing the carousel
                        if(this.$refs['seeproducts']) {
                            this.$refs['seeproducts'].focus();
                        }
                    }
                });
            },
            getCarouselCTA(cta) {
                let style = {};

                // See Products CTA
                if(cta === 'show') {
                    if(!this.carouselOpen) {
                        style.opacity = 1;
                        style.height = 'auto';
                    } else {
                        style.opacity = 0;
                        style.height = '0px';
                    }

                // Hide Products CTA
                } else {
                    if(this.carouselOpen) {
                        style.opacity = 1;
                        style.height = 'auto';
                    } else {
                        style.opacity = 0;
                        style.height = '0px';
                    }
                }

                return style;
            },
            trackCheckbox(isChecked, inputText, event) {
                if(isChecked) {
                    this.gtmTrackAction({id: 416, text: inputText}, event);
                }
            },
            setOptionsHeight(rows) {
                let height = (Math.ceil(this.section.Options.length / rows) * 40); // 40px is the height of an option
                if(this.section.Options.length % rows === 0) height += 40;
                if(rows === 2) height += 25; // extra padding for long text wrapping

                // Add extra padding for md screens
                if(this.isDesktop) {
                    height += 15;
                }

                height += 'px';
                this.optionsHeight = height;
            }
        }
    };
</script>

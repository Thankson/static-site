<template>
    <section id="section-pdp-top" class="o-productDetails">
        <!-- Start: Upper Info Mobile (Name, ReviewSnippet, Size) -->
        <div class="md:hidden">
            <h1
                class="o-productDetails__heading"
                v-html="product.name" />
            <p
                v-if="product.sku || product.size" class="o-productDetails__details">
                <span v-if="product.sku">{{ getLocalizationProp('Labels.Item', 'Item') }}: {{ product.sku }}</span>
                <span v-if="product.sku && product.size" class="px-3"> | </span>
                <span v-if="product.size">{{ getLocalizationProp('Labels.Size', 'Size') }}: <span class="font-bold">{{ product.size }}</span></span>
            </p>
            <div :class="['a-reviewSnippet', !showReviews && 'hidden']">
                <div id="pr-reviewSnippetMobile" />
            </div>
        </div>
        <!-- End: Upper Info Mobile (Name, ReviewSnippet, Size) -->

        <div class="md:hidden">
            <template v-if="product.stamps && Object.keys(product.stamps).length > 0">
                <em
                    class="a-stamp"
                    :class="product.stamps.Style">

                    {{ product.stamps.StampTitle }}
                </em>
            </template>
        </div>

        <!-- Start: PDP Media Carousel Desktop -->
        <template v-if="!isActive">
            <slot />

            <div
                v-if="isTryOnTool"
                class="o-productDetails__tryOn">

                <button
                    class="o-tryOn__button a-button justify-center"
                    @click="[
                        activateTool(true),
                        gtmTrackAction({ id: 216 }, $event)
                    ]">

                    {{ getLocalizationProp('Labels.TryItOn', 'Try It On') }}
                </button>
            </div>
        </template>
        <!-- End: PDP Media Carousel Desktop -->

        <o-try-on-tool
            v-if="isTryOnTool"
            :is-asian-models-for-try-on-tool="isAsianModelsForTryOnTool"
            :is-cn="isCn"
            :try-on-tool-type="tryOnToolType"
            :labels="getLocalizationProp('Labels', {})" />

        <o-product-configurator
            v-if="Object.keys(data).length > 0"
            :class="['o-productDetails__info', isTryOnTool ? '-tryOn' : '']"
            :data="data"
            :labels="getLocalizationProp('Labels', {})"
            :is-asian-models-for-try-on-tool="isAsianModelsForTryOnTool"
            :is-pdp="true"
            :is-cart="false"
            :is-try-on-tool="isTryOnTool"
            :is-cn="isCn"
            :pre-selected-sku="product.sku"
            :services-success="servicesSuccess"
            :script-id-configurator="scriptIdShelfConfigurator"
            :services-error-reload-text="servicesErrorReloadText"
            :services-error-text="servicesErrorText"
            :readonly="!canPurchaseRestrictedPacks || (!userFlags.IsAuthenticated && !userFlags.IsGuestShoppingEnabled) || !isValid">

            <template v-slot:before="$configurator">
                <!-- Start: Upper Info Desktop (Name, ReviewSnippet, Size) -->
                <div class="hidden md:block">
                    <h1 class="o-productDetails__heading" v-html="$configurator.title"></h1>
                    <p v-if="$configurator.sku || $configurator.size" class="o-productDetails__details">
                        <template v-if="$configurator.sku">
                            {{ getLocalizationProp('Labels.Item', 'Item') }}: {{ product.sku }}
                        </template>
                        <template v-if="$configurator.sku && $configurator.size"><span class="px-3"> | </span></template>
                        <template v-if="$configurator.size">
                            {{ getLocalizationProp('Labels.Size', 'Size') }}: <span class="font-bold">{{ $configurator.size }}</span>
                        </template>
                    </p>
                    <div :class="['a-reviewSnippet', !showReviews && 'hidden']">
                        <div id="pr-reviewSnippetDesktop" />
                    </div>
                </div>
                <!-- End: Upper Info Desktop (Name, ReviewSnippet, Size) -->

                <template v-if="$configurator.stamps && Object.keys($configurator.stamps).length > 0">
                    <em
                        class="a-stamp hidden md:inline-flex"
                        :class="$configurator.stamps.Style">

                        {{ $configurator.stamps.StampTitle }}
                    </em>
                </template>

                <!-- Start: Description Desktop -->
                <div class="o-productDetails__desc -desktop" v-html="$configurator.description"></div>
                <!-- End: Description Desktop -->
                <!-- Start: Short-Description Desktop -->
                <div class="hidden md:block mb-15">
                    <slot name="short-description" />
                </div>
                <!-- End: Short-Description Desktop -->

                <div v-if="isCn && showDirectSellingInfo" class="hidden text-sm leading-normal text-gray md:block">
                    {{ getLocalizationProp('Labels.DirectSellingInfo', 'Direct Selling') }}
                </div>
                <template v-if="userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled">
                    <div v-if="userFlags.ViewMemberPricing && $configurator.hasPackSavings">
                        <!-- Start: New Customer Savings Pack Desktop -->
                        <p
                            v-if="isCustomerSavingPack && customerSavingPack"
                            class="pb-20 hidden md:block"
                            v-html="customerSavingPack.replace('{0}', $configurator.packSavings)" />
                        <!-- End: New Customer Savings Pack Desktop -->

                        <!-- Start: Pack Savings Desktop -->
                        <p
                            v-else-if="packSavingsRte"
                            class="pb-20 hidden md:block"
                            v-html="packSavingsRte.replace('{0}', $configurator.packSavings)" />
                        <!-- End: Pack Savings Desktop -->
                    </div>
                </template>

                <!-- Start: Pricing/Points Desktop -->
                <div v-if="(isCn ? userFlags.IsAuthenticated : (userFlags.IsAuthenticated || !userFlags.UnAuthenticateCustomerHidePrices))" class="o-productDetails__price -desktop">
                    <m-product-details-price
                        :concentrated-label="$configurator.concentratedLabel"
                        :concentrated-price-per-unit-measurement-type="$configurator.concentratedPricePerUnitMeasurementType"
                        :concentrated-preferred-price-per-unit="$configurator.concentratedPreferredPricePerUnit"
                        :concentrated-regular-price-per-unit="$configurator.concentratedRegularPricePerUnit"
                        :diluted-label="$configurator.dilutedLabel"
                        :diluted-price-per-unit-measurement-type="$configurator.dilutedPricePerUnitMeasurementType"
                        :diluted-preferred-price-per-unit="$configurator.dilutedPreferredPricePerUnit"
                        :diluted-regular-price-per-unit="$configurator.dilutedRegularPricePerUnit"
                        :original-price-per-unit-measurement-type="$configurator.originalPricePerUnitMeasurementType"
                        :original-preferred-price-per-unit="$configurator.originalPreferredPricePerUnit"
                        :original-regular-price-per-unit="$configurator.originalRegularPricePerUnit"
                        :preferred-label="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackSpecialPackPrice', 'Special Pack Saving') : getLocalizationProp('Labels.Preferred', 'Member')"
                        :preferred-price="$configurator.preferredPrice"
                        :preferred-sr-text="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackSpecialPackPriceScreenReader', 'Special Pack Saving at') : getLocalizationProp('Labels.PreferredAt', 'Member value at ')"
                        :regular-label="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackMemberPrice', 'Member Price') : getLocalizationProp('Labels.Regular', 'Non-Member')"
                        :regular-price="isCustomerSavingPack ? getLocalizationProp('Data.NewCustomerPackMemberPrice', '') : $configurator.regularPrice"
                        :regular-sr-text="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackMemberPriceScreenReader', 'Member Price at') : getLocalizationProp('Labels.RegularAt', 'Non-Member value at ')"
                        :member-only-offer-label="getLocalizationProp('Labels.MemberOnlyOffer', 'Member-Only Offer')"
                        :is-restricted-pack="isRestrictedPack"
                        :view-member-pricing="userFlags.ViewMemberPricing || (!userFlags.IsAuthenticated && !userFlags.IsGuestShoppingEnabled)"
                        :show-strikethrough-original-price="showStrikethroughOriginalPrice"
                        :is-price-range="$configurator.isPriceRange"
                        :original-price-member="$configurator.originalPriceMember"
                        :original-price-non-member="$configurator.originalPriceNonMember"
                        :original-price-screen-reader="getLocalizationProp('Labels.OriginalPriceScreenReader', 'Original Price')"
                    />

                    <p v-if="userFlags.ViewPoints && $configurator.points" class="o-productDetails__points">
                        <span class="sr-only">{{ getLocalizationProp('Labels.Earn', 'Earn') }}</span>
                        {{ $configurator.points }}
                        <span class="sr-only"> {{ getLocalizationProp('Labels.PointsWith', ' points with this purchase') }}</span>
                        {{ isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackPoints', 'Points') : getLocalizationProp('Labels.Points', 'Points') }}
                    </p>

                    <template v-if="userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled">
                        <p
                            v-if="!userFlags.ViewMemberPricing && !isRestrictedPack && $configurator.preferredSavings"
                            class="mt-10"
                            v-html="$configurator.preferredSavings" />
                    </template>
                </div>
                <!-- End: Pricing/Points Desktop -->
            </template>

            <template v-slot:between="$configurator">
                <!-- Start: Pricing/Points Mobile -->
                <div v-if="(isCn ? userFlags.IsAuthenticated : (userFlags.IsAuthenticated || !userFlags.UnAuthenticateCustomerHidePrices))" class="o-productDetails__price -mobile">
                    <m-product-details-price
                        :concentrated-label="$configurator.concentratedLabel"
                        :concentrated-price-per-unit-measurement-type="$configurator.concentratedPricePerUnitMeasurementType"
                        :concentrated-preferred-price-per-unit="$configurator.concentratedPreferredPricePerUnit"
                        :concentrated-regular-price-per-unit="$configurator.concentratedRegularPricePerUnit"
                        :diluted-label="$configurator.dilutedLabel"
                        :diluted-price-per-unit-measurement-type="$configurator.dilutedPricePerUnitMeasurementType"
                        :diluted-preferred-price-per-unit="$configurator.dilutedPreferredPricePerUnit"
                        :diluted-regular-price-per-unit="$configurator.dilutedRegularPricePerUnit"
                        :original-price-per-unit-measurement-type="$configurator.originalPricePerUnitMeasurementType"
                        :original-preferred-price-per-unit="$configurator.originalPreferredPricePerUnit"
                        :original-regular-price-per-unit="$configurator.originalRegularPricePerUnit"
                        :preferred-label="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackSpecialPackPrice', 'Special Pack Saving') : getLocalizationProp('Labels.Preferred', 'Member')"
                        :preferred-price="$configurator.preferredPrice"
                        :preferred-sr-text="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackSpecialPackPriceScreenReader', 'Special Pack Saving at') : getLocalizationProp('Labels.PreferredAt', 'Member value at ')"
                        :regular-label="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackMemberPrice', 'Member Price') : getLocalizationProp('Labels.Regular', 'Non-Member')"
                        :regular-price="isCustomerSavingPack ? getLocalizationProp('Data.NewCustomerPackMemberPrice', '') : $configurator.regularPrice"
                        :regular-sr-text="isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackMemberPriceScreenReader', 'Member Price at') : getLocalizationProp('Labels.RegularAt', 'Non-Member value at ')"
                        :member-only-offer-label="getLocalizationProp('Labels.MemberOnlyOffer', 'Member-Only Offer')"
                        :is-restricted-pack="isRestrictedPack"
                        :view-member-pricing="userFlags.ViewMemberPricing"
                        :show-strikethrough-original-price="showStrikethroughOriginalPrice"
                        :is-price-range="$configurator.isPriceRange"
                        :original-price-member="$configurator.originalPriceMember"
                        :original-price-non-member="$configurator.originalPriceNonMember"
                        :original-price-screen-reader="getLocalizationProp('Labels.OriginalPriceScreenReader', 'Original Price')"
                    />

                    <p v-if="userFlags.ViewPoints && $configurator.points" class="o-productDetails__points">
                        <span class="sr-only">{{ getLocalizationProp('Labels.Earn', 'Earn') }}</span>
                        {{ $configurator.points }}
                        <span class="sr-only"> {{ getLocalizationProp('Labels.PointsWith', ' points with this purchase') }}</span>
                        {{ isCustomerSavingPack ? getLocalizationProp('Labels.NewCustomerPackPoints', 'Points') : getLocalizationProp('Labels.Points', 'Points') }}
                    </p>

                    <template v-if="userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled">
                        <p
                            v-if="!userFlags.ViewMemberPricing && !isRestrictedPack && $configurator.preferredSavings"
                            class="mt-10"
                            v-html="$configurator.preferredSavings" />
                    </template>
                </div>
                <!-- End: Pricing/Points Mobile -->
            </template>

            <template v-slot:after="$configurator">
                <div
                    v-if="!isValid"
                    class="o-productDetails__invalidMessage center">

                    <div
                        v-for="(invalidMessage, index) in invalidMessages"
                        :key="`invalidMessage-${index}`"
                        class="pb-10"
                        v-html="invalidMessage" />
                </div>

                <div class="relative">
                    <!-- Start: PDP Accessories button & Popup -->
                    <div
                        v-if="isCn ? userFlags.IsAuthenticated : true"
                        class="o-productDetails__accessories"
                        :class="{
                            'md:my-30': !userFlags.IsAuthenticated && !userFlags.IsGuestShoppingEnabled,
                            'mb-30 inline-block': !$configurator.accessories || !$configurator.accessories.length
                        }">

                        <m-accessories-accordion
                            v-if="$configurator.accessories && $configurator.accessories.length"
                            :accessories-label="getLocalizationProp('Labels.Accessories', 'Accessories')"
                            :accordion-items="$configurator.accessories"
                            :button-label="getLocalizationProp('Labels.AddToCart', 'Add to Cart')"
                            :pts="getLocalizationProp('Labels.Pts', 'pts')"
                            :view-member-pricing="userFlags.ViewMemberPricing"
                            :is-authenticated="userFlags.IsAuthenticated"
                            :is-guest-shopping-enabled="userFlags.IsGuestShoppingEnabled"
                            :should-hide-prices="userFlags.UnAuthenticateCustomerHidePrices"
                            :show-points="userFlags.ViewPoints">

                            <!-- Start: Become a Member Message (w/ Accessories) -->
                            <template
                                v-if="!canPurchaseRestrictedPacks || (!userFlags.IsAuthenticated && !userFlags.IsGuestShoppingEnabled) && becomeAMember"
                                v-slot:content-left>

                                <p class="leading-tight to-md:mt-30" v-html="becomeAMember" />
                            </template>
                            <!-- End: Become a Member Message -->
                        </m-accessories-accordion>

                        <!-- Start: Become a Member Message (without Accessories) -->
                        <p
                            v-else-if="!canPurchaseRestrictedPacks || (!userFlags.IsAuthenticated && !userFlags.IsGuestShoppingEnabled) && becomeAMember"
                            class="leading-tight to-md:pt-30" v-html="becomeAMember" />
                    </div>
                    <!-- End: PDP Accessories button & Popup -->

                    <!-- Start: PDP Add to list -->
                    <div
                        v-if="userFlags.IsAuthenticated && canPurchaseRestrictedPacks && !isSoldOut"
                        class="o-productDetails__addList">

                        <m-shoplists-add-item
                            class="m-po__details -addList"
                            :is-shelf="true"
                            :is-pdp="true"
                            :product="data"
                            :gtm-text="product.name">

                            <template v-slot:icon>
                                <div class="o-productDetails__inner">
                                    <span class="material-icons mr-5" aria-hidden="true">playlist_add</span>
                                    <span>{{ getLocalizationProp('Labels.AddToList', 'Add to List') }}</span>
                                </div>
                            </template>
                        </m-shoplists-add-item>
                    </div>
                    <!-- End: PDP Add to list -->
                </div>

                <!-- Start: Description Mobile -->
                <div class="o-productDetails__desc -mobile" v-html="$configurator.description"></div>
                <!-- End: Description Mobile -->
                <!-- Start: Short-Description Mobile -->
                <div class="block md:hidden mb-15">
                    <slot name="short-description" />
                </div>
                <!-- End: Short-Description Mobile -->
                <div v-if="isCn && showDirectSellingInfo" class="block text-sm leading-normal text-gray md:hidden">
                    {{ getLocalizationProp('Labels.DirectSellingInfo', 'Direct Selling') }}
                </div>
                <template v-if="userFlags.IsAuthenticated || userFlags.IsGuestShoppingEnabled">
                    <div v-if="userFlags.ViewMemberPricing && $configurator.hasPackSavings">
                        <!-- Start: New Customer Savings Pack Mobile -->
                        <p
                            v-if="isCustomerSavingPack && customerSavingPack"
                            class="pb-20 md:hidden"
                            v-html="customerSavingPack.replace('{0}', $configurator.packSavings)" />
                        <!-- End: New Customer Savings Pack Mobile -->

                        <!-- Start: Pack Savings Mobile -->
                        <p
                            v-else-if="packSavingsRte"
                            class="pb-20 md:hidden"
                            v-html="packSavingsRte.replace('{0}', $configurator.packSavings)" />
                    <!-- End: Pack Savings Mobile -->
                    </div>
                </template>

            </template>
        </o-product-configurator>

        <!-- Display Service Failure if the localization indicates that the service has failure -->
        <div v-if="!servicesSuccess && !cartRequestFail" class="o-productDetails__info">
            <m-error-card mods="-separateLines" :reload-text="servicesErrorReloadText" :text="servicesErrorText" />
        </div>
    </section>
</template>

<script>
    import isDesktop from '@common/source/js/vue/mixins/is-desktop';
    import validateApi from '@api/routes/addtocart/validate';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import preComponentLoader from '@common/source/js/vue/mixins/pre-component-loader';
    import { mapState, mapActions, mapMutations } from 'vuex';

    export default {
        name: 'OProductDetails',
        mixins: [ localizationMixin, isDesktop, preComponentLoader ],
        props: {
            sku: {
                type: String,
                default: null
            },
            familyId: {
                type: String,
                default: null
            },
            scriptIdShelfConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            scriptIdServicesError: {
                type: String,
                default: 'service-failure-configurator-pdp'
            }
        },
        data() {
            return {
                canPurchaseRestrictedPacks: false,
                data: {},
                historyReset: false,
                historyState: [],
                loaded: false,
                ready: false,
                isValid: false,
                invalidMessages: [],
                servicesSuccess: true,
                servicesErrorReloadText: '',
                servicesErrorText: '',
                isRestrictedPack: false,
                isSoldOut: false
            };
        },
        computed: {
            ...mapState('productDetailPage', ['product']),
            ...mapState('tryOnTool', ['isActive', 'toolState']),
            ...mapState('addToCart', ['cartRequestFail']),

            becomeAMember() {
                return this.getLocalizationProp('Labels.BecomeAMember') && this.getLocalizationProp('Labels.BecomeAMemberLink.Url') ? `${this.getLocalizationProp('Labels.BecomeAMember')}<br/><a href="${this.getLocalizationProp('Labels.BecomeAMemberLink.Url')}" class="text-green underline">${this.getLocalizationProp('Labels.BecomeAMemberLink.Text')}</a>` : null;
            },
            customerSavingPack() {
                return this.getLocalizationProp('Labels.NewCustomerPackSavingMessage', null);
            },
            isAsianModelsForTryOnTool() {
                return this.isCn || this.isTw || this.isHk;
            },
            isCustomerSavingPack() {
                return this.getLocalizationProp('Data.isCustomerSavingPack', false);
            },
            isHk() {
                return this.$env.Country === 'HongKong';
            },
            isTw() {
                return this.$env.Country === 'Taiwan';
            },
            isTryOnTool() {
                return this.data.FamilyInfo?.TryOnTool || false;
            },
            tryOnToolType() {
                return this.data.FamilyInfo?.TryOnToolType || '';
            },
            packSavingsRte() {
                const packSavingsRte = this.getLocalizationProp('Labels.Savings', '');
                return packSavingsRte || '';
            },
            showReviews() {
                if(this.$env?.HideAllPowerReviews) {
                    return false;
                }

                return this.getLocalizationProp('Data.ShowReviews', false);
            },
            userFlags() {
                return this.localization?.Data?.UserFlags || {};
            },
            isCn() {
                return this.getLocalizationProp('Data.IsCn', false) || false;
            },
            showDirectSellingInfo() {
                return this.getLocalizationProp('Data.ShowDirectSellingInfo', false) || false;
            },
            showStrikethroughOriginalPrice() {
                return this.getLocalizationProp('Data.ShowStrikethroughOriginalPrice', false) &&
                    this.userFlags.IsAuthenticated;
            }
        },
        watch: {
            product(newValue, oldValue) {
                this.updateState();

                if(this.ready && newValue.sku !== oldValue.sku) {
                    this.$nextTick(this.refreshModules);
                    this.dataLayerPush();
                }
            },
            cartRequestFail() {
                // If AddToCart request fails, then mark servicesSuccess as false
                this.servicesSuccess = !this.cartRequestFail;
            }
        },
        created() {
            window.addEventListener('popstate', this.onPopState);
        },
        async mounted() {
            // get services error properties:
            // if services succeeds, then the associated localization script (and therefore JSON object) will not be generated --
            // hence the reason we default "Success" to `true`; if services fails, then JSON object will be built with the "Success" property equal to `false`:
            this.servicesSuccess = this.getLocalizationPropByScriptId(this.scriptIdServicesError, 'Success', true);
            this.servicesErrorReloadText = this.getLocalizationPropByScriptId(this.scriptIdServicesError, 'ErrorButtonText', '');
            this.servicesErrorText = this.getLocalizationPropByScriptId(this.scriptIdServicesError, 'GenericFailureMessage', '');

            // if services fails, then data doesn't exist -- so no need to continue further:
            if(!this.servicesSuccess) {
                return;
            }

            this.data = this.localization.Data;
            // if one product in the family, do the redirect to product's PDP
            const products = this.data?.Products || [];
            if(products.length === 1 && products[0].Url && window.location.pathname !== new URL(products[0].Url, window.location.origin).pathname) {
                window.location.replace(products[0].Url);
                return;
            }
            this.SET_IS_PREFERRED(this.data.UserIsPreferred);
            this.parseProduct();

            // GA
            this.dataLayerPush();

            // Check to see if user can get the new customer saving pack
            if(this.localization?.Data?.NeedsValidations) {
                const response = await validateApi.get(`?sku=${this.data?.Sku}&familyId=${this.data?.FamilyInfo?.Id}`);

                if(response.success && response.data.Success) {
                    this.isValid = response.data.Data.IsValid;
                    this.invalidMessages = response.data.Data.Reasons;
                }
            } else {
                this.isValid = true;
            }
            this.unsetPreComponentLoader();
        },
        methods: {
            ...mapActions('productDetailPage', ['refreshModules', 'setProduct']),
            ...mapActions('tryOnTool', [ 'activateTool']),
            ...mapMutations('addToCart', ['SET_IS_PREFERRED']),
            ...mapMutations('tryOnTool', ['ACTIVATE_TOOL']),

            dataLayerPush() {
                const sku = this.data.Sku;
                const products = this.data.Products || [];
                const product =
                    products.length === 1
                        ? products[0]
                        : products.find(product => product.Sku === sku) || this.data.FamilyInfo || {};
                const price = this.userFlags.ViewMemberPricing ? product.PriceRange.RawMinPreferredPrice || '' : product.PriceRange.RawMinRegularPrice || '';

                window.dataLayer && window.dataLayer.push({
                    'event': 'productDetail',
                    'ecommerce': {
                        'currencyCode': this.$env?.CurrencyCode || '', // Local currency
                        'detail': {
                            'actionField': { 'list': 'ProductDetail' }, // Product list (string)
                            'products': [{
                                'id': this.product.sku, // Product ID or SKU (string) REQUIRED
                                'name': this.product.name, // Product name (string) REQUIRED
                                'price': price,
                                'brand': this.product.brand || '',
                                'category': this.product.category || '',
                                'variant': this.product.variant || ''
                            }]
                        }
                    }
                });
            },

            onPopState(evt) {
                if(window.location.hash) { return; }

                this.historyReset = true;

                if(evt.state) {
                    this.setProduct(evt.state);
                }

                this.$nextTick(() => {
                    this.historyReset = false;
                });
            },
            parseProduct() {
                const sku = this.data.Sku;
                const products = this.data.Products || [];
                const product =
                    products.length === 1
                        ? products[0]
                        : products.find(product => product.Sku === sku) || this.data.FamilyInfo || {};

                this.setProduct({
                    sku: product.Sku,
                    name: product.Name,
                    url: product.Url,
                    size: product.Size,
                    stamps: product.Stamps,
                    brand: product.Brand,
                    category: product.Category,
                    variant: product.Variant,
                    userFlags: this.data.UserFlags
                });

                this.isSoldOut = product.IsSoldOut || false;

                this.setIsRestrictedPack(products, product);

                this.$nextTick(() => {
                    window.history.replaceState(this.product, '');
                    this.ready = true;
                });
            },
            setIsRestrictedPack(products, product) {
                // use FamilyInfo's isRestrictedPack if no products available
                this.isRestrictedPack = products.length > 0 ? products.every(p => p.IsRestrictedPack) : product.IsRestrictedPack;
                this.canPurchaseRestrictedPacks = this.isRestrictedPack ? this.data.UserFlags.CanPurchaseRestrictedPacks : true;
            },
            setBreadcrumb() {
                const breadcrumb = document.querySelector('.m-breadcrumb .m-breadcrumb__link[aria-current="page"]');
                if(breadcrumb) {
                    breadcrumb.setAttribute('href', encodeURI(this.product.url));
                    breadcrumb.innerText = this.product.name;
                }
            },
            setHistoryState() {
                document.title = this.product.name;
                const params = window.location.search;
                // prevent pushstate while in pattern lab with mock_server marker
                // Note: remove MOCK_SERVER condition and use the "Open in New Window" option of patternlab to test
                if(this.ready && !this.historyReset && !process.env.MOCK_SERVER) {
                    window.history.pushState(this.product, this.product.name, this.product.url + params);
                }
            },
            updateState() {
                if(this.product.url) {
                    this.setBreadcrumb();
                    this.setHistoryState();
                    window.cleanVideoModal && window.cleanVideoModal();
                }
            }
        }
    };
</script>

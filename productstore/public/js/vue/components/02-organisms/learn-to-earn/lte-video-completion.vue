<template>
    <div class="o-lteVidComplete" :class="modClass">
        <div v-if="!hasWatchedStep" class="o-lteVidComplete__loading">
            <a-loading-spinner :visible="true" />
        </div>
        <div v-else class="o-lteVidComplete__loaded">
            <div class="o-lteVidComplete__wrapper">

                <!-- Badge -->
                <div
                    v-if="hasLteAmount && (!isWatchedLocal || hasResetLocal) && !isReplayLocal && !isReplay"
                    class="o-lteVidComplete__badge">
                    <span class="o-lteVidComplete__icon lowercase font-material -check">check</span>
                    <span class="sr-only">
                        {{ hasLteAmount }} {{ checkLocalization('LoyaltyShoppingDollars') }}
                    </span>
                    <span aria-hidden="true">{{ hasLteAmount }}</span>
                </div>

                <!-- Title -->
                <h2
                    v-if="watchedStep.CompletionMessage.Title && !isReplayLocal && !isReplay"
                    class="o-lteVidComplete__title"
                    :class="{'pl-0': !hasDescOrProduct}">
                    {{ watchedStep.CompletionMessage.Title }}
                </h2>

                <!-- Replay Title -->
                <h2
                    v-if="watchedStep.ReplayMessage.Title && (isReplayLocal || isReplay)"
                    class="o-lteVidComplete__title"
                    :class="{'pl-0': !hasDescOrProduct}">
                    {{ watchedStep.ReplayMessage.Title }}
                </h2>

                <!-- Description -->
                <p
                    v-if="(watchedStep.CompletionMessage && watchedStep.CompletionMessage.Description) && !isReplayLocal && !isReplay"
                    class="o-lteVidComplete__desc">
                    {{ descWithLsd }}
                </p>

                <!-- Product / General Link -->
                <div
                    v-if="hasProductOrGenericCta"
                    class="o-lteVidComplete__product">
                    <!-- Image thumbnail -->
                    <img
                        v-if="hasGenericImage"
                        :src="watchedStep.CurrentVideo.LearnToEarn.Metadata.ModalImage.Url"
                        :alt="watchedStep.CurrentVideo.LearnToEarn.Metadata.ModalImage.Alt || ''"
                        class="o-lteVidComplete__img -genericImg"
                    >
                    <img
                        v-else-if="hasProductImage"
                        :src="watchedStep.CurrentVideo.LearnToEarn.Metadata.Product.Image.Url"
                        :alt="watchedStep.CurrentVideo.LearnToEarn.Metadata.Product.Image.Alt || ''"
                        class="o-lteVidComplete__img -productImg"
                    >
                    <div
                        :class="{'-noImage': !hasAnyImage}"
                        class="o-lteVidComplete__details">
                        <!-- Title -->
                        <h3
                            v-if="hasProductSku && hasProductTitle"
                            class="o-lteVidComplete__name">
                            {{ watchedStep.CurrentVideo.LearnToEarn.Metadata.Product.Title }}
                        </h3>

                        <!-- CTA / General Link -->
                        <a
                            v-if="hasGenericCta"
                            class="o-lteVidComplete__cta a-button -white -product"
                            :href="watchedStep.CurrentVideo.LearnToEarn.Metadata.ModalCta.Url">
                            {{ watchedStep.CurrentVideo.LearnToEarn.Metadata.ModalCta.Text }}
                        </a>

                        <!-- SKU - open shelf -->
                        <div v-else-if="hasProductSku" class="o-lteVidComplete__action">
                            <div class="o-lteVidComplete__configurator" @click="hideModal()">
                                <!-- Configurator -->
                                <o-shelf-configurator
                                    v-if="productHasConfig"
                                    class="o-lteVidComplete__cta a-button -white -product"
                                    :sku="productSkuComp"
                                    :button-label="customAriaLabel(checkLocalization('SelectAriaLabel'), productTitle)"
                                    :family-id="productFamilyComp">
                                    <span>{{ checkLocalization('Select') }}</span>
                                </o-shelf-configurator>
                            </div>

                            <!-- Add to Cart directly -->
                            <div v-if="!productHasConfig" class="o-lteVidComplete__cta">
                                <m-cart-add-config
                                    :button-label="checkLocalization('AddToCart')"
                                    :button-aria-label="customAriaLabel(checkLocalization('AddToCartAriaLabel'), productTitle)"
                                    :sku="productSkuComp"
                                    :family-id="productFamilyComp"
                                    mod-classes="-lteCompletion"
                                    cta-classes="-white"
                                    :show-qtity="false"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="o-lteVidComplete__footer">
                <!-- Replay -->
                <button
                    class="o-lteVidComplete__cta -replay"
                    @click="replayVideo()">
                    <span class="o-lteVidComplete__icon -replay" aria-hidden="true">replay</span>
                    <span>{{ checkLocalization('ReplayVideo') }}</span>
                </button>

                <!-- Next Video -->
                <button
                    v-if="hasNextVideo"
                    class="o-lteVidComplete__cta -next"
                    @click="nextVideo()">
                    <span
                        v-if="nextVideoTitle"
                        class="sr-only">{{ checkLocalization('PlayNext') }} : {{ nextVideoTitle }}
                    </span>
                    <span aria-hidden="true">{{ checkLocalization('PlayNext') }}</span>
                    <img
                        v-if="nextVideoImage"
                        :src="nextVideoImage" alt=""
                        class="o-lteVidComplete__img -next">
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'OLteVidCompletion',
        props: {
            hasReset: {
                type: Boolean,
                default: false
            },
            isReplay: {
                type: Boolean,
                default: false
            },
            isWatched: {
                type: Boolean,
                default: false
            },
            localization: {
                type: Object,
                default () {
                    return {};
                }
            },
            localizationDefault: {
                type: Object,
                default () {
                    return {
                        'LoyaltyShoppingDollars': 'Loyalty Shopping Dollars',
                        'PlayNext': 'Play Next',
                        'ReplayVideo': 'Replay Video',
                        'Select': 'Select',
                        'SelectAriaLabel': 'Select {0}',
                        'AddToCart': 'Add to Cart',
                        'AddToCartAriaLabel': 'Add {0} to Cart'
                    };
                }
            },
            modClass: {
                type: String,
                default: ''
            }
        },

        data() {
            return {
                isWatchedLocal: false,
                hasResetLocal: false,
                isReplayLocal: false
            };
        },

        computed: {
            ...mapState('lteVideos', ['storedVideosList', 'watchedStep']),
            ...mapGetters('lteVideos', ['getLocalization']),
            ...mapState('addToCart', ['loading']),

            currentVideoId() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.MetadataItemId;
            },

            descWithLsd() {
                const description = this.watchedStep?.CompletionMessage?.Description;
                const lsdAvailable = this.watchedStep?.Lsd?.AvailableToSpend;
                return description.replace('{0}', lsdAvailable);
            },

            nextVideoData() {
                return this.watchedStep?.NextVideo?.VirtualVideo;
            },

            nextVideoId() {
                return this.watchedStep?.NextVideo?.LearnToEarn?.Metadata?.MetadataItemId;
            },

            nextVideoImage() {
                return this.watchedStep?.NextVideo?.VirtualVideo?.ImageUrl;
            },

            nextVideoTitle() {
                return this.watchedStep?.NextVideo?.VirtualVideo?.Title;
            },

            hasDescOrProduct() {
                return (this.watchedStep?.CompletionMessage?.Description || this.watchedStep?.Product?.Title);
            },

            hasLte() {
                return this.watchedStep?.NextVideo?.LearnToEarn ?? {};
            },

            hasLteAmount() {
                return this.watchedStep?.Lsd?.TotalUnbanked;
            },

            hasQuiz() {
                return this.watchedStep?.NextVideo?.LearnToEarn?.Quiz;
            },

            hasWatchedStep() {
                return Object.keys(this.watchedStep).length;
            },

            hasGenericCta() {
                const genericText = this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.ModalCta?.Text?.length > 0;
                const genericUrl = this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.ModalCta?.Url?.length > 0;
                return genericText && genericUrl;
            },

            hasGenericImage() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.ModalImage?.Url?.length > 0;
            },

            hasProduct() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.Title?.length > 0;
            },

            hasProductSku() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.Sku?.length > 0;
            },

            hasProductTitle() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.Title?.length > 0;
            },

            hasProductImage() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.Image?.Url?.length > 0;
            },

            hasAnyImage() {
                return (this.hasProductSku && this.hasProductImage) || this.hasGenericImage;
            },

            hasNextVideo() {
                return this.watchedStep?.NextVideo?.VirtualVideo?.Hls?.length;
            },

            hasProductOrGenericCta() {
                return this.hasProductSku || this.hasGenericCta;
            },

            productHasConfig() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.HasConfiguration;
            },

            productSkuComp() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.Sku;
            },

            productFamilyComp() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.FamilyId;
            },

            productTitle() {
                return this.watchedStep?.CurrentVideo?.LearnToEarn?.Metadata?.Product?.Title;
            },

            showProduct() {
                return this.hasProductSku && this.hasProductImage;
            }
        },

        watch: {
            currentVideoId(val) {
                eventBus.$emit('lte-completion', val);
            },

            loading(val) {
                if(!val) this.hideModal();
            },

            watchedStep(val) {
                if(val.Lsd) {
                    eventBus.$emit('updateLsd', true);
                }
            }
        },

        mounted() {
            this.resetWatchedStep();
            // All flow is completed.
            // Set video as watched and set modal as possible to close.
            this.$emit('updateStore');
            this.$emit('closeModal');
            eventBus.$emit('canCloseModal', true);
            if(this.isWatchedLocal && !this.hasResetLocal) this.isReplayLocal = true;
        },

        created() {
            // Get initial static data from props
            this.isWatchedLocal = this.$options?.propsData?.isWatched;
            this.hasResetLocal = this.$options?.propsData?.hasReset;
        },

        methods: {
            ...mapActions('lteVideos', ['resetWatchedStep']),

            checkLocalization(key, parent) {
                if(key && parent) {
                    return (!this.localization[parent][key]) ? this.localizationDefault[parent][key] : this.localization[parent][key];
                } else {
                    return (!this.localization[key]) ? this.localizationDefault[key] : this.localization[key];
                }
            },

            customAriaLabel(text, product) {
                if(text && product) {
                    return text.replace('{0}', product);
                }
            },

            nextVideo() {
                const nextVideoId = this.watchedStep?.NextVideo?.LearnToEarn?.Metadata?.MetadataItemId;
                const nextVideoData = this.watchedStep?.NextVideo?.VirtualVideo;
                const nextVideoLte = this.watchedStep?.NextVideo?.LearnToEarn;

                this.$emit('nextVideo', {nvId: nextVideoId, nvData: nextVideoData, nvLte: nextVideoLte});
            },

            hideModal() {
                this.$modal.hide();
            },

            replayVideo() {
                this.$emit('replayVideo');
            }
        }
    };
</script>

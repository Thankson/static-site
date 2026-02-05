<template>
    <div class="m-shelfConfirm -list" :class="{'-isCn' : isCn}">
        <h2 id="global-shelf-heading" class="m-shelfConfirm__heading -hasIcon">
            <span aria-hidden="true" class="a-icon o-shelfCart__icon material-icons -md">check</span>
            <span role="text">{{ title }}</span>
        </h2>

        <h3 class="m-shelfConfirm__title">
            {{ listName }}
        </h3>

        <div
            v-if="item"
            class="m-shelfConfirm__summary">

            <div
                v-if="image"
                class="m-shelfConfirm__imgWrapper">

                <img
                    class="m-shelfConfirm__img"
                    :src="image"
                    :alt="item.Title" />
            </div>

            <div class="m-shelfConfirm__product">
                <component
                    :is="item.PdpUrl || item.Url ? 'a' : 'p'"
                    id="shelfListProductName"
                    :href="item.PdpUrl || item.Url || false"
                    class="m-shelfConfirm__link"
                    :class="!item.PdpUrl && !item.Url ? 'no-underline text-black' : ''"
                    v-html="item.Title" />

                <ul class="m-shelfConfirm__list" aria-labelledby="shelfListProductName">
                    <li class="m-shelfConfirm__item">
                        {{ getLabels(localization, 'Labels.ItemPrice', 'Item Price') }}: <span class="font-bold text-gray-150">{{ price }}</span>
                    </li>
                    <li v-if="originalPricePerUnit && originalPricePerUnitMeasurementType">
                        <PricePerUnit
                            :price="originalPricePerUnit"
                            :unit="originalPricePerUnitMeasurementType"
                            :tailwind-mods="'text-xs text-gray'"
                        />
                    </li>
                    <li v-if="concentratedPricePerUnit && concentratedPricePerUnitMeasurementType">
                        <PricePerUnit
                            :label="getLabels(localization, 'Labels.Concentrated')"
                            :price="concentratedPricePerUnit"
                            :unit="concentratedPricePerUnitMeasurementType"
                            :tailwind-mods="'text-xs text-gray'"
                        />
                    </li>
                    <li v-if="dilutedPricePerUnit && dilutedPricePerUnitMeasurementType">
                        <PricePerUnit
                            :label="getLabels(localization, 'Labels.Diluted')"
                            :price="dilutedPricePerUnit"
                            :unit="dilutedPricePerUnitMeasurementType"
                            :tailwind-mods="'text-xs text-gray'"
                        />
                    </li>
                    <li v-if="viewPoints" class="m-shelfConfirm__item">
                        {{ getLabels(localization, 'Labels.Points', 'Points') }}: <span class="font-bold text-gray-150">{{ points }}</span>
                    </li>
                </ul>
                <o-shelf-configurator-add-list
                    v-if="options.length"
                    ref="shelf-configurator"
                    class="a-button justify-center -shelfToggle -white mt-10 md:mt-5 text-xs px-15 py-8"
                    :script-id="scriptIdConfigurator"
                    :is-edit="true"
                    :list-id="listId"
                    :list-name="listName"
                    :list-labels="localization"
                    :family-id="productFamilyId"
                    :sku="product.Sku"
                    :title="getLabels(localization, 'Labels.EditToList', 'Your Choices')"
                    :pre-selected-configurations="preSelectedConfigurations">

                    {{ getLabels(localization, 'Labels.Edit', 'Edit') }}
                </o-shelf-configurator-add-list>
            </div>
        </div>

        <div class="m-shelfConfirm__actions -mx-5 pt-20">
            <a
                :href="viewListLink"
                class="a-button -center flex-1 mx-5 -white font-medium py-10 text-base">

                {{ getLabels(localization, 'Labels.ViewList', 'View List') }}
            </a>

            <button
                class="a-button -center flex-1 mx-5 font-medium py-10 text-base"
                @click="closeShelf()">

                {{ getLabels(localization, 'Labels.KeepShopping', 'Keep Shopping') }}
            </button>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import eventBus from '../../../mixins/event-bus';
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'MShelfConfirmList',
        components: { PricePerUnit },
        mixins: [ labels ],
        props: {
            listId: {
                type: [Number, String],
                default: null
            },
            listName: {
                type: String,
                default: null
            },
            localization: {
                type: Object,
                default: () => {}
            },
            options: {
                type: Array,
                default: () => []
            },
            preSelectedConfigurations: {
                type: Array,
                default: () => []
            },
            product: {
                type: Object,
                default: () => {}
            },
            price: {
                type: String,
                default: null
            },
            points: {
                type: String,
                default: null
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            showPreferredPricing: {
                type: Boolean,
                default: false
            },
            viewPoints: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState('shoppingLists', ['storedItemConfirmation', 'isEdit']),

            item() {
                return this.storedItemConfirmation || this.product;
            },
            title() {
                if(this.isEdit) {
                    return this.localization?.Labels?.UpdatedList || 'List Updated';
                }
                return this.localization?.Labels?.AddedToList || 'Added to list';
            },
            image() {
                const facets = this.item?.FacetRefiners;
                let image = this.item?.Image?.Url;

                if(this.options && this.options.length && facets) {
                    this.options.map(option => {
                        if(option.Choices && option.Choices.length) {
                            option.Choices.map(choice => {
                                if(facets.includes(choice.FacetRefinerId) && choice.ShelfImage) {
                                    image = choice.ShelfImage;
                                }
                            });
                        }
                    });
                }

                return image;
            },
            concentratedPricePerUnit() {
                return this.showPreferredPricing
                    ? this.product?.PriceRange?.ConcentratedPreferredPricePerUnit
                    : this.product?.PriceRange?.ConcentratedRegularPricePerUnit;
            },
            concentratedPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.ConcentratedPPUMeasurementType || null;
            },
            dilutedPricePerUnit() {
                return this.showPreferredPricing
                    ? this.product?.PriceRange?.DilutedPreferredPricePerUnit
                    : this.product?.PriceRange?.DilutedRegularPricePerUnit;
            },
            dilutedPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.DilutedPPUMeasurementType || null;
            },
            originalPricePerUnit() {
                return this.showPreferredPricing
                    ? this.product?.PriceRange?.OriginalPreferredPricePerUnit
                    : this.product?.PriceRange?.OriginalRegularPricePerUnit;
            },
            originalPricePerUnitMeasurementType() {
                return this.product?.PriceRange?.OriginalPPUMeasurementType || null;
            },
            productFamilyId() {
                return this.item?.FamilyId || this.item?.FamilyID || this.item?.FamilyInfo?.Id;
            },
            viewListLink() {
                let link = '/';

                if(this.localization?.Data?.ListsPage?.Url) {
                    link = this.localization.Data.ListsPage.Url + '?listId=' + this.listId;
                }

                return link;
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        mounted() {
            this.$nextTick(() => {
                // ToDo: needs to be refactored when moving to Vue3. We would want to use a provide/inject here.
                eventBus.$emit('add-to-list-successful', this.product.Sku);
            });
        },
        methods: {
            closeShelf() {
                this.$shelf.hide();
            }
        }
    };
</script>

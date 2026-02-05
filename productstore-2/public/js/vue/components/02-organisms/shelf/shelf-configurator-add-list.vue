<template>
    <button type="button" :tabindex="tabIndex" @click="[getData(), gtmTrackAction({id: 215}, $event)]">
        <slot />
        <shelf :script-id="scriptId">
            <template v-slot:default>
                <div class="o-shelfList">
                    <a-loading-spinner
                        id="global-shelf-heading"
                        :visible="loading || storedApiLoading || (!needsConfigurations && oneStepEligible && !isEdit)" />

                    <o-product-configurator
                        v-if="Object.keys(data).length > 0"
                        :class="{'hidden': loading || storedApiLoading || (!needsConfigurations && oneStepEligible && !isEdit)}"
                        :data="data"
                        :is-cart="false"
                        :is-pdp="false"
                        :is-add-list="true"
                        :list-id="listId"
                        :list-name="listName"
                        :one-step="oneStep"
                        :pre-selected-sku="preSelectedSku"
                        :pre-selected-configurations="preSelectedConfigurations"
                        :script-id-configurator="scriptId"
                        :services-success="servicesSuccess"
                        :labels="labels">

                        <template v-slot:before="$configurator">
                            <h2 id="global-shelf-heading" class="o-shelfList__heading" :class="{'-isCn' : isCn}">
                                {{ title }}<span>:</span>
                            </h2>

                            <p class="o-shelfList__listName" :class="{'-isCn' : isCn}">{{ listName }}</p>

                            <p class="o-shelfList__options" :class="{'-isCn' : isCn}">{{ $configurator.labels.YourChoice }}</p>
                            <p class="o-shelfList__desc">
                                <span v-if="!isCn" class="o-shelfList__for">{{ $configurator.labels.For }}</span>
                                <component
                                    :is="$configurator.pdpLink ? 'a' : 'span'"
                                    :href="$configurator.pdpLink || false"
                                    class="o-shelfList__link"
                                    :class="!$configurator.pdpLink ? 'no-underline text-black' : ''">

                                    {{ $configurator.title }}
                                </component>
                            </p>
                            <div class="m-productInfo">
                                <div class="m-productInfo__wrapper">
                                    <p class="m-productInfo__price">
                                        <template v-if="viewMemberPricing">
                                            {{ $configurator.preferredPrice }}
                                        </template>
                                        <template v-else>
                                            {{ $configurator.regularPrice }}
                                        </template>
                                    </p>
                                    <p v-if="viewPoints" class="m-productInfo__points">
                                        {{ $configurator.labels.Points }}: <span class="m-productInfo__accent">{{ $configurator.points }}</span>
                                    </p>
                                </div>
                                <div v-if="viewMemberPricing">
                                    <PricePerUnit
                                        v-if="$configurator.originalPreferredPricePerUnit &&
                                            $configurator.originalPricePerUnitMeasurementType"
                                        :price="$configurator.originalPreferredPricePerUnit"
                                        :unit="$configurator.originalPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.concentratedPreferredPricePerUnit &&
                                            $configurator.concentratedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Concentrated')"
                                        :price="$configurator.concentratedPreferredPricePerUnit"
                                        :unit="$configurator.concentratedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.dilutedPreferredPricePerUnit &&
                                            $configurator.dilutedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Diluted')"
                                        :price="$configurator.dilutedPreferredPricePerUnit"
                                        :unit="$configurator.dilutedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                </div>
                                <div v-if="!viewMemberPricing">
                                    <PricePerUnit
                                        v-if="$configurator.originalRegularPricePerUnit &&
                                            $configurator.originalPricePerUnitMeasurementType"
                                        :price="$configurator.originalRegularPricePerUnit"
                                        :unit="$configurator.originalPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.concentratedRegularPricePerUnit &&
                                            $configurator.concentratedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Concentrated')"
                                        :price="$configurator.concentratedRegularPricePerUnit"
                                        :unit="$configurator.concentratedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                    <PricePerUnit
                                        v-if="$configurator.dilutedRegularPricePerUnit &&
                                            $configurator.dilutedPricePerUnitMeasurementType"
                                        :label="getLocalizationProp('Labels.Configurator.Diluted')"
                                        :price="$configurator.dilutedRegularPricePerUnit"
                                        :unit="$configurator.dilutedPricePerUnitMeasurementType"
                                        :tailwind-mods="'text-xs text-gray'"
                                    />
                                </div>
                            </div>
                        </template>
                    </o-product-configurator>
                    <m-error-card
                        v-if="hasShelfApiErrored"
                        mods="mt-50"
                        :reload-text="getLocalizationProp('Labels.RefreshPage')"
                        :text="getLocalizationProp('Labels.GenericFailureMessage')"
                    ></m-error-card>
                </div>
            </template>
        </shelf>

        <!-- Modal - Item Already In List -->
        <m-shoplists-already-in-list-modal
            v-if="activeList > -1 && activeList === listId"
            :ref="modalId"
            :list="{listId: listId, listName: listName}"
            :localization="listLabels"
            :modal-id="modalId">
        </m-shoplists-already-in-list-modal>
    </button>
</template>

<script>
    import { mapMutations, mapState } from 'vuex';
    import api from '@api/routes/shelf';
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import shoplistsModalMixin from '../../../mixins/shopping-lists-modal';
    import PricePerUnit from '@productstore/source/js/vue/components/00-atoms/price-per-unit/price-per-unit.vue';

    export default {
        name: 'OShelfConfiguratorAddList',
        components: { PricePerUnit },
        mixins: [ localizationMixin, shoplistsModalMixin ],
        props: {
            sku: {
                type: String,
                default: null
            },
            familyId: {
                type: [Number, String],
                default: null
            },
            isEdit: {
                type: Boolean,
                default: false
            },
            listId: {
                type: [Number, String],
                default: null
            },
            listName: {
                type: String,
                default: null
            },
            listLabels: {
                type: Object,
                default: () => {}
            },
            preSelectedSku: {
                type: String,
                default: null
            },
            /** @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration */
            /** @type {Array<Configuration>} */
            preSelectedConfigurations: {
                type: Array,
                default: () => []
            },
            scriptId: {
                type: String,
                default: 'data-shelf-configurator-localization'
            },
            tabIndex: {
                type: Number,
                default: 0
            },
            title: {
                type: String,
                default: 'Add to List'
            },
            /**
             * Temporary testing prop to control response object
             */
            ...(process.env.MOCK_SERVER && {
                configurator: {
                    type: String,
                    default: '2'
                }
            })
        },
        data() {
            return {
                activeList: null,
                data: {},
                hasShelfApiErrored: false,
                loading: false,
                oneStep: {},
                servicesSuccess: true,
                modalId: 'modal-item-already-in-list'
            };
        },
        computed: {
            ...mapState('shoppingLists', [ 'storedApiLoading', 'oneStepEligible', 'needsConfigurations' ]),
            isCn() {
                return this.$env?.IsCn || false;
            },
            labels() {
                let obj = this.localization?.Labels?.Configurator || {};

                if(obj && this.listLabels) {
                    obj.ShoppingLists = this.listLabels;
                }

                return obj;
            },
            viewPoints() {
                return this.data.UserFlags?.ViewPoints || false;
            },
            viewMemberPricing() {
                return this.data.UserFlags?.ViewMemberPricing || false;
            }
        },
        methods: {
            ...mapMutations('shoppingLists', ['SET_IS_ONE_STEP_ELIGIBLE', 'SET_IS_EDIT']),
            async getData() {
                // Set active list
                this.activeList = this.listId;
                // Close add to list popup
                this.$emit('hide');

                // Close modal
                this.closeModal(this.modalId);

                // Hide Shelf Confirmation
                this.$store.commit('shoppingLists/SET_SHOW_CONFIRMATION', false);
                this.SET_IS_ONE_STEP_ELIGIBLE(false);

                // Get data
                if(!this.loading) {
                    this.loading = true;

                    // Verify if the item is already in the list
                    const alreadyInList = this.isEdit ? false : await this.verifyAlreadyInList(this.listId, this.sku);

                    // If the item is NOT in the list, then gets the shelf data
                    if(!alreadyInList) {
                        // Show Shelf only if the item is not in the list
                        this.$shelf.show();
                        this.$emit('show');

                        // Get shelf data
                        const response = await api.query({
                            Sku: this.sku,
                            FamilyId: this.familyId,
                            ...(process.env.MOCK_SERVER && { configurator: this.configurator }) // only for testing purposes
                        });

                        if(response.success && response.data) {
                            this.data = response.data.Data;
                            this.oneStep = this.data.OneStep;
                            this.SET_IS_EDIT(this.isEdit);
                            this.SET_IS_ONE_STEP_ELIGIBLE(this.oneStep?.IsEligible);
                        } else {
                            this.hasShelfApiErrored = true;
                            this.servicesSuccess = false;
                        }
                        this.loading = false;
                    } else {
                        // Page is loaded
                        this.loading = false;

                        // Open Modal
                        this.openModal(this.modalId);

                        // Close Shelf
                        this.$shelf.hide();
                    }
                }
            }
        }
    };
</script>

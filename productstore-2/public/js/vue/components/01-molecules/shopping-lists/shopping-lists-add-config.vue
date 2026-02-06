<template>
    <div class="m-shoplistsAddConfig">

        <div class="m-shoplistsAddConfig__btn">
            <v-button
                :disabled="disabled"
                class="h-full w-full justify-center text-base py-12"
                :class="disabled ? 'font-normal' : 'font-medium'"
                v-on="!showLoading ? { click: submitItemToList } : null">

                {{ buttonLabel }}
            </v-button>

            <div role="alert">
                <a-loading-spinner :visible="submitted && showLoading" size="sm" />
            </div>

            <!-- Modal - Item Already In List -->
            <m-shoplists-already-in-list-modal
                :ref="modalId"
                :list="{listId: listId, listName: listName}"
                :localization="localization.ShoppingLists"
                :modal-id="modalId">
            </m-shoplists-already-in-list-modal>
        </div>

        <div class="m-shoplistsAddConfig__error" role="alert">
            <p v-if="storedHasApiError && listErrors" class="block">
                <span
                    class="block"
                    role="text"
                    v-html="listErrors" />
            </p>
        </div>

        <shelf>
            <template v-slot:default>
                <m-shelf-confirm-list
                    v-if="storedShowConfirmation"
                    :list-id="listId"
                    :list-name="listName"
                    :localization="localization.ShoppingLists"
                    :script-id-configurator="scriptIdConfigurator"
                    :pre-selected-configurations="preSelectedConfigurations"
                    :product="product"
                    :options="options"
                    :price="price"
                    :points="points"
                    :show-preferred-pricing="showPreferredPricing"
                    :view-points="viewPoints"
                />
            </template>
        </shelf>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import shoplistsModalMixin from '../../../mixins/shopping-lists-modal';

    export default {
        name: 'MShoplistsAddConfig',
        mixins: [ shoplistsModalMixin ],
        props: {
            /** @typedef {{ FeatureSku: string, SelectedSku: string }} Configuration */
            /** @type {Array<Configuration>} */
            configurations: {
                type: Array,
                default: null
            },
            /** @type {Array<string>} */
            configurationErrors: {
                type: Array,
                default: () => []
            },
            configurationIsValid: {
                type: Boolean,
                default: true
            },
            familyId: {
                type: String,
                default: null
            },
            sku: {
                type: String,
                default: null
            },
            isOffsale: {
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
        data() {
            return {
                submitted: false,
                oldSku: null,
                modalId: 'modal-item-already-in-list'
            };
        },
        computed: {
            ...mapState('shoppingLists', [ 'storedHasApiError', 'storedShowConfirmation', 'storedApiLoading', 'storedApiError', 'oneStepEligible', 'isEdit' ]),

            buttonLabel() {
                if(this.isEdit) {
                    return this.localization?.ShoppingLists?.Labels?.UpdateList || 'Update List';
                }
                return this.localization?.ShoppingLists?.Labels?.AddToList || 'Add to list';
            },
            disabled() {
                return this.showLoading;
            },
            listErrors() {
                const errors = [
                    ...this.configurationErrors,
                    ...this.storedApiError
                ];

                return errors.length > 0 ? errors.join('<br />') : '';
            },
            showLoading() {
                // Get API status
                return this.storedApiLoading;
            }
        },
        watch: {
            listErrors() {
                if(this.listErrors) {
                    this.SET_NEEDS_CONFIGURATIONS(this.listErrors);
                }
            },
            storedShowConfirmation() {
                if(this.storedShowConfirmation) {
                    this.$shelf.show();
                }
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.checkOneStep();
                if(this.isEdit) {
                    this.oldSku = this.sku;
                }
            });
        },
        methods: {
            ...mapActions('shoppingLists', ['addToList', 'removeFromList']),
            ...mapMutations('shoppingLists', ['SET_API_ERROR', 'SET_NEEDS_CONFIGURATIONS']),

            checkOneStep() {
                if(this.oneStepEligible && !this.isEdit) {
                    this.submitItemToList();
                }
            },
            async removeItem(sku) {
                // Remove product from list
                await this.removeFromList({
                    payload: {
                        ListId: this.listId,
                        Sku: sku
                    }
                });

                // Decrease items count in the list
                this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                    listId: this.listId,
                    decrease: true
                });
            },
            async submitItemToList() {
                this.submitted = true;

                // If there's a valid SKU
                if(this.sku && this.configurationIsValid) {
                    // Close modal
                    this.closeModal(this.modalId);

                    if(this.isEdit) {
                        await this.removeItem(this.oldSku);
                    }

                    // Verify if the item is already in the list
                    const alreadyInList = await this.verifyAlreadyInList(this.listId, this.sku, true);

                    if(!alreadyInList) {
                        // ADD to list
                        await this.addToList({
                            listId: this.listId,
                            payload: {
                                Sku: this.sku,
                                Configurations: this.configurations // "Configurations": [ {FeatureSku: "123", "SelectedSku": "235} ]
                            }
                        });

                        // Increase items count in the list
                        this.$store.commit('shoppingLists/SET_ITEMS_COUNT', {
                            listId: this.listId,
                            increase: true
                        });
                    } else {
                        // Hide Shelf
                        this.$shelf.hide();

                        // Open Modal
                        this.openModal(this.modalId);
                    }
                } else {
                    this.SET_API_ERROR();
                    this.$emit('submitError');
                }
            }
        }
    };
</script>

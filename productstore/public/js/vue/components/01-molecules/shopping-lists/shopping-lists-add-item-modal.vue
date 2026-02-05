<template>
    <modal :id="modalId" :width="viewportWidth < 768 ? '304px' : '460px'">
        <div :id="modalWrapper" ref="add-item-to-list" class="m-shoplistsAddItemModal">
            <!-- Show loading while is adding items to Cart -->
            <div v-if="loading" class="m-shoplistsAddItemModal__loading">
                <a-loading-spinner :visible="true" aria-hidden="true" />
            </div>

            <!-- Modal Title -->
            <h2
                id="global-modal-heading"
                class="m-shoplistsAddItemModal__title">
                {{ modalTitle }}:
            </h2>

            <!-- Customer Lists -->
            <div class="m-shoplistsAddItemModal__list">
                <perfect-scrollbar>
                    <div v-for="(list, index) in customerLists" :key="index" class="m-shoplistsAddItemModal__item">
                        <button class="m-shoplistsAddItemModal__button" @click="submitItemsToList(list)">
                            {{ list.ListName }}
                        </button>
                    </div>
                </perfect-scrollbar>
            </div>

            <!-- Create new list form -->
            <m-shoplists-create
                ref="form-create-list"
                :lists="allLists"
                :localization="localization"
                form-mods="px-0">
            </m-shoplists-create>
        </div>
    </modal>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import eventBus from '../../../mixins/event-bus';

    export default {
        name: 'MShoplistsAddItemModal',
        mixins: [ safeId ],
        safeIds: [
            'modalWrapper'
        ],
        props: {
            items: {
                type: Array,
                default() {
                    return [];
                }
            },
            modalId: {
                type: String,
                default: 'add-to-list-modal'
            }
        },
        data() {
            return {
                viewportWidth: 0,
                loading: false,
                modalWrapper: ''
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedLists', 'storedLocalizationLists']),

            allLists() {
                return this.storedLists;
            },
            customerLists() {
                // Get customer lists
                return this.storedLists.filter(list => list.ListType === 'CustomerList' || list.ListType === 'SaveForLater');
            },
            localization() {
                return this.storedLocalizationLists;
            },
            modalTitle() {
                return this.localization?.Labels?.AddToList || 'Add to List';
            }
        },
        watch: {
            storedLists: {
                deep: true,
                handler() {
                    if(this.storedLists && this.storedLists.length) {
                        // Necessary to fix modal reactivity problem
                        this.updateModal();
                    }
                }
            }
        },
        created() {
            // Viewport
            this.setViewport();

            // Create resize listener
            window.addEventListener('resize', this.resize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.resize);
        },
        mounted() {
            this.$modal.$on.hidden(() => {
                this.$emit('adding-list-hide', true);

                // Clear API error when the modal is closed
                this.$store.commit('shoppingLists/SET_API_ERROR', []);
            });
        },
        methods: {
            ...mapActions('shoppingLists', ['addItemsToList']),

            open(modalId) {
                this.$modal.show({ id: modalId });

                // Update perfect scroll component
                this.$nextTick(() => {
                    if(this.customerLists && this.customerLists.length) {
                        this.updateScroll();
                    }
                });

                // Reset creation form
                eventBus.$emit('reset-form');
            },
            close(modalId) {
                this.$modal.hide({ id: modalId });
            },
            resize() {
                this.setViewport();
            },
            setViewport() {
                this.viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            },
            async submitItemsToList(list) {
                this.loading = true;
                this.updateModal();
                let items = [];

                // Prepare payload
                if(this.items && this.items.length) {
                    await this.items.forEach(item => {
                        items.push({
                            Sku: item.Sku,
                            Quantity: 1,
                            Configurations: item.Configurations || item.ConfigurationSkus
                        });
                    });

                    // Add items to list
                    await this.addItemsToList({
                        listId: list.ListId,
                        payload: items
                    });

                    this.$emit('items-added', list);

                    this.close(this.modalId);
                }
            },
            updateModal() {
                // Necessary to fix modal reactivity problem
                this.close(this.modalId);
                this.$nextTick(() => {
                    this.open(this.modalId);
                });
            },
            updateScroll() {
                const scrollInterval = setInterval(() => {
                    const wrapper = document.querySelector('#' + this.modalWrapper);
                    if(wrapper && typeof wrapper.querySelector === 'function') {
                        const scroll = wrapper.querySelector('.m-shoplistsAddItemModal__list .ps');
                        if(scroll) {
                            clearInterval(scrollInterval);
                            if(scroll.offsetHeight >= 150) {
                                scroll.classList.add('ps--active-y');
                                scroll.scrollTo(0, 1);
                            }
                        }
                    }
                });
            }
        }
    };
</script>

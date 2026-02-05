<template>
    <div class="m-popUpFav">
        <button
            class="mr-24 text-base text-white border-none"
            :close-aria-label="buttonAriaLabel"
            :aria-pressed="isVisible ? 'true' : 'false'"
            @click.stop.prevent="togglePopUp('favorites', { id: 111, eL: 'Favorites' })"
        >
            {{ getLocalizationProp('Labels.Favorites', 'Favorites') }}
            <arrow
                direction="-down"
                size="-sm"
                tailwind-color="white"
                other-mods="ml-5"
            ></arrow>
        </button>
        <popup
            ref="favorites"
            mods="right-0 top-40"
            arrow-mods="-filled -shadow absolute -top-13 right-18"
            :close-alt="closePopupAlt"
            :header-title="getLocalizationProp('Labels.Favorites', 'Favorites')"
            :header-visible="true"
            :footer-visible="false"
            mod-content="m-popUpFav__content"
            body-mods="pl-20 pr-3 pb-20 pt-8"
            v-on:visibility="checkVisibility"
        >
            <!-- Needed to add another variable as storedApiLoading is also used
            in other instances like when removing an item from the list -->
            <div v-if="storedApiLoading && loading" class="block">
                <a-loading-spinner :visible="true" size="sm" />
            </div>
            <!-- Only loads content div after isLoaded-->
            <perfect-scrollbar v-else-if="storedListItems.length > 0" ref="scroll">
                <ul class="m-popUpFav__list">
                    <!-- favorite loop -->
                    <li
                        v-for="favorite in storedListItems"
                        :key="favorite.Sku"
                    >
                        <m-favorite-list-item
                            :favorite="favorite"
                            :labels="getLocalizationProp('Labels', {})"
                            :script-id-configurator="scriptIdConfigurator"
                            @close-popup="$refs['favorites'].shouldClose()"
                        ></m-favorite-list-item>
                    </li>
                </ul>
            </perfect-scrollbar>

            <!-- No Favorites -->
            <template v-else>
                <p class="text-gray-120 text-sm" v-html="getLocalizationProp('Data.NoFavorites', 'Not sure where to start? Try our most popular products.')"> </p>
            </template>
        </popup>
    </div>
</template>

<script>
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import { mapState, mapActions } from 'vuex';
    import localization from '@common/source/js/vue/mixins/localization';
    import envSoldOut from '../../../mixins/env';
    import MFavoriteListItem from '../favorites/favorite-list-item.vue';

    export default {
        name: 'PopupFavs',
        components: {
            'm-favorite-list-item': MFavoriteListItem
        },

        mixins: [ togglePopUpMixin, localization, envSoldOut ],

        props: {
            buttonAriaLabel: {
                type: String,
                default: ''
            },
            closePopupAlt: {
                type: String,
                default: ''
            },
            scriptIdConfigurator: {
                type: String,
                default: 'data-shelf-configurator-localization'
            }
        },

        data: function() {
            return {
                isVisible: false,
                data: {},
                title: '',
                packInfo: [],
                listType: 'riverbendfavorite',
                loading: false
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedApiLoading', 'storedListItems'])
        },
        methods: {
            ...mapActions('shoppingLists', ['getListItems']),
            checkVisibility: async function(val) {
                this.isVisible = val;
                if(val) {
                    this.loading = true;
                    await this.getListItems({
                        payload: {
                            ListType: this.listType,
                            isShelf: false,
                            checkInventory: true
                        }
                    });
                    this.loading = false;
                }
            }
        }
    };
</script>

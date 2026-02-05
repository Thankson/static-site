<template>
    <section class="o-favorites">
        <h2 class="o-favorites__title">{{ getLocalizationProp('Labels.Title', 'Favorites') }}</h2>

        <div v-if="storedApiLoading && loading" class="block">
            <a-loading-spinner :visible="true" size="sm" />
        </div>
        <ul v-else-if="storedListItems.length > 0" class="m-popUpFav__list">
            <!-- favorite loop -->
            <li
                v-for="favorite in storedListItems"
                :key="favorite.Sku"
            >
                <m-favorite-list-item
                    :favorite="favorite"
                    :labels="getLocalizationProp('Labels', {})"
                    :script-id-configurator="scriptIdConfigurator"
                ></m-favorite-list-item>
            </li>
        </ul>
        <template v-else>
            <p class="text-gray-120 text-sm" v-html="getLocalizationProp('Data.NoFavorites', 'Not sure where to start? Try our most popular products.')"> </p>
        </template>
    </section>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import localization from '@common/source/js/vue/mixins/localization';
    import MFavoriteListItem from '../../01-molecules/favorites/favorite-list-item.vue';

    export default {
        name: 'OFavorites',
        components: {
            MFavoriteListItem
        },
        mixins: [ localization ],
        props: {
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
        async created () {
            await this.getFavorites();
        },
        methods: {
            ...mapActions('shoppingLists', ['getListItems']),
            getFavorites: async function() {
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

    };
</script>

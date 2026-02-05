<template>
    <div class="flex">
        <button
            class="mr-24 text-base text-white border-none text-semibold test"
            :close-aria-label="getLocalizationProp('Labels.ButtonAriaLabel')"
            :aria-pressed="visible ? 'true' : 'false'"
            v-on:click.stop.prevent="listClick()"
        >
            {{ getLocalizationProp('Labels.Button', 'Lists') }}
            <arrow
                direction="-down"
                size="-sm"
                tailwind-color="white"
                other-mods="ml-5"
            ></arrow>
        </button>
        <popup
            ref="lists"
            mods="right-0 top-40"
            arrow-mods="-filled -shadow absolute -top-13 right-18"
            :close-alt="getLocalizationProp('Labels.ClosePopup.Alt')"
            :footer-link="getLocalizationProp('Data.SeeAllListsLink', listPageUrl)"
            :footer-title="getLocalizationProp('Labels.SeeAllLists', 'See All Lists')"
            :header-title="getLocalizationProp('Labels.MyLists', 'Lists')"
            :header-visible="true"
            :footer-visible="true"
            v-on:visibility="checkVisibility"
        >
            <div v-if="!isLoaded" class="block">
                <a-loading-spinner :visible="true" size="sm" />
            </div>
            <ul v-else class="py-15">
                <li v-for="(list, index) in lists" :key="index" class="pl-20 py-5 text-sm">
                    <a
                        :href="`${listPageUrl}?${listPageQuery}=${list.ListId}`"
                        class="m-popUp__link -list">
                        {{ list.ListName }}
                    </a>
                    <p
                        v-if="list.ListType !== 'PurchasedItemsList'"
                        class="text-xs italic text-gray-100">
                        {{ list.ItemCount }} {{ apiLabels.Items }}
                    </p>
                </li>
            </ul>
        </popup>
    </div>
</template>

<script>
    import togglePopUpMixin from '../../../mixins/toggle-popup';
    import localization from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/shoppinglists';

    export default {
        name: 'PopupLists',

        mixins: [ togglePopUpMixin, localization ],

        data() {
            return {
                visible: true,
                isLoaded: false,
                apiLabels: {},
                apiList: [],
                listPageQuery: 'listId',
                limit: 4
            };
        },
        computed: {
            lists() {
                let specialLists = [];
                let customerLists = [];
                let lists = [];

                // Filter lists
                for (let list of this.apiList) {
                    if(list.ListType === 'CustomerList') {
                        // Set array with CustomerList
                        customerLists.push(list);
                    } else {
                        // Set array with special lists (PurchasedItemsList, SaveForLater and SystemList)
                        specialLists.push(list);
                    }
                }

                // Calc how many CustomerList and special lists must appear
                let maxCustomer = 1; // Default: 1 customer list
                let maxSpecial = this.limit - maxCustomer; // Default: 3 special lists
                const totalSpecial = specialLists.length;
                if(totalSpecial < maxSpecial) {
                    maxCustomer = this.limit - totalSpecial;
                    maxSpecial = totalSpecial;
                }

                // Concat CustomerList and special lists
                lists = customerLists.slice(0, maxCustomer);
                lists = lists.concat(specialLists.slice(0, maxSpecial));

                // Return lists according to m
                return this.limit ? lists.slice(0, this.limit) : lists;
            },
            listPageUrl() {
                return this.localization?.Data?.SeeAllListsLink;
            }
        },
        methods: {
            checkVisibility: function(val) {
                this.visible = val;
            },

            shouldClose: function() {
                if(this.visible) {
                    this.$parent.$emit('shouldClose');
                }
            },

            async listClick() {
                this.togglePopUp('lists');
                api.setRoute('/api/shoppinglists');
                const response = await api.query({isheader: true});

                if(response.success && response.data?.Data) {
                    const payload = response.data.Data;

                    this.apiList = payload.Lists;
                    this.apiLabels = payload.Localization?.Labels;

                    this.isLoaded = true; // Remove loading spinner
                } else {
                    this.isLoaded = false; // Reactivate loading spinner
                }
            }
        }
    };
</script>

<style>
</style>

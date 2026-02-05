<template>
    <div class="m-popUpOrder">
        <button
            class="m-popUpOrder__button"
            :close-aria-label="buttonAriaLabel"
            :aria-pressed="isVisible ? 'true' : 'false'"
            data-testid="button-orders"
            v-on:click.stop.prevent="togglePopUp('orders', { id: 111, eL: 'Orders' })"
        >
            {{ label }}
            <arrow
                direction="-down"
                size="-sm"
                tailwind-color="white"
                other-mods="ml-5"
            ></arrow>
        </button>
        <popup
            ref="orders"
            mods="right-0 top-40"
            arrow-mods="-filled -shadow absolute -top-13 right-18"
            :close-alt="closePopupAlt"
            :footer-link="footerLink"
            :footer-title="footerTitle"
            :header-title="data.OrderHeaderText"
            :header-visible="true"
            :footer-visible="true"
            v-on:visibility="checkVisibility"
        >
            <div v-if="!isLoaded" class="block">
                <a-loading-spinner :visible="true" size="sm" />
            </div>
            <!-- Only loads content div after isLoaded-->
            <template v-else-if="data.HasOrders">
                <!-- Orders loop -->
                <div
                    v-for="(order, index) in orders"
                    :key="index"
                    class="m-popUpOrder__item"
                    :class="{ '-riverbend': isRiverbendOrder(order.OrderType)}"
                >
                    <!-- Pending Payment -->
                    <template v-if="order.ShowPayLink && isPendingOrder(order)">
                        {{ getDictionaryProp('PendingOrderContent', 'You have a pending order') }}
                        <div class="pt-15 pb-10">
                            <button
                                class="m-popUpOrder__button -pay"
                                data-testid="button-orders"
                                v-on:click="openPay(order)"
                            >
                                {{ getDictionaryProp('PendingOrder', 'Pay') }}
                            </button>
                        </div>
                    </template>

                    <template v-else>
                        <p v-if="order.IsBackUp" class="m-popUpOrder__info -backup">
                            {{ getDictionaryProp('BackupOrderText', 'Back Up Order:') }}
                            <br />
                            {{ order.FormattedShortOrderEntryDate }}
                        </p>

                        <template v-else-if="order.FormattedShortOrderEntryDate">
                            <p class="m-popUpOrder__info">
                                {{ getDictionaryProp('OrderPlaced', 'Order Placed:') }}
                            </p>
                            <h3
                                v-if="order.FormattedShortOrderEntryDate"
                                class="m-popUpOrder__deliverDate"
                                :class="[hideTrackingNumber && 'mb-0']"
                                v-html="order.FormattedShortOrderEntryDate"
                            />
                        </template>
                        <div v-if="showACHDelay(order)" class="m-popUpOrder__info pb-20">
                            {{ getDictionaryProp('AchDelay') }}
                        </div>
                        <p v-else-if="!hasTrackingInfo(order)" class="m-popUpOrder__info">
                            {{ getDictionaryProp('TrackingInfo', 'Tracking info will be available soon. Please check back!') }}
                        </p>

                        <template v-else>
                            <div
                                v-for="(pi, idx) in order.PackageInformation"
                                :key="idx"
                                class="m-popUpOrder__tracking"
                                :class="[hideTrackingNumber && 'mb-0']"
                            >
                                <template v-if="isPackgeInfoVisible(pi, order, idx)">
                                    <p v-if="siteHeader(order)" class="m-popUpOrder__type">
                                        {{ siteHeader(order) }}
                                    </p>
                                    <div v-if="!hideTrackingNumber">
                                        <p class="m-popUpOrder__info">
                                            {{ getDictionaryProp('TrackingNumber', 'Tracking Number') }}
                                        </p>
                                        <a
                                            v-if="isPh && useAltTracking"
                                            :href="altTrackingUrl + order.OrderNumber"
                                            target="_blank"
                                            class="m-popUpOrder__tracking -number"
                                            :class="[hideTrackingLink && '-fontNormalTextBlack']"
                                        >
                                            {{ pi.TrackingNumber }}
                                        </a>
                                        <p
                                            v-else
                                            class="m-popUpOrder__tracking -number"
                                            :class="[hideTrackingLink && '-fontNormalTextBlack']"
                                        >
                                            {{ pi.TrackingNumber }}
                                        </p>
                                    </div>
                                    <v-button
                                        v-if="!hideTrackingLink"
                                        class="m-popUpOrder__button -track"
                                        :aria-label="getDictionaryProp('Track', 'Track') + ' ' + pi.TrackingNumber"
                                        type="button"
                                        :is-anchor="useAltTracking || ''"
                                        :href="useAltTracking ? altTrackingUrl + order.OrderNumber : ''"
                                        :target="altTrackingUrl ? '_blank' : null"
                                        data-testid="button-orders"
                                        v-on:click="openPackageTracking(order, pi)"
                                    >
                                        {{ getDictionaryProp('Track', 'Track') }}
                                    </v-button>

                                    <div v-if="isCn && isPendingOrder(order)" class="pt-15 pb-10">
                                        <button
                                            class="m-popUpOrder__button -pay"
                                            data-testid="button-orders"
                                            v-on:click="openPay(order)"
                                        >
                                            {{ getDictionaryProp('PendingOrder', 'Pay') }}
                                        </button>
                                    </div>
                                </template>
                                <p v-else-if="idx === 1" class="m-popUpOrder__info">
                                    {{ getDictionaryProp('AdditionalTrackingNumber', 'You Have additional tracking number') }}
                                </p>
                            </div>
                        </template>

                        <p v-if="order.Delivered" class="m-popUpOrder__info">
                            {{ getDictionaryProp('DeliveredText', 'Your order was delivered') }}
                        </p>

                        <a
                            v-if="order.IsBackUp"
                            :href="getDictionaryProp('BackupOrderUrl', '#')"
                            class="m-popUpOrder__link">
                            {{ getDictionaryProp('BackupOrderLinkText', 'Why am I getting a Backup Order?') }}
                        </a>
                    </template>

                </div>
            </template>

            <!-- No Orders -->
            <template v-else>
                <template v-if="!data.HasOrders">
                    <p v-if="isCn" class="m-popUp__noOrderBody" v-html="data.DescriptionText"> </p>
                    <p v-else class="m-popUp__noOrderBody" v-html="dictionary.Labels.NoOrdersText"> </p>
                </template>
            </template>
        </popup>
    </div>
</template>

<script>
    import compareDates from '../../../utils/compare-dates';
    import localization from '@api/routes/localization';
    import api from '@api/routes/orderstatus';
    import togglePopUpMixin from '../../../mixins/toggle-popup';

    export default {
        name: 'PopupOrders',

        mixins: [ togglePopUpMixin ],

        props: {
            apiEndpoint: {
                type: String,
                default: ''
            },
            apiEndpointLocalization: {
                type: String,
                default: ''
            },
            buttonAriaLabel: {
                type: String,
                default: ''
            },
            closePopupAlt: {
                type: String,
                default: ''
            },
            footerLink: {
                type: String,
                default: ''
            },
            footerTitle: {
                type: String,
                default: 'Order History'
            },
            label: {
                type: String,
                default: 'Orders'
            },
            paramsPl: {
                type: Object,
                default: () => {}
            },
            payLink: {
                type: String,
                default: ''
            },
            visible: {
                type: Boolean,
                default: true
            },
            packageTrackingLink: {
                type: String,
                default: ''
            }
        },

        data: function() {
            return {
                dictionary: null,
                isVisible: false,
                limitPackInfo: 2, // How many track numbers to show
                isLoaded: false,
                data: {},
                orders: [],
                title: '',
                packInfo: [],
                useAltTracking: false,
                alternateTrackingUrl: ''
            };
        },

        computed: {
            hideTrackingLink() {
                return this.data?.HideTrackingLink || false;
            },
            hideTrackingNumber() {
                return this.data?.HideTrackingNumber || false;
            },
            isCn() {
                return this.$env?.IsCn || false;
            },
            isPh() {
                return this.$env?.Country === 'Philippines' || false;
            },
            packageInformation() {
                return this.orders.map(order => order.PackageInformation)
                    .flat()
                    .filter(pi => pi);
            }
        },
        // get fresh data every open and only on open instead of page load
        watch: {
            visible: async function(val) {
                if(val) {
                    this.getData();
                }
            }
        },
        // for patternlab and local debugging, if we start visible, getdata immediately
        async mounted() {
            if(this.apiEndpoint) {
                api.setRoute(`${this.apiEndpoint}?isheader=true`);
            }

            if(this.apiEndpointLocalization) {
                localization.setRoute(this.apiEndpointLocalization);
            }
        },
        methods: {
            getDictionaryProp(prop, defaultText) {
                return this.dictionary && this.dictionary.Labels ? this.dictionary.Labels[prop] : defaultText || '';
            },
            hasTrackingInfo(order) {
                return order.PackageInformation?.some(info => info.TrackingNumber);
            },
            isRiverbendOrder(orderType) {
                return /riverbend/i.test(orderType);
            },
            checkVisibility: function(val) {
                this.isVisible = val;
                if(val) {
                    this.getData();
                }
            },
            populatePackInfo() {
                this.orders.map((element, index) => {
                    if(element.PackageInformation) {
                        this.packInfo.push(element.PackageInformation.slice(0, this.limitPackInfo));
                    }
                });
            },
            getData() {
                Promise.all([ this.getOrders(), this.getDictionary() ]).then(([ordersSuccess, dictionarySuccess]) => (this.isLoaded = ordersSuccess && dictionarySuccess));
            },
            async getOrders() {
                const response = await api.query(this.paramsPl || {isheader: true});
                if(response.success) {
                    // Get the first two orders
                    this.data = response.data.Data;
                    this.orders = this.data && Array.isArray(this.data.Orders) ? this.data.Orders.slice(0, 2) : null;
                    this.populatePackInfo();

                    // useAltTracking is currently only for NZ
                    this.useAltTracking = this.data?.UseAlternateTrackingUrl;
                    this.altTrackingUrl = this.data?.AlternateTrackingUrl?.Url;
                }

                return response.success;
            },
            async getDictionary() {
                if(this.dictionary) {
                    return true;
                }

                const response = await localization.get('orderhistory');
                if(response.success) {
                    this.dictionary = response.data;
                }

                return response.success;
            },
            isPendingOrder(order) {
                return order.OrderStatus === 'Pending';
            },
            isPackgeInfoVisible(pi, order, piIndex) {
                if(this.orders.length < 2) {
                    if(!this.isPh && pi.TrackingNumber && piIndex < 2) {
                        return true;
                    }
                    // For Philippines: Hide tracking info for orders older than 90 days
                    if(this.isPh && pi.TrackingNumber && piIndex < 2 && order.OrderDate) {
                        return !compareDates(new Date(order.OrderDate), 90);
                    }
                    return false;
                } else {
                    if(order.HasMultiplePackages && piIndex > 0) {
                        return false;
                    } else {
                        return true;
                    }
                }
            },
            openPay(order) {
                window.open(this.payLink + '?orderId=' + order.OrderNumber);
            },
            openPackageTracking(order, pi) {
                if(this.isCn) {
                    window.location.href = this.packageTrackingLink + '?orderid=' + order.OrderNumber;
                } else if(!this.useAltTracking) {
                    window.open(pi.TrackingUrl);
                }
            },
            showACHDelay(order) {
                return order?.ShowAchDelayedShipping && order?.HasACHDelay && this.getDictionaryProp('AchDelay');
            },
            siteHeader(currentOrder) {
                // See if all of the recent orders have the same order type
                const sameOrderTypes = this.orders.every(order => order.OrderType === this.orders[0].OrderType);

                // See if at least one of the orders belongs is part of the Riverbend website
                const hasRiverbendOrder = this.orders.some(order => /riverbend/i.test(order.OrderType));

                // If the order types aren't the same and there are Riverbend orders
                if(!sameOrderTypes && hasRiverbendOrder) {
                    return /riverbend/i.test(currentOrder.OrderType)
                        ? this.getDictionaryProp('Riverbend', 'Riverbend Ranch Steaks')
                        : this.getDictionaryProp('Melaleuca', 'Melaleuca');
                }
                return null;
            }
        }
    };
</script>

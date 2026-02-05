<template>
    <div class="o-package-tracking">
        <a-loading-spinner v-if="!isLoaded" :visible="!isLoaded" />

        <div class="o-package-tracking__body">
            <div class="o-package-tracking__banner px-8 md:px-20 text-gray-150">
                <div class="flex">
                    <div class="pr-2">{{ getLocalizationProp('Labels.OrderNumber') }} </div>
                    <div class="font-bold">{{ data.OrderNumber }}</div>
                </div>
                <div class="flex">
                    <div class="pr-2">{{ getLocalizationProp('Labels.OrderDate') }} </div>
                    <div class="font-bold">{{ data.FormattedOrderDate }}</div>
                </div>
                <div class="flex justify-end md:justify-start">
                    <div class="pr-2">{{ getLocalizationProp('Labels.SendingDate') }} </div>
                    <div class="font-bold">{{ recentShipDate }}</div>
                </div>
                <div v-if="!hideNumberOfPackages" class="flex justify-end md:justify-start">
                    <div class="pr-2">{{ getLocalizationProp('Labels.PackageQuantity') }} </div>
                    <div class="font-bold">{{ packageInfo.length }}</div>
                </div>
            </div>
            <div v-if="showNoRecordTemplate" class="o-package-tracking__noRecord">
                <div v-if="trackNumber" class="o-package-tracking__trackNumber">
                    {{ getLocalizationProp('Labels.SFExpress') }} {{ trackNumber }}
                </div>
                <p class="pl-60 pt-20">{{ getLocalizationProp('Labels.NoRecord') }}</p>
            </div>
            <div v-else>
                <div v-for="(packageTrack, index) in packageTrackArray" :key="index" class="o-package-tracking__packinfo">
                    <o-timeline
                        :hide-number-of-packages="hideNumberOfPackages"
                        :pack-track="packageTrack"
                        :timeline-index="index"
                        :labels="getLocalizationProp('Labels', {})"
                    >
                    </o-timeline>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import api from '@api/routes/receipt';
    import apiTrack from '@api/routes/ordertrack';

    export default {
        name: 'OPackageTrackingCn',
        mixins: [ localizationMixin ],
        data() {
            return {
                isLoaded: false,
                urlParams: null,
                data: {},
                packageInfo: [],
                packageTrackArray: [],
                trackNumber: ''
            };
        },
        computed: {
            // To hide number of packages and numbering on the Timeline
            hideNumberOfPackages() {
                return this.getLocalizationProp('Data.HideNumberOfPackages');
            },
            isCn() {
                return this.$env.IsCn || false;
            },
            recentShipDate() {
                return this.packageInfoSortByShipDate()?.FormattedShipDate;
            },
            showNoRecordTemplate() {
                if(this.isCn) return false; // NA for China
                return this.isLoaded && this.packageTrackArray.length === 0;
            }
        },
        mounted() {
            this.urlParams = new URLSearchParams(window.location.search);
            if(!this.isLoaded) this.getData();
        },
        methods: {
            getData: async function() {
                const orderId = this.getUrlParam('orderId') || this.getLocalizationProp('Data.OrderId');
                if(orderId) {
                    api.setRoute(`/api/receipt/${orderId}`);
                }
                const response = await api.get();
                if(response.success) {
                    this.data = response.data?.Data;
                    this.packageInfo = response.data?.Data?.PackageInformation;

                    const carrier = this.getLocalizationProp('Data.TrackCarrier', 'ShunFengChina');
                    const trackNumbers = this.packageInfo.map((pack) => {
                        if(pack.Carrier === carrier) {
                            return pack.TrackingNumber;
                        }
                    });

                    if(trackNumbers.length > 0) {
                        let url = `?${this.getLocalizationProp('Data.TrackCarrierQueryString', 'carrier')}=${carrier}`;
                        trackNumbers.filter((trackNumber) => {
                            this.trackNumber = trackNumber; // Only applicable for no records, Store single tracking number for display when hideNumberOfPackages is true
                            url += `&${this.getLocalizationProp('Data.TrackNumberQueryString', 'trackNumber')}=${trackNumber}`;
                        });

                        const trackResponse = await apiTrack.get(url);
                        if(trackResponse.success) {
                            this.packageTrackArray = trackResponse.data?.Data?.ParcelTrackings;
                            this.isLoaded = true;
                        }
                    } else {
                        this.isLoaded = true;
                    }
                }
            },
            getUrlParam: function(param) {
                return this.urlParams.get(param);
            },
            packageInfoSortByShipDate() {
                return this.packageInfo.length > 0 ? this.packageInfo.sort((a, b) => { return new Date(b.ShipDate) - new Date(a.ShipDate); })[0] : [];
            }
        }
    };
</script>

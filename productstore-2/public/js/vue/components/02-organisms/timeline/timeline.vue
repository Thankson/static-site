<template>
    <div class="o-timeline">
        <div class="o-timeline__header">
            <div v-if="!hideNumberOfPackages" class="o-timeline__title">{{ labels.PackageNamePrefix }} {{ timelineIndex + 1 }}</div>
            <div class="text-xs md:text-base">{{ labels.SFExpress }} {{ packTrack.TrackingNumber }}</div>
        </div>

        <div class="o-timeline__body">
            <div v-for="(item, index) in packTrack.Routers" :key="index" class="o-timeline__item">
                <m-timeline-card
                    :item="item"
                    :labels="labels"
                    :show-connector="index + 1 !== packTrackLength"
                >
                </m-timeline-card>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'OTimeline',
        props: {
            hideNumberOfPackages: {
                type: Boolean,
                default: false
            },
            labels: {
                type: Object,
                default: () => {}
            },
            timelineIndex: {
                type: Number,
                default: 0
            },
            packTrack: {
                type: Object,
                default: () => {
                    return {
                        PackageNamePrefix: 'Package 1',
                        TrackingNumber: 'SF1881265660733',
                        Routers: [
                            {
                                Remark: 'Your express has been signed. If you have any questions, please contact the Courier (Ma Chao, tel: 15938281929). Thank you for using SF. Look forward to serving you again.',
                                FormattedAcceptTime: '2020-03-08  10:02:59'
                            },
                            {
                                Remark: 'The express is on the way of delivery to Ma Chao (Tel: 15938281929)',
                                FormattedAcceptTime: '2020-03-08  10:02:59'
                            },
                            {
                                Remark: 'Express to Shanghai',
                                FormattedAcceptTime: '2020-03-08  10:02:59'
                            }
                        ]
                    };
                }
            }
        },
        computed: {
            packTrackLength() {
                return this.packTrack.Routers.length;
            }
        }
    };
</script>

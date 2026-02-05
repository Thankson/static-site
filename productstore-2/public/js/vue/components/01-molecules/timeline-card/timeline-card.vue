<template>
    <div class="m-timeline-card">
        <div class="m-timeline-card__separator">
            <div class="m-timeline-card__circle"></div>
            <div v-if="showConnector" class="m-timeline-card__connector"></div>
        </div>
        <div class="m-timeline-card__content">
            <div class="pb-8 text-gray-120">{{ item.Remark }}</div>
            <div class="pb-16 text-gray-100">{{ item.FormattedAcceptTime }}</div>
            <hr class="pb-16 text-gray-50" />
        </div>
    </div>
</template>
<script>
    export default {
        name: 'MTimelineCard',
        props: {
            item: {
                type: Object,
                default: () => {
                    return {
                        Remark: 'Your express has been signed. If you have any questions, please contact the Courier (Ma Chao, tel: 15938281929). Thank you for using SF. Look forward to serving you again.',
                        FormattedAcceptTime: '2020-03-08  10:02:59'
                    };
                }
            },
            showConnector: {
                type: Boolean,
                default: false
            }
        }
    };
</script>

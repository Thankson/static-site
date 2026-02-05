<template>
    <div class="m-rwTracker">
        <p class="m-rwTracker__heading">Your Product Point total this month is 0</p>
        <div class="m-rwTracker__wrapper">
            <slot />

            <div v-for="(markers, m) in milestones" :key="`${m}-marks`" class="m-rwTracker__timeline bg-gray-35 p-10 flex justify-between">
                <span :class="m-rwTracker__mark [ markers.IsActive, '-marked bg-blue text-white']" class=" bg-white border text-sm rounded p-5">{{ markers.Milestone }}</span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MTrackerPl',
        props: {
            milestones: {
                type: Array,
                default: () => [
                    {
                        Milestone: '35',
                        IsActive: true
                    },
                    {
                        Milestone: '45',
                        IsActive: false
                    },
                    {
                        Milestone: '55',
                        IsActive: false
                    },
                    {
                        Milestone: '85',
                        IsActive: false
                    }]
            },
            labels: {
                type: Array,
                default: () => []
            }
        }
    };

</script>

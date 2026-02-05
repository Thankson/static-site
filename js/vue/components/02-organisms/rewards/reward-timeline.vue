<template>
    <div class="o-rwTline my-10">
        <div class="o-rwTline__wrapper rounded p-10">
            <div ref="reward-timeline" class="o-rwTline__timeline flex justify-between">
                <template v-for="(markers, m) in mileStones">
                    <span
                        v-if="!markers.HideCheckbox"
                        :key="`${m}-marks`"
                        :class="activeMileStoneIndex >= m ? ' bg-blue text-white' : 'text-gray bg-white'"
                        class="o-rwTline__mark border dotted font-bold text-sm rounded p-5">
                        {{ markers.Milestone }}
                    </span>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'ORewardTimeline',
        computed: {
            ...mapState('shippingOnUsV2', ['activeMilestone', 'souData']),
            activeMileStoneIndex() {
                return this.mileStones.findIndex(mileStone => mileStone.IsActive);
            },
            mileStones() {
                return this.souData?.Milestones;
            }
        },
        mounted() {
            const shownMileStones = this.mileStones.filter(mileStone => !mileStone.HideCheckbox);
            const percentageCompleted = this.activeMileStoneIndex < 2 || shownMileStones.length < 2 ? 0 : ((this.activeMileStoneIndex - 1) / (shownMileStones.length - 1)) * 100;
            this.$refs['reward-timeline'].style.setProperty('--completedRewards', `${percentageCompleted}%`);
        }
    };

</script>

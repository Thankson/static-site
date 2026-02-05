<template>
    <div class="a-rewardCircle">
        <div v-if="isFilled" class="a-rewardCircle__check">check</div>
    </div>
</template>

<script>
    export default {
        name: 'ARewardCircle',
        props: {
            isFilled: {
                type: Boolean,
                default: false
            }
        }
    };
</script>

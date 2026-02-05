<template>
    <div class="m-stickyToast fixed bottom-0 bg-white py-20 rounded-t-lg shadow-center z-2" :style="{width: `calc(100% - ${singleSideCuttingWidth * 2}px)`}">
        <a-loading-spinner v-if="loading" :visible="loading" />
        <div v-else>
            <slot />
            <slot name="alerts"></slot>
            <slot name="cta" />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'MStickyToast',
        props: {
            loading: {
                type: Boolean,
                default: false
            },
            singleSideCuttingWidth: {
                type: Number,
                default: 8
            }
        }
    };
</script>

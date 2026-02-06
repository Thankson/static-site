<template>
    <div ref="toastRef" class="m-stickyToast fixed bottom-0 bg-white py-20 rounded-t-lg shadow-center z-2" :style="{width: `calc(100% - ${singleSideCuttingWidth * 2}px)`}">
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
            leaveSpace: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            singleSideCuttingWidth: {
                type: Number,
                default: 8
            }
        },
        data() {
            return {
                resizeObserver: null
            };
        },
        mounted() {
            if(this.leaveSpace) {
                // The content in the slot may load asynchronously, causing the toast size to change.
                // Use ResizeObserver to dynamically monitor changes.
                this.createResizeObserver();
            }
        },
        beforeDestroy() {
            if(this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }
        },
        methods: {
            createResizeObserver() {
                const vApp = document.querySelector('#vApp');
                if(!vApp) return;

                const toast = this.$refs.toastRef;
                this.resizeObserver = new ResizeObserver(() => {
                    vApp.style.marginBottom = `${toast.offsetHeight}px`;
                });
                this.resizeObserver.observe(toast);
            }
        }
    };
</script>

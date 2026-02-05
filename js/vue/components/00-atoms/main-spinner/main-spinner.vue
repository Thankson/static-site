<template>
    <div
        class="a-mainSpinner"
        :class="!loading && 'sr-only'"
        aria-live="polite"
        aria-atomic="true"
        :aria-hidden="!loading">

        <div class="a-mainSpinner__spinner">
            <a-loading-spinner
                :sr-text="srText"
                :visible="true" />
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'AMainSpinner',
        props: {
            srText: {
                type: String,
                default: 'Loading Main Content'
            }
        },
        computed: {
            ...mapState('mainSpinner', ['loading'])
        }
    };
</script>

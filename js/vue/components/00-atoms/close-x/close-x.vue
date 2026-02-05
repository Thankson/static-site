<template>
    <button
        class="a-closeX"
        type="button"
        :aria-label="!$slots.default ? ariaLabel : false"
        @click="$emit('click', $event)">

        <a-icon size="inherit">close</a-icon>
        <span v-if="$slots.default" class="sr-only">
            <slot />
        </span>
    </button>
</template>

<script>
    export default {
        name: 'ACloseX',
        props: {
            ariaLabel: {
                type: String,
                default: 'Close'
            }
        }
    };
</script>

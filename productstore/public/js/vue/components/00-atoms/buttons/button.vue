<template>
    <component
        :is="!isAnchor ? 'button' : 'a'"
        ref="aButton"
        class="a-button"
        :aria-label="ariaLabel"
        :class="disabled ? '-disabled': ''"
        :type="!isAnchor ? type : null"
        :aria-disabled="disabled || null"
        :disabled="disabled"
        @click="$emit('click', $event)"
        @mouseenter="$emit('mouseenter', $event)"
        @mouseleave="$emit('mouseleave', $event)"
    >
        {{ cta }}
        <slot />
    </component>
</template>

<script>
    export default {
        name: 'VButton',
        props: {
            ariaLabel: {
                type: String,
                default: null
            },
            isAnchor: {
                type: Boolean,
                default: false
            },
            cta: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'button'
            },
            disabled: {
                type: Boolean,
                default: false
            }
        }
    };
</script>

<template>
    <button
        type="button"
        class="a-pill"
        :class="classes"
        :aria-disabled="disabled"
        @click="$emit('click')">

        <slot />
    </button>
</template>

<script>
    export default {
        name: 'APill',
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            selected: {
                type: Boolean,
                default: false
            },
            size: {
                type: String,
                default: ''
            }
        },
        computed: {
            classes() {
                return [
                    this.disabled ? '-disabled' : null,
                    this.selected ? '-selected' : null,
                    this.size ? `-${this.size}` : null
                ];
            }
        }
    };
</script>

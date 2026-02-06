<template>
    <div>
        <slot />
    </div>
</template>

<script>
    export default {
        name: 'ScPlaceholder',
        props: {
            slotName: {
                type: String,
                required: true
            }
        },
        created() {
            this.$parent.$emit('sc-placeholder', { slot: this.$slots.default, name: this.slotName });
        }
    };
</script>

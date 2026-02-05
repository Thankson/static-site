<template>
    <button type="button" @click="$emit('click')">
        <h2
            class="leading-base"
            :class="[
                isCollapseOpen
                    ? 'text-black text-left text-xl font-bold capitalize'
                    : 'text-green text-left text-sm font-medium uppercase'
            ]"
        >
            {{ isCollapseOpen ? openHeading : closedHeading }}
        </h2>
    </button>
</template>

<script>
    export default {
        name: 'AImeaSectionHeading',
        props: {
            closedHeading: {
                type: String,
                required: true
            },
            isCollapseOpen: {
                type: Boolean,
                required: true
            },
            openHeading: {
                type: String,
                required: true
            }
        }
    };
</script>

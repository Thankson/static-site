<template>
    <p
        class="mt-2 pr-24 leading-tight md:mt-0"
        :class="[
            isCollapseOpen
                ? 'text-black text-base not-italic md:mt-20'
                : 'text-gray text-sm italic'
        ]"
    >
        {{ subheading }}
    </p>
</template>

<script>
    export default {
        name: 'AImeaSectionSubheading',
        props: {
            isCollapseOpen: {
                type: Boolean,
                required: true
            },
            subheading: {
                type: String,
                required: true
            }
        }
    };
</script>

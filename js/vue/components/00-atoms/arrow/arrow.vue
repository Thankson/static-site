<template>

    <span :class="['a-arrow', size, direction, otherMods]" aria-hidden="true">
        <span :class="['a-arrow__icon', 'border-' + tailwindColor]"></span>
    </span>

</template>

<script>
    export default {
        name: 'Arrow',
        props: {
            direction: {
                type: String,
                default: '-right'
            },
            otherMods: {
                type: String,
                default: '-filled'
            },
            size: {
                type: String,
                default: '-lg'
            },
            tailwindColor: {
                type: String,
                default: 'black'
            }
        }
    };
</script>

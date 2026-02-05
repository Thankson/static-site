<template>
    <button
        type="button"
        class="a-imeaRemoveButton flex items-center text-green font-medium uppercase"
        :class="buttonMods"
        @click="$emit('click')"
    >
        <span class="material-icons text-xl">
            cancel
        </span>
        <span class="leading-base ml-5">
            {{ removeLabel }}
        </span>
    </button>
</template>

<script>
    export default {
        name: 'AImeaRemoveButton',
        props: {
            buttonMods: {
                type: String,
                required: true
            },
            removeLabel: {
                type: String,
                required: true
            }
        }
    };
</script>

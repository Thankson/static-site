<template>
    <div class="m-toolBox">
        <m-back-to-top :script-id="scriptId"></m-back-to-top>
        <slot name="share-button">
        </slot>
    </div>
</template>

<script>
    export default {
        name: 'MToolBox',
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        }
    };
</script>

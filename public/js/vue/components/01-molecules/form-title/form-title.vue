<template>
    <div class="m-formTitle">
        {{ title }}
    </div>
</template>

<script>
    export default {
        name: 'MFormTitle',
        props: {
            title: {
                type: String,
                default: ''
            }
        }
    };
</script>

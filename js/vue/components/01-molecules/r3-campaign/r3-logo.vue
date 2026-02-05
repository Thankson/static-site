<template>
    <div
        class="m-r3Logo"
        :class="{'-md': isMidLogo}"
    >
        <img class="m-r3Logo__img" :src="image.Url" :alt="image.Alt">
    </div>

</template>

<script>
    export default {
        name: 'MR3Logo',
        props: {
            image: {
                type: Object,
                default: () => ({
                    'Url': '',
                    'Alt': ''
                })
            },
            isMidLogo: {
                type: Boolean,
                default: false
            }
        }
    };
</script>

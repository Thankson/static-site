<template>
    <div class="m-checkoutBanner" :style="{backgroundColor:bgColor}" role="alert">
        <div class="m-checkoutBanner__inner" :style="{maxWidth:size, color:fontColor}" v-html="message"></div>
    </div>
</template>

<script>
    export default {
        name: 'MCheckoutBanner',
        props: {
            bgColor: {
                type: String,
                default: 'black'
            },
            fontColor: {
                type: String,
                default: 'white'
            },
            message: {
                type: String,
                default: null
            },
            size: {
                type: String,
                default: '490px'
            }
        }
    };
</script>

<template>
    <o-address-form
        :show-mx-address-form="true"
        :script-id="scriptId"
    />
</template>

<script>

    export default {
        name: 'OAddressFormWrapperMx',
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        }
    };
</script>

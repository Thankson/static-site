<template>
    <o-address-form-business
        :show-mx-address-form="true"
        :script-id="scriptId"
    />
</template>

<script>
    export default {
        name: 'OAddressFormBusinessWrapperMx',
        props: {
            scriptId: {
                type: String,
                default: ''
            }
        }

    };
</script>

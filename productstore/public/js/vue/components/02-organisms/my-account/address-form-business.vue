<template>
    <o-address-form
        :is-business="true"
        :show-mx-address-form="showMxAddressForm"
        :script-id="scriptId">
    </o-address-form>
</template>

<script>
    export default {
        name: 'OAddressFormBusiness',
        props: {
            scriptId: {
                type: String,
                default: ''
            },
            showMxAddressForm: {
                type: Boolean,
                default: false
            }
        }
    };
</script>

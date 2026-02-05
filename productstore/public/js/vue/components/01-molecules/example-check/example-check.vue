<template>
    <div class="m-exampleCheck" :aria-hidden="ariaHidden">
        <div class="m-exampleCheck__routing">
            <p class="m-exampleCheck__number">{{ routingNumber }}</p>
            <p class="m-exampleCheck__identifier">{{ routingNumberLabel }}</p>
        </div>
        <div class="m-exampleCheck__account">
            <p class="m-exampleCheck__number">{{ accountNumber }}</p>
            <p class="m-exampleCheck__identifier">{{ accountNumberLabel }}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ExampleCheck',
        props: {
            accountNumber: {
                type: String,
                default: '1001001234'
            },
            accountNumberLabel: {
                type: String,
                default: 'Account Number'
            },
            ariaHidden: {
                type: Boolean,
                default: true
            },
            routingNumber: {
                type: String,
                default: ':123456789:'
            },
            routingNumberLabel: {
                type: String,
                default: 'Routing Number'
            }
        }
    };
</script>

<template>
    <div v-if="errMsgs.length" class="m-errorMessages">
        <ul class="e-formError__list">
            <li
                v-for="(msg, index) in errMsgs"
                :key="`${msg}-${index}`"
                class="e-formError__item pb-0"
            >
                {{ msg }}
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'MR3ErrorMessages',
        props: {
            errMsgs: {
                type: Array,
                default: () => ([])
            }
        }
    };
</script>

<template>
    <div v-if="errors.length" class="m-errorMessages">
        <ul class="e-formError__list">
            <li
                v-for="(msg, index) in errorMsgs"
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
        name: 'MErrorMessages',
        props: {
            showOne: {
                type: Boolean,
                default: true
            },
            errors: {
                type: Array,
                default: () => ([])
            }
        },
        computed: {
            errorMsgs() {
                return this.showOne && this.errors.length ? this.errors.slice(0, 1) : this.errors;
            }
        }
    };
</script>

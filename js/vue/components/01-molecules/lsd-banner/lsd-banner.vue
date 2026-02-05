<template>
    <a
        class="m-lsdBanner"
        :href="link">

        <span
            v-if="iconUrl"
            class="m-lsdBanner__icon">

            <img
                class="m-lsdBanner__iconImg"
                :src="iconUrl"
                :alt="iconAlt"
                :aria-hidden="iconAlt ? true : null"
            />
        </span>

        <span
            class="m-lsdBanner__text"
            v-html="text"
        />
    </a>
</template>

<script>
    export default {
        name: 'MLsdBanner',
        props: {
            iconAlt: {
                type: String,
                default: ''
            },
            iconUrl: {
                type: String,
                default: ''
            },
            link: {
                type: String,
                required: true
            },
            text: {
                type: String,
                required: true
            }
        }
    };
</script>

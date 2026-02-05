<template>
    <header class="m-categoryHeader">
        <img v-if="payload.image" class="m-categoryHeader__logo" :src="payload.image" :alt="payload.title">
        <div class="m-categoryHeader__content">
            <h1 class="m-categoryHeader__title">
                {{ payload.title }}
            </h1>
        </div>
    </header>
</template>

<script>
    export default {
        name: 'MCategoryHeader',
        props: {
            payload: {
                type: Object,
                default: () => ({})
            }
        }
    };
</script>

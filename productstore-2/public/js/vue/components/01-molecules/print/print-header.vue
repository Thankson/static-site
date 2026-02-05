<template>
    <header class="m-printTemplate__header">
        <div class="m-printTemplate__row -header">
            <div class="m-printTemplate__col">
                <img :src="logoSrc" :alt="logoAlt" class="m-printTemplate__logo noLazy">
            </div>
            <div class="m-printTemplate__col">
                <div class="m-printTemplate__title" v-html="title"></div>
            </div>
        </div>
    </header>
</template>

<script>
    export default {
        name: 'MHeaderPrint',
        props: {
            logoAlt: {
                type: String,
                default: 'Melaleuca Logo'
            },
            logoSrc: {
                type: String,
                default: 'https://cdnsc1.melaleuca.com/na/images/header/melaleuca-logo-black-full.png'
            },
            title: {
                type: String,
                default: 'Page title'
            }
        }
    };
</script>

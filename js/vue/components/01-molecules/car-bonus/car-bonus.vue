<template>
    <article v-if="data.PhotoRights" class="m-carBonus">
        <h2 class="m-carBonus__title">{{ data.Title }}</h2>
        <ol class="m-carBonus__list">
            <li v-for="item in data.SubmitList" :key="item" class="m-carBonus__listItem">{{ item }}</li>
        </ol>
        <p class="m-carBonus__text">{{ data.Text }}</p>
        <p class="m-carBonus__text -rights">
            <span class="m-carBonus__label -rights">{{ data.PhotoRights.EmailLabel }}</span>
            <span class="m-carBonus__text -email">{{ data.PhotoRights.EmailText }}</span>
        </p>
        <p class="m-carBonus__text -rights">
            <span class="m-carBonus__label -rights">{{ data.PhotoRights.FaxLabel }}</span>
            <span>{{ data.PhotoRights.FaxText }}</span>
        </p>
        <p class="m-carBonus__text -rights">
            <span class="m-carBonus__label -rights">{{ data.PhotoRights.MailLabel }}</span>
            <span v-html="data.PhotoRights.MailText"></span>
        </p>
        <a
            :href="data.Download.Url"
            :target="data.Download.Target"
            class="a-button -medium w-full md:w-auto justify-center mt-40 md:mt-30"
        >
            {{ data.Download.Text }}
        </a>
        <p class="m-carBonus__caption" v-html="data.Caption"></p>
    </article>
</template>
<script>
    export default {
        name: 'MCarBonus',
        props: {
            data: {
                type: Object,
                default: () => {}
            }
        }
    };
</script>

<template>
    <article class="m-rewards">
        <div class="m-rewards__row">
            <div class="m-rewards__col">
                <h2 class="m-rewards__title" v-html="title"></h2>
                <p class="m-rewards__subtitle" v-html="subtitle"></p>
                <slot name="content" />
            </div>
            <div class="m-rewards__col -img">
                <slot name="image">
                    <img class="m-rewards__img" alt="" src="https://placehold.co/500x600" />
                </slot>
            </div>
        </div>
    </article>
</template>
<script>
    export default {
        name: 'MRewardContainer',
        props: {
            title: {
                type: String,
                default: ''
            },
            subtitle: {
                type: String,
                default: ''
            }

        },
        methods: {}
    };
</script>

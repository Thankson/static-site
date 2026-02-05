<template>
    <nav class="m-jumpLinks">
        <ul class="m-jumpLinks__list">
            <li
                v-if="$slots['about']"
                class="m-jumpLinks__item">

                <slot name="about" />
            </li>

            <li
                v-if="$slots['ingredients'] && hasIngredients"
                class="m-jumpLinks__item">

                <slot name="ingredients" />
            </li>

            <li
                v-if="$slots['reviews']"
                class="m-jumpLinks__item -reviews">

                <slot name="reviews" />
            </li>

            <li
                v-if="$slots['terms-conditions']"
                class="m-jumpLinks__item">

                <slot name="terms-conditions" />
            </li>

            <slot />
        </ul>
    </nav>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'MJumpLinks',
        computed: {
            ...mapState('jumpLinks', ['hasIngredients'])
        }
    };
</script>

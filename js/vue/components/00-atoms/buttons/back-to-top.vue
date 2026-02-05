<template>
    <div class="a-backTopButton">
        <button
            class="a-backTopButton__cta"
            v-on:click.prevent="scrollTop()"
        >
            <span class="a-backTopButton__text">
                {{ buttonText }}
            </span>
            <span class="a-backTopButton__arrow material-icons" aria-hidden="true">arrow_upward</span>
        </button>
    </div>
</template>

<script>
    export default {
        name: 'ABackToTop',
        props: {
            buttonText: {
                type: String,
                default: 'Back To Top'
            }
        },
        methods: {
            scrollTop() {
                window.scroll({top: 0, left: 0, behavior: 'smooth'});
                // bug #76930 - focus needs to return to top of the page - ADA
                var target = document.getElementsByClassName('m-eyebrowNav__link')[0];
                if(target) {
                    target.focus();
                }
            }
        }
    };
</script>

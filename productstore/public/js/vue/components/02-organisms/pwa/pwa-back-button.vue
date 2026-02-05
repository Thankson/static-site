<template>
    <div v-if="showBackButton" class="o-pwaBackButton pr-20 pt-10">
        <transition name="fade">
            <button @click="goToPreviousPage">
                <span class="material-icons text-white">arrow_back_ios_new</span>
            </button>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'PwaBackButton',
        props: {},
        data() {
            return {
                showBackButton: false
            };
        },
        mounted() {
            this.displayButton();
        },
        methods: {
            displayButton() {
                const isIos = () => {
                    const userAgent = window.navigator.userAgent.toLowerCase();
                    return /applewebkit|safari|iphone|ipad|ipod/.test(userAgent);
                };
                const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

                if(isIos() && isInStandaloneMode() && window.history.length > 1 && document.referrer) {
                    this.showBackButton = true;
                }
            },
            goToPreviousPage() {
                window.history.back();
            }
        }
    };
</script>

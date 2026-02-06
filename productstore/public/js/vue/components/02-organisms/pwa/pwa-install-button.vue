<template>
    <button
        class="o-pwaInstructions__btn a-button"
        @click="downloadPWA">
        <slot></slot>
    </button>
</template>

<script>
    export default {
        name: 'PwaInstallButton',
        data() {
            return {
                deferredPrompt: null,
                isAppInstalled: null
            };
        },
        mounted() {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                // Stash the event so it can be triggered later.
                this.deferredPrompt = e;
                console.log(`'beforeinstallprompt' event was fired.`, this.deferredPrompt);
            });
        },
        methods: {
            downloadPWA() {
                const promptEvent = this.deferredPrompt;
                if(!promptEvent) {
                    // The deferred prompt isn't available.
                    return;
                }
                // Show the install prompt.
                promptEvent.prompt();
                // Log the result

                promptEvent.userChoice.then((result) => {
                    // Reset the deferred prompt variable, since
                    // prompt() can only be called once.
                    //  send GA with status of if prompt was accepted/dismissed
                    ga('send', 'userEvent', 'A2H', result.outcome); // eslint-disable-line

                    if(result.outcome === 'accepted') {
                        this.isAppInstalled = true;
                    }
                    this.deferredPrompt = null;
                });
            }
        }
    };
</script>

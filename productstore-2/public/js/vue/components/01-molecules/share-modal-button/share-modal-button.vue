<template>
    <div
        class="m-shareModalButton"
        :class="[containerMods]"
    >
        <button
            :id="buttonType"
            class="m-shareModalButton__button"
            :class="[buttonMods]"
            @click="handleClick"
        >
            <span class="material-icons text-4xl text-white leading-initial">
                {{ buttonType }}
            </span>
        </button>
        <label
            :for="buttonType"
            class="text-sm leading-base mt-8"
        >
            {{ label }}
        </label>
        <div
            v-show="showToast"
            class="m-freeProductsToast m-shareModalButton__toast"
        >
            <div class="m-freeProductsToast__content">
                <h6 class="text-sm text-left font-bold leading-initial">
                    {{ linkCopiedLabel }}
                </h6>
            </div>
        </div>
    </div>
</template>

<script>
    import api from '@api/routes/welcome/shareLink';

    export default {
        name: 'ShareModalButton',
        props: {
            buttonMods: {
                type: String,
                default: ''
            },
            buttonType: {
                validator: (val) => {
                    return ['sms', 'email', 'link'].includes(val);
                },
                required: true
            },
            containerMods: {
                type: String,
                default: ''
            },
            label: {
                type: String,
                required: true
            },
            linkCopiedLabel: {
                type: String,
                default: ''
            },
            videoId: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                showToast: false
            };
        },
        methods: {
            async handleClick() {
                const response = await api.post({mediaItemName: this.videoId});

                if(response?.data?.Success && response?.data?.Data) {
                    const link = response.data.Data;

                    switch (this.buttonType) {
                        case 'sms':
                            window.location.href = `sms:;?&body=${link}`;
                            break;
                        case 'email':
                            window.location.href = `mailto:?body=${link}`;
                            break;
                        case 'link':
                            navigator.clipboard.writeText(link);
                            this.showToast = true;
                            setTimeout(() => {
                                this.showToast = false;
                            }, 2000);
                            break;
                    }
                }
            }
        }
    };
</script>

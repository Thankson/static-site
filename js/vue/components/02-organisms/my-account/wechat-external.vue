<template>
    <div class="o-wechatExternal">
        <h2 class="o-wechatExternal__title">{{ getLocalizationProp('Data.Title', '') }}</h2>
        <div class="o-wechatExternal__code">
            <img :src="'data:image/jpeg;base64,'+ qrcode" class="o-wechatExternal__image" />
            <div v-if="isExpire" class="o-wechatExternal__expire">
                <button v-if="isExpire" class="o-wechatExternal__expireBtn a-button" @click="getNewQrcode()">
                    <span class="mx-auto text-center">{{ getLocalizationProp('Labels.NewQrcode.Label', '') }}</span>
                </button>
            </div>
        </div>
        <p class="o-wechatExternal__title">
            {{ getLocalizationProp('Labels.HelpText.Label', '') }}
        </p>
        <p v-if="isDuplicated" class="text-red">
            {{ duplicated }}
        </p>
        <a class="o-wechatExternal__button a-button" :href="getLocalizationProp('Labels.Button.Url', '')">
            {{ getLocalizationProp('Labels.Button.Label', '') }}
        </a>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';
    import qrcodeApi from '@api/routes/wechatexternal/qrcode';
    import qrcodeStatusApi from '@api/routes/wechatexternal/qrcodestatus';
    import { mapState } from 'vuex';

    export default {
        name: 'WechatExternal',

        mixins: [ localizationMixin],

        data: function() {
            return {
                isExpire: false,
                nowDate: '',
                qrcode: '',
                current: 0,
                isDuplicated: false
            };
        },

        computed: {
            ...mapState('navigation', ['formattedName']),

            customerId() {
                return this.getLocalizationProp('Data.CustomerId', '');
            },
            barcode() {
                return this.getLocalizationProp('Data.barcode');
            },
            expirationTime() {
                return this.getLocalizationProp('Data.ExpirationTime');
            },
            duplicated() {
                return this.getLocalizationProp('Labels.Duplicate')?.replace('{0}', this.formattedName) || '';
            }
        },

        mounted() {
            this.qrcode = this.barcode;
            this.current = this.expirationTime;
            this.hasExpire();
            this.hasBound();
        },

        beforeDestroy() {
            if(this.hasExpire) {
                clearInterval(this.hasExpire);
            }
        },
        methods: {
            currentTime() {
                setInterval(this.hasExpire, 60000);
            },
            hasBound() {
                setInterval(this.checkHasBound, 1000);
            },
            async checkHasBound() {
                const response = await qrcodeStatusApi.query({ customerId: this.customerId});
                if(response.data?.result?.qrCodeStatus != null) {
                    switch (response.data.result.qrCodeStatus) {
                        case 'Success':
                            this.isDuplicated = false;
                            window.location.href = this.getLocalizationProp('Labels.Button.Url', '');
                            break;
                        case 'Pending':
                            this.isDuplicated = false;
                            break;
                        case 'Duplicate':
                            this.isDuplicated = true;
                            break;
                        case 'Expire':
                            this.isExpire = true;
                            break;
                        default:
                            break;
                    }
                }
            },
            hasExpire() {
                this.nowDate = new Date().getTime();
                if(this.nowDate >= this.expirationTime) {
                    this.isExpire = true;
                }
            },
            async getNewQrcode() {
                const response = await qrcodeApi.query({ customerId: this.customerId});
                if(response.success && (response.data?.result?.barcode != null)) {
                    this.qrcode = response.data.result.barcode;
                    this.current = response.data.result.expirationTime;
                    this.isExpire = false;
                } else if(response.success && (response.data?.result?.barcode === null)) {
                    this.getNewQrcode();
                }
            }
        }
    };
</script>

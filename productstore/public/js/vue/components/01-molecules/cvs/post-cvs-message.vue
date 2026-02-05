<template>
    <div class="m-postCvsMessage">
    </div>
</template>

<script>
    import {postCvsMessage, cvsInfo} from '../../../utils/channel-types';
    export default {
        name: 'MPostCvsMessage',
        props: {
            cvsType: {
                type: String,
                default: ''
            },
            storeAddress: {
                type: String,
                default: ''
            },
            storeCode: {
                type: String,
                default: ''
            },
            storeName: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                bc: null
            };
        },
        mounted () {
            this.postCvsInfo();

            this.$once('hook:beforeDestroy', () => {
                if(this.bc) {
                    this.bc.close();
                    this.bc = null;
                }
            });
        },
        methods: {
            postCvsInfo() {
                if([this.cvsType, this.storeAddress, this.storeCode, this.storeName].every(Boolean)) {
                    this.bc = new BroadcastChannel(postCvsMessage);
                    this.bc.postMessage({
                        type: `${cvsInfo}-${this.cvsType.toLowerCase()}`,
                        data: {
                            cvsType: this.cvsType,
                            storeAddress: this.storeAddress,
                            storeCode: this.storeCode,
                            storeName: this.storeName
                        }
                    });
                }

                window.close();
            }
        }
    };
</script>

<template>
    <div class="m-medias">
        <m-media
            v-for="(m, index) in medias"
            :key="m.key"
            :application="application"
            :el-name="elName"
            mods="-cube"
            :value="m"
            :component-show="componentShow"
            @input="updateMedia(index, $event)"
        ></m-media>
    </div>
</template>

<script>
    import uniqid from 'uniqid';

    export default {
        name: 'MMedias',
        props: {
            max: {
                type: Number,
                default: 1
            },
            value: {
                type: Array,
                default: () => ([])
            },
            application: {
                type: String,
                default: ''
            },
            elName: {
                type: String,
                required: true
            },
            componentShow: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                medias: []
            };
        },
        watch: {
            value: {
                handler(val) {
                    if(val.length) {
                        this.medias = val;
                        if(val.length >= this.max || !val[val.length - 1].ready) return;
                        if(val.length && val[val.length - 1].ready) {
                            // this.medias.push({key: uniqid()});
                            this.medias = [
                                ...this.medias,
                                {key: uniqid()}
                            ];
                        }
                    } else {
                        // this.medias.push({key: uniqid()});
                        this.medias = [
                            ...this.medias,
                            {key: uniqid()}
                        ];
                    }
                },
                immediate: true
            },
            medias: {
                handler(val) {
                    this.$emit('input', val);
                },
                immediate: true,
                deep: true
            }
        },
        mounted () {

        },
        methods: {
            updateMedia(index, value) {
                this.medias = this.medias.map((m, ind) => {
                    return index === ind ? value : m;
                });
            }
        }
    };
</script>

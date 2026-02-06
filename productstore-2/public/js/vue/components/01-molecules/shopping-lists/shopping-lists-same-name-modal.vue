<template>
    <modal :id="modalId" :heading-visible="false">
        <template v-slot:body>
            <p class="leading-tight text-2xl" :class="{'text-gray-120 mx-30 md:mx-0':isCn}">
                {{ modalInfo.description }}
            </p>
        </template>
        <template v-slot:footer>
            <a v-if="!isCn" :href="modalInfo.goToListLink()" class="a-button -modal -transparent">
                {{ modalInfo.goToList }}
            </a>
            <button class="a-button" :class="{'px-25 w-auto py-12 mb-30 mx-30 md:mb-0 md:mx-0':isCn, '-modal':!isCn}" @click="close()">
                {{ modalInfo.cancel }}
            </button>
        </template>
    </modal>
</template>

<script>
    export default {
        name: 'MShoplistsSameNameModal',
        props: {
            list: {
                type: Object,
                default() {
                    return {};
                }
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            },
            modalId: {
                type: String,
                default: 'same-list-name-modal'
            }
        },
        computed: {
            modalInfo() {
                return {
                    description: this.localization?.Labels?.ModalSameName,
                    cancel: this.localization?.Labels?.Cancel,
                    goToList: this.localization?.Labels?.GoToList,
                    goToListLink: () => {
                        let link = '/';

                        if(this.localization?.Data?.ListsPage?.Url) {
                            link = this.localization.Data.ListsPage.Url + '?listId=' + this.list?.ListId;
                        }

                        return link;
                    }
                };
            },
            isCn() {
                return this.$env?.IsCn || false;
            }
        },
        methods: {
            open() {
                this.$modal.show({ id: this.modalId });
            },
            close() {
                this.$modal.hide({ id: this.modalId });
            }
        }
    };
</script>

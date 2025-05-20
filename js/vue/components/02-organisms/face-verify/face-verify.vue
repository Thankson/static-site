<template>
    <div class="o-faceVerify">
        <div class="verifywrap mb-20">
            <div class="text-center mb-30 mt-15">
                <div class="inline-block relative">
                    <img :src="data.IconLeftTop" alt="" class="face_img_lt absoulte">
                    <img :src="data.ImageSampleFace" alt="" class="face_img">
                    <!-- <img :src="data.IconRightBottom" alt="" class="face_img_rb absoulte"> -->
                </div>
            </div>
            <div class="text-center text-xs text-gray mb-25">{{ data.Description }}</div>
            <div class="m-formField -checkbox flex items-center pt-18 pr-1">
                <m-checkbox-list
                    script-id=""
                    :checkboxes="checkboxes"
                    checkbox-error-mods="-error"
                    :show-errors="false"
                    @change="(payload) => onCheckboxListChange(payload)"
                />
            </div>
            <div><v-button class="a-button bg-sky w-full a-button text-sm font-medium py-16 px-40 inline-block -sky" @click="handleStart"> {{ labels.StartFaceVerification }} </v-button></div>
            <div v-if="showError">
                <div v-if="!isCommitAllRequiredChecked" class="e-formError">
                    <p class="e-formError__item" role="alert" v-html="labels.ErrorTermUnchecked"></p>
                </div>
            </div>
        </div>
        <modal id="modal-contract" width="535px">
            <template v-slot:heading>
                {{ labels.Modal.Title }}
            </template>

            <template v-slot:body>
                <p>{{ labels.Modal.Content }}</p>
            </template>

            <template v-slot:footer>
                <div>
                    <button class="a-button text-sm font-medium py-16 px-26 mx-8 ml-0 inline-block -plain" type="button" @click="handleCancel">
                        {{ labels.Modal.Reject }}
                    </button>
                    <button class="a-button text-sm font-medium py-16 px-26 mx-8 inline-block -sky" type="button" @click="handleConfirm">
                        {{ labels.Modal.Continue }}
                    </button>
                </div>
            </template>
        </modal>
    </div>
</template>

<script>
    import localizationMixin from '@common/source/js/vue/mixins/localization';

    export default {
        name: 'OFaceVerify',
        mixins: [ localizationMixin],
        props: {
            labels: {
                type: Object,
                default: () => {}
            },
            data: {
                type: Object,
                default: () => {}
            },
            checkboxes: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                isCommitAllRequiredChecked: false,
                showError: false
            };
        },
        methods: {
            showErrorEvent() {
                if(!this.isCommitAllRequiredChecked) {
                    this.showError = true;
                }
            },
            handleStart() {
                this.showErrorEvent();
                if(this.isCommitAllRequiredChecked) {
                    this.openModal();
                }
                // todolist: go to next step
            },
            openModal() {
                this.$modal.show({ id: 'modal-contract' });
            },
            handleCancel() {
                this.$modal.hide({ id: 'modal-contract' });
            },
            handleConfirm() {
                this.$modal.hide({ id: 'modal-contract' });
                this.$emit('stepEvent');
                // ...
            },
            onCheckboxListChange(payload, catIndex) {
                this.isCommitAllRequiredChecked = payload.isAllRequiredChecked;
                // this.$set(this.isAllRequiredChecked, catIndex, payload.isAllRequiredChecked);
            }
        }
    };
</script>

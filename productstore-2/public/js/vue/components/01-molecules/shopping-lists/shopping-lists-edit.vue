<template>
    <div class="m-editShoplists">
        <!-- Show spinner while API is being loaded -->
        <div v-if="showLoading && submited" class="m-editShoplists__loading">
            <a-loading-spinner
                :visible="true"
                size="sm"
                class="m-editShoplists__loadingIcon"
                aria-hidden="true">
            </a-loading-spinner>
        </div>

        <!-- Edit list form -->
        <form
            class="m-editShoplists__form"
            :class="{'-invalid': (apiError && apiError.length) || $v.editListName.$error}"
            method="PUT"
            @submit.prevent.once="$v.$touch"
            @submit.prevent="submit">
            <!-- List name field -->
            <div v-if="list && list.ListName" class="m-editShoplists__field">
                <!-- Hidden label -->
                <label
                    class="m-editShoplists__label"
                    :for="editListNameId" v-html="getLabels(localization, 'Labels.EditListPlaceholder', 'List Name')"></label>

                <!-- Input -->
                <input
                    :id="editListNameId"
                    ref="edit-list-name"
                    v-model="editListName"
                    name="edit-list-name"
                    autocomplete="off"
                    :placeholder="getLabels(localization, 'Labels.EditListPlaceholder', 'List Name')"
                    type="text"
                    class="m-editShoplists__input a-input"
                    :class="$v.editListName.$error ? '-isInvalid' : ''"
                    aria-required="true"
                    :aria-invalid="$v.editListName.$error"
                    :aria-describedby="$v.editListName.$error ? errorId : null" />

                <!-- Count -->
                <span class="o-shoplistsManage__count">
                    {{ list.ItemCount }} {{ getLabels(localization, 'Labels.Items', 'Items') }}
                </span>

                <!-- Display FE validation error and API validation error -->
                <div
                    v-if="(apiError && apiError.length) || $v.editListName.$error"
                    :id="errorId"
                    class="m-editShoplists__error e-formError">
                    <p v-if="$v.editListName.$error" class="e-formError__item">
                        {{ getLabels(localization, 'Labels.EditListRequired', 'List name is required') }}
                    </p>
                    <p v-for="(error, index) in apiError" :key="index" class="e-formError__item">
                        {{ error }}
                    </p>
                </div>
            </div>
            <div v-else class="m-editShoplists__field -notFound">
                {{ getLabels(localization, 'Labels.ListNotFound', 'List not found') }}
            </div>

            <div class="m-editShoplists__actions">
                <!-- Cancel button -->
                <button
                    class="m-editShoplists__button a-button -white"
                    type="button"
                    @click="cancel">
                    {{ getLabels(localization, 'Labels.Cancel', 'Cancel') }}
                </button>

                <!-- Submit button -->
                <button
                    class="m-editShoplists__button a-button"
                    :class="{'-disabled': !list || !list.ListName}"
                    :disabled="!list || !list.ListName"
                    type="button"
                    @click.once="$v.$touch"
                    @click="submit">
                    {{ getLabels(localization, 'Labels.Save', 'Save') }}
                </button>
            </div>
        </form>

        <!-- Modal - List with same name -->
        <m-shoplists-same-name-modal
            v-if="listSameName"
            ref="same-list-name-modal"
            :list="listSameName"
            :localization="localization">
        </m-shoplists-same-name-modal>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import labels from '@common/source/js/vue/mixins/api-localization';
    import safeId from '@common/source/js/vue/mixins/safe-id';
    import { validationMixin } from 'vuelidate';
    import { required } from 'vuelidate/lib/validators';

    export default {
        name: 'MShoplistsEdit',
        mixins: [ safeId, validationMixin, labels ],
        safeIds: [
            'editListNameId',
            'errorId'
        ],
        validations: {
            editListName: {
                required
            }
        },
        props: {
            list: {
                type: Object,
                default() {
                    return {};
                }
            },
            lists: {
                type: Array,
                default: () => []
            },
            localization: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                apiError: [],
                editListName: null,
                editListNameId: null,
                errorId: null,
                submited: false,
                showLoading: false,
                listSameName: null
            };
        },
        computed: {
            ...mapState('shoppingLists', ['storedApiError', 'storedApiLoading'])
        },
        watch: {
            storedApiLoading() {
                this.showLoading = this.storedApiLoading;
            }
        },
        mounted() {
            this.submited = false;
            this.apiError = [];
            this.editListName = this.list?.ListName;
        },
        methods: {
            ...mapActions('shoppingLists', ['editList']),

            cancel() {
                this.$emit('cancel', {
                    canceled: true
                });
            },
            async submit() {
                this.$v.$touch();

                if(!this.$v.$invalid) {
                    // Check if list name already exists
                    this.listSameName = this.lists.find(list => {
                        return list.ListName.toLowerCase() === this.editListName.toLowerCase().trim() && list.ListId !== this.list.ListId;
                    });

                    // If the name already exists, then opens a modal
                    if(this.listSameName) {
                        this.$nextTick(() => {
                            this.$refs['same-list-name-modal'].open();
                        });
                    } else {
                        this.submited = true;
                        this.apiError = [];

                        // Save data
                        const success = await this.editList({
                            payload: {
                                ListId: this.list.ListId,
                                ListName: this.editListName,
                                Order: this.list.Order
                            }
                        });

                        if(success) {
                            // Clear input if the form is submited and API returns success
                            this.editListName = null;
                            this.$v.$reset();
                            this.$emit('save', {
                                saved: true
                            });
                        } else {
                            this.apiError = this.storedApiError;
                        }
                    }
                }
            }
        }
    };
</script>

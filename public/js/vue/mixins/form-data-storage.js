import { mapState, mapMutations, mapActions } from 'vuex';
import { isEmpty, cloneDeep } from 'lodash';
import { ls } from '@common/source/js/utils/local-storage';

const IBO_FORM = 'IBO_FORM';
const IBO_FIELDS_MAP = 'IBO_FIELDS_MAP';
const IBO_OCR_INFOS = 'IBO_OCR_INFOS';
// const IBO_CURRENT_POSITION = 'IBO_CURRENT_POSITION';

export default {
    data() {
        return {
            dataRestored: false
        };
    },
    computed: {
        ...mapState('iboApp', ['hasInitForm']),
        partialForm() {
            return this.formFields.reduce((result, field) => {
                result[field] = this[field];
                return result;
            }, {});
        },
        processID() {
            return this.getLocalizationProp('Data.ProcessID');
        },
        fieldsMap() {
            return this.formFields.reduce((result, field) => {
                result[field] = {
                    step: this.processID,
                    // MARK handle go to step
                    belongToForm: '',
                    fieldElementId: field
                };
                return result;
            }, {});
        },
        idEditingFiled() {
            return {
                step: this.processID,
                // MARK handle go to step
                belongToForm: '',
                fieldElementId: null
            };
        }
    },
    watch: {
        // Iterate through all fields in newParForm,
        //   corresponding to the fields that are not in oldParForm or are not equal to newParForm,
        //   then the fields that are being modified
        partialForm(newParForm) {
            this.SYNC_FORM(cloneDeep(newParForm));
            this.SYNC_EDITING_FIELD(this.formFields[0]);
            // this.STORE_CURRENT_POSITION(this.processID);
        },
        fieldsMap(fieMap) {
            this.SYNC_FIELDS_MAP(fieMap);
        }
    },
    mounted () {
        // TAG restore form info from storage
        this.restorePartialForm();
    },
    methods: {
        ...mapMutations('iboApp', [
            'SET_HAS_INIT_FORM', 'SYNC_FORM', 'SYNC_FIELDS_MAP', 'SYNC_EDITING_FIELD', 'STORE_CURRENT_POSITION', 'RESTORE_CURRENT_POSITION', 'SET_ORC_INFOS'
        ]),
        ...mapActions('iboApp', ['restoreCurrentPosition']),
        restorePartialForm() {
            const storedFormObj = ls.getItem(IBO_FORM);
            if(isEmpty(storedFormObj)) return;

            if(!this.hasInitForm) {
                this.SET_HAS_INIT_FORM();

                this.SYNC_FORM(storedFormObj);

                const storedFieldsMapObj = ls.getItem(IBO_FIELDS_MAP);
                if(!isEmpty(storedFieldsMapObj)) { this.SYNC_FIELDS_MAP(storedFieldsMapObj); }

                this.restoreCurrentPosition();

                const orcInfos = ls.getItem(IBO_OCR_INFOS);
                if(!isEmpty(orcInfos)) this.SET_ORC_INFOS(orcInfos);

                this.formFields.forEach(field => {
                    if(storedFormObj[field] !== undefined) {
                        this[field] = storedFormObj[field];
                    }
                });
            }
            this.dataRestored = true;
        }
    }
};

import iboSubmitApi from '@api/routes/dsibo/dsibo/ibosubmit';
import { ls } from '@common/source/js/utils/local-storage';

const IBO_FORM = 'IBO_FORM';
const IBO_FIELDS_MAP = 'IBO_FIELDS_MAP';
const IBO_CURRENT_POSITION = 'IBO_CURRENT_POSITION';
const IBO_OCR_INFOS = 'IBO_OCR_INFOS';
const EDITING_FIELD = 'EDITING_FIELD';

const namespaced = true;

const state = {
    isSubmitSuccess: false,

    // TODO ds also need this
    hasInitForm: false,

    form: {},
    fieldsMap: {},
    editingField: '',

    ocrInfos: {},

    showUploadPhotosForm: true,
    showInfoForm: false
};

const mutations = {
    SET_HAS_INIT_FORM(state) {
        state.hasInitForm = true;
    },
    SYNC_FORM(state, payload) {
        state.form = {
            ...state.form,
            ...payload
        };
        ls.setItem(IBO_FORM, state.form);
    },
    SYNC_FIELDS_MAP(state, payload) {
        state.fieldsMap = {
            ...state.fieldsMap,
            ...payload
        };
        ls.setItem(IBO_FIELDS_MAP, state.fieldsMap);
    },
    SYNC_EDITING_FIELD(state, payload) {
        state.editingField = payload;
        ls.setItem(EDITING_FIELD, state.editingField);
    },
    STORE_CURRENT_POSITION(state, processID) {
        ls.setItem(IBO_CURRENT_POSITION, {
            processID,
            showUploadPhotosForm: state.showUploadPhotosForm,
            showInfoForm: state.showInfoForm
        });
    },
    RESTORE_CURRENT_POSITION(state, restPositionInfo) {
        Object.keys(restPositionInfo).forEach(i => {
            state[i] = restPositionInfo[i];
        });
    },

    SET_ORC_INFOS(state, payload) {
        if(!payload) return;
        state.ocrInfos = {
            ...state.ocrInfos,
            ...payload
        };
        ls.setItem(IBO_OCR_INFOS, state.ocrInfos);
    },

    HIDE_ENTER_INFO(state) {
        state.showUploadPhotosForm = false;
        state.showInfoForm = false;
    },
    SHOW_INFO_FORM() {
        state.showInfoForm = true;
    },
    SHOW_SUBMIT_RESULT() {
        state.isSubmitSuccess = true;
    }
};

const actions = {
    showInfoFormOnly({ commit }) {
        commit('HIDE_ENTER_INFO');
        commit('SHOW_INFO_FORM');
    },
    startOrContinueEditingForm({ dispatch }, specifiedProcessID) {
        if(specifiedProcessID) {
            dispatch('access/setActiveStepProcessId', specifiedProcessID, { root: true });
            return;
        }

        // TAG from storage
        const editingField = ls.getItem(EDITING_FIELD);
        if(editingField) {
            // 1. go to enter info form
            const fieldsMap = ls.getItem(IBO_FIELDS_MAP);
            const goTo = fieldsMap[editingField];
            dispatch('access/setActiveStepProcessId', goTo.step, { root: true });
            // 2. do show info
            dispatch(goTo.belongToForm);
            // 3. go to field via hash
            return;
        }

        dispatch('access/setActiveStepProcessId', null, { root: true });
    },
    restoreCurrentPosition({ commit, dispatch }) {
        const currentPosition = ls.getItem(IBO_CURRENT_POSITION);
        const {processID, ...restPositionInfo} = currentPosition;
        dispatch('access/setActiveStepProcessId', processID, { root: true });
        commit('RESTORE_CURRENT_POSITION', restPositionInfo);
    },
    async submit({state}) {
        const SerialNo = ls.getItem('FaceVerificationLink')?.['SerialNo'] || '';
        const data = {
            'ApplicationChannel': 'ShoppingMiniProgram',
            'ParticipationLevel': state?.form?.participationLevel,
            SerialNo,
            'PersonalInfo': {
                'OcrGovernmentId': state?.ocrInfos?.CorpIdentNo,
                'ImgIDCardFront': state?.form?.frontOfIDCardMediaInfo?.path,
                'ImgIDCardReverse': state?.form?.reverseOfIDCardMediaInfo?.path
            },
            'CompanyInfo': {
                'CompanyType': state?.form?.licenseType,
                'LicenseType': state?.form?.licenseType,
                'CompanyName': state?.ocrInfos?.CorpName,
                'Investor': state?.ocrInfos?.LegalRepName,
                'AddressInfo': {
                    'AddressLine1': state?.form?.addressLine1,
                    'City': state?.form?.city,
                    'Province': state?.form?.province,
                    'Suburb': state?.form?.suburb,
                    'Country': 'China' // TODO
                },
                'BusinessLicenseNo': state?.ocrInfos?.CorpIdentNo,
                'TaxId': state?.ocrInfos?.CorpIdentNo,
                'ImgBusinessLicense': state?.form?.businessLicenseMediaInfo?.path
            },
            'BankInfo': {
                'BankName': state.ocrInfos.BankName,
                'BankCardType': state.ocrInfos.BankCardType, // 0-未知 1-借记卡 2-信用卡
                'BankCardNo': state.ocrInfos.BankCardNum,
                'ValidDate': state.ocrInfos.ValidDate // 有效期
            },
            'CustomerIBOAttachments': [
                {
                    'AttachmentType': 'WorkCertificate', // 需符合 CustomerIBODSAttachmentType
                    'AttachmentImg': state?.form?.workCertificateMediaInfos.filter(i => i.ready)[0]?.path
                },
                {
                    'AttachmentType': 'EDPlusRecommendationGuaranteeLetter',
                    'AttachmentImg': state?.form?.eDRecommendationGuaranteeLetterMediaInfos?.filter(i => i.ready)[0]?.path
                },
                {
                    'AttachmentType': 'HandwrittenCommitmentLetter',
                    'AttachmentImg': state?.form?.handwriteCommitmentLetterMediaInfos?.filter(i => i.ready)[0]?.path
                }
            ]
        };

        const response = await iboSubmitApi.post(data);
        return response;
    },
    showSubmitSuccess({commit}) {
        commit('SHOW_SUBMIT_RESULT');
    }
};

export default {
    namespaced,
    state,
    mutations,
    actions
};

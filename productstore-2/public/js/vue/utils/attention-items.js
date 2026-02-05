/**
 * @typedef {{
 *  Parameters: Array<string>,
 *  RteContent: string,
 *  ForceLoad: boolean,
 *  Sections: Array<{
 *      Type: string,
 *      Heading: string,
 *      Data: Object<string, any>
 *  }>,
 *  Data: Object<string, string>?,
 *  Labels: Object<string, string>?
 * }} ModalData
 */

/**
 * @typedef {{
 *  Status: string,
 *  ValidationCode: string,
 *  Priority: number,
 *  Snippets: {
 *      Parameters: Array<string>?,
 *      Inline: {
 *          RteContent: string,
 *          ForceLoad: boolean,
 *          Data: Object<string, any>?,
 *          Labels: Object<string, any>?
 *      }?,
 *      Footer: {
 *          RteContent: string,
 *          ForceLoad: boolean,
 *          Data: Object<string, any>?,
 *          Labels: Object<string, any>?
 *      }?
 * },
 *  LineItem: {
 *      RteContent: string,
 *      ForceLoad: boolean,
 *      AdditionalData: Array<{
 *          LineId: string,
 *          Parameters: Array<string>?
 *      }>,
 *      Data: Object<string, any>?,
 *      Labels: Object<string, any>?
 *  }?,
 *  Modal: ModalData?
 * }} AttentionItem
 */

import { replaceTokenArray } from '@common/source/js/vue/utils/replace-token';

/**
 * generate an attention item markup snippet
 * - message will be combined with parameters array to replace tokens in message string
 * @param {string} type type of snippet [ Inline || Footer ]
 * @param {AttentionItem} attentionItem attention item object from service
 * @returns {string>} message with new message appended, if valid
 */
function generateSnippetMessage(type, attentionItem) {
    let message = attentionItem.Snippets?.[type]?.RteContent || '';

    const parameters = attentionItem.Snippets?.Parameters;
    if(parameters) {
        message = replaceTokenArray(message, parameters);
    }

    return message;
}

/**
 * generate line item markup and map to object
 * - message will be combined with parameters array to replace tokens in message string
 * - lineItemMap will be key/value pairs where key is the lineId and value is a message string
 * @param {AttentionItem} attentionItem attention item object from service
 * @param {Object<string, Array<string>>} lineItemMap object mapping lineIds and associated messages
 * @returns {Object<string, string>} updated object mapping lineIds and associated messages
 */
function addLineIdMessage(attentionItem, lineItemMessages) {
    let message = attentionItem.LineItem?.RteContent || null;
    const lines = attentionItem.LineItem?.AdditionalData || null;

    if(!message || !lines || lines.length === 0) return lineItemMessages;

    lines.forEach(line => {
        if(line.LineId) {
            const lineId = line.LineId;
            let lineMessage = message;

            const parameters = line.Parameters;
            if(parameters && parameters.length > 0) {
                lineMessage = replaceTokenArray(lineMessage, parameters);
            }

            if(!lineItemMessages[lineId]) {
                lineItemMessages[lineId] = '';
            }

            lineItemMessages[lineId] = lineItemMessages[lineId] + lineMessage;
        }
    });

    return lineItemMessages;
}

/** @typedef {{ code: boolean, modalData: Object<string, any>, validationCode: string }} Modal */

/**
 * find all valid modals and assign to array
 * - each obj in the array will consist of the validation code and modal data
 * @param {AttentionItem} attentionItem attention item object from service
 * @param {Array<Modal>} modals array of modals and associated data
 * @returns {Array<Modal>} updated array of modals and associated data
 */
function addModal(attentionItem, modals) {
    if(!attentionItem.Modal) {
        return modals;
    }

    modals.push({
        critical: attentionItem.Status === 'Critical',
        modalData: attentionItem.Modal,
        validationCode: attentionItem.ValidationCode,
        ignoreCta: attentionItem.IgnoreCta
    });
    return modals;
}

/** attention item utility to digest attention item framework schema and translate for front-end interactions  */
export default class {
    /**
     * @param {Array<AttentionItem>} attentionItems array of attention items
     * @param {Array<string>} excludedInlineAttentionItems exclusion list of inline attention items by validation code
     */
    constructor(attentionItems, excludedInlineAttentionItems = []) {
        if(!Array.isArray(attentionItems) || attentionItems.length < 1) {
            return null;
        }

        this.attentionItems = attentionItems;
        this.excludedInlineAttentionItems = excludedInlineAttentionItems;
        this.footerMessages = '';
        this.inlineMessages = '';
        this.isCritical = false;
        this.attentionItemErrorMessages = [];

        /**
         * key/value pairs where key is the lineId and value is the associated attention item message
         * @type {Object<string, string>}
         */
        this.lineItemMessages = {};

        /**
         * array of modals and associated data
         * @type {Array<Modal>}
         */
        this.modals = [];

        this.init();
    }

    init() {
        this.setIsCritical();
        this.setMessages();
    }

    /**
     * set isCritical property if any attention item has a Critical status
     */
    setIsCritical() {
        let isCritical = false;

        for (let i = 0; i < this.attentionItems.length; i++) {
            if(this.attentionItems[i].Status === 'Critical') {
                isCritical = true;
                break;
            }
        }

        this.isCritical = isCritical;
    }

    /**
     * iterate attention item array and generate message strings
     * - all in one method to avoid iterating over the array multiple times
     */
    setMessages() {
        let footerMessages = [];
        let inlineMessages = [];
        let lineItemMessages = {};
        let modals = [];
        let messages = [];
        let attentionItemErrorMessages = []; // array of attention items error messages for sticky toast modal

        this.attentionItems.forEach(attentionItem => {
            const validationCode = attentionItem.ValidationCode;

            footerMessages = footerMessages + generateSnippetMessage('Footer', attentionItem);
            if(!attentionItem.ShippingMessage && !this.excludedInlineAttentionItems.includes(validationCode)) {
                inlineMessages = inlineMessages + generateSnippetMessage('Inline', attentionItem);
                attentionItemErrorMessages.push(generateSnippetMessage('Inline', attentionItem));
                this.attentionItemErrorMessages = attentionItemErrorMessages; // being referenced in the attention-item store
            }
            lineItemMessages = addLineIdMessage(attentionItem, { ...lineItemMessages });
            modals = addModal(attentionItem, [ ...modals ]);

            const messageAi = generateSnippetMessage('Inline', attentionItem);
            if(messageAi.length && !this.excludedInlineAttentionItems.includes(validationCode)) {
                messages = messages + generateSnippetMessage('Inline', attentionItem) + '|';
            }
        });

        this.footerMessages = footerMessages;
        this.inlineMessages = inlineMessages;
        this.lineItemMessages = lineItemMessages;
        this.modals = modals;
        this.messages = messages;
    }
}

// NZ Bank Account Number requirements ->
// http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/251030
// http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/251032
export const isValidNzBankAccountNumber = (bankAccountNumber) => {
    return /^[0-9]{15,16}$/.test(bankAccountNumber);
};

// AU Bank Account Number and BSB Number requirements ->
// http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/251022
// http://tfs:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/251028
export const isValidAuBankAccountNumber = (bankAccountNumber) => {
    return /^[0-9]{6,9}$/.test(bankAccountNumber);
};

// See: http://tfs.melaleuca.net:8080/tfs/MelaleucaIT/Melaleuca/_workitems/edit/282616
export const prependAuBankAccountNumberWithZeros = (bankAccountNumber) => {
    // If the bankAccountNumber is exactly 6 digits, prepend two zeros
    if(bankAccountNumber.length === 6) {
        return '00' + bankAccountNumber;
    }
    // If the bankAccountNumber is exactly 7 digits, prepend one zero
    if(bankAccountNumber.length === 7) {
        return '0' + bankAccountNumber;
    }
    // Otherwise, return the original value
    return bankAccountNumber;
};

export const isValidBsbNumber = (bsbNumber) => {
    return /^[0-9]{3}-[0-9]{3}$/.test(bsbNumber);
};

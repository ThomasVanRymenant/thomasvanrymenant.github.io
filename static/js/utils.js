// function that resets an animation which has already run, so it can run again from start to end
export function resetAnimationOnEl(el) {
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null; 
}

// function that returns the quantity-expDate pairs of an artikel object
export function getQuantityDatePairs(artikelObj) {
    // quantityKeyRegexp = /^Tal[\d]{1,}$/, pairNrIdentifierRegexp = /\d{1,}$/;
    // const expDateKeyRegexp = /^Datum[\d]{1,}$/;
    
    const pairs = [];
    for (let quantityKey of Object.keys(artikelObj).filter(k => /^Tal[\d]{1,}$/.test(k))) { // iterate over keys which are holding a quantity
        if (Number(artikelObj[quantityKey]) != NaN && Number(artikelObj[quantityKey]) > 0) {
            // store quantity/expiration-date pair
            pairs.push([artikelObj[quantityKey], formatDate(artikelObj[`Datum${quantityKey.match(/\d{1,}$/)}`])]);
        }
    }
    return pairs
}

// clears quantity cells that don't have a valid quantity (example: '/')
export function clearInvalidQuantityCells(articleObj) {

    // const quantityKeyRegexp = /^Tal[\d]{1,}$/;
    const quantityKeyNames = Object.keys(articleObj).filter(key=>/^Tal[\d]{1,}$/.test(key));
    for (let i = 0; i < quantityKeyNames.length; i++) {
        if (String(articleObj[quantityKeyNames[i]]).trim() == '/') {
            // clear 'quantity-cell' and its respective 'date-cell'
            delete articleObj[quantityKeyNames[i]];
            delete articleObj[`Datum${quantityKeyNames[i].slice(3)}`];
        }
    }
}

// helper function (for mergeFiles()) that takes last mentioned location if none was specified in the uploaded spreadsheet
export function guessLocation(arrayOfObjects, arrayCursor) { 
    for (let i = arrayCursor; i >= 0; i--) {
        if (arrayOfObjects[i].Locatie) {
            return arrayOfObjects[i].Locatie
        }
    }
}

// helper function to format a date (from different possible formats) to a specific format
export function formatDate(date) {

    if (date instanceof Date) {
        return `${date.getDate()}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
    }

    date = String(date).replace(/\D{1,}/g, ''); // get rid of anything that's not a digit
    let formattedDate = undefined;
    switch(date.length) {
        case 5:
            formattedDate = '0' + date.substring(0, 1) + '-' +  date.substring(1, 3) + '-' + '20' + date.substring(3, 5);
            break;
        case 6:
            formattedDate = '' + date.substring(0, 2) + '-' +  date.substring(2, 4) + '-' + '20' + date.substring(4, 6);
            break;
        case 7:
            formattedDate = '0' + date.substring(0, 1) + '-' +  date.substring(1, 3) + '-' + date.substring(3, 7);
            break;
        case 8:
            formattedDate = [date.slice(0, 2), '-',  date.slice(2, 4), '-', date.slice(4, 8)].join('');
            break;
        default:
            formattedDate = '/';
    }
    return formattedDate
}

// function that checks if XLSX-library is available
export function XLSXisAvailable() {
    return 'XLSX' in window ? true : false
}

// helper function that reads an excel file and converts it to an array of objects
export const convertExcelToArrayOfObjects = (file) => new Promise((resolve, reject) => {

    if (!XLSXisAvailable()) {
        reject(new Error('Er ging iets mis. Check de wifi-verbinding en probeer opnieuw.\n(XLSX-library is niet beschikbaar)'));
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        let workbook = XLSX.read(event.target.result, {type:"binary",cellDates: true});
        resolve(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]), {header:1, raw:false, dateNF:'dd-mm-yyyy'});
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
})

// async function which "formats" excel-file-row-object (from excel file that is extracted from exactonline) into a workable format and 
export const extractArticleObjects = (excelRows) => new Promise((resolve, reject) => {
    try {

        if (!XLSXisAvailable()) {
            throw new Error('Er ging iets mis. Check de wifi-verbinding en probeer opnieuw.\n(XLSX-library is niet beschikbaar)');
        }

        const L = excelRows.length;
        let articles = [];

        // // delete useless rows
        // for (let i = 0; i < excelRows.length; i++) {
        //     // decide where to splice the array of excelRows (objects)
        //     if (excelRows[i]['__EMPTY_1'] == "Batchnummer" && excelRows[i-1]['__EMPTY'] == "Nummers") {
        //         excelRows.splice(0, i + 1);
        //         // console.log(excelRows);
        //         // i = 0;
        //         break;
        //     }
        // }
    
        // iterate over rows of read excel-file from exactonline
        for (let i = 0, quantDatePairs = [], newArticle = undefined; i < L; i++) {
    
            // if row has data which is in format (7digits - ....)
            if ('__EMPTY' in excelRows[i] && /[0-9]{7}\s-/.test(excelRows[i]['__EMPTY'])) {
    
                // if quantity/date pairs are not undefined
                if (quantDatePairs.length > 0) {
    
                    // sort and store quantity/date pairs in previously encountered article
                    quantDatePairs.sort((a, b) => {
    
                        // sort pairs with a non-specified date after pairs that do have a specified date
                        if (a[1] == '/') return 1
                        if (b[1] == '/') return 0
    
                        let aArr = a[1].split('-'), bArr = b[1].split('-');
                        return new Date(aArr[2], aArr[1], aArr[0]) > new Date(bArr[2], bArr[1], bArr[0])
                    });
    
                    for (let pairNr = 0; pairNr < quantDatePairs.length; pairNr++) {
                        articles[articles.length - 1][`Tal${pairNr + 1}`] = quantDatePairs[pairNr][0];
                        articles[articles.length - 1][`Datum${pairNr + 1}`] = quantDatePairs[pairNr][1];
                    }
                }
                // clear quantity/date pairs
                quantDatePairs = [];
    
                // split cell-data, make new article object with it and append it to array of articles
                newArticle = {
                    Artikelcode: excelRows[i]['__EMPTY'].split('-')[0].trim(),
                    Artikelomschrijving: excelRows[i]['__EMPTY'].split('-')[1].trim()
                };
                articles.push(newArticle);
    
            } else { // else (row is either at the beginning of file or it is a 'quantity/date row')

                // if already found an article-row (in format: 7digits - article description), row must be a 'quantity-date' row
                if (articles.length > 0) {
                    quantDatePairs.push([excelRows[i]['__EMPTY_4'], formatDate(excelRows[i]['__EMPTY_3'])]);
                }
            }
    
        }
        resolve(articles);
    } catch (e) {
        reject(new Error(e));
    }
})
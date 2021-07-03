// import {getQuantityDatePairs, clearInvalidQuantityCells, guessLocation, formatDate, convertExcelToArrayOfObjects, XLSXisAvailable, extractArticleObjects} from './utils.js';
import {
    getQuantityDatePairs, 
    clearInvalidQuantityCells, 
    guessLocation, 
    convertExcelToArrayOfObjects, 
    extractArticleObjects
} from './utils.js';


//---------------------------------------------------------------------------------------------------------
//------------------- helper functions used in navigation-related event-callbacks ------------------- START 
//---------------------------------------------------------------------------------------------------------

// switch the active nav option (!!! currently only designed to handle 2 options !!!)
export function switchActiveNavOption() {

    document.querySelectorAll('.option').forEach((el) => {
        el.classList.contains('active') ? el.classList.remove('active') : el.classList.add('active')
    });
    document.querySelectorAll('.option-title').forEach((el) => {
        el.classList.contains('active') ? el.classList.remove('active') : el.classList.add('active')
    });

};

// switch the action button that is being showed
export function switchActiveButton(newActiveBtn) {

    document.querySelector('.btns-container').querySelectorAll('.btn').forEach((el) => {
        if (el.classList.contains('active')) {
            el.classList.remove('active');
        }
    });
    newActiveBtn.classList.add('active');

};

//-------------------------------------------------------------------------------------------------------
//------------------- helper functions used in navigation-related event-callbacks ------------------- END 
//-------------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
//------------------- helper functions used for working with excel-files ------------------- START
//------------------------------------------------------------------------------------------------

// yet to implement
// function checkMismatchManually(inventToCheck, supposedInvent) {
// }

// function that returns a (sparse) array of article-objects that represent each article's mismatch 
// and it's non-identical (hence mismatching) represenation in the second inputted file
export async function extractMismatchesFromFiles(file1, file2) {

    // initialise an array to store all the mismatching inventories in
    const rowsToOutput = [];

    let maxBatchesFound = 0; // tracker for the -most amount of batches- found in any of the articles
    let colWidths = {};

    // convert every file to an array of objects (excel-rows)
    const invCounted = await convertExcelToArrayOfObjects(file1);
    const L1 = invCounted.length;
    const rowObjects2 = await convertExcelToArrayOfObjects(file2);
    const invSupposed = await extractArticleObjects(rowObjects2);
    const L2 = invSupposed.length;

    // iterate over counted inventory
    for (let i = 0; i < L1; i++) {

        // store articleNR of counted article
        const artikelcode1 = invCounted[i].Artikelcode;

        // iterate over supposed inventory
        for (let j = 0; j < L2; j++) {

            // if articlecodes match
            if (artikelcode1 == invSupposed[j].Artikelcode) {

                // for possible future improvement --> store that article1 is represented in articles extracted from exactonline

                let isMismatch = false;

                clearInvalidQuantityCells(invCounted[i]); // get rid of any unneeded '/' in a cell

                // get article2 quantity/date pairs
                const pairs1 = getQuantityDatePairs(invCounted[i]);
                const pairs2 = getQuantityDatePairs(invSupposed[j]);

                // update maxBatchesFound if necessary
                if (pairs1.length > maxBatchesFound) maxBatchesFound = pairs1.length;
                if (pairs2.length > maxBatchesFound) maxBatchesFound = pairs2.length;

                // format dates of article invCounted[i]
                for (let pairNr = 0; pairNr < pairs1.length; pairNr++) {
                    invCounted[i][`Datum${pairNr + 1}`] = pairs1[pairNr][1];
                }

                // sort pairs1 by date
                pairs1.sort((a, b) => {

                    // sort pairs with a non-specified date after pairs that do have a specified date
                    if (a[1] == '/') return 1
                    if (b[1] == '/') return 0

                    let aArr = a[1].split('-'), bArr = b[1].split('-');

                    return new Date(aArr[2], aArr[1], aArr[0]) > new Date(bArr[2], bArr[1], bArr[0])
                });
                // sort pairs2 by date
                pairs2.sort((a, b) => {

                    // sort pairs with a non-specified date after pairs that do have a specified date
                    if (a[1] == '/') return 1
                    if (b[1] == '/') return 0

                    let aArr = a[1].split('-'), bArr = b[1].split('-');

                    return new Date(aArr[2], aArr[1], aArr[0]) > new Date(bArr[2], bArr[1], bArr[0])
                });

                // if quantity/date pairs DON'T match, add article and it's representative to newRows
                if (pairs1.length === pairs2.length) {

                    for (let pairNr = 0; pairNr < pairs1.length; pairNr++) {
                        if (pairs1[pairNr][0] != pairs2[pairNr][0] || pairs1[pairNr][1] != pairs2[pairNr][1]) {
                            isMismatch = true;
                            break;
                        }
                    }

                } else {
                    isMismatch = true;
                }

                // store mismatching inventory (to output them in a file later on)
                if (isMismatch) {


                    // create extra key that will be placed in the respective column (provided by us) automatically
                    invCounted[i]['Inv. volgens'] = 'Warehouse';
                    invSupposed[j]['Inv. volgens'] = 'Database';
                    rowsToOutput.push(invCounted[i], invSupposed[j], new Object());

                    // update colWidths when needed
                    let objectEntries1 = Object.entries(invCounted[i]);
                    let objectEntries2 = Object.entries(invSupposed[j]);
                    const MINWIDTH = 6;
                    for (let k = 0; k < objectEntries1.length; k++) {
                        if (objectEntries1[k][0] in colWidths) {
                            if (colWidths[objectEntries1[k][0]] < objectEntries1[k][1].toString().length) {
                                colWidths[objectEntries1[k][0]] = objectEntries1[k][1].toString().length;
                            }
                        } else {
                            colWidths[objectEntries1[k][0]] = objectEntries1[k][1].toString().length < MINWIDTH ? MINWIDTH : objectEntries1[k][1].toString().length;
                        }
                    }
                    for (let k = 0; k < objectEntries2.length; k++) {
                        if (objectEntries2[k][0] in colWidths) {
                            if (colWidths[objectEntries2[k][0]] < objectEntries2[k][1].toString().length) {
                                colWidths[objectEntries2[k][0]] = objectEntries2[k][1].toString().length;
                            }
                        } else {
                            colWidths[objectEntries2[k][0]] = objectEntries2[k][1].toString().length < MINWIDTH ? MINWIDTH : objectEntries2[k][1].toString().length;
                        }
                    }
                }
            }
        }
    }

    // adjust column widths near best possible fit 
    colWidths.Locatie -= colWidths.Locatie / 5;
    colWidths.Artikelomschrijving -= colWidths.Artikelomschrijving / 5;
    colWidths.Artikelcode += 2;

    return {
        maxBatchesFound: maxBatchesFound,
        articles: rowsToOutput,
        colWidths: colWidths
    }
}

// merge inventories of two files and initiate download of file with merged inventory
export async function mergeFiles(file1, file2) {

    // // different way to handle the async file reading
    // convertExcelToJSON(file1)
    // .then(data => console.log(data))
    // .catch(error => console.log(error));

    // converteer elke file naar een array van objects (excel-rows)
    const rowObjects1 = await convertExcelToArrayOfObjects(file1);
    const rowObjects2 = await convertExcelToArrayOfObjects(file2);


    // slaag de lengte van beide arrays op als 'primitive-value' voor optimalisatie-redenen
    const L1 = rowObjects1.length;
    const L2 = rowObjects2.length;
    

    // voeg voor al de artikelen in beide files de ontbrekende artikel-locatie toe (waar mogelijk)
    for (let i = 0; i < L1; i++) {
        if (!Object.keys(rowObjects1[i]).includes('Locatie') && !Object.keys(rowObjects1[i]).includes('locatie')) {
            rowObjects1[i].Locatie = guessLocation(rowObjects1, i);
        }
    }
    for (let i = 0; i < L2; i++) {
        if (!Object.keys(rowObjects2[i]).includes('Locatie') && !Object.keys(rowObjects2[i]).includes('locatie')) {
            rowObjects2[i].Locatie = guessLocation(rowObjects2, i);
        }
    }
    
    // initialise a variable to store the max number of batches from all articles
    let maxBatchesFound = 0;

    // 'merge' the data from the articles that are present in both files
    for (let i = 0; i < L1; i++) {

        const artikelcode1 = rowObjects1[i].Artikelcode;
        const quantAndDatePairs1 = getQuantityDatePairs(rowObjects1[i]);

        for (let j = 0; j < rowObjects2.length; j++) {
            const quantAndDatePairs2 = getQuantityDatePairs(rowObjects2[j]);

            // format dates of artikel in file2
            for (let pairNr = 0; pairNr < quantAndDatePairs2.length; pairNr++) {
                rowObjects2[j][`Datum${pairNr + 1}`] = quantAndDatePairs2[pairNr][1];
            }

            // if artikel from file2 has same article-nr as article in file1, merge their quantity/date-pairs
            if (artikelcode1 == rowObjects2[j].Artikelcode) {

                // increase quantity from file1 with quantity from file2 OR just add quantity/date pair from file2
                if (quantAndDatePairs2.length > 0) {
                    for (let pairToHandle of quantAndDatePairs2) {

                        let dateMatchFound = false;
                        if (quantAndDatePairs1) {
                            for (let pair of quantAndDatePairs1) {
                                if (pair[1] === pairToHandle[1]) {
                                    pair[0] += pairToHandle[0];
                                    dateMatchFound = true;
                                }
                            }
                        }

                        // if no date-match is found, just add quantity-date pair to file1
                        if (!dateMatchFound) quantAndDatePairs1.push(pairToHandle);
                    }
                }

                // update maxBatchesFound if needed
                if (quantAndDatePairs1.length > maxBatchesFound) maxBatchesFound = quantAndDatePairs1.length;

                // sort pairs (if any) by date
                if (quantAndDatePairs1.length > 0) {
                    
                    quantAndDatePairs1.sort((a, b) => {

                        // sort pairs with a non-specified date after pairs that do have a specified date
                        if (a[1] == '/') return 1
                        if (b[1] == '/') return 0

                        let aArr = a[1].split('-'), bArr = b[1].split('-');
                        return new Date(aArr[2], aArr[1], aArr[0]) > new Date(bArr[2], bArr[1], bArr[0])
                    });

                    // overwrite existing pair (with formatted date) or create new quantity-date pair 
                    for (let pairNr = 0; pairNr < quantAndDatePairs1.length; pairNr++) {
                        rowObjects1[i][`Tal${pairNr + 1}`] = quantAndDatePairs1[pairNr][0];
                        rowObjects1[i][`Datum${pairNr + 1}`] = quantAndDatePairs1[pairNr][1];
                    }
                }

                // append location from rowObjects2 to location in rowObjects1
                if (rowObjects2[j].Locatie) {
                    if (rowObjects1[i].Locatie) {
                        rowObjects1[i].Locatie += ', ' + rowObjects2[j].Locatie;
                    } else {
                        rowObjects1[i].Locatie = '?, ' + rowObjects2[j].Locatie;
                    }
                } else {
                    if (rowObjects1[i].Locatie) {
                        rowObjects1[i].Locatie += ', ' + '?';
                    } else {
                        rowObjects1[i].Locatie = '?, ?';
                    }
                }

                // remove article object from file2, so in the end -> only articles unique to file2 will 'remain' in file2
                rowObjects2.splice(j, 1);
                j--;
            } 
        }

        // get rid of unnecessary '/'es in batch quantity and date fields, so they won't get rendered in file
        clearInvalidQuantityCells(rowObjects1[i]); 
    }

    // add the articles which are only present in file2, to file1
    for (let artikel of rowObjects2) {

        // update maxBatchesFound if needed
        const pairsAmount = getQuantityDatePairs(artikel).length;
        if (pairsAmount > maxBatchesFound) maxBatchesFound = pairsAmount;

        if (!artikel.Locatie) artikel.Locatie = '?';
        rowObjects1.push(artikel);
    }

    // compute the max-width for each column
    let colWidths = {};
    const MINWIDTH = 6;
    for (let articleNr = 0; articleNr < rowObjects1.length; articleNr++) {
        // get key/value pairs
        let objectEntries = Object.entries(rowObjects1[articleNr]);
        for (let k = 0; k < objectEntries.length; k++) {
            if (objectEntries[k][0] in colWidths) {
                if (colWidths[objectEntries[k][0]] < objectEntries[k][1].toString().length) {
                    colWidths[objectEntries[k][0]] = objectEntries[k][1].toString().length;
                }
            } else {
                colWidths[objectEntries[k][0]] = objectEntries[k][1].toString().length < MINWIDTH ? MINWIDTH : objectEntries[k][1].toString().length;
            }
        }
    }

    // adjust column widths near best possible fit 
    colWidths.Locatie -= colWidths.Locatie / 5;
    colWidths.Artikelomschrijving -= colWidths.Artikelomschrijving / 5;
    colWidths.Artikelcode += 2;

    return {
        maxBatchesFound: maxBatchesFound,
        articles: rowObjects1,
        colWidths: colWidths
    }
}
//----------------------------------------------------------------------------------------------
//------------------- helper functions used for working with excel-files ------------------- END
//----------------------------------------------------------------------------------------------
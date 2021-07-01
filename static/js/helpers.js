import * as utils from './utils.js';


//---------------------------------------------------------------------------------------------------------
//------------------- helper functions used in navigation-related event-callbacks ------------------- START 
//---------------------------------------------------------------------------------------------------------

// switch the active nav option (!!! currently only designed to handle 2 options !!!)
export function switchActiveNavOption() {
    document.querySelectorAll('.option').forEach((el) => {
        el.classList.contains('active') ? el.classList.remove('active') : el.classList.add('active')
    })
    document.querySelectorAll('.option-title').forEach((el) => {
        el.classList.contains('active') ? el.classList.remove('active') : el.classList.add('active')
    })
};

// switch the action button that is being showed
export function switchActiveButton(newActiveBtn) {
    document.querySelector('.btns-container').querySelectorAll('.btn').forEach((el) => {
        if (el.classList.contains('active')) {
            el.classList.remove('active');
        }
    })
    newActiveBtn.classList.add('active');
}

//-------------------------------------------------------------------------------------------------------
//------------------- helper functions used in navigation-related event-callbacks ------------------- END 
//-------------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
//------------------- helper functions used for working with excel-files ------------------- START
//------------------------------------------------------------------------------------------------

// function filterMismatchesManually(inventToCheck, supposedInvent) {
    
// }

// 
export async function generateFileWithMismatchingInv(file1, file2) {

    // initialise an array to store all the mismatching inventories in
    const mismatchingRows = [];

    let maxBatchesFound = 0; // tracker for the -most amount of batches- found in any of the articles

    // converteer elke file naar een array van objects (excel-rows)
    const invCounted = await utils.convertExcelToArrayOfObjects(file1);
    const L1 = invCounted.length;
    const rowObjects2 = await utils.convertExcelToArrayOfObjects(file2);
    const invSupposed = await utils.extractArticleObjects(rowObjects2);
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


                utils.clearInvalidQuantityCells(invCounted[i]);
                // get article2 quantity/date pairs
                const pairs1 = utils.getQuantityDatePairs(invCounted[i]);
                const pairs2 = utils.getQuantityDatePairs(invSupposed[j]);

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
                    // mismatchingRows.push(invCounted[i], invSupposed[j], new Object({' ': ' '}));
                    mismatchingRows.push(invCounted[i], invSupposed[j], new Object());
                }
            }
        }
    }

    return {
        maxBatchesFound: maxBatchesFound,
        articles: mismatchingRows
    }
}

// merge inventories of two files and initiate download of file with merged inventory
export async function generateMergedFile(file1, file2) {

    // convertExcelToJSON(file1)
    // .then(data => console.log(data))
    // .catch(error => console.log(error));

    // converteer elke file naar een array van objects (excel-rows)
    const rowObjects1 = await utils.convertExcelToArrayOfObjects(file1);
    const rowObjects2 = await utils.convertExcelToArrayOfObjects(file2);

    // slaag de lengte van beide arrays op als 'primitive-value' voor optimalisatie-redenen
    const L1 = rowObjects1.length;
    const L2 = rowObjects2.length;

    // voeg voor al de artikelen in beide files de ontbrekende artikel-locatie toe (waar mogelijk)
    for (let i = 0; i < L1; i++) {
        if (!Object.keys(rowObjects1[i]).includes('Locatie') && !Object.keys(rowObjects1[i]).includes('locatie')) {
            rowObjects1[i].Locatie = utils.guessLocation(rowObjects1, i);
        }
    }
    for (let i = 0; i < L2; i++) {
        if (!Object.keys(rowObjects2[i]).includes('Locatie') && !Object.keys(rowObjects2[i]).includes('locatie')) {
            rowObjects2[i].Locatie = utils.guessLocation(rowObjects2, i);
        }
    }

    // check of er in de 2de file artikelen zijn die in de 1ste file ook voorkomen. 
    // Zo ja, voeg de 'aantal/datum'-paren van het artikel in de 2de file toe aan die van het artikel in de 1ste file
    // let quantAndDatePairs1 = [], quantAndDatePairs2 = [];

    // 'merge' the data from the articles that are present in both files
    for (let i = 0; i < L1; i++) {

        const artikelcode1 = rowObjects1[i].Artikelcode;
        const quantAndDatePairs1 = utils.getQuantityDatePairs(rowObjects1[i]);

        for (let j = 0; j < rowObjects2.length; j++) {
            const quantAndDatePairs2 = utils.getQuantityDatePairs(rowObjects2[j]);

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
                                    dateMatchFound = true;
                                    pair[0] += pairToHandle[0];
                                }
                            }
                        }

                        // if no date-match is found, just add quantity-date pair to file1
                        if (!dateMatchFound) quantAndDatePairs1.push(pairToHandle);
                    }
                }

                if (quantAndDatePairs1.length > 0) {
                    // sort pairs by date
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

                // verwijder artikel uit file2, zodat in file2 enkel de artikelen (die niet vernoemd zijn in file1) overblijven 
                rowObjects2.splice(j, 1);
                j--;
            } 
        }

        // get rid of unnecessary '/'es in batch quantity and date fields, so they won't get rendered in file
        utils.clearInvalidQuantityCells(rowObjects1[i]); 
    }

    // add the articles which are only present in file2, to file1
    for (let artikel of rowObjects2) {
        if (!artikel.Locatie) artikel.Locatie = '?';
        rowObjects1.push(artikel);
    }

    return rowObjects1
}
//----------------------------------------------------------------------------------------------
//------------------- helper functions used for working with excel-files ------------------- END
//----------------------------------------------------------------------------------------------
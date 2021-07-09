import {extractMismatchesFromFiles, mergeFiles, toggleInfoModalContent} from './helpers.js';
import {resetAnimationOnEl} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // clear file-input-fields on page-reload
    document.getElementById('file-input-1').value = '';
    document.getElementById('file-input-2').value = '';

    // get reference to uploaded file(s) and call a function when a file(s) gets selected
    let fileInput1 = document.getElementById('file-input-1'), file1 = undefined;
    let fileInput2 = document.getElementById('file-input-2'), file2 = undefined;
    fileInput1.addEventListener('change', (event) => {

        if (event.target.files.length < 2 && event.target.files[0]) {
            const fileNameHolder = document.querySelector('.file-name-field-1');
            resetAnimationOnEl(fileNameHolder);
            fileNameHolder.style.animationPlayState = 'running';
            file1 = event.target.files[0];
            fileNameHolder.innerHTML = file1.name.substring(0, file1.name.lastIndexOf('.'));
        } else {
            file1 = undefined;
            alert('Er zijn teveel files geselecteerd. Maximum 1 file per input-veld');
        }

    });
    fileInput2.addEventListener('change', (event) => {

        if (event.target.files.length < 2 && event.target.files[0]) {
            const fileNameHolder = document.querySelector('.file-name-field-2');
            resetAnimationOnEl(fileNameHolder);
            fileNameHolder.style.animationPlayState = 'running';
            file2 = event.target.files[0];
            fileNameHolder.innerHTML = file2.name.substring(0, file2.name.lastIndexOf('.'));
        } else {
            file2 = undefined;
            alert('Er zijn teveel files geselecteerd. Maximum 1 file per input-veld');
        }
        
    });

    // main navigation functionality
    document.getElementsByClassName('option filter')[0].addEventListener('click', (e) => {

        e.stopPropagation(); // stop event from bubbling up the DOM
        if (!e.target.classList.contains('active')) {
            document.querySelector('.sub-nav-replacer').classList.remove('active');
            document.getElementById('app-body').style.borderTopLeftRadius = '0px';
            document.querySelector('.sub-nav').classList.add('active');
            let labels = document.querySelector('.file-inputs-container').querySelectorAll('label');
            let fileInfo = 'in te vullen inventaris';
            if (document.querySelector('.sub-nav').querySelector('.option.single').classList.contains('active')) {
                fileInfo = 'getelde inventaris';
            }
            labels[0].querySelector(".info").innerHTML = `${fileInfo}`;
            labels[1].querySelector(".info").innerHTML = 'inventaris volgens database';
            switchActiveNavOption();
            switchActiveButton(document.querySelector('.btn.filter'));
            toggleInfoModalContent(document.getElementById('info-modal-container'), document.getElementById('info-modal-container').querySelector('#info-compare-multiple'));
        }

    });
    document.getElementsByClassName('option merge')[0].addEventListener('click', (e) => {

        e.stopPropagation(); // stop event from bubbling up the DOM
        if (!e.target.classList.contains('active')) {
            document.querySelector('.sub-nav').classList.remove('active');
            document.getElementById('app-body').style.borderTopLeftRadius = '5px';
            document.querySelector('.sub-nav-replacer').classList.add('active');

            let labels = document.querySelector('.file-inputs-container').querySelectorAll('label');
            labels[0].querySelector(".info").innerHTML = '';
            labels[1].querySelector(".info").innerHTML = '';
            switchActiveNavOption();
            switchActiveButton(document.querySelector('.btn.merge'));
            toggleInfoModalContent(document.getElementById('info-modal-container'), document.getElementById('info-modal-container').querySelector('#info-merge'));
        }

    });

    // sub navigation functionality
    
    document.getElementById('option-multiple').addEventListener('click', (e) => {

        console.log('code runs1');
        e.stopPropagation();
        if (!e.target.classList.contains('active')) {
            console.log('code runs2');
            let labels = document.querySelector('.file-inputs-container').querySelectorAll('label');
            labels[0].querySelector(".info").innerHTML = 'getelde inventaris';
            labels[1].querySelector(".info").innerHTML = 'inventaris volgens database';

            switchActiveButton(document.querySelector('.btn.filter'));
            document.getElementById('option-single').classList.remove('active');
            e.target.classList.add('active');
            toggleInfoModalContent(document.getElementById('info-modal-container'), document.getElementById('info-modal-container').querySelector('#info-compare-multiple'));
        }

    });
    document.getElementById('option-single').addEventListener('click', (e) => {

        e.stopPropagation(); // stop event from bubbling up the DOM
        if (!e.target.classList.contains('active')) {

            // until functionality is build, don't let users visit this page
            alert('Niet beschikbaar');
            return

            // // unused functionality (FOR NOW!)
            // let labels = document.querySelector('.file-inputs-container').querySelectorAll('label');
            // labels[0].querySelector(".info").innerHTML = 'in te vullen inventaris';
            // labels[1].querySelector(".info").innerHTML = 'inventaris volgens database';
            // switchActiveButton(document.querySelector('.btn.check-manual'));
            // document.getElementById('option-multiple').classList.remove('active');
            // e.target.classList.add('active');
        }

    });

    // modal functionality
    document.querySelector('.info-icon-wrapper').addEventListener('click', () => {
        // open info-modal
        document.getElementById('info-modal-container').classList.add('active')
    });
    document.getElementById('modal-closeBtn').addEventListener('click', () => {
        // open info-modal
        document.getElementById('info-modal-container').classList.remove('active')
    });
    document.getElementById('info-modal-container').addEventListener('click', (e) => {
        // open info-modal
        if (e.target.classList.contains('modal-container')) {
            document.getElementById('info-modal-container').classList.remove('active');
        }
    });
    
    
    // on click of the merge-button, merge files and automatically download the resulting file
    document.getElementById('mergeFilesBtn').addEventListener('click', () => {

        if (!(file1 && file2)) {
            !file1 && !file2 ? alert('Er zijn geen files geselecteerd') : 
                alert(file1 ? 'File 2 is niet geselecteerd' : 'File 1 is niet geselecteerd');
        } else {

            mergeFiles(file1, file2)
            .then(data => {

                // configure the sheet's headers
                let headers = ['Locatie', 'Artikelcode', 'Artikelomschrijving'];
                // add the amount of batch (amount/date) headers needed)
                for (let i = 1; i <= data.maxBatchesFound.length; i++) {
                    headers.push(`Tal${i}`, `Datum${i}`);
                }

                // create workbook and add the created sheet to it
                let workbook = XLSX.utils.book_new();
                let worksheet = XLSX.utils.json_to_sheet(data.articles, {header:headers});

                // configure the column-widths
                const colWidthsActual = [];
                colWidthsActual.push(
                    {width: data.colWidths['Locatie']},
                    {width: data.colWidths['Artikelcode']},
                    {width:data.colWidths['Artikelomschrijving']});
                for (let i = 1; i <= data.maxBatchesFound; i++) {
                    colWidthsActual.push({width:data.colWidths[`Tal${i}`]});
                    colWidthsActual.push({width:data.colWidths[`Datum${i}`]});
                }
                worksheet['!cols'] = colWidthsActual;

                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

                // generate an XLSX file
                XLSX.writeFile(workbook, "invSamengevoegd.xlsx");

            })
            .catch(e=>console.log(e));
        }

    });

    // on click of the compare-by-excel button, check if article inventory matches with that same article's inventory in file2
    // and download file for which the inventories do not match
    document.getElementById('compareInvByFileBtn').addEventListener('click', () => {

        if (!(file1 && file2)) {
            !file1 && !file2 ? alert('Er zijn geen files geselecteerd') : alert(file1 ? 'File 2 is niet geselecteerd' : 'File 1 is niet geselecteerd');
        } else {

            extractMismatchesFromFiles(file1, file2)
            .then(data => {

                if (data.articles.length == 0) {
                    alert("Alles klopt.\nDe inventaris van al de artikelen in \'File 1\' komt overeen met de respectievelijke inventaris in \'File 2\'.");
                } else {

                    // configure the sheet's headers
                    let headers = ['Inv. volgens', 'Locatie', 'Artikelcode', 'Artikelomschrijving'];
                    // add the amount of batch (amount/date) headers needed)
                    for (let i = 1; i <= data.maxBatchesFound.length; i++) {
                        headers.push(`Tal${i}`, `Datum${i}`);
                    }

                    // create workbook and add the created sheet to it
                    let workbook = XLSX.utils.book_new();
                    const worksheet = XLSX.utils.json_to_sheet(data.articles, {header:headers, blankRows: true});

                    // configure the column-widths
                    const colWidthsActual = [];
                    colWidthsActual.push(
                        {width:data.colWidths['Inv. volgens']}, 
                        {width:data.colWidths['Locatie']}, 
                        {width:data.colWidths['Artikelcode']}, 
                        {width:data.colWidths['Artikelomschrijving']});
                    for (let i = 1; i <= data.maxBatchesFound; i++) {
                        colWidthsActual.push({width:data.colWidths[`Tal${i}`]});
                        colWidthsActual.push({width:data.colWidths[`Datum${i}`]});
                    }
                    worksheet['!cols'] = colWidthsActual;

                    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

                    // generate an XLSX file
                    XLSX.writeFile(workbook, "invDifferences.xlsx");
                }
            })
            .catch(e=>console.log(e));

        }
    })
});


// -----------------------------------------------------------------------
// ------------------ navigation helper functions ------------------ START
// -----------------------------------------------------------------------

// switch the active nav option (!!! only designed to handle 2 options !!!)
function switchActiveNavOption() {

    document.querySelectorAll('.option').forEach((el) => {
        el.classList.contains('active') ? el.classList.remove('active') : el.classList.add('active')
    });
    document.querySelectorAll('.option-title').forEach((el) => {
        el.classList.contains('active') ? el.classList.remove('active') : el.classList.add('active')
    });
};

// switch the action button that is being showed
function switchActiveButton(newActiveBtn) {

    document.querySelector('.btns-container').querySelectorAll('.btn').forEach((el) => {
        if (el.classList.contains('active')) {
            el.classList.remove('active');
        }
    });
    newActiveBtn.classList.add('active');
};

// -----------------------------------------------------------------------
// ------------------ navigation helper functions -------------------- END
// -----------------------------------------------------------------------
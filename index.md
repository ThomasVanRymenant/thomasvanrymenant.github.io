<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <link rel="icon" type="image/png" sizes="32x32" href="static/images/icons/favicon/android-chrome-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="static/images/icons/favicon/apple-touch-icon.png">
    <link rel="manifest" href="static/images/icons/favicon/site.webmanifest">

    <link rel="stylesheet" href="static/css/styles.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js" integrity="sha512-jDEmOIskGs/j5S3wBWQAL4pOYy3S5a0y3Vav7BgXHnCVcUBXkf1OqzYS6njmDiKyqes22QEX8GSIZZ5pGk+9nA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <title>Lokkal - Spreadsheet Automation</title>
</head>
<body>

    <div id="app-container">
        <nav class="main-nav">
            <div class="option filter active">Vergelijk inventaris</div>
            <div class="option merge">Inventaris samenvoegen</div>
        </nav>
        <nav class="sub-nav active">
            <div id="option-single" class="option single">Handmatig</div>
            <div id="option-multiple" class="option multiple active">Via excel spreadsheet</div>
        </nav>
        <div class="sub-nav-replacer"></div>
        <div id="app-body">

            <span id="filter-title" class="option-title active">
                <div>Selecteer de benodigde excel files</div>
            </span>
            <span id="merge-title" class="option-title">
                <div>Selecteer 2 excel files waarvan de inventarissen <strong>samengevoegd</strong> moeten worden</div>
            </span>
            <div class="file-inputs-container">
                <label for="file-input-1">
                    <span>File 1</span>
                    <span class="info">getelde inventaris</span>
                    <svg class="icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 512.001 512.001" style="enable-background:new 0 0 512.001 512.001;" xml:space="preserve">
                        <path class="lightgreen" d="M512.001,256.006c0,141.395-114.606,255.998-255.996,255.994
                            C114.606,512.004,0.001,397.402,0.001,256.006C-0.007,114.61,114.606,0,256.005,0C397.395,0,512.001,114.614,512.001,256.006z"/>
                        <path class="darkgreen" d="M498.97,336.634L310.696,148.357c-0.001-0.001-0.002-0.001-0.002-0.001l-1.666-1.667l-1.668-1.668
                            l-46.714-46.713l-1.666-1.667l-1.668-1.668l-0.002-0.001l-1.666-1.667c-0.001-0.001-0.001-0.001-0.001-0.001l-1.667-1.668
                            c-0.636-0.637-1.394-1.146-2.237-1.498c-0.837-0.349-1.743-0.538-2.671-0.538H96.534c-3.833,0-6.933,3.105-6.933,6.933v291.2
                            c0,2.347,1.241,4.32,3.025,5.574c0.463,0.659,112.783,112.978,113.441,113.441c0.117,0.167,0.295,0.272,0.426,0.426
                            c16.023,3.14,32.569,4.828,49.513,4.827C369.214,512.003,465.185,438.501,498.97,336.634z"/>
                        <g>
                            <path style="fill:#FFFFFF;" d="M103.467,103.467h138.667v62.4c0,3.829,3.101,6.933,6.933,6.933h62.4v48.533h13.867v-55.44
                                c0-0.004-0.002-0.009-0.002-0.014l0.002-0.013c0-0.739-0.206-1.415-0.42-2.083c-0.058-0.176-0.038-0.373-0.11-0.545
                                c-0.365-0.89-0.91-1.676-1.589-2.334l-69.239-69.267c-0.635-0.637-1.394-1.146-2.238-1.498c-0.837-0.351-1.742-0.54-2.67-0.54
                                H96.534c-3.833,0-6.933,3.104-6.933,6.933v291.2c0,3.829,3.101,6.933,6.933,6.933h138.667V380.8H103.467V103.467z M256.001,113.275
                                l45.639,45.659h-45.639V113.275z"/>
                            <path style="fill:#FFFFFF;" d="M332.267,242.133c-49.698,0-90.133,40.432-90.133,90.133s40.435,90.133,90.133,90.133
                                s90.133-40.432,90.133-90.133S381.965,242.133,332.267,242.133z M332.267,408.533c-42.053,0-76.267-34.213-76.267-76.267
                                S290.214,256,332.267,256s76.267,34.213,76.267,76.267S374.321,408.533,332.267,408.533z"/>
                            <path style="fill:#FFFFFF;" d="M337.231,289.618c-1.26-1.3-3.009-2.121-4.964-2.121c-1.955,0-3.705,0.82-4.964,2.121l-30.19,30.19
                                c-2.708,2.708-2.708,7.095,0,9.804c2.708,2.708,7.095,2.708,9.804,0l18.417-18.416v58.866c0,3.829,3.101,6.933,6.933,6.933
                                s6.933-3.104,6.933-6.933v-58.866l18.417,18.417c1.355,1.355,3.129,2.031,4.902,2.031s3.548-0.677,4.902-2.031
                                c2.708-2.708,2.708-7.095,0-9.804L337.231,289.618z"/>
                        </g>
                        <g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>
                    </svg>
                    <div class="file-name-field-1"><i>geen file geselecteerd</i></div>

                </label>
                <input id="file-input-1" class="" type="file" accept=".xls,.xlsx">
                <label for="file-input-2">
                    <span>File 2</span>
                    <span class="info">inventaris volgens database</span>
                    <svg class="icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 512.001 512.001" style="enable-background:new 0 0 512.001 512.001;" xml:space="preserve">
                        <path class="lightgreen" d="M512.001,256.006c0,141.395-114.606,255.998-255.996,255.994
                            C114.606,512.004,0.001,397.402,0.001,256.006C-0.007,114.61,114.606,0,256.005,0C397.395,0,512.001,114.614,512.001,256.006z"/>
                        <path class="darkgreen" d="M498.97,336.634L310.696,148.357c-0.001-0.001-0.002-0.001-0.002-0.001l-1.666-1.667l-1.668-1.668
                            l-46.714-46.713l-1.666-1.667l-1.668-1.668l-0.002-0.001l-1.666-1.667c-0.001-0.001-0.001-0.001-0.001-0.001l-1.667-1.668
                            c-0.636-0.637-1.394-1.146-2.237-1.498c-0.837-0.349-1.743-0.538-2.671-0.538H96.534c-3.833,0-6.933,3.105-6.933,6.933v291.2
                            c0,2.347,1.241,4.32,3.025,5.574c0.463,0.659,112.783,112.978,113.441,113.441c0.117,0.167,0.295,0.272,0.426,0.426
                            c16.023,3.14,32.569,4.828,49.513,4.827C369.214,512.003,465.185,438.501,498.97,336.634z"/>
                        <g>
                            <path style="fill:#FFFFFF;" d="M103.467,103.467h138.667v62.4c0,3.829,3.101,6.933,6.933,6.933h62.4v48.533h13.867v-55.44
                                c0-0.004-0.002-0.009-0.002-0.014l0.002-0.013c0-0.739-0.206-1.415-0.42-2.083c-0.058-0.176-0.038-0.373-0.11-0.545
                                c-0.365-0.89-0.91-1.676-1.589-2.334l-69.239-69.267c-0.635-0.637-1.394-1.146-2.238-1.498c-0.837-0.351-1.742-0.54-2.67-0.54
                                H96.534c-3.833,0-6.933,3.104-6.933,6.933v291.2c0,3.829,3.101,6.933,6.933,6.933h138.667V380.8H103.467V103.467z M256.001,113.275
                                l45.639,45.659h-45.639V113.275z"/>
                            <path style="fill:#FFFFFF;" d="M332.267,242.133c-49.698,0-90.133,40.432-90.133,90.133s40.435,90.133,90.133,90.133
                                s90.133-40.432,90.133-90.133S381.965,242.133,332.267,242.133z M332.267,408.533c-42.053,0-76.267-34.213-76.267-76.267
                                S290.214,256,332.267,256s76.267,34.213,76.267,76.267S374.321,408.533,332.267,408.533z"/>
                            <path style="fill:#FFFFFF;" d="M337.231,289.618c-1.26-1.3-3.009-2.121-4.964-2.121c-1.955,0-3.705,0.82-4.964,2.121l-30.19,30.19
                                c-2.708,2.708-2.708,7.095,0,9.804c2.708,2.708,7.095,2.708,9.804,0l18.417-18.416v58.866c0,3.829,3.101,6.933,6.933,6.933
                                s6.933-3.104,6.933-6.933v-58.866l18.417,18.417c1.355,1.355,3.129,2.031,4.902,2.031s3.548-0.677,4.902-2.031
                                c2.708-2.708,2.708-7.095,0-9.804L337.231,289.618z"/>
                        </g>
                        <g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>
                    </svg>
                    <div class="file-name-field-2"><i>geen file geselecteerd</i></div>
                </label>
                <input id="file-input-2" class="" type="file" accept=".xls,.xlsx">
            </div>
            <div class="btns-container">
                <button id="" class="btn check-manual" type="button">Begin met inventaris op te maken</button>
                <button id="compareInvByFileBtn" class="btn filter active" type="button">
                    Genereer spreadsheet met NIET-MATCHENDE inventaris
                </button>
                <button id="mergeFilesBtn" class="btn merge" type="button">Genereer samengevoegde spreadsheet</button>
            </div>
        </div>
    </div>

    <script type="module" src="./static/js/main.js"></script>
</body>
</html>

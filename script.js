const modelInput = document.getElementById("modelInput");
const snInput = document.getElementById("snInput");
const dateInput = document.getElementById("dateInput");

function generateLabel() {

    const model = modelInput.value.trim().toUpperCase();
    const sn = snInput.value.trim().toUpperCase();
    const date = dateInput.value.trim();

    const printArea = document.getElementById("printArea");

    printArea.innerHTML = `
        <article class="label">
            <div class="content">

                <div class="data-row model-row">
                    <div class="left-title">Model:</div>

                    <div class="barcode-block">
                        <div class="value-text">${model}</div>
                        <svg id="modelBarcode"></svg>
                    </div>
                </div>

                <div class="data-row sn-row">
                    <div class="left-title">S/N:</div>

                    <div class="barcode-block">
                        <div class="value-text">${sn}</div>
                        <svg id="snBarcode"></svg>
                    </div>
                </div>

                <div class="bottom-row">
                    <div class="date-box">
                        <span class="date-title">Date:</span>
                        <span>${date}</span>
                    </div>

                    <div class="brand-logo">
                        Tineco
                    </div>
                </div>

            </div>
        </article>
    `;

    if (typeof JsBarcode !== "undefined") {

        JsBarcode("#modelBarcode", model, {
            format: "CODE128",
            displayValue: false,
            width: 2,
            height: 60,
            margin: 0
        });

        JsBarcode("#snBarcode", sn, {
            format: "CODE128",
            displayValue: false,
            width: 2,
            height: 60,
            margin: 0
        });

    } else {

        console.error("JsBarcode library not loaded.");

    }
}

document.addEventListener("DOMContentLoaded", () => {

    generateLabel();

    modelInput.addEventListener("input", generateLabel);
    snInput.addEventListener("input", generateLabel);
    dateInput.addEventListener("input", generateLabel);

    const printCurrentBtn =
        document.getElementById("printCurrentBtn");

    if (printCurrentBtn) {

        printCurrentBtn.addEventListener("click", () => {
            window.print();
        });

    }

});

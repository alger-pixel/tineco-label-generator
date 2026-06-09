const modelInput = document.getElementById("modelInput");
const snInput = document.getElementById("snInput");
const dateInput = document.getElementById("dateInput");

const addBtn = document.getElementById("addBtn");
const printCurrentBtn = document.getElementById("printCurrentBtn");
const printAllBtn = document.getElementById("printAllBtn");
const clearBtn = document.getElementById("clearBtn");
const fileInput = document.getElementById("fileInput");
const downloadTemplateBtn = document.getElementById("downloadTemplateBtn");

const offsetXInput = document.getElementById("offsetXInput");
const offsetYInput = document.getElementById("offsetYInput");
const scaleInput = document.getElementById("scaleInput");

const printArea = document.getElementById("printArea");
const countBadge = document.getElementById("countBadge");

let labels = [
  {
    model: "FW0704BOUS",
    sn: "TCN7YXNJJ7940",
    date: "JUN-2026"
  }
];

function cleanValue(value) {
  return String(value || "").trim().toUpperCase();
}

function getCurrentLabel() {
  return {
    model: cleanValue(modelInput.value),
    sn: cleanValue(snInput.value),
    date: cleanValue(dateInput.value) || "JUN-2026"
  };
}

function validateLabel(label) {
  if (!label.model) {
    alert("Model Number is required.");
    return false;
  }

  if (!label.sn) {
    alert("S/N Number is required.");
    return false;
  }

  return true;
}

function createLabelElement(item) {
  const article = document.createElement("article");
  article.className = "label";

  const x = Number(offsetXInput.value || 0);
  const y = Number(offsetYInput.value || 0);
  const scale = Number(scaleInput.value || 100) / 100;

  article.style.transform = `translate(${x}mm, ${y}mm) scale(${scale})`;

  article.innerHTML = `
    <div class="content">

      <div class="data-row model-row">
        <div class="left-title">Model:</div>

        <div class="barcode-block">
          <div class="value-text">${item.model}</div>
          <svg class="barcode model-barcode"></svg>
        </div>
      </div>

      <div class="data-row sn-row">
        <div class="left-title">S/N:</div>

        <div class="barcode-block">
          <div class="value-text">${item.sn}</div>
          <svg class="barcode sn-barcode"></svg>
        </div>
      </div>

      <div class="bottom-row">
        <div class="date-box">
          <span class="date-title">Date:</span>
          <span>${item.date}</span>
        </div>

        <img src="tineco-logo.png" class="brand-logo" alt="Tineco Logo">
      </div>

    </div>
  `;

  return article;
}

function renderLabels(list = labels) {
  printArea.innerHTML = "";

  list.forEach((item) => {
    const labelElement = createLabelElement(item);
    printArea.appendChild(labelElement);

    const modelBarcode = labelElement.querySelector(".model-barcode");
    const snBarcode = labelElement.querySelector(".sn-barcode");

    if (typeof JsBarcode !== "undefined") {
      JsBarcode(modelBarcode, item.model, {
        format: "CODE128",
        displayValue: false,
        width: 2,
        height: 60,
        margin: 0
      });

      JsBarcode(snBarcode, item.sn, {
        format: "CODE128",
        displayValue: false,
        width: 2,
        height: 60,
        margin: 0
      });
    } else {
      console.error("JsBarcode library is not loaded.");
    }
  });

  if (countBadge) {
    countBadge.textContent = `${list.length} label${list.length === 1 ? "" : "s"}`;
  }
}

function addOrUpdateLabel() {
  const label = getCurrentLabel();

  if (!validateLabel(label)) return;

  const existingIndex = labels.findIndex((x) => x.sn === label.sn);

  if (existingIndex >= 0) {
    labels[existingIndex] = label;
  } else {
    labels.push(label);
  }

  renderLabels(labels);
}

function printCurrentLabel() {
  const label = getCurrentLabel();

  if (!validateLabel(label)) return;

  renderLabels([label]);
  window.print();
  renderLabels(labels);
}

function printAllLabels() {
  if (!labels.length) {
    alert("No labels to print.");
    return;
  }

  renderLabels(labels);
  window.print();
}

function clearLabels() {
  if (!confirm("Clear all labels?")) return;

  labels = [];
  renderLabels(labels);
}

function downloadTemplate() {
  const csv =
    "MODEL,SN,DATE\n" +
    "FW0704BOUS,TCN7YXNJJ7940,JUN-2026\n" +
    "FW0704BOUS,TCN7YXNJJ7941,JUN-2026\n";

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tineco-label-template.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function normalizeHeader(name) {
  return String(name || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function getField(row, possibleNames) {
  const keys = Object.keys(row);

  for (const key of keys) {
    const normalized = normalizeHeader(key);

    if (possibleNames.includes(normalized)) {
      return row[key];
    }
  }

  return "";
}

async function importSpreadsheet(file) {
  if (typeof XLSX === "undefined") {
    alert("Excel library is not loaded.");
    return;
  }

  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: "array"
  });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(firstSheet, {
    defval: ""
  });

  const imported = rows
    .map((row) => {
      return {
        model: cleanValue(
          getField(row, ["MODEL", "MODELNUMBER", "MORDEL", "MORDELNUMBER"])
        ),
        sn: cleanValue(
          getField(row, ["SN", "SNNUMBER", "SERIAL", "SERIALNUMBER"])
        ),
        date:
          cleanValue(getField(row, ["DATE", "PRODUCTIONDATE"])) ||
          cleanValue(dateInput.value) ||
          "JUN-2026"
      };
    })
    .filter((x) => x.model && x.sn);

  if (!imported.length) {
    alert("No valid rows found. Please use columns MODEL and SN.");
    return;
  }

  labels = imported;

  modelInput.value = labels[0].model;
  snInput.value = labels[0].sn;
  dateInput.value = labels[0].date;

  renderLabels(labels);

  alert(`${labels.length} labels imported.`);
}

document.addEventListener("DOMContentLoaded", () => {
  renderLabels([getCurrentLabel()]);

  modelInput.addEventListener("input", () => {
    renderLabels([getCurrentLabel()]);
  });

  snInput.addEventListener("input", () => {
    renderLabels([getCurrentLabel()]);
  });

  dateInput.addEventListener("input", () => {
    renderLabels([getCurrentLabel()]);
  });

  offsetXInput.addEventListener("input", () => {
    renderLabels([getCurrentLabel()]);
  });

  offsetYInput.addEventListener("input", () => {
    renderLabels([getCurrentLabel()]);
  });

  scaleInput.addEventListener("input", () => {
    renderLabels([getCurrentLabel()]);
  });

  addBtn.addEventListener("click", addOrUpdateLabel);
  printCurrentBtn.addEventListener("click", printCurrentLabel);
  printAllBtn.addEventListener("click", printAllLabels);
  clearBtn.addEventListener("click", clearLabels);
  downloadTemplateBtn.addEventListener("click", downloadTemplate);

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      await importSpreadsheet(file);
    } catch (error) {
      console.error(error);
      alert("File import failed. Please check your Excel/CSV format.");
    }
  });
});

// ==UserScript==
// @name         Casphone Connect Table Enhancement
// @namespace    casphone-table-enhancer
// @version      1.8
// @description  Adds interactive controls with price copy button above tables on Casphone Connect portal
// @author       Hossain
// @match        https://www.connect.casphone.com.au/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  "use strict";

  // --- Toast Notification Function ---
  let toastTimeout;
  function showToast(message) {
    const existingToast = document.getElementById("clipboard-toast-userscript");
    if (existingToast) {
      existingToast.remove();
      clearTimeout(toastTimeout);
    }

    const toast = document.createElement("div");
    toast.id = "clipboard-toast-userscript";
    toast.className = "clipboard-toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 2500);
  }

  // --- Add CSS to the page ---
  const style = document.createElement("style");
  style.textContent = `
    /* macOS Style Enhancements */
    :root {
      --macos-system-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      --macos-border-color: rgba(0, 0, 0, 0.15);
      --macos-focus-ring-color: rgba(0, 122, 255, 0.3);
      --macos-control-bg: #f2f2f7;
      --macos-control-bg-hover: rgba(0, 0, 0, 0.05);
      --macos-selection-color: rgba(0, 122, 255, 0.1);
      --macos-border-radius-small: 6px;
      --macos-border-radius-medium: 8px;
      --macos-border-radius-large: 10px;
      --macos-padding-vertical: 6px;
      --macos-padding-horizontal: 10px;
    }

    .table-enhancement-container {
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 16px 0;
    }

    .table-enhancement {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: var(--macos-border-radius-large);
      background-color: var(--macos-control-bg);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.05);
      font-family: var(--macos-system-font);
      font-size: 13px;
      width: fit-content;
      border: 0.5px solid rgba(0,0,0,0.08);
    }

    .searchable-dropdown {
      position: relative;
      display: inline-block;
    }

    .searchable-dropdown input,
    .model-search-input {
      padding: var(--macos-padding-vertical) var(--macos-padding-horizontal);
      border-radius: var(--macos-border-radius-small);
      border: 0.5px solid var(--macos-border-color);
      width: 180px;
      font-size: 13px;
      font-family: var(--macos-system-font);
      outline: none;
      background-color: #ffffff;
      transition: box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out;
      box-shadow: 0 0.5px 1px rgba(0,0,0,0.05) inset;
    }

    .searchable-dropdown input:focus,
    .model-search-input:focus {
      border-color: rgba(0, 122, 255, 0.8);
      box-shadow: 0 0 0 3px var(--macos-focus-ring-color), 0 0.5px 1px rgba(0,0,0,0.05) inset;
    }

    .searchable-dropdown input:hover,
    .model-search-input:hover {
       border-color: rgba(0, 0, 0, 0.3);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: 1000;
      display: none;
      min-width: 220px;
      max-height: 280px;
      overflow-y: auto;
      padding: 5px;
      background-color: rgba(248, 248, 248, 0.7);
      border: 0.5px solid rgba(0, 0, 0, 0.15);
      border-radius: var(--macos-border-radius-medium);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      font-family: var(--macos-system-font);
      font-size: 13px;
    }

    @supports ((-webkit-backdrop-filter: blur(25px)) or (backdrop-filter: blur(25px))) {
      .dropdown-menu {
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        backdrop-filter: blur(25px) saturate(180%);
        background-color: rgba(248, 248, 248, 0.7);
      }
    }

    .dropdown-menu.show {
      display: block;
    }

    .dropdown-item {
      padding: var(--macos-padding-vertical) var(--macos-padding-horizontal);
      color: #333;
      cursor: default;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-radius: var(--macos-border-radius-small);
      margin: 0;
      transition: background-color 0.1s ease;
    }

    .dropdown-item:hover {
      background-color: var(--macos-selection-color);
      color: #222;
    }

    .result-display {
      padding: var(--macos-padding-vertical) var(--macos-padding-horizontal);
      background-color: var(--macos-control-bg);
      border-radius: var(--macos-border-radius-small);
      border: 0.5px solid var(--macos-border-color);
      min-width: 100px;
      min-height: calc(13px + 2 * var(--macos-padding-vertical) + 1px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-family: var(--macos-system-font);
      font-size: 13px;
      color: #333;
      box-shadow: 0 0.5px 1px rgba(0,0,0,0.05) inset;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.05s ease;
      user-select: none;
    }

    .result-display:hover {
      background-color: #e8e8ed;
      border-color: rgba(0, 0, 0, 0.25);
    }

    .result-display:active {
      background-color: #e1e1e6;
      transform: scale(0.98);
    }

    .result-display.placeholder {
      color: #777;
      font-weight: 400;
      cursor: default;
    }
    .result-display.placeholder:hover {
      background-color: var(--macos-control-bg);
      border-color: var(--macos-border-color);
    }
    .result-display.placeholder:active {
      transform: none;
    }

    .dropdown-label,
    .model-search-label {
      font-weight: 500;
      margin-right: 8px;
      font-family: var(--macos-system-font);
      font-size: 13px;
      color: #444;
      user-select: none;
    }

    .model-search-container {
      display: flex;
      align-items: center;
    }

    .model-search-input {
      width: 150px;
    }

    .model-search-input.match-found {
      background-color: #e6ffed;
      border-color: #a0d8af;
    }
    .model-search-input.no-match {
      background-color: #ffebee;
      border-color: #f1b0b7;
    }

    .controls-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .dropdown-input-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Toast Notification Styles */
    .clipboard-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background-color: rgba(40, 40, 40, 0.85);
      color: white;
      padding: 10px 20px;
      border-radius: 15px;
      font-family: var(--macos-system-font);
      font-size: 13px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 0.5px solid rgba(255, 255, 255, 0.2);
    }

    .clipboard-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);

  // --- Main Enhancement Function ---
  function enhanceTables() {
    const tables = document.querySelectorAll("table");

    tables.forEach((table, tableIndex) => {
      if (table.dataset.enhanced) return; // Prevent duplicate enhancements

      const tableRows = table.querySelectorAll("tr");
      if (tableRows.length <= 1) return;

      const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
      if (!headerRow) return;

      const headerCells =
        headerRow.querySelectorAll("th").length > 0
          ? headerRow.querySelectorAll("th")
          : headerRow.querySelectorAll("td");

      let hasModel = false;
      headerCells.forEach((cell) => {
        if (cell.textContent.includes("Model")) hasModel = true;
      });
      if (!hasModel) {
        for (let i = 0; i < tableRows.length; i++) {
          const firstCell = tableRows[i].querySelector("td, th");
          if (firstCell && firstCell.textContent.includes("Model")) {
            hasModel = true;
            break;
          }
        }
      }
      if (!hasModel) return;

      let modelNumberRow = null;
      let modelNumberMap = {};
      for (let i = 0; i < tableRows.length; i++) {
        const firstCell = tableRows[i].querySelector("td, th");
        if (firstCell && firstCell.textContent.trim().includes("Model Number")) {
          modelNumberRow = tableRows[i];
          break;
        }
      }

      const containerDiv = document.createElement("div");
      containerDiv.className = "table-enhancement-container";
      const enhancementDiv = document.createElement("div");
      enhancementDiv.className = "table-enhancement";
      enhancementDiv.id = `table-enhancement-${tableIndex}`;
      containerDiv.appendChild(enhancementDiv);

      let modelSearchInput = null;
      if (modelNumberRow) {
        const modelSearchContainer = document.createElement("div");
        modelSearchContainer.className = "model-search-container";
        const modelSearchLabel = document.createElement("span");
        modelSearchLabel.className = "model-search-label";
        modelSearchLabel.textContent = "Model No:";
        modelSearchInput = document.createElement("input");
        modelSearchInput.type = "text";
        modelSearchInput.className = "model-search-input";
        modelSearchInput.placeholder = "e.g. A1600";
        modelSearchContainer.appendChild(modelSearchLabel);
        modelSearchContainer.appendChild(modelSearchInput);
        enhancementDiv.appendChild(modelSearchContainer);

        const cells = modelNumberRow.querySelectorAll("td, th");
        for (let i = 1; i < cells.length; i++) {
          const cellText = cells[i].textContent.trim();
          if (cellText.length > 0 && cellText !== "-") {
            cellText.split(/,\s*/).forEach((modelNum) => {
              modelNumberMap[modelNum.trim()] = i;
            });
          }
        }
      }

      const controlsContainer = document.createElement("div");
      controlsContainer.className = "controls-container";
      enhancementDiv.appendChild(controlsContainer);

      const columnContainer = document.createElement("div");
      columnContainer.className = "dropdown-input-container";
      const columnLabel = document.createElement("span");
      columnLabel.className = "dropdown-label";
      columnLabel.textContent = "Device:";
      columnContainer.appendChild(columnLabel);
      const columnDropdown = createSearchableDropdown(`column-dropdown-${tableIndex}`, "Search devices...");
      columnContainer.appendChild(columnDropdown.container);

      const rowContainer = document.createElement("div");
      rowContainer.className = "dropdown-input-container";
      const rowLabel = document.createElement("span");
      rowLabel.className = "dropdown-label";
      rowLabel.textContent = "Part/Repair:";
      rowContainer.appendChild(rowLabel);
      const rowDropdown = createSearchableDropdown(`row-dropdown-${tableIndex}`, "Search parts/repairs...");
      rowContainer.appendChild(rowDropdown.container);

      const resultDisplay = document.createElement("div");
      resultDisplay.className = "result-display placeholder";
      resultDisplay.textContent = "Select options";

      resultDisplay.addEventListener("click", () => {
        if (resultDisplay.classList.contains("placeholder")) return;
        const currentText = resultDisplay.textContent;
        const numericValue = currentText.replace(/[^\d.]/g, "");
        if (numericValue) {
          GM_setClipboard(numericValue);
          showToast(`Copied: ${numericValue}`);
        }
      });

      const columns = [];
      const rows = [];

      if (headerRow) {
        const currentHeaderCells =
          headerRow.querySelectorAll("th").length > 0
            ? headerRow.querySelectorAll("th")
            : headerRow.querySelectorAll("td");
        currentHeaderCells.forEach((cell, index) => {
          if (index > 0) {
            columns.push({
              value: index.toString(),
              text: cell.textContent.trim() || `Column ${index}`,
              element: cell,
            });
          }
        });
      }

      for (let i = 1; i < tableRows.length; i++) {
        const firstCell = tableRows[i].querySelector("td");
        if (firstCell && !firstCell.textContent.trim().includes("Model Number")) {
          rows.push({
            value: i.toString(),
            text: firstCell.textContent.trim() || `Row ${i}`,
            element: tableRows[i],
          });
        }
      }

      if (rows.length === 0 || columns.length === 0) {
        console.log("Table Enhancer: Skipping table, no usable rows/columns.");
        containerDiv.remove();
        return;
      }

      populateDropdown(columnDropdown, columns);
      populateDropdown(rowDropdown, rows);

      let selectedColumn = null;
      let selectedRow = null;

      columnDropdown.onSelect = (item) => {
        selectedColumn = item;
        updateResult();
        if (modelSearchInput) {
          modelSearchInput.classList.remove("match-found", "no-match");
        }
      };

      rowDropdown.onSelect = (item) => {
        selectedRow = item;
        updateResult();
      };

      if (modelSearchInput) {
        modelSearchInput.addEventListener("input", (e) => {
          const searchTerm = e.target.value.trim().toUpperCase();
          modelSearchInput.classList.remove("match-found", "no-match");
          if (searchTerm.length >= 2) {
            let foundMatch = false;
            for (const [modelNum, colIndex] of Object.entries(modelNumberMap)) {
              if (modelNum.toUpperCase().includes(searchTerm)) {
                const matchedColumn = columns.find(
                  (col) => col.value === colIndex.toString()
                );
                if (matchedColumn) {
                  columnDropdown.setSelected(matchedColumn);
                  modelSearchInput.classList.add("match-found");
                  foundMatch = true;
                  break;
                }
              }
            }
            if (!foundMatch) modelSearchInput.classList.add("no-match");
          }
        });
      }

      function updateResult() {
        if (selectedRow && selectedColumn) {
          const rowIndex = parseInt(selectedRow.value);
          const colIndex = parseInt(selectedColumn.value);
          const currentTableRows = table.querySelectorAll("tr");
          if (rowIndex < currentTableRows.length) {
            const cells = currentTableRows[rowIndex].querySelectorAll("td");
            if (colIndex < cells.length) {
              const cell = cells[colIndex];
              resultDisplay.textContent = cell.textContent.trim() || "-";
              resultDisplay.classList.remove("placeholder");
              resultDisplay.style.color = "";
            } else {
              resultDisplay.textContent = "N/A";
              resultDisplay.classList.add("placeholder");
              resultDisplay.style.color = "";
            }
          } else {
            resultDisplay.textContent = "Error";
            resultDisplay.classList.add("placeholder");
            resultDisplay.style.color = "#cc0000";
          }
        } else {
          resultDisplay.textContent = "Select options";
          resultDisplay.classList.add("placeholder");
          resultDisplay.style.color = "";
        }
      }

      controlsContainer.appendChild(columnContainer);
      controlsContainer.appendChild(rowContainer);
      controlsContainer.appendChild(resultDisplay);
      table.parentNode.insertBefore(containerDiv, table);
      table.dataset.enhanced = "true";
    });
  }

  function createSearchableDropdown(id, placeholder) {
    const container = document.createElement("div");
    container.className = "searchable-dropdown";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.id = id;
    input.setAttribute("autocomplete", "off");
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-menu";
    container.appendChild(input);
    container.appendChild(dropdown);

    let selectedItem = null;
    let onSelectCallback = null;
    let blurTimeout = null;

    input.addEventListener("focus", () => {
      clearTimeout(blurTimeout);
      filterDropdownItems(input.value);
      dropdown.classList.add("show");
    });

    input.addEventListener("input", () => {
      selectedItem = null;
      filterDropdownItems(input.value);
      if (!dropdown.classList.contains("show")) {
        dropdown.classList.add("show");
      }
    });

    input.addEventListener("blur", () => {
      blurTimeout = setTimeout(() => {
        dropdown.classList.remove("show");
        if (selectedItem) {
          input.value = selectedItem.text || "";
        }
      }, 150);
    });

    function filterDropdownItems(searchTerm) {
      const term = searchTerm.toLowerCase();
      Array.from(dropdown.children).forEach((child) => {
        const itemText = child.textContent.toLowerCase();
        child.style.display = itemText.includes(term) ? "" : "none";
      });
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });

    return {
      container,
      input,
      dropdown,
      set onSelect(callback) {
        onSelectCallback = callback;
      },
      get selected() {
        return selectedItem;
      },
      setSelected: function (item) {
        selectedItem = item;
        input.value = item ? item.text : "";
        filterDropdownItems(input.value);
        if (onSelectCallback) onSelectCallback(item);
      },
      populate: function (items) {
        dropdown.innerHTML = "";
        items.forEach((item) => {
          const option = document.createElement("div");
          option.className = "dropdown-item";
          option.textContent = item.text;
          option.dataset.value = item.value;
          option.addEventListener("mousedown", (e) => {
            e.preventDefault();
            this.setSelected(item);
            clearTimeout(blurTimeout);
            dropdown.classList.remove("show");
            input.blur();
          });
          dropdown.appendChild(option);
        });
      },
    };
  }

  function populateDropdown(dropdownInstance, items) {
    dropdownInstance.populate(items);
  }

  // --- MutationObserver & Initialization ---
  const observer = new MutationObserver(() => {
    initializeEnhancements();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  function initializeEnhancements() {
    if (document.querySelector(".table-enhancement-container")) return;
    const tables = document.querySelectorAll("table");
    if (tables.length > 0) {
      observer.disconnect();
      enhanceTables();
    }
  }

  document.addEventListener("DOMContentLoaded", initializeEnhancements);
})();

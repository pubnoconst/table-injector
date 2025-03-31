// ==UserScript==
// @name         Casphone Connect Table Enhancement
// @namespace    casphone-table-enhancer
// @version      1.9.0
// @description  Adds interactive controls with price copy button above tables on Casphone Connect portal
// @author       Hossain
// @match        https://*.casphone.com.au/*
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
    /* Style Enhancements */
    :root {
      --system-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --border-color: rgba(0, 0, 0, 0.15);
      --focus-color: rgba(0, 122, 255, 0.3);
      --bg-color: #f2f2f7;
      --bg-hover: rgba(0, 0, 0, 0.05);
      --selection-color: rgba(0, 122, 255, 0.1);
      --border-radius-sm: 6px;
      --border-radius-md: 8px;
      --border-radius-lg: 10px;
      --padding-y: 6px;
      --padding-x: 10px;
      --danger-color: #e53935;
      --danger-color-hover: #d32f2f;
      --price-color: #0288d1;
      --price-color-hover: #0277bd;
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
      border-radius: var(--border-radius-lg);
      background-color: var(--bg-color);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.05);
      font-family: var(--system-font);
      font-size: 13px;
      width: fit-content;
      border: 0.5px solid rgba(0,0,0,0.08);
    }

    .searchable-dropdown {
      position: relative;
      display: inline-block;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .options-dropdown-button {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.05);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: background-color 0.2s ease;
      z-index: 2;
      font-size: 12px;
      color: #666;
    }
    
    .options-dropdown-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .options-dropdown-button:active {
      background-color: rgba(0, 0, 0, 0.15);
    }

    .options-dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      z-index: 1001;
      display: none;
      min-width: 160px;
      max-height: 240px;
      overflow-y: auto;
      padding: 5px;
      background-color: rgba(248, 248, 248, 0.7);
      border: 0.5px solid rgba(0, 0, 0, 0.15);
      border-radius: var(--border-radius-md);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      font-family: var(--system-font);
      font-size: 13px;
    }

    @supports ((-webkit-backdrop-filter: blur(25px)) or (backdrop-filter: blur(25px))) {
      .options-dropdown-menu {
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        backdrop-filter: blur(25px) saturate(180%);
        background-color: rgba(248, 248, 248, 0.7);
      }
    }

    .options-dropdown-menu.show {
      display: block;
    }

    .options-dropdown-item {
      padding: var(--padding-y) var(--padding-x);
      color: #333;
      cursor: default;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-radius: var(--border-radius-sm);
      margin: 0;
      transition: background-color 0.1s ease;
    }

    .options-dropdown-item:hover {
      background-color: var(--selection-color);
      color: #222;
    }

    .searchable-dropdown input,
    .model-search-input {
      padding: var(--padding-y) var(--padding-x);
      padding-right: 26px;
      border-radius: var(--border-radius-sm);
      border: 0.5px solid var(--border-color);
      width: 180px;
      font-size: 13px;
      font-family: var(--system-font);
      outline: none;
      background-color: #ffffff;
      transition: box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out;
      box-shadow: 0 0.5px 1px rgba(0,0,0,0.05) inset;
    }

    .searchable-dropdown input:focus,
    .model-search-input:focus {
      border-color: rgba(0, 122, 255, 0.8);
      box-shadow: 0 0 0 3px var(--focus-color), 0 0.5px 1px rgba(0,0,0,0.05) inset;
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
      border-radius: var(--border-radius-md);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      font-family: var(--system-font);
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
      padding: var(--padding-y) var(--padding-x);
      color: #333;
      cursor: default;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-radius: var(--border-radius-sm);
      margin: 0;
      transition: background-color 0.1s ease;
    }

    .dropdown-item:hover {
      background-color: var(--selection-color);
      color: #222;
    }

    .result-display {
      padding: var(--padding-y) var(--padding-x);
      background-color: var(--bg-color);
      border-radius: var(--border-radius-sm);
      border: 0.5px solid var(--border-color);
      min-width: 100px;
      min-height: calc(13px + 2 * var(--padding-y) + 1px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-family: var(--system-font);
      font-size: 13px;
      color: #333;
      box-shadow: 0 0.5px 1px rgba(0,0,0,0.05) inset;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }

    .result-display:not(.placeholder) {
      background-color: rgba(2, 136, 209, 0.07);
      border-color: rgba(2, 136, 209, 0.4);
      color: var(--price-color);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(2, 136, 209, 0.1);
      position: relative;
      overflow: hidden;
    }

    .result-display:not(.placeholder):hover {
      background-color: rgba(2, 136, 209, 0.12);
      border-color: rgba(2, 136, 209, 0.5);
      color: var(--price-color-hover);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(2, 136, 209, 0.15);
    }

    .result-display:not(.placeholder):active {
      transform: translateY(0) scale(0.98);
    }

    .result-display:not(.placeholder)::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      animation: shimmer 5s infinite ease-in-out;
    }

    @keyframes shimmer {
      0% { left: -100%; }
      20% { left: 100%; }
      100% { left: 100%; }
    }

    .result-display.placeholder {
      color: #777;
      font-weight: 400;
      cursor: default;
      background-color: var(--bg-color);
    }
    .result-display.placeholder:hover {
      background-color: var(--bg-color);
      border-color: var(--border-color);
      transform: none;
      box-shadow: 0 0.5px 1px rgba(0,0,0,0.05) inset;
    }
    .result-display.placeholder:active {
      transform: none;
    }

    .dropdown-label,
    .model-search-label {
      font-weight: 500;
      margin-right: 8px;
      font-family: var(--system-font);
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

    /* Reset Button Styles */
    .reset-button {
      padding: var(--padding-y) var(--padding-x);
      border-radius: var(--border-radius-sm);
      border: 0.5px solid rgba(229, 57, 53, 0.3);
      background-color: rgba(229, 57, 53, 0.1);
      color: var(--danger-color);
      font-family: var(--system-font);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 70px;
    }

    .reset-button:hover {
      background-color: rgba(229, 57, 53, 0.2);
      border-color: rgba(229, 57, 53, 0.5);
      color: var(--danger-color-hover);
    }

    .reset-button:active {
      transform: scale(0.96);
    }

    /* Toast Notification Styles */
    .clipboard-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background-color: rgba(40, 40, 40, 0.75);
      color: white;
      padding: 10px 20px;
      border-radius: 15px;
      font-family: var(--system-font);
      font-size: 13px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
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

      // Add options dropdown button to the part search
      const optionsButton = document.createElement("button");
      optionsButton.className = "options-dropdown-button";
      optionsButton.innerHTML = "⋮";
      optionsButton.title = "Show more options";

      const optionsMenu = document.createElement("div");
      optionsMenu.className = "options-dropdown-menu";
      
      rowDropdown.container.querySelector('.search-input-wrapper').appendChild(optionsButton);
      rowDropdown.container.appendChild(optionsMenu);

      let blurOptionsTimeout;
      optionsButton.addEventListener("click", (e) => {
        e.stopPropagation();
        clearTimeout(blurOptionsTimeout);
        
        if (optionsMenu.classList.contains("show")) {
          optionsMenu.classList.remove("show");
        } else {
          updateOptionsMenu();
          optionsMenu.classList.add("show");
        }
      });

      document.addEventListener("click", (e) => {
        if (!optionsMenu.contains(e.target) && e.target !== optionsButton) {
          optionsMenu.classList.remove("show");
        }
      });

      // Function to update the options menu based on selected device
      function updateOptionsMenu() {
        optionsMenu.innerHTML = "";
        
        if (!selectedColumn) {
          const emptyOption = document.createElement("div");
          emptyOption.className = "options-dropdown-item";
          emptyOption.textContent = "Select a device first";
          emptyOption.style.fontStyle = "italic";
          emptyOption.style.color = "#999";
          optionsMenu.appendChild(emptyOption);
          return;
        }
        
        // Find all related parts for the selected device
        const relatedParts = [];
        for (let i = 1; i < tableRows.length; i++) {
          const firstCell = tableRows[i].querySelector("td");
          if (firstCell && !firstCell.textContent.trim().includes("Model Number")) {
            const partName = firstCell.textContent.trim();
            const colIndex = parseInt(selectedColumn.value);
            const cells = tableRows[i].querySelectorAll("td");
            
            if (colIndex < cells.length) {
              const cellValue = cells[colIndex].textContent.trim();
              if (cellValue && cellValue !== "-" && cellValue !== "N/A") {
                relatedParts.push({
                  text: partName,
                  value: i.toString(),
                  price: cellValue
                });
              }
            }
          }
        }
        
        if (relatedParts.length === 0) {
          const emptyOption = document.createElement("div");
          emptyOption.className = "options-dropdown-item";
          emptyOption.textContent = "No options available";
          emptyOption.style.fontStyle = "italic";
          emptyOption.style.color = "#999";
          optionsMenu.appendChild(emptyOption);
          return;
        }
        
        // Sort by part name
        relatedParts.sort((a, b) => a.text.localeCompare(b.text));
        
        relatedParts.forEach(part => {
          const option = document.createElement("div");
          option.className = "options-dropdown-item";
          option.textContent = `${part.text} - ${part.price}`;
          option.setAttribute("data-value", part.value);
          option.addEventListener("click", () => {
            const matchedRow = rows.find(row => row.value === part.value);
            if (matchedRow) {
              rowDropdown.setSelected(matchedRow);
              optionsMenu.classList.remove("show");
            }
          });
          optionsMenu.appendChild(option);
        });
      }

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

      // Create reset button
      const resetButton = document.createElement("button");
      resetButton.className = "reset-button";
      resetButton.textContent = "Reset";
      resetButton.addEventListener("click", () => {
        // Reset all selections
        columnDropdown.setSelected(null);
        rowDropdown.setSelected(null);
        if (modelSearchInput) {
          modelSearchInput.value = "";
          modelSearchInput.classList.remove("match-found", "no-match");
        }
        resultDisplay.textContent = "Select options";
        resultDisplay.classList.add("placeholder");
        resultDisplay.style.color = "";
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
      controlsContainer.appendChild(resetButton);
      table.parentNode.insertBefore(containerDiv, table);
      table.dataset.enhanced = "true";
    });
  }

  function createSearchableDropdown(id, placeholder) {
    const container = document.createElement("div");
    container.className = "searchable-dropdown";
    
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "search-input-wrapper";
    
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.id = id;
    input.setAttribute("autocomplete", "off");
    
    inputWrapper.appendChild(input);
    
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-menu";
    
    container.appendChild(inputWrapper);
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

  // --- Initialization with faster loading ---
  function initializeEnhancements() {
    const tables = document.querySelectorAll("table");
    if (tables.length > 0) {
      enhanceTables();
    }
  }

  // Run immediately
  initializeEnhancements();

  // Also watch for dynamic changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        // Check if new tables were added
        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'TABLE' || 
              (node.nodeType === 1 && node.querySelector('table'))) {
            enhanceTables();
            return;
          }
        }
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });

  // Backup initialization
  document.addEventListener("DOMContentLoaded", initializeEnhancements);
})();

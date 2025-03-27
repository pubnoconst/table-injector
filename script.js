// ==UserScript==
// @name        CasPhone Table Enhancement with Searchable Dropdowns
// @namespace   casphone-table-enhancer
// @match       https://connect.casphone.com.au/*
// @grant       none
// @version     1.5
// @author      Hossain
// @description Adds interactive controls with searchable dropdowns above tables on CasPhone connect portal
// ==/UserScript==

(function () {
  "use strict";

  // Add CSS to the page
  const style = document.createElement('style');
  style.textContent = `
    .table-enhancement-container {
      display: flex;
      justify-content: center;
      width: 100%;
      margin: 12px 0;
    }

    .table-enhancement {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      background-color: #f8f9fa;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
      font-size: 14px;
      width: fit-content;
    }

    .searchable-dropdown {
      position: relative;
      display: inline-block;
    }

    .searchable-dropdown input {
      padding: 8px 12px;
      border-radius: 24px;
      border: 1px solid #dfe1e5;
      width: 160px;
      font-size: 14px;
      outline: none;
      background-color: white;
      transition: box-shadow 0.2s, border-color 0.2s;
    }

    .searchable-dropdown input:focus {
      box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
      border-color: rgba(223, 225, 229, 0);
    }

    .searchable-dropdown input:hover {
      box-shadow: 0 1px 6px rgba(32, 33, 36, 0.2);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1000;
      display: none;
      min-width: 200px;
      max-height: 300px;
      overflow-y: auto;
      padding: 8px 0;
      margin-top: 5px;
      background-color: rgba(255, 255, 255, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }

    @supports ((-webkit-backdrop-filter: blur(15px)) or (backdrop-filter: blur(15px))) {
      .dropdown-menu {
        -webkit-backdrop-filter: blur(15px);
        backdrop-filter: blur(15px);
      }
    }

    .dropdown-menu.show {
      display: block;
    }

    .dropdown-item {
      padding: 8px 16px;
      color: #202124;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-item:hover {
      background-color: rgba(241, 243, 244, 0.8);
    }

    .result-display {
      padding: 10px 16px;
      background-color: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      min-width: 120px;
      min-height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .dropdown-label {
      font-weight: 500;
      margin-right: 8px;
    }

    .model-search-container {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .model-search-input {
      padding: 8px 12px;
      border-radius: 24px;
      border: 1px solid #dfe1e5;
      width: 200px;
      font-size: 14px;
      outline: none;
      background-color: white;
      transition: box-shadow 0.2s, border-color 0.2s;
    }

    .model-search-input:focus {
      box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
      border-color: rgba(223, 225, 229, 0);
    }

    .model-search-input:hover {
      box-shadow: 0 1px 6px rgba(32, 33, 36, 0.2);
    }

    .model-search-label {
      font-weight: 500;
      margin-right: 8px;
    }
  `;
  document.head.appendChild(style);

  // Wait for page to fully load
  window.addEventListener("load", function () {
    // Find all tables on the page
    const tables = document.querySelectorAll("table");

    tables.forEach((table, tableIndex) => {
      // Check if the table has rows (more than just a header)
      const tableRows = table.querySelectorAll("tr");
      if (tableRows.length <= 1) {
        return; // Skip tables with no data rows
      }

      // Get first row and first column to check for "Model"
      const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
      if (!headerRow) return;

      const headerCells = headerRow.querySelectorAll("th").length > 0 ?
                         headerRow.querySelectorAll("th") :
                         headerRow.querySelectorAll("td");

      // Check if any header cell contains "Model"
      let hasModel = false;
      headerCells.forEach(cell => {
        if (cell.textContent.includes("Model")) {
          hasModel = true;
        }
      });

      // Check first column for "Model"
      for (let i = 0; i < tableRows.length; i++) {
        const firstCell = tableRows[i].querySelector("td, th");
        if (firstCell && firstCell.textContent.includes("Model")) {
          hasModel = true;
          break;
        }
      }

      // Skip if no "Model" text found
      if (!hasModel) {
        return;
      }

      // Look for a row with "Model Number" in the first cell
      let modelNumberRow = null;
      let modelNumberMap = {};

      for (let i = 0; i < tableRows.length; i++) {
        const firstCell = tableRows[i].querySelector("td, th");
        if (firstCell && firstCell.textContent.trim().includes("Model Number")) {
          modelNumberRow = tableRows[i];
          break;
        }
      }

      // Create container for centering
      const containerDiv = document.createElement("div");
      containerDiv.className = "table-enhancement-container";

      // Create the enhancement div
      const enhancementDiv = document.createElement("div");
      enhancementDiv.className = "table-enhancement";
      enhancementDiv.id = `table-enhancement-${tableIndex}`;
      enhancementDiv.style.flexDirection = "column";

      containerDiv.appendChild(enhancementDiv);

      // Create model number search if we found a model number row
      let modelSearchInput = null;
      if (modelNumberRow) {
        const modelSearchContainer = document.createElement("div");
        modelSearchContainer.className = "model-search-container";

        const modelSearchLabel = document.createElement("span");
        modelSearchLabel.className = "model-search-label";
        modelSearchLabel.textContent = "Search by Model Number:";

        modelSearchInput = document.createElement("input");
        modelSearchInput.type = "text";
        modelSearchInput.className = "model-search-input";
        modelSearchInput.placeholder = "e.g. A1600";

        modelSearchContainer.appendChild(modelSearchLabel);
        modelSearchContainer.appendChild(modelSearchInput);

        enhancementDiv.appendChild(modelSearchContainer);

        // Process model numbers from the row
        const cells = modelNumberRow.querySelectorAll("td, th");
        for (let i = 1; i < cells.length; i++) {
          const cellText = cells[i].textContent.trim();
          // Split by comma and handle multiple model numbers per cell
          if (cellText.length > 0 && cellText !== "-") {
            const modelNumbers = cellText.split(/,\s*/);
            modelNumbers.forEach(modelNum => {
              modelNumberMap[modelNum.trim()] = i;
            });
          }
        }
      }

      // Create controls container
      const controlsContainer = document.createElement("div");
      controlsContainer.style.display = "flex";
      controlsContainer.style.alignItems = "center";
      controlsContainer.style.gap = "16px";
      enhancementDiv.appendChild(controlsContainer);

      // Create column dropdown container
      const columnContainer = document.createElement("div");
      columnContainer.style.display = "flex";
      columnContainer.style.alignItems = "center";

      const columnLabel = document.createElement("span");
      columnLabel.className = "dropdown-label";
      columnLabel.textContent = "Device:"; // Changed from "Column:"
      columnContainer.appendChild(columnLabel);

      // Create searchable column dropdown
      const columnDropdown = createSearchableDropdown(
        `column-dropdown-${tableIndex}`,
        "Search devices..."
      );
      columnContainer.appendChild(columnDropdown.container);

      // Create row dropdown container
      const rowContainer = document.createElement("div");
      rowContainer.style.display = "flex";
      rowContainer.style.alignItems = "center";

      const rowLabel = document.createElement("span");
      rowLabel.className = "dropdown-label";
      rowLabel.textContent = "Part/Repair:"; // Changed from "Row:"
      rowContainer.appendChild(rowLabel);

      // Create searchable row dropdown
      const rowDropdown = createSearchableDropdown(
        `row-dropdown-${tableIndex}`,
        "Search parts/repairs..."
      );
      rowContainer.appendChild(rowDropdown.container);

      // Create result display
      const resultDisplay = document.createElement("div");
      resultDisplay.className = "result-display";
      resultDisplay.textContent = "Select part/repair and device";

      // Collect column and row data
      const columns = [];
      const rows = [];

      if (headerRow) {
        const headerCells = headerRow.querySelectorAll("th").length > 0 ?
                           headerRow.querySelectorAll("th") :
                           headerRow.querySelectorAll("td");

        headerCells.forEach((cell, index) => {
          if (index > 0) { // Skip first column since it will be used for rows
            columns.push({
              value: index.toString(),
              text: cell.textContent.trim() || `Column ${index}`,
              element: cell
            });
          }
        });
      }

      // Get row data (from first column)
      // Start from index 1 to skip the header row
      for (let i = 1; i < tableRows.length; i++) {
        const firstCell = tableRows[i].querySelector("td");
        if (firstCell) {
          // Skip rows with "Model Number" in the first cell
          if (!firstCell.textContent.trim().includes("Model Number")) {
            rows.push({
              value: i.toString(),
              text: firstCell.textContent.trim() || `Row ${i}`,
              element: tableRows[i]
            });
          }
        }
      }

      // Only continue if we have both rows and columns
      if (rows.length === 0 || columns.length === 0) {
        return; // Skip tables with no usable data
      }

      // Populate dropdowns
      populateDropdown(columnDropdown, columns);
      populateDropdown(rowDropdown, rows);

      // Store selected values
      let selectedColumn = null;
      let selectedRow = null;

      // Handle selection events
      columnDropdown.onSelect = (item) => {
        selectedColumn = item;
        updateResult();
      };

      rowDropdown.onSelect = (item) => {
        selectedRow = item;
        updateResult();
      };

      // Add model number search event handler
      if (modelSearchInput) {
        modelSearchInput.addEventListener("input", (e) => {
          const searchTerm = e.target.value.trim();
          if (searchTerm.length >= 2) {
            // Find model numbers that contain the search term
            for (const [modelNum, colIndex] of Object.entries(modelNumberMap)) {
              if (modelNum.includes(searchTerm)) {
                // Find the matching column
                const matchedColumn = columns.find(col => col.value === colIndex.toString());
                if (matchedColumn) {
                  columnDropdown.setSelected(matchedColumn);
                  modelSearchInput.style.backgroundColor = "#f0fff4";
                  return;
                }
              }
            }
            modelSearchInput.style.backgroundColor = "#fff0f0";
          } else {
            modelSearchInput.style.backgroundColor = "";
          }
        });
      }

      // Function to update the result display
      function updateResult() {
        if (selectedRow && selectedColumn) {
          const rowIndex = parseInt(selectedRow.value);
          const colIndex = parseInt(selectedColumn.value);

          const rows = table.querySelectorAll("tr");
          const cell = rows[rowIndex].querySelectorAll("td")[colIndex];

          if (cell) {
            resultDisplay.textContent = cell.textContent.trim();
            resultDisplay.style.color = "#333";
          } else {
            resultDisplay.textContent = "No data found";
            resultDisplay.style.color = "#999";
          }
        } else {
          resultDisplay.textContent = "Select part/repair and device";
          resultDisplay.style.color = "#999";
        }
      }

      // Add elements to the controls container
      controlsContainer.appendChild(columnContainer);
      controlsContainer.appendChild(rowContainer);
      controlsContainer.appendChild(resultDisplay);

      // Insert the enhancement div before the table
      table.parentNode.insertBefore(containerDiv, table);
    });

    // Helper function to create a searchable dropdown
    function createSearchableDropdown(id, placeholder) {
      const container = document.createElement("div");
      container.className = "searchable-dropdown";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = placeholder;
      input.id = id;

      const dropdown = document.createElement("div");
      dropdown.className = "dropdown-menu";

      container.appendChild(input);
      container.appendChild(dropdown);

      // Setup event listeners
      let selectedItem = null;
      let onSelectCallback = null;

      // Show dropdown on input focus
      input.addEventListener("focus", () => {
        dropdown.classList.add("show");
      });

      // Filter dropdown items as user types
      input.addEventListener("input", () => {
        const searchTerm = input.value.toLowerCase();
        Array.from(dropdown.children).forEach(child => {
          const itemText = child.textContent.toLowerCase();
          child.style.display = itemText.includes(searchTerm) ? "" : "none";
        });
      });

      // Hide dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
          dropdown.classList.remove("show");

          // Restore selected item text if input is empty or doesn't match selection
          if (selectedItem && (input.value === "" || input.value !== selectedItem.text)) {
            input.value = selectedItem.text || "";
          }
        }
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
        setSelected: function(item) {
          selectedItem = item;
          input.value = item ? item.text : "";
          if (onSelectCallback) onSelectCallback(item);
        }
      };
    }

    // Helper function to populate a dropdown with items
    function populateDropdown(dropdown, items) {
      dropdown.dropdown.innerHTML = "";

      items.forEach(item => {
        const option = document.createElement("div");
        option.className = "dropdown-item";
        option.textContent = item.text;
        option.dataset.value = item.value;

        option.addEventListener("click", () => {
          dropdown.setSelected(item);
          dropdown.dropdown.classList.remove("show");
        });

        dropdown.dropdown.appendChild(option);
      });
    }
  });
})();

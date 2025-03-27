// ==UserScript==
// @name        CasPhone Table Enhancement
// @namespace   casphone-table-enhancer-macos
// @match       https://connect.casphone.com.au/*
// @grant       none
// @version     1.7
// @author      Hossain (macOS style by T3 Chat)
// @description Adds interactive controls with searchable dropdowns (macOS style) above tables on CasPhone connect portal
// ==/UserScript==

(function () {
  "use strict";

  // Add CSS to the page
  const style = document.createElement("style");
  style.textContent = `
    /* macOS Style Enhancements */
    :root {
      --macos-system-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      --macos-border-color: rgba(0, 0, 0, 0.15);
      --macos-focus-ring-color: rgba(0, 122, 255, 0.3);
      --macos-control-bg: #f2f2f7; /* Light mode control background */
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
      margin: 16px 0; /* Increased margin */
    }

    .table-enhancement {
      display: inline-flex;
      flex-direction: column; /* Keep column layout */
      align-items: center;
      justify-content: center;
      gap: 12px; /* Adjusted gap */
      padding: 16px 20px; /* Increased padding */
      border-radius: var(--macos-border-radius-large);
      background-color: var(--macos-control-bg);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.05); /* Subtle shadow */
      font-family: var(--macos-system-font);
      font-size: 13px; /* Typical macOS UI font size */
      width: fit-content;
      border: 0.5px solid rgba(0,0,0,0.08); /* Subtle border */
    }

    .searchable-dropdown {
      position: relative;
      display: inline-block;
    }

    /* Style for both dropdown and model search inputs */
    .searchable-dropdown input,
    .model-search-input {
      padding: var(--macos-padding-vertical) var(--macos-padding-horizontal);
      border-radius: var(--macos-border-radius-small);
      border: 0.5px solid var(--macos-border-color);
      width: 180px; /* Adjusted width */
      font-size: 13px;
      font-family: var(--macos-system-font);
      outline: none;
      background-color: #ffffff;
      transition: box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out;
      box-shadow: 0 0.5px 1px rgba(0,0,0,0.05) inset; /* Subtle inner top shadow */
    }

    .searchable-dropdown input:focus,
    .model-search-input:focus {
      border-color: rgba(0, 122, 255, 0.8);
      box-shadow: 0 0 0 3px var(--macos-focus-ring-color), 0 0.5px 1px rgba(0,0,0,0.05) inset; /* Blue focus ring */
    }

    /* Remove hover shadow, less common in macOS inputs */
    .searchable-dropdown input:hover,
    .model-search-input:hover {
       border-color: rgba(0, 0, 0, 0.3);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px); /* Slightly detached */
      left: 0;
      z-index: 1000;
      display: none;
      min-width: 220px; /* Increased min-width */
      max-height: 280px; /* Adjusted max-height */
      overflow-y: auto;
      padding: 5px; /* Padding around items */
      margin-top: 0; /* Removed margin-top, handled by 'top' */
      background-color: rgba(248, 248, 248, 0.7); /* Semi-transparent light background */
      border: 0.5px solid rgba(0, 0, 0, 0.15); /* Subtle border */
      border-radius: var(--macos-border-radius-medium);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15); /* macOS style shadow */
      font-family: var(--macos-system-font);
      font-size: 13px;
    }

    /* Frosted Glass Effect */
    @supports ((-webkit-backdrop-filter: blur(25px)) or (backdrop-filter: blur(25px))) {
      .dropdown-menu {
        -webkit-backdrop-filter: blur(25px) saturate(180%);
        backdrop-filter: blur(25px) saturate(180%);
        background-color: rgba(248, 248, 248, 0.7); /* Adjust alpha for blur */
      }
    }

    .dropdown-menu.show {
      display: block;
    }

    .dropdown-item {
      padding: var(--macos-padding-vertical) var(--macos-padding-horizontal);
      color: #333; /* Standard text color */
      cursor: default; /* macOS uses default cursor for menu items */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-radius: var(--macos-border-radius-small); /* Consistent rounding */
      margin: 0; /* Remove margin inside padding */
      transition: background-color 0.1s ease;
    }

    .dropdown-item:hover {
      background-color: var(--macos-selection-color); /* Light blue hover */
      color: #222; /* Slightly darker text on hover */
    }

    .result-display {
      padding: var(--macos-padding-vertical) var(--macos-padding-horizontal);
      background-color: var(--macos-control-bg); /* Match container background */
      border-radius: var(--macos-border-radius-small);
      border: 0.5px solid var(--macos-border-color);
      min-width: 140px; /* Adjusted min-width */
      min-height: calc(13px + 2 * var(--macos-padding-vertical) + 1px); /* Match input height */
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 400; /* Regular weight */
      font-family: var(--macos-system-font);
      font-size: 13px;
      color: #555; /* Default text color */
      box-shadow: 0 0.5px 1px rgba(0,0,0,0.05) inset; /* Subtle inner top shadow */
      text-align: center;
    }

    .dropdown-label,
    .model-search-label {
      font-weight: 500; /* Medium weight for labels */
      margin-right: 8px;
      font-family: var(--macos-system-font);
      font-size: 13px;
      color: #444; /* Slightly darker label color */
    }

    .model-search-container {
      display: flex;
      align-items: center;
      /* margin-bottom: 12px; - Handled by parent gap */
    }

    /* Specific adjustments for model search input if needed */
    .model-search-input {
      width: 150px; /* Slightly smaller width for model search */
    }

    /* Style for model search feedback */
    .model-search-input.match-found {
        background-color: #e6ffed; /* Light green for match */
        border-color: #a0d8af;
    }
    .model-search-input.no-match {
        background-color: #ffebee; /* Light red for no match */
        border-color: #f1b0b7;
    }

    /* Container for the row/column dropdowns + result */
    .controls-container {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    /* Container for label + dropdown */
    .dropdown-input-container {
        display: flex;
        align-items: center;
        gap: 8px; /* Gap between label and input */
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
      const headerRow =
        table.querySelector("thead tr") || table.querySelector("tr");
      if (!headerRow) return;

      const headerCells =
        headerRow.querySelectorAll("th").length > 0
          ? headerRow.querySelectorAll("th")
          : headerRow.querySelectorAll("td");

      // Check if any header cell contains "Model"
      let hasModel = false;
      headerCells.forEach((cell) => {
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
        if (
          firstCell &&
          firstCell.textContent.trim().includes("Model Number")
        ) {
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
      // enhancementDiv.style.flexDirection = "column"; // Set in CSS

      containerDiv.appendChild(enhancementDiv);

      // Create model number search if we found a model number row
      let modelSearchInput = null;
      if (modelNumberRow) {
        const modelSearchContainer = document.createElement("div");
        modelSearchContainer.className = "model-search-container";

        const modelSearchLabel = document.createElement("span");
        modelSearchLabel.className = "model-search-label";
        modelSearchLabel.textContent = "Model No:"; // Shortened label

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
            modelNumbers.forEach((modelNum) => {
              modelNumberMap[modelNum.trim()] = i;
            });
          }
        }
      }

      // Create controls container (for dropdowns and result)
      const controlsContainer = document.createElement("div");
      controlsContainer.className = "controls-container"; // Use class for styling
      enhancementDiv.appendChild(controlsContainer);

      // Create column dropdown container (Label + Dropdown)
      const columnContainer = document.createElement("div");
      columnContainer.className = "dropdown-input-container"; // Use class

      const columnLabel = document.createElement("span");
      columnLabel.className = "dropdown-label";
      columnLabel.textContent = "Device:";
      columnContainer.appendChild(columnLabel);

      // Create searchable column dropdown
      const columnDropdown = createSearchableDropdown(
        `column-dropdown-${tableIndex}`,
        "Search devices..."
      );
      columnContainer.appendChild(columnDropdown.container);

      // Create row dropdown container (Label + Dropdown)
      const rowContainer = document.createElement("div");
      rowContainer.className = "dropdown-input-container"; // Use class

      const rowLabel = document.createElement("span");
      rowLabel.className = "dropdown-label";
      rowLabel.textContent = "Part/Repair:";
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
      resultDisplay.textContent = "Select options"; // Updated placeholder

      // Collect column and row data
      const columns = [];
      const rows = [];

      if (headerRow) {
        const currentHeaderCells =
          headerRow.querySelectorAll("th").length > 0
            ? headerRow.querySelectorAll("th")
            : headerRow.querySelectorAll("td");

        currentHeaderCells.forEach((cell, index) => {
          if (index > 0) {
            // Skip first column
            columns.push({
              value: index.toString(),
              text: cell.textContent.trim() || `Column ${index}`,
              element: cell,
            });
          }
        });
      }

      // Get row data (from first column)
      for (let i = 1; i < tableRows.length; i++) {
        const firstCell = tableRows[i].querySelector("td");
        if (firstCell) {
          // Skip rows with "Model Number" in the first cell
          if (!firstCell.textContent.trim().includes("Model Number")) {
            rows.push({
              value: i.toString(),
              text: firstCell.textContent.trim() || `Row ${i}`,
              element: tableRows[i],
            });
          }
        }
      }

      // Only continue if we have both rows and columns
      if (rows.length === 0 || columns.length === 0) {
        console.log("Table Enhancer: Skipping table, no usable rows/columns found.");
        containerDiv.remove(); // Remove the container if not used
        return;
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
        // Clear model search feedback if column changed manually
        if (modelSearchInput) {
            modelSearchInput.classList.remove("match-found", "no-match");
        }
      };

      rowDropdown.onSelect = (item) => {
        selectedRow = item;
        updateResult();
      };

      // Add model number search event handler
      if (modelSearchInput) {
        modelSearchInput.addEventListener("input", (e) => {
          const searchTerm = e.target.value.trim().toUpperCase(); // Case-insensitive search
          modelSearchInput.classList.remove("match-found", "no-match"); // Clear previous feedback

          if (searchTerm.length >= 2) {
            let foundMatch = false;
            // Find model numbers that contain the search term
            for (const [modelNum, colIndex] of Object.entries(
              modelNumberMap
            )) {
              if (modelNum.toUpperCase().includes(searchTerm)) {
                // Find the matching column
                const matchedColumn = columns.find(
                  (col) => col.value === colIndex.toString()
                );
                if (matchedColumn) {
                  columnDropdown.setSelected(matchedColumn);
                  modelSearchInput.classList.add("match-found");
                  foundMatch = true;
                  break; // Stop after first match
                }
              }
            }
            if (!foundMatch) {
              modelSearchInput.classList.add("no-match");
            }
          }
        });
      }

      // Function to update the result display
      function updateResult() {
        if (selectedRow && selectedColumn) {
          const rowIndex = parseInt(selectedRow.value);
          const colIndex = parseInt(selectedColumn.value);

          // Re-query rows in case the table structure changes dynamically
          const currentTableRows = table.querySelectorAll("tr");
          if (rowIndex < currentTableRows.length) {
              const cells = currentTableRows[rowIndex].querySelectorAll("td");
              if (colIndex < cells.length) {
                  const cell = cells[colIndex];
                  resultDisplay.textContent = cell.textContent.trim() || "-"; // Show '-' if empty
                  resultDisplay.style.color = "#333"; // Reset color
              } else {
                  resultDisplay.textContent = "N/A";
                  resultDisplay.style.color = "#999";
              }
          } else {
              resultDisplay.textContent = "Error"; // Row index out of bounds
              resultDisplay.style.color = "#cc0000";
          }
        } else {
          resultDisplay.textContent = "Select options";
          resultDisplay.style.color = "#777"; // Dimmed placeholder color
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
      input.setAttribute("autocomplete", "off"); // Prevent browser autocomplete

      const dropdown = document.createElement("div");
      dropdown.className = "dropdown-menu";

      container.appendChild(input);
      container.appendChild(dropdown);

      // Setup event listeners
      let selectedItem = null;
      let onSelectCallback = null;
      let blurTimeout = null; // To handle blur correctly

      // Show dropdown on input focus
      input.addEventListener("focus", () => {
        clearTimeout(blurTimeout); // Cancel any pending blur hide
        filterDropdownItems(input.value); // Filter based on current value
        dropdown.classList.add("show");
      });

      // Filter dropdown items as user types
      input.addEventListener("input", () => {
        selectedItem = null; // Clear selection if user types
        filterDropdownItems(input.value);
        // Ensure dropdown stays open while typing
        if (!dropdown.classList.contains("show")) {
            dropdown.classList.add("show");
        }
      });

      // Hide dropdown on blur, with a small delay to allow clicks on items
      input.addEventListener("blur", () => {
        blurTimeout = setTimeout(() => {
            dropdown.classList.remove("show");
            // Restore selected item text if input is empty or doesn't match selection
            if (selectedItem) {
                input.value = selectedItem.text || "";
            } else {
                // If nothing selected and input is cleared, keep it clear
                // If input has text but no match, keep the text? Or clear? Let's keep it.
            }
        }, 150); // Delay ms
      });

      // Helper to filter items
      function filterDropdownItems(searchTerm) {
          const term = searchTerm.toLowerCase();
          let hasVisibleItems = false;
          Array.from(dropdown.children).forEach(child => {
              const itemText = child.textContent.toLowerCase();
              const isVisible = itemText.includes(term);
              child.style.display = isVisible ? "" : "none";
              if (isVisible) hasVisibleItems = true;
          });
          // Maybe add a "No results" item if needed
          // console.log("Has visible items:", hasVisibleItems);
      }


      // Prevent form submission if enter is pressed in the input
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          // Optional: Select the first visible item on Enter?
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
        setSelected: function (item) {
          selectedItem = item;
          input.value = item ? item.text : "";
          filterDropdownItems(input.value); // Re-filter to show the selected one prominently
          if (onSelectCallback) onSelectCallback(item);
        },
        populate: function (items) { // Renamed from global populateDropdown
            dropdown.innerHTML = ""; // Clear existing items

            items.forEach(item => {
                const option = document.createElement("div");
                option.className = "dropdown-item";
                option.textContent = item.text;
                option.dataset.value = item.value;

                // Use mousedown instead of click to register before blur hides the dropdown
                option.addEventListener("mousedown", (e) => {
                    e.preventDefault(); // Prevent input from losing focus immediately
                    this.setSelected(item);
                    clearTimeout(blurTimeout); // Cancel hiding dropdown
                    dropdown.classList.remove("show"); // Manually hide after selection
                    input.blur(); // Unfocus the input after selection
                });

                dropdown.appendChild(option);
            });
        }
      };
    }

    // Use the populate method specific to each dropdown instance
    function populateDropdown(dropdownInstance, items) {
        dropdownInstance.populate(items);
    }

  });
})();

// utils/fileUtils.js
import ExcelJS from "exceljs";
import { read, utils } from "xlsx";

export const readStockFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const stockData = utils.sheet_to_json(worksheet, { header: 1 });
      resolve(stockData);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const readOrderFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const orderData = utils.sheet_to_json(worksheet, { header: 1 });
      resolve(orderData);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};

// utils/fileUtils.js

// utils/fileUtils.js

export const generateOutputExcel = (stockData, orderData) => {
  const result = {};

  // Process stock data
  for (let i = 1; i < stockData.length; i++) {
    const [sku, location, qty] = stockData[i];
    if (!result[sku]) {
      result[sku] = [];
    }
    result[sku].push({ location, qty });
  }

  // Process order data
  for (let i = 1; i < orderData.length; i++) {
    const sku = orderData[i][0];
    if (!result[sku]) {
      result[sku] = [];
      result[sku].notInStock = true; // Mark SKU not in stock
    }
    result[sku].ordered = true;
  }

  // Generate output
  const output = [];
  for (const sku in result) {
    const locations = result[sku];
    if (result[sku].ordered) {
      let skuOutput = { sku };
      skuOutput.locations = locations
        .filter((loc) => !loc.notInStock)
        .map((loc) => ({ location: loc.location, qty: loc.qty }));
      if (locations.notInStock) {
        skuOutput.notInStock = true;
      }
      skuOutput.ordered = true;
      output.push(skuOutput);
    }
  }

  return output;
};

// utils/fileUtils.js

export const generateExcelFile = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Result");

  // Set columns width
  worksheet.columns = [
    { header: "SKU", key: "sku", width: 15 },
    { header: "Location", key: "location", width: 20 },
    { header: "Quantity", key: "quantity", width: 15 },
  ];

  // Add headers
  worksheet.addRow(["SKU", "Location", "Quantity"]);

  // Add data
  data.forEach((skuData, index) => {
    if (index > 0) {
      worksheet.addRow([]); // Add empty row between SKUs
    }
    skuData.locations.forEach((loc) => {
      worksheet.addRow([skuData.sku, loc.location, loc.qty]);
    });
    if (skuData.notInStock) {
      worksheet.addRow([skuData.sku, "Not in stock"]);
    }
  });

  // Generate a unique filename
  const fileName = "output.xlsx";

  // Save the workbook
  workbook.xlsx
    .writeBuffer()
    .then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);

      // Append link to the DOM
      document.body.appendChild(link);

      // Simulate click to trigger download
      link.click();

      // Remove link from the DOM
      document.body.removeChild(link);
    })
    .catch((error) => console.error("Error writing excel file:", error));
};

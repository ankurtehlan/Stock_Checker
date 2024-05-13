// components/HomePage.js
import React, { useState } from "react";
import "./HomePage.css";
import {
  readStockFile,
  readOrderFile,
  generateOutputExcel,
  generateExcelFile,
} from "../utils/fileUtils";

function HomePage() {
  const [stockFile, setStockFile] = useState(null);
  const [orderFile, setOrderFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleStockFileChange = (e) => {
    setStockFile(e.target.files[0]);
  };

  const handleOrderFileChange = (e) => {
    setOrderFile(e.target.files[0]);
  };

  const handleProcessFiles = async () => {
    if (!stockFile || !orderFile) {
      setError("Please select both stock and order files.");
      return;
    }
    try {
      const stockData = await readStockFile(stockFile);
      const orderData = await readOrderFile(orderFile);
      const output = generateOutputExcel(stockData, orderData);
      setResult(output);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Error processing files. Please try again.");
    }
  };

  const handleDownloadExcel = () => {
    if (!result) return;
    generateExcelFile(result);
  };

  return (
    <div className="overlay">
      <nav>
        <div class="nav-content">
          <div class="logo">
            <a href="/">Tehlan.</a>
          </div>
          <ul class="nav-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/">Docs</a>
            </li>
            <li>
              <a href="/">Services</a>
            </li>
            <li>
              <a href="/">Contact</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="outer_div">
        <div className="main_outer">
          <div className="Stock_div">
            <h2>Upload Stock File</h2>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleStockFileChange}
            />
          </div>
          <div className="Order_div">
            <h2>Upload Order File</h2>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleOrderFileChange}
            />
          </div>
        </div>

        <button className="button-3" onClick={handleProcessFiles}>
          Process Files
        </button>
        <div className="blank"></div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {result && (
          <div className="result-div">
            <h2>Result:</h2>
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Location</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {result.map((skuData, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td>{skuData.sku}</td>
                      <td colSpan="2"></td>
                    </tr>
                    {skuData.notInStock && (
                      <tr>
                        <td></td>
                        <td colSpan="2" style={{ color: "red" }}>
                          Not in stock
                        </td>
                      </tr>
                    )}
                    {skuData.locations.map((loc, locIndex) => (
                      <tr key={locIndex}>
                        <td></td>
                        <td>{loc.location}</td>
                        <td>{loc.qty}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <button className="button-3" onClick={handleDownloadExcel}>
              Download Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;

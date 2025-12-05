
# 📌 **README — GEE Flood Point Extractor**

## Overview

This repository provides a **Google Earth Engine (GEE) script** for generating **stratified validation points** for flood and non-flood areas using **Sentinel-1 SAR GRD (C-band)** imagery. The method computes **pre-flood** and **post-flood** radar backscatter differences (ΔVV), identifies inundated pixels, and extracts an equal number of random points from both classes.

The output is a clean, ready-to-use **CSV file** containing:

* `sample_id`
* `longitude`
* `latitude`
* `flood` (1 = flood, 0 = non-flood)

This dataset is ideal for machine learning, flood model validation, or GIS-based analyses.

**Author:** *Saeed Sourav*
**Language:** JavaScript (Google Earth Engine Code Editor)

---

## ✨ **Key Features**

* Uses Sentinel-1 **SAR GRD VV polarization** (cloud-independent).
* Performs **pre–post backscatter differencing** (ΔVV).
* Generates a **flood mask** using a threshold-based approach.
* Extracts **stratified, balanced random samples** (flood vs. non-flood).
* Automatically exports results to **Google Drive (CSV)**.
* AOI simplification prevents memory and timeout issues.
* Fully reproducible and customizable.

---

## 🛰 **Satellite Data**

**Sentinel-1 SAR GRD (C-band)**
Collection ID: `COPERNICUS/S1_GRD`

Filtering parameters:

* **Instrument mode:** IW
* **Pass:** DESCENDING
* **Polarization:** VV
* **Resolution:** 10 m

---

## 📁 **Repository Structure**

```
gee-flood-point-extractor/
│
├── src/
│   └── flood_point_extractor.js        # Main GEE code
│
├── examples/
│   └── example_output.csv             # Sample generated CSV (optional)
│
├── docs/
│   └── workflow_diagram.png           # Method overview (optional)
│
└── README.md
```

---

## ⚙️ **How the Script Works**

### **1. Load Area of Interest (AOI)**

User provides a FeatureCollection asset.
AOI is simplified to avoid memory overflow.

### **2. Load Sentinel-1 Pre- and Post-flood Images**

Median composites are prepared for:

* Pre-flood period (March–April 2022)
* Post-flood period (June 2022)

### **3. Compute ΔVV (Backscatter Difference)**

`ΔVV = VV_pre – VV_post`
Flooded areas show strong backscatter drops.

### **4. Generate Flood Mask**

Flood = ΔVV > threshold
Default threshold = **2 dB**

### **5. Stratified Random Sampling**

Balanced sample extraction:

* 500 flood points
* 500 non-flood points

Sampling preserves:

* Randomness
* Equal representation
* Spatial geometry

### **6. Extract Coordinates**

Each point receives:

* Sample ID
* Latitude / Longitude

### **7. Export Output as CSV**

The dataset is automatically saved to Google Drive.

---

## 📤 **Exported CSV Format**

| sample_id | longitude | latitude | flood |
| --------- | --------- | -------- | ----- |
| abc123    | 90.1234   | 24.5678  | 1     |
| xyz987    | 90.2345   | 24.6789  | 0     |

---

## 🔧 **User Parameters**

You may edit these at the top of the script:

```javascript
var preStart  = '2022-03-01';
var preEnd    = '2022-04-15';
var postStart = '2022-06-16';
var postEnd   = '2022-06-30';

var vvDiffThreshold = 2.0;
var pointsPerClass  = 500;
var seed            = 42;
var scale           = 10;
var exportFolder    = 'GEE_Exports';
var exportFileName  = 'Flood_NonFlood_Samples_2022';
```

---

## ▶️ **How to Run in Google Earth Engine**

1. Open: [https://code.earthengine.google.com](https://code.earthengine.google.com)
2. Create a new script.
3. Paste the `flood_point_extractor.js` code.
4. Replace your AOI asset:

   ```javascript
   var aoi = ee.FeatureCollection("users/your_username/your_AOI");
   ```
5. Click **Run**.
6. Go to the **Tasks** panel → click **Run** to start CSV export.
7. Download from Google Drive.

---

## ⚠️ Notes & Limitations

* If the AOI contains very little flood area, fewer flood points may be produced than requested.
* Map preview layers may time out for large AOIs, but **exports remain unaffected**.
* ΔVV threshold may require tuning depending on surface type and flood severity.

---

## 📚 Citation

If this script contributes to your research, please cite:

> Sourav, S. (2025). *GEE Flood Point Extractor: Sentinel-1 SAR-based stratified sampling workflow for flood validation dataset generation*.
> GitHub Repository.

Also acknowledge:

* Sentinel-1 SAR Mission
* Google Earth Engine

---

## 📬 Contact

For improvements, suggestions, or troubleshooting:
**Saeed Sourav** — Civil Engineer & GIS Analyst
(Insert your GitHub profile URL or email here.)

---


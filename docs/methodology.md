# **Methodology: Flood Point Extraction Using Sentinel-1 SAR in Google Earth Engine**

## **1. Introduction**

This document describes the methodology implemented in the **GEE Flood Point Extractor** script, which automates the generation of stratified random validation points representing **flood** and **non-flood** classes using **Sentinel-1 SAR GRD (C-band)** imagery.

The workflow is designed to:

* Detect flooded areas from radar backscatter changes,
* Produce balanced training/validation samples, and
* Export the results in CSV format for machine learning, GIS analysis, or flood model validation.

---

## **2. Input Data**

### **2.1 Sentinel-1 SAR GRD**

The script uses the image collection:

**`COPERNICUS/S1_GRD`**

Filtered by:

* Instrument Mode: **IW**
* Orbit Direction: **Descending**
* Polarization: **VV**
* Spatial Resolution: **10 m**

### **2.2 Temporal Windows**

Two time windows are defined:

| Stage          | Dates                    |
| -------------- | ------------------------ |
| **Pre-Flood**  | 01 March – 15 April 2022 |
| **Post-Flood** | 16 June – 30 June 2022   |

Median composites are used to reduce noise (speckle) and ensure temporal consistency.

### **2.3 Area of Interest (AOI)**

The AOI must be supplied by the user as a **FeatureCollection**.
AOI geometry is simplified (`simplify(100)`) to avoid Earth Engine memory timeouts during large-scale operations.

---

## **3. Methodological Workflow**

The overall workflow consists of six core steps:

---

### **Step 1: Preprocessing and AOI Handling**

The AOI is:

1. Loaded as a FeatureCollection,
2. Optional simplification is applied to reduce geometric complexity,
3. Recentered on the map,
4. Used to clip all image collections.

This ensures computational efficiency and reduces data load.

---

### **Step 2: Loading Sentinel-1 Data**

Pre-flood and post-flood VV images are prepared by:

* Filtering by date,
* Filtering by AOI,
* Selecting VV polarization,
* Computing **median** composite to reduce speckle.

This produces two clean surface backscatter layers suitable for differencing.

---

### **Step 3: ΔVV Calculation**

Flood detection relies on the strong reduction in radar backscatter caused by water surfaces.

The script computes:

[
\Delta VV = VV_{pre} - VV_{post}
]

A large positive ΔVV indicates water emergence (flooding).

ΔVV is visualized using a diverging color palette for interpretation.

---

### **Step 4: Flood Mask Generation**

A threshold-based rule is applied:

[
\text{Flood} = (\Delta VV > \text{threshold})
]

Default threshold = **2 dB**

The resulting binary raster:

* `1` = Flood
* `0` = Non-Flood

Only positive detections are retained using `selfMask()`, improving map clarity.

---

### **Step 5: Stratified Random Sampling**

Balanced sample extraction is essential for machine learning and model validation.

The script uses:

```javascript
classImage.stratifiedSample({
    classBand: "flood",
    classValues: [0, 1],
    classPoints: [pointsPerClass, pointsPerClass],
    ...
});
```

This ensures:

* Equal representation of both classes,
* True random sampling over the AOI,
* No spatial bias,
* Automatic geometry inclusion.

Each sampled point includes full geographic coordinates.

---

### **Step 6: Attribute Assignment and Export**

The script assigns:

* **longitude**,
* **latitude**,
* **unique sample_id**,
* **flood class label**

Finally, the dataset is exported as a **CSV file to Google Drive**.

CSV columns:
| sample_id | longitude | latitude | flood |

This makes the result compatible with:

* ArcGIS / QGIS
* Python ML workflows (scikit-learn, XGBoost)
* Remote sensing validation
* Hydrological modelling

---

## **4. Advantages of This Method**

### ✔ Cloud-Independent Flood Detection

SAR penetrates cloud cover and is ideal for monsoon flood monitoring.

### ✔ Balanced Sampling

Ensures unbiased training/validation datasets.

### ✔ Automated Workflow

Fully reproducible in the GEE environment.

### ✔ Efficient Computation

Simplifies AOI and minimizes memory overhead.

### ✔ Export-Ready Output

CSV structure compatible with any GIS/ML pipeline.

---

## **5. Limitations**

* Threshold-based flood classification may require tuning for different surface conditions.
* Sampling balance depends on available flood pixels; small flood extents may produce fewer points than requested.
* Map visualization layers may time out for large AOIs (does not affect export).

---

## **6. Recommended Adjustments**

Users may consider modifying:

* Flood threshold (`vvDiffThreshold`)
* Sampling density (`pointsPerClass`)
* Pre/post flood dates
* AOI geometry resolution
* Use of multilooking or speckle filters (if needed)

---

## **7. Citation**

If this workflow or script is used in research or publication, please cite:

> Sourav, S. (2025). *GEE Flood Point Extractor: Sentinel-1 SAR-based stratified sampling workflow for flood validation data generation.*

Also cite:

* ESA Sentinel-1 SAR mission
* Google Earth Engine

---


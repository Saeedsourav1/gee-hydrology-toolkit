
<p align="center">
  <img src="https://img.shields.io/badge/Google%20Earth%20Engine-Enabled-brightgreen?logo=googleearth"/>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg"/>
  <img src="https://img.shields.io/badge/Resolution-30m-orange"/>
  <img src="https://img.shields.io/badge/Projection-UTM%2045N%20(EPSG%3A32645)-yellow"/>
  <img src="https://img.shields.io/badge/Study%20Area-Rangpur%20Division-red"/>
  <img src="https://img.shields.io/badge/Hydrological%20Predictors-8%20Layers-green"/>
  <img src="https://img.shields.io/badge/Made%20By-Saeed%20Sourav-blueviolet"/>
</p>


# 📘 **README – Hydrological Feature Extraction Pipeline (Google Earth Engine)**

### **Study Area:** Rangpur Division, Bangladesh  
### **Author:** *Saeed Sourav (2025)*  
### **Tools:** Google Earth Engine (JavaScript API)  
### **Output Resolution:** 30 m  
### **Projection for Export:** UTM Zone 45N (EPSG:32645)

---

## 📌 **Overview**

This repository contains a complete **hydrological and environmental predictor extraction pipeline** developed using **Google Earth Engine (GEE)**.  
The script derives a set of raster layers commonly used for:

- Flood susceptibility modeling  
- Hydrological modeling  
- Land–environmental assessments  
- Terrain analysis  

All outputs are:  
✔ Clipped to the study area (ROI)  
✔ Reprojected to **EPSG:32645 (UTM 45N)**  
✔ Exported as 30-meter resolution GeoTIFFs  
✔ Derived from globally available, authoritative datasets  

---

## 🎯 **Objectives**

This pipeline automates the extraction of **eight hydrological predictors** that are essential for flood susceptibility, watershed analysis, and environmental modeling:

1. **Digital Elevation Model (DEM)**  
2. **Slope**  
3. **Flow Accumulation (log-transformed)**  
4. **Topographic Wetness Index (TWI)**  
5. **Distance to River**  
6. **Monsoon Rainfall (Median 2015–2024)**  
7. **NDVI (Sentinel-2 median, cloud-masked)**  
8. **Runoff Score (WorldCover 2021)**  

---

## 🌍 **Study Area (ROI)**

The script expects `roi` to be provided as:

```javascript
var roi = zone.geometry();
````

The ROI may be uploaded or imported as:

* A Fusion Table
* A GEE asset (`.geojson`, `.shp`)
* A manually drawn geometry

The map view centers on the ROI:

```javascript
Map.centerObject(roi, 8);
```

---

## 🧭 **Data Sources & Predictor Variables**

### **1. Digital Elevation Model (DEM)**

* Dataset: **USGS/SRTMGL1_003** (30 m)
* Slope is derived using `ee.Terrain.slope()`.

---

### **2. Flow Accumulation & TWI**

* Dataset: **WWF HydroSHEDS 15ACC**
* Flow Accumulation → log-transformed
* Topographic Wetness Index (TWI):

  ```
  TWI = ln(FlowAccum / tan(Slope))
  ```
* Clamped between **0–20** for numerical stability.

---

### **3. Distance to River**

* Dataset: **JRC Global Surface Water Occurrence**
* Pixels ≥10% occurrence considered perennial water.
* Euclidean distance computed via `fastDistanceTransform()`.

---

### **4. Monsoon Rainfall (2015–2024 Median)**

* Dataset: **CHIRPS Daily**
* JJAS rainfall summed per year (June–September).
* Median across 2015–2024 used.

---

### **5. NDVI (Sentinel-2 Median)**

* Dataset: **COPERNICUS/S2_SR_HARMONIZED**
* Cloud masking via QA60 bitmasks
* NDVI computed from median imagery (2020–2024).

---

### **6. Runoff Score (WorldCover 2021)**

Landcover classes are reclassified into hydrological runoff potential.

| Landcover | Score |
| --------- | ----- |
| Cropland  | 2     |
| Trees     | 3     |
| Grassland | 1     |
| Shrubland | 1     |
| Built-up  | 5     |
| Bare      | 4     |
| Wetlands  | 6     |
| Water     | 6     |
| Snow/Ice  | 6     |

---

## 📤 **Export Configuration**

All rasters are standardized and exported using:

* **CRS:** `EPSG:32645`
* **Scale:** 30 m
* **Region:** Clipped strictly to ROI

Export helper:

```javascript
function prep(img) {
    return img.toFloat().clip(roi)
        .reproject({ crs: UTM45, scale: WORK_SCALE });
}
```

Export sample:

```javascript
exportLayer(dem_f, 'DEM');
```

Exports appear under:

```
Google Drive → GEE_Exports/
```

---

## 🖼 **Visualization**

Predictor layers are visualized using:

```javascript
var roiMask = ee.Image.constant(1).clip(roi);

Map.addLayer(
    dem.updateMask(roiMask),
    {min:-7, max:120},
    'DEM (Clipped)'
);
```

This guarantees **no data outside ROI** is displayed.

---

## 📦 **Final Output Layers**

| Predictor         | Filename                        | Resolution | CRS        |
| ----------------- | ------------------------------- | ---------- | ---------- |
| DEM               | `DEM_UTM45_30m.tif`             | 30 m       | EPSG:32645 |
| Slope             | `Slope_UTM45_30m.tif`           | 30 m       | EPSG:32645 |
| Flow Log          | `FlowLog_UTM45_30m.tif`         | 30 m       | EPSG:32645 |
| TWI               | `TWI_UTM45_30m.tif`             | 30 m       | EPSG:32645 |
| Distance to River | `DistanceToRiver_UTM45_30m.tif` | 30 m       | EPSG:32645 |
| Monsoon Rainfall  | `MonsoonRainfall_UTM45_30m.tif` | 30 m       | EPSG:32645 |
| NDVI              | `NDVI_UTM45_30m.tif`            | 30 m       | EPSG:32645 |
| Runoff Score      | `RunoffScore_UTM45_30m.tif`     | 30 m       | EPSG:32645 |

---

## 🧪 **Intended Applications**

This dataset supports:

* AHP-based flood susceptibility modeling
* Machine learning flood prediction models
* Hydrological and watershed studies
* Environmental & terrain analysis
* Climate–water interaction research

---

## 📚 **Citations**

Please cite the following when using this dataset or script:

* NASA/USGS SRTM
* WWF HydroSHEDS
* UCSB-CHG CHIRPS
* ESA Copernicus Sentinel-2
* ESA WorldCover 2021

---

## 📬 **Contact**

**Saeed Sourav**
Civil Engineer
📧 Email: **[saeedsourav@gmail.com](mailto:saeedsourav@gmail.com)**

```

---


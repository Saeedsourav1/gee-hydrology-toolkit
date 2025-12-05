# **Region of Interest (ROI)**

## **1. Overview**

The Region of Interest (ROI) defines the spatial extent within which the flood detection and sample extraction workflow is executed. The ROI is supplied by the user as a **FeatureCollection** hosted in their Google Earth Engine (GEE) assets. All computations—including image filtering, ΔVV calculation, flood masking, and stratified sampling—are restricted to this boundary.

The ROI determines:

* The spatial domain of flood analysis
* The number of available flood and non-flood pixels
* The distribution and spatial validity of the extracted sample points

---

## **2. ROI Requirements**

To ensure compatibility with the script, the ROI must meet the following criteria:

### **2.1 Format**

* Must be a **FeatureCollection**
* Can contain:

  * A single polygon
  * Multiple polygons
  * MultiPolygon geometries

### **2.2 Coordinate Reference System (CRS)**

* The internal CRS does not matter; GEE will reproject as needed.
* A uniform CRS is recommended for clarity (e.g., EPSG:4326 or UTM zone of your study area).

### **2.3 Correct Asset Path**

The ROI must be uploaded to your GEE Assets and referenced as:

```javascript
var aoi = ee.FeatureCollection("users/your_username/your_AOI");
```

Replace `"your_username"` and `"your_AOI"` with the actual asset identifiers.

---

## **3. ROI Simplification (Performance Enhancement)**

Large or highly detailed AOI geometries may trigger:

* Memory overflows
* Long computation times
* Task timeouts

To prevent this, the script applies:

```javascript
aoi = ee.FeatureCollection(aoi.geometry().simplify(100));
```

This reduces geometric complexity while preserving spatial accuracy.

### **Why Simplify?**

* Lower vertex count = faster mask operations
* Reduced geometry complexity = fewer GEE memory failures
* Speeds up clipping and stratified sampling steps

**Tolerance value (100 m)** can be adjusted depending on:

* Size of AOI
* Desired precision
* Runtime constraints

---

## **4. How ROI Interacts with Sentinel-1 Data**

The ROI is used to:

### **4.1 Filter the ImageCollection**

Only S1 images intersecting the AOI are considered:

```javascript
.filterBounds(aoi)
```

### **4.2 Clip Pre/Post Flood Composites**

All processed imagery is clipped:

```javascript
pre.clip(aoi);
post.clip(aoi);
```

### **4.3 Constrain Sample Extraction**

Sampling is strictly performed inside the ROI boundary:

```javascript
region: aoi
```

This ensures generated points do **not** fall outside the study area.

---

## **5. Best Practices When Preparing the ROI**

### ✔ Keep polygons clean

Remove slivers, duplicate vertices, or invalid polygons.

### ✔ Use the smallest AOI required

A smaller AOI → faster processing and lighter outputs.

### ✔ Avoid extremely detailed boundaries

Shapefiles containing thousands of vertices slow down GEE operations.

### ✔ Validate topology

Use GIS tools (QGIS, ArcGIS) to ensure polygons do not overlap improperly.

### ✔ Ensure no null geometry

Null or empty geometries can halt the entire script.

---

## **6. Example ROI Use Cases**

ROIs commonly represent:

* A flood-affected district or subdistrict
* A hydrological basin or sub-basin
* A set of union boundaries
* A buffer around a river corridor
* A custom research area for remote sensing analysis

The script is flexible and works with administrative or natural boundaries.

---

## **7. Troubleshooting ROI Issues**

### ❗ *Error: “Cannot read property ‘geometry’ of null”*

Your AOI contains an empty feature.

### ❗ *Timeout when clipping or sampling*

Use a larger simplification tolerance (e.g., 200–500 m).

### ❗ *No flood samples returned*

Your ROI may not have flooded pixels based on ΔVV threshold.

### ❗ *Sampling returns too few points*

Decrease `pointsPerClass` or enlarge your ROI.

---

## **8. Summary**

The ROI is a fundamental component of the flood sampling workflow.
It defines the study area, constrains all geospatial operations, and ensures the validity of the final dataset. Proper preparation of the ROI leads to:

* Efficient computation
* Clean and precise sampling
* Reliable machine learning datasets
* Robust flood mapping outputs

---


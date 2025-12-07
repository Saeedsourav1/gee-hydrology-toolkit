/***************************************************************
 * GEE Flood Point Extractor 
 * Generates stratified validation points (flood / non-flood)
 * Satellite: Sentinel-1 SAR GRD (C-band
 * Output: CSV (sample_id, lon, lat, flood)
 * Author: Saeed Sourav
 ***************************************************************/

// ===================== USER PARAMETERS =======================

var preStart  = '2022-03-01';
var preEnd    = '2022-04-15';
var postStart = '2022-06-16';
var postEnd   = '2022-06-30';

var vvDiffThreshold = 2.0;    
var pointsPerClass  = 500;     
var seed            = 42;
var scale           = 10;      
var crs             = 'EPSG:32645';
var exportFolder    = 'GEE_Exports';
var exportFileName  = 'Flood_NonFlood_Samples_2022';

// Optional: Simplify AOI to prevent internal memory errors
aoi = ee.FeatureCollection(aoi.geometry().simplify(100));
print("AOI simplified for stability.");


// ========================= 1. AOI INFO =========================
Map.centerObject(aoi, 6);
print("AOI area (km²):", aoi.geometry().area().divide(1e6));


// ========================= 2. LOAD S1 =========================
var s1 = ee.ImageCollection("COPERNICUS/S1_GRD")
  .filterBounds(aoi)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .select('VV');

var pre  = s1.filterDate(preStart, preEnd).median().clip(aoi);
var post = s1.filterDate(postStart, postEnd).median().clip(aoi);


// ====================== 3. ΔVV (PRE - POST) ====================
var vvDiff = pre.subtract(post).rename('vvDiff');

Map.addLayer(vvDiff, {min:-5, max:5, palette:['blue','white','red']}, "ΔVV (Pre-Post)");


// ======================= 4. FLOOD MASK =========================
var floodMask = vvDiff.gt(vvDiffThreshold).selfMask();
Map.addLayer(floodMask, {palette: ['cyan']}, 'Flood Mask');

// Create binary class: 1 = flood, 0 = non-flood
var classImage = vvDiff.gt(vvDiffThreshold)
    .rename('flood')
    .toByte()
    .clip(aoi);

// ====================== 6. STRATIFIED SAMPLING ==================
print("Running stratified sampling...");

var samples = classImage.stratifiedSample({
    numPoints: 0,
    classBand: "flood",
    region: aoi,
    scale: scale,
    classValues: [0, 1],
    classPoints: [pointsPerClass, pointsPerClass],
    seed: seed,
    dropNulls: true,
    geometries: true
});

print("Raw sample count:", samples.size());

// Confirm class balance
var classCount = samples.aggregate_histogram("flood");
print("Sample count by class:", classCount);


// ==================== 7. FIX COORDINATE EXTRACTION ==================
var samplesFixed = samples.map(function(f) {
    var geom = ee.Geometry(f.geometry());
    var coords = geom.coordinates();
    return f.set({
        longitude: coords.get(0),
        latitude: coords.get(1),
        sample_id: f.id()
    });
});


// ======================= 8. MAP LAYERS ==========================
Map.addLayer(samplesFixed.filter(ee.Filter.eq("flood", 1)), 
             {color: "blue"}, "Flood Points (1)", false);

Map.addLayer(samplesFixed.filter(ee.Filter.eq("flood", 0)), 
             {color: "red"}, "Non-Flood Points (0)", false);


// ======================= 9. EXPORT CSV ==========================
var exportCols = ['sample_id', 'longitude', 'latitude', 'flood'];

Export.table.toDrive({
    collection: samplesFixed.select(exportCols),
    description: exportFileName,
    folder: exportFolder,
    fileNamePrefix: exportFileName,
    fileFormat: "CSV"
});

print("Export task ready in Tasks panel.");
print("NOTE: If flood area is very small, fewer flood points may be generated.");

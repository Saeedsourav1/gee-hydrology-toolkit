/***************************************************************
 * HYDROLOGICAL FEATURE EXTRACTION PIPELINE
 * Study Area : Rangpur Division, Bangladesh
 * Author     : Saeed Sourav
 * Prepared   : 2025
 *
 * Extracted Predictors (30 m, UTM Zone 45N):
 *   1. DEM (SRTM)
 *   2. Slope
 *   3. Flow Accumulation (log)
 *   4. Topographic Wetness Index (TWI)
 *   5. Distance to River (JRC GSW)
 *   6. Monsoon Rainfall (CHIRPS Median 2015–2024)
 *   7. NDVI (Sentinel-2 Median, Cloud Masked)
 *   8. Runoff Score (WorldCover 2021)
 ***************************************************************/


/*=====================================================================
   0. PARAMETERS & STUDY AREA
=====================================================================*/

// Resolution and constants
var WORK_SCALE   = 30;
var COARSE_SCALE = 120;
var EPS          = 1e-6;

// Import ROI as a Fusion Table or asset geometry
// Example: var roi = ee.FeatureCollection('users/.../rangpur_roi').geometry();
var roi = zone.geometry();

Map.centerObject(roi, 8);


/*=====================================================================
   1. DIGITAL ELEVATION MODEL & SLOPE
=====================================================================*/

var dem = ee.Image('USGS/SRTMGL1_003')
    .clip(roi)
    .rename('elev_raw');

var slope = ee.Terrain.slope(dem)
    .rename('slope_raw');

// Slope (tan radians) for TWI computation
var slopeTan = slope.multiply(Math.PI / 180)
    .tan()
    .add(0.001)
    .rename('slopeTan');


/*=====================================================================
   2. FLOW ACCUMULATION & TWI (HydroSHEDS)
=====================================================================*/

var flowAccum = ee.Image('WWF/HydroSHEDS/15ACC')
    .toFloat()
    .clip(roi)
    .max(EPS)
    .rename('flowAccum_raw');

var flowLog = flowAccum.add(1)
    .log()
    .rename('flow_log_raw');

var twi = flowAccum.divide(slopeTan)
    .add(EPS)
    .log()
    .clamp(0, 20)
    .rename('twi_raw');


/*=====================================================================
   3. DISTANCE TO RIVER (JRC Surface Water Occurrence)
=====================================================================*/

var waterMask = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
    .select('occurrence')
    .clip(roi)
    .gte(10)
    .unmask(0);

// Distance transform (coarse for performance)
var distCoarse = waterMask.fastDistanceTransform(512)
    .sqrt()
    .multiply(COARSE_SCALE);

// Resample to working resolution
var distRiver = distCoarse
    .resample('bilinear')
    .reproject({crs: dem.projection(), scale: WORK_SCALE})
    .rename('dist_river');


/*=====================================================================
   4. MONSOON RAINFALL (CHIRPS Median 2015–2024)
=====================================================================*/

var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
    .filterBounds(roi)
    .select('precipitation');

var years = ee.List.sequence(2015, 2024);

// Sum JJAS rainfall per year → take median
var monsoonMedian = ee.ImageCollection(
    years.map(function(y) {
        var start = ee.Date.fromYMD(y, 6, 1);
        var end   = ee.Date.fromYMD(y, 9, 30);
        return chirps.filterDate(start, end).sum().set('year', y);
    })
).median().clip(roi)
.rename('rain_monsoon_raw');


/*=====================================================================
   5. VEGETATION INDEX (NDVI, Sentinel-2)
=====================================================================*/

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(roi)
    .filterDate('2020-06-01', '2024-09-30')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30));

function maskS2(image) {
    var qa = image.select('QA60');
    var cloud  = qa.bitwiseAnd(1 << 10).eq(0);
    var cirrus = qa.bitwiseAnd(1 << 11).eq(0);
    return image.updateMask(cloud.and(cirrus)).divide(10000);
}

var ndvi = s2.map(maskS2)
    .map(function(img) {
        return img.normalizedDifference(['B8', 'B4']).rename('ndvi');
    })
    .median()
    .clip(roi)
    .rename('ndvi_raw');


/*=====================================================================
   6. RUNOFF SCORE (WorldCover 2021)
=====================================================================*/

var worldcover = ee.Image('ESA/WorldCover/v200/2021')
    .select('Map')
    .clip(roi);

// Custom reclassification to hydrological runoff score
var runoff = worldcover.remap(
    [10,20,30,40,50,60,70,80,90,95,100],
    [ 2, 3, 1, 1, 5, 4, 6, 6, 4, 6, 6]
).rename('runoff_score_raw');



/*=====================================================================
   7. STANDARDIZE & EXPORT (UTM Zone 45N)
=====================================================================*/

var UTM45 = 'EPSG:32645';

// Prepare layer for export
function prep(img) {
    return img.toFloat()
        .clip(roi)
        .reproject({
            crs: UTM45,
            scale: WORK_SCALE
        });
}

// Final export-ready layers
var dem_f     = prep(dem);
var slope_f   = prep(slope);
var flowlog_f = prep(flowLog);
var twi_f     = prep(twi);
var dist_f    = prep(distRiver);
var rain_f    = prep(monsoonMedian);
var ndvi_f    = prep(ndvi);
var runoff_f  = prep(runoff);

// Export helper
function exportLayer(image, name) {
    Export.image.toDrive({
        image: image,
        description: name + '_UTM45_30m',
        folder: 'GEE_Exports',
        fileNamePrefix: name + '_UTM45_30m',
        region: roi,
        scale: WORK_SCALE,
        crs: UTM45,
        maxPixels: 1e13
    });
}

// Enable exports (uncomment when exporting):
exportLayer(dem_f,     'DEM');
exportLayer(slope_f,   'Slope');
exportLayer(flowlog_f, 'FlowLog');
exportLayer(twi_f,     'TWI');
exportLayer(dist_f,    'DistanceToRiver');
exportLayer(rain_f,    'MonsoonRainfall');
exportLayer(ndvi_f,    'NDVI');
exportLayer(runoff_f,  'RunoffScore');


/*=====================================================================
   8. VISUALIZATION OF ALL PREDICTOR LAYERS 
=====================================================================*/

// Create an image mask from ROI (1 inside ROI, masked outside)
var roiMask = ee.Image.constant(1).clip(roi);


// DEM
Map.addLayer(
    dem.updateMask(roiMask),
    {min: -7, max: 120, palette: ['#f7fbff', '#08306b']},
    'DEM (Clipped)'
);

// Slope
Map.addLayer(
    slope.updateMask(roiMask),
    {min: 0, max: 33, palette: ['#ffffcc','#c2e699','#31a354','#006837']},
    'Slope'
);

// Flow Accumulation (Log)
Map.addLayer(
    flowLog.updateMask(roiMask),
    {min: 0, max: 15, palette: ['#f7fcf5','#c7e9c0','#74c476','#238b45','#00441b']},
    'Flow Accumulation'
);

// TWI
Map.addLayer(
    twi.updateMask(roiMask),
    {min: 0, max: 22, palette:['#ffffcc','#c2e699','#78c679','#31a354','#006837']},
    'TWI'
);

// Distance to River
Map.addLayer(
    distRiver.updateMask(roiMask),
    {min: 0, max: 25000, palette:['#08306b','#2171b5','#6baed6','#bdd7e7','#eff3ff']},
    'Distance to River'
);

// Monsoon Rainfall
Map.addLayer(
    monsoonMedian.updateMask(roiMask),
    {min: 1000, max: 2600, palette:['#f7fbff','#c6dbef','#6baed6','#084594']},
    'Monsoon Rainfall'
);

// NDVI
Map.addLayer(
    ndvi.updateMask(roiMask),
    {min:-1, max:1, palette:['brown','yellow','green']},
    'NDVI'
);

// Runoff Score
Map.addLayer(
    runoff.updateMask(roiMask),
    {min:1, max:6, palette:['blue','green','yellow','orange','red']},
    'Runoff Score'
);


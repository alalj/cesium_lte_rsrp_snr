var Cesium = require('cesium/Cesium');
require('cesium/Widgets/widgets.css');
require('./css/main.css');
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmM2JlYTkxNC0yMDNhLTQzNjQtOWM5OC1lOGQ3YmUyNzZhM2QiLCJpZCI6MjE1MCwiaWF0IjoxNTMxNzY2NTIxfQ.Eu_IofhpqQsb-cw2wMck0D-usoUP1y7eb53m840UxYI'
   

var initialPosition = new Cesium.Rectangle.fromDegrees(-122.45,37.537614,-121.760286,37.603919);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(-70.1077496389876024807, -65, 0.025883251314954971306);
var homeCameraView = {
    destination : initialPosition,
    orientation : {
        heading : initialOrientation.heading,
        pitch : initialOrientation.pitch,
        roll : initialOrientation.roll
    }
};


var mapbox = new Cesium.MapboxImageryProvider({
    mapId: 'mapbox.dark',
    accessToken: 'pk.eyJ1IjoiamF5YWJ5cmQiLCJhIjoiY2plb3N0cXU4MDcxZjM4cXlpcjU2b2t6YiJ9.VuaMxvWUviMu37oVEP53hA'
});
    var viewer = new Cesium.Viewer('cesiumContainer', {
    	imageryProvider: mapbox,
        scene3DOnly: true,
        selectionIndicator: false,
        baseLayerPicker: false,
        timeline: false,
        animation:false
    });
// Set the initial view
viewer.scene.camera.setView(homeCameraView);
var geojsonOptions = {
     clampToGround : false,
     stroke: Cesium.Color.BLACK,
     strokeWidth: 4.0
 };
// Load zipcode boundaries from GeoJson file
var zipcodesPromise = Cesium.GeoJsonDataSource.load('osm_sample.geojson', geojsonOptions);
//var zip_osm_Promise = Cesium.GeoJsonDataSource.load('west_osm_zip_centroids.json');

// Save an new entity collection of zipcode data
var zipcodes;
zipcodesPromise.then(function(dataSource) {
    // Add the new data as entities to the viewer
    viewer.dataSources.add(dataSource);
 zipcodes = dataSource.entities;
// Get the array of entities
    var zipcodeEntities = dataSource.entities.values;
    for (var i = 0; i < zipcodeEntities.length; i++) {
        var entity = zipcodeEntities[i];

        if (Cesium.defined(entity.polygon)) {
            entity.name = entity.properties.ZIP;
            if (entity.properties.CarrierA_rsrp_rank == 1){
            entity.best_rsrp = entity.properties.CarrierA_rsrp;
            entity.polygon.material =Cesium.Color.fromBytes(66,244,128).withAlpha(0.7);
            }

            if (entity.properties.CarrierB_rsrp_rank == 1){
            entity.best_rsrp = entity.properties.CarrierB_rsrp;
            entity.polygon.material = Cesium.Color.fromBytes(244,244,66).withAlpha(0.7);
            }

            if (entity.properties.CarrierC_rsrp_rank == 1){
            entity.best_rsrp = entity.properties.CarrierC_rsrp;
            entity.polygon.material = Cesium.Color.fromBytes(224,35,35).withAlpha(0.7);
            }

            if (entity.properties.CarrierD_rsrp_rank == 1){
            entity.best_rsrp = entity.properties.CarrierD_rsrp;
            entity.polygon.material = Cesium.Color.fromBytes(244,113,66).withAlpha(0.7);
            }

        // Generate Polygon position
        var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
        var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
        entity.position = polyCenter;
        // Generate labels
        entity.label = {
        text : entity.name,
        showBackground : true,
        scale : 0.6,
        horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition : new Cesium.DistanceDisplayCondition(10.0, 8000.0),
        disableDepthTestDistance : 100.0
        };

       
        entity.description = "Best RSRP Per Zip<br> Green: CarrierA<br> Yellow: CarrierB<br> Red: CarrierC<br> Orange: CarrierD<br>" + "Best_RSRP: " + parseFloat(entity.best_rsrp).toFixed(0) + " dBm";

        }
    }
});





fetch('osm_sample_points.json').then((r) => r.json()).then(function(json) {
  
  osm_box(json);
})

function osm_box(data) {
  var size = 500;
  var entities = viewer.entities;
  var osmBoxes = entities.add(new Cesium.Entity());

  for(var i=0;i< data.length;i++) {
    var entity = data[i];
    var height;
    var best_carrier;
    var ht_check;
    //console.log(entity);
    var position;
    var lon = parseFloat(entity.lon);
    var lat = parseFloat(entity.lat);

    var CarrierA_rank = parseInt(entity.CarrierA_snr_rank);
    var CarrierB_rank = parseInt(entity.CarrierB_snr_rank);
    var CarrierC_rank = parseInt(entity.CarrierC_snr_rank);
    var CarrierD_rank = parseInt(entity.CarrierD_snr_rank);
    var box_color;
    if (CarrierA_rank === 1){
        best_carrier = 'CarrierA';
        ht_check = parseFloat(entity.CarrierA_snr);
        if (ht_check > 0){
            height = (entity.CarrierA_snr)*1000;
            position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);
        }
        else{
        height = 0; 
        position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);  
        }
        box_color = Cesium.Color.fromBytes(66,244,128);
    }
    if (CarrierB_rank === 1){
        best_carrier = 'CarrierB';
                ht_check = parseFloat(entity.CarrierB_snr);
        if (ht_check > 0){
            height = (entity.CarrierB_snr)*1000;
            position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);
        }
        else{
        height = 0; 
        position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);  
        }
        box_color = Cesium.Color.fromBytes(244,244,66);
    }
    if (CarrierC_rank ===1){
        best_carrier = 'CarrierC';
        ht_check = parseFloat(entity.CarrierC_snr);
        if (ht_check > 0){
            height = (entity.CarrierC_snr)*1000;
            position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);
        }
        else{
        height = 0; 
        position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);  
        }
       box_color = Cesium.Color.fromBytes(224,35,35);
    }
    if (CarrierD_rank ===1){
        best_carrier = 'CarrierD';
        ht_check = parseFloat(entity.CarrierD_snr);
        if (ht_check > 0){
            height = (entity.CarrierD_snr)*1000;
            position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);
        }
        else{
        height = 0; 
        position = Cesium.Cartesian3.fromDegrees(
            lon, 
            lat, 
            height / 2);  
        }
       box_color = Cesium.Color.fromBytes(244,113,66); 
    }
    var prop_object = {
        "Best_Carrier" : best_carrier,
        "Best_snr" : ht_check
    };
    var ces_pro = new Cesium.PropertyBag(prop_object);
    entity.description = "Best SNR PER ZIP<br> Green: CarrierA <br>Yellow: CarrierB<br> Red: CarrierC <br> Orange: CarrierD<br>Best_SNR: " + parseFloat(ht_check).toFixed(2) + " dB"; 
    entities.add({
      parent: osmBoxes,
      name : entity.ZIP,
      position: position,
      description: entity.description,
      property: ces_pro,
      box : {
        dimensions : new Cesium.Cartesian3(size, size, height),
        material : box_color
      }
    });
    }
  

}

//console.log("hello worlders");
//console.log(viewer.dataSources);
//console.log(viewer.entities);
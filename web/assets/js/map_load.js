// load WMS from geoserver
var local_wms_source = new ol.source.TileWMS({
  url: 'http://159.203.2.8:8080/geoserver/bcatlas/wms',
    params: {
        'LAYERS': 'bcatlas:lumby'
    },
    serverType: 'geoserver'
});

var local_wms_layer = new ol.layer.Tile({
    source:  local_wms_source
});

var landinfo_wms_source = new ol.source.TileWMS({
    url: 'http://52.11.218.131:8080/geoserver/Land_Info_Lumby/gwc/service/wms',
    params: {
        'LAYERS': 'Land_Info_Lumby:Roads, Land_Info_Lumby:Lumby Roads Label, Land_Info_Lumby:Lumby Parcels Label'
    },
    serverType: 'geoserver'
});

var landinfo_wms_layer = new ol.layer.Tile({
    source:  landinfo_wms_source
});

// get basemap from bing
//var base_map = new ol.layer.Tile({
//    source: new ol.source.BingMaps({
//        key: 'AoAeBI2PYslcgT4CDf-0E8xi9WLktQfKuQtnai-suWGguL0BSisxsrvfPaUe9kv0',
//        imagerySet: "ordnanceSurvey",
//        maxZoom: 19
//    })
//});

// get basemap from mapquest
//var base_map = new ol.layer.Tile({
//    source: new ol.source.MapQuest({layer: 'osm'})
//});


var highlight22 = new ol.layer.Vector({
    source: new ol.source.Vector({wrapX: false}),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#B894FF',
            width: 4
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#B894FF'
            })
        })
    })
});

var layers = [
    //base_map,
    landinfo_wms_layer,
    local_wms_layer,
    highlight22
];
//
//var view = new ol.View({
//    projection: new ol.proj.get('EPSG:26911'),
//    center: [359298, 5568572],
//    zoom: 2,
//    resolutions: [
//        11.925225236875121, 5.962612618437561, 2.9813063092187804, 1.4906531546093902, 0.7453265773046951,
//        0.3726632886523476, 0.1863316443261738, 0.0931658221630869
//    ]
//});

//set view to lumby
var view = new ol.View({
    projection: new ol.proj.get('EPSG:26911'),
    center: [359298, 5568572],
    //center: ol.proj.transform([-118.967812,50.250416], 'EPSG:4326', 'EPSG:3857'),
    zoom: 15
});

// create the map
var map = new ol.Map({
    layers: layers,
    target: 'map',
    view: view,
    loadTilesWhileInteracting: true,
    bounds: [352474.5483727603, 5561335.500385814, 379061.82093737787, 5604565.543100912]
});

var highlight_overlay = new ol.FeatureOverlay({
    map: map,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [255, 0, 0, 0.6],
            width: 2
        }),
        fill: new ol.style.Fill({
            color: [255, 0, 0, 0.2]
        }),
        zIndex: 1000
    })
});




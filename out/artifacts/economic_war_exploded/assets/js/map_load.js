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



var layers = [
    //base_map,
    local_wms_layer,
    landinfo_wms_layer
];

// set view to lumby
var view = new ol.View({
    center: ol.proj.transform([-118.967812,50.250416], 'EPSG:4326', 'EPSG:3857'),
    zoom: 15
});

// create the map
var map = new ol.Map({
    layers: layers,
    target: 'map',
    view: view,
    loadTilesWhileInteracting: true
});

var highlight = new ol.layer.Vector({
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
map.addLayer(highlight);




var base_URL = "http://52.11.218.131:8080/geoserver/Land_Info_Lumby/gwc/service/wms";

// load WMS from geoserver
var wms_source = new ol.source.TileWMS({
  url: 'http://159.203.2.8:8080/geoserver/lumby/wms',
//    url: base_URL,
    params: {
        'LAYERS': 'lumby:Lumby_Parcels'
    },
    serverType: 'geoserver'
});

var wms_layer = new ol.layer.Tile({
    source:  wms_source
});

// get basemap from mapquest
var base_map = new ol.layer.Tile({
    source: new ol.source.MapQuest({layer: 'osm'})
});

var layers = [
    base_map,
    wms_layer
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
    view: view
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




// map_load.js
// All functions responsible for creating the map

// load all of the layers from geoserver
// each layer must be loaded individually so it can be manipulated by the legend
var parcels = new ol.layer.Tile({
    title: 'Parcels',
    source:  new ol.source.TileWMS({
        url: 'http://159.203.2.8:8080/geoserver/bcatlas/wms',
        params: {
            'LAYERS': 'BCAtlas:lumby_parcels'
        },
        serverType: 'geoserver'
    })
});

var parcels_labels = new ol.layer.Tile({
    title: 'Parcel Labels',
    source:  new ol.source.TileWMS({
        url: 'http://52.11.218.131:8080/geoserver/Land_Info_Lumby/gwc/service/wms',
        params: {
            'LAYERS': 'Land_Info_Lumby:Lumby Parcels Label'
        },
        serverType: 'geoserver'
    })
});

var boundary = new ol.layer.Tile({
    title: 'Municipal Boundary',
    source:  new ol.source.TileWMS({
        url: 'http://159.203.2.8:8080/geoserver/bcatlas/wms',
        params: {
            'LAYERS': 'BCAtlas:lumby_municipal_boundary'
        },
        serverType: 'geoserver'
    })
});

var roads = new ol.layer.Tile({
    title: 'Roads',
    source:  new ol.source.TileWMS({
        url: 'http://52.11.218.131:8080/geoserver/Land_Info_Lumby/gwc/service/wms',
        params: {
            'LAYERS': 'Land_Info_Lumby:Roads'
        },
        serverType: 'geoserver'
    })
});

var roads_label = new ol.layer.Tile({
    title: 'Road Labels',
    source:  new ol.source.TileWMS({
        url: 'http://52.11.218.131:8080/geoserver/Land_Info_Lumby/gwc/service/wms',
        params: {
            'LAYERS': 'Land_Info_Lumby:Lumby Roads Label'
        },
        serverType: 'geoserver'
    })
});


var ortho = new ol.layer.Tile({
    title: 'Orthophotos',
    source:  new ol.source.TileWMS({
        url: 'http://52.11.218.131:8080/geoserver/Land_Info_Lumby/gwc/service/wms',
        params: {
            'LAYERS': 'Land_Info_Lumby:Lumby_Orthos'
        },
        serverType: 'geoserver'
    })
});

var highlight_overlay = new ol.layer.Vector({
    title: 'Highlight Feature',
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
    ortho,
    parcels,
    parcels_labels,
    roads,
    roads_label,
    boundary,
    highlight_overlay
];

//set view to lumby
var view = new ol.View({
    projection: new ol.proj.get('EPSG:26911'),
    center: [359298, 5568572],
    zoom: 15
});

// create the map
var map = new ol.Map({
    layers: layers,
    target: 'map',
    view: view,
    loadTilesWhileInteracting: true,
    bounds: [352474.5483727603, 5561335.500385814, 379061.82093737787, 5604565.543100912],
});

var feature_overlay = new ol.FeatureOverlay({
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

// http://159.203.2.8:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=bcatlas:lumby

map.getLayers().forEach(function(layer, i) {
    console.log(layer.get('title'))
});
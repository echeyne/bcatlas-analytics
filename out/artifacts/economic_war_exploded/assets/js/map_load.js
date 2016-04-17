// map_load.js
// All functions responsible for creating the map

// load all of the layers from geoserver
// each layer must be loaded individually so it can be manipulated by the legend

var parcels = new ol.layer.Tile({
    title: 'Parcels',
    source:  new ol.source.TileWMS({
        url: 'http://159.203.2.8:8080/geoserver/bcatlas/wms',
        params: {
            'LAYERS': 'BCAtlas:lumby_parcel_postgis'
        },
        serverType: 'geoserver'
    })
});

var parcels_labels = new ol.layer.Tile({
    title: 'Parcel Labels',
    visible: false,
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
    visible: false,
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
    visible: false,
    source:  new ol.source.TileWMS({
        url: 'http://52.11.218.131:8080/geoserver/Land_Info_Lumby/gwc/service/wms',
        params: {
            'LAYERS': 'Land_Info_Lumby:Lumby_Orthos'
        },
        serverType: 'geoserver'
    })
});

var parcel_val = new ol.layer.Tile({
    title: 'Value per sq ft',
    visible: false,
    source:  new ol.source.TileWMS({
        url: 'http://159.203.2.8:8080/geoserver/bcatlas/wms',
        params: {
            'LAYERS': 'bcatlas:lumby_parcelvalue'
        },
        serverType: 'geoserver'
    })
});

var building_pct = new ol.layer.Tile({
    title: 'Building value as % of total value',
    visible: false,
    source:  new ol.source.TileWMS({
        url: 'http://159.203.2.8:8080/geoserver/bcatlas/wms',
        params: {
            'LAYERS': 'bcatlas:buildingPct'
        },
        serverType: 'geoserver'
    })
});

var highlight_overlay = new ol.layer.Vector({
    title: 'Highlighted Feature',
    source: new ol.source.Vector({wrapX: false}),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#4c00ff',
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
    parcel_val,
    building_pct,
    parcels_labels,
    roads,
    roads_label,
    boundary,
    highlight_overlay
];

//set view to lumby
var view = new ol.View({
    projection: new ol.proj.get('EPSG:26911'),
    center: [359498, 5568372],
    zoom: 15,
    minZoom: 15
});

// create the map
var map = new ol.Map({
    layers: layers,
    target: 'map',
    view: view,
    loadTilesWhileInteracting: true,
    bounds: [352474.5483727603, 5561335.500385814, 379061.82093737787, 5604565.543100912]
});

// Add drawing vector source
var drawing_source = new ol.source.Vector();

//Add drawing layer
var drawing_layer = new ol.layer.Vector({
    source: drawing_source
});
map.addLayer(drawing_layer);

// add each layer as a checkbox in the legend
map.getLayers().forEach(function(layer) {
    if (layer != highlight_overlay && layer != drawing_layer && layer != parcel_val && layer != building_pct) {
        var html = '<div class="checkbox">'
            + '<label><input type="checkbox" value="' + layer.get('title') +'" onclick="toggleLayer(this.value, $(this).is(\':checked\'))"'
            + ( layer.getVisible() ?  'checked>' : '>')
            + layer.get('title') + '</label>'
            + '</div>';
        $('#legend-content').append(html);
    }
    else if (layer == parcel_val) {
        var html = '<div class="checkbox">'
            + '<label><input type="checkbox" value="' + layer.get('title') +'" onclick="toggleLayer(this.value, $(this).is(\':checked\'))"'
            + ( layer.getVisible() ?  'checked>' : '>')
            + layer.get('title') + '</label>'
            + '</div>';
        html += '<div class="legend-rankings small text-muted">' +
                    '<span class="prop-b1">&#9608;</span> $0-$16.60/sq ft' +
                    '<br><span class="prop-b2">&#9608;</span> $16.61-$25.40/sq ft' +
                    '<br><span class="prop-b3">&#9608;</span> $25.41-$36.70/sq ft ' +
                    '<br><span class="prop-b4">&#9608;</span> $36.71/sq ft +' +
                '</div>';
        $('#analysis-content').append(html);
    }
    else if (layer == building_pct) {
        var html = '<div class="checkbox">'
            + '<label><input type="checkbox" value="' + layer.get('title') +'" onclick="toggleLayer(this.value, $(this).is(\':checked\'))"'
            + ( layer.getVisible() ?  'checked>' : '>')
            + layer.get('title') + '</label>'
            + '</div>';
        html += '<div class="legend-rankings small text-muted">' +
        '<span class="build-b1">&#9608;</span> 0%-67%' +
        '<br><span class="build-b2">&#9608;</span> 68%-75%' +
        '<br><span class="build-b3">&#9608;</span> 76%-81% ' +
        '<br><span class="build-b4">&#9608;</span> 81% +' +
        '</div>';
        $('#analysis-content').append(html);
    }
});
// map_interact.js
// handles all of the user interactions with the map

//when user clicks on map find associated parcel and highlight
map.on('singleclick', function (evt) {
    if (draw == undefined || !draw.getActive()) {
        var view = map.getView();
        var jsonURL = parcels.getSource().getGetFeatureInfoUrl(
            evt.coordinate,
            view.getResolution(),
            view.getProjection(),
            {
                'INFO_FORMAT': 'application/json'
            }
        );
        if (jsonURL) {
            $.ajax({
                url: jsonURL,
                success: function (response) {
                    highlightFeature(response, true);
                    $.when(getParcelId(response)).done(function (parcel_list) {
                        if (typeof(parcel_list) != 'undefined') {
                            // get the subdivision information for the parcels and display it in the SUMMARY tab
                            getSubDivId(parcel_list);

                            // get the BCA data for the parcels and display it in the LIST tab
                            getParcelInfo(parcel_list);
                        }
                    });

                },
                error: function (response) {
                    console.log(response)
                }
            })
        }
    }
});

// highlight the feature that is selected on single click
function highlightFeature(map_response, clear) {
    if (clear) {
        clearMap();
    }
    var parser = new ol.format.GeoJSON();
    var source = highlight_overlay.getSource();
    source.addFeatures(parser.readFeatures(map_response));
}

// gets the selected parcels from the user map click event
function getParcelId(map_response) {
    var parser = new ol.format.GeoJSON();
    var result = parser.readFeatures(map_response);

    if (result.length) {
        var id_list = [];
        for (var i = 0, ii = result.length; i < ii; ++i) {
            // save the parcel id
            id_list.push(result[i].get('gislkp'));
        }
    }
    return id_list;
}

// get the address, lot info, assessment value given a list of parcels
function getParcelInfo(parcel_list) {
    $.ajax({
        type: 'GET',
        url: '../getparcelinfo?parcelList=' + parcel_list.toString(),
        success: function(result) {
            var json = jQuery.parseJSON(result);
            displayList(json);
            if (parcel_list.length > 1) {
                displayListAgg(json);
            }
        },
        error: function(result) {
            console.log('Error ' + result.toString());
        }
    });
}

function getSubDivId(parcelList) {
    $.ajax({
        type: "GET",
        url: "../getcensubdiv?parcelId=" + parcelList,
        success: function(result) {
            var json = jQuery.parseJSON(result);
            displaySummary(json["csduid"]);
            displayDemoCensus(json["csduid"]);
            displayDemoNHS(json["csduid"]);
        },
        error: function(result) {
            console.log(result);
            console.log("Error " + result.toString());
        }
    });
}

// display the list of selected parcels in the LIST tab
// data comes in as a JSON
function displayList(bca_data) {
    $("#list").empty();
    // the length will be 0 when a property is clicked on that has no associated BCA data
    if (Object.keys(bca_data).length > 0) {
        // create a table to hold the results
        var html = '<table id="list-table" class="table table-condensed">';

        $.each( bca_data, function( id, json ) {
            html += '<tr><td colspan="2">' + json["address"] + '</td></tr>';
            html += '<tr><td class="strong">Jurisdiction Roll</td><td class="text-right">' + id + '</td></tr>';
            html += '<tr><td class="strong">Lot Size</td><td class="text-right">' + json["lot_size"] + ' ' + json["lot_dim"] + '</td></tr>';
            html += '<tr><td class="strong">Assessed Land Value</td><td class="text-right"> $' + json["land_asses"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
            html += '<tr><td class="strong">Assessed Building Value</td><td class="text-right"> $' + json["build_asses"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
            html += '<tr><td class="strong">Total Assessed Value</td><td class="text-right"> $' + json["total_asses"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
            html += '<tr><td colspan="2"><hr></td></tr>'
        });

        html += '</table>';
    }
    else {
        var html = '<p>No data could be found for the selected parcel(s).</p>'
    }
    $("#list").append(html);
}

// display a summary of the selected parcels in the LIST tab
// data comes in as a JSON
// only do this if more than one parcel is selected
function displayListAgg(bca_data) {
    var building_sum = 0;
    var land_sum = 0;
    var min_val = Number.MAX_SAFE_INTEGER;
    var max_val = 0;
    var num_parcels = 0;

    if (Object.keys(bca_data).length > 0) {
        // create a table to hold the results
        var html = '<table id="list-agg-table" class="table table-condensed">';

        $.each( bca_data, function( id, json ) {
            num_parcels++;
            building_sum += parseInt(json['build_asses']);
            land_sum += parseInt(json['land_asses']);
            if (parseInt(json['build_asses']) + parseInt(json['land_asses']) < min_val) {
                min_val = parseInt(json['build_asses']) + parseInt(json['land_asses']);
            }
            if (parseInt(json['build_asses']) + parseInt(json['land_asses']) > max_val) {
                max_val = parseInt(json['build_asses']) + parseInt(json['land_asses']);
            }
        });
        html += '<tr><td class="strong">Number of parcels:</td><td class="text-right">' + num_parcels + '</td></tr>';
        html += '<tr><td class="strong">Maximum assessed value:</td><td class="text-right"> $' + max_val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
        html += '<tr><td class="strong">Minimum assessed value:</td><td class="text-right"> $' + min_val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
        html += '<tr><td class="strong">Total assessed value:</td><td class="text-right"> $' + (building_sum+ land_sum).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
        html += '<tr><td class="strong">Average assessed value:</td><td class="text-right"> $' + (((building_sum + land_sum)/num_parcels).toFixed(0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
        html += '<tr><td colspan="2"><hr></td></tr>'
        html += '</table>';

        $('#list').prepend(html);
    }
}

// display a summary of the surrounding demographics
function displaySummary(csduid) {
    // undefined csduid occurs when user clicks on a property that has no associated BCA data
    if (typeof(csduid) == 'undefined') {
        var html = '<p>No data could be found for the selected parcel(s).</p>';
        $('#summary').empty();
        $('#summary').append(html);
    }
    else {
        // display throbber to show user that demo info is being collected
        $('#summary').empty();
        var html = '<div class="throbber">' +
            '<p>Your information is loading.</p>' +
            '<img src="assets/images/loading.gif" title="Loading" alt="Please wait, your content is loading" />';
        $('#summary').append(html);

        $.ajax({
            type: "GET",
            url: "../getsummaryinfo?type=csduid&csduid=" + csduid,
            success: function(result) {
                var summary_data = jQuery.parseJSON(result);
                var html = '<p class="small">The following summary data is provided by Statistics Canada from the 2011 ' +
                    'Canadian Census. These statistics are based on the responses from the census subdivision '
                    + ' of the given area. A census subdivision is an area that is a municipality or an area that is deemed'
                    + ' to be equivalent to a municipality for statistical reporting purposes.</p>';
                html += '<table class="table table-striped">';
                html += '<tr><td class="strong">Population</td><td class="text-right">' + summary_data["Population in 2011"] + '</td></tr>';
                html += '<tr><td class="strong">Median Age</td><td class="text-right">' + summary_data["Median age of the population"] + '</td></tr>';
                html += '<tr><td class="strong">Number of households</td><td class="text-right">' + summary_data["Total number of private households by household type"] + '</td></tr>';
                html += '<tr><td class="strong">Number of people per family</td><td class="text-right">' + summary_data["Average number of persons per census family"] + '</td></tr>';
                html += '<tr><td class="strong">Average number of children at home</td><td class="text-right">' + summary_data["Average number of children at home per census family"] + '</td></tr>';

                $('#summary').empty();
                $('#summary').append(html);
            },
            error: function(result) {
                console.log("Error " + result.toString());
            }
        });
    }
}

// display demographic info for surrounding area using information gathered in the 2011 Canadian census
function displayDemoCensus(csduid) {
    // undefined csduid occurs when user clicks on a property that has no associated BCA data
    if (typeof(csduid) == 'undefined') {
        var html = '<p>No data could be found for the selected parcel(s).</p>';
        $('#demographics-census').empty();
        $('#demographics-census').append(html);
    }
    else {
        // display throbber to show user that demo info is being collected
        $('#demographics-census').empty();
        var html = '<div class="throbber">' +
            '<p>Your information is loading.</p>' +
            '<img src="assets/images/loading.gif" title="Loading" alt="Please wait, your content is loading" />';
        $('#demographics-census').append(html);

        $.ajax({
            type: "GET",
            url: "../getdemoinfo?type=csduid&csduid=" + csduid + "&source=census",
            success: function (result) {
                var demo_data = jQuery.parseJSON(result);
                var html = '<p class="small">The following demographics data is provided by Statistics Canada from the 2011 ' +
                    'Canadian Census. These statistics are based on the responses from the census subdivision '
                    + ' of the given area. A census subdivision is an area that is a municipality or an area that is deemed'
                    + ' to be equivalent to a municipality for statistical reporting purposes.</p>';

                html += '<p class="chart-title">Population by Age Group</p>' +
                '<div id="age-chart"></div>' +
                '<p class="chart-title">Population by Marital Status</p>' +
                '<div id="marriage-chart"></div>' +
                '<p class="chart-title">Population by Language Spoken at Home</p>' +
                '<div id="language-chart"></div>' +
                '<p class="chart-title">Population by Dwelling Type</p>' +
                '<div id="dwelling-type-chart"></div>' +
                '<p class="chart-title">Population by Dwelling Size</p>' +
                '<div id="dwelling-size-chart"></div>';

                $('#demographics-census').empty();
                $('#demographics-census').append(html);

                formatAgeData(demo_data);
                formatMarriageData(demo_data);
                formatLanguageData(demo_data);
                formatDwellingTypeData(demo_data);
                formatDwellingSizeData(demo_data);
            },
            error: function (result) {
                console.log("Error " + result.toString());
            }
        });
    }
}

// display demographic info for surrounding area using information gathered in the
// 2011 Canadian National Household Survey
function displayDemoNHS(csduid) {
    // undefined csduid occurs when user clicks on a property that has no associated BCA data
    if (typeof(csduid) == 'undefined') {
        var html = '<p>No data could be found for the selected parcel(s).</p>';
        $('#demographics-nhs').empty();
        $('#demographics-nhs').append(html);
    }
    else {
        // display throbber to show user that demo info is being collected
        $('#demographics-nhs').empty();
        var html = '<div class="throbber">' +
            '<p>Your information is loading.</p>' +
            '<img src="assets/images/loading.gif" title="Loading" alt="Please wait, your content is loading" />';
        $('#demographics-nhs').append(html);

        $.ajax({
            type: "GET",
            url: "../getdemoinfo?type=csduid&csduid=" + csduid + "&source=nhs",
            success: function (result) {
                var demo_data = jQuery.parseJSON(result);
                var html = '<p class="small">The following demographics data is provided by Statistics Canada from the 2011 ' +
                    'Canadian National Household Survey. These statistics are based on the responses from the census subdivision '
                    + ' of the given area. A census subdivision is an area that is a municipality or an area that is deemed'
                    + ' to be equivalent to a municipality for statistical reporting purposes.</p>';

                html += '<p class="chart-title">Population by Highest Level of Education (aged 15+)</p>' +
                '<div id="education-chart"></div>' +
                '<p class="chart-title">Population by Occupation Type (aged 15+)</p>' +
                '<div id="occupation-chart"></div>' +
                '<p class="chart-title">Population by Gross Income (aged 15+)</p>' +
                '<div id="income-chart"></div>';

                $('#demographics-nhs').empty();
                $('#demographics-nhs').append(html);

                formatEducationData(demo_data);
                formatOccupationData(demo_data);
                formatIncomeData(demo_data);
            },
            error: function (result) {
                console.log("Error " + result.toString());
            }
        });
    }
}

// on click of the draw polygon button enable drawing
// make draw global so we can check to see if a draw is occurring for other interactions
var draw;
$('#polygon').on('click', function() {
    clearMap();
    draw = new ol.interaction.Draw({
        source: drawing_source,
        type: 'Polygon'
    });
    map.addInteraction(draw);
    draw.on('drawend', function() {
        map.removeInteraction(draw);

        controlDoubleClickZoom(false);
        // give map time to draw shape
        setTimeout(function() {
            // get the coordinates of the points in the shape
            var geom_str = getGeomStr();
            if (geom_str.length > 0) {
                $.ajax({
                    type: 'GET',
                    url: '../getshapeintersection?geom=' + geom_str,
                    success: function(result) {
                        var points = jQuery.parseJSON(result);
                        var parcel_list = []; // keep track of all the parcel ids
                        clearMap(); // clear the map before we start highlighting features
                        $.each(points, function(key, val) {
                            parcel_list.push(key);
                            var view = map.getView();
                            var jsonURL = parcels.getSource().getGetFeatureInfoUrl(
                                [val['X'], val['Y']],
                                view.getResolution(),
                                view.getProjection(),
                                {
                                    'INFO_FORMAT': 'application/json'
                                }
                            );
                            if (jsonURL) {
                                $.ajax({
                                    url: jsonURL,
                                    success: function (response) {
                                        highlightFeature(response, false);
                                    },
                                    error: function (response) {
                                        console.log(response)
                                    }
                                })
                            }
                        });
                        // display the selected parcels in the LIST tab
                        getParcelInfo(parcel_list);
                        // get the subdivision information for the parcels and display it in the SUMMARY tab
                        getSubDivId(parcel_list);
                    },
                    error: function(result) {
                        console.log(result);
                        console.log("Error " + result.toString());
                    }
                });
            }

        }, 251);

        // Delay execution of activation of double click zoom function and setting draw to null
        setTimeout(function() {
            controlDoubleClickZoom(true);
            draw = null;
        }, 300);
    });
});

// generate a string of geometry points to be used when finding selected points using PostGIS
function getGeomStr() {
    // there will be only one feature in the layer
    var coords_arr = drawing_source.getFeatures()[0].getGeometry().getCoordinates().toString().split(",");
    var coords_list = '';

    // loop through all of the points in coords_arr
    for (var i=0; i<coords_arr.length; i++) {
        // get the xy of each point and format it in the way that PostGIS query needs
        // make URL safe using '_'
        coords_list += coords_arr[i];
        if (i % 2 != 0) {
            coords_list += '_1,';
        }
        else if (i % 2 == 0) {
            coords_list += '_';
        }
    }
    coords_list = coords_list.slice(0, -1);
    return coords_list;

}

// clear all drawn elements from the map
function clearMap() {
    drawing_layer.getSource().clear();
    highlight_overlay.getSource().clear();
}

// control double click zoom at the end of the draw event
function controlDoubleClickZoom(active){
    //Find double click interaction
    var interactions = map.getInteractions();
    for (var i = 0; i < interactions.getLength(); i++) {
        var interaction = interactions.item(i);
        if (interaction instanceof ol.interaction.DoubleClickZoom) {
            interaction.setActive(active);
        }
    }
}

// handle when the user clicks a legend checkbox to turn a layer on/off
// NOTE: when we get the checked value the check has already happened
function toggleLayer(layerName, checked) {
    map.getLayers().forEach(function(layer) {
        if (layer.get('title') == layerName) {
            layer.setVisible(checked)
        }
    });
}

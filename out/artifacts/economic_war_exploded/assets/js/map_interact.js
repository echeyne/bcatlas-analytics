google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

//when user clicks on map find associated parcel and highlight
map.on('singleclick', function (evt) {
    if (draw == undefined || !draw.getActive()) {
        var view = map.getView();
        var jsonURL = local_wms_layer.getSource().getGetFeatureInfoUrl(
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
                    highlightFeature(response);
                    $.when(getParcelId(response)).done(function (parcel_list) {
                        // get the subdivision information for the parcels and display it in the SUMMARY tab
                        getSubDivId(parcel_list[0]);

                        // get the BCA data for the parcels and display it in the LIST tab
                        getParcelInfo(parcel_list);
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
function highlightFeature(map_response) {
    clearMap();
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
            id_list.push(result[i].get('GISLkp'));
        }
    }
    return id_list;
}

// retrieve the census info related to a given parcel id
// request sent to GetSubDivInfo.java
function getSubDivInfo(parcelId) {
    $.ajax({
        type: "POST",
        url: "../getsubdivinfo",
        data: {parcelId: parcelId[0]}, // right now parcel id list is hardcoded to only take in the first element
        success: function(result) {
            var json = jQuery.parseJSON(result);
            displaySummary(json);
            displayDemo(json);
        },
        error: function(result) {
            console.log('Error ' + result.toString());
        }
    });
}

// get the address, lot info, assessment value given a list of parcels
function getParcelInfo(parcel_list) {
    $.ajax({
        type: "GET",
        url: "../getparcelinfo?parcelList=" + parcel_list.toString(),
        success: function(result) {
            var json = jQuery.parseJSON(result);
            displayList(json);
        },
        error: function(result) {
            console.log("Error " + result.toString());
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
            displayDemo(json["csduid"]);
        },
        error: function(result) {
            console.log("Error " + result.toString());
        }
    });
}

// display the list of selected parcels in the LIST tab
// data comes in as a JSON
function displayList(bca_data) {
    $("#list").empty();
    // create a table to hold the results
    var html = '<table class="table table-condensed">';

    $.each( bca_data, function( id, json ) {
        html += '<tr><td colspan="2">' + json["address"] + '</td></tr>';
        html += '<tr><td class="strong">Jurisdiction Roll</td><td>' + id + '</td></tr>';
        html += '<tr><td class="strong">Lot Size</td><td>' + json["lot_size"] + ' ' + json["lot_dim"] + '</td></tr>';
        html += '<tr><td class="strong">Assessed Land Value</td><td> $' + json["land_asses"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
        html += '<tr><td class="strong">Assessed Building Value</td><td> $' + json["build_asses"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
        html += '<tr><td class="strong">Total Assessed Value</td><td> $' + json["total_asses"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td></tr>';
    });

    html += '</table>';
    $("#list").append(html);
}

// display a summary of the surrounding demographics
function displaySummary(csduid) {
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
            var html = '<p class="small">The following summary data is provided by Statistics Canada based on the census subdivision'
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

function displayDemo(csduid) {
    console.log(csduid);

    // display throbber to show user that demo info is being collected
    $('#demographics').empty();
    var html = '<div class="throbber">' +
        '<p>Your information is loading.</p>' +
        '<img src="assets/images/loading.gif" title="Loading" alt="Please wait, your content is loading" />';
    $('#demographics').append(html);

    $.ajax({
        type: "GET",
        url: "../getdemoinfo?type=csduid&csduid=" + csduid,
        success: function(result) {
            var demo_data = jQuery.parseJSON(result);
            var html = '<p class="small">The following demographics data is provided by Statistics Canada based on the census subdivision'
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

            $('#demographics').empty();
            $('#demographics').append(html);

            formatAgeData(demo_data);
            formatMarriageData(demo_data);
            formatLanguageData(demo_data);
            formatDwellingTypeData(demo_data);
            formatDwellingSizeData(demo_data);
        },
        error: function(result) {
            console.log("Error " + result.toString());
        }
    });
}

// format and display demographics by age group
function formatAgeData(json) {
    var total_pop = json["age"]["Total population by age groups"]["total"];
    var pop_0_4 = json["age"]["0 to 4 years"]["total"];
    var pop_5_9 = json["age"]["5 to 9 years"]["total"];
    var pop_10_14 = json["age"]["10 to 14 years"]["total"];
    var pop_15_19 = json["age"]["15 to 19 years"]["total"];
    var pop_20_24 = json["age"]["20 to 24 years"]["total"];
    var pop_25_29 = json["age"]["25 to 29 years"]["total"];
    var pop_30_34 = json["age"]["30 to 34 years"]["total"];
    var pop_35_39 = json["age"]["35 to 39 years"]["total"];
    var pop_40_44 = json["age"]["40 to 44 years"]["total"];
    var pop_45_49 = json["age"]["45 to 49 years"]["total"];
    var pop_50_54 = json["age"]["50 to 54 years"]["total"];
    var pop_55_59 = json["age"]["55 to 59 years"]["total"];
    var pop_60_64 = json["age"]["60 to 64 years"]["total"];
    var pop_65_69 = json["age"]["65 to 69 years"]["total"];
    var pop_70_74 = json["age"]["70 to 74 years"]["total"];
    var pop_75_79 = json["age"]["75 to 79 years"]["total"];
    var pop_80_84 = json["age"]["80 to 84 years"]["total"];
    var pop_85_over = json["age"]["85 years and over"]["total"];

    var data = google.visualization.arrayToDataTable([
        ['Age', 'Percentage of Population'],
        ['0-9',     (pop_0_4 + pop_5_9)/total_pop],
        ['10-19',     (pop_10_14 + pop_15_19)/total_pop],
        ['20-29',     (pop_20_24 + pop_25_29)/total_pop],
        ['30-39',     (pop_30_34 + pop_35_39)/total_pop],
        ['40-49',     (pop_40_44 + pop_45_49)/total_pop],
        ['50-59',     (pop_50_54 + pop_55_59)/total_pop],
        ['60-69',     (pop_60_64 + pop_65_69)/total_pop],
        ['70-79',     (pop_70_74 + pop_75_79)/total_pop],
        ['80+',       (pop_80_84 + pop_85_over)/total_pop]
    ]);

    drawChart(data, 'Population by Age Group', 'age-chart');
}

// format and display demographics by marital status
function formatMarriageData(json) {
    var total_pop = json["marital_status"]["Total population 15 years and over by marital status"]["total"];
    var married = json["marital_status"]["Married (and not separated)"]["total"];
    var common = json["marital_status"]["Living common-law"]["total"];
    var single = json["marital_status"]["Single (never legally married)"]["total"];
    var separated = json["marital_status"]["Separated"]["total"];
    var divorced = json["marital_status"]["Divorced"]["total"];
    var widowed = json["marital_status"]["Widowed"]["total"];

    var data = google.visualization.arrayToDataTable([
        ['Marital Status', 'Percentage of Population'],
        ['Married (and not separated)', married/total_pop],
        ['Living common-law', common/total_pop],
        ['Single (never legally married)', single/total_pop],
        ['Separated', separated/total_pop],
        ['Divorced', divorced/total_pop],
        ['Widowed', widowed/total_pop]
    ]);

    drawChart(data, 'Marital Status', 'marriage-chart');
}

// format and display demographics by language
function formatLanguageData(json) {
    // for the purposes of data display only single responses are shown
    var total_pop = json["language"]["Single responses"]["total"];
    var english = json["language"]["English"]["total"];
    var french = json["language"]["French"]["total"];
    var select_aboriginal = json["language"]["Selected Aboriginal languages"]["total"];
    var select_non_aboriginal = json["language"]["Selected non-Aboriginal languages"]["total"];

    var data = google.visualization.arrayToDataTable([
        ['Languages', 'Percentage of Population'],
        ['English', english/total_pop],
        ['French', french/total_pop],
        ['Select Aboriginal Languages', select_aboriginal/total_pop],
        ['Select Non-Aboriginal Languages', select_non_aboriginal/total_pop]
    ]);

    drawChart(data, 'Languages', 'language-chart');
}

// format and display demographics by dwelling type
function formatDwellingTypeData(json) {
    var total_pop = json["dwelling"]["Total number of occupied private dwellings by structural type of dwelling"]["total"];
    var house = json["dwelling"]["Single-detached house"]["total"];
    var apart_5gt = json["dwelling"]["Apartment, building that has five or more storeys"]["total"];
    var apart_5lt = json["dwelling"]["Apartment, building that has fewer than five storeys"]["total"];
    var movable = json["dwelling"]["Movable dwelling"]["total"];
    var other = json["dwelling"]["Other dwelling"]["total"];
    var semi_detached = json["dwelling"]["Semi-detached house"]["total"];
    var row_house = json["dwelling"]["Row house"]["total"];
    var duplex = json["dwelling"]["Apartment, duplex"]["total"];


    var data = google.visualization.arrayToDataTable([
        ['Private Dwelling Types', 'Percent of all Dwellings'],
        ['Single-detached House', house/total_pop],
        ['Apartment, 5 or more floors', apart_5gt/total_pop],
        ['Apartment, 4 or fewer floors', apart_5lt/total_pop],
        ['Apartment, duplex', duplex/total_pop],
        ['Mobile Homes', movable/total_pop],
        ['Semi-detached House', semi_detached/total_pop],
        ['Row House', row_house/total_pop],
        ['Other', other/total_pop]
    ]);

    drawChart(data, 'Dwelling Type', 'dwelling-type-chart');
}

// format and display demographics by dwelling size
function formatDwellingSizeData(json) {
    var total_pop = json["dwelling"]["Total number of private households by household size"]["total"];
    var one_ppl = json["dwelling"]["1 person"]["total"];
    var two_ppl = json["dwelling"]["2 persons"]["total"];
    var three_ppl = json["dwelling"]["3 persons"]["total"];
    var four_ppl = json["dwelling"]["4 persons"]["total"];
    var five_ppl = json["dwelling"]["5 persons"]["total"];
    var six_plus = json["dwelling"]["6 or more persons"]["total"];


    var data = google.visualization.arrayToDataTable([
        ['Private Dwelling Size', 'Percent of all Dwellings'],
        ['1 Person', one_ppl/total_pop],
        ['2 People', two_ppl/total_pop],
        ['3 People', three_ppl/total_pop],
        ['4 People', four_ppl/total_pop],
        ['5 People', five_ppl/total_pop],
        ['6 or More People', six_plus/total_pop]
    ]);

    drawChart(data, 'Dwelling Size', 'dwelling-size-chart');
}

// on click of the draw polygon button enable drawing
// make draw global so we can check to see if a draw is occurring for other interactions
var draw;
$('#polygon').on('click', function() {
    clearMap();
    draw = new ol.interaction.Draw({
        features: feature_overlay.getFeatures(),
        type: "Polygon"
    });
    map.addInteraction(draw);
    draw.on('drawend', function() {
        map.removeInteraction(draw);
        controlDoubleClickZoom(false);
        // Delay execution of activation of double click zoom function and setting draw to null
        setTimeout(function() {
            controlDoubleClickZoom(true);
            draw = null;
        }, 251);

    });

})

// clear all drawn elements from the map
function clearMap() {
    feature_overlay.setFeatures(new ol.Collection());
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

// draw the google chart
function drawChart(data, title, div_id) {
    var options = {
        titlePosition: 'none',
        chartArea: {width:'92%',height:'92%'},
        tooltip: {text: 'percentage'},
        pieSliceText: 'none'
    };

    if (document.getElementById(div_id)) {
        var chart = new google.visualization.PieChart(document.getElementById(div_id));
        chart.draw(data, options);
    }
}

// when user clicks on map find associated parcel
map.on('click', function (evt) {
    var url = local_wms_layer.getSource().getGetFeatureInfoUrl(
        evt.coordinate,
        view.getResolution(),
        view.getProjection(),
        {
            'INFO_FORMAT': 'application/json'
        }
    );

    if (url) {
        $.ajax({
            url: url,
            success: function(response) {
                $.when(getParcelId(response)).done(function(parcel_list){
                    // get the subdivision information for the parcels and display it in the SUMMARY tab
                    getSubDivId(parcel_list[0]);

                    // get the BCA data for the parcels and display it in the LIST tab
                    getParcelInfo(parcel_list);
                });

            },
            error: function(response) {
                console.log(response)
            }
        })
    }
});

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
        //data: {parcelList: parcel_list.toString()},
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
        html += '<tr><td class="strong">Assessed Value</td><td> $' + json["value"] + '</td></tr>';
    });

    html += '</table>';
    $("#list").append(html);
}

function displaySummary(csduid) {
    $.ajax({
        type: "GET",
        url: "../getsummaryinfo?type=csduid&csduid=" + csduid,
        success: function(result) {
            var summary_data = jQuery.parseJSON(result);
            var html = '<p class="small">The following summary data is provided by Statistics Canada and based on the census subdivision.'
                + 'for the given area. A census subdivision is an area that is a municipality or an area that is deemed'
                + 'to be equivalent to a municipality for statistical reporting purposes</p>';
            html += '<table class="table table-striped">';
            html += '<tr><td class="strong">Population</td><td class="text-right">' + summary_data["Population in 2011"] + '</td></tr>';
            html += '<tr><td class="strong">Median Age</td><td class="text-right">' + summary_data["Median age of the population"] + '</td></tr>';
            html += '<tr><td class="strong">Number of households</td><td class="text-right">' + summary_data["Total number of private households by household type"] + '</td></tr>';
            html += '<tr><td class="strong">Number of people per family</td><td class="text-right">' + summary_data["Average number of persons per census family"] + '</td></tr>';
            html += '<tr><td class="strong">Average number of children at home</td><td class="text-right">' + summary_data["Average number of children at home per census family"] + '</td></tr>';

            $('#summary').empty();
            console.log(summary_data);
            $('#summary').append(html);
        },
        error: function(result) {
            console.log("Error " + result.toString());
        }
    });
}

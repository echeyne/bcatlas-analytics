// when user clicks on map find associated parcel
map.on('click', function (evt) {
    var url = wms_layer.getSource().getGetFeatureInfoUrl(
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
                // retrieve the list of selected parcels
                var parcel_list = getParcelId(response);

                // get the subdivision information for the parcels and display it in the SUMMARY tab
                getSubDivInfo(parcel_list);

                // get the BCA data for the parcels and display it in the LIST tab
                getParcelInfo(parcel_list);

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

function displaySummary(subdiv_data) {
    $('#summary').empty();

    $('#summary').append(subdiv_data);
}
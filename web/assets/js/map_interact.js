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
            success: function() {
                var parcelList = getParcelId();
                getSubDivInfo(parcelList);
            },
            error: function(response) {
                console.log(response)
            }
        })
    }
});

function getParcelId() {
    var parser = new ol.format.GeoJSON();
    var result = parser.readFeatures(response);

    if (result.length) {
        var id_list = [];
        for (var i = 0, ii = result.length; i < ii; ++i) {
            // save the parcel id
            id_list.push(result[i].get('GISLkp'));
            console.log(result[i].get('GISLkp'))
        }
    }

    return id_list;
}

// retrieve the census info related to a given parcel id
// request sent to GetSubDivInfo.java

// right now parcel id list is hardcoded to only take in the first element
// on the post request
function getSubDivInfo(parcelId) {
    $.ajax({
        type: "GET",
        url: "../getsubdivinfo",
        data: {parcelId: parcelId[0]},
        success: function(result) {
            console.log(result);
        },
        error: function(result) {
            console.log('Error ' + result.toString());
        }
    });
}

/*
// send census subdivision lookup to GetCenSubDiv.java
function getCenSubDiv(response) {
    $('#list').empty();

    var parser = new ol.format.GeoJSON();
    var result = parser.readFeatures(response);

    if (result.length) {
        var id_list = [];
        for (var i = 0, ii = result.length; i < ii; ++i) {
            // save the parcel id
            id_list.push(result[i].get('GISLkp'));
            console.log(result[i].get('GISLkp'))
        }

        $.ajax({
            type: "POST",
            url: "../getcensubdiv",
            data: {parcellist: id_list.toString()},
            success: function(result) {
                jsonArr = $.parseJSON(result);
                getSubDivInfo(jsonArr["csduid"]);
            },
            error: function(result) {
                console.log('Error ' + result.toString());
            }
        });

    } else {
        $('#list').append('<p>No records found for the selected property.</p>')
    }

    // retrieve the info related to a census subdivision id
    // request sent to GetSubDivInfo.java
    function getSubDivInfo(csduid) {
        $.ajax({
            type: "POST",
            url: "../getsubdivinfo",
            data: {csduid: csduid},
            success: function(result) {
                console.log(result);
            },
            error: function(result) {
                console.log('Error ' + result.toString());
            }
        });
    }


}
*/

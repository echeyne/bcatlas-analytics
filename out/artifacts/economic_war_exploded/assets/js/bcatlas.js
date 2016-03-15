// bcatlas.js
// all of the basic js functions necessary to make the site work

// collapse or expand the sidebar
$('#collapse').on('click', function() {
    if ($(this).hasClass('open')) {
        $('.side-panel').css('display', 'none');
        $('.main-panel').css('width', '100%');
        $(this).removeClass('open');
        $(this).addClass('closed');
        $('#collapse img').attr("src", "assets/images/expand_arrow.png");
        $('#collapse img').attr("title", "Expand Side Panel");
    }
    else {
        $('.side-panel').css('display', 'block');
        $('.main-panel').css('width', '66.66666667%');
        $(this).removeClass('closed');
        $(this).addClass('open');
        $('#collapse img').attr("src", "assets/images/collapse_arrow.png");
        $('#collapse img').attr("title", "Collapse Side Panel");
    }
    map.updateSize();
});

// show or hide the legend
$('#layers-icon').on("click", function(e){
    e.stopPropagation();
    $( "#legend-content" ).slideToggle();
    if ($('#legend-content').hasClass('open')) {
        $("#legend-content").removeClass('open');
        $("#legend-content").addClass('closed');
    }
    else {
        $("#legend-content").removeClass('closed');
        $("#legend-content").addClass('open');
    }
});

// prevents the legend from closing when it is clicked on
$('#legend-content').on("click", function(e) {
    e.stopPropagation();
});

// automatically closes the legend when the user clicks off of it
$(document).click( function() {
    if ($('#legend-content').hasClass('open')) {
        $("#legend-content").slideToggle();
        $("#legend-content").removeClass('open');
        $("#legend-content").addClass('closed');
    }
});
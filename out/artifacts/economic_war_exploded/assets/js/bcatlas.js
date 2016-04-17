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

// automatically closes the legend, tools, and analysis dropdowns when the user clicks off
$(document).click( function() {
    if ($('#legend-content').hasClass('open')) {
        $("#legend-content").slideToggle();
        $("#legend-content").removeClass('open');
        $("#legend-content").addClass('closed');
    }
    if ($('#tools-content').hasClass('open')) {
        $("#tools-content").slideToggle();
        $("#tools-content").removeClass('open');
        $("#tools-content").addClass('closed');
    }
    if ($('#analysis-content').hasClass('open')) {
        $("#analysis-content").slideToggle();
        $("#analysis-content").removeClass('open');
        $("#analysis-content").addClass('closed');
    }
});

// show or hide the tools content
$('#tools-icon').on("click", function(e){
    e.stopPropagation();
    $( "#tools-content" ).slideToggle();
    if ($('#tools-content').hasClass('open')) {
        $("#tools-content").removeClass('open');
        $("#tools-content").addClass('closed');
    }
    else {
        $("#tools-content").removeClass('closed');
        $("#tools-content").addClass('open');
    }
});

// show or hide the analysis content
$('#analysis-icon').on("click", function(e){
    e.stopPropagation();
    $( "#analysis-content" ).slideToggle();
    if ($('#analysis-content').hasClass('open')) {
        $("#analysis-content").removeClass('open');
        $("#analysis-content").addClass('closed');
    }
    else {
        $("#analysis-content").removeClass('closed');
        $("#analysis-content").addClass('open');
    }
});

$('#analysis-content').on("click", function(e) {
    e.stopPropagation();
});

// clear the map and reset panel contents when user
// clicks the eraser icon
$('#eraser').on('click', function() {
    clearMap();

    $('#list').empty()
    $('#list').append('<p>Select a property on the map.</p>');

    $('#summary').empty()
    $('#summary').append('<p>Select a property on the map to view a summary of the property\'s surrounding population based on the 2011 Canadian Census.</p>');

    $('#demographics-census').empty()
    $('#demographics-census').append('<p>Select a property on the map to view the detailed demographics of the property\'s surrounding population based on the 2011 Canadian Census.</p>');

    $('#demographics-nhs').empty()
    $('#demographics-nhs').append('<p>Select a property on the map to view the detailed demographics of the property\'s surrounding population based on the 2011 Canadian National Household Survey.</p>');
});
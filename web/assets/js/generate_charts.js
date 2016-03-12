google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

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

// format and display demographics by education
function formatEducationData(json) {
    var total_pop = json["education"]["Total population aged 15 years and over by highest certificate, diploma or degree"]["total"];
    var none = json["education"]["No certificate, diploma or degree"]["total"];
    var high_school = json["education"]["High school diploma or equivalent"]["total"];
    var college = json["education"]["College, CEGEP or other non-university certificate or diploma"]["total"];
    var university_below = json["education"]["University certificate or diploma below bachelor level"]["total"];
    var university = json["education"]["University certificate, diploma or degree at bachelor level or above"]["total"];


    var data = google.visualization.arrayToDataTable([
        ['Education Level', 'Percent of Population'],
        ['No certificate, diploma or degree', none/total_pop],
        ['High school diploma or equivalent', high_school/total_pop],
        ['Apprenticeship or trades certificate or diploma', college/total_pop],
        ['College, CEGEP or other non-university certificate or diploma', university_below/total_pop],
        ['University certificate, diploma or degree at bachelor level or above', university/total_pop],
    ]);

    drawChart(data, 'Education', 'education-chart');
}

// format and display demographics by occupation
function formatOccupationData(json) {
    var total_pop = json["occupation"]["All occupations"]["total"];
    var management = json["occupation"]["0 Management occupations"]["total"];
    var business = json["occupation"]["1 Business, finance and administration occupations"]["total"];
    var science = json["occupation"]["2 Natural and applied sciences and related occupations"]["total"];
    var health = json["occupation"]["3 Health occupations"]["total"];
    var education = json["occupation"]["4 Occupations in education, law and social, community and government services"]["total"];
    var sport = json["occupation"]["5 Occupations in art, culture, recreation and sport"]["total"];
    var sales = json["occupation"]["6 Sales and service occupations"]["total"];
    var natural_resources = json["occupation"]["8 Natural resources, agriculture and related production occupations"]["total"];
    var manufacturing = json["occupation"]["9 Occupations in manufacturing and utilities"]["total"];

    var data = google.visualization.arrayToDataTable([
        ['Occupation Type', 'Percent of Employed Population'],
        ['Management', management/total_pop],
        ['Business, finance and administration', business/total_pop],
        ['Natural and applied sciences and related', science/total_pop],
        ['Health', health/total_pop],
        ['Education, law and social, community and government services', education/total_pop],
        ['Sales and Service', sport/total_pop],
        ['Trades, transport and equipment operators and related', sales/total_pop],
        ['Natural resources, agriculture and related production', natural_resources/total_pop],
        ['Manufacturing and utilities', manufacturing/total_pop],
    ]);

    drawChart(data, 'Occupation', 'occupation-chart');
}

// format and display demographics by income
function formatIncomeData(json) {
    var total_pop = json["income"]["Total income in 2010 of population aged 15 years and over"]["total"];
    var no_income = json["income"]["Without income"]["total"];
    var under_five = json["income"]["Under $5,000"]["total"];
    var five_ten = json["income"]["$5,000 to $9,999"]["total"];
    var ten_fifteen = json["income"]["$10,000 to $14,999"]["total"];
    var fifteen_twenty = json["income"]["$15,000 to $19,999"]["total"];
    var twenty_thirty = json["income"]["$20,000 to $29,999"]["total"];
    var thirty_forty = json["income"]["$30,000 to $39,999"]["total"];
    var forty_fifty = json["income"]["$40,000 to $49,999"]["total"];
    var fifty_sixty = json["income"]["$50,000 to $59,999"]["total"];
    var sixty_eighty = json["income"]["$60,000 to $79,999"]["total"];
    var eighty_one = json["income"]["$80,000 to $99,999"]["total"];
    var one_over = json["income"]["$100,000 and over"]["total"];

    var data = google.visualization.arrayToDataTable([
        ['Income', 'Percent of Population'],
        ['No Income', no_income/total_pop],
        ['Under $5,000', under_five/total_pop],
        ['$5,000 to $9,999', five_ten/total_pop],
        ['$10,000 to $14,999', ten_fifteen/total_pop],
        ['$15,000 to $19,999', fifteen_twenty/total_pop],
        ['$20,000 to $29,999', twenty_thirty/total_pop],
        ['$30,000 to $39,999', thirty_forty/total_pop],
        ['$40,000 to $49,999', forty_fifty/total_pop],
        ['$50,000 to $59,999', fifty_sixty/total_pop],
        ['$60,000 to $79,999', sixty_eighty/total_pop],
        ['$80,000 to $99,999', eighty_one/total_pop],
        ['$100,000 and over', one_over/total_pop]
    ]);

    drawChart(data, 'Income', 'income-chart');
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
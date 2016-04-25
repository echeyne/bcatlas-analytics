<h1>BCAtlas Analytics</h1>
BCAtlas Analytics is a web-mapping tool aimed to help small municipal governments make use of local, provincial, and federal datasets while making decisions.

<h3>Configuration</h3>
This project can be forked and then configured according to Apache Tomcat's web specification: https://tomcat.apache.org/tomcat-7.0-doc/appdev/deployment.html
Database connection information must be included in WEB-INF/class/config.properties.

<h3>File Specification</h3>
<h4>lib</h4>

Contains all Java jar files required for development

<h4>src/properties</h4>
<b>ConnectionProperties.java</b> - Handles connecting to the database for all Java servlets

<h4>src/request</h4>

<b>GetCenSubDiv.java</b> - Retrieves the census subdivision for a given parcel id

<b>GetDemoInfo.java</b> - Retrieves the demographic information of a surrounding census subdivision for a given parcel or census subdivision from either the 2011 Canadian Census or the 2011 National Household Survey

<b>GetParcelInfo.java</b> - Retrieves information related to a parcel from the municipal government's parcel data

<b>GetShapeIntersection.java</b> - Retrieves all parcels that fall within the coordinates of a given polygon, coordinates are in the NAD 83 UTM 11N CRS

<b>GetSummaryInfo.java</b> - Retrieves a summary of the surrounding census subdivision from the 2011 Canadian Census given a parcel or census subdivision

<h4>web/WEB-INF</h4>
<b>web.xml</b> - XML file describing the servlets and other components that make up the application

<h4>web/assets/css</h4>
<b>bcatlas.css</b> - custom styling for the web application

<h4>web/assets/images</h4>
All images used by the web applications

<h4>web/assets/js</h4>
<b>bcatlas.js</b> - all of the necessary JavaScript functions needed to load the site and perform non-map related interactions

<b>generate_charts.js</b> - creates the charts displayed in the demographics tabs

<b>map_interact.js</b> - handles all of the user's interactions with the map

<b>map_load.js</b> - initializes and loads the map

<b>proj4.js</b> - 3rd party Javascript library to transform coordinates from one coordinate system to another (http://proj4js.org/)




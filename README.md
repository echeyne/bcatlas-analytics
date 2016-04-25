<h1>BCAtlas Analytics</h1>
BCAtlas Analytics is a web-mapping tool aimed to help small municipal governments make use of local, provincial, and federal datasets while making decisions.

<h3>Configuration</h3>
This project can be forked and then configured according to Apache Tomcat's web specification: https://tomcat.apache.org/tomcat-7.0-doc/appdev/deployment.html
Database connection information must be included in WEB-INF/class/config.properties.

<h3>File Specification</h3>
<h4>lib</h4>

Contains all Java jar files required for development

<h4>src</h4>
<h5>properties</h5>
<b>ConnectionProperties.java</b> - Handles connecting to the database for all Java servlets

<h5>request</h5>

<b>GetCenSubDiv.java</b> - Retrieves the census subdivision for a given parcel id

<b>GetDemoInfo.java</b> - Retrieves the demographic information for a given parcel or census subdivision from either the 2011 Canadian Census or the 2011 National Household Survey

<b>GetParcelInfo.java</b> - Retrieves information related to a parcel from the municipal government's parcel data

<b>GetShapeIntersection.java</b> - Retrieves all parcels that fall within the coordinates of a given polygon, coordinates are in the NAD 83 UTM 11N CRS







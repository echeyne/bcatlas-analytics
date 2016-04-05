/*
* Get all of the parcels that fall within the polygon drawn on the map
*
 */

package request;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import javax.json.Json;
import javax.json.JsonObjectBuilder;

import properties.ConnectionProperties;

public class GetShapeIntersection extends HttpServlet {

    private ConnectionProperties properties;
    private Connection con;
    private String url, username, password;


    public GetShapeIntersection() throws IOException {
        properties = new ConnectionProperties();
        url = properties.getProperty("database.url") + properties.getProperty("database");
        username = properties.getProperty("database.user");
        password = properties.getProperty("database.password");
    }

    public void init(ServletConfig cfg) throws ServletException {
        super.init(cfg); // First time Servlet is invoked
        try {
            Class.forName("org.postgresql.Driver");
        } catch (java.lang.ClassNotFoundException e) {
            System.err.println("ClassNotFoundException: " +e);
        }

        try {
            con = DriverManager.getConnection(url, username, password);
        } catch (SQLException e) {
            throw new ServletException("SQLException: "+e);
        }

    }
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        retrieveParcels(request, response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        retrieveParcels(request, response);
    }

    public void retrieveParcels(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        String geom = request.getParameter("geom");
        geom = geom.replaceAll("_", " ");

        String sql = "SELECT gislkp, ST_X(ST_Centroid(geom)), ST_Y(ST_Centroid(geom)) FROM lumbyparcels AS p, "
            + "(SELECT ST_TRANSFORM(ST_Polygon(ST_GeomFromText('LINESTRING(" + geom + ")'), 3347),3347) as geometry) AS poly "
            + "WHERE ST_Intersects(p.geom, poly.geometry) = ?";

        PreparedStatement preparedStatement = null;
        ResultSet rs = null;
        JsonObjectBuilder builder = Json.createObjectBuilder();

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setBoolean(1, true);
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                builder.add(rs.getString("gislkp"),Json.createObjectBuilder()
                    .add("X", rs.getDouble("st_x"))
                    .add("Y", rs.getDouble("st_y"))
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        finally {

            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }

            if (rs != null) {
                try {
                    rs.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
        java.io.PrintWriter out = response.getWriter();
        out.println(builder.build().toString());
        out.close();
    }

    public void destroy() {
        try
        {
            if (con != null)
                con.close();
        }
        catch (SQLException e)
        {	System.err.println("SQLException: "+e); }
    }

}
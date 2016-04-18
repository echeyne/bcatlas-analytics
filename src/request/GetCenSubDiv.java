/*
* Retrieve the census subdivision id (csduid) given of a given parcel
* csduid is returned in JSON format
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

public class GetCenSubDiv extends HttpServlet {

    private ConnectionProperties properties;
    private Connection con;
    private String url, username, password;

    public GetCenSubDiv() throws IOException {
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
        retrieveCSDUID(request, response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        retrieveCSDUID(request, response);
    }

    public void retrieveCSDUID(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        String parcelId = request.getParameter("parcelId");
        String sql = "SELECT DISTINCT csduid FROM ParcelMappings WHERE jur_roll = ANY (?)";
        String[] parcelArr = parcelId.split(",");

        PreparedStatement preparedStatement = null;
        ResultSet rs = null;
        JsonObjectBuilder builder = Json.createObjectBuilder();

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setString(1, parcelId.trim());
            preparedStatement.setArray(1, con.createArrayOf("bigint", parcelArr));
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                int csduid = rs.getInt("csduid");
                if (!rs.wasNull()) {
                    builder.add("csduid", csduid);
                }
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
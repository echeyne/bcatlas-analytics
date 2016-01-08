/*
* Retrieve the properties of a census subdivision given a census subdivision id (csduid)
* results are returned in JSON format
 */

package request;

import properties.ConnectionProperties;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import javax.json.Json;
import javax.json.JsonObjectBuilder;


public class GetSubDivInfo extends HttpServlet {

    private ConnectionProperties properties;
    private Connection con;
    private String url, username, password;


    public GetSubDivInfo() throws IOException {
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
        long csduid = retrieveCSDUID(request);
        retrieveSubDivInfo(csduid, response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        long csduid = retrieveCSDUID(request);
        retrieveSubDivInfo(csduid, response);
    }

    public int retrieveCSDUID(HttpServletRequest request) throws ServletException, java.io.IOException {
        String parcelId = request.getParameter("parcelId");
        int csduid = -1;
        String sql = "SELECT csduid FROM Parcel WHERE jur_roll = ?";
        PreparedStatement preparedStatement = null;
        ResultSet rs = null;

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setLong(1, Long.parseLong(parcelId.trim()));
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                csduid = rs.getInt("csduid");
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
        return csduid;
    }

    public void retrieveSubDivInfo(Long csduid, HttpServletResponse response) throws ServletException, java.io.IOException {
        String sql = "SELECT topic, characteristic, note, total, male, female FROM CensusSubdivision WHERE csduid = ?";
        PreparedStatement preparedStatement = null;
        ResultSet rs = null;
        JsonObjectBuilder builder = Json.createObjectBuilder();

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setLong(1, csduid);
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                builder.add(
                        String.valueOf(rs.getRow()), Json.createObjectBuilder()
                                .add("topic", ((rs.getString("topic") == null) ? "" : rs.getString("topic")))
                                .add("characteristic", ((rs.getString("characteristic") == null) ? "" : rs.getString("characteristic").trim()))
                                .add("note", ((rs.getString("note") == null) ? "" : rs.getString("note")))
                                .add("total", ((rs.getObject("total").toString() == null) ? "" : rs.getObject("total").toString()))
                                .add("male", ((rs.getObject("male") == null) ? "" : rs.getObject("male").toString()))
                                .add("female", ((rs.getObject("female") == null) ? "" : rs.getObject("female").toString()))
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

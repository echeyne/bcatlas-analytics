/*
* Creates a summary of information to be displayed in the summary tab given either a subdivision id (csduid) or
* a dissemination area id (dauid)
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


public class GetSummaryInfo extends HttpServlet {

    private ConnectionProperties properties;
    private Connection con;
    private String url, username, password;


    public GetSummaryInfo() throws IOException {
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
        String requestType = request.getParameter("type");
        if (requestType.equals("csduid")) {
            int csduid = Integer.parseInt(request.getParameter("csduid"));
            buildSummaryCSDUID(csduid, response);
        }
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        String requestType = request.getParameter("idType");
        if (requestType.equals("csduid")) {
            int csduid = Integer.parseInt(request.getParameter("csduid"));
            buildSummaryCSDUID(csduid, response);
        }
    }

    public void buildSummaryCSDUID(int csduid, HttpServletResponse response) throws ServletException, java.io.IOException {
        String sql = "SELECT total, characteristic FROM CensusSubdivision WHERE csduid = ? AND (characteristic = ? OR characteristic = ?"
                + "OR characteristic = ? OR characteristic = ? OR characteristic = ?)";
        PreparedStatement preparedStatement = null;
        ResultSet rs = null;
        JsonObjectBuilder builder = Json.createObjectBuilder();

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setLong(1, csduid);
            preparedStatement.setString(2, "Population in 2011");
            preparedStatement.setString(3, "Median age of the population");
            preparedStatement.setString(4, "Average number of persons per census family");
            preparedStatement.setString(5, "Total number of private households by household type");
            preparedStatement.setString(6, "Average number of children at home per census family");
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                String title = rs.getString("characteristic").replaceAll("[^\\x00-\\x7F]", "").trim();
                builder.add(title ,((rs.getObject("total").toString() == null) ? "" : rs.getObject("total").toString()));
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
        try {
            if (con != null)
                con.close();
        }
        catch (SQLException e) {
            System.err.println("SQLException: "+e);
        }
    }

}

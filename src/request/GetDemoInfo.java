/*
* Creates a detailed overview of information to be displayed in the demographics tab given either a subdivision id (csduid) or
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


public class GetDemoInfo extends HttpServlet {

    private ConnectionProperties properties;
    private Connection con;
    private String url, username, password;


    public GetDemoInfo() throws IOException {
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
            buildDemoCSDUID(csduid, response);
        }
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        String requestType = request.getParameter("idType");
        if (requestType.equals("csduid")) {
            int csduid = Integer.parseInt(request.getParameter("csduid"));
            buildDemoCSDUID(csduid, response);
        }
    }

    public void buildDemoCSDUID(int csduid, HttpServletResponse response) throws ServletException, java.io.IOException {
        JsonObjectBuilder builder = Json.createObjectBuilder();

        // create individual json objects for each topic we are interested in
        JsonObjectBuilder age = doDemoQuery(csduid, "Age characteristics");
        JsonObjectBuilder maritalStatus = doDemoQuery(csduid, "Marital status");
        JsonObjectBuilder language = doDemoQuery(csduid, "Detailed language spoken most often at home");
        JsonObjectBuilder dwelling = doDemoQuery(csduid, "Household and dwelling characteristics");

        // add all of the obtained json to the builder
        builder.add("age", age);
        builder.add("marital_status", maritalStatus);
        builder.add("language", language);
        builder.add("dwelling", dwelling);

        java.io.PrintWriter out = response.getWriter();
        out.println(builder.build().toString());
        out.close();
    }

    public JsonObjectBuilder doDemoQuery(int csduid, String topic) {

        String sql = "SELECT characteristic, total, male, female FROM CensusSubdivision WHERE csduid = ? AND topic = ?";
        PreparedStatement preparedStatement = null;
        ResultSet rs = null;
        JsonObjectBuilder builder = Json.createObjectBuilder();

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setLong(1, csduid);
            preparedStatement.setString(2, topic);
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                builder.add((rs.getString("characteristic")).replaceAll("\\p{C}", "?").trim(), Json.createObjectBuilder()
                                .add("total", rs.getInt("total"))
                                .add("male", rs.getInt("male"))
                                .add("female", rs.getInt("female"))
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

        return builder;
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

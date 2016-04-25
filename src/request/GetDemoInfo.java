/*
* Creates a detailed overview of information to be displayed in the demographics tab given either a subdivision id (csduid) or
* parcel id (pid)
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
        String requestType = request.getParameter("type").toLowerCase();
        String dataSource = request.getParameter("source").toLowerCase();
        if (requestType.equals("csduid")) {
            int csduid = Integer.parseInt(request.getParameter("csduid"));
            if (dataSource.equals("census")) {
                buildDemoCSDUIDCensus(csduid, response);
            }
            else if (dataSource.equals("nhs")) {
                buildDemoCSDUIDNHS(csduid, response);
            }
        }
        else if (requestType.equals("pid")) {
            long pid = Long.parseLong(request.getParameter("pid"));
            int csduid = getCSDUID(pid);
            if (dataSource.equals("census")) {
                buildDemoCSDUIDCensus(csduid, response);
            }
            else if (dataSource.equals("nhs")) {
                buildDemoCSDUIDNHS(csduid, response);
            }
        }
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        String requestType = request.getParameter("type").toLowerCase();
        String dataSource = request.getParameter("source").toLowerCase();
        if (requestType.equals("csduid")) {
            int csduid = Integer.parseInt(request.getParameter("csduid"));
            if (dataSource.equals("census")) {
                buildDemoCSDUIDCensus(csduid, response);
            }
            else if (dataSource.equals("nhs")) {
                buildDemoCSDUIDNHS(csduid, response);
            }
        }
        else if (requestType.equals("pid")) {
            int pid = Integer.parseInt(request.getParameter("pid"));
            int csduid = getCSDUID(pid);
            if (dataSource.equals("census")) {
                buildDemoCSDUIDCensus(csduid, response);
            }
            else if (dataSource.equals("nhs")) {
                buildDemoCSDUIDNHS(csduid, response);
            }
        }
    }

    // get the csduid if user sent in pid
    public int getCSDUID(long pid) {
        String sql = "SELECT csduid FROM ParcelMappings WHERE jur_roll = ?";
        PreparedStatement preparedStatement = null;
        ResultSet rs = null;
        int csduid = -1;

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setLong(1, pid);
            rs = preparedStatement.executeQuery();
            if (rs.next()) {
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

    public void buildDemoCSDUIDCensus(int csduid, HttpServletResponse response) throws ServletException, java.io.IOException {
        JsonObjectBuilder builder = Json.createObjectBuilder();

        // create individual json objects for each topic we are interested in
        JsonObjectBuilder age = doDemoQueryCensus(csduid, "Age characteristics");
        JsonObjectBuilder maritalStatus = doDemoQueryCensus(csduid, "Marital status");
        JsonObjectBuilder language = doDemoQueryCensus(csduid, "Detailed language spoken most often at home");
        JsonObjectBuilder dwelling = doDemoQueryCensus(csduid, "Household and dwelling characteristics");

        // add all of the obtained json to the builder
        builder.add("age", age);
        builder.add("marital_status", maritalStatus);
        builder.add("language", language);
        builder.add("dwelling", dwelling);

        java.io.PrintWriter out = response.getWriter();
        out.println(builder.build().toString());
        out.close();
    }

    public JsonObjectBuilder doDemoQueryCensus(int csduid, String topic) {

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
                String title = rs.getString("characteristic").replaceAll("[^\\x00-\\x7F]", "").trim();
                builder.add(title, Json.createObjectBuilder()
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

    public void buildDemoCSDUIDNHS(int csduid, HttpServletResponse response) throws ServletException, java.io.IOException {
        // NHS data for Lumby (csduid == 5937005) is unavailable so for purposes of this demo we follow the government of
        // Canada's suggestion and use the data for Coldstream (csduiid == 5937010)
        if (csduid == 5937005) {
            csduid = 5937010;
        }

        JsonObjectBuilder builder = Json.createObjectBuilder();

        // create individual json objects for each topic we are interested in
        JsonObjectBuilder education = doDemoQueryNHS(csduid, "Education");
        JsonObjectBuilder occupation = doDemoQueryNHS(csduid, "Occupation");
        JsonObjectBuilder income = doDemoQueryNHS(csduid, "Income of individuals in 2010");
        JsonObjectBuilder household = doDemoQueryNHS(csduid, "Household characteristics");

        // add all of the obtained json to the builder
        builder.add("education", education);
        builder.add("occupation", occupation);
        builder.add("income", income);
        builder.add("household", household);

        java.io.PrintWriter out = response.getWriter();
        out.println(builder.build().toString());
        out.close();
    }

    public JsonObjectBuilder doDemoQueryNHS(int csduid, String topic) {

        String sql = "SELECT characteristic, total, male, female FROM bcNHS WHERE csduid = ? AND topic = ?";
        PreparedStatement preparedStatement = null;
        ResultSet rs = null;
        JsonObjectBuilder builder = Json.createObjectBuilder();

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setLong(1, csduid);
            preparedStatement.setString(2, topic);
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                String title = rs.getString("characteristic").replaceAll("[^\\x00-\\x7F]", "").trim();
                builder.add(title, Json.createObjectBuilder()
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

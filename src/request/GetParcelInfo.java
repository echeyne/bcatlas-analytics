package request;

import properties.ConnectionProperties;

import javax.json.Json;
import javax.json.JsonObjectBuilder;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;

/**
 * Created by EmilyMillard on 16-01-08.
 */
public class GetParcelInfo extends HttpServlet {

    private ConnectionProperties properties;
    private Connection con;
    private String url, username, password;


    public GetParcelInfo() throws IOException {
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
        retrieveParcelInfo(request, response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        retrieveParcelInfo(request, response);
    }

    public void retrieveParcelInfo(HttpServletRequest request, HttpServletResponse response) throws ServletException, java.io.IOException {
        String parcelList = request.getParameter("parcelList");
        String[] parcelArr = parcelList.split(",");
        String sql = "SELECT jur_roll, civic_addr, land_size, lot_dim, total_asses FROM Parcel WHERE jur_roll = ANY (?)";
        JsonObjectBuilder builder = Json.createObjectBuilder();
        PreparedStatement preparedStatement = null;
        ResultSet rs = null;

        try {
            preparedStatement = con.prepareStatement(sql);
            preparedStatement.setArray(1, con.createArrayOf("bigint", parcelArr));
            rs = preparedStatement.executeQuery();
            while (rs.next()) {
                builder.add(
                        String.valueOf(rs.getLong("jur_roll")), Json.createObjectBuilder()
                            .add("address", ((rs.getString("civic_addr") == null) ? "" : rs.getString("civic_addr").trim()))
                            .add("lot_size", ((rs.getString("land_size") == null) ? "" : rs.getString("land_size").trim()))
                            .add("lot_dim", ((rs.getString("lot_dim") == null) ? "" : rs.getString("lot_dim").trim()))
                            .add("value", ((rs.getString("total_asses") == null) ? "" : rs.getString("total_asses").trim()))
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

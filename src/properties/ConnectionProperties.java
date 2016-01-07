package properties;

import java.io.IOException;
import java.util.Properties;

public class ConnectionProperties extends Properties {

    public ConnectionProperties() throws IOException {
        this.load(Thread.currentThread().getContextClassLoader().getResourceAsStream("config.properties"));
    }

}

const http = require("http");
const queryString = require("querystring");

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    res.statusCode = 205;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello Stranger! Welcome to my page.");
  }
  if (req.url === "/form" && req.method === "GET") {
    res.end(`
        <!DOCTYPE html>
        <html>
          <body>
            <form method="POST" enctype="multipart/form-data">
              <label for="username">Username:</label>
              <input type="text" name="username" id="username">
              <br>
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);
  }
  if (req.url === "/form" && req.method === "POST") {
    let body = "";
    req.on("data", (data) => {
      console.log(data, 'THE DATAAAA');
      body += data.toString();
      console.log(body, 'BODY NOWWW')
    });
    req.on("end", () => {
      const formData = queryString.parse(body, '\r\n','=');
      console.log(formData, 'FORM DATAAA')
      res.end('Received form Data.');
    });
  }
});

server.listen(3000, () => {
  console.log('Http server started.');
});

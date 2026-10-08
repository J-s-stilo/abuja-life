const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    name: "ABUJA LIFE",
    status: "online",
    message: "Welcome to ABUJA LIFE!",
    virtualCurrency: "NGN",
    startingBalance: 1000000
  }));
});

server.listen(PORT, () => {
  console.log(`ABUJA LIFE server running on port ${PORT}`);
});

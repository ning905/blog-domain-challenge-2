// require(".env").config();
const app = require("./server.js");

const port = 4040;

app.listen(port, () => {
  console.log(`\n Server is running on http://localhost:${port}\n`);
});

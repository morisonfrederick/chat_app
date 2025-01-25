const fs = require("fs-extra");
const path = require("path");

const src = path.resolve("src/public/uploads");
const dest = path.resolve("dist/public/uploads");
console.log("src", src);
console.log("dest", dest);

fs.copy(src, dest, (err) => {
  if (err) {
    console.log("error copying uploads");
    console.log(err?.message);

    process.exit(1);
  }
  console.log("uploads copied successfully");
});

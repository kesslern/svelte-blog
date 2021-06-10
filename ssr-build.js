import fs from "fs";
import path from "path";
import App from './build/App.js';
import Index from './build/Index.js';

const app = App.render({});

const index = Index.render(app);

fs.mkdir("public", function(err, result) {
  if (err && err.code != "EEXIST") console.log('error', err);
})
fs.writeFileSync("public/index.html", index.html, function(err, result) {
  if (err) console.log('error', err);
})


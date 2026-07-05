const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
    path.join(__dirname,"studio.db"),
    err=>{
        if(err){
            console.log(err);
        }else{
            console.log("✅ SQLite Connected");
        }
    }
);

module.exports=db;
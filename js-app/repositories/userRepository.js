const fs = require("fs");
const path = require("path");

// path file json
const DBpath = path.join(__dirname, "../db.json");

// baca isi file db.json 
function readDB(){
    const data = fs.readFileSync(DBpath, "utf-8");
    return JSON.parse(data);
}

// tulis isi file db.json
function writeDB(data){
    fs.writeFileSync(DBpath, JSON.stringify(data, null, 2), "utf-8");
}

const userRepository = {
    getAll: () => {
        const db = readDB()
        return db.users
    },

    findByUsername: (username) => {
        const db = readDB();
        return db.users.find((u) => u.username === username)
    },

    add: (userData) => {
        const db = readDB()
        db.users.push(userData)
        writeDB(db)
        return userData
    },

    update: (username, updatedData) => {
        const db = readDB()
        const user = db.users.find((u) => u.username === username)
        if (!user) return null;

        Object.assign(user, updatedData)
        writeDB(db)
        return user;
    },

    delete: (username) => {
        const db = readDB()
        const index = db.users.findIndex((u) => u.username === username)
        if (!index === -1) return null;

        const deleted = db.users[index]
        db.users.splice(index, 1) 
        writeDB(db)
        return deleted;
    },
};

module.exports = userRepository;



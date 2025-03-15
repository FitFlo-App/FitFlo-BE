const { IRIS } = require("intersystems-iris");

let db;

const connect = async () => {
    try {
        db = new IRIS(
            process.env.IRIS_HOSTNAME, 
            process.env.IRIS_PORT,
            process.env.IRIS_NAMESPACE,
            process.env.IRIS_USERNAME,
            process.env.IRIS_PASSWORD
        );
        let res = await db.sql(`select 1 one, 2 two;`);
        console.log("Successfully connected to IRIS Intersystems DB");
        return true;
    } catch(err) {
        console.error(err);
        console.log("Failed to connect to IRIS Intersystems DB");
        return false;
    }
}

const disconnect = async () => {
    try {
        if (db) {
            await db.close();
            console.log("IRIS Intersystems DB successfully disconnected");
            return true;
        } else {
            console.log("IRIS Intersystems DB is not initialized yet");
            return false;
        }
    } catch(err) {
        console.error(err);
        console.log("Failed to disconnect from IRIS Intersystems DB");
        return false;
    }
}

const createTable = async () => {
    try {
        if (!db) {
            db = new IRIS(
                process.env.IRIS_HOSTNAME, 
                process.env.IRIS_PORT,
                process.env.IRIS_NAMESPACE,
                process.env.IRIS_USERNAME,
                process.env.IRIS_PASSWORD
            );
        }
        let response = await db.sql(`CREATE TABLE ${process.env.IRIS_TABLENAME} ${process.env.IRIS_TABLEDEFINITION};`);
        console.log("Successfully create table on IRIS Intersystems DB");
        return true;
    } catch(err) {
        console.error(err);
        console.log("Failed to create table on IRIS Intersystems DB: " + err.message);
        return false;
    }
}

const loadTable = async () => {
    try {
        if (!db) {
            db = new IRIS(
                process.env.IRIS_HOSTNAME, 
                process.env.IRIS_PORT,
                process.env.IRIS_NAMESPACE,
                process.env.IRIS_USERNAME,
                process.env.IRIS_PASSWORD
            );
        }
        let response = await db.sql(`CREATE TABLE ${process.env.IRIS_TABLENAME} ${process.env.IRIS_TABLEDEFINITION};`);
        console.log("Successfully load data to IRIS Intersystems DB");
        return true;
    } catch(err) {
        console.error(err);
        console.log("Failed to load data to IRIS Intersystems DB: " + err.message);
        return false;
    }
}

const readTable = async () => {
    try {
        if (!db) {
            db = new IRIS(
                process.env.IRIS_HOSTNAME, 
                process.env.IRIS_PORT,
                process.env.IRIS_NAMESPACE,
                process.env.IRIS_USERNAME,
                process.env.IRIS_PASSWORD
            );
        }
        let response = await db.sql(`SELECT * FROM ${process.env.IRIS_TABLENAME};`);
        console.log("Successfully read data from IRIS Intersystems DB");
        return true;
    } catch(err) {
        console.error(err);
        console.log("Failed to read data from IRIS Intersystems DB: " + err.message);
        return false;
    }
}

const search = async (vectorQuery, numberOfResults) => {
    try {
        if (!db) {
            db = new IRIS(
                process.env.IRIS_HOSTNAME, 
                process.env.IRIS_PORT,
                process.env.IRIS_NAMESPACE,
                process.env.IRIS_USERNAME,
                process.env.IRIS_PASSWORD
            );
        }
        sql = `SELECT TOP ? disease FROM ${process.env.IRIS_TABLENAME} ORDER BY VECTOR_DOT_PRODUCT(symptom_vector, TO_VECTOR(?)) DESC`;
        let response = await db.sql(query, [numberOfResults, vectorQuery]);
        return {
            status: true,
            data: response.rows
        };
    } catch(err) {
        console.error(err);
        console.log("Failed to query vector search on IRIS Intersystems DB: " + err.message);
        return {
            status: false,
            data: []
        };
    }
}

module.exports = {
    connect,
    disconnect,
    createTable,
    loadTable,
    readTable,
    search
}
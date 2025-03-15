const { IRIS } = require("intersystems-iris");
const fs = require('fs');
const path = require('path');
const transformers = require('../../../utils/nlp/xenova/transformers');
const tokenizer = require('../../../utils/nlp/natural/tokenizer');

let db;

const connect = () => {
    return new Promise(async (resolve, reject) => {
        try {
            db = new IRIS(
                process.env.IRIS_HOSTNAME, 
                parseInt(process.env.IRIS_PORT),
                process.env.IRIS_NAMESPACE,
                process.env.IRIS_USERNAME,
                process.env.IRIS_PASSWORD
            );
            let res = await db.sql(`select 1 one, 2 two;`);
            console.log("Successfully connected to IRIS Intersystems DB");
            resolve(true);
        } catch(err) {
            console.error(err);
            console.log("Failed to connect to IRIS Intersystems DB");
            reject(false);
        }
    });
}

const disconnect = () => {
    return new Promise(async (resolve, reject) => {
        try {
            if (db) {
                await db.close();
                console.log("IRIS Intersystems DB successfully disconnected");
                resolve(true);
            } else {
                console.log("IRIS Intersystems DB is not initialized yet");
                reject(false);
            }
        } catch(err) {
            console.error(err);
            console.log("Failed to disconnect from IRIS Intersystems DB");
            reject(false);
        }
    });
}

const createTable = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                db = new IRIS(
                    process.env.IRIS_HOSTNAME, 
                    parseInt(process.env.IRIS_PORT),
                    process.env.IRIS_NAMESPACE,
                    process.env.IRIS_USERNAME,
                    process.env.IRIS_PASSWORD
                );
            }
            let response = await db.sql(`CREATE TABLE ${process.env.IRIS_TABLENAME} ${process.env.IRIS_TABLEDEFINITION};`);
            console.log("Successfully create table on IRIS Intersystems DB");
            resolve(true);
        } catch(err) {
            console.error(err);
            console.log("Failed to create table on IRIS Intersystems DB: " + err.message);
            reject(false);
        }
    });
}

const loadTable = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');

            const rows = data.split('\n').slice(1).map(row => {
                let parts = row.split(",");
                let symptom = parts.slice(0, -1).join(",").replace(/"/g, '');
                let disease = parts.slice(-1)[0];
                return { symptom, disease };
            });

            const irisInput = await Promise.all(rows.map(async row => {
                const symptomvector = await transformers.generateEmbedding(tokenizer(row.symptom).join(" "));
                return [row.symptom, Array.from(symptomvector), row.disease];
            }));

            if (!db) {
                db = new IRIS(
                    process.env.IRIS_HOSTNAME, 
                    parseInt(process.env.IRIS_PORT),
                    process.env.IRIS_NAMESPACE,
                    process.env.IRIS_USERNAME,
                    process.env.IRIS_PASSWORD
                );
            }

            console.log("Loading data.csv to IRIS Intersystems DB . . .");
            for (let row of irisInput) {
                await db.sql(`INSERT INTO ${process.env.IRIS_TABLENAME} (symptom, symptom_vector, disease) VALUES ('${row[0]}', TO_VECTOR('${JSON.stringify(row[1])}'), '${row[2]}');`);
            }
            console.log("Successfully load data to IRIS Intersystems DB");
            resolve(true);;
        } catch(err) {
            console.error(err);
            console.log("Failed to load data to IRIS Intersystems DB: " + err.message);
            reject(false);
        }
    });
}

const readTable = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                db = new IRIS(
                    process.env.IRIS_HOSTNAME, 
                    parseInt(process.env.IRIS_PORT),
                    process.env.IRIS_NAMESPACE,
                    process.env.IRIS_USERNAME,
                    process.env.IRIS_PASSWORD
                );
            }
            let response = await db.sql(`SELECT * FROM ${process.env.IRIS_TABLENAME};`);
            console.log("Successfully read data from IRIS Intersystems DB");
            resolve(true);;
        } catch(err) {
            console.error(err);
            console.log("Failed to read data from IRIS Intersystems DB: " + err.message);
            reject(false);
        }
    });
}

const search = async (vectorQuery, numberOfResults) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db) {
                db = new IRIS(
                    process.env.IRIS_HOSTNAME, 
                    parseInt(process.env.IRIS_PORT),
                    process.env.IRIS_NAMESPACE,
                    process.env.IRIS_USERNAME,
                    process.env.IRIS_PASSWORD
                );
            }
            let response = await db.sql(`SELECT TOP ${numberOfResults} * FROM ${process.env.IRIS_TABLENAME} ORDER BY VECTOR_DOT_PRODUCT(symptom_vector, TO_VECTOR('${JSON.stringify(vectorQuery)}')) DESC;`);
            resolve(response.rows);
        } catch(err) {
            console.error(err);
            console.log("Failed to query vector search on IRIS Intersystems DB: " + err.message);
            resolve([]);
        }
    });
}

module.exports = {
    connect,
    disconnect,
    createTable,
    loadTable,
    readTable,
    search
}
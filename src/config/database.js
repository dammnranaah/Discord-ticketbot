const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
    constructor() {
        this.dbType = process.env.DB_TYPE || 'sqlite';
        this.connection = null;
        this.Ticket = null;
    }

    async connect() {
        try {
            if (this.dbType === 'sqlite') {
                const dataDir = path.join(process.cwd(), 'data');
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true });
                }
            }

            switch (this.dbType.toLowerCase()) {
                case 'mongodb':
                    await this.connectMongoDB();
                    break;
                case 'mysql':
                    await this.connectMySQL();
                    break;
                case 'sqlite':
                    await this.connectSQLite();
                    break;
                default:
                    throw new Error('Unsupported database type');
            }
            console.log(`Connected to ${this.dbType} database`);
        } catch (error) {
            console.error('Database connection error:', error);
            throw error;
        }
    }

    async connectMongoDB() {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is required for MongoDB connection');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        this.connection = mongoose;
        const MongoTicket = require('../models/mongodb/Ticket');
        this.Ticket = MongoTicket;
    }

    async connectMySQL() {
        if (!process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) {
            throw new Error('MySQL configuration is incomplete');
        }
        this.connection = new Sequelize(
            process.env.MYSQL_DATABASE,
            process.env.MYSQL_USER,
            process.env.MYSQL_PASSWORD,
            {
                host: process.env.MYSQL_HOST || 'localhost',
                dialect: 'mysql',
                logging: false,
            }
        );
        await this.connection.authenticate();
        const SQLTicket = require('../models/sql/Ticket');
        this.Ticket = SQLTicket(this.connection);
        await this.connection.sync();
    }

    async connectSQLite() {
        const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'database.sqlite');
        this.connection = new Sequelize({
            dialect: 'sqlite',
            storage: dbPath,
            logging: false
        });
        await this.connection.authenticate();
        const SQLTicket = require('../models/sql/Ticket');
        this.Ticket = SQLTicket(this.connection);
        await this.connection.sync();
    }

    getTicketModel() {
        if (!this.Ticket) {
            throw new Error('Database not connected');
        }
        return this.Ticket;
    }

    async disconnect() {
        if (this.dbType === 'mongodb' && mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        } else if (this.connection) {
            await this.connection.close();
        }
    }
}

module.exports = new DatabaseManager(); 
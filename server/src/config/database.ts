import mongoose from 'mongoose';
import { config } from './environment';
import { Logger } from '../utils/logger.util';

export class MongoDatabase {
    private static instance: MongoDatabase;
    private isConnected = false;
    private listenersAttached = false;
    private onError: ((err: Error) => void) | null = null;
    private onDisconnected: (() => void) | null = null;

    private constructor() { }

    static getInstance(): MongoDatabase {
        if (!MongoDatabase.instance) {
            MongoDatabase.instance = new MongoDatabase();
        }
        return MongoDatabase.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        mongoose.set('strictQuery', false);

        // Connection pool: the previous cap of 10 meant only 10 DB operations
        // could be in flight at once, so under load every extra request queued and
        // eventually timed out. Size it to the concurrency we actually serve
        // (override with DB_POOL_SIZE; 100 is safe for a shared Atlas tier).
        const maxPoolSize = Math.max(10, parseInt(process.env.DB_POOL_SIZE || "100", 10) || 100);
        await mongoose.connect(config.mongodb.uri, {
            maxPoolSize,
            minPoolSize: 5,
            connectTimeoutMS: 60000,
            socketTimeoutMS: 45000,
        });
        Logger.info(`MongoDB pool maxPoolSize=${maxPoolSize}`);

        this.isConnected = true;
        Logger.info('MongoDB connected successfully');
        this.setupEventHandlers();
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            this.removeEventHandlers();
            await mongoose.disconnect();
            this.isConnected = false;
            Logger.info('MongoDB disconnected');
        }
    }

    private setupEventHandlers(): void {
        if (this.listenersAttached) return;

        this.onError = (err: Error) => {
            Logger.error('MongoDB connection error', err);
        };
        this.onDisconnected = () => {
            Logger.warn('MongoDB disconnected');
            this.isConnected = false;
        };

        mongoose.connection.on('error', this.onError);
        mongoose.connection.on('disconnected', this.onDisconnected);
        this.listenersAttached = true;
    }

    private removeEventHandlers(): void {
        if (this.onError) mongoose.connection.removeListener('error', this.onError);
        if (this.onDisconnected) mongoose.connection.removeListener('disconnected', this.onDisconnected);
        this.onError = null;
        this.onDisconnected = null;
        this.listenersAttached = false;
    }
}

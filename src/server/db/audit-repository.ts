import { Db } from 'mongodb';
import { clientPromise } from './mongodb-client';
import { config } from '../../config/config';
import { AuditReport } from '../../../types';
import { logger } from '../logger/structured-logger';
import { ApiError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

export class AuditRepository {
  private static readonly COLLECTION_NAME = 'audits';

  private static indexesInitialized = false;

  private static async getDb(): Promise<Db> {
    try {
      const client = await clientPromise;
      const db = client.db(config.db.name);

      if (!this.indexesInitialized && process.env.NODE_ENV !== 'test') {
        this.indexesInitialized = true;
        this.initializeIndexes().catch((err) => {
          logger.error('Failed async database index initializations', err);
        });
      }

      return db;
    } catch (error) {
      logger.error('Failed to establish database connection in repository layer', error);
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Database connection failed. Please ensure MongoDB is running.',
        500,
        error
      );
    }
  }

  /**
   * Initializes database collections and index mappings for performance and integrity.
   */
  public static async initializeIndexes(): Promise<void> {
    try {
      const db = await this.getDb();
      const col = db.collection(this.COLLECTION_NAME);

      logger.info('Initializing MongoDB collection indices...');

      // 1. Unique index on audit ID
      await col.createIndex({ id: 1 }, { unique: true, name: 'ux_audits_id' });

      // 2. Index on storeUrl for searching/history list
      await col.createIndex({ storeUrl: 1 }, { name: 'ix_audits_store_url' });

      // 3. Index on analyzedAt for chronological sorting
      await col.createIndex({ analyzedAt: -1 }, { name: 'ix_audits_analyzed_at' });

      logger.info('MongoDB collection indices initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database indices', error);
    }
  }

  /**
   * Persists an AuditReport document to MongoDB.
   *
   * @param report Domain AuditReport object.
   */
  public static async save(report: AuditReport): Promise<void> {
    try {
      const db = await this.getDb();
      const col = db.collection<AuditReport>(this.COLLECTION_NAME);

      // Perform upsert (Insert if new, replace if exists)
      await col.replaceOne({ id: report.id }, report, { upsert: true });
      logger.info('Successfully persisted audit report in MongoDB', { auditId: report.id });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to save audit report to database', error);
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to save audit report to database.',
        500,
        error
      );
    }
  }

  /**
   * Queries and returns an AuditReport by its unique ID.
   *
   * @param id The unique audit ID string.
   */
  public static async findById(id: string): Promise<AuditReport | null> {
    try {
      const db = await this.getDb();
      const col = db.collection<AuditReport>(this.COLLECTION_NAME);

      const result = await col.findOne({ id });
      if (!result) return null;

      // Strip internal MongoDB _id property before returning domain model
      const { _id, ...cleanReport } = result as any;
      return cleanReport as AuditReport;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to retrieve audit report by ID from database', error);
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to query audit report from database.',
        500,
        error
      );
    }
  }

  /**
   * Retrieves the most recent audits, sorted chronologically.
   *
   * @param limit Maximum number of records to retrieve (default is 10).
   */
  public static async findRecent(limit: number = 10): Promise<AuditReport[]> {
    try {
      const db = await this.getDb();
      const col = db.collection<AuditReport>(this.COLLECTION_NAME);

      const results = await col.find({}).sort({ analyzedAt: -1 }).limit(limit).toArray();

      return results.map((doc) => {
        const { _id, ...cleanReport } = doc as any;
        return cleanReport as AuditReport;
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to retrieve recent audits from database', error);
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to query recent audits from database.',
        500,
        error
      );
    }
  }
}

export default AuditRepository;

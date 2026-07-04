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

      // 4. Index on overallScore for sorting by score
      await col.createIndex({ overallScore: -1 }, { name: 'ix_audits_overall_score' });

      // 5. Index on storeName for sorting alphabetically
      await col.createIndex({ storeName: 1 }, { name: 'ix_audits_store_name' });

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

      const results = await col
        .find({})
        .project({
          id: 1,
          url: 1,
          storeUrl: 1,
          domain: 1,
          storeName: 1,
          title: 1,
          description: 1,
          logoUrl: 1,
          faviconUrl: 1,
          appleTouchIcon: 1,
          themeColor: 1,
          brandColor: 1,
          platform: 1,
          overallScore: 1,
          status: 1,
          analysisTime: 1,
          createdAt: 1,
          updatedAt: 1,
          analyzedAt: 1,
          pageScores: 1,
        })
        .sort({ analyzedAt: -1 })
        .limit(limit)
        .toArray();

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

  /**
   * Retrieves audits based on search, status filters, sorting, and pagination.
   */
  public static async findWithFilters(options: {
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    audits: AuditReport[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const db = await this.getDb();
      const col = db.collection<AuditReport>(this.COLLECTION_NAME);

      const query: any = {};

      // 1. Status Filter
      if (options.status && options.status !== 'all') {
        query.status = options.status;
      }

      // 2. Search Query (Store Name, Domain, URL)
      if (options.search) {
        const searchRegex = { $regex: options.search, $options: 'i' };
        query.$or = [
          { storeName: searchRegex },
          { domain: searchRegex },
          { storeUrl: searchRegex },
        ];
      }

      // 3. Sorting
      let sortObj: any = { analyzedAt: -1 };
      if (options.sort === 'oldest') {
        sortObj = { analyzedAt: 1 };
      } else if (options.sort === 'highestScore') {
        sortObj = { overallScore: -1 };
      } else if (options.sort === 'lowestScore') {
        sortObj = { overallScore: 1 };
      } else if (options.sort === 'alphabetical') {
        sortObj = { storeName: 1 };
      }

      // 4. Pagination
      const limit = options.limit ?? 10;
      const page = options.page ?? 1;
      const skip = (page - 1) * limit;

      const total = await col.countDocuments(query);
      const results = await col
        .find(query)
        .project({
          id: 1,
          url: 1,
          storeUrl: 1,
          domain: 1,
          storeName: 1,
          title: 1,
          description: 1,
          logoUrl: 1,
          faviconUrl: 1,
          appleTouchIcon: 1,
          themeColor: 1,
          brandColor: 1,
          platform: 1,
          overallScore: 1,
          status: 1,
          analysisTime: 1,
          createdAt: 1,
          updatedAt: 1,
          analyzedAt: 1,
          pageScores: 1,
        })
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .toArray();

      const cleanAudits = results.map((doc) => {
        const { _id, ...cleanReport } = doc as any;
        return cleanReport as AuditReport;
      });

      return {
        audits: cleanAudits,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to query audits with filters from database', error);
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to query audits from database.',
        500,
        error
      );
    }
  }

  /**
   * Retrieves summary statistics of all audits.
   */
  public static async getStats(): Promise<{
    total: number;
    completed: number;
    running: number;
    failed: number;
    averageScore: number;
    highestScore: number;
  }> {
    try {
      const db = await this.getDb();
      const col = db.collection(this.COLLECTION_NAME);

      const total = await col.countDocuments({});
      const completed = await col.countDocuments({ status: 'completed' });
      const running = await col.countDocuments({ status: 'running' });
      const failed = await col.countDocuments({ status: 'failed' });

      const scoreStats = await col
        .aggregate([
          {
            $group: {
              _id: null,
              avgScore: { $avg: '$overallScore' },
              maxScore: { $max: '$overallScore' },
            },
          },
        ])
        .toArray();

      const averageScore = scoreStats[0]?.avgScore ? Math.round(scoreStats[0].avgScore) : 0;
      const highestScore = scoreStats[0]?.maxScore ?? 0;

      return {
        total,
        completed,
        running,
        failed,
        averageScore,
        highestScore,
      };
    } catch (error) {
      logger.error('Failed to query audit stats from database', error);
      return {
        total: 0,
        completed: 0,
        running: 0,
        failed: 0,
        averageScore: 0,
        highestScore: 0,
      };
    }
  }
}

export default AuditRepository;

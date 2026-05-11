// CalcX Pro Full-Stack Emulator: Express API + MongoDB Database Simulator

export interface MockUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface CalculationRecord {
  _id: string;
  userId?: string;
  type: 'basic' | 'scientific' | 'unit' | 'currency' | 'ai-solver';
  expression: string;
  result: string;
  explanation?: string[];
  isFavorite: boolean;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  status: number;
  latencyMs: number;
  payload?: any;
  response?: any;
  dbQuery?: string;
}

type LogObserver = (log: ApiLog) => void;
type DbObserver = () => void;

class MockBackendService {
  private logObservers: Set<LogObserver> = new Set();
  private dbObservers: Set<DbObserver> = new Set();
  private tokenKey = 'calcx_jwt_token';
  private usersKey = 'calcx_mongodb_users';
  private historyKey = 'calcx_mongodb_history';

  constructor() {
    this.initDatabase();
  }

  // Initialize simulated MongoDB collections
  private initDatabase() {
    if (!localStorage.getItem(this.usersKey)) {
      const defaultUsers: MockUser[] = [
        {
          id: 'u_1',
          username: 'neon_hacker',
          email: 'admin@calcx.pro',
          avatar: '⚡',
          createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        }
      ];
      localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(this.historyKey)) {
      const sampleHistory: CalculationRecord[] = [
        {
          _id: 'calc_1',
          userId: 'u_1',
          type: 'scientific',
          expression: 'sin(pi / 4) * sqrt(2)',
          result: '1',
          isFavorite: true,
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        {
          _id: 'calc_2',
          userId: 'u_1',
          type: 'basic',
          expression: '124 * 8 - 42',
          result: '950',
          isFavorite: false,
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        },
        {
          _id: 'calc_3',
          userId: 'u_1',
          type: 'unit',
          expression: '100 Speed(mph to km/h)',
          result: '160.93 km/h',
          isFavorite: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          _id: 'calc_4',
          userId: 'u_1',
          type: 'ai-solver',
          expression: 'Solve x^2 - 5x + 6 = 0',
          result: 'x = 2 or x = 3',
          explanation: [
            'Identify coefficients: a = 1, b = -5, c = 6',
            'Factor the trinomial into (x - 2)(x - 3) = 0',
            'Solve individual factors: x - 2 = 0 or x - 3 = 0',
            'Resulting roots: x = 2 and x = 3'
          ],
          isFavorite: true,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        }
      ];
      localStorage.setItem(this.historyKey, JSON.stringify(sampleHistory));
    }
  }

  // Observers for updating dashboard console UI real-time
  subscribeToLogs(observer: LogObserver) {
    this.logObservers.add(observer);
    return () => this.logObservers.delete(observer);
  }

  subscribeToDbChanges(observer: DbObserver) {
    this.dbObservers.add(observer);
    return () => this.dbObservers.delete(observer);
  }

  private notifyDbObservers() {
    this.dbObservers.forEach((obs) => obs());
  }

  private logApiCall(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    status: number,
    payload: any,
    response: any,
    dbQuery: string,
    latencyMs: number
  ) {
    const log: ApiLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      latencyMs,
      payload,
      response,
      dbQuery,
    };
    this.logObservers.forEach((obs) => obs(log));
  }

  // Get active user from JWT Token
  getCurrentUser(): MockUser | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const users = this.getUsersCollection();
      return users.find((u) => u.id === decoded.id) || null;
    } catch {
      return null;
    }
  }

  private getUsersCollection(): MockUser[] {
    return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
  }

  private getHistoryCollection(): CalculationRecord[] {
    return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
  }

  // Simulated REST API Endpoints with latencies & queries
  async request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: any): Promise<any> {
    const start = performance.now();
    const latency = Math.floor(Math.random() * 150) + 50; // 50-200ms API network delay simulation
    await new Promise((resolve) => setTimeout(resolve, latency));

    const currentUser = this.getCurrentUser();
    let status = 200;
    let responseData: any = null;
    let dbQuery = '';

    try {
      // 1. JWT AUTHENTICATION ENDPOINTS
      if (url === '/api/auth/register' && method === 'POST') {
        const { username, email, password } = body || {};
        if (!username || !email || !password) {
          status = 400;
          responseData = { error: 'Missing required signup fields' };
        } else {
          const users = this.getUsersCollection();
          if (users.some((u) => u.email === email)) {
            status = 409;
            responseData = { error: 'Email address already exists in database' };
          } else {
            const newUser: MockUser = {
              id: 'u_' + Math.random().toString(36).substr(2, 9),
              username,
              email,
              avatar: ['⚡', '🤖', '👾', '🚀', '🔮'][Math.floor(Math.random() * 5)],
              createdAt: new Date().toISOString(),
            };
            users.push(newUser);
            localStorage.setItem(this.usersKey, JSON.stringify(users));

            // Generate mock JWT Token (Header.Payload.Signature)
            const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
                          btoa(JSON.stringify({ id: newUser.id, email: newUser.email })) + '.' +
                          'signature';

            localStorage.setItem(this.tokenKey, token);
            status = 201;
            responseData = { user: newUser, token };
            dbQuery = `db.users.insertOne({ username: "${username}", email: "${email}" })`;
            this.notifyDbObservers();
          }
        }
      } 
      else if (url === '/api/auth/login' && method === 'POST') {
        const { email, password } = body || {};
        const users = this.getUsersCollection();
        const user = users.find((u) => u.email === email);

        if (!user || password === 'invalid') {
          status = 401;
          responseData = { error: 'Invalid email or security password credentials' };
          dbQuery = `db.users.findOne({ email: "${email}" }) -> NULL`;
        } else {
          const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
                        btoa(JSON.stringify({ id: user.id, email: user.email })) + '.' +
                        'signature';

          localStorage.setItem(this.tokenKey, token);
          status = 200;
          responseData = { user, token };
          dbQuery = `db.users.findOne({ email: "${email}" }) -> Found 1 doc`;
        }
      }
      else if (url === '/api/auth/logout' && method === 'POST') {
        localStorage.removeItem(this.tokenKey);
        status = 200;
        responseData = { success: true };
        dbQuery = 'Session Token invalidated';
      }

      // 2. CALCULATION HISTORY API ENDPOINTS
      else if (url.startsWith('/api/calculations') && method === 'GET') {
        const history = this.getHistoryCollection();
        // Filter calculations for logged in user OR return public ones if not authenticated
        const userHistory = history.filter((c) => !c.userId || c.userId === (currentUser?.id || 'u_1'));
        
        status = 200;
        responseData = userHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        dbQuery = `db.history.find({ userId: "${currentUser?.id || 'u_1'}" }).sort({ createdAt: -1 })`;
      } 
      else if (url === '/api/calculations' && method === 'POST') {
        const { type, expression, result, explanation } = body || {};
        if (!expression || result === undefined) {
          status = 400;
          responseData = { error: 'Calculations require an mathematical expression and result' };
        } else {
          const history = this.getHistoryCollection();
          const newRecord: CalculationRecord = {
            _id: 'calc_' + Math.random().toString(36).substr(2, 9),
            userId: currentUser?.id || 'u_1', // default to demo user if not logged in
            type,
            expression,
            result,
            explanation,
            isFavorite: false,
            createdAt: new Date().toISOString(),
          };

          history.push(newRecord);
          localStorage.setItem(this.historyKey, JSON.stringify(history));
          
          status = 201;
          responseData = newRecord;
          dbQuery = `db.history.insertOne({ type: "${type}", expression: "${expression.substring(0, 20)}..." })`;
          this.notifyDbObservers();
        }
      }
      else if (url.startsWith('/api/calculations/') && method === 'PUT') {
        // Star or favorite calculation
        const id = url.split('/').pop();
        const history = this.getHistoryCollection();
        const recordIndex = history.findIndex((c) => c._id === id);

        if (recordIndex === -1) {
          status = 404;
          responseData = { error: 'Calculation item not found' };
        } else {
          history[recordIndex].isFavorite = !history[recordIndex].isFavorite;
          localStorage.setItem(this.historyKey, JSON.stringify(history));
          status = 200;
          responseData = history[recordIndex];
          dbQuery = `db.history.updateOne({ _id: "${id}" }, { $set: { isFavorite: ${history[recordIndex].isFavorite} } })`;
          this.notifyDbObservers();
        }
      }
      else if (url.startsWith('/api/calculations/') && method === 'DELETE') {
        const id = url.split('/').pop();
        const history = this.getHistoryCollection();
        const filtered = history.filter((c) => c._id !== id);

        if (history.length === filtered.length) {
          status = 404;
          responseData = { error: 'Calculation record not found' };
        } else {
          localStorage.setItem(this.historyKey, JSON.stringify(filtered));
          status = 200;
          responseData = { success: true };
          dbQuery = `db.history.deleteOne({ _id: "${id}" })`;
          this.notifyDbObservers();
        }
      }
      else if (url === '/api/calculations/clear-all' && method === 'DELETE') {
        const history = this.getHistoryCollection();
        const remaining = history.filter((c) => c.userId !== (currentUser?.id || 'u_1'));
        localStorage.setItem(this.historyKey, JSON.stringify(remaining));

        status = 200;
        responseData = { success: true };
        dbQuery = `db.history.deleteMany({ userId: "${currentUser?.id || 'u_1'}" })`;
        this.notifyDbObservers();
      }
      else {
        status = 404;
        responseData = { error: 'Endpoint router not defined' };
      }
    } catch (e: any) {
      status = 500;
      responseData = { error: e.message || 'Internal Server Error' };
    }

    const end = performance.now();
    const duration = Math.floor(end - start);
    this.logApiCall(method, url, status, body, responseData, dbQuery, duration);

    if (status >= 400) {
      throw new Error(responseData?.error || 'Simulated Server Error');
    }
    return responseData;
  }

  // Get full-stack summary metrics for HUD visual charts
  getDbStats() {
    const users = this.getUsersCollection();
    const history = this.getHistoryCollection();
    return {
      usersCount: users.length,
      recordsCount: history.length,
      favoriteCount: history.filter(h => h.isFavorite).length,
      databaseSizeKb: ((JSON.stringify(users).length + JSON.stringify(history).length) / 1024).toFixed(2),
      uptimeHours: (performance.now() / 3600000).toFixed(2),
    };
  }
}

export const mockBackend = new MockBackendService();

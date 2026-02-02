import fs from 'fs';
import path from 'path';

/**
 * Helper to mask passwords in connection strings (e.g., DB URIs)
 * Transforms: postgres://user:secret123@localhost:5432/db
 * To:         postgres://user:*****@localhost:5432/db
 */
const maskSecret = (uri: string | undefined): string => {
  if (!uri) return 'N/A';
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = '*****';
    }
    return url.toString();
  } catch (e) {
    // If it's not a valid URL (e.g. just an IP), return as is
    return uri;
  }
};

export const printAppInfo = () => {
  // Try to load package.json for version/name info
  let pkg = { name: 'Unknown App', version: '0.0.0' };
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    pkg = JSON.parse(content);
  } catch (error) {
    console.warn('⚠️  Could not read package.json');
  }

  // Configuration Mapping
  const config = {
    // Identity
    Name: pkg.name,
    Version: pkg.version,
    PID: process.pid,
    
    // Environment
    Environment: process.env.APP_ENV || 'local',
    NodeEnv: process.env.NODE_ENV || 'development',
    LogLevel: process.env.LOG_LEVEL || 'info',
    
    // Build (Assumes you set these env vars in your CI/CD pipeline)
    Commit: (process.env.GIT_COMMIT || 'unknown').substring(0, 7),
    
    // Connectivity
    Port: process.env.PORT || 3000,
    DB_HOSTNAME: maskSecret(process.env.DATABASE_URL || process.env.DB_HOSTNAME),
  };

  // The Output
  console.log(`
┌────────────────────────────────────────────────────────┐
│  🚀 APPLICATION STARTED                                │
│────────────────────────────────────────────────────────│
│  Identity                                              │
│    Name:        ${config.Name.padEnd(30)}         │
│    Version:     ${config.Version.padEnd(30)}         │
│    Commit:      ${config.Commit.padEnd(30)}         │
│                                                        │
│  Environment                                           │
│    Env:         ${config.Environment.padEnd(30)}         │
│    Node:        ${config.NodeEnv.padEnd(30)}         │
│    Log Lvl:     ${config.LogLevel.padEnd(30)}         │
│                                                        │
│  Connectivity                                          │
│    Port:        ${String(config.Port).padEnd(30)}         │
│    DB Host:     ${config.DB_HOSTNAME.padEnd(30)}         │                                                 
└────────────────────────────────────────────────────────┘
  `);
};

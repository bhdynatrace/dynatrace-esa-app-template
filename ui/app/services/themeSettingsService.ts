/**
 * Theme Settings Service
 * Manages global theme settings stored in Grail logs
 * Admin-controlled theme that applies to all users
 */

import { queryExecutionClient } from '@dynatrace-sdk/client-query';
import { ThemeId } from '../styles/markdownThemes';

const LOG_INGEST_PATH = '/platform/classic/environment-api/v2/logs/ingest';
const THEME_CONFIG_ID = 'global-theme-config';

/**
 * Get the current global theme setting from Grail logs
 */
export async function getGlobalTheme(): Promise<ThemeId> {
  try {
    const query = `fetch logs
      | filter log.source == "dynatrace-deepdive-app" and configid == "${THEME_CONFIG_ID}"
      | sort timestamp desc
      | limit 1
      | fields themeid, timestamp`;

    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 10000,
        fetchTimeoutSeconds: 20,
        maxResultRecords: 1
      }
    });

    if (response.result?.records && response.result.records.length > 0) {
      const record = response.result.records[0];
      if (record && typeof record.themeid === 'string') {
        console.log(`[ThemeSettings] Loaded global theme: ${record.themeid}`);
        return record.themeid as ThemeId;
      }
    }

    console.log('[ThemeSettings] No global theme found, using default: cosmic');
    return 'cosmic';
  } catch (error) {
    console.debug('[ThemeSettings] Error loading theme, using default:', error);
    return 'cosmic';
  }
}

/**
 * Set the global theme (admin only) by ingesting a log entry
 */
export async function setGlobalTheme(themeId: ThemeId, adminUser: string = 'admin'): Promise<boolean> {
  try {
    const logEntry = {
      'log.source': 'dynatrace-deepdive-app',
      'configId': THEME_CONFIG_ID,
      'themeId': themeId,
      'setBy': adminUser,
      'timestamp': new Date().toISOString(),
      'config.type': 'global-theme'
    };

    const response = await fetch(LOG_INGEST_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify([logEntry])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to set theme: ${response.status} - ${errorText}`);
    }

    console.log(`[ThemeSettings] Global theme set to: ${themeId} by ${adminUser}`);
    return true;
  } catch (error) {
    console.error('[ThemeSettings] Failed to set global theme:', error);
    return false;
  }
}

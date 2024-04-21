import axios from 'axios'
import AdmZip from 'adm-zip'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import { LogEntry } from '../interfaces/log'

import { errorPatterns, timestampRegex } from '../conf/constants'

/**
 * Downloads and extracts log files from a given URL.
 * @param {string} url - The URL to download the log archive from.
 * @param {string} extractPath - The local path to extract the logs to.
 * @returns {Promise<string[]>} - A promise that resolves to the paths of the extracted log files.
 */
export async function downloadAndExtractLogs(
  url: string,
  extractPath: string
): Promise<string[]> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    const zip = new AdmZip(response.data)
    zip.extractAllTo(extractPath, true)

    const logFiles = fs
      .readdirSync(extractPath)
      .map(file => path.join(extractPath, file))
    core.info(`Extracted logs to ${extractPath}: ${logFiles.join(', ')}`)
    return logFiles
  } catch (error) {
    throw new Error('Error downloading or extracting logs')
  }
}

/**
 * Downloads the log archive, extracts it, and returns log details for each text file.
 * @param {string} url - The URL to download the log archive from.
 * @returns {Promise<LogEntry[]>} - A promise that resolves with an array of log entries.
 */
export async function downloadAndProcessLogsArchive(
  url: string
): Promise<LogEntry[]> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    const zip = new AdmZip(response.data)
    const logEntries = zip.getEntries()

    return logEntries
      .filter(entry => entry.entryName.endsWith('.txt'))
      .map(entry => {
        const filename = entry.entryName
          .split('/')
          .pop()!
          .replace('.txt', '')
          .replace(/^\d+_/, '')
        const content = entry.getData().toString('utf8')
        return {
          filename,
          content
        }
      })
  } catch (error) {
    throw new Error('Error downloading or extracting logs')
  }
}

export function extractErrors(logs: string): string[] {
  const lines = logs.split('\n')
  const errors = lines.filter(line =>
    errorPatterns.some(pattern => pattern.test(line))
  )
  return errors
}

export function removeTimestamps(logContent: string): string {
  // Replace timestamps with empty strings
  return logContent.replace(timestampRegex, '')
}

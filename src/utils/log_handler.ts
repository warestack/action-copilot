import axios from 'axios'
import AdmZip from 'adm-zip'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'

import { errorPatterns } from '../conf/constants'

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
 * Downloads the log archive and processes each log file as a string.
 * @param {string} url - The URL to download the log archive from.
 * @returns {Promise<void>} - A promise that resolves when logs have been processed.
 */
export async function downloadAndProcessLogsArchive(
  url: string
): Promise<string> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    })

    const zip = new AdmZip(response.data)
    // logEntries is an array of ZipEntry objects
    const logEntries = zip.getEntries()
    let rawLog = ''

    for (let i = 0; i < logEntries.length; i++) {
      const entry = logEntries[i]
      if (entry.entryName.endsWith('.log')) {
        const logContent = entry.getData().toString('utf8')
        rawLog += `${logContent}\n`
      }
    }

    return rawLog
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

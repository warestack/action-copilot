import { promises as fs } from 'fs'

/**
 * Reads a YAML file from the specified path using UTF-8 encoding.
 * @param filePath The path to the YAML file.
 * @returns A promise that resolves to the content of the YAML file as a string.
 */
export async function readYAML(filePath: string): Promise<string> {
  try {
    // Change to the repository directory if not already there
    process.chdir(process.env.GITHUB_WORKSPACE || '')

    return await fs.readFile(filePath, 'utf8')
  } catch (error) {
    throw new Error(`Failed to read the YAML file at ${filePath}: ${error}`)
  }
}

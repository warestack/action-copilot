export function levenshteinDistance(a: string, b: string): number {
  // Create a 2D array to store the distances
  const matrix = new Array(a.length + 1)
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = new Array(b.length + 1)
  }

  // Initialize the first row and column
  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the array
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] =
          Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]) + 1
      }
    }
  }

  // Return the final distance
  return matrix[a.length][b.length]
}

export function isSimilar(a: string, b: string, threshold = 0.3): boolean {
  const distance = levenshteinDistance(a, b)
  const longestLength = Math.max(a.length, b.length)
  return distance / longestLength < threshold
}

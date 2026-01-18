/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Cluster papers into branches (Step 2C)
 * Simple logic - no complex ML needed
 */
export function clusterPapers(papers, projectEmbedding, numClusters = 4) {
  // Calculate similarity to project for each paper
  const papersWithSimilarity = papers.map(paper => ({
    ...paper,
    similarity: cosineSimilarity(paper.embedding, projectEmbedding)
  }));

  // Sort by similarity
  papersWithSimilarity.sort((a, b) => b.similarity - a.similarity);

  // Simple clustering: divide into equal groups
  const clusterSize = Math.ceil(papersWithSimilarity.length / numClusters);
  const clusters = [];

  for (let i = 0; i < numClusters; i++) {
    const start = i * clusterSize;
    const end = Math.min(start + clusterSize, papersWithSimilarity.length);
    const clusterPapers = papersWithSimilarity.slice(start, end);

    if (clusterPapers.length > 0) {
      clusters.push({
        cluster_id: `cluster_${i + 1}`,
        papers: clusterPapers,
        avgSimilarity: clusterPapers.reduce((sum, p) => sum + p.similarity, 0) / clusterPapers.length
      });
    }
  }

  return clusters;
}

/**
 * Alternative: K-means style clustering (more sophisticated)
 */
export function kmeansClustering(papers, projectEmbedding, k = 4, maxIterations = 10) {
  if (papers.length < k) {
    return papers.map((paper, idx) => ({
      cluster_id: `cluster_${idx + 1}`,
      papers: [paper],
      avgSimilarity: cosineSimilarity(paper.embedding, projectEmbedding)
    }));
  }

  // Initialize centroids with k random papers
  let centroids = papers
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
    .map(p => p.embedding);

  let clusters = [];
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign papers to nearest centroid
    clusters = Array(k).fill(null).map(() => []);
    
    papers.forEach(paper => {
      let maxSim = -1;
      let bestCluster = 0;
      
      centroids.forEach((centroid, idx) => {
        const sim = cosineSimilarity(paper.embedding, centroid);
        if (sim > maxSim) {
          maxSim = sim;
          bestCluster = idx;
        }
      });
      
      clusters[bestCluster].push({ ...paper, similarity: maxSim });
    });

    // Recalculate centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]; // fallback
      
      const dim = cluster[0].embedding.length;
      const newCentroid = Array(dim).fill(0);
      
      cluster.forEach(paper => {
        paper.embedding.forEach((val, idx) => {
          newCentroid[idx] += val / cluster.length;
        });
      });
      
      return newCentroid;
    });
  }

  // Format output
  return clusters
    .filter(cluster => cluster.length > 0)
    .map((cluster, idx) => ({
      cluster_id: `cluster_${idx + 1}`,
      papers: cluster,
      avgSimilarity: cluster.reduce((sum, p) => sum + p.similarity, 0) / cluster.length
    }));
}


import { fetchSearchResults } from '../lib/gemini';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function test() {
  const keyword = "Organic Cotton T-shirt Washing Tips";
  console.log(`Searching for: ${keyword}...`);
  try {
    const results = await fetchSearchResults(keyword);
    console.log(`Found ${results.results.length} results.`);
    console.log('AI Overview Summary:', results.aiOverview.summary);
    console.log('\nTop 5 Results:');
    results.results.slice(0, 5).forEach((r, i) => {
      console.log(`${i+1}. ${r.title} (${r.url})`);
    });
    
    const hasLivbio = results.results.some(r => r.url.includes('livbio.in'));
    console.log('\nContains Livbio?', hasLivbio ? 'YES ✅' : 'NO ❌');
  } catch (error) {
    console.error('Error during search:', error);
  }
}

test();

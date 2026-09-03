import dns from 'dns';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dns.setDefaultResultOrder('ipv4first');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini25Flash() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Generate 1 English vocabulary word for B1 level in JSON with keys: word, phonetic, meaning, example');
    console.log('🎉 REAL GEMINI 2.5 FLASH RESPONSE:');
    console.log(result.response.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

testGemini25Flash();

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';

const API_KEY = "AIzaSyBwUweUP7ktEFcTxh8E5gnQk_Oe5q_KIQ0"; 
const genAI = new GoogleGenerativeAI(API_KEY);

// BACA DATABASE EXCEL
const loadExcelDatabase = async () => {
  try {
    // Mencari file di folder 'public'
    const response = await fetch('/database_produk.xlsx');
    
    // Cek jika file tidak ditemukan
    if (!response.ok) throw new Error("File Excel tidak ketemu");

    const arrayBuffer = await response.arrayBuffer();

    // 2. Baca buffer menjadi Workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // 3. Ambil Sheet pertama
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 4. Konversi ke JSON (Array of Objects)
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    
    // 5. Ubah jadi String rapi untuk dibaca AI
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    console.error("Gagal baca database Excel:", error);
    return ""; 
  }
};

// CHATBOT UTAMA
export const getGeminiResponse = async (history: any[], message: string, webProducts: any[]) => {
  try {
    // Gunakan model terbaru
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // A. PRIORITAS DATA: Coba baca Excel dulu
    let productsContext = await loadExcelDatabase();

    // B. CADANGAN: Jika Excel gagal/kosong, pakai data dari Website (webProducts)
    if (!productsContext) {
      console.warn("Menggunakan data website (Excel tidak ditemukan/gagal).");
      productsContext = (webProducts || []).map((p: any) => 
        `- ${p.name}: Rp ${p.price?.toLocaleString('id-ID') || '0'} (${p.category || '-'})`
      ).join("\n");
    }

    // C. FILTER HISTORY (PENTING: Agar tidak Error Role)
    const sanitizedHistory = history
      .map(msg => {
        let textContent = "";
        if (typeof msg.parts === 'string') textContent = msg.parts;
        else if (Array.isArray(msg.parts)) textContent = msg.parts[0]?.text || "";
        else if (msg.parts?.text) textContent = msg.parts.text;

        return {
          role: msg.role,
          parts: [{ text: textContent }] 
        };
      })
      .filter((msg, index) => {
        // Hapus sapaan awal bot
        if (index === 0 && msg.role === 'model') return false; 
        return true;
      });

    // D. MULAI CHAT
    const chat = model.startChat({
      history: sanitizedHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    const systemPrompt = `
      Kamu bernama udin, kamu adalah Customer Service (CS) Ramah dari PT Radhika Narya Daruna.
      Tugasmu menjawab pertanyaan pelanggan berdasarkan DATA BASE PRODUK di bawah ini.

      [SUMBER DATA UTAMA]
      ${productsContext}

      ATURAN PENTING:
    1. HANYA jawab berdasarkan data di atas. Jangan mengarang harga/stok sendiri.
    2. Jika Stok tertulis "Habis" atau "Kosong", katakan maaf dan tawarkan produk lain yang "Ada".
    3. Jika user bertanya hal di luar produk (misal: "Siapa Presiden Indonesia?"), jawab sopan bahwa kamu hanya melayani konsultasi kopra.
    4. PENTING: JANGAN gunakan format Markdown seperti tanda bintang (** atau *). Gunakan teks biasa saja.
    `;

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("❌ Error Gemini:", error);
    return "Maaf, sedang ada gangguan koneksi database. Mohon coba lagi.";
  }
};
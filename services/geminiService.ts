import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx'; 

// Ganti dengan API Key Anda
const API_KEY = "AIzaSyBwUweUP7ktEFcTxh8E5gnQk_Oe5q_KIQ0"; 
const genAI = new GoogleGenerativeAI(API_KEY);

// --- FUNGSI BANTU: BACA EXCEL DARI PUBLIC FOLDER ---
const loadExcelDatabase = async () => {
  try {
    // 1. Fetch file dari folder public
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
    return ""; // Kembalikan string kosong jika gagal
  }
};

// ==========================================
// 1. FITUR CHATBOT (DENGAN MEMORI EXCEL)
// ==========================================
export const getGeminiResponse = async (userMessage: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Baca data terbaru dari Excel setiap kali user bertanya
    const productData = await loadExcelDatabase();

    const SYSTEM_PROMPT = `
    Kamu bernama udin, kamu adalah Customer Service (CS) Ramah dari PT Radhika Narya Daruna.
    Tugasmu menjawab pertanyaan pelanggan berdasarkan DATA BASE PRODUK di bawah ini.
    
    === DATA BASE PRODUK (UPDATE TERBARU) ===
    ${productData ? productData : "(Data produk sedang tidak tersedia, minta maaf ke user)"}
    =========================================

    ATURAN PENTING:
    1. HANYA jawab berdasarkan data di atas. Jangan mengarang harga/stok sendiri.
    2. Jika Stok tertulis "Habis" atau "Kosong", katakan maaf dan tawarkan produk lain yang "Ada".
    3. Jika user bertanya hal di luar produk (misal: "Siapa Presiden Indonesia?"), jawab sopan bahwa kamu hanya melayani konsultasi media tanam.
    4. Gaya bahasa: Sopan, Membantu, dan Menggunakan Emoji sesekali 🌱.
    5. PENTING: JANGAN gunakan format Markdown seperti tanda bintang (** atau *). Gunakan teks biasa saja.
    `;

    const prompt = `${SYSTEM_PROMPT}\n\nUser: "${userMessage}"\nCS:`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    console.error("Error Gemini Chat:", error);
    return "Maaf kak, sistem kami sedang pembaruan data. Silakan hubungi WhatsApp admin ya 🙏";
  }
};

// --- 2. Fungsi untuk UPSELL (Rekomendasi di Keranjang) ---
// ✅ INI YANG HILANG TADI
export const getUpsellSuggestion = async (cartItems: any[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Ubah data cart jadi string biar AI bisa baca
    const cartString = cartItems.map(item => item.name).join(", ");
    
    const prompt = `
    Pelanggan sedang membeli: ${cartString}.
    Sebagai pelayan restoran yang pintar, berikan 1 kalimat rekomendasi menu tambahan yang cocok (Upselling).
    Contoh: "Wah, Nasi Goreng cocok banget ditambah Es Teh Manis lho kak!"
    Langsung berikan kalimat rekomendasinya saja tanpa tanda kutip.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error Gemini Upsell:", error);
    return "Cobain menu dessert kami juga yuk kak!";
  }
};
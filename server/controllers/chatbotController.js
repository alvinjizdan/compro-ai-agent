const natural = require('natural');
const computeCosineSimilarity = require('compute-cosine-similarity');
const KnowledgeBase = require('../models/KnowledgeBase'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');

// Inisialisasi Gemini AI menggunakan Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



// ==========================================
// 1. DATA BASIS PENGETAHUAN (KNOWLEDGE BASE)
// Data FAQ sekarang sepenuhnya dinamis diambil dari MongoDB
// ==========================================

// (Fungsi matematika manual telah diganti menggunakan library natural dan compute-cosine-similarity)

// ==========================================
// 5. FUNGSI UTAMA (ENDPOINT API)
// ==========================================
const processChatMessage = async (req, res) => {
    try {
        const { message, products } = req.body; 
        if (!message) return res.status(400).json({ error: "Pesan tidak boleh kosong." });

        console.log(`\n[+] Pesan masuk: "${message}"`);

        // 1. Susun Katalog
        let KatalogProduk = "Data produk sedang kosong.";
        let kataKunciProduk = ""; 
        
        if (products && products.length > 0) {
            KatalogProduk = products.map(p => 
                `- ${p.name}: Rp ${p.price?.toLocaleString('id-ID')}`
            ).join('\n');
            
            kataKunciProduk = products.map(p => p.name.toLowerCase()).join(" ");
        }

        // 2. Ambil FAQ Mongoose
        const knowledgeBase = await KnowledgeBase.find();
        
        // 3. BUAT FAQ BAYANGAN (Pastikan baris ini ada)
        let dynamicKB = [...knowledgeBase];
        dynamicKB.push({
            question: `ada produk apa saja saja jual katalog daftar barang list menu ${kataKunciProduk}`,
            answer: "Berikut adalah daftar produk dari katalog kami:"
        });

        // ==========================================
        // TAHAP 1: INFORMATION RETRIEVAL & EKSTRAKSI VEKTOR (natural)
        // ==========================================
        const TfIdf = natural.TfIdf;
        const tfidf = new TfIdf();

        // 1. Tambahkan dokumen FAQ ke corpus
        dynamicKB.forEach(kb => {
            tfidf.addDocument(kb.question);
        });

        // 2. Tambahkan pesan user sebagai dokumen terakhir
        tfidf.addDocument(message);
        const userDocIndex = dynamicKB.length;

        // 3. Bangun kumpulan kosakata (Terms)
        const allTerms = new Set();
        for (let i = 0; i <= userDocIndex; i++) {
            const terms = tfidf.listTerms(i);
            terms.forEach(item => allTerms.add(item.term));
        }
        const vocab = Array.from(allTerms);

        // 4. Ekstrak vektor TF-IDF untuk FAQ
        const kbVectors = [];
        for (let i = 0; i < dynamicKB.length; i++) {
            const vec = [];
            vocab.forEach(term => {
                vec.push(tfidf.tfidf(term, i));
            });
            kbVectors.push(vec);
        }

        // 5. Ekstrak vektor TF-IDF untuk User
        const userVector = [];
        vocab.forEach(term => {
            userVector.push(tfidf.tfidf(term, userDocIndex));
        });

        // TAMBAHAN: Cetak detail TF-IDF ke Terminal
        console.log("\n[+] --- DETAIL PERHITUNGAN TF-IDF (USER) ---");
        const userTermsList = tfidf.listTerms(userDocIndex);
        const activeTerms = userTermsList.filter(t => t.tfidf > 0);
        console.log(`Kata Kunci Token: [ ${activeTerms.map(t => t.term).join(", ")} ]`);
        console.log("Rincian Bobot Kata:");
        activeTerms.forEach(t => {
            console.log(` -> '${t.term}' | TF: ${t.tf} | IDF: ${t.idf.toFixed(4)} | TF-IDF: ${t.tfidf.toFixed(4)}`);
        });
        console.log("--------------------------------------------\n");

        // ==========================================
        // TAHAP 2: COSINE SIMILARITY & GATEKEEPER
        // ==========================================
        let bestMatch = { score: 0, answer: "" };

        console.log("\n[+] --- DETAIL PERHITUNGAN SIMILARITY ---");
        for (let i = 0; i < dynamicKB.length; i++) {
            // Menggunakan package compute-cosine-similarity
            const score = computeCosineSimilarity(userVector, kbVectors[i]) || 0;
            console.log(` -> Similarity dgn KB[${i}]: ${score.toFixed(4)}`);

            if (score > bestMatch.score) {
                bestMatch = { score: score, answer: dynamicKB[i].answer };
            }
        }
        console.log(`\n-> Skor Tertinggi: ${bestMatch.score.toFixed(4)}`);

        // 5. GATEKEEPER
        if (bestMatch.score < 0.2) {
            console.log("[-] Status: Ditolak (Out of Context)");
            return res.json({ 
                reply: "Maaf, pertanyaan di luar konteks.",
                score: bestMatch.score,
                status: "Rejected"
            });
        }

        let katalogWebsite = "Data produk sedang kosong.";
if (products && products.length > 0) {
    // Memetakan array produk menjadi teks yang mudah dibaca Gemini
    katalogWebsite = products.map(p => 
        `- ID: ${p.id} | ${p.name}: Rp ${p.price}`
    ).join('\n');
}

// 2. MODIFIKASI PROMPT GEMINI (PROMPT ENGINEERING)
const prompt = `
Kamu adalah Udin, Customer Service dari PT Radhika Narya Daruna.

[KATALOG PRODUK ASLI DARI WEBSITE]
${katalogWebsite}

[JAWABAN SISTEM / FAQ]
${bestMatch.answer}

[KATALOG PRODUK ASLI DARI WEBSITE]
${KatalogProduk}

Pengguna bertanya: "${message}"

ATURAN MUTLAK:
1. Jawab dengan ramah, natural, dan gunakan bahasa Indonesia yang baik.
2. Jawab HANYA berdasarkan informasi [KATALOG PRODUK] atau [FAQ] di atas.
3. JIKA kamu menyebutkan atau menawarkan produk dari katalog, KAMU WAJIB MENAMBAHKAN KODE RAHASIA INI di paling akhir jawabanmu: [PRODUK:ID_PRODUK]
4. Jika kamu menyebutkan lebih dari satu produk, tambahkan kode rahasia untuk MASING-MASING produk di akhir jawaban. Contoh: [PRODUK:ID1] [PRODUK:ID2]
5. Contoh jawaban yang BENAR: "Kami punya Kopra Reguler seharga Rp 13.000 dan Kelapa Utuh seharga Rp 10.000. [PRODUK:1] [PRODUK:2]"
6. Jangan gunakan format Markdown tebal/miring, buat teks biasa saja.
`;

try {
    // 1. INISIALISASI GEMINI
    // Definisikan 'model' yang akan digunakan
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    // 2. PANGGIL API GEMINI (Ini kode yang lama)
    const result = await model.generateContent(prompt);
    let geminiReply = result.response.text();

    // 4. PROSES PARSING (PENYARINGAN TOKEN PRODUK)
    let detectedProductIds = [];
    
    // Regex dengan flag 'g' untuk mencari semua [PRODUK:ID]
    const productMatches = geminiReply.match(/\[PRODUK:([^\]]+)\]/g);

    if (productMatches) {
        detectedProductIds = productMatches.map(match => {
            const idMatch = match.match(/\[PRODUK:([^\]]+)\]/);
            return idMatch ? idMatch[1].trim() : null;
        }).filter(id => id !== null);
        
        geminiReply = geminiReply.replace(/\[PRODUK:([^\]]+)\]/g, '').trim();
    }

    // 5. KIRIM RESPONSE JSON KE FRONTEND (REACT)
    return res.status(200).json({
        reply: geminiReply,         // Teks yang sudah bersih dari kode rahasia
        score: bestMatch.score,     // Skor TF-IDF tertinggi
        productIds: detectedProductIds, // Berisi array ID produk
        status: "success"
    });

} catch (error) {
    console.error("Error pada API Gemini:", error);
    // Error Handling: Jika Gemini down, kirimkan hasil TF-IDF murni tanpa productId
    return res.status(500).json({
        reply: bestMatch.answer,
        score: bestMatch.score,
        productIds: [],
        status: "error"
    });
}



    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
};

module.exports = { processChatMessage };
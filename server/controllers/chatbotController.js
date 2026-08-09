const natural = require('natural');
const computeCosineSimilarity = require('compute-cosine-similarity');
const KnowledgeBase = require('../models/KnowledgeBase');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Inisialisasi Gemini AI menggunakan Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



// ==========================================
// 1. DATA BASIS PENGETAHUAN (KNOWLEDGE BASE)
// Data FAQ diambil dari MongoDB
// ==========================================
// 5. FUNGSI UTAMA (ENDPOINT API)
// ==========================================
const processChatMessage = async (req, res) => {
    try {
        const messageStr = String(req.body.message || '').trim();
        if (!messageStr) return res.status(400).json({ error: "Pesan tidak boleh kosong." });
        if (messageStr.length > 500) return res.status(400).json({ error: "Pesan terlalu panjang (maksimal 500 karakter)." });

        console.log(`\n[+] Pesan masuk: "${messageStr}"`);

        // 1. Susun Katalog & Kata Kunci (Dari Database)
        let katalogWebsite = "Data produk sedang kosong.";
        let kataKunciProduk = "";

        // Escape regex untuk sanitasi input dari NoSQL Injection
        const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const searchWords = messageStr.split(/\s+/).filter(w => w.length > 2);

        let productQuery = {};
        let dbProducts = [];
        if (searchWords.length > 0) {
            const regexArr = searchWords.map(word => ({
                name: { $regex: escapeRegex(word), $options: 'i' }
            }));
            productQuery = { $or: regexArr };

            // Ambil produk relevan dengan limit 5 dan projection khusus
            dbProducts = await Product.find(productQuery).select('_id name price').limit(5);
        }

        if (dbProducts && dbProducts.length > 0) {
            katalogWebsite = dbProducts.map(p =>
                `- ID: ${p._id} | ${p.name}: Rp ${p.price?.toLocaleString('id-ID')}`
            ).join('\n');

            kataKunciProduk = dbProducts.map(p => p.name.toLowerCase()).join(" ");
        }

        // 2. Ambil FAQ Mongoose
        const knowledgeBase = await KnowledgeBase.find();

        // 3. BUAT FAQ BAYANGAN (Untuk mengenali pertanyaan produk)
        let dynamicKB = [...knowledgeBase];
        dynamicKB.push({
            question: `ada produk apa saja saja jual katalog daftar barang list menu ${kataKunciProduk}`,
            answer: "Berikut adalah daftar produk dari katalog kami:",
            isCatalogIntent: true
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
        tfidf.addDocument(messageStr);
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
        let bestMatch = { score: 0, answer: "", isCatalogIntent: false };

        console.log("\n[+] --- DETAIL PERHITUNGAN SIMILARITY ---");
        for (let i = 0; i < dynamicKB.length; i++) {
            // Menggunakan package compute-cosine-similarity
            const score = computeCosineSimilarity(userVector, kbVectors[i]) || 0;
            console.log(` -> Similarity dgn KB[${i}]: ${score.toFixed(4)}`);

            if (score > bestMatch.score) {
                bestMatch = {
                    score: score,
                    answer: dynamicKB[i].answer,
                    isCatalogIntent: dynamicKB[i].isCatalogIntent === true
                };
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

        // 5b. SECOND-STAGE RETRIEVAL: Untuk pertanyaan katalog umum jika produk spesifik nihil
        if (bestMatch.isCatalogIntent && dbProducts.length === 0) {
            console.log("[+] Mendeteksi intent General Catalog, mengambil sampel produk default.");
            dbProducts = await Product.find({}).select('_id name price').limit(5);
            if (dbProducts && dbProducts.length > 0) {
                katalogWebsite = dbProducts.map(p =>
                    `- ID: ${p._id} | ${p.name}: Rp ${p.price?.toLocaleString('id-ID')}`
                ).join('\n');
            }
        }

// 6. MODIFIKASI PROMPT GEMINI
const prompt = `
Kamu adalah Udin, Customer Service dari PT Radhika Narya Daruna.

[KATALOG PRODUK ASLI DARI WEBSITE]
${katalogWebsite}

[JAWABAN SISTEM / FAQ]
${bestMatch.answer}

Pengguna bertanya: "${messageStr}"

ATURAN MUTLAK:
1. Jawab dengan ramah, natural, dan gunakan bahasa Indonesia yang baik.
2. Jawab HANYA berdasarkan informasi [KATALOG PRODUK] atau [FAQ] di atas.
3. Kembalikan respons dalam format JSON sesuai skema yang diberikan.
4. HANYA rekomendasikan ID produk yang benar-benar tercantum di dalam [KATALOG PRODUK ASLI DARI WEBSITE] di atas.
5. Jika tidak ada produk yang relevan di katalog di atas, berikan productIds sebagai array kosong [].
6. DILARANG KERAS mengarang, menyimpulkan, atau membuat ID produk sendiri.
`;

try {
    // 1. DEFINISI SCHEMA JSON
    const responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
            reply: {
                type: SchemaType.STRING,
                description: "Jawaban natural dan ramah kepada pengguna berdasarkan FAQ atau Katalog Produk."
            },
            productIds: {
                type: SchemaType.ARRAY,
                description: "Daftar ID Produk yang direkomendasikan dalam jawaban. Kosongkan array jika tidak ada produk yang ditawarkan.",
                items: {
                    type: SchemaType.STRING
                }
            }
        },
        required: ["reply", "productIds"]
    };

    // 2. INISIALISASI GEMINI
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    // 3. PANGGIL API GEMINI
    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    // 4. PROSES PARSING JSON
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(rawResponse);
    } catch (e) {
        throw new Error("Failed to parse Gemini JSON: " + e.message);
    }

    // 5. VALIDASI STRUKTUR JSON
    if (typeof parsedResponse.reply !== 'string') {
        throw new Error("Invalid reply format: must be string");
    }
    if (!Array.isArray(parsedResponse.productIds) || !parsedResponse.productIds.every(id => typeof id === 'string')) {
        throw new Error("Invalid productIds format: must be array of strings");
    }

    let geminiReply = parsedResponse.reply;
    let detectedProductIds = parsedResponse.productIds;

    // 5b. VALIDASI ID PRODUK KE MONGODB (SERVER-SIDE VALIDATION)
    let validatedProductIds = [];
    if (detectedProductIds.length > 0) {
        // Hapus duplikat
        const uniqueIds = [...new Set(detectedProductIds)];

        // Saring hanya ID yang berformat valid ObjectId
        const validObjectIds = uniqueIds.filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validObjectIds.length > 0) {
            // Cek eksistensi di database
            const existingProducts = await Product.find({ _id: { $in: validObjectIds } }).select('_id');
            const existingIdStrings = existingProducts.map(p => p._id.toString());

            // Pertahankan urutan rekomendasi asli dari Gemini, tetapi saring yang tidak ada di DB
            validatedProductIds = uniqueIds.filter(id => existingIdStrings.includes(id));
        }
    }

    // 6. KIRIM RESPONSE JSON KE FRONTEND (REACT)
    return res.status(200).json({
        reply: geminiReply,
        score: bestMatch.score,
        productIds: validatedProductIds,
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
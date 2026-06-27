const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. DEKLARASI TOOLS (Function Declarations)
const adminTools = {
    functionDeclarations: [
        {
            name: "updateProductStock",
            description: "Menambahkan atau mengurangi stok produk di database berdasarkan nama produk.",
            parameters: {
                type: "OBJECT",
                properties: {
                    productName: {
                        type: "STRING",
                        description: "Nama produk yang ingin diubah stoknya."
                    },
                    quantityToAdd: {
                        type: "STRING",
                        description: "Jumlah stok yang ditambahkan (gunakan angka negatif untuk mengurangi). Masukkan nominal bulat tanpa titik/koma."
                    }
                },
                required: ["productName", "quantityToAdd"]
            }
        },
        {
            name: "updateProductPrice",
            description: "Mengubah harga dari suatu produk di database.",
            parameters: {
                type: "OBJECT",
                properties: {
                    productName: {
                        type: "STRING",
                        description: "Nama produk yang ingin diubah harganya."
                    },
                    newPrice: {
                        type: "STRING",
                        description: "Harga baru produk. Hanya masukkan nominal angka bulat tanpa titik/koma (misal: 14000)."
                    }
                },
                required: ["productName", "newPrice"]
            }
        },
        {
            name: "updateProductName",
            description: "Mengubah nama produk menjadi nama yang baru.",
            parameters: {
                type: "OBJECT",
                properties: {
                    oldProductName: {
                        type: "STRING",
                        description: "Nama produk saat ini yang ada di database."
                    },
                    newProductName: {
                        type: "STRING",
                        description: "Nama produk yang baru."
                    }
                },
                required: ["oldProductName", "newProductName"]
            }
        },
        {
            name: "setProductStock",
            description: "Mengubah total stok produk menjadi nilai mutlak tertentu (bukan ditambah/dikurang, melainkan di set langsung ke angka ini).",
            parameters: {
                type: "OBJECT",
                properties: {
                    productName: {
                        type: "STRING",
                        description: "Nama produk yang ingin di-set stoknya."
                    },
                    newStock: {
                        type: "STRING",
                        description: "Jumlah stok akhir (mutlak) yang baru. Masukkan nominal angka tanpa titik/koma."
                    }
                },
                required: ["productName", "newStock"]
            }
        },
        {
            name: "updateOrderStatus",
            description: "Mengubah status dari sebuah pesanan (order) berdasarkan ID pesanan.",
            parameters: {
                type: "OBJECT",
                properties: {
                    orderId: {
                        type: "STRING",
                        description: "ID Pesanan (Order ID) yang valid di database Mongoose."
                    },
                    newStatus: {
                        type: "STRING",
                        description: "Status pesanan terbaru. Nilai yang valid hanya: 'Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Batal'."
                    }
                },
                required: ["orderId", "newStatus"]
            }
        }
    ]
};

// ==========================================
// 2. FUNGSI EKSEKUSI DATABASE
// ==========================================
async function executeUpdateProductStock(args) {
    try {
        const rawStock = args.quantityToAdd.toString().replace(/[^0-9-]/g, '');
        const stockNum = parseInt(rawStock, 10) || 0;

        // Gunakan Regex agar pencarian nama produk lebih fleksibel (case-insensitive)
        const product = await Product.findOneAndUpdate(
            { name: new RegExp(args.productName, 'i') },
            { $inc: { stock: stockNum } },
            { new: true } // Return dokumen setelah di-update
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.productName}' tidak ditemukan di database.` };
        }
        return { 
            success: true, 
            message: `Stok produk '${product.name}' berhasil diperbarui.`, 
            newStock: product.stock 
        };
    } catch (error) {
        return { error: `Gagal memperbarui stok: ${error.message}` };
    }
}

async function executeUpdateProductPrice(args) {
    try {
        // Parse harga secara manual untuk menghindari error jika AI mengirimkan string atau ada titik
        const rawPrice = args.newPrice.toString().replace(/[^0-9]/g, '');
        const priceNum = parseInt(rawPrice, 10);

        if (isNaN(priceNum)) {
            return { error: `Harga '${args.newPrice}' tidak valid. Harus berupa angka.` };
        }

        const product = await Product.findOneAndUpdate(
            { name: new RegExp(args.productName, 'i') },
            { price: priceNum },
            { new: true }
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.productName}' tidak ditemukan di database.` };
        }
        return { 
            success: true, 
            message: `Harga produk '${product.name}' berhasil diubah.`, 
            newPrice: product.price 
        };
    } catch (error) {
        return { error: `Gagal memperbarui harga: ${error.message}` };
    }
}

async function executeUpdateProductName(args) {
    try {
        const product = await Product.findOneAndUpdate(
            { name: new RegExp(args.oldProductName, 'i') },
            { name: args.newProductName },
            { new: true }
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.oldProductName}' tidak ditemukan di database.` };
        }
        return { 
            success: true, 
            message: `Nama produk berhasil diubah menjadi '${product.name}'.`
        };
    } catch (error) {
        return { error: `Gagal mengubah nama produk: ${error.message}` };
    }
}

async function executeSetProductStock(args) {
    try {
        const rawStock = args.newStock.toString().replace(/[^0-9]/g, '');
        const stockNum = parseInt(rawStock, 10) || 0;

        const product = await Product.findOneAndUpdate(
            { name: new RegExp(args.productName, 'i') },
            { stock: stockNum },
            { new: true }
        );

        if (!product) {
            return { error: `Produk dengan nama '${args.productName}' tidak ditemukan di database.` };
        }
        return { 
            success: true, 
            message: `Stok produk '${product.name}' berhasil di-set menjadi mutlak ${product.stock}.`, 
            newStock: product.stock 
        };
    } catch (error) {
        return { error: `Gagal men-set stok: ${error.message}` };
    }
}

async function executeUpdateOrderStatus(args) {
    try {
        const order = await Order.findByIdAndUpdate(
            args.orderId,
            { status: args.newStatus },
            { new: true }
        );

        if (!order) {
            return { error: `Pesanan dengan ID '${args.orderId}' tidak ditemukan.` };
        }
        return { 
            success: true, 
            message: `Status pesanan ${args.orderId} berhasil diubah menjadi '${order.status}'.` 
        };
    } catch (error) {
        return { error: `Gagal memperbarui status pesanan: Mungkinkah ID salah format? (${error.message})` };
    }
}

// ==========================================
// 3. FUNGSI UTAMA (ENDPOINT CONTROLLER)
// ==========================================
const processAdminChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: "Pesan tidak boleh kosong." });

        console.log(`\n[ADMIN AGENT] Pesan masuk: "${message}"`);

        // Ambil semua pesanan untuk menghitung Kode Pesanan yang sama persis dengan frontend
        const allOrders = await Order.find().sort({ date: -1 });
        const recentOrders = allOrders.slice(0, 20); // Ambil 20 terbaru untuk AI
        
        const ordersContext = recentOrders.map((o, index) => {
            const kodeAngka = allOrders.length - index;
            const kodePesanan = `RND-${String(kodeAngka).padStart(3, '0')}`;
            const orderDate = new Date(o.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            return `[ID: ${o._id}] Kode Pesanan: ${kodePesanan} | Pelanggan: ${o.customerName} | Status: ${o.status} | Tanggal: ${orderDate}`;
        }).join('\n');

        const systemInstruction = `Kamu adalah AI Asisten Admin operasional toko. Tugasmu adalah membantu admin mengelola database toko (seperti mengubah stok barang dan status pesanan). 
Berikut adalah daftar pesanan terbaru saat ini (jadikan referensi jika admin meminta mengubah status pesanan berdasarkan kode pesanan, nama, atau tanggal pelanggan):

${ordersContext}

Panggil tools yang disediakan jika admin meminta perubahan data. Jika admin menyebut KODE PESANAN (misal RND-001), nama pelanggan, atau tanggal untuk mengubah pesanan, cari ID-nya dari daftar di atas lalu panggil fungsi updateOrderStatus menggunakan ID tersebut.`;

        // Inisialisasi Model Gemini dengan konfigurasi Tools
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [adminTools],
            systemInstruction: systemInstruction
        });

        // Format history dari frontend ke format Gemini SDK
        let formattedHistory = [];
        if (history && Array.isArray(history)) {
            // Skip pesan pertama jika itu pesan default (Halo Admin...)
            const chatHistory = history.length > 0 && history[0].role === 'model' && history[0].parts.includes('Halo Admin') 
                ? history.slice(1) 
                : history;
                
            formattedHistory = chatHistory.map(h => ({
                role: h.role,
                parts: [{ text: h.parts }]
            }));
        }

        // Buat Chat Session dengan History
        const chat = model.startChat({ history: formattedHistory });

        // 1. Kirim pesan ke Gemini
        let result = await chat.sendMessage(message);
        let response = result.response;

        // 2. Cek apakah Gemini memutuskan untuk memanggil fungsi (Function Call)
        const functionCalls = response.functionCalls();
        let dbUpdated = false;

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]; // Ambil call pertama
            console.log(`[ADMIN AGENT] Model memanggil fungsi: ${call.name} dengan args:`, call.args);

            let dbResult = null;

            // 3. Eksekusi fungsi Mongoose native
            if (call.name === 'updateProductStock') {
                dbResult = await executeUpdateProductStock(call.args);
            } else if (call.name === 'updateProductPrice') {
                dbResult = await executeUpdateProductPrice(call.args);
            } else if (call.name === 'updateProductName') {
                dbResult = await executeUpdateProductName(call.args);
            } else if (call.name === 'setProductStock') {
                dbResult = await executeSetProductStock(call.args);
            } else if (call.name === 'updateOrderStatus') {
                dbResult = await executeUpdateOrderStatus(call.args);
            }

            console.log(`[ADMIN AGENT] Hasil eksekusi database:`, dbResult);

            if (dbResult && dbResult.success) {
                dbUpdated = true;
            }

            // 4. Kembalikan hasil eksekusi ke model Gemini (Function Response)
            result = await chat.sendMessage([{
                functionResponse: {
                    name: call.name,
                    response: dbResult
                }
            }]);

            // Dapatkan kalimat natural dari Gemini setelah diberikan hasil eksekusi
            response = result.response;
        }

        // 5. Kembalikan balasan natural ke Frontend
        const finalReply = response.text();
        console.log(`[ADMIN AGENT] Balasan ke Admin: "${finalReply}"\n`);
        
        return res.status(200).json({ reply: finalReply, dbUpdated });

    } catch (error) {
        console.error("Error di Admin Chat:", error);
        return res.status(500).json({ 
            reply: "Terjadi kesalahan internal server saat memproses permintaan admin agen." 
        });
    }
};

module.exports = { processAdminChat };

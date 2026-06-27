const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true // Menghapus spasi berlebih di awal/akhir kalimat
    },
    answer: {
        type: String,
        required: true
    }
}, { 
    timestamps: true // Otomatis mencatat kapan data dibuat (createdAt) dan diubah (updatedAt)
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
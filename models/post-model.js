const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
        trim: true
    },
    published: {
        type: Boolean,
        default: false
    },
    image: {
        type: Buffer
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

postSchema.pre('save', async function (next) {
    const post = this
    next()
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post
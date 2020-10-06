const express = require('express')
const router = new express.Router()
const Post = require('../models/post-model')
const auth = require('../auth')
const multer = require('multer')
const sharp = require('sharp')

router.post('/create', auth, async (req, res) => {
    const post = new Post({
        ...req.body,
        owner: req.user._id
    })
    try {
        await post.save()
        res.status(201).send(post)
    } catch (error) {
        res.status(400).send(error)
        console.log("Error: " + error)
    }
})

router.get('/postsByUser', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.published) {
        match.published = req.query.published === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'posts',
            match,
            options: {
                sort
            }
        }).execPopulate()
        res.send(req.user.posts)
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get('/posts', auth, async (req, res) => {
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        const posts = await Post.find({
            body: new RegExp(req.query.searchBody)
        }).sort(sort)
        if (!posts)
            return res.status(404).send("Posts not found")
        res.send(posts)
    } catch (error) {
        res.status(500).send("Error fetching the posts")
    }
});

router.get('/post/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {
        const post = await Post.findOne({
            _id,
            owner: req.user._id
        })
        if (!post)
            return res.status(404).send("Post not found")
        res.send(post)
    } catch (error) {
        res.status(500).send("Error fetching the post")
    }
});

router.patch('/post/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const _id = req.params.id
    try {
        const post = await Post.findOne({
            _id: req.params.id,
            owner: req.user._id
        })
        if (!post)
            return res.status(404).send("Post not found")
        updates.forEach((update) => post[update] = req.body[update])
        await post.save()
        res.send("Post Updated")
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/post/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        })
        if (!post)
            return res.status(404).send("Post not found")
        res.send("Post Deleted")
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    // dest: 'images'
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload an image file'))

        cb(undefined, true)
    }
})

router.post('/post/:id/upload/image', auth, upload.single('image'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).png().toBuffer()
    // await req.post.save()
    const post = await Post.findOne({
        _id: req.params.id,
        owner: req.user._id
    })
    if (!post)
        return res.status(404).send("Post not found")
    post.image = buffer
    await post.save()
    res.send("Image uploaded")
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

router.delete('/post/:id/image', auth, async (req, res) => {
    const post = await Post.findOne({
        _id: req.params.id,
        owner: req.user._id
    })
    if (!post)
        return res.status(404).send("Post not found")
    post.image = undefined
    await post.save()
    res.send('Post Image Deleted')
})

router.get('/post/:id/image', auth, async (req, res) => {

    try {
        const post = await Post.findOne({
            _id: req.params.id,
            owner: req.user._id
        })
        if (!post)
            return res.status(404).send("Post not found")
        if (!post || !post.image)
            throw new Error('Image in fetching an image')
        res.set('Content-Type', 'image/png')
        res.send(post.image)
    } catch (error) {
        res.status(404).send("Error in fetching an image")
    }
})

module.exports = router
const express = require('express')
const router = new express.Router()
const User = require('../models/user-model')
const auth = require('../auth')

router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (error) {
        res.status(400).send("" + error)
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("User Logged Out")
    } catch (error) {
        res.status(500).send("" + error)
    }
})

router.get('/user/profile', auth, async (req, res) => {
    user = req.user
    await user.populate('posts').execPopulate()
    res.send({
        user,
        posts: user.posts
    })
})

router.patch('/user/', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid)
        return res.status(400).send({
            Error: 'Invalid update fields'
        })
    try {
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/user/', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send('User Deleted')
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
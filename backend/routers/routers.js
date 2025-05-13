const {getUser, getTrack } = require('../handlers/handlers')
const express = require('express')

const router = express.Router()

router.get('/getUser/:id', getUser);
router.get('/getTrack/:id', getTrack);

module.exports = router;



const {updateCredits } = require ('../handlers/triggerHandler')
const express = require ('express');
const router = express.Router();

router.post('/updateCredits', updateCredits);

module.exports = router;

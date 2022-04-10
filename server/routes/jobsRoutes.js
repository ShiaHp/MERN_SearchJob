

const express  = require('express');

const router = express.Router();

const {createJob ,getAllJobs,updateJobs,deleteJobs,showStats} = require('../controllers/jobsController')


router.route('/').post(createJob).get(getAllJobs);

router.route('/stats').get(showStats);

router.route('/:id').delete(deleteJobs).patch(updateJobs)
module.exports = router ;

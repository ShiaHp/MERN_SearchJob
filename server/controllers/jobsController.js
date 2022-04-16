const Job = require('../models/Job')
const {StatusCodes} = require('http-status-codes');
const {BadRequestError,NotFoundError,Unauthenticated} = require('../errors/index.js')
const createJob = async (req, res) => {
      const { position,company} = req.body;

      if(!position || !company) {
          throw new BadRequestError('Please provide all values')
      }

      req.body.createdBy = req.user.userId;

      const job = await Job.create(req.body)
      res.status(StatusCodes.OK).json({
          message: 'Success',
          job
      })
}

const getAllJobs = (req, res) => {
    res.send('getAllJobs')
}


const updateJobs = (req, res) => {
    res.send('updateJobs')
}

const deleteJobs = (req, res) => {
    res.send('updateJobs')
}
const showStats = (req, res) => {
    res.send('updateJobs')
}


module.exports = { createJob ,getAllJobs,updateJobs,deleteJobs,showStats }
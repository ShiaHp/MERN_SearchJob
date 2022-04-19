const Job = require('../models/Job')
const {StatusCodes} = require('http-status-codes');
const {BadRequestError,NotFoundError,Unauthenticated} = require('../errors/index.js');
const  checkPermissions  = require('../utils/checkPermissions');
const mongoose = require('mongoose')
const moment = require('moment');
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

const getAllJobs = async (req, res) => {
    const { status, jobType, sort, search } = req.query
  
    const queryObject = {
      createdBy: req.user.userId,
    }
    // add stuff based on condition
  
    if (status && status !== 'all') {
      queryObject.status = status
    }
    if (jobType && jobType !== 'all') {
      queryObject.jobType = jobType
    }
    if (search) {
      queryObject.position = { $regex: search, $options: 'i' }
    }
    // NO AWAIT
     

    let result = Job.find(queryObject)
  
    // chain sort conditions
  
    if (sort === 'latest') {
      result = result.sort('-createdAt')
    }
    if (sort === 'oldest') {
      result = result.sort('createdAt')
    }
    if (sort === 'a-z') {
      result = result.sort('position')
    }
    if (sort === 'z-a') {
      result = result.sort('-position')
    }
  
    //
        // no await 
  
       const page = Number(req.query.page) || 1
       const limit = Number(req.query.limit) || 10
       const skip = (page-1) * limit;

        result = result.skip(skip).limit(limit)
//   chain sort conditions
    const jobs = await result
    
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs /limit)
  res.status(StatusCodes.OK).json({
      jobs, totalJobs,numOfPages 
  })
}


const updateJobs =  async (req, res) => {
    const { id : jobId}  =req.params;
    const {company,position ,jobLocation , status} = req.body;

    if(!company || !position || !jobLocation) {
        throw new BadRequestError('Please provide all values')
    }
    const job = await Job.findOne({_id : jobId});

    if(!job) {
        throw new BadRequestError('Not Found')
    }
    // check permission

    checkPermissions(req.user,job.createdBy)

      

    const updatedJob = await Job.findOneAndUpdate({_id : jobId},req.body,{
        new : true,
        runValidator : true
        // không dùng cách này để lưu vì không trigger the hook (hook in models)
    })
    // job.position = position;
    // job.company = company;
    // job.jobLocation = jobLocation
    // job.status = status;
    // await job.save();

    res.status(StatusCodes.OK).json({
        message : 'Success',
        updatedJob:updatedJob
    })
}

const deleteJobs = async (req, res) => {
    const {id : jobId} = req.params;
    const job = await Job.findOne({_id : jobId});

    if(!job) {
        throw new Error(`No job found with id ${jobId}`);
    }
    checkPermissions(req.user,job.createdBy);
    await job.remove();
    res.status(StatusCodes.OK).json({message: 'Successfully delete!'})
}
const showStats = async (req, res) => {
    let stats = await Job.aggregate([
        {$match : {createdBy  : mongoose.Types.ObjectId(req.user.userId)}},
        {$group : {_id : '$status',count :{$sum : 1}}}
    ])

    stats = stats.reduce((acc, curr) => {
        const {_id : title,count} = curr;
        acc[title] = count;
        return acc;
    },{})

    const defaultStats = {
        pending : stats.pending || 0,
        interview  : stats.interview || 0,
        declined : stats.declined || 0
    }

    let monthlyApplication = await Job.aggregate([
        {$match : {createdBy : mongoose.Types.ObjectId(req.user.userId)}},
        {$group : {_id : {year :{$year : '$createdAt'} , month :{$month : '$createdAt'}},
        count : {$sum : 1}
        } },
        {$sort : {'_id.year' : -1,'_id.month' : -1}},
        {$limit : 6}

    ])
    monthlyApplication=  monthlyApplication.map((item,index) =>{
        const {_id :{year,month} , count} = item;
        const date= moment().month(month-1).year(year).format('MMM Y')
        return{date,count}
    }).reverse()
    res.status(StatusCodes.OK).json({message: 'Success',defaultStats  , monthlyApplication})
}


module.exports = { createJob ,getAllJobs,updateJobs,deleteJobs,showStats }
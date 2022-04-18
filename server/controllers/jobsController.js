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

    const { search,sort,status,jobType} = req.query;

    const queryObject = {
        createdBy: req.user.userId 
    }
    
    let result = Job.find(queryObject)
    if(status !== 'all'){
        queryObject.status = status;
    }
    if(jobType !== 'all'){
        queryObject.jobType = jobType;
    }

    if(search) {
        queryObject.position = {$regex : search, $options : 'i'};
    }
    if(sort === 'latest'){
        result = result.sort('-createdAt')
    }
    if(sort === 'oldest'){
        result = result.sort('createdAt')
    }
    if(sort === 'z-a'){
        result = result.sort('-position')
    }
        // no await 
  
    
//   chain sort conditions
    const jobs = await result
  
  res.status(StatusCodes.OK).json({
      jobs, totalJobs: jobs.length,numOfPages : 1
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
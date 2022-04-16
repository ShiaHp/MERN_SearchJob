const mongoose = require('mongoose');
const User = require('./User')
const JobSchema = new mongoose.Schema({
    company :{
        type : String,
        required : [true,'Please provider company'],
        maxLength : 20,
    },
    position :{
        type : String,
        required : [true,'Please provider position'],
        maxLength : 100
    },
    status :{
        type : String,
        enum : ['interview','declined','pending'],
        default : 'pending',

    },
    jobType :{
        type : String,
        enum : ['full-time','part-time','remote','internship'],
        default : 'full-time',
    },
    jobLocation :{
        type: String,
        default : 'my city',
        required : true
    },
    createdBy :{
        type :mongoose.Types.ObjectId,
        ref : 'User',
        required : [true,'Please provide user']
    }
},
{timestamps : true})






const Job = mongoose.model('Job',JobSchema)
module.exports = Job
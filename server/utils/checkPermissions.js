const  Unauthenticated =require("../errors/index") ;

const checkPermissions = (requireUser,resourcesUserId) => {

    if(requireUser.userId === resourcesUserId.toString()) return

    throw new Unauthenticated('Not authorized to access this route ')
   
}

module.exports = checkPermissions
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
    }
}


// const asyncHandler = (fun) => async (req, res, next) => {
//     try {
//         await fun(req, res, next);
//     } catch (error) {
//         res.statur(error.code || 500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }
/* 
Steps:
const asyncHandler = (fun) => { };
const asyncHandler = (fun) => { () => { } };
const asyncHandler = (fun) => () => { };
export { asyncHandler };
*/
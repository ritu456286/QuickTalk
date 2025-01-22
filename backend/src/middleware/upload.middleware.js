import multer from "multer"
import path from 'path';

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.resolve('uploads/'));
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// })

const storage = multer.memoryStorage();
export const upload = multer({storage: storage});


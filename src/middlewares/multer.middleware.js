import multer from "multer"
import path from "path"
import crypto from "crypto"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = crypto.randomBytes(12).toString('hex') + path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

export const upload = multer({ storage })
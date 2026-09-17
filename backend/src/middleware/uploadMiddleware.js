import multer from 'multer'; import fs from 'fs'; import path from 'path';
const dir=path.resolve('uploads'); fs.mkdirSync(dir,{recursive:true});
const storage=multer.diskStorage({destination:(req,file,cb)=>cb(null,dir),filename:(req,file,cb)=>cb(null,`${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_')}`)});
export const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,/image\/(jpeg|png|webp|jpg)/.test(file.mimetype))});

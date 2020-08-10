import {Request, Response} from "express";
import {TempratureCalculator} from "../controllers/TempratureClaculator"
import * as path from "path";
import * as multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },

    filename: function (req: any, file: any, cb: any) {
        cb(null, file.originalname)
    }
});
const fileFilter = (req: any,file: any,cb: any) => {
    if(file.mimetype === "image/jpg"  ||
        file.mimetype ==="image/jpeg"  ||
        file.mimetype ===  "image/png"){

        cb(null, true);
    }else{
        cb(new Error("Image uploaded is not of type jpg/jpeg or png"),false);
    }
}
const upload = multer({storage: storage, fileFilter : fileFilter});

export class Routes {
    public tempratureCalculator: TempratureCalculator = new TempratureCalculator();

    public routes(app): void {          
        app.route('/empDetails')
        .get((req: Request, res: Response,next) => {
            res.status(200).send({
                //ejs file to fetch the last few details
                message: 'GET reque!!'
            })
        }),
        app.route('/employeeAuth')
        .post(upload.array('images',1),(req: Request, res: Response,next) => {
            //save the image

            //wastan call
            //cloudant to the get the detaisl
            //update to presit the details  *
            //python call for temp *
            //update to presit the details
            //mobile auth
            //cloudant to presit the details
            //update to presit the details
            try {
                console.log("request" +req.file)
                this.tempratureCalculator.getTemp(req.files[0].originalname);
                res.status(200).send({data:req.files[0].originalname})

            } catch (e) {
                console.log(e);
                res.sendStatus(400);
            }
            /*res.status(200).send({
                //ejs file to fetch the last few details
                message: 'GET reque!!'
            })*/
        })
    }


}
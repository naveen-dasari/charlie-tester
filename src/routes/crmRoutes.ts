import {Request, Response} from "express";

export class Routes {       
    public routes(app): void {          
        app.route('/ben')
        .get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        })               
    }
}
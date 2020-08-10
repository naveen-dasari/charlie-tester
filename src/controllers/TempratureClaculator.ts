import * as path from "path";
import {createReadStream} from "fs";
import * as FormData from 'form-data';
import { request } from 'http';

const absolutePath = path.join(__dirname,'public/uploads/');
const tempService = process.env.PY_ENDPOINT || "http://10.79.122.138:8000/"
const tempCalc = `${tempService}/api/temp`

export class TempratureCalculator {

  tempCalc = 'http://127.0.0.1:5000/api/values/files';


  public getTemp(fieldNames : String) {
    try {
      var readStream = createReadStream('./public/uploads/'+fieldNames);
     var form = new FormData();
      form.append('file', readStream);
      console.log("BIGBBBBBBBBBBBB>>>>>>>>>>>>>>>>>>>>>"+fieldNames);
      /*request. post({url: tempCalc , formData: formData}, function optionalCallback(error : Error, res : Response) {
        if (error) {
          return console.error('upload failed:', error);
        }/!*
        response.render('output', {
          msg:"The average value="+res.body.average+"and the temperature is "+res.body.temperature,
        })*!/
        console.log('Upload successful!  Server responded with:', res.body);
      });*/
     var  req = request(
          {
            host: '10.7.228.9',
            port: '8000',
            path: '/api/temp',
            method: 'POST',
            headers: form.getHeaders(),
          },
          response => {
            console.log(response.statusCode); // 200
          }
      );
      form.pipe(req);
    } catch (error) {
      console.error("error");
    }
  }
}
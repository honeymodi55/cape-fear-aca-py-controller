import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ConnectionService {
    constructor(private readonly httpService: HttpService) {}

    async welcome(connectionData: any): Promise<boolean>{
        let connection = connectionData.connection_id;
        let send_message = "http://192.168.2.192:8032/connections/" + connection +"/send-message";
        const requestConfig: AxiosRequestConfig = {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRfaWQiOiI1YWM4OTg3OS1lMzlkLTQwNTctOTE5Mi04NzQ0NDFmOTZjNTUiLCJpYXQiOjE3MTI1MDg3NTgsImV4cCI6MTcxMjU5NTE1OH0.G2yb1AzMPzweKRRYoU60s9li41brka5P1iKE09Uethk',
              'X-API-KEY': '28fc69fc5a5f425eb0c2eb5943f1723'
            },
        };
        console.log("Call REST ", send_message, " Options ", requestConfig);
        const message = await lastValueFrom(
            this.httpService.post(
                send_message, 
                {content: "Welcome to the Cape Fear College Credential Service."},
                requestConfig
            ).pipe(
                map(resp => resp.data)
            )
        );
        console.log("REST call returns ", message);
        return true;
    }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IOrder } from 'app/shared/model/order.model';

type EntityResponseType = HttpResponse<IOrder>;
type EntityArrayResponseType = HttpResponse<IOrder[]>;

@Injectable({ providedIn: 'root' })
export class OrderService {
    public resourceUrl = SERVER_API_URL + 'api/orders';

    constructor(protected http: HttpClient) {}

    create(order: IOrder): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(order);
        return this.http
            .post<IOrder>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(order: IOrder): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(order);
        return this.http
            .put<IOrder>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IOrder>(`${this.resourceUrl}/${id}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IOrder[]>(this.resourceUrl, { params: options, observe: 'response' })
            .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    protected convertDateFromClient(order: IOrder): IOrder {
        const copy: IOrder = Object.assign({}, order, {
            requestTimestamp: order.requestTimestamp != null && order.requestTimestamp.isValid() ? order.requestTimestamp.toJSON() : null,
            departureTimeLocal:
                order.departureTimeLocal != null && order.departureTimeLocal.isValid() ? order.departureTimeLocal.toJSON() : null,
            arrivalTimeLocal: order.arrivalTimeLocal != null && order.arrivalTimeLocal.isValid() ? order.arrivalTimeLocal.toJSON() : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.requestTimestamp = res.body.requestTimestamp != null ? moment(res.body.requestTimestamp) : null;
            res.body.departureTimeLocal = res.body.departureTimeLocal != null ? moment(res.body.departureTimeLocal) : null;
            res.body.arrivalTimeLocal = res.body.arrivalTimeLocal != null ? moment(res.body.arrivalTimeLocal) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((order: IOrder) => {
                order.requestTimestamp = order.requestTimestamp != null ? moment(order.requestTimestamp) : null;
                order.departureTimeLocal = order.departureTimeLocal != null ? moment(order.departureTimeLocal) : null;
                order.arrivalTimeLocal = order.arrivalTimeLocal != null ? moment(order.arrivalTimeLocal) : null;
            });
        }
        return res;
    }
}

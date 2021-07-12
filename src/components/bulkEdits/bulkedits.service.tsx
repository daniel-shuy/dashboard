import { get, post } from '../../services/api';
import { Routes } from '../../config';

export function updateBulkList(request): Promise<any> {
    let kind = request.kind.toLocaleLowerCase()
    const URL = `batch/v1beta1/${kind} `;
    return post(URL, request);
}

export function updateImpactedObjectsList(request): Promise<any> {
    let kind = request.kind.toLocaleLowerCase()
    const URL = `batch/v1beta1/${kind}/dryrun `;
    return post(URL, request) ;
}

export function getSeeExample() {
    const URL = `${Routes.BULK_UPDATE_APIVERSION}/${Routes.BULK_UPDATE_KIND}/readme`
    return get(URL)
}
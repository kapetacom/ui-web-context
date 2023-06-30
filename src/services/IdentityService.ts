import { asSingleton, simpleFetch } from '../utils';
import { clusterPath } from './ClusterConfig';
import { Identity, MemberIdentity } from '@kapeta/ui-web-types';

export interface IdentityStore {
    getCurrent(): Promise<Identity>;
    getMemberships(identityId: string): Promise<MemberIdentity[]>;
}

class IdentityServiceImpl implements IdentityStore {
    async getCurrent(): Promise<Identity> {
        return simpleFetch(clusterPath('/identities/current'));
    }

    async getMemberships(identityId: string): Promise<MemberIdentity[]> {
        return simpleFetch(clusterPath(`/identities/${identityId}/memberships`));
    }
}

export const IdentityService = asSingleton('IdentityService', new IdentityServiceImpl());

import { asSingleton } from "../utils";
import { clusterPath } from "./ClusterConfig";
import { Identity, MemberIdentity } from "@blockware/ui-web-types";

export interface IdentityStore {
  getCurrent(): Promise<Identity>;
  getMemberships(identityId: string): Promise<MemberIdentity[]>;
}

class IdentityServiceImpl implements IdentityStore {
  async getCurrent(): Promise<Identity> {
    return fetch(clusterPath("/identities/current")).then((res) => res.json());
  }

  async getMemberships(identityId: string): Promise<MemberIdentity[]> {
    return fetch(clusterPath(`/identities/${identityId}/memberships`)).then(
      (res) => res.json()
    );
  }
}

export const IdentityService = asSingleton(
  "IdentityService",
  new IdentityServiceImpl()
);

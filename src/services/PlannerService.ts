import {Asset, PLAN_KIND, PlanKind} from "@blockware/ui-web-types";

import {AssetService} from "./AssetService";

export const PlannerService = {
    async list(): Promise<Asset<PlanKind>[]> {
        const assets = await AssetService.list();
        return assets.filter((asset) => {
            return asset.exists &&
                asset.kind === PLAN_KIND;
        });
    },
    async get(ref: string): Promise<Asset<PlanKind>> {
        return AssetService.get(ref);
    }

};
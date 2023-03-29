import {parseKapetaUri} from '@kapeta/nodejs-utils';

interface SomeKind {
    kind:string
    version:string
}

class Version {
    public readonly name?: string
    public readonly major?: number
    public readonly minor?: number
    public readonly patch?: number
    public readonly semver: boolean

    constructor(version) {
        if (/^\d+\.\d+\.\d+$/.test(version)) {
            //Semantic version
            this.semver = true;
            const [major, minor, patch] = version.split(/\./g).map(num => parseInt(num));

            this.major = major;
            this.minor = minor;
            this.patch = patch;
        } else {
            this.name = version;
            this.semver = false;
        }
    }

    isBiggerThan(other:Version) {
        if (!this.semver ||
            !other.semver) {
            return false;
        }

        if (this.major > other.major) {
            return true;
        }

        if (this.minor > other.minor) {
            return true;
        }

        return this.patch > other.patch;
    }

}

export interface ParsedKind {
    name:string
    version:string
    id:string
}

export class VersionMap<T extends SomeKind> {

    private versions = new Map<string, Map<string, T>>();

    private latestVersions = new Map<string, string>();

    public parseKind(kind:string):ParsedKind {
        const uri = parseKapetaUri(kind);
        if (uri.version) {
            return {
                name: uri.fullName,
                version: uri.version,
                id: `${uri.fullName}:${uri.version}`
            };
        }

        const version = this.latestVersions.get(kind);
        return {
            name: uri.fullName,
            version,
            id: `${uri.fullName}:${version}`
        }
    }

    get(kind: string):T {
        let parsedKind = this.parseKind(kind);
        if (!this.versions.has(parsedKind.name)) {
            return null;
        }

        return this.versions.get(parsedKind.name).get(parsedKind.version);
    }

    getLatestVersion(kind:string):string {
        let parsedKind = this.parseKind(kind);
        return this.latestVersions.get(parsedKind.name);
    }

    getLatest(kind:string):T {
        let parsedKind = this.parseKind(kind);
        let version = this.latestVersions.get(parsedKind.name);
        if (!version) {
            return null;
        }
        return this.versions.get(parsedKind.name).get(version);
    }

    getVersionsFor(name:string):string[] {
        if (!this.versions.has(name)) {
            return [];
        }

        const out = Array.from(this.versions.get(name).keys());

        out.sort((a,b) => {
            if (a === b) {
                return 0;
            }

            if (new Version(a).isBiggerThan(new Version(b))) {
                return 1;
            }

            return -1;
        });

        return out;
    }

    list():T[] {
        return Array.from(this.latestVersions.entries()).map(([name, version]) =>
            this.get(`${name}:${version}`)
        );
    }

    listAll():T[] {
        return Array.from(this.versions.values())
            .flatMap((versions):T[] => Array.from(versions.values()));
    }

    kinds():string[] {
        return Array.from(this.latestVersions.entries()).map(([name, version]) =>
            `${name}:${version}`
        );
    }

    exists(kind:string):boolean {
        const parsedKind = this.parseKind(kind);
        if (!this.versions.has(parsedKind.name)) {
            return false;
        }

        return this.versions.get(parsedKind.name).has(parsedKind.version);
    }

    add(entity: T):void {
        const kind = entity.kind.toLowerCase();
        if (!this.versions.has(kind)) {
            this.versions.set(kind, new Map<string, T>());
        }

        this.versions.get(kind).set(entity.version, entity);

        if (this.latestVersions.has(kind)) {
            const latestVersion = new Version(this.latestVersions.get(kind));
            const thisVersion = new Version(entity.version);
            if (thisVersion.isBiggerThan(latestVersion)) {
                this.latestVersions.set(kind, entity.version);
            }
        } else {
            this.latestVersions.set(kind, entity.version);
        }
    }

}
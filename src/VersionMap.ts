/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

import { parseKapetaUri, parseVersion } from '@kapeta/nodejs-utils';

interface SomeKind {
    kind: string;
    version: string;
}

export interface ParsedKind {
    name: string;
    version: string;
    id: string;
}

export class VersionMap<T extends SomeKind> {
    private versions = new Map<string, Map<string, T>>();

    private latestVersions = new Map<string, string>();

    public parseKind(kind: string): ParsedKind {
        const uri = parseKapetaUri(kind);
        if (uri.version) {
            return {
                name: uri.fullName,
                version: uri.version,
                id: `${uri.fullName}:${uri.version}`,
            };
        }

        const version = this.latestVersions.get(kind);
        return {
            name: uri.fullName,
            version,
            id: `${uri.fullName}:${version}`,
        };
    }

    get(kind: string): T {
        let parsedKind = this.parseKind(kind);
        if (!this.versions.has(parsedKind.name)) {
            return null;
        }

        return this.versions.get(parsedKind.name).get(parsedKind.version);
    }

    getLatestVersion(kind: string): string {
        let parsedKind = this.parseKind(kind);
        return this.latestVersions.get(parsedKind.name);
    }

    getLatest(kind: string): T {
        let parsedKind = this.parseKind(kind);
        let version = this.latestVersions.get(parsedKind.name);
        if (!version) {
            return null;
        }
        return this.versions.get(parsedKind.name).get(version);
    }

    getVersionsFor(name: string): string[] {
        if (!this.versions.has(name)) {
            return [];
        }

        const out = Array.from(this.versions.get(name).keys());

        out.sort((a, b) => {
            return parseVersion(a).compareTo(parseVersion(b)) * -1;
        });

        return out;
    }

    list(): T[] {
        return Array.from(this.latestVersions.entries()).map(([name, version]) => this.get(`${name}:${version}`));
    }

    listAll(): T[] {
        return Array.from(this.versions.values()).flatMap((versions): T[] => Array.from(versions.values()));
    }

    kinds(): string[] {
        return Array.from(this.latestVersions.entries()).map(([name, version]) => `${name}:${version}`);
    }

    exists(kind: string): boolean {
        const parsedKind = this.parseKind(kind);
        if (!this.versions.has(parsedKind.name)) {
            return false;
        }

        return this.versions.get(parsedKind.name).has(parsedKind.version);
    }

    add(entity: T): void {
        const uri = parseKapetaUri(entity.kind);
        if (!this.versions.has(uri.fullName)) {
            this.versions.set(uri.fullName, new Map<string, T>());
        }

        this.versions.get(uri.fullName).set(entity.version, entity);

        if (this.latestVersions.has(uri.fullName)) {
            const latestVersion = parseVersion(this.latestVersions.get(uri.fullName));
            const thisVersion = parseVersion(entity.version);
            if (thisVersion.isGreaterThan(latestVersion)) {
                this.latestVersions.set(uri.fullName, entity.version);
            }
        } else {
            this.latestVersions.set(uri.fullName, entity.version);
        }
    }
}

import PackageJson from "@npmcli/package-json";

type PackageJsonOperations = {
  addDependencies?: Record<string, string>;
  removeDependencies?: string[];
  addDevDependencies?: Record<string, string>;
  addScripts?: Record<string, string>;
  removeScripts?: string[];
};

export const readPackageName = async (packageJsonPath: string) => {
  const pkgJson = await PackageJson.load(packageJsonPath);
  return pkgJson.content.name;
};

export const editPackageJson = async (
  packageJsonPath: string,
  operations?: PackageJsonOperations,
) => {
  const pkgJson = await PackageJson.load(packageJsonPath);
  const newDependencies = merge(
    pkgJson.content.dependencies as Record<string, string>,
    operations?.addDependencies,
  );
  if (newDependencies) {
    for (const toRemove of operations?.removeDependencies ?? []) {
      if (newDependencies[toRemove]) {
        delete newDependencies[toRemove];
      }
    }
  }

  const newDevDependencies = merge(
    pkgJson.content.devDependencies as Record<string, string>,
    operations?.addDevDependencies,
  );
  if (newDevDependencies) {
    for (const toRemove of operations?.removeDependencies ?? []) {
      if (newDevDependencies[toRemove]) {
        delete newDevDependencies[toRemove];
      }
    }
  }
  const newScripts = merge(
    pkgJson.content.scripts as Record<string, string>,
    operations?.addScripts as Record<string, string>,
  );
  if (newScripts) {
    for (const toRemove of operations?.removeScripts ?? []) {
      if (newScripts[toRemove]) {
        delete newScripts[toRemove];
      }
    }
  }
  pkgJson.update({
    dependencies: newDependencies as Record<string, string>,
    devDependencies: newDevDependencies as Record<string, string>,
    scripts: newScripts as Record<string, string>,
  });
  await pkgJson.save();
  return pkgJson.content;
};

export function merge<T extends Record<string, string>>(
  ...objects: (T | null | false | undefined)[]
): T {
  return objects.reduce<T>((acc, obj) => {
    if (obj && typeof obj === "object") {
      Object.assign(acc, obj);
    }
    return acc;
  }, {} as T);
}

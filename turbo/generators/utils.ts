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
  const newDependencies = pkgJson.content.dependencies
    ? { ...pkgJson.content.dependencies, ...operations?.addDependencies }
    : operations?.addDependencies;
  if (newDependencies) {
    for (const toRemove of operations?.removeDependencies ?? []) {
      if (newDependencies[toRemove]) {
        delete newDependencies[toRemove];
      }
    }
  }

  const newDevDependencies = pkgJson.content.devDependencies
    ? { ...pkgJson.content.devDependencies, ...operations?.addDevDependencies }
    : operations?.addDevDependencies;
  if (newDevDependencies) {
    for (const toRemove of operations?.removeDependencies ?? []) {
      if (newDevDependencies[toRemove]) {
        delete newDevDependencies[toRemove];
      }
    }
  }
  const newScripts = pkgJson.content.scripts
    ? { ...pkgJson.content.scripts, ...operations?.addScripts }
    : operations?.addScripts;
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

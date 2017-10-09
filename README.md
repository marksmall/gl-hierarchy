# GitLab Hierarchy Migration

This script will migrate the **Group/Project** hierarchy from one GitLab instance to another. The script makes a number of assumptions:

## Assumptions

* There is only one level to the hierarchy being migrated.
* The top-level group id to create all groups/projects under is hard-coded.

## How to run

### Edit Global Consts

Migrate one GitLab structure to another instance:

Provided you edit the Global CONST variables in file **index.js**:

* URLS
* TOKENS

You can query the structure of one GitLab instance and re-create it
on another. It creates all groups/projects the user has access to,
creating bare-bones repositories for each.

If there are projects you do not have privileges for, the script
will return an error, so it is advisable to log output e.g.

```bash
yarn test >>test.log 2>&1
```

### Run script

```bash
yarn install
yarn test
```

## Suggested service hierarchy

```text
+ organisation
  wiki
  + service 1
    wiki
    + data
      + scripts
    + code
      + apps
        application 1
  + service 2
    wiki
    + lib
    + code
      + apps
        application 1
        application 2
```

Each of the rows with a '+' symbol represent a **Group/Sub-Group** and those without represent **Projects**.


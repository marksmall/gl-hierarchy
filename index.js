'use strict';

const axios = require('axios');
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'trace';

const URLS = {
  old: 'https://gitlab.com/api/v3',
  new: 'https://beta.gitlab.com/api/v4'
}

const TOKENS = {
  old: 'Get from user account in old GitLab instance',
  new: 'Get from user account in old GitLab instance',
}

const generateHierarchy = () => {
  var config = {
    headers: { 'PRIVATE-TOKEN': TOKENS.old }
  };

  axios.get(`${URLS.old}/groups?per_page=100`, config)
  .then(response => {
    const groups = response.data;

    // for each group, get it's associated projects.
    groups.forEach(element => {
      // logger.debug('URL: ', `${URLS.old}/groups/${element.id}?per_page=100`);
      axios.get(`${URLS.old}/groups/${element.id}?per_page=100`, config)
      .then(resp => {
        const projects = resp.data.projects;
        // logger.debug('Projects for group: ', element.name, ' response: ', projects);

        // Create group.
        const groupParams = {
          name: element.name,
          path: element.path,
          parent_id: 146,
          visibility: 'private',
          lfs_enabled: false,
          request_access_enabled: false,
        };

        var newConfig = {
          headers: { 'PRIVATE-TOKEN': TOKENS.new}
        };

        // Create group structure.
        axios.post(`${URLS.new}/groups`, groupParams, newConfig)
        .then(resp => {
          const groupData = resp.data;
          logger.debug('Response from group creation: ', groupData);

          // Create projects associated with the group.
          projects.forEach(project => {
            const projectParams = {
              name: project.name,
              path: project.path,
              namespace_id: groupData.id,
              default_branch: project.default_branch,
              description: project.description,
              wiki_enabled: true,
              shared_runners_enabled: true,
              visibility: 'private',
              // import_url: project.http_url_to_repo
            };

            // Create projects in group.
            axios.post(`${URLS.new}/projects`, projectParams, newConfig)
              .then(res => {
                logger.debug(`Successfully migrated Project ${project.name}: `, res.data);
              })
              .catch(e => {
                logger.error('Error creating Project: ', e);
              });
          });
        })
        .catch(errors => {
          logger.error('Error creating Group: ', errors);
        });
      })
      .catch(err => {
        logger.error(`Error getting Projects for group ${element.name}: `, err);
      });

    }, this);
  })
  .catch(error => {
    logger.error(`Error getting groups for ${URLS.old}: `, error);
  });
};

// Generate the GitLab Group/Project Hierarchy.
generateHierarchy();

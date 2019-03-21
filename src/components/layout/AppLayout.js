import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { TitleBar } from 'electron-react-titlebar';
import injectSheet from 'react-jss';

import InfoBar from '../ui/InfoBar';
import { Component as DelayApp } from '../../features/delayApp';
import { Component as BasicAuth } from '../../features/basicAuth';
import { Component as ShareFranz } from '../../features/shareFranz';
import ErrorBoundary from '../util/ErrorBoundary';

// import globalMessages from '../../i18n/globalMessages';

import { isWindows } from '../../environment';
import { workspacesState } from '../../features/workspaces/state';
import FullscreenLoader from '../ui/FullscreenLoader';
import WorkspaceSwitchingIndicator from '../../features/workspaces/components/WorkspaceSwitchingIndicator';

function createMarkup(HTMLString) {
  return { __html: HTMLString };
}

const messages = defineMessages({
  servicesUpdated: {
    id: 'infobar.servicesUpdated',
    defaultMessage: '!!!Your services have been updated.',
  },
  updateAvailable: {
    id: 'infobar.updateAvailable',
    defaultMessage: '!!!A new update for Franz is available.',
  },
  buttonReloadServices: {
    id: 'infobar.buttonReloadServices',
    defaultMessage: '!!!Reload services',
  },
  changelog: {
    id: 'infobar.buttonChangelog',
    defaultMessage: '!!!Changelog',
  },
  buttonInstallUpdate: {
    id: 'infobar.buttonInstallUpdate',
    defaultMessage: '!!!Restart & install update',
  },
  requiredRequestsFailed: {
    id: 'infobar.requiredRequestsFailed',
    defaultMessage: '!!!Could not load services and user information',
  },
});

const styles = theme => ({
  appContent: {
    width: `calc(100% + ${theme.workspaceDrawerWidth})`,
    transition: 'transform 0.5s ease',
    transform() {
      return workspacesState.isWorkspaceDrawerOpen ? 'translateX(0)' : 'translateX(-220px)';
    },
  },
});

@injectSheet(styles) @observer
class AppLayout extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    sidebar: PropTypes.element.isRequired,
    workspacesDrawer: PropTypes.element.isRequired,
    services: PropTypes.element.isRequired,
    children: PropTypes.element,
    news: MobxPropTypes.arrayOrObservableArray.isRequired,
    // isOnline: PropTypes.bool.isRequired,
    showServicesUpdatedInfoBar: PropTypes.bool.isRequired,
    appUpdateIsDownloaded: PropTypes.bool.isRequired,
    removeNewsItem: PropTypes.func.isRequired,
    reloadServicesAfterUpdate: PropTypes.func.isRequired,
    installAppUpdate: PropTypes.func.isRequired,
    showRequiredRequestsError: PropTypes.bool.isRequired,
    areRequiredRequestsSuccessful: PropTypes.bool.isRequired,
    retryRequiredRequests: PropTypes.func.isRequired,
    areRequiredRequestsLoading: PropTypes.bool.isRequired,
    darkMode: PropTypes.bool.isRequired,
    isDelayAppScreenVisible: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    children: [],
  };

  static contextTypes = {
    intl: intlShape,
  };

  render() {
    const {
      classes,
      isFullScreen,
      workspacesDrawer,
      sidebar,
      services,
      children,
      // isOnline,
      news,
      showServicesUpdatedInfoBar,
      appUpdateIsDownloaded,
      removeNewsItem,
      reloadServicesAfterUpdate,
      installAppUpdate,
      showRequiredRequestsError,
      areRequiredRequestsSuccessful,
      retryRequiredRequests,
      areRequiredRequestsLoading,
      darkMode,
      isDelayAppScreenVisible,
    } = this.props;

    const { intl } = this.context;

    return (
      <ErrorBoundary>
        <div className={(darkMode ? 'theme__dark' : '')}>
          <div className="app">
            {isWindows && !isFullScreen && <TitleBar menu={window.franz.menu.template} icon="assets/images/logo.svg" />}
            <div className={`app__content ${classes.appContent}`}>
              {workspacesDrawer}
              {sidebar}
              <div className="app__service">
                <WorkspaceSwitchingIndicator />
                {news.length > 0 && news.map(item => (
                  <InfoBar
                    key={item.id}
                    position="top"
                    type={item.type}
                    sticky={item.sticky}
                    onHide={() => removeNewsItem({ newsId: item.id })}
                  >
                    <span dangerouslySetInnerHTML={createMarkup(item.message)} />
                  </InfoBar>
                ))}
                {/* {!isOnline && (
                  <InfoBar
                    type="danger"
                    sticky
                  >
                    <span className="mdi mdi-flash" />
                    {intl.formatMessage(globalMessages.notConnectedToTheInternet)}
                  </InfoBar>
                )} */}
                {!areRequiredRequestsSuccessful && showRequiredRequestsError && (
                  <InfoBar
                    type="danger"
                    ctaLabel="Try again"
                    ctaLoading={areRequiredRequestsLoading}
                    sticky
                    onClick={retryRequiredRequests}
                  >
                    <span className="mdi mdi-flash" />
                    {intl.formatMessage(messages.requiredRequestsFailed)}
                  </InfoBar>
                )}
                {showServicesUpdatedInfoBar && (
                  <InfoBar
                    type="primary"
                    ctaLabel={intl.formatMessage(messages.buttonReloadServices)}
                    onClick={reloadServicesAfterUpdate}
                    sticky
                  >
                    <span className="mdi mdi-power-plug" />
                    {intl.formatMessage(messages.servicesUpdated)}
                  </InfoBar>
                )}
                {appUpdateIsDownloaded && (
                  <InfoBar
                    type="primary"
                    ctaLabel={intl.formatMessage(messages.buttonInstallUpdate)}
                    onClick={installAppUpdate}
                    sticky
                  >
                    <span className="mdi mdi-information" />
                    {intl.formatMessage(messages.updateAvailable)}
                    {' '}
                    <a href="https://meetfranz.com/changelog" target="_blank">
                      <u>{intl.formatMessage(messages.changelog)}</u>
                    </a>
                  </InfoBar>
                )}
                {isDelayAppScreenVisible && (<DelayApp />)}
                <BasicAuth />
                <ShareFranz />
                {services}
              </div>
            </div>
          </div>
          {children}
        </div>
      </ErrorBoundary>
    );
  }
}

export default AppLayout;

import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import FeedSourceViewer from '../components/FeedSourceViewer'

import {
  fetchFeedSourceAndProject,
  updateFeedSource,
  runFetchFeed,
  fetchFeedVersions,
  uploadFeed,
  fetchPublicFeedSource,
  receiveFeedVersions,
  fetchPublicFeedVersions,
  updateExternalFeedResource,
  deleteFeedVersion,
  fetchValidationResult,
  downloadFeedViaToken,
  fetchNotesForFeedSource,
  postNoteForFeedSource,
  fetchNotesForFeedVersion,
  postNoteForFeedVersion
} from '../actions/feeds'

import { updateTargetForSubscription } from '../../manager/actions/user'

import { downloadGtfsPlusFeed } from '../../gtfsplus/actions/gtfsplus'

const mapStateToProps = (state, ownProps) => {
  let feedSourceId = ownProps.routeParams.feedSourceId
  let user = state.user
  // find the containing project
  console.log(ownProps.routeParams)
  let project = state.projects.all
    ? state.projects.all.find(p => {
        if (!p.feedSources) return false
        return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
      })
    : null

  let feedSource
  if (project) {
    feedSource = project.feedSources.find(fs => fs.id === feedSourceId)
  }
  let feedVersionIndex
  let routeVersionIndex = +ownProps.routeParams.feedVersionIndex
  let hasVersionIndex = typeof ownProps.routeParams.feedVersionIndex !== 'undefined'
  if (feedSource) {
    if ((hasVersionIndex && isNaN(routeVersionIndex)) || routeVersionIndex >= feedSource.feedVersionCount || routeVersionIndex < 0) {
      console.log('version invalid')
      // cannot use browserHistory.push in middle of state transition
      // browserHistory.push(`/feed/${feedSourceId}`)
      window.location.href = `/feed/${feedSourceId}`
    }
    else {
      feedVersionIndex = hasVersionIndex
        ? routeVersionIndex
        : feedSource.feedVersionCount
        ? feedSource.feedVersionCount - 1
        : 0
    }
  }
  console.log(feedVersionIndex)
  return {
    feedSource,
    feedVersionIndex,
    project,
    user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  return {
    onComponentMount: (initialProps) => {
      let unsecured = true
      if (initialProps.user.profile !== null) {
        unsecured = false
      }
      if (!initialProps.project) {
        dispatch(fetchFeedSourceAndProject(feedSourceId, unsecured))
        .then((feedSource) => {
          console.log(feedSource)
          return dispatch(fetchFeedVersions(feedSource, unsecured))
        })
      }
      else if(!initialProps.feedSource) {
        dispatch(fetchFeedSource(feedSourceId, unsecured))
        .then((feedSource) => {
          return dispatch(fetchFeedVersions(feedSource, unsecured))
        })
      }
      else if(!initialProps.feedSource.versions) {
        dispatch(fetchFeedVersions(initialProps.feedSource, unsecured))
      }
    },
    feedSourcePropertyChanged: (feedSource, propName, newValue) => {
      dispatch(updateFeedSource(feedSource, { [propName] : newValue }))
    },
    externalPropertyChanged: (feedSource, resourceType, propName, newValue) => {
      dispatch(updateExternalFeedResource(feedSource, resourceType, { [propName]: newValue } ))
    },
    updateFeedClicked: (feedSource) => { dispatch(runFetchFeed(feedSource)) },
    uploadFeedClicked: (feedSource, file) => { dispatch(uploadFeed(feedSource, file)) },
    updateUserSubscription: (profile, target, subscriptionType) => { dispatch(updateTargetForSubscription(profile, target, subscriptionType)) },
    downloadFeedClicked: (feedVersion) => { dispatch(downloadFeedViaToken(feedVersion)) },
    deleteFeedVersionConfirmed: (feedSource, feedVersion) => {
      dispatch(deleteFeedVersion(feedSource, feedVersion))
    },
    validationResultRequested: (feedSource, feedVersion) => {
      dispatch(fetchValidationResult(feedSource, feedVersion))
    },
    notesRequestedForFeedSource: (feedSource) => {
      dispatch(fetchNotesForFeedSource(feedSource))
    },
    newNotePostedForFeedSource: (feedSource, note) => {
      dispatch(postNoteForFeedSource(feedSource, note))
    },
    notesRequestedForVersion: (feedVersion) => {
      dispatch(fetchNotesForFeedVersion(feedVersion))
    },
    newNotePostedForVersion: (version, note) => {
      dispatch(postNoteForFeedVersion(version, note))
    },
    gtfsPlusDataRequested: () => {
      dispatch(downloadGtfsPlusFeed(version.id))
    }
  }
}

const ActiveFeedSourceViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedSourceViewer)

export default ActiveFeedSourceViewer

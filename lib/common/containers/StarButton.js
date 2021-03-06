import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'
import { Button } from 'react-bootstrap'
import { updateStar } from '../../manager/actions/user'
import { connect } from 'react-redux'

import { getComponentMessages, getMessage } from '../util/config'

class StarButton extends React.Component {
  render () {
    const {dispatch, isStarred, user, target} = this.props
    const messages = getComponentMessages('StarButton')

    return (
      <Button onClick={() => {
        dispatch(updateStar(user.profile, target, !isStarred))
      }}>
        {isStarred
          ? <span><Icon type='star-o' /> {getMessage(messages, 'unstar')}</span>
          : <span><Icon type='star' /> {getMessage(messages, 'star')}</span>
        }
      </Button>
    )
  }
}

export default connect()(StarButton)
